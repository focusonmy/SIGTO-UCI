import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../data/auth'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await login(username, password)
    
    if (result.success) {
      const redirectPath = result.role === 'conductor' ? '/conductor' : '/admin'
      navigate(redirectPath, { replace: true })
    } else {
      setError(result.error || 'Usuario o contraseña incorrectos')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }}>
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-4 mb-8">
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
              style={{ background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)' }}
            >
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">SIGTO UCI</h1>
              <p className="text-sm" style={{ color: '#94a3b8' }}>Sistema de Transporte Obrero</p>
            </div>
          </div>

          <h2 className="text-xl text-white mb-6">Iniciar Sesión</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div 
                className="px-4 py-3 rounded-lg text-sm flex items-center gap-2"
                style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#f87171' }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            <div>
              <label htmlFor="username" className="block text-sm font-medium mb-2" style={{ color: '#cbd5e1' }}>Usuario</label>
              <input
                id="username"
                type="text"
                name="username"
                autoComplete="username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-lg"
                style={{ 
                  background: 'rgba(255,255,255,0.05)', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'white'
                }}
                placeholder="Ingresa tu usuario"
                spellCheck={false}
                required
                autoFocus
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2" style={{ color: '#cbd5e1' }}>Contraseña</label>
              <input
                id="password"
                type="password"
                name="current-password"
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg"
                style={{ 
                  background: 'rgba(255,255,255,0.05)', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'white'
                }}
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
              style={{ 
                background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
                color: 'white'
              }}
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  Iniciando sesión...
                </>
              ) : 'Iniciar Sesión'}
            </button>
          </form>

          

          <a href="/" className="block mt-6 text-center text-sm transition-colors hover:text-gray-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400" style={{ color: '#64748b' }}>
            ← Volver al inicio
          </a>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 items-center justify-center p-8" style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' }}>
        <div className="text-center text-white max-w-md">
          <svg className="w-24 h-24 mx-auto mb-6 opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          <h2 className="text-3xl font-bold mb-4">Transporte Obrero UCI</h2>
          <p className="text-lg opacity-80">Sistema para la gestión de rutas, asignación de ómnibus y control de transportación de los trabajadores de la Universidad de las Ciencias Informáticas.</p>
        </div>
      </div>
    </div>
  )
}