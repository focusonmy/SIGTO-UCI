import { rutas, choferes, omnibus, reportes, asignaciones, rutasApi } from './apiClient'

function safeParse(value, fallback) {
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : fallback
  } catch {
    return fallback
  }
}

export async function getRutas() {
  try {
    return await rutas.getAll()
  } catch {
    const stored = localStorage.getItem('rutas')
    return stored ? safeParse(stored, []) : []
  }
}

export async function getRutasPublicas() {
  try {
    return await rutas.getPublicas()
  } catch {
    return { tipo: 'hoy', label: '', rutas: [] }
  }
}

export async function getRutaConductor() {
  try {
    return await rutas.getConductorHoy()
  } catch (error) {
    throw error
  }
}

export async function getRutasLocales() {
  const stored = localStorage.getItem('rutas')
  return stored ? safeParse(stored, []) : []
}

export async function getItinerariosLocales() {
  return getRutasLocales()
}

export async function addRuta(ruta) {
  return await rutas.create(ruta)
}

export async function updateRuta(id, updates) {
  return await rutas.update(id, updates)
}

export async function deleteRuta(id) {
  return await rutas.delete(id)
}

export async function getChoferes() {
  try {
    return await choferes.getAll()
  } catch {
    return []
  }
}

export async function addChofer(chofer) {
  return await choferes.create(chofer)
}

export async function updateChofer(id, chofer) {
  return await choferes.update(id, chofer)
}

export async function deleteChofer(id) {
  return await choferes.delete(id)
}

export async function getOmnibus() {
  try {
    return await omnibus.getAll()
  } catch {
    return []
  }
}

export async function getOmnibusDisponibles() {
  try {
    return await omnibus.getDisponibles()
  } catch {
    return []
  }
}

export async function addOmnibus(omn) {
  return await omnibus.create(omn)
}

export async function updateOmnibus(id, omn) {
  return await omnibus.update(id, omn)
}

export async function deleteOmnibus(id) {
  return await omnibus.delete(id)
}

export async function getReporteDia() {
  return await reportes.getDia()
}

export async function copiarReporte() {
  return await reportes.copiar()
}

export async function getAsignaciones(fecha) {
  return await asignaciones.getAll(fecha)
}

export async function saveAsignaciones(data) {
  return await asignaciones.create(data)
}

export async function getHistorialAsignaciones(params) {
  return await asignaciones.getHistorial(params)
}

export async function deleteAsignacion(id) {
  return await asignaciones.delete(id)
}

export async function getComunicado() {
  return await rutasApi.getComunicado()
}
