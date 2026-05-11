export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, confirmLabel = 'Eliminar', cancelLabel = 'Cancelar', type = 'danger' }) {
  if (!isOpen) return null

  const isDanger = type === 'danger'
  const bgColor = isDanger ? '#fef2f2' : '#fff7ed'
  const iconColor = isDanger ? '#dc2626' : '#ea580c'
  const btnColor = isDanger ? '#dc2626' : '#2563eb'

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="confirm-modal-title">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
        <div className="flex items-start gap-4">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: bgColor }}
          >
            <svg className="w-6 h-6" style={{ color: iconColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isDanger ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.786-1.086 2.786-2.422V5.422c0-1.336-1.246-2.422-2.786-2.422H4.134C2.594 3 1.348 4.086 1.348 5.422v12.156c0 1.336 1.246 2.422 2.786 2.422z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.124-.902.55-.902 1.096s.358.972.902 1.096c2.633.745 4.392 3.404 4.392 4.222V19a2 2 0 01-2 2H6a2 2 0 01-2-2v-1.875c0-1.04.84-1.875 1.878-1.875 1.553 0 2.61-1.24 2.61-2.25 0-1.54-1.66-2.25-2.988-2.25z" />
              )}
            </svg>
          </div>
          <div className="flex-1">
            <h3 id="confirm-modal-title" className="text-lg font-bold mb-2" style={{ color: '#0f172a' }}>
              {title}
            </h3>
            <p className="text-sm mb-4" style={{ color: '#64748b' }}>
              {message}
            </p>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={onCancel}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{ background: '#f1f5f9', color: '#64748b' }}
              >
                {cancelLabel}
              </button>
              <button 
                onClick={onConfirm}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors hover:opacity-90"
                style={{ background: btnColor }}
              >
                {confirmLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}