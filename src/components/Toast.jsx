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
  const isWarning = type === 'warning'
  const bgColor = isSuccess ? '#dcfce7' : isWarning ? '#fef9c3' : '#fef2f2'
  const textColor = isSuccess ? '#166534' : isWarning ? '#854d0e' : '#991b1b'
  const iconColor = isSuccess ? '#22c55e' : isWarning ? '#eab308' : '#ef4444'

  return (
    <div 
      className="fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-fade-in"
      style={{ background: bgColor, color: textColor }}
      role="alert"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {isSuccess ? (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        ) : isWarning ? (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
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