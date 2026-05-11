import { Router } from 'express'
import { authMiddleware, roleMiddleware } from '../middleware/auth.js'
import { Ruta, AsignacionRuta, Chofer, Omnibus } from '../models/index.js'
import { Op } from 'sequelize'
import logger from '../utils/logger.js'
import { isValidUUID } from '../utils/validators.js'

const router = Router()

// GET /api/asignaciones?fecha=YYYY-MM-DD
router.get('/', authMiddleware, async (req, res) => {
  try {
    let { fecha } = req.query
    if (!fecha) {
      fecha = new Date().toISOString().split('T')[0]
    }

    const asignaciones = await AsignacionRuta.findAll({
      where: { fecha },
      include: [
        { model: Ruta, as: 'ruta', attributes: ['id', 'nombre', 'origen', 'destino'] },
        { model: Chofer, as: 'chofer', attributes: ['id', 'nombre', 'cedula'] },
        { model: Omnibus, as: 'omnibus', attributes: ['id', 'placa', 'marca'] }
      ],
      order: [['hora', 'ASC'], ['ruta', 'nombre', 'ASC']]
    })

    res.json(asignaciones)
  } catch (error) {
    logger.error('Error in GET /asignaciones:', error.message)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

// POST /api/asignaciones - Crear/actualizar asignaciones para una fecha
router.post('/', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  try {
    const { fecha, asignaciones } = req.body

    if (!fecha || !asignaciones || !Array.isArray(asignaciones)) {
      return res.status(400).json({ error: 'Fecha y asignaciones son requeridos' })
    }

    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    const maxFecha = new Date()
    maxFecha.setDate(hoy.getDate() + 2)
    maxFecha.setHours(23, 59, 59, 999)
    const fechaDate = new Date(fecha)
    const diaSemana = fechaDate.getDay()

    if (fechaDate < hoy || fechaDate > maxFecha) {
      return res.status(400).json({ error: 'La fecha debe ser hoy o maximo 2 dias en el futuro' })
    }

    if (diaSemana === 0 || diaSemana === 6) {
      return res.status(400).json({ error: 'No se pueden hacer asignaciones en fines de semana' })
    }

    const resultados = []
    const conflictos = []

    for (const asig of asignaciones) {
      const { ruta_id, chofer_id, omnibus_id, hora, estado, observacion } = asig

      if (!ruta_id || !hora) {
        continue
      }

      const isCancelada = estado === 'cancelada' || (!chofer_id && !omnibus_id)

      if (chofer_id && omnibus_id && !isCancelada) {
        const horaSlot = hora.startsWith('06') ? 'manana' : 'tarde'
        const whereClause = {
          fecha,
          hora: hora
        }
        if (isValidUUID(asig.id)) {
          whereClause.id = { [Op.ne]: asig.id }
        }
        const existingAsigs = await AsignacionRuta.findAll({ where: whereClause })

        for (const exist of existingAsigs) {
          const existSlot = exist.hora?.startsWith('06') ? 'manana' : 'tarde'
          if (existSlot !== horaSlot) continue

          if (exist.chofer_id && exist.chofer_id === chofer_id) {
            conflictos.push(`Chofer ya asignado a otra ruta en ${hora}`)
          }
          if (exist.omnibus_id && exist.omnibus_id === omnibus_id) {
            conflictos.push(`Ómnibus ya asignado a otra ruta en ${hora}`)
          }
        }
      }

      const [asignacion, created] = await AsignacionRuta.findOrCreate({
        where: { ruta_id, fecha, hora },
        defaults: {
          chofer_id: chofer_id || null,
          omnibus_id: omnibus_id || null,
          estado: isCancelada ? 'cancelada' : (estado || (chofer_id && omnibus_id ? 'garantizada' : 'pendiente')),
          observacion: observacion || null
        }
      })

      if (!created) {
        await asignacion.update({
          chofer_id: chofer_id || null,
          omnibus_id: omnibus_id || null,
          estado: isCancelada ? 'cancelada' : (estado || (chofer_id && omnibus_id ? 'garantizada' : 'pendiente')),
          observacion: observacion || null
        })
      }

      resultados.push(asignacion)
    }

    if (conflictos.length > 0) {
      return res.status(409).json({
        warning: 'Conflicto de asignacion detectado',
        conflictos,
        asignaciones: resultados
      })
    }

    res.status(201).json({ message: 'Asignaciones guardadas', asignaciones: resultados })
  } catch (error) {
    logger.error('Error in POST /asignaciones:', error.message, error.stack)
    res.status(500).json({ error: error.message || 'Error interno del servidor' })
  }
})

// GET /api/asignaciones/historial - Historial con filtros
router.get('/historial', authMiddleware, async (req, res) => {
  try {
    const { fecha, mes, chofer_id, omnibus_id } = req.query
    const where = {}

    if (fecha) {
      where.fecha = fecha
    } else if (mes) {
      const [anio, mesNum] = mes.split('-')
      const fechaInicio = `${anio}-${mesNum}-01`
      const fechaFin = new Date(anio, mesNum, 0).toISOString().split('T')[0]
      where.fecha = { [Op.between]: [fechaInicio, fechaFin] }
    }

    if (chofer_id) {
      where.chofer_id = chofer_id
    }

    if (omnibus_id) {
      where.omnibus_id = omnibus_id
    }

    const asignaciones = await AsignacionRuta.findAll({
      where,
      include: [
        { model: Ruta, as: 'ruta', attributes: ['id', 'nombre', 'origen', 'destino'] },
        { model: Chofer, as: 'chofer', attributes: ['id', 'nombre', 'cedula'] },
        { model: Omnibus, as: 'omnibus', attributes: ['id', 'placa', 'marca'] }
      ],
      order: [['fecha', 'DESC'], ['hora', 'ASC']]
    })

    const historial = [
        ...asignaciones.filter(a => a.estado !== 'cancelada').map(a => ({
          fecha: a.fecha,
          ruta: a.ruta?.nombre,
          origen: a.ruta?.origen,
          destino: a.ruta?.destino,
          hora: a.hora,
          chofer: a.chofer?.nombre,
          omnibus: a.omnibus?.placa
        })),
        ...asignaciones.filter(a => a.estado === 'cancelada').map(a => ({
          fecha: a.fecha,
          ruta: a.ruta?.nombre,
          origen: a.ruta?.origen,
          destino: a.ruta?.destino,
          hora: a.hora,
          chofer: a.chofer?.nombre,
          omnibus: a.omnibus?.placa
        }))
      ]

    res.json({ historial })
  } catch (error) {
    logger.error('Error in GET /asignaciones/historial:', error.message)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

// DELETE /api/asignaciones/:id
router.delete('/:id', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  try {
    const { id } = req.params
    const asignacion = await AsignacionRuta.findByPk(id)

    if (!asignacion) {
      return res.status(404).json({ error: 'Asignación no encontrada' })
    }

    await asignacion.destroy()
    res.status(204).send()
  } catch (error) {
    logger.error('Error in DELETE /asignaciones/:id:', error.message)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

export default router