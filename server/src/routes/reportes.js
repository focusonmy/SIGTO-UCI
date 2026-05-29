import { Router } from 'express'
import { authMiddleware, roleMiddleware } from '../middleware/auth.js'
import { Ruta, Chofer, Omnibus, AsignacionRuta } from '../models/index.js'
import logger from '../utils/logger.js'

const router = Router()

function formatearFecha(fecha) {
  return fecha.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

function getHorarioLabel(hora) {
  if (!hora) return ''
  const h = hora.substring(0, 5)
  if (h === '06:45') return '06:45 AM'
  if (h === '17:15') return '05:15 PM'
  return hora
}

function procesarAsignaciones(asignaciones, fecha) {
  const grouped = {}

  for (const a of asignaciones) {
    const key = a.ruta?.id || a.ruta?.nombre
    if (!key) continue

    if (!grouped[key]) {
      grouped[key] = {
        nombre: a.ruta?.nombre || 'Sin ruta',
        origen: a.ruta?.origen || '',
        destino: a.ruta?.destino || '',
        items: []
      }
    }
    grouped[key].items.push({
      hora: a.hora,
      horarioLabel: getHorarioLabel(a.hora),
      chofer: a.chofer?.nombre || 'Sin asignar',
      omnibus: a.omnibus?.placa || 'Sin asignar',
      estado: a.estado
    })
  }

  const rutas = []

  for (const key of Object.keys(grouped)) {
    const g = grouped[key]
    const morning = g.items.find(i => i.hora === '06:45')
    const afternoon = g.items.find(i => i.hora === '17:15')

    if (morning && afternoon) {
      const sameChofer = morning.chofer === afternoon.chofer
      const sameOmnibus = morning.omnibus === afternoon.omnibus

      if (sameChofer && sameOmnibus) {
        rutas.push({
          nombre: g.nombre,
          origen: g.origen,
          destino: g.destino,
          hora: '06:45 AM y 05:15 PM',
          chofer: morning.chofer,
          omnibus: morning.omnibus,
          estado: morning.estado
        })
      } else {
        rutas.push({
          nombre: g.nombre,
          origen: g.origen,
          destino: g.destino,
          hora: morning.horarioLabel,
          chofer: morning.chofer,
          omnibus: morning.omnibus,
          estado: morning.estado
        })
        rutas.push({
          nombre: g.nombre,
          origen: g.origen,
          destino: g.destino,
          hora: afternoon.horarioLabel,
          chofer: afternoon.chofer,
          omnibus: afternoon.omnibus,
          estado: afternoon.estado
        })
      }
    } else {
      const item = morning || afternoon
      if (item) {
        rutas.push({
          nombre: g.nombre,
          origen: g.origen,
          destino: g.destino,
          hora: item.horarioLabel,
          chofer: item.chofer,
          omnibus: item.omnibus,
          estado: item.estado
        })
      }
    }
  }

  rutas.sort((a, b) => {
    const nameCmp = (a.nombre || '').localeCompare(b.nombre || '')
    if (nameCmp !== 0) return nameCmp
    return (a.hora || '').localeCompare(b.hora || '')
  })

  const garantizadas = rutas.filter(r => r.estado === 'garantizada' && r.chofer !== 'Sin asignar' && r.omnibus !== 'Sin asignar')
  const pendientes = rutas.filter(r => r.estado !== 'garantizada' || r.chofer === 'Sin asignar' || r.omnibus === 'Sin asignar')

  const fechaDisplay = formatearFecha(fecha).toUpperCase()

  let reporte = `━━━━━━━━━━━━━━━━━━━━━━━━━\n`
  reporte += `📋 REPORTE DE RUTAS - ${fechaDisplay}\n`
  reporte += `━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`

  if (garantizadas.length > 0) {
    reporte += `✅ RUTAS DEL DIA:\n`
    garantizadas.forEach((r, i) => {
      reporte += `${i + 1}. 🚌 ${r.nombre} - ${r.hora}\n`
      if (r.origen && r.destino) {
        reporte += `   ${r.origen} → ${r.destino}\n`
      }
      reporte += `   Chofer: ${r.chofer} - Ómnibus: ${r.omnibus}\n`
    })
    reporte += `\n`
  }

  if (pendientes.length > 0) {
    reporte += `❌ RUTAS PENDIENTES:\n`
    pendientes.forEach((r, i) => {
      reporte += `${i + 1}. ${r.nombre} - ${r.hora}`
      if (r.chofer === 'Sin asignar') reporte += ` (Sin chofer)`
      if (r.omnibus === 'Sin asignar') reporte += ` (Sin ómnibus)`
      reporte += `\n`
    })
    reporte += `\n`
  }

  if (garantizadas.length === 0 && pendientes.length === 0) {
    reporte += `⚠️ No hay rutas programadas para hoy.\n\n`
  }

  reporte += `📅 Horarios: 6:45 AM y 5:15 PM\n`
  reporte += `📆 Días: Lunes a viernes\n`
  reporte += `━━━━━━━━━━━━━━━━━━━━━━━━━\n`

  return { rutas, garantizadas, pendientes, reporte_texto: reporte, total_rutas: rutas.length }
}

// GET /api/reportes/dia
router.get('/dia', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  try {
    const hoy = new Date()
    const fechaStr = hoy.toISOString().split('T')[0]
    const diaSemana = hoy.getDay()

    if (diaSemana === 0 || diaSemana === 6) {
      return res.json({
        mensaje: 'Hoy no hay servicio (sábado o domingo)',
        fecha: formatearFecha(hoy),
        rutas: []
      })
    }

    const asignaciones = await AsignacionRuta.findAll({
      where: { fecha: fechaStr },
      include: [
        { model: Ruta, as: 'ruta', attributes: ['id', 'nombre', 'origen', 'destino'] },
        { model: Chofer, as: 'chofer', attributes: ['nombre'] },
        { model: Omnibus, as: 'omnibus', attributes: ['placa'] }
      ],
      order: [['hora', 'ASC']]
    })

    const { rutas, garantizadas, pendientes, reporte_texto, total_rutas } = procesarAsignaciones(asignaciones, hoy)

    res.json({
      fecha: formatearFecha(hoy),
      dia: ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'][diaSemana],
      total_rutas: total_rutas,
      garantizadas: garantizadas.length,
      pendientes: pendientes.length,
      rutas,
      reporte_texto
    })
  } catch (error) {
    logger.error('Error in GET /reportes/dia:', error.message)
    res.status(500).json({ error: error.message })
  }
})

// POST /api/reportes/copiar
router.post('/copiar', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  try {
    const hoy = new Date()
    const fechaStr = hoy.toISOString().split('T')[0]

    const asignaciones = await AsignacionRuta.findAll({
      where: { fecha: fechaStr },
      include: [
        { model: Ruta, as: 'ruta', attributes: ['id', 'nombre', 'origen', 'destino'] },
        { model: Chofer, as: 'chofer', attributes: ['nombre'] },
        { model: Omnibus, as: 'omnibus', attributes: ['placa'] }
      ],
      order: [['hora', 'ASC']]
    })

    const { reporte_texto } = procesarAsignaciones(asignaciones, hoy)

    res.json({ success: true, reporte: reporte_texto })
  } catch (error) {
    logger.error('Error in POST /reportes/copiar:', error.message)
    res.status(500).json({ error: error.message })
  }
})

export default router
