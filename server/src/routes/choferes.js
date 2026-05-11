import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { authMiddleware, roleMiddleware } from '../middleware/auth.js'
import { Chofer, Usuario, sequelize } from '../models/index.js'
import { isValidUUID, sanitizeString } from '../utils/validators.js'
import { Op } from 'sequelize'
import logger from '../utils/logger.js'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const choferes = await Chofer.findAll({
      where: { activo: true },
      include: [{ model: Usuario, as: 'usuario' }],
      order: [['nombre', 'ASC']]
    })
    res.json(choferes)
  } catch (error) {
    logger.error('Error in GET /choferes:', error.message)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    if (!id || !isValidUUID(id)) {
      return res.status(400).json({ error: 'ID inválido' })
    }
    
    const chofer = await Chofer.findByPk(id, {
      include: [{ model: Usuario, as: 'usuario' }]
    })
    if (!chofer) {
      return res.status(404).json({ error: 'Chofer no encontrado' })
    }
    res.json(chofer)
  } catch (error) {
    logger.error('Error in GET /choferes/:id:', error.message)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

router.post('/', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  try {
    const { cedula, nombre, telefono, licencia, fecha_venc_licencia, observacion, username, password } = req.body

    if (!cedula || !nombre) {
      return res.status(400).json({ error: 'Cédula y nombre son requeridos' })
    }

    if (!username || username.trim().length < 3) {
      return res.status(400).json({ error: 'El nombre de usuario debe tener al menos 3 caracteres' })
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) {
      return res.status(400).json({ error: 'El nombre de usuario solo puede contener letras, números y guiones bajos' })
    }

    if (!password || password.length < 8) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' })
    }
    if (!/[A-Z]/.test(password)) {
      return res.status(400).json({ error: 'La contraseña debe contener al menos una mayúscula' })
    }
    if (!/[a-z]/.test(password)) {
      return res.status(400).json({ error: 'La contraseña debe contener al menos una minúscula' })
    }
    if (!/[0-9]/.test(password)) {
      return res.status(400).json({ error: 'La contraseña debe contener al menos un número' })
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      return res.status(400).json({ error: 'La contraseña debe contener al menos un carácter especial' })
    }

    const usernameSanitizado = username.trim().toLowerCase()
    const existeUsername = await Usuario.findOne({ where: { username: usernameSanitizado } })
    if (existeUsername) {
      return res.status(400).json({ error: 'El nombre de usuario ya existe' })
    }

    const cedulaSanitizada = sanitizeString(cedula, 20)
    const telefonoSanitizado = telefono ? sanitizeString(telefono, 20) : null
    const licenciaSanitizada = licencia ? sanitizeString(licencia, 50) : null

    if (fecha_venc_licencia) {
      const fechaVenc = new Date(fecha_venc_licencia)
      const hoy = new Date()
      hoy.setHours(0, 0, 0, 0)
      if (fechaVenc < hoy) {
        return res.status(400).json({ error: 'La fecha de vencimiento de licencia no puede ser anterior a hoy' })
      }
    }

    const [existeCedula, existeTelefono, existeLicencia] = await Promise.all([
      Chofer.findOne({ where: { cedula: cedulaSanitizada } }),
      telefonoSanitizado ? Chofer.findOne({ where: { telefono: telefonoSanitizado } }) : null,
      licenciaSanitizada ? Chofer.findOne({ where: { licencia: licenciaSanitizada } }) : null
    ])

    if (existeCedula) {
      return res.status(400).json({ error: 'Ya existe un chofer con esta cédula' })
    }
    if (existeTelefono) {
      return res.status(400).json({ error: 'Ya existe un chofer con este teléfono' })
    }
    if (existeLicencia) {
      return res.status(400).json({ error: 'Ya existe un chofer con esta licencia' })
    }

    const transaction = await sequelize.transaction()

    try {
      const passwordHash = await bcrypt.hash(password, 10)

      const usuario = await Usuario.create({
        username: usernameSanitizado,
        password_hash: passwordHash,
        rol: 'conductor',
        nombre: sanitizeString(nombre, 100)
      }, { transaction })

      const chofer = await Chofer.create({
        cedula: cedulaSanitizada,
        nombre: sanitizeString(nombre, 100),
        telefono: telefonoSanitizado,
        licencia: licenciaSanitizada,
        fecha_venc_licencia: fecha_venc_licencia ? new Date(fecha_venc_licencia) : null,
        observacion: observacion ? sanitizeString(observacion, 500) : null,
        usuario_id: usuario.id
      }, { transaction })

      await transaction.commit()

      const choferCreado = await Chofer.findByPk(chofer.id, {
        include: [{ model: Usuario, as: 'usuario' }]
      })

      res.status(201).json(choferCreado)
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  } catch (error) {
    logger.error('Error in POST /choferes:', error.message)
    if (error.name === 'SequelizeUniqueConstraintError') {
      if (error.errors?.[0]?.path === 'username') {
        return res.status(400).json({ error: 'El nombre de usuario ya existe' })
      }
      return res.status(400).json({ error: 'Ya existe un chofer con esta cédula' })
    }
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

router.put('/:id', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  try {
    const { id } = req.params
    if (!id || !isValidUUID(id)) {
      return res.status(400).json({ error: 'ID inválido' })
    }
    
    const chofer = await Chofer.findByPk(id, {
      include: [{ model: Usuario, as: 'usuario' }]
    })
    if (!chofer) {
      return res.status(404).json({ error: 'Chofer no encontrado' })
    }

    const { cedula, nombre, telefono, licencia, fecha_venc_licencia, observacion, activo, username, password } = req.body

    if (fecha_venc_licencia) {
      const fechaVenc = new Date(fecha_venc_licencia)
      const hoy = new Date()
      hoy.setHours(0, 0, 0, 0)
      if (fechaVenc < hoy) {
        return res.status(400).json({ error: 'La fecha de vencimiento de licencia no puede ser anterior a hoy' })
      }
    }

    if (username !== undefined) {
      if (username.trim().length < 3) {
        return res.status(400).json({ error: 'El nombre de usuario debe tener al menos 3 caracteres' })
      }
      if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) {
        return res.status(400).json({ error: 'El nombre de usuario solo puede contener letras, números y guiones bajos' })
      }
      const usernameSanitizado = username.trim().toLowerCase()
      if (chofer.usuario && chofer.usuario.username !== usernameSanitizado) {
        const existeUsername = await Usuario.findOne({
          where: { username: usernameSanitizado, id: { [Op.ne]: chofer.usuario.id } }
        })
        if (existeUsername) {
          return res.status(400).json({ error: 'El nombre de usuario ya existe' })
        }
      }
    }

    if (password !== undefined && password !== '') {
      if (password.length < 8) {
        return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' })
      }
      if (!/[A-Z]/.test(password)) {
        return res.status(400).json({ error: 'La contraseña debe contener al menos una mayúscula' })
      }
      if (!/[a-z]/.test(password)) {
        return res.status(400).json({ error: 'La contraseña debe contener al menos una minúscula' })
      }
      if (!/[0-9]/.test(password)) {
        return res.status(400).json({ error: 'La contraseña debe contener al menos un número' })
      }
      if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        return res.status(400).json({ error: 'La contraseña debe contener al menos un carácter especial' })
      }
    }

    if (cedula) {
      const cedulaSanitizada = sanitizeString(cedula, 20)
      const existeCedula = await Chofer.findOne({
        where: { cedula: cedulaSanitizada, id: { [Op.ne]: id } }
      })
      if (existeCedula) {
        return res.status(400).json({ error: 'Ya existe otro chofer con esta cédula' })
      }
    }

    if (telefono) {
      const telefonoSanitizado = sanitizeString(telefono, 20)
      const existeTelefono = await Chofer.findOne({
        where: { telefono: telefonoSanitizado, id: { [Op.ne]: id } }
      })
      if (existeTelefono) {
        return res.status(400).json({ error: 'Ya existe otro chofer con este teléfono' })
      }
    }

    if (licencia) {
      const licenciaSanitizada = sanitizeString(licencia, 50)
      const existeLicencia = await Chofer.findOne({
        where: { licencia: licenciaSanitizada, id: { [Op.ne]: id } }
      })
      if (existeLicencia) {
        return res.status(400).json({ error: 'Ya existe otro chofer con esta licencia' })
      }
    }

    const transaction = await sequelize.transaction()

    try {
      await chofer.update({
        cedula: cedula ? sanitizeString(cedula, 20) : chofer.cedula,
        nombre: nombre ? sanitizeString(nombre, 100) : chofer.nombre,
        telefono: telefono ? sanitizeString(telefono, 20) : chofer.telefono,
        licencia: licencia ? sanitizeString(licencia, 50) : chofer.licencia,
        fecha_venc_licencia: fecha_venc_licencia ? new Date(fecha_venc_licencia) : chofer.fecha_venc_licencia,
        observacion: observacion ? sanitizeString(observacion, 500) : chofer.observacion,
        activo: activo !== undefined ? activo : chofer.activo
      }, { transaction })

      if (chofer.usuario) {
        const updatesUsuario = {}
        if (username !== undefined) {
          updatesUsuario.username = username.trim().toLowerCase()
        }
        if (nombre) {
          updatesUsuario.nombre = sanitizeString(nombre, 100)
        }
        if (password !== undefined && password !== '') {
          updatesUsuario.password_hash = await bcrypt.hash(password, 10)
        }
        if (Object.keys(updatesUsuario).length > 0) {
          await chofer.usuario.update(updatesUsuario, { transaction })
        }
      }

      await transaction.commit()

      const choferActualizado = await Chofer.findByPk(id, {
        include: [{ model: Usuario, as: 'usuario' }]
      })
      res.json(choferActualizado)
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  } catch (error) {
    logger.error('Error in PUT /choferes/:id:', error.message)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

router.delete('/:id', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  try {
    const { id } = req.params
    if (!id || !isValidUUID(id)) {
      return res.status(400).json({ error: 'ID inválido' })
    }
    
    const chofer = await Chofer.findByPk(id)
    if (!chofer) {
      return res.status(404).json({ error: 'Chofer no encontrado' })
    }
    
    const transaction = await sequelize.transaction()

    try {
      if (chofer.usuario_id) {
        await Usuario.destroy({
          where: { id: chofer.usuario_id },
          transaction
        })
      }

      await chofer.destroy({ transaction })
      await transaction.commit()

      res.status(204).send()
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  } catch (error) {
    logger.error('Error in DELETE /choferes/:id:', error.message)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

export default router