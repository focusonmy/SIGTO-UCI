import { useState, useEffect } from 'react'
import { getRutas, getChoferes, getOmnibus } from '../../data/api'

const STATS_CONFIG = [
  { key: 'rutas', label: 'Rutas Registradas', gradient: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)' },
  { key: 'choferes', label: 'Choferes', gradient: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)' },
  { key: 'disponibles', label: 'Ómnibus Disponibles', gradient: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)' },
  { key: 'mantenimiento', label: 'En Mantenimiento', gradient: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)' },
]

export default function Dashboard() {
  const [rutas, setRutas] = useState([])
  const [choferes, setChoferes] = useState([])
  const [omnibus, setOmnibus] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [rutasData, choferesData, omnibusData] = await Promise.all([
          getRutas(),
          getChoferes(),
          getOmnibus()
        ])
        setRutas(rutasData || [])
        setChoferes(choferesData || [])
        setOmnibus(omnibusData || [])
      } catch {
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
    mantenimiento: omnibus.filter(o => o.estado === 'mantenimiento').length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#2563eb' }}></div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold mb-6" style={{ color: '#0f172a' }}>Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {STATS_CONFIG.map(stat => (
          <div
            key={stat.label}
            className="p-6 rounded-2xl"
            style={{ background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}
          >
            <div
              className="w-12 h-12 rounded-xl mb-4"
              style={{ background: stat.gradient }}
            />
            <p className="text-3xl font-bold" style={{ color: '#0f172a' }}>{stats[stat.key]}</p>
            <p style={{ color: '#64748b' }}>{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div
          className="p-6 rounded-2xl"
          style={{ background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}
        >
          <h3 className="text-lg font-semibold mb-4" style={{ color: '#0f172a' }}>Rutas Registradas</h3>
          <div className="space-y-3">
            {rutas.slice(0, 5).map(ruta => (
              <div
                key={ruta.id}
                className="p-4 rounded-xl flex items-center justify-between"
                style={{ background: '#f8fafc' }}
              >
                <div>
                  <p className="font-medium" style={{ color: '#0f172a' }}>{ruta.nombre}</p>
                  <p className="text-sm" style={{ color: '#64748b' }}>{ruta.origen} → {ruta.destino}</p>
                </div>
                <div className="text-right">
                  <span className="text-sm" style={{ color: '#64748b' }}>{ruta.distancia || '-'}</span>
                </div>
              </div>
            ))}
            {rutas.length === 0 && (
              <p className="text-gray-500 text-center py-4">No hay rutas registradas</p>
            )}
          </div>
        </div>

        <div
          className="p-6 rounded-2xl"
          style={{ background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}
        >
          <h3 className="text-lg font-semibold mb-4" style={{ color: '#0f172a' }}>Ómnibus</h3>
          <div className="space-y-3">
            {omnibus.slice(0, 5).map(omni => (
              <div
                key={omni.id}
                className="p-4 rounded-xl flex items-center justify-between"
                style={{ background: '#f8fafc' }}
              >
                <div>
                  <p className="font-medium" style={{ color: '#0f172a' }}>{omni.placa}</p>
                  <p className="text-sm" style={{ color: '#64748b' }}>{omni.marca} {omni.modelo}</p>
                </div>
                <span
                  className="px-3 py-1 rounded-full text-sm"
                  style={{
                    background: omni.estado === 'disponible' ? 'rgba(16, 185, 129, 0.1)' :
                                omni.estado === 'en_servicio' ? 'rgba(245, 158, 11, 0.1)' :
                                'rgba(239, 68, 68, 0.1)',
                    color: omni.estado === 'disponible' ? '#10b981' :
                            omni.estado === 'en_servicio' ? '#f59e0b' :
                            '#ef4444'
                  }}
                >
                  {omni.estado}
                </span>
              </div>
            ))}
            {omnibus.length === 0 && (
              <p className="text-gray-500 text-center py-4">No hay ómnibus registrados</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}