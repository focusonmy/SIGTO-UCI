import { useState, useEffect } from 'react'
import { getHistorialAsignaciones, getChoferes, getOmnibus } from '../../data/api'
import Toast from '../../components/Toast'

const ITEMS_PER_PAGE = 20

function getHorarioGrupo(hora) {
  if (!hora) return ''
  const h = hora.substring(0, 5)
  return h === '06:45' ? 'manana' : 'tarde'
}

function getHorarioLabel(hora) {
  if (!hora) return ''
  const h = hora.substring(0, 5)
  return h === '06:45' ? 'Mañana (06:45)' : 'Tarde (17:15)'
}

function PageNumbers({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null
  const pages = []
  const maxVisible = 5
  let startPage = Math.max(1, currentPage - 2)
  let endPage = Math.min(totalPages, startPage + maxVisible - 1)
  if (endPage - startPage < maxVisible - 1) {
    startPage = Math.max(1, endPage - maxVisible + 1)
  }
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i)
  }
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="px-3 py-1 rounded text-sm"
        style={{
          border: '1px solid #e2e8f0',
          color: currentPage === 1 ? '#94a3b8' : '#2563eb',
          cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
          background: 'transparent'
        }}
      >
        &lt;
      </button>
      {startPage > 1 && (
        <>
          <button onClick={() => onPageChange(1)} className="px-3 py-1 rounded text-sm" style={{ border: '1px solid #e2e8f0', color: '#2563eb', background: 'transparent' }}>1</button>
          {startPage > 2 && <span className="px-1" style={{ color: '#64748b' }}>...</span>}
        </>
      )}
      {pages.map(p => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className="px-3 py-1 rounded text-sm"
          style={{
            border: '1px solid #e2e8f0',
            background: p === currentPage ? '#2563eb' : 'transparent',
            color: p === currentPage ? '#ffffff' : '#2563eb'
          }}
        >
          {p}
        </button>
      ))}
      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <span className="px-1" style={{ color: '#64748b' }}>...</span>}
          <button onClick={() => onPageChange(totalPages)} className="px-3 py-1 rounded text-sm" style={{ border: '1px solid #e2e8f0', color: '#2563eb', background: 'transparent' }}>{totalPages}</button>
        </>
      )}
      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="px-3 py-1 rounded text-sm"
        style={{
          border: '1px solid #e2e8f0',
          color: currentPage === totalPages ? '#94a3b8' : '#2563eb',
          cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
          background: 'transparent'
        }}
      >
        &gt;
      </button>
    </div>
  )
}

export default function Historial() {
  const [historial, setHistorial] = useState([])
  const [choferes, setChoferes] = useState([])
  const [omnibus, setOmnibus] = useState([])
  const [filters, setFilters] = useState({ fecha: '', mes: '', chofer_id: '', omnibus_id: '' })
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState({ open: false, message: '', type: 'success' })

  useEffect(() => {
    loadFiltros()
    buscar()
  }, [])

  async function loadFiltros() {
    try {
      const [ch, om] = await Promise.all([getChoferes(), getOmnibus()])
      setChoferes(ch || [])
      setOmnibus(om || [])
    } catch {
    }
  }

  async function buscar() {
    setLoading(true)
    try {
      const params = {}
      if (filters.fecha) params.fecha = filters.fecha
      if (filters.mes) params.mes = filters.mes
      if (filters.chofer_id) params.chofer_id = filters.chofer_id
      if (filters.omnibus_id) params.omnibus_id = filters.omnibus_id

      const data = await getHistorialAsignaciones(params)
      setHistorial(data.historial || [])
      setTotalCount(data.historial?.length || 0)
      setCurrentPage(1)
    } catch (e) {
      setToast({ open: true, message: e.message || 'Error al cargar historial', type: 'error' })
      setHistorial([])
      setTotalCount(0)
    } finally {
      setLoading(false)
    }
  }

  function limpiarFiltros() {
    setFilters({ fecha: '', mes: '', chofer_id: '', omnibus_id: '' })
    setCurrentPage(1)
    setTimeout(() => buscar(), 0)
  }

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)
  const paginated = historial.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const startItem = totalCount === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1
  const endItem = Math.min(currentPage * ITEMS_PER_PAGE, totalCount)

  function handlePageChange(page) {
    setCurrentPage(page)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h2 className="text-2xl font-bold" style={{ color: '#0f172a' }}>Historial de Asignaciones</h2>
      </div>

      <div className="rounded-2xl p-4 mb-6" style={{ background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>Fecha</label>
            <input
              type="date"
              value={filters.fecha}
              onChange={e => setFilters({ ...filters, fecha: e.target.value, mes: '' })}
              className="w-full px-3 py-2 rounded-lg text-sm"
              style={{ border: '1px solid #e2e8f0' }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>Mes / Año</label>
            <input
              type="month"
              value={filters.mes}
              onChange={e => setFilters({ ...filters, mes: e.target.value, fecha: '' })}
              className="w-full px-3 py-2 rounded-lg text-sm"
              style={{ border: '1px solid #e2e8f0' }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>Chofer</label>
            <select
              value={filters.chofer_id}
              onChange={e => setFilters({ ...filters, chofer_id: e.target.value })}
              className="w-full px-3 py-2 rounded-lg text-sm"
              style={{ border: '1px solid #e2e8f0' }}
            >
              <option value="">Todos</option>
              {choferes.map(c => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>Ómnibus</label>
            <select
              value={filters.omnibus_id}
              onChange={e => setFilters({ ...filters, omnibus_id: e.target.value })}
              className="w-full px-3 py-2 rounded-lg text-sm"
              style={{ border: '1px solid #e2e8f0' }}
            >
              <option value="">Todos</option>
              {omnibus.map(o => (
                <option key={o.id} value={o.id}>{o.placa}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex gap-3 mt-4">
          <button
            onClick={buscar}
            disabled={loading}
            className="px-4 py-2 rounded-lg font-medium text-white text-sm"
            style={{ background: '#2563eb' }}
          >
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
          <button
            onClick={limpiarFiltros}
            className="px-4 py-2 rounded-lg font-medium text-sm"
            style={{ border: '1px solid #e2e8f0', color: '#64748b' }}
          >
            Limpiar
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <p className="text-sm" style={{ color: '#64748b' }}>
          {totalCount === 0
            ? 'Sin resultados'
            : `Mostrando ${startItem}-${endItem} de ${totalCount} resultado(s)`
          }
        </p>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ background: '#f8fafc' }}>
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium" style={{ color: '#64748b' }}>Fecha</th>
                <th className="px-4 py-3 text-left text-sm font-medium" style={{ color: '#64748b' }}>Horario</th>
                <th className="px-4 py-3 text-left text-sm font-medium" style={{ color: '#64748b' }}>Ruta</th>
                <th className="px-4 py-3 text-left text-sm font-medium" style={{ color: '#64748b' }}>Trayecto</th>
                <th className="px-4 py-3 text-left text-sm font-medium" style={{ color: '#64748b' }}>Chofer</th>
                <th className="px-4 py-3 text-left text-sm font-medium" style={{ color: '#64748b' }}>Ómnibus</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: '#e2e8f0' }}>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center" style={{ color: '#64748b' }}>
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6" style={{ borderColor: '#2563eb', borderBottomColor: 'transparent', borderWidth: '2px' }}></div>
                    </div>
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center" style={{ color: '#64748b' }}>
                    No hay asignaciones registradas
                  </td>
                </tr>
              ) : (
                paginated.map((item, i) => (
                  <tr key={`${item.fecha}-${item.ruta}-${item.hora}`} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium" style={{ color: '#0f172a' }}>{item.fecha}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded-full text-xs font-medium"
                        style={{
                          background: item.estado === 'garantizada' ? 'rgba(37, 99, 235, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                          color: item.estado === 'garantizada' ? '#2563eb' : '#f59e0b'
                        }}
                      >
                        {getHorarioLabel(item.hora)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: '#0f172a' }}>{item.ruta}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: '#64748b' }}>{item.origen} → {item.destino}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: '#64748b' }}>{item.chofer || '-'}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: '#64748b' }}>{item.omnibus || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-4">
          <PageNumbers currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
        </div>
      )}

      {toast.open && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast({ open: false, message: '', type: 'success' })} />
      )}
    </div>
  )
}