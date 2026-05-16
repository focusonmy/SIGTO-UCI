const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

export const STORAGE_KEYS = {
  token: 'token:v1',
  user: 'user:v1',
}

let _tokenCache = localStorage.getItem(STORAGE_KEYS.token) || null

async function request(endpoint, options = {}) {
  if (!_tokenCache) {
    _tokenCache = localStorage.getItem(STORAGE_KEYS.token)
  }
  const headers = {
    'Content-Type': 'application/json',
    ...(_tokenCache && { Authorization: `Bearer ${_tokenCache}` }),
    ...options.headers
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers
    })

    if (response.status === 401) {
      _tokenCache = null
      localStorage.removeItem(STORAGE_KEYS.token)
      localStorage.removeItem(STORAGE_KEYS.user)
      window.location.href = '/login'
      throw new Error('Sesión expirada')
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Error de conexión' }))
      throw new Error(error.error || 'Error de conexión')
    }

    const text = await response.text()
    return text ? JSON.parse(text) : null
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Servidor no disponible')
    }
    throw error
  }
}

export const auth = {
  async login(username, password) {
    try {
      const data = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
      })
      if (data.token) {
        _tokenCache = data.token
        localStorage.setItem(STORAGE_KEYS.token, data.token)
      }
      return data
    } catch (error) {
      return { error: error.message }
    }
  },

  logout() {
    _tokenCache = null
    localStorage.removeItem(STORAGE_KEYS.token)
    localStorage.removeItem(STORAGE_KEYS.user)
  },

  async verify() {
    if (!_tokenCache) {
      _tokenCache = localStorage.getItem(STORAGE_KEYS.token)
    }
    if (!_tokenCache) return { valid: false }
    try {
      return await request('/auth/verify')
    } catch {
      return { valid: false }
    }
  }
}

export const choferes = {
  async getAll() {
    return request('/choferes')
  },
  async getById(id) {
    return request(`/choferes/${id}`)
  },
  async create(chofer) {
    return request('/choferes', { method: 'POST', body: JSON.stringify(chofer) })
  },
  async update(id, chofer) {
    return request(`/choferes/${id}`, { method: 'PUT', body: JSON.stringify(chofer) })
  },
  async delete(id) {
    return request(`/choferes/${id}`, { method: 'DELETE' })
  }
}

export const omnibus = {
  async getAll() {
    return request('/omnibus')
  },
  async getDisponibles() {
    return request('/omnibus/disponibles')
  },
  async getById(id) {
    return request(`/omnibus/${id}`)
  },
  async create(omnibus) {
    return request('/omnibus', { method: 'POST', body: JSON.stringify(omnibus) })
  },
  async update(id, omnibus) {
    return request(`/omnibus/${id}`, { method: 'PUT', body: JSON.stringify(omnibus) })
  },
  async delete(id) {
    return request(`/omnibus/${id}`, { method: 'DELETE' })
  }
}

export const rutas = {
  async getAll() {
    return request('/rutas')
  },
  async getPublicas() {
    return request('/rutas/publicas')
  },
  async getConductorHoy() {
    return request('/rutas/conductor-hoy')
  },
  async getById(id) {
    return request(`/rutas/${id}`)
  },
  async create(ruta) {
    return request('/rutas', { method: 'POST', body: JSON.stringify(ruta) })
  },
  async update(id, ruta) {
    return request(`/rutas/${id}`, { method: 'PUT', body: JSON.stringify(ruta) })
  },
  async delete(id) {
    return request(`/rutas/${id}`, { method: 'DELETE' })
  }
}

export const reportes = {
  async getDia() {
    return request('/reportes/dia')
  },
  async copiar() {
    return request('/reportes/copiar', { method: 'POST' })
  }
}

export const asignaciones = {
  async getAll(fecha) {
    const query = fecha ? `?fecha=${fecha}` : ''
    return request(`/asignaciones${query}`)
  },
  async create(data) {
    return request('/asignaciones', { method: 'POST', body: JSON.stringify(data) })
  },
  async getHistorial(params = {}) {
    const query = new URLSearchParams(params).toString()
    const q = query ? `?${query}` : ''
    return request(`/asignaciones/historial${q}`)
  },
  async delete(id) {
    return request(`/asignaciones/${id}`, { method: 'DELETE' })
  }
}

export const rutasApi = {
  async getComunicado() {
    return request('/rutas/comunicado')
  }
}