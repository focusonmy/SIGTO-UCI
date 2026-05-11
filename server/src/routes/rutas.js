import { Router } from 'express'
import { authMiddleware, roleMiddleware } from '../middleware/auth.js'
import { Ruta, Chofer, Omnibus, AsignacionRuta } from '../models/index.js'
import { isValidUUID, sanitizeString } from '../utils/validators.js'
import logger from '../utils/logger.js'

const router = Router()

function formatearFechaDisplay(dateStr) {
  const d = new Date(dateStr)
  const dia = String(d.getDate()).padStart(2, '0')
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  const anio = d.getFullYear()
  return `${dia}/${mes}/${anio}`
}

function getFechaPorHora() {
  const ahora = new Date()
  const hora = ahora.getHours()
  const min = ahora.getMinutes()
  const enTarde = hora > 17 || (hora === 17 && min >= 15)
  const fecha = new Date()
  if (enTarde) fecha.setDate(fecha.getDate() + 1)
  const fechaStr = fecha.toISOString().split('T')[0]
  return {
    fecha: fechaStr,
    tipo: enTarde ? 'manana' : 'hoy',
    label: enTarde
      ? `Rutas para mañana ${formatearFechaDisplay(fechaStr)}`
      : `Rutas para hoy ${formatearFechaDisplay(fechaStr)}`
  }
}

function getHorarioLabel(hora) {
  if (!hora) return ''
  const h = hora.substring(0, 5)
  if (h === '06:45') return 'Mañana (06:45)'
  if (h === '17:15') return 'Tarde (17:15)'
  return hora
}

function sanitizeRutaInput(body) {
  return {
    nombre: sanitizeString(body.nombre, 100),
    origen: sanitizeString(body.origen, 100),
    destino: sanitizeString(body.destino, 100),
    distancia: sanitizeString(body.distancia, 20),
    duracion_estimada: sanitizeString(body.duracion_estimada, 20),
    puntos_json: Array.isArray(body.puntos_json) ? body.puntos_json.map(p => ({
      nombre: sanitizeString(p.nombre || '', 100),
      lat: typeof p.lat === 'number' && !isNaN(p.lat) ? parseFloat(p.lat) : 0,
      lng: typeof p.lng === 'number' && !isNaN(p.lng) ? parseFloat(p.lng) : 0
    })) : [],
    observacion: sanitizeString(body.observacion, 500)
  }
}

router.get('/publicas', async (req, res) => {
  try {
    const { fecha, tipo, label } = getFechaPorHora()

    const asignaciones = await AsignacionRuta.findAll({
      where: { fecha, estado: 'garantizada' },
      include: [
        {
          model: Ruta,
          as: 'ruta',
          attributes: ['id', 'nombre', 'origen', 'destino']
        },
        { model: Chofer, as: 'chofer', attributes: ['id', 'nombre'] },
        { model: Omnibus, as: 'omnibus', attributes: ['id', 'placa', 'marca', 'capacidad'] }
      ],
      order: [['hora', 'ASC'], ['ruta', 'nombre', 'ASC']]
    })

    const rutas = asignaciones.map(a => ({
      id: a.ruta?.id,
      nombre: a.ruta?.nombre,
      origen: a.ruta?.origen,
      destino: a.ruta?.destino,
      hora: a.hora,
      chofer: a.chofer ? { id: a.chofer.id, nombre: a.chofer.nombre } : null,
      omnibus: a.omnibus ? { id: a.omnibus.id, placa: a.omnibus.placa, marca: a.omnibus.marca, capacidad: a.omnibus.capacidad } : null
    }))

    res.json({ fecha, tipo, label, rutas })
  } catch (error) {
    logger.error('Error in GET /rutas/publicas:', error.message)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

router.get('/conductor-hoy', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'conductor') {
      return res.status(403).json({ error: 'Solo para conductores' })
    }

    const chofer = await Chofer.findOne({ where: { usuario_id: req.user.id } })
    if (!chofer) {
      return res.status(404).json({ error: 'No tiene un conductor asociado' })
    }

    const { fecha, tipo, label } = getFechaPorHora()

    const asignaciones = await AsignacionRuta.findAll({
      where: { fecha, chofer_id: chofer.id },
      include: [
        { model: Ruta, as: 'ruta', attributes: ['id', 'nombre', 'origen', 'destino'] },
        { model: Omnibus, as: 'omnibus', attributes: ['id', 'placa', 'marca', 'capacidad'] }
      ],
      order: [['hora', 'ASC']]
    })

    res.json({
      chofer: chofer.nombre,
      fecha,
      tipo,
      label,
      rutas: asignaciones.map(a => ({
        id: a.ruta?.id,
        nombre: a.ruta?.nombre,
        origen: a.ruta?.origen,
        destino: a.ruta?.destino,
        hora: a.hora,
        omnibus: a.omnibus ? { placa: a.omnibus.placa, marca: a.omnibus.marca, capacidad: a.omnibus.capacidad } : null
      }))
    })
  } catch (error) {
    logger.error('Error in GET /rutas/conductor-hoy:', error.message)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

router.get('/comunicado', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  try {
    const manana = new Date()
    manana.setDate(manana.getDate() + 1)
    const fechaManana = manana.toISOString().split('T')[0]
    const fechaDisplay = formatearFechaDisplay(fechaManana)

    const asignaciones = await AsignacionRuta.findAll({
      where: { fecha: fechaManana },
      include: [
        { model: Ruta, as: 'ruta', attributes: ['id', 'nombre', 'origen', 'destino'] },
        { model: Chofer, as: 'chofer', attributes: ['nombre'] },
        { model: Omnibus, as: 'omnibus', attributes: ['placa'] }
      ],
      order: [['hora', 'ASC']]
    })

    const garantizadas = asignaciones.filter(a => a.estado === 'garantizada' && a.chofer_id && a.omnibus_id)
    const pendientes = asignaciones.filter(a => a.estado !== 'garantizada' || !a.chofer_id || !a.omnibus_id)

    let comunicado = ''

    if (pendientes.length === 0) {
      comunicado += `Para el dia de manana se garantizan todas las rutas. Ofrecemos disculpas y tengan buenas tardes.\n\n`
    } else {
      comunicado += `Para el dia de manana se garantizan todas las rutas exceptuando las siguientes:\n\n`
      pendientes.forEach(a => {
        if (a.ruta) {
          comunicado += `- ${a.ruta.nombre}\n`
        }
      })
      comunicado += `\nOfrecemos disculpas por las molestias. Tengan buenas tardes.\n\n`
    }

    comunicado += `Direccion de Transporte UCI`

    res.json({
      fecha: fechaManana,
      fecha_display: fechaDisplay,
      comunicado,
      total_garantizadas: garantizadas.length,
      total_pendientes: pendientes.length
    })
  } catch (error) {
    logger.error('Error in GET /rutas/comunicado:', error.message)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

router.get('/', async (req, res) => {
  try {
    const rutas = await Ruta.findAll({
      attributes: ['id', 'nombre', 'origen', 'destino', 'distancia', 'duracion_estimada', 'puntos_json', 'observacion'],
      order: [['nombre', 'ASC']]
    })
    res.json(rutas)
  } catch (error) {
    logger.error('Error in GET /rutas:', error.message)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

const SPECIAL_ROUTES = ['publicas', 'conductor-hoy', 'comunicado']

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    if (SPECIAL_ROUTES.includes(id)) {
      return res.status(404).json({ error: 'Ruta no encontrada' })
    }
    if (!id || !isValidUUID(id)) {
      return res.status(400).json({ error: 'ID inválido' })
    }
    
    const ruta = await Ruta.findByPk(id)
    if (!ruta) {
      return res.status(404).json({ error: 'Ruta no encontrada' })
    }
    res.json(ruta)
  } catch (error) {
    logger.error('Error in GET /rutas/:id:', error.message)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

router.post('/', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  try {
    const { nombre, origen, destino } = req.body

    if (!nombre || !origen || !destino) {
      return res.status(400).json({ error: 'Nombre, origen y destino son requeridos' })
    }

    const sanitized = sanitizeRutaInput(req.body)
    
    if (!sanitized.nombre || !sanitized.origen || !sanitized.destino) {
      return res.status(400).json({ error: 'Datos inválidos después de sanitizar' })
    }

    const ruta = await Ruta.create(sanitized)
    
    res.status(201).json(ruta)
  } catch (error) {
    logger.error('Error in POST /rutas:', error.message)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

router.put('/:id', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  try {
    const { id } = req.params
    if (!id || !isValidUUID(id)) {
      return res.status(400).json({ error: 'ID inválido' })
    }

    const ruta = await Ruta.findByPk(id)
    if (!ruta) {
      return res.status(404).json({ error: 'Ruta no encontrada' })
    }

    const sanitized = sanitizeRutaInput(req.body)
    await ruta.update(sanitized)
    
    res.json(ruta)
  } catch (error) {
    logger.error('Error in PUT /rutas/:id:', error.message)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

router.delete('/:id', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  try {
    const { id } = req.params
    if (!id || !isValidUUID(id)) {
      return res.status(400).json({ error: 'ID inválido' })
    }

    const ruta = await Ruta.findByPk(id)
    if (!ruta) {
      return res.status(404).json({ error: 'Ruta no encontrada' })
    }

    await ruta.destroy()
    res.status(204).send()
  } catch (error) {
    logger.error('Error in DELETE /rutas/:id:', error.message)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

export default router