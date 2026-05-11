import { Router } from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { authMiddleware } from '../middleware/auth.js'
import { Usuario } from '../models/index.js'
import { getClientIP } from '../utils/validators.js'
import logger from '../utils/logger.js'

const router = Router()

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required')
}

const LOGIN_ATTEMPTS = new Map()
const MAX_ATTEMPTS = 5
const LOCKOUT_TIME = 15 * 60 * 1000
const CLEANUP_INTERVAL = 5 * 60 * 1000

setInterval(() => {
  const now = Date.now()
  for (const [key, value] of LOGIN_ATTEMPTS) {
    if (now > value.lockedUntil && value.lockedUntil > 0) {
      LOGIN_ATTEMPTS.delete(key)
    }
  }
}, CLEANUP_INTERVAL)

router.post('/login', async (req, res) => {
  const { username, password } = req.body
  const clientIP = getClientIP(req)

  if (!username || !password) {
    return res.status(400).json({ error: 'Usuario y contraseña requeridos' })
  }

  const usernameKey = `${clientIP}:${username}`
  const attempts = LOGIN_ATTEMPTS.get(usernameKey) || { count: 0, lockedUntil: 0 }

  if (Date.now() < attempts.lockedUntil) {
    const remaining = Math.ceil((attempts.lockedUntil - Date.now()) / 1000 / 60)
    return res.status(429).json({ 
      error: `Demasiados intentos. Intente en ${remaining} minutos` 
    })
  }

  try {
    const user = await Usuario.findOne({ 
      where: { 
        username: String(username).trim().toLowerCase(), 
        activo: true 
      } 
    })

    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' })
    }

    const passwordValid = await bcrypt.compare(password, user.password_hash)

    if (!passwordValid) {
      attempts.count += 1
      if (attempts.count >= MAX_ATTEMPTS) {
        attempts.lockedUntil = Date.now() + LOCKOUT_TIME
      }
      LOGIN_ATTEMPTS.set(usernameKey, attempts)
      return res.status(401).json({ error: 'Credenciales inválidas' })
    }

    LOGIN_ATTEMPTS.delete(usernameKey)

    const payload = {
      id: user.id,
      username: user.username,
      role: user.rol,
      nombre: user.nombre
    }

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '2h' })

    res.json({
      user: {
        id: user.id,
        username: user.username,
        role: user.rol,
        nombre: user.nombre
      },
      token
    })
  } catch (error) {
    logger.error('Error en login:', error.message)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

router.get('/verify', authMiddleware, async (req, res) => {
  res.json({ valid: true, user: req.user })
})

export default router