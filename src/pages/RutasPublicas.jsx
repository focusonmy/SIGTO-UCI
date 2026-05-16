import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../data/auth'
import { getRutasPublicas, getRutaConductor } from '../data/api'

export default function RutasPublicas() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState({ tipo: 'hoy', label: '', rutas: [] })
  const [loading, setLoading] = useState(true)
  const errorRef = useRef('')

  useEffect(() => {
    if (user?.role === 'conductor') {
      loadRutaConductor()
    } else {
      loadRutas()
    }
  }, [user])

  async function loadRutas() {
    try {
      setLoading(true)
      const result = await getRutasPublicas()
      setData(result || { tipo: 'hoy', label: '', rutas: [] })
    } catch (e) {
      errorRef.current = e.message
      setData({ tipo: 'hoy', label: '', rutas: [] })
    } finally {
      setLoading(false)
    }
  }

  async function loadRutaConductor() {
    try {
      setLoading(true)
      const result = await getRutaConductor()
      if (result.error) {
        errorRef.current = result.error
        setData({ tipo: 'hoy', label: '', rutas: [] })
      } else {
        setData({
          chofer: result.chofer,
          fecha: result.fecha,
          tipo: result.tipo,
          label: result.label,
          rutas: result.rutas || []
        })
      }
    } catch (e) {
      errorRef.current = e.message
      setData({ tipo: 'hoy', label: '', rutas: [] })
    } finally {
      setLoading(false)
    }
  }

  const rutasManana = data.rutas.filter(r => r.hora && r.hora.startsWith('06'))
  const rutasTarde = data.rutas.filter(r => r.hora && r.hora.startsWith('17'))

  if (user?.role === 'conductor') {
    return (
      <div className="min-h-screen" style={{ background: '#f8fafc' }}>
        <header className="shadow-sm" style={{ background: '#ffffff' }}>
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <h1 className="text-xl font-bold" style={{ color: '#0f172a' }}>{data.label || 'Mis Rutas'}</h1>
            <button onClick={() => navigate('/login', { replace: true })} className="text-sm" style={{ color: '#64748b' }}>
              Cerrar sesión
            </button>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 py-6">
          {loading ? (
            <div className="text-center py-8" style={{ color: '#64748b' }}>Cargando…</div>
          ) : data.rutas?.length > 0 ? (
            <div>
              <div className="p-4 rounded-xl mb-4" style={{ background: '#dcfce7' }}>
                <h2 className="font-bold text-lg" style={{ color: '#166534' }}>
                  Hola, {data.chofer}
                </h2>
                <p style={{ color: '#166534' }}>Hoy tienes {data.rutas.length} ruta(s) asignada(s)</p>
              </div>

              {rutasManana.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-sm mb-2" style={{ color: '#2563eb' }}>HORARIO MAÑANA (06:45)</h3>
                  {rutasManana.map(ruta => (
                    <div key={ruta.id} className="p-4 rounded-xl mb-3" style={{ background: '#ffffff', border: '1px solid #e2e8f0' }}>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-bold" style={{ color: '#0f172a' }}>{ruta.nombre}</h4>
                          <p className="text-sm" style={{ color: '#64748b' }}>{ruta.origen} → {ruta.destino}</p>
                        </div>
                        <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ background: '#dbeafe', color: '#2563eb' }}>
                          06:45
                        </span>
                      </div>
                      {ruta.omnibus && (
                        <div className="text-sm" style={{ color: '#64748b' }}>
                          Unidad: {ruta.omnibus.placa} - {ruta.omnibus.marca} ({ruta.omnibus.capacidad} pasajeros)
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {rutasTarde.length > 0 && (
                <div>
                  <h3 className="font-semibold text-sm mb-2" style={{ color: '#2563eb' }}>HORARIO TARDE (17:15)</h3>
                  {rutasTarde.map(ruta => (
                    <div key={ruta.id} className="p-4 rounded-xl mb-3" style={{ background: '#ffffff', border: '1px solid #e2e8f0' }}>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-bold" style={{ color: '#0f172a' }}>{ruta.nombre}</h4>
                          <p className="text-sm" style={{ color: '#64748b' }}>{ruta.origen} → {ruta.destino}</p>
                        </div>
                        <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ background: '#dbeafe', color: '#2563eb' }}>
                          17:15
                        </span>
                      </div>
                      {ruta.omnibus && (
                        <div className="text-sm" style={{ color: '#64748b' }}>
                          Unidad: {ruta.omnibus.placa} - {ruta.omnibus.marca} ({ruta.omnibus.capacidad} pasajeros)
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8" style={{ color: '#64748b' }}>
              No tienes rutas asignadas
            </div>
          )}
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: '#f8fafc' }}>
      <header className="shadow-sm" style={{ background: '#ffffff' }}>
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold" style={{ color: '#0f172a' }}>{data.label || 'Rutas de Transporte'}</h1>
          <button
            onClick={() => window.location.href = '/login'}
            className="text-sm px-3 py-1 rounded-lg font-medium"
            style={{ background: '#2563eb', color: '#ffffff' }}
          >
            Iniciar sesión
          </button>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center py-8" style={{ color: '#64748b' }}>Cargando…</div>
        ) : data.rutas?.length > 0 ? (
          <div>
            {rutasManana.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-sm mb-3" style={{ color: '#2563eb' }}>HORARIO MAÑANA (06:45)</h3>
                <div className="space-y-3">
                  {rutasManana.map(ruta => (
                    <div key={ruta.id} className="p-4 rounded-xl" style={{ background: '#ffffff', border: '1px solid #e2e8f0' }}>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-bold" style={{ color: '#0f172a' }}>{ruta.nombre}</h4>
                          <p className="text-sm" style={{ color: '#64748b' }}>{ruta.origen} → {ruta.destino}</p>
                        </div>
                        <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ background: '#dbeafe', color: '#2563eb' }}>
                          06:45
                        </span>
                      </div>
                      <div className="text-sm space-y-1" style={{ color: '#64748b' }}>
                        {ruta.chofer && <p>Conductor: {ruta.chofer.nombre}</p>}
                        {ruta.omnibus && <p>Unidad: {ruta.omnibus.placa} - {ruta.omnibus.marca}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {rutasTarde.length > 0 && (
              <div>
                <h3 className="font-semibold text-sm mb-3" style={{ color: '#2563eb' }}>HORARIO TARDE (17:15)</h3>
                <div className="space-y-3">
                  {rutasTarde.map(ruta => (
                    <div key={ruta.id} className="p-4 rounded-xl" style={{ background: '#ffffff', border: '1px solid #e2e8f0' }}>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-bold" style={{ color: '#0f172a' }}>{ruta.nombre}</h4>
                          <p className="text-sm" style={{ color: '#64748b' }}>{ruta.origen} → {ruta.destino}</p>
                        </div>
                        <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ background: '#dbeafe', color: '#2563eb' }}>
                          17:15
                        </span>
                      </div>
                      <div className="text-sm space-y-1" style={{ color: '#64748b' }}>
                        {ruta.chofer && <p>Conductor: {ruta.chofer.nombre}</p>}
                        {ruta.omnibus && <p>Unidad: {ruta.omnibus.placa} - {ruta.omnibus.marca}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8" style={{ color: '#64748b' }}>
            No hay rutas garantizadas para esta fecha
          </div>
        )}
      </main>
    </div>
  )
}