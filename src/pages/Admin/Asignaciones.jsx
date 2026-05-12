import { useState, useEffect } from 'react'
import { getAsignaciones, saveAsignaciones, getRutas, getChoferes, getOmnibus } from '../../data/api'
import Toast from '../../components/Toast'

const HORAS = ['06:45', '17:15']

function getHorarioLabel(hora) {
  return hora === '06:45' ? 'Mañana (06:45)' : 'Tarde (17:15)'
}

let asignacionesState = []

function getProximosDiasLaborables(hoy, cantidad = 2) {
  const dias = []
  const fecha = new Date(hoy)
  fecha.setHours(0, 0, 0, 0)
  for (let i = 0; i <= 2; i++) {
    const diaSemana = fecha.getDay()
    if (diaSemana >= 1 && diaSemana <= 5) {
      dias.push(fecha.toISOString().split('T')[0])
      if (dias.length >= cantidad) break
    }
    fecha.setDate(fecha.getDate() + 1)
  }
  return dias
}

export default function Asignaciones() {
  const hoyLocal = new Date()
  hoyLocal.setHours(0, 0, 0, 0)
  const diasValidos = getProximosDiasLaborables(hoyLocal, 2)
  const primerDiaValido = diasValidos[0] || null

  const [fecha, setFecha] = useState(primerDiaValido)
  const [rutasFijas, setRutasFijas] = useState([])
  const [asignaciones, setAsignaciones] = useState([])
  const [choferes, setChoferes] = useState([])
  const [omnibus, setOmnibus] = useState([])
  const [loading, setLoading] = useState(false)
  const [sortAsc, setSortAsc] = useState(null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState({ open: false, message: '', type: 'success' })
  const [errorFecha, setErrorFecha] = useState('')

  useEffect(() => {
    loadChoferesOmnibus()
  }, [])

  useEffect(() => {
    loadRutasFijas()
  }, [])

  useEffect(() => {
    if (fecha) {
      const fechaDate = new Date(fecha + 'T12:00:00')
      const diaSemana = fechaDate.getDay()
      if (diaSemana === 0 || diaSemana === 6) {
        setErrorFecha('No se pueden hacer asignaciones en fines de semana')
        setAsignaciones([])
      } else {
        setErrorFecha('')
        loadAsignaciones()
      }
    }
  }, [fecha])

  async function loadChoferesOmnibus() {
    try {
      const [ch, om] = await Promise.all([getChoferes(), getOmnibus()])
      setChoferes(ch || [])
      setOmnibus(om || [])
    } catch (e) {}
  }

  async function loadRutasFijas() {
    try {
      const rutas = await getRutas()
      setRutasFijas(rutas || [])
    } catch (e) {}
  }

  async function loadAsignaciones() {
    setLoading(true)
    try {
      const data = await getAsignaciones(fecha)
      const asigData = (data || []).map(a => ({
        ...a,
        excluded: a.estado === 'cancelada'
      }))
      setAsignaciones(asigData)
      asignacionesState = asigData
    } catch (e) {
      setAsignaciones([])
      asignacionesState = []
    } finally {
      setLoading(false)
    }
  }

  function getAsignacion(rutaId, hora) {
    return asignaciones.find(a => a.ruta_id === rutaId && a.hora === hora)
  }

  function getOcupados(hora, excludeRutaId) {
    const ocupados = { choferes: [], omnibus: [] }
    asignacionesState.forEach(a => {
      if (a.hora === hora && a.ruta_id !== excludeRutaId && !a.excluded) {
        if (a.chofer_id) ocupados.choferes.push(a.chofer_id)
        if (a.omnibus_id) ocupados.omnibus.push(a.omnibus_id)
      }
    })
    return ocupados
  }

  function updateAsignacion(rutaId, hora, campo, valor) {
    setAsignaciones(prev => {
      const existente = prev.find(a => a.ruta_id === rutaId && a.hora === hora)
      let updated
      if (existente) {
        updated = prev.map(a =>
          a.ruta_id === rutaId && a.hora === hora
            ? { ...a, [campo]: valor }
            : a
        )
      } else {
        updated = [...prev, { ruta_id: rutaId, hora, [campo]: valor }]
      }
      asignacionesState = updated
      return updated
    })
  }

  async function handleSave() {
    setSaving(true)
    try {
      const asignacionesData = []
      rutasFijas.forEach(ruta => {
        HORAS.forEach(hora => {
          const existente = getAsignacion(ruta.id, hora)
          if (existente) {
            const excluded = existente.excluded === true
            asignacionesData.push({
              ruta_id: ruta.id,
              chofer_id: excluded ? null : (existente.chofer_id || null),
              omnibus_id: excluded ? null : (existente.omnibus_id || null),
              hora: hora,
              estado: excluded ? 'cancelada' : (existente.estado || 'garantizada'),
              observacion: existente.observacion || null
            })
          }
        })
      })

      await saveAsignaciones({ fecha, asignaciones: asignacionesData })
      setToast({ open: true, message: 'Asignaciones guardadas exitosamente', type: 'success' })
      await loadAsignaciones()
    } catch (e) {
      setToast({ open: true, message: e.message || 'Error al guardar', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  function renderSlot(ruta, hora) {
    const asig = getAsignacion(ruta.id, hora)
    const excluded = asig?.excluded === true
    const ocupados = getOcupados(hora, ruta.id)
    const sortedChoferes = [...choferes].sort((a, b) => {
      const aOcc = ocupados.choferes.includes(a.id)
      const bOcc = ocupados.choferes.includes(b.id)
      return aOcc === bOcc ? 0 : aOcc ? 1 : -1
    })
    const sortedOmnibus = [...omnibus].sort((a, b) => {
      const aOcc = ocupados.omnibus.includes(a.id)
      const bOcc = ocupados.omnibus.includes(b.id)
      return aOcc === bOcc ? 0 : aOcc ? 1 : -1
    })

    if (excluded) {
      return (
        <div key={`${ruta.id}-${hora}`} className="p-3 rounded-lg flex items-center justify-between"
          style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
          <div>
            <span className="font-medium text-sm" style={{ color: '#991b1b' }}>{ruta.nombre}</span>
            <p className="text-xs" style={{ color: '#b91c1c' }}>Ruta no garantizada</p>
          </div>
          <button
            onClick={() => updateAsignacion(ruta.id, hora, 'excluded', false)}
            className="px-3 py-1 rounded text-sm font-medium"
            style={{ background: '#fef9c3', color: '#854d0e', border: '1px solid #fde047' }}
          >
            + Garantizar
          </button>
        </div>
      )
    }

    return (
      <div key={`${ruta.id}-${hora}`} className="p-3 rounded-lg" style={{ background: '#f8fafc' }}>
        <div className="flex items-center justify-between mb-2">
          <p className="font-medium text-sm" style={{ color: '#0f172a' }}>{ruta.nombre}</p>
          <button
            onClick={() => updateAsignacion(ruta.id, hora, 'excluded', true)}
            title="No garantizar esta ruta"
            className="p-1 rounded hover:bg-red-50 transition-colors"
            style={{ color: '#ef4444' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p className="text-xs mb-2" style={{ color: '#64748b' }}>{ruta.origen} → {ruta.destino}</p>
        <div className="grid grid-cols-2 gap-2">
          <select
            value={asig?.chofer_id || ''}
            onChange={e => updateAsignacion(ruta.id, hora, 'chofer_id', e.target.value)}
            className="px-2 py-1 rounded text-sm"
            style={{ border: '1px solid #e2e8f0' }}
          >
            <option value="">Chofer...</option>
            {sortedChoferes.map(c => {
              const occ = ocupados.choferes.includes(c.id)
              return (
                <option key={c.id} value={c.id} disabled={occ}>
                  {c.nombre}{occ ? ' (Ocupado)' : ''}
                </option>
              )
            })}
          </select>
          <select
            value={asig?.omnibus_id || ''}
            onChange={e => updateAsignacion(ruta.id, hora, 'omnibus_id', e.target.value)}
            className="px-2 py-1 rounded text-sm"
            style={{ border: '1px solid #e2e8f0' }}
          >
            <option value="">Ómnibus...</option>
            {sortedOmnibus.map(o => {
              const occ = ocupados.omnibus.includes(o.id)
              return (
                <option key={o.id} value={o.id} disabled={occ}>
                  {o.placa}{occ ? ' (Ocupado)' : ''}
                </option>
              )
            })}
          </select>
        </div>
      </div>
    )
  }

  if (diasValidos.length === 0) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <h2 className="text-2xl font-bold" style={{ color: '#0f172a' }}>Asignaciones</h2>
        </div>
        <div className="rounded-2xl p-8 text-center" style={{ background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <p className="text-lg mb-2" style={{ color: '#f59e0b' }}>No hay dias disponibles para asignar</p>
          <p style={{ color: '#64748b' }}>Podra asignar rutas a partir del proximo lunes</p>
        </div>
      </div>
    )
  }

  const totalSinAsignar = rutasFijas.reduce((count, ruta) => {
    HORAS.forEach(hora => {
      const asig = getAsignacion(ruta.id, hora)
      if (asig && !asig.excluded && (!asig?.chofer_id || !asig?.omnibus_id)) count++
    })
    return count
  }, 0)

  const totalExcluidas = rutasFijas.reduce((count, ruta) => {
    HORAS.forEach(hora => {
      const asig = getAsignacion(ruta.id, hora)
      if (asig && asig.excluded) count++
    })
    return count
  }, 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h2 className="text-2xl font-bold" style={{ color: '#0f172a' }}>Asignaciones</h2>
        <div className="flex items-center gap-3">
          {totalExcluidas > 0 && (
            <span className="text-sm" style={{ color: '#ef4444' }}>
              {totalExcluidas} ruta(s) no garantizada(s)
            </span>
          )}
          {totalSinAsignar > 0 && (
            <span className="text-sm" style={{ color: '#f59e0b' }}>
              Faltan asignar {totalSinAsignar} slot(s)
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 rounded-lg font-medium text-white"
            style={{ background: '#2563eb' }}
          >
            {saving ? 'Guardando...' : 'Guardar Asignaciones'}
          </button>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>Fecha</label>
          <input
            type="date"
            value={fecha || ''}
            onChange={e => setFecha(e.target.value)}
            min={primerDiaValido || ''}
            max={diasValidos[diasValidos.length - 1] || ''}
            className="px-4 py-2 rounded-lg"
            style={{ border: errorFecha ? '1px solid #ef4444' : '1px solid #e2e8f0' }}
          />
          {errorFecha ? (
            <p className="text-xs mt-1" style={{ color: '#ef4444' }}>{errorFecha}</p>
          ) : (
            <p className="text-xs mt-1" style={{ color: '#64748b' }}>
              Solo se pueden asignar rutas para dias laborables (lunes a viernes)
            </p>
          )}
        </div>
        <div className="flex items-end">
          <button
            onClick={() => setSortAsc(prev => prev === null ? true : prev ? false : null)}
            title="Ordenar rutas alfabéticamente"
            className="px-3 py-2 rounded-lg text-sm font-medium mb-2"
            style={{
              border: '1px solid #e2e8f0',
              color: sortAsc !== null ? '#2563eb' : '#64748b',
              background: sortAsc !== null ? 'rgba(37, 99, 235, 0.05)' : 'transparent'
            }}
          >
            {sortAsc === null ? 'A-Z ↕' : sortAsc ? 'A-Z ↑' : 'Z-A ↓'}
          </button>
        </div>
      </div>

      {errorFecha ? (
        <div className="flex justify-center py-16">
          <p className="text-center" style={{ color: '#ef4444' }}>{errorFecha}</p>
        </div>
      ) : loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8" style={{ borderColor: '#2563eb', borderBottomColor: 'transparent' }}></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {HORAS.map(hora => (
            <div key={hora} className="rounded-2xl overflow-hidden" style={{ background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              <div className="px-4 py-3" style={{ background: '#f8fafc' }}>
                <h3 className="font-bold" style={{ color: '#0f172a' }}>{getHorarioLabel(hora)}</h3>
              </div>
              <div className="p-4 space-y-4">
                {rutasFijas
                  .slice()
                  .sort((a, b) => {
                    const asigA = getAsignacion(a.id, hora)
                    const asigB = getAsignacion(b.id, hora)
                    const exA = asigA?.excluded === true
                    const exB = asigB?.excluded === true
                    if (exA !== exB) return exA ? 1 : -1
                    if (sortAsc === null) return 0
                    return sortAsc
                      ? (a.nombre || '').localeCompare(b.nombre || '')
                      : (b.nombre || '').localeCompare(a.nombre || '')
                  })
                  .map(ruta => renderSlot(ruta, hora))}
              </div>
            </div>
          ))}
        </div>
      )}

      {toast.open && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast({ open: false, message: '', type: 'success' })} />
      )}
    </div>
  )
}