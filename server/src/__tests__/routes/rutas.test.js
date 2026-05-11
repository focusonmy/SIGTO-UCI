import { expect, describe, it, vi, beforeEach } from 'vitest'
import request from 'supertest'
import express from 'express'
import jwt from 'jsonwebtoken'

vi.mock('../../models/index.js', () => ({
  Ruta: {
    findAll: vi.fn(() => Promise.resolve([
      { id: '550e8400-e29b-41d4-a716-446655440000', nombre: 'UCI - CUJAE', origen: 'UCI', destino: 'CUJAE', distancia: '8 km' },
      { id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479', nombre: 'UCI - Vedado', origen: 'UCI', destino: 'Vedado', distancia: '18 km' },
    ])),
    findByPk: vi.fn((id) => {
      if (id === '550e8400-e29b-41d4-a716-446655440000') {
        return Promise.resolve({ id, nombre: 'UCI - CUJAE', origen: 'UCI', destino: 'CUJAE' })
      }
      return Promise.resolve(null)
    }),
    create: vi.fn((data) => Promise.resolve({ id: 'new-id-123', ...data })),
  },
  AsignacionRuta: {
    findAll: vi.fn(() => Promise.resolve([])),
  },
  Chofer: { findOne: vi.fn(() => Promise.resolve(null)) },
  Omnibus: { findAll: vi.fn(() => Promise.resolve([])) },
  Sequelize: { DataTypes: {} },
}))

vi.mock('../../utils/logger.js', () => ({
  default: { error: vi.fn(), warn: vi.fn() },
}))

import rutasRoutes from '../../routes/rutas.js'

const TEST_SECRET = process.env.JWT_SECRET
const makeToken = (role = 'admin') => jwt.sign(
  { id: 'u1', username: 'admin', role, nombre: 'Admin' },
  TEST_SECRET,
  { expiresIn: '1h' }
)

const app = express()
app.use(express.json())
app.use('/api/rutas', rutasRoutes)

describe('GET /api/rutas', () => {
  it('retorna lista de rutas sin autenticación', async () => {
    const res = await request(app).get('/api/rutas')
    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(2)
    expect(res.body[0].nombre).toBe('UCI - CUJAE')
  })
})

describe('GET /api/rutas/:id', () => {
  it('retorna 400 para ID no válido', async () => {
    const res = await request(app).get('/api/rutas/no-uuid')
    expect(res.status).toBe(400)
    expect(res.body.error).toBe('ID inválido')
  })

  it('retorna 404 para ruta no existente', async () => {
    const res = await request(app).get('/api/rutas/f47ac10b-58cc-4372-a567-0e02b2c3d479')
    expect(res.status).toBe(404)
  })

  it('retorna ruta para ID válido', async () => {
    const res = await request(app).get('/api/rutas/550e8400-e29b-41d4-a716-446655440000')
    expect(res.status).toBe(200)
    expect(res.body.nombre).toBe('UCI - CUJAE')
  })
})

describe('POST /api/rutas', () => {
  it('retorna 401 sin token', async () => {
    const res = await request(app).post('/api/rutas').send({ nombre: 'UCI - Test' })
    expect(res.status).toBe(401)
  })

  it('retorna 401 con token de conductor', async () => {
    const res = await request(app)
      .post('/api/rutas')
      .set('Authorization', `Bearer ${makeToken('conductor')}`)
      .send({ nombre: 'UCI - Test', origen: 'UCI', destino: 'Test' })
    expect(res.status).toBe(403)
  })

  it('retorna 400 si falta nombre', async () => {
    const res = await request(app)
      .post('/api/rutas')
      .set('Authorization', `Bearer ${makeToken('admin')}`)
      .send({ origen: 'UCI', destino: 'Test' })
    expect(res.status).toBe(400)
    expect(res.body.error).toBe('Nombre, origen y destino son requeridos')
  })

  it('retorna 201 para datos válidos con token admin', async () => {
    const res = await request(app)
      .post('/api/rutas')
      .set('Authorization', `Bearer ${makeToken('admin')}`)
      .send({ nombre: 'UCI - Test', origen: 'UCI', destino: 'Test' })
    expect(res.status).toBe(201)
    expect(res.body.nombre).toBe('UCI - Test')
  })

  it('sanitiza HTML en el nombre', async () => {
    const res = await request(app)
      .post('/api/rutas')
      .set('Authorization', `Bearer ${makeToken('admin')}`)
      .send({ nombre: '<script>alert(1)</script>', origen: 'UCI', destino: 'Test' })
    expect(res.status).toBe(201)
    expect(res.body.nombre).not.toContain('<script>')
  })
})

describe('DELETE /api/rutas/:id', () => {
  it('retorna 401 sin token', async () => {
    const res = await request(app).delete('/api/rutas/550e8400-e29b-41d4-a716-446655440000')
    expect(res.status).toBe(401)
  })

  it('retorna 404 para ruta no existente', async () => {
    const res = await request(app)
      .delete('/api/rutas/f47ac10b-58cc-4372-a567-0e02b2c3d479')
      .set('Authorization', `Bearer ${makeToken('admin')}`)
    expect(res.status).toBe(404)
  })
})