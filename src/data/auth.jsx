import { createContext, useState, useContext, useEffect } from 'react'
import { auth } from './apiClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user')
    const token = localStorage.getItem('token')
    if (stored && token) {
      try {
        const parsed = JSON.parse(stored)
        if (parsed && parsed.username && parsed.role && parsed.nombre) {
          return parsed
        }
      } catch {
        localStorage.removeItem('user')
        localStorage.removeItem('token')
      }
    }
    return null
  })
  const [loading] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('user')
    const token = localStorage.getItem('token')
    if (stored && token) {
      try {
        const parsed = JSON.parse(stored)
        if (parsed && parsed.username && parsed.role && parsed.nombre) {
          setUser(parsed)
        }
      } catch {
        localStorage.removeItem('user')
        localStorage.removeItem('token')
      }
    }
  }, [])

  const login = async (username, password) => {
    try {
      const data = await auth.login(username, password)
      if (data.user && data.token) {
        const { password: _, ...userData } = data.user
        setUser(userData)
        localStorage.setItem('user', JSON.stringify(userData))
        return { success: true, role: data.user.role }
      }
      return { success: false }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const logout = () => {
    auth.logout()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}