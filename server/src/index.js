import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import sequelize, { testConnection } from './config/database.js'
import './models/index.js'

import authRoutes from './routes/auth.js'
import rutasRoutes from './routes/rutas.js'
import choferesRoutes from './routes/choferes.js'
import omnibusRoutes from './routes/omnibus.js'
import reportesRoutes from './routes/reportes.js'
import asignacionesRoutes from './routes/asignaciones.js'

const app = express()
const PORT = process.env.PORT || 3001

const IS_DEV = process.env.NODE_ENV !== 'production'

function log(...args) {
  if (IS_DEV) console.log(...args)
}

function warn(...args) {
  if (IS_DEV) console.warn(...args)
}

app.use(cors())
app.use(express.json())

// Rutas
app.get('/', (req, res) => {
  res.json({ 
    name: 'SIGTO UCI API v1', 
    version: '1.0.0',
    database: 'PostgreSQL',
    endpoints: [
      '/api/auth/login',
      '/api/choferes',
      '/api/omnibus',
      '/api/rutas',
      '/api/reportes/dia'
    ]
  })
})

app.use('/api/auth', authRoutes)
app.use('/api/choferes', choferesRoutes)
app.use('/api/omnibus', omnibusRoutes)
app.use('/api/rutas', rutasRoutes)
app.use('/api/reportes', reportesRoutes)
app.use('/api/asignaciones', asignacionesRoutes)

app.use((err, req, res, _next) => {
  log(err.stack)
  res.status(500).json({ error: 'Error interno del servidor' })
})

async function startServer() {
  const dbConnected = await testConnection()
  
  if (dbConnected) {
    try {
      await sequelize.sync({ alter: true })
      log('Modelos sincronizados con PostgreSQL')
    } catch (error) {
      warn('Sincronización:', error.message)
    }
  } else {
    warn('Servidor iniciando sin PostgreSQL')
  }

  app.listen(PORT, () => {
    log(`Servidor corriendo en http://localhost:${PORT}`)
  })
}

startServer()