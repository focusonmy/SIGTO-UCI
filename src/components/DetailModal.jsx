function Field({ label, children }) {
  return (
    <div>
      <p className="text-xs font-medium mb-1" style={{ color: '#64748b' }}>{label}</p>
      {children}
    </div>
  )
}

function renderRuta(item) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Field label="Nombre">
        <p className="text-sm font-medium" style={{ color: '#0f172a' }}>{item.nombre}</p>
      </Field>
      <Field label="Trayecto">
        <p className="text-sm" style={{ color: '#0f172a' }}>{item.origen} → {item.destino}</p>
      </Field>
      <Field label="Distancia">
        <p className="text-sm" style={{ color: '#0f172a' }}>{item.distancia || '-'}</p>
      </Field>
      <Field label="Duración">
        <p className="text-sm" style={{ color: '#0f172a' }}>{item.duracion_estimada || '-'}</p>
      </Field>
      {(item.puntos_json && item.puntos_json.length > 0) && (
        <div className="col-span-2">
          <p className="text-xs font-medium mb-1" style={{ color: '#64748b' }}>Puntos del Recorrido</p>
          <div className="space-y-1">
            {item.puntos_json.map((punto, i) => (
              <p key={i} className="text-xs" style={{ color: '#64748b' }}>
                {i + 1}. {punto.nombre || 'Sin nombre'} ({punto.lat}, {punto.lng})
              </p>
            ))}
          </div>
        </div>
      )}
      {item.observacion && (
        <div className="col-span-2">
          <Field label="Observación">
            <p className="text-sm" style={{ color: '#0f172a' }}>{item.observacion}</p>
          </Field>
        </div>
      )}
    </div>
  )
}

function renderChofer(item) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Field label="Nombre">
        <p className="text-sm font-medium" style={{ color: '#0f172a' }}>{item.nombre}</p>
      </Field>
      <Field label="Cédula">
        <p className="text-sm" style={{ color: '#0f172a' }}>{item.cedula}</p>
      </Field>
      <Field label="Teléfono">
        <p className="text-sm" style={{ color: '#0f172a' }}>{item.telefono || '-'}</p>
      </Field>
      <Field label="Usuario">
        <p className="text-sm" style={{ color: '#2563eb' }}>{item.usuario?.username || '-'}</p>
      </Field>
      <Field label="Licencia">
        <p className="text-sm" style={{ color: '#0f172a' }}>{item.licencia || '-'}</p>
      </Field>
      <Field label="Vencimiento Licencia">
        <p className="text-sm" style={{ color: '#0f172a' }}>{item.fecha_venc_licencia || '-'}</p>
      </Field>
      {item.observacion && (
        <div className="col-span-2">
          <Field label="Observación">
            <p className="text-sm" style={{ color: '#0f172a' }}>{item.observacion}</p>
          </Field>
        </div>
      )}
    </div>
  )
}

function renderOmnibus(item) {
  const badgeStyle = {
    background: item.estado === 'disponible' ? 'rgba(16, 185, 129, 0.1)' : item.estado === 'en_servicio' ? 'rgba(37, 99, 235, 0.1)' : 'rgba(245, 158, 11, 0.1)',
    color: item.estado === 'disponible' ? '#10b981' : item.estado === 'en_servicio' ? '#2563eb' : '#f59e0b'
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      <Field label="Placa">
        <p className="text-sm font-medium" style={{ color: '#0f172a' }}>{item.placa}</p>
      </Field>
      <Field label="Marca / Modelo">
        <p className="text-sm" style={{ color: '#0f172a' }}>{item.marca} {item.modelo || ''}</p>
      </Field>
      <Field label="Año">
        <p className="text-sm" style={{ color: '#0f172a' }}>{item.anio || '-'}</p>
      </Field>
      <Field label="Capacidad">
        <p className="text-sm" style={{ color: '#0f172a' }}>{item.capacidad}</p>
      </Field>
      <Field label="Tipo">
        <p className="text-sm capitalize" style={{ color: '#0f172a' }}>{item.tipo || 'estándar'}</p>
      </Field>
      <Field label="Estado">
        <span className="inline-block px-2 py-1 rounded-full text-xs font-medium" style={badgeStyle}>
          {item.estado}
        </span>
      </Field>
      <Field label="Seguro">
        <p className="text-sm" style={{ color: '#0f172a' }}>{item.seguro || '-'}</p>
      </Field>
      <Field label="Vencimiento Seguro">
        <p className="text-sm" style={{ color: '#0f172a' }}>{item.fecha_venc_seguro || '-'}</p>
      </Field>
    </div>
  )
}

export default function DetailModal({ isOpen, item, type, onEdit, onDelete, onClose }) {
  if (!isOpen || !item) return null

  const titleMap = {
    ruta: 'Detalle de Ruta',
    chofer: 'Detalle de Chofer',
    omnibus: 'Detalle de Ómnibus'
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="detail-modal-title">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl" style={{ overscrollBehavior: 'contain' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 id="detail-modal-title" className="text-xl font-bold" style={{ color: '#0f172a' }}>
            {titleMap[type]}
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 transition-colors" aria-label="Cerrar">
            <svg className="w-5 h-5" style={{ color: '#64748b' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-6" style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
          {type === 'ruta' && renderRuta(item)}
          {type === 'chofer' && renderChofer(item)}
          {type === 'omnibus' && renderOmnibus(item)}
        </div>

        <div className="flex gap-3 justify-end" style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
          <button
            onClick={() => { onEdit(item); onClose() }}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
            style={{ background: '#2563eb' }}
          >
            Editar
          </button>
          <button
            onClick={() => { onDelete(item); onClose() }}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
            style={{ background: '#dc2626' }}
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  )
}
