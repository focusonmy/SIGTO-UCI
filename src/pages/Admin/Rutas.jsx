import { useState, useEffect } from 'react'
import { addRuta, updateRuta, deleteRuta, getRutas as getRutasData } from '../../data/api'
import MapaRuta from '../../components/MapaRuta'
import ConfirmModal from '../../components/ConfirmModal'
import Toast from '../../components/Toast'

const initialForm = {
  nombre: '',
  origen: '',
  destino: '',
  distancia: '',
  duracion_estimada: '',
  puntos_json: [],
  observacion: ''
}

function validateForm(form) {
  const errors = {}
  if (!form.nombre || !form.nombre.trim()) {
    errors.nombre = 'El nombre es requerido'
  }
  if (!form.origen || !form.origen.trim()) {
    errors.origen = 'El origen es requerido'
  }
  if (!form.destino || !form.destino.trim()) {
    errors.destino = 'El destino es requerido'
  }
  return errors
}

export default function Rutas() {
  const [rutas, setRutas] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(initialForm)
  const [search, setSearch] = useState('')
  const [sortAsc, setSortAsc] = useState(null)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null, nombre: '' })
  const [toast, setToast] = useState({ open: false, message: '', type: 'success' })
  const [errorModal, setErrorModal] = useState({ open: false, message: '' })
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    setLoadError('')
    try {
      const rutasData = await getRutasData()
      setRutas(rutasData || [])
    } catch (e) {
      setLoadError(e.message || 'Error al cargar datos')
      setRutas([])
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    const errors = validateForm(form)
    if (Object.keys(errors).length > 0) {
      setErrors(errors)
      return
    }

    const formData = {
      nombre: form.nombre.trim(),
      origen: form.origen.trim(),
      destino: form.destino.trim(),
      distancia: form.distancia || null,
      duracion_estimada: form.duracion_estimada || null,
      puntos_json: form.puntos_json || [],
      observacion: form.observacion || null
    }
    setLoading(true)
    try {
      if (editingId) {
        await updateRuta(editingId, formData)
      } else {
        await addRuta(formData)
      }
      await loadData()
      setShowModal(false)
      setForm(initialForm)
      setEditingId(null)
      setErrors({})
      setToast({ open: true, message: editingId ? 'Ruta actualizada exitosamente' : 'Ruta creada exitosamente', type: 'success' })
    } catch (e) {
      setErrorModal({ open: true, message: e.message || 'Error al guardar' })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (ruta) => {
    setEditingId(ruta.id)
    setForm({
      nombre: ruta.nombre || '',
      origen: ruta.origen || '',
      destino: ruta.destino || '',
      distancia: ruta.distancia || '',
      duracion_estimada: ruta.duracion_estimada || '',
      puntos_json: ruta.puntos_json || [],
      observacion: ruta.observacion || ''
    })
    setShowModal(true)
  }

  const handleDelete = async () => {
    try {
      await deleteRuta(deleteModal.id)
      await loadData()
      setDeleteModal({ open: false, id: null, nombre: '' })
      setToast({ open: true, message: 'Ruta eliminada exitosamente', type: 'success' })
    } catch (e) {
      setDeleteModal({ open: false, id: null, nombre: '' })
      setErrorModal({ open: true, message: e.message || 'Error al eliminar' })
    }
  }

  const confirmDelete = (ruta) => {
    setDeleteModal({ open: true, id: ruta.id, nombre: ruta.nombre })
  }

  let filteredRutas = rutas.filter(r =>
    (r.nombre || '').toLowerCase().includes(search.toLowerCase()) ||
    (r.origen || '').toLowerCase().includes(search.toLowerCase())
  )
  if (sortAsc !== null) {
    filteredRutas = [...filteredRutas].sort((a, b) =>
      sortAsc
        ? (a.nombre || '').localeCompare(b.nombre || '')
        : (b.nombre || '').localeCompare(a.nombre || '')
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold" style={{ color: '#0f172a' }}>Rutas</h2>
        <button
          onClick={() => { setShowModal(true); setForm(initialForm); setEditingId(null); setErrors({}) }}
          className="px-4 py-2 rounded-lg font-medium text-white"
          style={{ background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)' }}
        >
          + Nueva Ruta
        </button>
      </div>

      <div className="flex gap-4 mb-4">
        <input
          type="text"
          placeholder="Buscar rutas..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 max-w-xs px-4 py-2 rounded-lg"
          style={{ border: '1px solid #e2e8f0' }}
        />
        <button
          onClick={() => setSortAsc(prev => prev === null ? true : prev ? false : null)}
          title="Ordenar alfabéticamente"
          className="px-3 py-2 rounded-lg text-sm font-medium"
          style={{
            border: '1px solid #e2e8f0',
            color: sortAsc !== null ? '#2563eb' : '#64748b',
            background: sortAsc !== null ? 'rgba(37, 99, 235, 0.05)' : 'transparent'
          }}
        >
          {sortAsc === null ? 'A-Z ↕' : sortAsc ? 'A-Z ↑' : 'Z-A ↓'}
        </button>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ background: '#f8fafc' }}>
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium" style={{ color: '#64748b' }}>Nombre</th>
                <th className="px-4 py-3 text-left text-sm font-medium" style={{ color: '#64748b' }}>Trayecto</th>
                <th className="px-4 py-3 text-left text-sm font-medium" style={{ color: '#64748b' }}>Distancia</th>
                <th className="px-4 py-3 text-left text-sm font-medium" style={{ color: '#64748b' }}>Duración</th>
                <th className="px-4 py-3 text-right text-sm font-medium" style={{ color: '#64748b' }}>Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: '#e2e8f0' }}>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center" style={{ color: '#64748b' }}>
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6" style={{ borderColor: '#2563eb', borderBottomColor: 'transparent', borderWidth: '2px' }}></div>
                    </div>
                  </td>
                </tr>
              ) : loadError ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center" style={{ color: '#ef4444' }}>
                    Error: {loadError}
                  </td>
                </tr>
              ) : filteredRutas.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center" style={{ color: '#64748b' }}>
                    No hay rutas disponibles
                  </td>
                </tr>
              ) : (
                filteredRutas.map(ruta => (
                <tr key={ruta.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium" style={{ color: '#0f172a' }}>{ruta.nombre}</td>
                  <td className="px-4 py-3" style={{ color: '#64748b' }}>
                    {ruta.origen} → {ruta.destino}
                  </td>
                  <td className="px-4 py-3" style={{ color: '#64748b' }}>{ruta.distancia || '-'}</td>
                  <td className="px-4 py-3" style={{ color: '#64748b' }}>{ruta.duracion_estimada || '-'}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleEdit(ruta)} className="mr-3 text-sm" style={{ color: '#2563eb' }}>Editar</button>
                    <button onClick={() => confirmDelete(ruta)} className="text-sm" style={{ color: '#ef4444' }}>Eliminar</button>
                  </td>
                </tr>
              )))}

            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" style={{ overscrollBehavior: 'contain' }}>
            <h3 id="modal-title" className="text-xl font-bold mb-4" style={{ color: '#0f172a' }}>
              {editingId ? 'Editar Ruta' : 'Nueva Ruta'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>Nombre de la Ruta *</label>
                <input type="text" value={form.nombre} onChange={e => setForm(prev => ({ ...prev, nombre: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg" style={{ border: '1px solid #e2e8f0' }} />
                {errors.nombre && <p className="text-sm mt-1" style={{ color: '#ef4444' }}>{errors.nombre}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>Origen *</label>
                  <input type="text" value={form.origen} onChange={e => setForm(prev => ({ ...prev, origen: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg" style={{ border: '1px solid #e2e8f0' }} />
                  {errors.origen && <p className="text-sm mt-1" style={{ color: '#ef4444' }}>{errors.origen}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>Destino *</label>
                  <input type="text" value={form.destino} onChange={e => setForm(prev => ({ ...prev, destino: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg" style={{ border: '1px solid #e2e8f0' }} />
                  {errors.destino && <p className="text-sm mt-1" style={{ color: '#ef4444' }}>{errors.destino}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>Distancia</label>
                  <input type="text" value={form.distancia} onChange={e => setForm(prev => ({ ...prev, distancia: e.target.value }))}
                    placeholder="ej: 5.2 km"
                    className="w-full px-3 py-2 rounded-lg" style={{ border: '1px solid #e2e8f0' }} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>Duración Estimada</label>
                  <input type="text" value={form.duracion_estimada} onChange={e => setForm(prev => ({ ...prev, duracion_estimada: e.target.value }))}
                    placeholder="ej: 15 min"
                    className="w-full px-3 py-2 rounded-lg" style={{ border: '1px solid #e2e8f0' }} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>Puntos del Recorrido (para mapa)</label>
                <div className="mb-2 p-3 rounded-lg" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <p className="text-xs mb-2" style={{ color: '#64748b' }}>
                    Agregue puntos en formato: Nombre, latitud, longitud
                  </p>
                  {(form.puntos_json || []).map((punto, i) => (
                    <div key={i} className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-medium" style={{ color: '#2563eb' }}>{i + 1}.</span>
                      <input
                        type="text"
                        value={punto.nombre || ''}
                        onChange={e => {
                          const nuevos = [...(form.puntos_json || [])]
                          nuevos[i] = { ...nuevos[i], nombre: e.target.value }
                          setForm(prev => ({ ...prev, puntos_json: nuevos }))
                        }}
                        placeholder="Nombre del punto"
                        className="flex-1 px-2 py-1 text-sm rounded"
                        style={{ border: '1px solid #e2e8f0' }}
                      />
                      <input
                        type="number"
                        step="0.000001"
                        value={punto.lat || ''}
                        onChange={e => {
                          const nuevos = [...(form.puntos_json || [])]
                          nuevos[i] = { ...nuevos[i], lat: parseFloat(e.target.value) }
                          setForm(prev => ({ ...prev, puntos_json: nuevos }))
                        }}
                        placeholder="Lat"
                        className="w-24 px-2 py-1 text-sm rounded"
                        style={{ border: '1px solid #e2e8f0' }}
                      />
                      <input
                        type="number"
                        step="0.000001"
                        value={punto.lng || ''}
                        onChange={e => {
                          const nuevos = [...(form.puntos_json || [])]
                          nuevos[i] = { ...nuevos[i], lng: parseFloat(e.target.value) }
                          setForm(prev => ({ ...prev, puntos_json: nuevos }))
                        }}
                        placeholder="Lng"
                        className="w-24 px-2 py-1 text-sm rounded"
                        style={{ border: '1px solid #e2e8f0' }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const nuevos = (form.puntos_json || []).filter((_, idx) => idx !== i)
                          setForm(prev => ({ ...prev, puntos_json: nuevos }))
                        }}
                        className="text-red-500 text-sm"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, puntos_json: [...(form.puntos_json || []), { nombre: '', lat: 23.1136, lng: -82.3666 }] }))}
                    className="text-sm"
                    style={{ color: '#2563eb' }}
                  >
                    + Agregar punto
                  </button>
                </div>
                {(form.puntos_json || []).length > 0 && (
                  <MapaRuta puntos={form.puntos_json} altura="200px" />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>Observación</label>
                <textarea value={form.observacion} onChange={e => setForm(prev => ({ ...prev, observacion: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg" style={{ border: '1px solid #e2e8f0' }} />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500" style={{ border: '1px solid #e2e8f0' }}>Cancelar</button>
              <button type="button" onClick={handleSave} disabled={loading} className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500" style={{ background: '#2563eb', color: 'white', padding: '8px 16px', borderRadius: '6px' }}>
                {loading ? 'Guardando…' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteModal.open}
        title="Eliminar Ruta"
        message={`¿Está seguro de eliminar la ruta "${deleteModal.nombre}"? Esta acción no se puede deshacer.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteModal({ open: false, id: null, nombre: '' })}
      />

      <ConfirmModal
        isOpen={errorModal.open}
        title="Error"
        message={errorModal.message}
        onConfirm={() => setErrorModal({ open: false, message: '' })}
        onCancel={() => setErrorModal({ open: false, message: '' })}
        confirmLabel="Aceptar"
        type="warning"
      />

      {toast.open && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast({ open: false, message: '', type: 'success' })} />
      )}
    </div>
  )
}