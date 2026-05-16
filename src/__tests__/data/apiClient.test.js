import { expect, describe, it, vi, beforeEach } from 'vitest'

const mockFetch = vi.fn()
global.fetch = mockFetch

const API_URL = 'http://localhost:3001/api'

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.getItem.mockReturnValue(null)
  localStorage.setItem.mockClear()
  localStorage.removeItem.mockClear()
  Object.defineProperty(window, 'location', {
    value: { href: 'http://localhost/', replace: vi.fn() },
    writable: true,
  })
})

import { auth, rutas, choferes, omnibus, asignaciones, STORAGE_KEYS } from '../../data/apiClient.js'

describe('apiClient - auth', () => {
  describe('login', () => {
    it('almacena token en localStorage al login exitoso', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify({ user: { id: '1', username: 'admin', role: 'admin', nombre: 'Admin' }, token: 'jwt-token-123' })),
      })
      const result = await auth.login('admin', 'Admin123!')
      expect(localStorage.setItem).toHaveBeenCalledWith(STORAGE_KEYS.token, 'jwt-token-123')
      expect(result.token).toBe('jwt-token-123')
    })

    it('retorna error cuando credenciales inválidas', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ error: 'Credenciales inválidas' }),
      })
      const result = await auth.login('admin', 'wrong')
      expect(result.error).toBe('Sesión expirada')
    })

    it('agrega Authorization header con token existente', async () => {
      localStorage.getItem.mockImplementation((key) => {
        if (key === STORAGE_KEYS.token) return 'existing-token'
        return null
      })
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify({})),
      })
      await rutas.getAll()
      expect(mockFetch).toHaveBeenCalledWith(
        `${API_URL}/rutas`,
        expect.objectContaining({
          headers: expect.objectContaining({ Authorization: 'Bearer existing-token' }),
        })
      )
    })
  })

  describe('logout', () => {
    it('elimina token y user de localStorage', () => {
      auth.logout()
      expect(localStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.token)
      expect(localStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.user)
    })
  })
})

describe('apiClient - request', () => {
  it('hace fetch a la URL correcta', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, status: 200, text: () => Promise.resolve('[]') })
    await rutas.getAll()
    expect(mockFetch).toHaveBeenCalledWith(`${API_URL}/rutas`, expect.any(Object))
  })

  it('agrega Content-Type header', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, status: 200, text: () => Promise.resolve('[]') })
    await rutas.create({ nombre: 'Test' })
    expect(mockFetch).toHaveBeenCalledWith(
      `${API_URL}/rutas`,
      expect.objectContaining({
        headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
      })
    )
  })

  it('lanza error en 401 y limpia localStorage', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ error: 'Token expirado' }),
    })
    await expect(rutas.getAll()).rejects.toThrow('Sesión expirada')
    expect(localStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.token)
    expect(localStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.user)
  })

  it('lanza error cuando servidor no responde (TypeError)', async () => {
    mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'))
    await expect(choferes.getAll()).rejects.toThrow('Servidor no disponible')
  })

  it('parsea respuesta vacía como null', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, status: 204, text: () => Promise.resolve('') })
    const result = await asignaciones.delete('some-id')
    expect(result).toBeNull()
  })

  it('lanza error con mensaje del server cuando response.ok es false', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ error: 'Datos inválidos' }),
    })
    await expect(rutas.create({})).rejects.toThrow('Datos inválidos')
  })
})

describe('apiClient - rutas', () => {
  it('getPublicas llama a /rutas/publicas', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true, status: 200, text: () => Promise.resolve(JSON.stringify({ rutas: [] }))
    })
    await rutas.getPublicas()
    expect(mockFetch).toHaveBeenCalledWith(
      `${API_URL}/rutas/publicas`,
      expect.any(Object)
    )
  })

  it('create envía POST con body JSON', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true, status: 201, text: () => Promise.resolve(JSON.stringify({ id: 'new' }))
    })
    await rutas.create({ nombre: 'Nueva Ruta', origen: 'A', destino: 'B' })
    expect(mockFetch).toHaveBeenCalledWith(
      `${API_URL}/rutas`,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ nombre: 'Nueva Ruta', origen: 'A', destino: 'B' }),
      })
    )
  })
})

describe('apiClient - asignaciones', () => {
  it('getAll agrega query param fecha', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, status: 200, text: () => Promise.resolve('[]') })
    await asignaciones.getAll('2026-05-12')
    expect(mockFetch).toHaveBeenCalledWith(
      `${API_URL}/asignaciones?fecha=2026-05-12`,
      expect.any(Object)
    )
  })

  it('getHistorial construye query string', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, status: 200, text: () => Promise.resolve(JSON.stringify({ historial: [] })) })
    await asignaciones.getHistorial({ fecha: '2026-05-11', chofer_id: 'c1' })
    expect(mockFetch).toHaveBeenCalledWith(
      `${API_URL}/asignaciones/historial?fecha=2026-05-11&chofer_id=c1`,
      expect.any(Object)
    )
  })
})