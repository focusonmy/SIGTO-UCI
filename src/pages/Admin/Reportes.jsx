import { useState, useEffect } from 'react'
import { reportes } from '../../data/apiClient'
import { useAuth } from '../../data/auth'

export default function Reportes() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [reporte, setReporte] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (user?.role === 'admin') {
      loadReporte()
    }
  }, [user])

  async function loadReporte() {
    setLoading(true)
    try {
      const data = await reportes.getDia()
      setReporte(data)
    } catch (e) {
      // Error loading report
    } finally {
      setLoading(false)
    }
  }

  async function copiarReporte() {
    setLoading(true)
    try {
      const data = await reportes.copiar()
      if (data.success && data.reporte) {
        await navigator.clipboard.writeText(data.reporte)
        setCopied(true)
        setTimeout(() => setCopied(false), 3000)
      }
    } catch (e) {
      alert(e.message)
    } finally {
      setLoading(false)
    }
  }

  if (user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-64">
        <p style={{ color: '#64748b' }}>No tienes acceso a esta página</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h2 className="text-2xl font-bold" style={{ color: '#0f172a' }}>Reportes Diarios</h2>
        <div className="flex gap-2">
          <button onClick={loadReporte} disabled={loading} className="btn focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500" style={{ border: '1px solid #e2e8f0' }}>
            Actualizar
          </button>
          <button onClick={copiarReporte} disabled={loading} className="btn btn-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500">
            {copied ? 'Copiado' : 'Copiar Reporte'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8" style={{ borderColor: '#2563eb', borderBottomColor: 'transparent' }}></div>
        </div>
      ) : reporte ? (
        <>
          {/* Información del día */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="p-6 rounded-2xl" style={{ background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              <p className="text-sm" style={{ color: '#64748b' }}>Fecha</p>
              <p className="text-xl font-bold" style={{ color: '#0f172a' }}>{reporte.fecha}</p>
            </div>
            <div className="p-6 rounded-2xl" style={{ background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              <p className="text-sm" style={{ color: '#64748b' }}>Rutas Garantizadas</p>
              <p className="text-3xl font-bold" style={{ color: '#10b981' }}>{reporte.garantizadas}</p>
            </div>
            <div className="p-6 rounded-2xl" style={{ background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              <p className="text-sm" style={{ color: '#64748b' }}>Rutas Pendientes</p>
              <p className="text-3xl font-bold" style={{ color: reporte.pendientes > 0 ? '#ef4444' : '#10b981' }}>{reporte.pendientes}</p>
            </div>
          </div>

          {/* Preview del reporte */}
          <div className="rounded-2xl p-6" style={{ background: '#0f172a' }}>
            <h3 className="text-lg font-semibold mb-4 text-white">Vista Previa del Reporte</h3>
            <pre 
              className="text-sm whitespace-pre-wrap text-gray-300 font-mono"
              style={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}
            >
              {reporte.reporte_texto}
            </pre>
          </div>

          {/* Detalle de rutas */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4" style={{ color: '#0f172a' }}>Detalle de Rutas</h3>
            <div className="grid-cards">
              {(reporte.rutas || []).map((ruta, i) => (
                <div 
                  key={i} 
                  className="p-4 rounded-xl"
                  style={{ 
                    background: ruta.chofer !== 'Sin asignar' ? '#f0fdf4' : '#fef2f2',
                    borderLeft: `4px solid ${ruta.chofer !== 'Sin asignar' ? '#10b981' : '#ef4444'}`
                  }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium" style={{ color: '#0f172a' }}>{ruta.ruta}</p>
                      <p className="text-sm" style={{ color: '#64748b' }}>{ruta.hora}</p>
                    </div>
                    <span 
                      className="badge"
                      style={{ 
                        background: ruta.chofer !== 'Sin asignar' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                        color: ruta.chofer !== 'Sin asignar' ? '#10b981' : '#ef4444'
                      }}
                    >
                      {ruta.chofer !== 'Sin asignar' ? 'Garantizada' : 'Pendiente'}
                    </span>
                  </div>
                  <div className="text-sm" style={{ color: '#64748b' }}>
                    <p>Chofer: {ruta.chofer}</p>
                    <p>Ómnibus: {ruta.omnibus}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Horarios info */}
          <div className="mt-6 p-4 rounded-xl" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <h4 className="font-medium mb-2" style={{ color: '#0f172a' }}>Información</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm" style={{ color: '#64748b' }}>
              <p><strong>Horario mañana:</strong> 6:30 AM</p>
              <p><strong>Horario tarde:</strong> 5:15 PM</p>
              <p><strong>Días:</strong> Lunes a viernes</p>
            </div>
          </div>
        </>
      ) : (
        <div className="flex justify-center py-16">
          <p style={{ color: '#64748b' }}>No hay datos disponibles</p>
        </div>
      )}
    </div>
  )
}