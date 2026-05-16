import { expect, describe, it, vi, beforeEach } from 'vitest'
import request from 'supertest'
import express from 'express'
import jwt from 'jsonwebtoken'

const mockAsignaciones = []

vi.mock('../../models/index.js', () => ({
  Ruta: {
    findAll: vi.fn(() => Promise.resolve([
      { id: 'r1', nombre: 'UCI - CUJAE', origen: 'UCI', destino: 'CUJAE' },
      { id: 'r2', nombre: 'UCI - Vedado', origen: 'UCI', destino: 'Vedado' },
    ])),
    findByPk: vi.fn((id) => {
      if (id === 'r1') return Promise.resolve({ id, nombre: 'UCI - CUJAE' })
      return Promise.resolve(null)
    }),
  },
  AsignacionRuta: {
    findAll: vi.fn(({ where }) => {
      if (where?.chofer_id) {
        return Promise.resolve(mockAsignaciones.filter(a => a.chofer_id === where.chofer_id))
      }
      return Promise.resolve(mockAsignaciones.filter(a => !where.fecha || a.fecha === where.fecha))
    }),
    findOrCreate: vi.fn(({ where, defaults }) => {
      const existing = mockAsignaciones.find(a => a.ruta_id === where.ruta_id && a.fecha === where.fecha && a.hora === where.hora)
      if (existing) return Promise.resolve([existing, false])
      const newAsig = {
        id: 'new-' + Date.now(),
        ...where,
        ...defaults,
        estado: defaults.estado || 'cancelada',
      }
      mockAsignaciones.push(newAsig)
      return Promise.resolve([newAsig, true])
    }),
    findByPk: vi.fn((id) => {
      const found = mockAsignaciones.find(a => a.id === id)
      if (found) {
        found.destroy = vi.fn(() => {
          const idx = mockAsignaciones.indexOf(found)
          if (idx !== -1) mockAsignaciones.splice(idx, 1)
          return Promise.resolve()
        })
        return Promise.resolve(found)
      }
      return Promise.resolve(null)
    }),
  },
  Chofer: {
    findOne: vi.fn(() => Promise.resolve({ id: 'c1', nombre: 'Juan Pérez' })),
    findAll: vi.fn(() => Promise.resolve([
      { id: 'c1', nombre: 'Juan Pérez' },
      { id: 'c2', nombre: 'María García' },
    ])),
  },
  Omnibus: {
    findAll: vi.fn(() => Promise.resolve([
      { id: 'o1', placa: 'A-001', marca: 'Yutong' },
      { id: 'o2', placa: 'B-001', marca: 'King Long' },
    ])),
  },
  Sequelize: { DataTypes: {} },
  Op: { ne: Symbol('ne') },
}))

vi.mock('../../utils/logger.js', () => ({
  default: { error: vi.fn() },
}))

import asignacionesRoutes from '../../routes/asignaciones.js'

const TEST_SECRET = process.env.JWT_SECRET
const adminToken = jwt.sign({ id: 'u1', username: 'admin', role: 'admin', nombre: 'Admin' }, TEST_SECRET, { expiresIn: '1h' })

const app = express()
app.use(express.json())
app.use('/api/asignaciones', asignacionesRoutes)

describe('GET /api/asignaciones', () => {
  beforeEach(() => {
    mockAsignaciones.length = 0
    mockAsignaciones.push(
      { id: 'a1', ruta_id: 'r1', fecha: '2026-05-11', hora: '06:45', estado: 'garantizada', ruta: { nombre: 'UCI - CUJAE' }, chofer: { nombre: 'Juan' }, omnibus: { placa: 'A-001' } }
    )
  })

  it('retorna 401 sin token', async () => {
    const res = await request(app).get('/api/asignaciones')
    expect(res.status).toBe(401)
  })

  it('retorna lista de asignaciones con token', async () => {
    const res = await request(app)
      .get('/api/asignaciones')
      .set('Authorization', `Bearer ${adminToken}`)
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })

  it('filtra por fecha', async () => {
    const res = await request(app)
      .get('/api/asignaciones?fecha=2026-05-11')
      .set('Authorization', `Bearer ${adminToken}`)
    expect(res.status).toBe(200)
  })
})

describe('POST /api/asignaciones', () => {
  beforeEach(() => {
    mockAsignaciones.length = 0
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-11'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('retorna 401 sin token', async () => {
    const res = await request(app)
      .post('/api/asignaciones')
      .send({ fecha: '2026-05-12', asignaciones: [] })
    expect(res.status).toBe(401)
  })

  it('retorna 400 sin fecha', async () => {
    const res = await request(app)
      .post('/api/asignaciones')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ asignaciones: [] })
    expect(res.status).toBe(400)
    expect(res.body.error).toBe('Fecha y asignaciones son requeridos')
  })

  it('retorna 400 sin asignaciones', async () => {
    const res = await request(app)
      .post('/api/asignaciones')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ fecha: '2026-05-12' })
    expect(res.status).toBe(400)
  })

  it('retorna 201 para asignación válida', async () => {
    const res = await request(app)
      .post('/api/asignaciones')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        fecha: '2026-05-12',
        asignaciones: [
          { ruta_id: 'r1', chofer_id: 'c1', omnibus_id: 'o1', hora: '06:45', estado: 'garantizada' }
        ]
      })
    expect(res.status).toBe(201)
    expect(res.body.message).toBe('Asignaciones guardadas')
  })

  it('asigna estado cancelada si chofer y omnibus son null', async () => {
    const res = await request(app)
      .post('/api/asignaciones')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        fecha: '2026-05-12',
        asignaciones: [
          { ruta_id: 'r1', chofer_id: null, omnibus_id: null, hora: '06:45' }
        ]
      })
    expect(res.status).toBe(201)
    expect(res.body.asignaciones[0].estado).toBe('cancelada')
  })
})

describe('DELETE /api/asignaciones/:id', () => {
  beforeEach(() => {
    mockAsignaciones.length = 0
    mockAsignaciones.push({ id: 'a1', ruta_id: 'r1', fecha: '2026-05-11', hora: '06:45' })
  })

  it('retorna 401 sin token', async () => {
    const res = await request(app).delete('/api/asignaciones/a1')
    expect(res.status).toBe(401)
  })

  it('retorna 403 con rol conductor', async () => {
    const conductorToken = jwt.sign({ id: 'u2', username: 'conductor1', role: 'conductor' }, TEST_SECRET, { expiresIn: '1h' })
    const res = await request(app)
      .delete('/api/asignaciones/a1')
      .set('Authorization', `Bearer ${conductorToken}`)
    expect(res.status).toBe(403)
  })

  it('retorna 404 para asignación inexistente', async () => {
    const res = await request(app)
      .delete('/api/asignaciones/no-existe')
      .set('Authorization', `Bearer ${adminToken}`)
    expect(res.status).toBe(404)
  })

  it('retorna 204 al eliminar asignación existente', async () => {
    const res = await request(app)
      .delete('/api/asignaciones/a1')
      .set('Authorization', `Bearer ${adminToken}`)
    expect(res.status).toBe(204)
  })
})