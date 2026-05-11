import { useState, useEffect } from 'react'

export default function Toast({ message, type = 'success', onClose, duration = 3000 }) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      onClose?.()
    }, duration)
    return () => clearTimeout(timer)
  }, [duration, onClose])

  if (!visible) return null

  const isSuccess = type === 'success'
  const bgColor = isSuccess ? '#dcfce7' : '#fef2f2'
  const textColor = isSuccess ? '#166534' : '#991b1b'
  const iconColor = isSuccess ? '#22c55e' : '#ef4444'

  return (
    <div 
      className="fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-fade-in"
      style={{ background: bgColor, color: textColor }}
      role="alert"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {isSuccess ? (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        )}
      </svg>
      <span className="text-sm font-medium">{message}</span>
      <button onClick={() => { setVisible(false); onClose?.() }} className="ml-2 hover:opacity-70">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}