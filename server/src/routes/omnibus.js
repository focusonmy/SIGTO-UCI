import { Router } from 'express'
import { authMiddleware, roleMiddleware } from '../middleware/auth.js'
import { Omnibus } from '../models/index.js'
import { isValidUUID, sanitizeString } from '../utils/validators.js'
import { Op } from 'sequelize'
import logger from '../utils/logger.js'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const omnibus = await Omnibus.findAll({
      where: { activo: true },
      order: [['placa', 'ASC']]
    })
    res.json(omnibus)
  } catch (error) {
    logger.error('Error in GET /omnibus:', error.message)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    if (!id || !isValidUUID(id)) {
      return res.status(400).json({ error: 'ID inválido' })
    }
    
    const omnibus = await Omnibus.findByPk(id)
    if (!omnibus) {
      return res.status(404).json({ error: 'Ómnibus no encontrado' })
    }
    res.json(omnibus)
  } catch (error) {
    logger.error('Error in GET /omnibus/:id:', error.message)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

router.get('/disponibles', async (req, res) => {
  try {
    const omnibus = await Omnibus.findAll({
      where: { activo: true, estado: 'disponible' },
      order: [['placa', 'ASC']]
    })
    res.json(omnibus)
  } catch (error) {
    logger.error('Error in GET /omnibus/disponibles:', error.message)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

router.post('/', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  try {
    const { placa, marca, modelo, anio, capacidad, tipo, seguro, fecha_venc_seguro, estado } = req.body

    if (!placa) {
      return res.status(400).json({ error: 'Placa es requerida' })
    }

    if (fecha_venc_seguro) {
      const fechaVenc = new Date(fecha_venc_seguro)
      const hoy = new Date()
      hoy.setHours(0, 0, 0, 0)
      if (fechaVenc < hoy) {
        return res.status(400).json({ error: 'La fecha de vencimiento del seguro no puede ser anterior a hoy' })
      }
    }

    const placaSanitizada = sanitizeString(placa, 20)
    const seguroSanitizado = seguro ? sanitizeString(seguro, 100) : null

    const [existePlaca, existeSeguro] = await Promise.all([
      Omnibus.findOne({ where: { placa: placaSanitizada } }),
      seguroSanitizado ? Omnibus.findOne({ where: { seguro: seguroSanitizado } }) : null
    ])

    if (existePlaca) {
      return res.status(400).json({ error: 'Ya existe un ómnibus con esta placa' })
    }
    if (existeSeguro) {
      return res.status(400).json({ error: 'Ya existe un ómnibus con este número de seguro' })
    }

    const omnibus = await Omnibus.create({
      placa: placaSanitizada,
      marca: marca ? sanitizeString(marca, 50) : null,
      modelo: modelo ? sanitizeString(modelo, 50) : null,
      anio: anio ? Math.min(Math.max(anio, 1900), new Date().getFullYear() + 1) : null,
      capacidad: capacidad ? Math.min(Math.max(capacidad, 1), 100) : 40,
      tipo: tipo && ['estandar', 'articulado'].includes(tipo) ? tipo : 'estandar',
      seguro: seguroSanitizado,
      fecha_venc_seguro: fecha_venc_seguro ? new Date(fecha_venc_seguro) : null,
      estado: estado || 'disponible'
    })

    res.status(201).json(omnibus)
  } catch (error) {
    logger.error('Error in POST /omnibus:', error.message)
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Ya existe un ómnibus con esta placa' })
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
    
    const omnibus = await Omnibus.findByPk(id)
    if (!omnibus) {
      return res.status(404).json({ error: 'Ómnibus no encontrado' })
    }

    const { placa, marca, modelo, anio, capacidad, tipo, seguro, fecha_venc_seguro, estado, activo } = req.body

    if (fecha_venc_seguro) {
      const fechaVenc = new Date(fecha_venc_seguro)
      const hoy = new Date()
      hoy.setHours(0, 0, 0, 0)
      if (fechaVenc < hoy) {
        return res.status(400).json({ error: 'La fecha de vencimiento del seguro no puede ser anterior a hoy' })
      }
    }

    if (placa) {
      const placaSanitizada = sanitizeString(placa, 20)
      const existePlaca = await Omnibus.findOne({
        where: { placa: placaSanitizada, id: { [Op.ne]: id } }
      })
      if (existePlaca) {
        return res.status(400).json({ error: 'Ya existe otro ómnibus con esta placa' })
      }
    }

    if (seguro) {
      const seguroSanitizado = sanitizeString(seguro, 100)
      const existeSeguro = await Omnibus.findOne({
        where: { seguro: seguroSanitizado, id: { [Op.ne]: id } }
      })
      if (existeSeguro) {
        return res.status(400).json({ error: 'Ya existe otro ómnibus con este número de seguro' })
      }
    }

    await omnibus.update({
      placa: placa ? sanitizeString(placa, 20) : omnibus.placa,
      marca: marca ? sanitizeString(marca, 50) : omnibus.marca,
      modelo: modelo ? sanitizeString(modelo, 50) : omnibus.modelo,
      anio: anio ? Math.min(Math.max(anio, 1900), new Date().getFullYear() + 1) : omnibus.anio,
      capacidad: capacidad ? Math.min(Math.max(capacidad, 1), 100) : omnibus.capacidad,
      tipo: tipo && ['estandar', 'articulado'].includes(tipo) ? tipo : omnibus.tipo,
      seguro: seguro ? sanitizeString(seguro, 100) : omnibus.seguro,
      fecha_venc_seguro: fecha_venc_seguro ? new Date(fecha_venc_seguro) : omnibus.fecha_venc_seguro,
      estado: estado || omnibus.estado,
      activo: activo !== undefined ? activo : omnibus.activo
    })

    res.json(omnibus)
  } catch (error) {
    logger.error('Error in PUT /omnibus/:id:', error.message)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

router.delete('/:id', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  try {
    const { id } = req.params
    if (!id || !isValidUUID(id)) {
      return res.status(400).json({ error: 'ID inválido' })
    }

    const omnibus = await Omnibus.findByPk(id)
    if (!omnibus) {
      return res.status(404).json({ error: 'Ómnibus no encontrado' })
    }

    await omnibus.update({ activo: false })
    res.status(204).send()
  } catch (error) {
    logger.error('Error in DELETE /omnibus/:id:', error.message)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

export default router