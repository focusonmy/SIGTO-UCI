import { useState, useEffect } from 'react'
import { getRutas, getChoferes, getOmnibus } from '../../data/api'
import { reportes } from '../../data/apiClient'

const today = new Date()
const dayNames = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
const monthNames = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

function formatDate(date) {
  return `${dayNames[date.getDay()]}, ${date.getDate()} de ${monthNames[date.getMonth()]} de ${date.getFullYear()}`
}

export default function Dashboard() {
  const [rutas, setRutas] = useState([])
  const [choferes, setChoferes] = useState([])
  const [omnibus, setOmnibus] = useState([])
  const [reporte, setReporte] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadData() {
      try {
        const [rutasData, choferesData, omnibusData, reporteData] = await Promise.all([
          getRutas(),
          getChoferes(),
          getOmnibus(),
          reportes.getDia()
        ])
        setRutas(rutasData || [])
        setChoferes(choferesData || [])
        setOmnibus(omnibusData || [])
        setReporte(reporteData)
      } catch (e) {
        setError(e.message || 'Error al cargar datos del dashboard')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const stats = {
    rutas: rutas.length,
    choferes: choferes.length,
    disponibles: omnibus.filter(o => o.estado === 'disponible').length,
    enServicio: omnibus.filter(o => o.estado === 'en_servicio').length,
    mantenimiento: omnibus.filter(o => o.estado === 'mantenimiento').length,
    garantizadas: reporte?.garantizadas ?? 0,
    pendientes: reporte?.pendientes ?? 0,
    totalAsignaciones: (reporte?.garantizadas ?? 0) + (reporte?.pendientes ?? 0),
  }

  const esFinde = today.getDay() === 0 || today.getDay() === 6
  const sinServicio = reporte?.mensaje && (reporte.mensaje.toLowerCase().includes('sábado') || reporte.mensaje.toLowerCase().includes('domingo'))

  const garantizadasPct = stats.totalAsignaciones > 0 ? Math.round((stats.garantizadas / stats.totalAsignaciones) * 100) : 0

  function getPendingReason(ruta) {
    const reasons = []
    if (ruta.chofer === 'Sin asignar') reasons.push('Falta chofer')
    if (ruta.omnibus === 'Sin asignar') reasons.push('Falta ómnibus')
    return reasons.length > 0 ? reasons.join(' + ') : 'Pendiente'
  }

  const pendientesDetalle = (reporte?.rutas || []).filter(r => r.chofer === 'Sin asignar' || r.omnibus === 'Sin asignar' || r.estado !== 'garantizada')

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8" style={{ borderColor: '#2563eb', borderBottomColor: 'transparent', borderWidth: '2px' }}></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-lg font-medium mb-2" style={{ color: '#ef4444' }}>Error al cargar el dashboard</p>
          <p style={{ color: '#64748b' }}>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: '#0f172a' }}>Dashboard</h2>
          <p className="text-sm" style={{ color: '#64748b' }}>{formatDate(today)}</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ background: '#f8fafc' }}>
          <span className={`w-2 h-2 rounded-full ${esFinde ? 'bg-orange-400' : 'bg-green-400'}`} />
          <span className="text-sm font-medium" style={{ color: '#64748b' }}>
            {esFinde ? 'Fin de semana' : 'Día laboral'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-5 rounded-2xl" style={{ background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold" style={{ background: '#2563eb' }}>
              {stats.rutas}
            </div>
            <p className="text-sm font-medium" style={{ color: '#64748b' }}>Rutas</p>
          </div>
          <p className="text-2xl font-bold" style={{ color: '#0f172a' }}>{stats.rutas}</p>
          <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>Trayectos registrados</p>
        </div>

        <div className="p-5 rounded-2xl" style={{ background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold" style={{ background: '#8b5cf6' }}>
              {stats.choferes}
            </div>
            <p className="text-sm font-medium" style={{ color: '#64748b' }}>Choferes</p>
          </div>
          <p className="text-2xl font-bold" style={{ color: '#0f172a' }}>{stats.choferes}</p>
          <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>Activos en el sistema</p>
        </div>

        <div className="p-5 rounded-2xl" style={{ background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold" style={{ background: '#10b981' }}>
              {stats.disponibles}
            </div>
            <p className="text-sm font-medium" style={{ color: '#64748b' }}>Ómnibus</p>
          </div>
          <p className="text-2xl font-bold" style={{ color: '#0f172a' }}>{stats.disponibles}</p>
          <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>Disponibles de {omnibus.length} total</p>
        </div>

        <div className="p-5 rounded-2xl" style={{ background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold ${sinServicio ? 'bg-orange-400' : stats.pendientes === 0 ? 'bg-green-500' : 'bg-amber-500'}`}>
              {stats.garantizadas}
            </div>
            <p className="text-sm font-medium" style={{ color: '#64748b' }}>Hoy</p>
          </div>
          <p className="text-2xl font-bold" style={{ color: '#0f172a' }}>
            {sinServicio ? '—' : `${stats.garantizadas}/${stats.totalAsignaciones}`}
          </p>
          <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>
            {sinServicio ? 'Sin servicio' : 'Rutas garantizadas'}
          </p>
        </div>
      </div>

      {!esFinde && !sinServicio && stats.totalAsignaciones > 0 && (
        <div className="mb-6 p-5 rounded-2xl" style={{ background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold" style={{ color: '#0f172a' }}>Estado de las rutas de hoy</h3>
            <span className="text-sm" style={{ color: '#64748b' }}>{garantizadasPct}% completado</span>
          </div>
          <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: '#f1f5f9' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${garantizadasPct}%`,
                background: garantizadasPct === 100 ? '#10b981' : garantizadasPct > 50 ? '#2563eb' : '#f59e0b'
              }}
            />
          </div>
          <div className="flex gap-6 mt-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ background: '#10b981' }} />
              <span style={{ color: '#64748b' }}>{stats.garantizadas} garantizadas</span>
            </div>
            {stats.pendientes > 0 && (
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ background: '#ef4444' }} />
                <span style={{ color: '#64748b' }}>{stats.pendientes} pendientes</span>
              </div>
            )}
          </div>
        </div>
      )}

      {sinServicio && (
        <div className="mb-6 p-5 rounded-2xl" style={{ background: '#fef9c3' }}>
          <p className="font-medium" style={{ color: '#854d0e' }}>
            {reporte?.mensaje || 'Hoy no hay servicio (fin de semana)'}
          </p>
        </div>
      )}

      {!sinServicio && stats.totalAsignaciones > 0 && pendientesDetalle.length > 0 && (
        <div className="mb-6 p-5 rounded-2xl" style={{ background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <h3 className="font-semibold mb-4" style={{ color: '#0f172a' }}>Rutas pendientes</h3>
          <div className="space-y-2">
            {pendientesDetalle.slice(0, 6).map((r, i) => (
              <div key={i} className="p-3 rounded-xl text-sm flex items-center justify-between" style={{ background: '#fef2f2' }}>
                <div>
                  <p className="font-medium" style={{ color: '#991b1b' }}>{r.nombre}</p>
                  <p style={{ color: '#b91c1c' }}>{r.hora} — {getPendingReason(r)}</p>
                </div>
              </div>
            ))}
            {pendientesDetalle.length > 6 && (
              <p className="text-sm text-center pt-2" style={{ color: '#64748b' }}>
                +{pendientesDetalle.length - 6} más
              </p>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl" style={{ background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <h3 className="font-semibold mb-4" style={{ color: '#0f172a' }}>Flota de ómnibus</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: '#f0fdf4' }}>
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full" style={{ background: '#10b981' }} />
                <span style={{ color: '#0f172a' }}>Disponibles</span>
              </div>
              <span className="font-bold" style={{ color: '#10b981' }}>{stats.disponibles}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: '#fff7ed' }}>
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full" style={{ background: '#f59e0b' }} />
                <span style={{ color: '#0f172a' }}>En servicio</span>
              </div>
              <span className="font-bold" style={{ color: '#f59e0b' }}>{stats.enServicio}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: '#fef2f2' }}>
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full" style={{ background: '#ef4444' }} />
                <span style={{ color: '#0f172a' }}>Mantenimiento</span>
              </div>
              <span className="font-bold" style={{ color: '#ef4444' }}>{stats.mantenimiento}</span>
            </div>
            <div className="pt-2 text-center text-sm" style={{ color: '#94a3b8' }}>
              Total: {omnibus.length} unidades
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl" style={{ background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <h3 className="font-semibold mb-4" style={{ color: '#0f172a' }}>Resumen de choferes</h3>
          <div className="space-y-3">
            {choferes.slice(0, 8).map(c => (
              <div key={c.id} className="flex items-center justify-between p-3 rounded-xl" style={{ background: '#f8fafc' }}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: '#8b5cf6' }}>
                    {c.nombre?.charAt(0) || '?'}
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: '#0f172a' }}>{c.nombre}</p>
                    <p className="text-xs" style={{ color: '#94a3b8' }}>{c.cedula}</p>
                  </div>
                </div>
                <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ color: '#8b5cf6', background: '#f5f3ff' }}>
                  {c.telefono || '—'}
                </span>
              </div>
            ))}
            {choferes.length === 0 && (
              <p className="text-center py-4 text-sm" style={{ color: '#94a3b8' }}>No hay choferes registrados</p>
            )}
            {choferes.length > 8 && (
              <p className="text-center text-sm pt-2" style={{ color: '#64748b' }}>+{choferes.length - 8} choferes más</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
