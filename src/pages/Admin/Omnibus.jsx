import { useState, useEffect } from 'react'
import { omnibus as API } from '../../data/apiClient'
import ConfirmModal from '../../components/ConfirmModal'
import Toast from '../../components/Toast'

const initialForm = {
  placa: '',
  marca: '',
  modelo: '',
  anio: '',
  capacidad: 40,
  tipo: 'estandar',
  seguro: '',
  fecha_venc_seguro: '',
  estado: 'disponible'
}

function validateForm(form) {
  const errors = {}
  if (!form.placa || !form.placa.trim()) {
    errors.placa = 'La placa es requerida'
  }
  if (!form.marca || !form.marca.trim()) {
    errors.marca = 'La marca es requerida'
  }
  if (!form.seguro || !form.seguro.trim()) {
    errors.seguro = 'El seguro es requerido'
  }
  if (!form.fecha_venc_seguro) {
    errors.fecha_venc_seguro = 'La fecha de vencimiento es requerida'
  }
  return errors
}

export default function Omnibus() {
  const [omnibus, setOmnibus] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(initialForm)
  const [search, setSearch] = useState('')
  const [sortAsc, setSortAsc] = useState(null)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null, nombre: '' })
  const [toast, setToast] = useState({ open: false, message: '', type: 'success' })
  const [errorModal, setErrorModal] = useState({ open: false, message: '' })

  useEffect(() => {
    loadOmnibus()
  }, [])

  async function loadOmnibus() {
    try {
      const data = await API.getAll()
      setOmnibus(data || [])
    } catch (e) {
      // Error loading
    }
  }

  const handleSave = async () => {
    const errors = validateForm(form)
    if (Object.keys(errors).length > 0) {
      setErrors(errors)
      return
    }
    setLoading(true)
    try {
      if (editingId) {
        await API.update(editingId, form)
      } else {
        await API.create(form)
      }
      await loadOmnibus()
      setShowModal(false)
      setForm(initialForm)
      setEditingId(null)
      setErrors({})
      setToast({ open: true, message: editingId ? 'Ómnibus actualizado exitosamente' : 'Ómnibus creado exitosamente', type: 'success' })
    } catch (e) {
      setErrorModal({ open: true, message: e.message || 'Error al guardar' })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (omn) => {
    setEditingId(omn.id)
    setForm({
      placa: omn.placa || '',
      marca: omn.marca || '',
      modelo: omn.modelo || '',
      anio: omn.anio || '',
      capacidad: omn.capacidad || 40,
      tipo: omn.tipo || 'estandar',
      seguro: omn.seguro || '',
      fecha_venc_seguro: omn.fecha_venc_seguro || '',
      estado: omn.estado || 'disponible'
    })
    setShowModal(true)
  }

  const handleDelete = async () => {
    try {
      await API.delete(deleteModal.id)
      await loadOmnibus()
      setDeleteModal({ open: false, id: null, nombre: '' })
      setToast({ open: true, message: 'Ómnibus eliminado exitosamente', type: 'success' })
    } catch (e) {
      setDeleteModal({ open: false, id: null, nombre: '' })
      setErrorModal({ open: true, message: e.message || 'Error al eliminar' })
    }
  }

  const confirmDelete = (omn) => {
    setDeleteModal({ open: true, id: omn.id, nombre: `${omn.placa} - ${omn.marca}` })
  }

  const getEstadoBadge = (estado) => {
    const colors = {
      disponible: { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981' },
      en_servicio: { bg: 'rgba(37, 99, 235, 0.1)', color: '#2563eb' },
      mantenimiento: { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }
    }
    return colors[estado] || colors.disponible
  }

  let filtered = omnibus.filter(o =>
    (o.placa || '').toLowerCase().includes(search.toLowerCase()) ||
    (o.marca || '').toLowerCase().includes(search.toLowerCase())
  )
  if (sortAsc !== null) {
    filtered = [...filtered].sort((a, b) =>
      sortAsc
        ? (a.placa || '').localeCompare(b.placa || '')
        : (b.placa || '').localeCompare(a.placa || '')
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold" style={{ color: '#0f172a' }}>Ómnibus</h2>
        <button
          onClick={() => { setShowModal(true); setForm(initialForm); setEditingId(null); setErrors({}) }}
          className="px-4 py-2 rounded-lg font-medium text-white"
          style={{ background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)' }}
        >
          + Nuevo Ómnibus
        </button>
      </div>

      <div className="mb-4 flex items-center gap-3">
        <input
          type="text"
          placeholder="Buscar ómnibus..."
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
                <th className="px-4 py-3 text-left text-sm font-medium" style={{ color: '#64748b' }}>Placa</th>
                <th className="px-4 py-3 text-left text-sm font-medium" style={{ color: '#64748b' }}>Marca/Modelo</th>
                <th className="px-4 py-3 text-left text-sm font-medium" style={{ color: '#64748b' }}>Capacidad</th>
                <th className="px-4 py-3 text-left text-sm font-medium" style={{ color: '#64748b' }}>Tipo</th>
                <th className="px-4 py-3 text-left text-sm font-medium" style={{ color: '#64748b' }}>Estado</th>
                <th className="px-4 py-3 text-right text-sm font-medium" style={{ color: '#64748b' }}>Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: '#e2e8f0' }}>
              {filtered.map(omn => (
                <tr key={omn.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium" style={{ color: '#0f172a' }}>{omn.placa}</td>
                  <td className="px-4 py-3" style={{ color: '#64748b' }}>{omn.marca} {omn.modelo}</td>
                  <td className="px-4 py-3" style={{ color: '#64748b' }}>{omn.capacidad}</td>
                  <td className="px-4 py-3 capitalize" style={{ color: '#64748b' }}>{omn.tipo}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 rounded-full text-xs font-medium" style={getEstadoBadge(omn.estado)}>
                      {omn.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleEdit(omn)} className="mr-3 text-sm" style={{ color: '#2563eb' }}>Editar</button>
                    <button onClick={() => confirmDelete(omn)} className="text-sm" style={{ color: '#ef4444' }}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" style={{ overscrollBehavior: 'contain' }}>
            <h3 id="modal-title" className="text-xl font-bold mb-4" style={{ color: '#0f172a' }}>
              {editingId ? 'Editar Ómnibus' : 'Nuevo Ómnibus'}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="placa" className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>Placa *</label>
                <input id="placa" type="text" value={form.placa} onChange={e => setForm(prev => ({ ...prev, placa: e.target.value.toUpperCase() }))}
                  className="w-full px-3 py-2 rounded-lg" style={{ border: '1px solid #e2e8f0' }} />
                {errors.placa && <p className="text-sm mt-1" style={{ color: '#ef4444' }}>{errors.placa}</p>}
              </div>
              <div>
                <label htmlFor="marca" className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>Marca *</label>
                <input id="marca" type="text" value={form.marca} onChange={e => setForm(prev => ({ ...prev, marca: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg" style={{ border: '1px solid #e2e8f0' }} />
                {errors.marca && <p className="text-sm mt-1" style={{ color: '#ef4444' }}>{errors.marca}</p>}
              </div>
              <div>
<label htmlFor="modelo" className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>Modelo</label>
                <input id="modelo" type="text" value={form.modelo} onChange={e => setForm(prev => ({ ...prev, modelo: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg" style={{ border: '1px solid #e2e8f0' }} />
              </div>
              <div>
                <label htmlFor="anio" className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>Año</label>
                <input id="anio" type="number" value={form.anio} onChange={e => setForm(prev => ({ ...prev, anio: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg" style={{ border: '1px solid #e2e8f0' }} />
              </div>
              <div>
                <label htmlFor="capacidad" className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>Capacidad</label>
                <select id="capacidad" value={form.capacidad} onChange={e => setForm(prev => ({ ...prev, capacidad: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 rounded-lg" style={{ border: '1px solid #e2e8f0' }}>
                  {[20, 25, 30, 35, 40, 45, 50].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="tipo" className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>Tipo</label>
                <select id="tipo" value={form.tipo} onChange={e => setForm(prev => ({ ...prev, tipo: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg" style={{ border: '1px solid #e2e8f0' }}>
                  <option value="estandar">Estándar</option>
                  <option value="semicama">Semi Cama</option>
                  <option value="cama">Cama</option>
                </select>
              </div>
              <div>
                <label htmlFor="estado" className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>Estado</label>
                <select id="estado" value={form.estado} onChange={e => setForm(prev => ({ ...prev, estado: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg" style={{ border: '1px solid #e2e8f0' }}>
                  <option value="disponible">Disponible</option>
                  <option value="en_servicio">En Servicio</option>
                  <option value="mantenimiento">Mantenimiento</option>
                </select>
              </div>
              <div>
                <label htmlFor="seguro" className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>Seguro *</label>
                <input id="seguro" type="text" value={form.seguro} onChange={e => setForm(prev => ({ ...prev, seguro: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg" style={{ border: '1px solid #e2e8f0' }} />
                {errors.seguro && <p className="text-sm mt-1" style={{ color: '#ef4444' }}>{errors.seguro}</p>}
              </div>
              <div className="col-span-2">
                <label htmlFor="fecha_venc_seguro" className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>Vencimiento Seguro *</label>
                <input id="fecha_venc_seguro" type="date" value={form.fecha_venc_seguro} onChange={e => setForm(prev => ({ ...prev, fecha_venc_seguro: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg" style={{ border: '1px solid #e2e8f0' }} />
                {errors.fecha_venc_seguro && <p className="text-sm mt-1" style={{ color: '#ef4444' }}>{errors.fecha_venc_seguro}</p>}
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg" style={{ border: '1px solid #e2e8f0' }}>Cancelar</button>
              <button onClick={handleSave} disabled={loading} className="px-4 py-2 rounded-lg text-white" style={{ background: '#2563eb' }}>
                {loading ? 'Guardando…' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteModal.open}
        title="Eliminar Ómnibus"
        message={`¿Está seguro de eliminar el ómnibus "${deleteModal.nombre}"? Esta acción no se puede deshacer.`}
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