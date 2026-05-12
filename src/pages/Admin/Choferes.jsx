import { useState, useEffect } from 'react'
import { choferes as API } from '../../data/apiClient'
import ConfirmModal from '../../components/ConfirmModal'
import Toast from '../../components/Toast'

const initialForm = {
  cedula: '',
  nombre: '',
  telefono: '',
  licencia: '',
  fecha_venc_licencia: '',
  observacion: '',
  username: '',
  password: ''
}

function validateForm(form, isEditing) {
  const errors = {}
  if (!form.cedula || !form.cedula.trim()) {
    errors.cedula = 'La cédula es requerida'
  } else if (!/^\d+$/.test(form.cedula.trim())) {
    errors.cedula = 'La cédula solo puede tener números'
  }
  if (!form.nombre || !form.nombre.trim()) {
    errors.nombre = 'El nombre es requerido'
  } else if (/\d/.test(form.nombre)) {
    errors.nombre = 'El nombre no puede tener números'
  } else if (form.nombre.trim().length < 2) {
    errors.nombre = 'El nombre debe tener al menos 2 caracteres'
  }
  if (!form.telefono || !form.telefono.trim()) {
    errors.telefono = 'El teléfono es requerido'
  } else if (!/^\d{8}$/.test(form.telefono.trim())) {
    errors.telefono = 'El teléfono debe tener 8 dígitos'
  }
  if (!form.licencia || !form.licencia.trim()) {
    errors.licencia = 'La licencia es requerida'
  }
  if (!form.fecha_venc_licencia) {
    errors.fecha_venc_licencia = 'La fecha de vencimiento es requerida'
  }
  if (!isEditing) {
    if (!form.username || !form.username.trim()) {
      errors.username = 'El nombre de usuario es requerido'
    } else if (form.username.trim().length < 3) {
      errors.username = 'El nombre de usuario debe tener al menos 3 caracteres'
    } else if (!/^[a-zA-Z0-9_]+$/.test(form.username.trim())) {
      errors.username = 'Solo letras, números y guiones bajos'
    }
    if (!form.password || form.password.length < 8) {
      errors.password = 'Mínimo 8 caracteres'
    } else if (!/[A-Z]/.test(form.password)) {
      errors.password = 'Debe tener al menos una mayúscula'
    } else if (!/[a-z]/.test(form.password)) {
      errors.password = 'Debe tener al menos una minúscula'
    } else if (!/[0-9]/.test(form.password)) {
      errors.password = 'Debe tener al menos un número'
    } else if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(form.password)) {
      errors.password = 'Debe tener al menos un carácter especial'
    }
  } else {
    if (form.password && form.password.length > 0) {
      if (form.password.length < 8) {
        errors.password = 'Mínimo 8 caracteres'
      } else if (!/[A-Z]/.test(form.password)) {
        errors.password = 'Debe tener al menos una mayúscula'
      } else if (!/[a-z]/.test(form.password)) {
        errors.password = 'Debe tener al menos una minúscula'
      } else if (!/[0-9]/.test(form.password)) {
        errors.password = 'Debe tener al menos un número'
      } else if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(form.password)) {
        errors.password = 'Debe tener al menos un carácter especial'
      }
    }
  }
  return errors
}

export default function Choferes() {
  const [choferes, setChoferes] = useState([])
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
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    loadChoferes()
  }, [])

  async function loadChoferes() {
    try {
      const data = await API.getAll()
      setChoferes(data || [])
    } catch (e) {
      // Error loading choferes data
    }
  }

  const handleSave = async () => {
    const errors = validateForm(form, !!editingId)
    if (Object.keys(errors).length > 0) {
      setErrors(errors)
      return
    }
    
    const formData = {
      cedula: form.cedula.trim(),
      nombre: form.nombre.trim(),
      telefono: form.telefono.trim() ? `+53${form.telefono.trim()}` : null,
      licencia: form.licencia || null,
      fecha_venc_licencia: form.fecha_venc_licencia || null,
      observacion: form.observacion || null
    }

    if (editingId) {
      if (form.username !== undefined && form.username !== null) {
        formData.username = form.username.trim()
      }
      if (form.password && form.password.length > 0) {
        formData.password = form.password
      }
    } else {
      formData.username = form.username.trim()
      formData.password = form.password
    }
    
    setLoading(true)
    try {
      if (editingId) {
        await API.update(editingId, formData)
      } else {
        await API.create(formData)
      }
      await loadChoferes()
      setShowModal(false)
      setForm(initialForm)
      setEditingId(null)
      setErrors({})
      setToast({ open: true, message: editingId ? 'Conductor actualizado exitosamente' : 'Conductor creado exitosamente', type: 'success' })
    } catch (e) {
      setErrorModal({ open: true, message: e.message || 'Error al guardar' })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (chofer) => {
    setEditingId(chofer.id)
    setForm({
      cedula: chofer.cedula || '',
      nombre: chofer.nombre || '',
      telefono: chofer.telefono?.replace('+53', '') || '',
      licencia: chofer.licencia || '',
      fecha_venc_licencia: chofer.fecha_venc_licencia || '',
      observacion: chofer.observacion || '',
      username: chofer.usuario?.username || '',
      password: ''
    })
    setShowModal(true)
  }

  const handleDelete = async () => {
    try {
      await API.delete(deleteModal.id)
      await loadChoferes()
      setDeleteModal({ open: false, id: null, nombre: '' })
      setToast({ open: true, message: 'Conductor eliminado exitosamente', type: 'success' })
    } catch (e) {
      setDeleteModal({ open: false, id: null, nombre: '' })
      setErrorModal({ open: true, message: e.message || 'Error al eliminar' })
    }
  }

  const confirmDelete = (chofer) => {
    setDeleteModal({ open: true, id: chofer.id, nombre: chofer.nombre })
  }

  let filtered = [...choferes].filter(c =>
    c.nombre?.toLowerCase().includes(search.toLowerCase()) ||
    c.cedula?.toLowerCase().includes(search.toLowerCase())
  )
  if (sortAsc !== null) {
    filtered = filtered.sort((a, b) =>
      sortAsc
        ? (a.nombre || '').localeCompare(b.nombre || '')
        : (b.nombre || '').localeCompare(a.nombre || '')
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h2 className="text-2xl font-bold" style={{ color: '#0f172a' }}>Choferes</h2>
        <button
          onClick={() => { setShowModal(true); setForm(initialForm); setEditingId(null); setErrors({}) }}
          className="btn btn-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
        >
          + Nuevo Chofer
        </button>
      </div>

      <div className="mb-4 flex items-center gap-3">
        <input
          type="text"
          placeholder="Buscar choferes..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input-field"
          style={{ maxWidth: '320px' }}
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

      {/* Grid de tarjetas para móvil */}
      <div className="rounded-2xl overflow-hidden" style={{ background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ background: '#f8fafc' }}>
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium" style={{ color: '#64748b' }}>Cédula</th>
                <th className="px-4 py-3 text-left text-sm font-medium" style={{ color: '#64748b' }}>Nombre</th>
                <th className="px-4 py-3 text-left text-sm font-medium" style={{ color: '#64748b' }}>Usuario</th>
                <th className="px-4 py-3 text-left text-sm font-medium" style={{ color: '#64748b' }}>Teléfono</th>
                <th className="px-4 py-3 text-left text-sm font-medium" style={{ color: '#64748b' }}>Licencia</th>
                <th className="px-4 py-3 text-left text-sm font-medium" style={{ color: '#64748b' }}>Vencimiento</th>
                <th className="px-4 py-3 text-right text-sm font-medium" style={{ color: '#64748b' }}>Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: '#e2e8f0' }}>
              {filtered.map(chofer => (
                <tr key={chofer.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium" style={{ color: '#0f172a' }}>{chofer.cedula}</td>
                  <td className="px-4 py-3" style={{ color: '#0f172a' }}>{chofer.nombre}</td>
                  <td className="px-4 py-3" style={{ color: '#2563eb' }}>{chofer.usuario?.username || '-'}</td>
                  <td className="px-4 py-3" style={{ color: '#64748b' }}>{chofer.telefono || '-'}</td>
                  <td className="px-4 py-3" style={{ color: '#64748b' }}>{chofer.licencia || '-'}</td>
                  <td className="px-4 py-3" style={{ color: '#64748b' }}>{chofer.fecha_venc_licencia || '-'}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleEdit(chofer)} className="mr-3 text-sm" style={{ color: '#2563eb' }}>Editar</button>
                    <button onClick={() => confirmDelete(chofer)} className="text-sm" style={{ color: '#ef4444' }}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div className="modal-content bg-white rounded-xl p-6" style={{ overscrollBehavior: 'contain' }}>
            <h3 id="modal-title" className="text-xl font-bold mb-4" style={{ color: '#0f172a' }}>
              {editingId ? 'Editar Chofer' : 'Nuevo Chofer'}
            </h3>
            <div className="form-grid">
              <div>
                <label htmlFor="cedula" className="block text-sm font-medium mb-1">Cédula *</label>
                <input
                  id="cedula"
                  name="cedula"
                  type="text"
                  inputMode="numeric"
                  value={form.cedula}
                  onChange={e => setForm({ ...form, cedula: e.target.value.replace(/\D/g, '') })}
                  className="input-field"
                  autoComplete="off"
                  spellCheck={false}
                />
                {errors.cedula && <p className="text-sm mt-1" style={{ color: '#ef4444' }}>{errors.cedula}</p>}
              </div>
              <div>
                <label htmlFor="nombre" className="block text-sm font-medium mb-1">Nombre *</label>
                <input
                  id="nombre"
                  name="nombre"
                  type="text"
                  value={form.nombre}
                  onChange={e => setForm({ ...form, nombre: e.target.value })}
                  className="input-field"
                  autoComplete="name"
                />
                {errors.nombre && <p className="text-sm mt-1" style={{ color: '#ef4444' }}>{errors.nombre}</p>}
              </div>
<div>
                <label htmlFor="telefono" className="block text-sm font-medium mb-1">Teléfono *</label>
                <input
                  id="telefono"
                  name="tel"
                  type="tel"
                  inputMode="numeric"
                  value={form.telefono}
                  onChange={e => setForm({ ...form, telefono: e.target.value.replace(/\D/g, '') })}
                  className="input-field"
                  maxLength={8}
                  placeholder="Ej: 51234567"
                  autoComplete="tel"
                />
                {errors.telefono && <p className="text-sm mt-1" style={{ color: '#ef4444' }}>{errors.telefono}</p>}
              </div>
              <div>
                <label htmlFor="licencia" className="block text-sm font-medium mb-1">Licencia *</label>
                <input
                  id="licencia"
                  name="license"
                  type="text"
                  value={form.licencia}
                  onChange={e => setForm({ ...form, licencia: e.target.value })}
                  className="input-field"
                  autoComplete="off"
                />
                {errors.licencia && <p className="text-sm mt-1" style={{ color: '#ef4444' }}>{errors.licencia}</p>}
              </div>
              <div>
                <label htmlFor="fecha-venc" className="block text-sm font-medium mb-1">Vencimiento Licencia *</label>
                <input
                  id="fecha-venc"
                  name="license-expires"
                  type="date"
                  value={form.fecha_venc_licencia}
                  onChange={e => setForm({ ...form, fecha_venc_licencia: e.target.value })}
                  className="input-field"
                />
                {errors.fecha_venc_licencia && <p className="text-sm mt-1" style={{ color: '#ef4444' }}>{errors.fecha_venc_licencia}</p>}
              </div>
              <div className="col-span-2 mt-4 pt-4" style={{ borderTop: '1px solid #e2e8f0' }}>
                <p className="text-sm font-medium mb-3" style={{ color: '#0f172a' }}>Datos de Usuario</p>
                <div className="form-grid">
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium mb-1">
                      Usuario {editingId ? '' : '*'}
                    </label>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      value={form.username}
                      onChange={e => setForm({ ...form, username: e.target.value })}
                      className="input-field"
                      autoComplete="off"
                      placeholder={editingId ? 'Dejar vacío para no cambiar' : 'Nombre de usuario'}
                    />
                    {errors.username && <p className="text-sm mt-1" style={{ color: '#ef4444' }}>{errors.username}</p>}
                  </div>
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium mb-1">
                      Contraseña {editingId ? '(opcional)' : '*'}
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={form.password}
                        onChange={e => setForm({ ...form, password: e.target.value })}
                        className="input-field"
                        style={{ paddingRight: '40px' }}
                        autoComplete="new-password"
                        placeholder={editingId ? 'Nueva contraseña' : 'Mínimo 8 caracteres'}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: 'absolute',
                          right: '10px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#64748b',
                          padding: '4px'
                        }}
                      >
                        {showPassword ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                            <line x1="1" y1="1" x2="23" y2="23"/>
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                          </svg>
                        )}
                      </button>
                    </div>
                    {errors.password && <p className="text-sm mt-1" style={{ color: '#ef4444' }}>{errors.password}</p>}
                  </div>
                </div>
              </div>
              <div className="col-span-2">
                <label htmlFor="observacion" className="block text-sm font-medium mb-1">Observación</label>
                <textarea
                  id="observacion"
                  name="observacion"
                  value={form.observacion}
                  onChange={e => setForm({ ...form, observacion: e.target.value })}
                  className="input-field"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
          onClick={() => { setShowModal(false); setShowPassword(false); }}
          className="btn focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
          style={{ border: '1px solid #e2e8f0' }}
        >Cancelar</button>
              <button onClick={handleSave} disabled={loading} className="btn btn-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500">
                {loading ? 'Guardando…' : 'Guardar'}
              </button>
            </div>
</div>
          </div>
        )}
      

      <ConfirmModal
        isOpen={deleteModal.open}
        title="Eliminar Conductor"
        message={`¿Está seguro de eliminar al conductor "${deleteModal.nombre}"? Esta acción no se puede deshacer.`}
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