import { Router } from 'express'
import { authMiddleware, roleMiddleware } from '../middleware/auth.js'
import { Ruta, Chofer, Omnibus, AsignacionRuta } from '../models/index.js'
import { Op } from 'sequelize'
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
        { model: Ruta, as: 'ruta', attributes: ['nombre', 'origen', 'destino'] },
        { model: Chofer, as: 'chofer', attributes: ['nombre'] },
        { model: Omnibus, as: 'omnibus', attributes: ['placa'] }
      ],
      order: [['hora', 'ASC']]
    })

    const rutasConDatos = asignaciones.map(a => ({
      nombre: a.ruta?.nombre || 'Sin ruta',
      origen: a.ruta?.origen || '',
      destino: a.ruta?.destino || '',
      hora: getHorarioLabel(a.hora),
      horario: a.hora,
      chofer: a.chofer?.nombre || 'Sin asignar',
      omnibus: a.omnibus?.placa || 'Sin asignar',
      estado: a.estado
    }))

    const garantizadas = rutasConDatos.filter(r => r.estado === 'garantizada' && r.chofer !== 'Sin asignar' && r.omnibus !== 'Sin asignar')
    const pendientes = rutasConDatos.filter(r => r.estado !== 'garantizada' || r.chofer === 'Sin asignar' || r.omnibus === 'Sin asignar')

    let reporte = `━━━━━━━━━━━━━━━━━━━━━━━━━\n`
    reporte += `📋 REPORTE DE RUTAS - ${formatearFecha(hoy).toUpperCase()}\n`
    reporte += `━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`

    if (garantizadas.length > 0) {
      reporte += `✅ RUTAS GARANTIZADAS:\n`
      garantizadas.forEach((r, i) => {
        reporte += `${i + 1}. 🚌 ${r.nombre} - ${r.hora}\n`
        reporte += `   ${r.origen} → ${r.destino}\n`
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

    res.json({
      fecha: formatearFecha(hoy),
      dia: ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'][diaSemana],
      total_rutas: asignaciones.length,
      garantizadas: garantizadas.length,
      pendientes: pendientes.length,
      rutas: rutasConDatos,
      reporte_texto: reporte
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
        { model: Ruta, as: 'ruta', attributes: ['nombre', 'origen', 'destino'] },
        { model: Chofer, as: 'chofer', attributes: ['nombre'] },
        { model: Omnibus, as: 'omnibus', attributes: ['placa'] }
      ],
      order: [['hora', 'ASC']]
    })

    const rutasConDatos = asignaciones.map(a => ({
      nombre: a.ruta?.nombre || 'Sin ruta',
      hora: getHorarioLabel(a.hora),
      horario: a.hora,
      chofer: a.chofer?.nombre || 'Sin asignar',
      omnibus: a.omnibus?.placa || 'Sin asignar',
      estado: a.estado
    }))

    const garantizadas = rutasConDatos.filter(r => r.estado === 'garantizada' && r.chofer !== 'Sin asignar' && r.omnibus !== 'Sin asignar')
    const pendientes = rutasConDatos.filter(r => r.estado !== 'garantizada' || r.chofer === 'Sin asignar' || r.omnibus === 'Sin asignar')

    let reporte = `━━━━━━━━━━━━━━━━━━━━━━━━━\n`
    reporte += `📋 REPORTE DE RUTAS - ${formatearFecha(hoy).toUpperCase()}\n`
    reporte += `━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`

    if (garantizadas.length > 0) {
      reporte += `✅ RUTAS GARANTIZADAS:\n`
      garantizadas.forEach((r, i) => {
        reporte += `${i + 1}. 🚌 ${r.nombre} - ${r.hora}\n`
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

    res.json({ success: true, reporte })
  } catch (error) {
    logger.error('Error in POST /reportes/copiar:', error.message)
    res.status(500).json({ error: error.message })
  }
})

export default router