import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required')
}

export function generateToken(user) {
  const payload = {
    id: user.id,
    username: user.username,
    role: user.role,
    nombre: user.nombre
  }
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '5h' })
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch {
    return null
  }
}

export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token no proporcionado' })
  }

  const token = authHeader.substring(7)
  const decoded = verifyToken(token)
  
  if (!decoded) {
    return res.status(401).json({ error: 'Token inválido o expirado' })
  }

  req.user = decoded
  next()
}

export function roleMiddleware(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado' })
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Sin permisos para esta acción' })
    }
    
    next()
  }
}