import { expect, describe, it, vi, beforeEach, afterEach } from 'vitest'
import request from 'supertest'
import express from 'express'
import jwt from 'jsonwebtoken'

vi.mock('../../models/index.js', () => {
  const mockUser = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    username: 'admin',
    password_hash: '$2b$10$88W7Dk8iFslQvQsJxy5qp.Xi/Pb9J5WyPOAQ8cLR33wopTApo/UOS',
    rol: 'admin',
    nombre: 'Administrador del Sistema',
    activo: true,
  }

  const bcrypt = require('bcryptjs')
  const hashReal = '$2b$10$88W7Dk8iFslQvQsJxy5qp.Xi/Pb9J5WyPOAQ8cLR33wopTApo/UOS'
  const hashWrong = '$2b$10$Xt8ctOQ.84ptBP8YmQbrrs37GN4wtuO.5y9OmAg.7lyyIYq.HhiUQW'

  return {
    Usuario: {
      findOne: vi.fn((opts) => {
        if (opts.where.username === 'admin' && opts.where.activo === true) {
          return Promise.resolve({ ...mockUser, comparePassword: () => Promise.resolve(true) })
        }
        if (opts.where.username === 'conductor1' && opts.where.activo === true) {
          const c1 = { id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479', username: 'conductor1', password_hash: '$2b$10$Yj1wzXNFScBXTiLGrLeS7eGXsR5hG7Yz4P8QFL6CWzsxZbYYpNsKO', rol: 'conductor', nombre: 'Juan Pérez Rodríguez', activo: true }
          return Promise.resolve({ ...c1, comparePassword: () => Promise.resolve(true) })
        }
        if (opts.where.username === 'badpass' && opts.where.activo === true) {
          return Promise.resolve({ ...mockUser, password_hash: hashWrong, comparePassword: () => Promise.resolve(false) })
        }
        return Promise.resolve(null)
      }),
    },
    Sequelize: { DataTypes: {} },
  }
})

vi.mock('../../utils/logger.js', () => ({
  default: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}))

import authRoutes from '../../routes/auth.js'

const TEST_SECRET = process.env.JWT_SECRET
const app = express()
app.use(express.json())
app.use('/api/auth', authRoutes)

describe('POST /api/auth/login', () => {
  it('retorna 400 si falta username', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ password: 'Admin123!' })
    expect(res.status).toBe(400)
    expect(res.body.error).toBe('Usuario y contraseña requeridos')
  })

  it('retorna 400 si falta password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin' })
    expect(res.status).toBe(400)
    expect(res.body.error).toBe('Usuario y contraseña requeridos')
  })

  it('retorna 401 para usuario inexistente', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'noexiste', password: 'Password1!' })
    expect(res.status).toBe(401)
    expect(res.body.error).toBe('Credenciales inválidas')
  })

  it('retorna 401 para contraseña incorrecta', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'badpass', password: 'WrongPass1!' })
    expect(res.status).toBe(401)
    expect(res.body.error).toBe('Credenciales inválidas')
  })

  it('retorna 200 y token para credenciales válidas (admin)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'Admin123!' })
    expect(res.status).toBe(200)
    expect(res.body.token).toBeDefined()
    expect(res.body.user).toMatchObject({
      username: 'admin',
      role: 'admin',
    })
    const decoded = jwt.verify(res.body.token, TEST_SECRET)
    expect(decoded.username).toBe('admin')
    expect(decoded.role).toBe('admin')
  })

  it('retorna 200 con rol conductor', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'conductor1', password: 'Chofer1!' })
    expect(res.status).toBe(200)
    expect(res.body.user.role).toBe('conductor')
    expect(res.body.user.nombre).toBe('Juan Pérez Rodríguez')
  })

  it('normaliza username a minúsculas', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'ADMIN', password: 'Admin123!' })
    expect(res.status).toBe(200)
    expect(res.body.user.username).toBe('admin')
  })
})

describe('GET /api/auth/verify', () => {
  it('retorna 401 sin token', async () => {
    const res = await request(app).get('/api/auth/verify')
    expect(res.status).toBe(401)
  })

  it('retorna 200 y user con token válido', async () => {
    const token = jwt.sign(
      { id: 'user-1', username: 'admin', role: 'admin', nombre: 'Admin' },
      TEST_SECRET,
      { expiresIn: '1h' }
    )
    const res = await request(app)
      .get('/api/auth/verify')
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
    expect(res.body.valid).toBe(true)
    expect(res.body.user.username).toBe('admin')
  })

  it('retorna 401 con token expirado', async () => {
    const token = jwt.sign(
      { id: 'user-1', username: 'admin', role: 'admin' },
      TEST_SECRET,
      { expiresIn: '-1s' }
    )
    const res = await request(app)
      .get('/api/auth/verify')
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(401)
  })
})