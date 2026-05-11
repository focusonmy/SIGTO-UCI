import { expect, describe, it, vi, beforeEach } from 'vitest'
import { verifyToken, authMiddleware, roleMiddleware } from '../middleware/auth.js'
import jwt from 'jsonwebtoken'

const TEST_SECRET = process.env.JWT_SECRET

describe('verifyToken', () => {
  it('retorna payload para token válido', () => {
    const payload = { id: '123', username: 'admin', role: 'admin', nombre: 'Admin' }
    const token = jwt.sign(payload, TEST_SECRET, { expiresIn: '1h' })
    const result = verifyToken(token)
    expect(result).not.toBeNull()
    expect(result.id).toBe('123')
    expect(result.username).toBe('admin')
    expect(result.role).toBe('admin')
  })

  it('retorna null para token expirado', () => {
    const payload = { id: '123', username: 'admin' }
    const token = jwt.sign(payload, TEST_SECRET, { expiresIn: '-1s' })
    const result = verifyToken(token)
    expect(result).toBeNull()
  })

  it('retorna null para firma incorrecta', () => {
    const payload = { id: '123', username: 'admin' }
    const token = jwt.sign(payload, 'wrong-secret-key-0000000000000000000000000000', { expiresIn: '1h' })
    const result = verifyToken(token)
    expect(result).toBeNull()
  })

  it('retorna null para token malformado', () => {
    expect(verifyToken('no-es-token')).toBeNull()
    expect(verifyToken('')).toBeNull()
    expect(verifyToken(null)).toBeNull()
  })
})

describe('authMiddleware', () => {
  let mockReq, mockRes, mockNext

  beforeEach(() => {
    mockReq = { headers: {} }
    mockRes = { status: vi.fn().mockReturnThis(), json: vi.fn() }
    mockNext = vi.fn()
  })

  it('retorna 401 si no hay authorization header', () => {
    authMiddleware(mockReq, mockRes, mockNext)
    expect(mockRes.status).toHaveBeenCalledWith(401)
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Token no proporcionado' })
    expect(mockNext).not.toHaveBeenCalled()
  })

  it('retorna 401 si authorization no empieza con Bearer', () => {
    mockReq.headers.authorization = 'Basic token123'
    authMiddleware(mockReq, mockRes, mockNext)
    expect(mockRes.status).toHaveBeenCalledWith(401)
    expect(mockNext).not.toHaveBeenCalled()
  })

  it('retorna 401 para token inválido', () => {
    mockReq.headers.authorization = 'Bearer token-invalido'
    authMiddleware(mockReq, mockRes, mockNext)
    expect(mockRes.status).toHaveBeenCalledWith(401)
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Token inválido o expirado' })
    expect(mockNext).not.toHaveBeenCalled()
  })

  it('llama next() y setea req.user para token válido', () => {
    const payload = { id: 'user-1', username: 'conductor1', role: 'conductor', nombre: 'Juan Pérez' }
    const token = jwt.sign(payload, TEST_SECRET, { expiresIn: '1h' })
    mockReq.headers.authorization = `Bearer ${token}`
    authMiddleware(mockReq, mockRes, mockNext)
    expect(mockNext).toHaveBeenCalled()
    expect(mockReq.user).toMatchObject({ id: 'user-1', username: 'conductor1', role: 'conductor' })
  })

  it('retorna 401 para token expirado', () => {
    const payload = { id: 'user-1', username: 'admin' }
    const token = jwt.sign(payload, TEST_SECRET, { expiresIn: '-1s' })
    mockReq.headers.authorization = `Bearer ${token}`
    authMiddleware(mockReq, mockRes, mockNext)
    expect(mockRes.status).toHaveBeenCalledWith(401)
    expect(mockNext).not.toHaveBeenCalled()
  })
})

describe('roleMiddleware', () => {
  let mockReq, mockRes, mockNext

  beforeEach(() => {
    mockReq = {}
    mockRes = { status: vi.fn().mockReturnThis(), json: vi.fn() }
    mockNext = vi.fn()
  })

  it('retorna 401 si no hay req.user', () => {
    const middleware = roleMiddleware('admin')
    middleware(mockReq, mockRes, mockNext)
    expect(mockRes.status).toHaveBeenCalledWith(401)
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'No autenticado' })
    expect(mockNext).not.toHaveBeenCalled()
  })

  it('retorna 403 si rol no está autorizado', () => {
    mockReq.user = { role: 'conductor' }
    const middleware = roleMiddleware('admin')
    middleware(mockReq, mockRes, mockNext)
    expect(mockRes.status).toHaveBeenCalledWith(403)
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Sin permisos para esta acción' })
    expect(mockNext).not.toHaveBeenCalled()
  })

  it('llama next() si rol está autorizado', () => {
    mockReq.user = { role: 'admin' }
    const middleware = roleMiddleware('admin', 'superadmin')
    middleware(mockReq, mockRes, mockNext)
    expect(mockNext).toHaveBeenCalled()
    expect(mockRes.status).not.toHaveBeenCalled()
  })

  it('permite acceso si rol es uno de los roles permitidos', () => {
    mockReq.user = { role: 'conductor' }
    const middleware = roleMiddleware('admin', 'conductor')
    middleware(mockReq, mockRes, mockNext)
    expect(mockNext).toHaveBeenCalled()
  })
})