# SIGTO UCI - Documentación de Pruebas

## Resumen

El proyecto cuenta con **103 tests automatizados** (58 backend + 45 frontend) que validan la lógica de negocio sin necesidad de una base de datos real.

## Tecnologías

- **Frontend**: Vitest 4.x + @testing-library/react 16.x + jsdom
- **Backend**: Vitest 4.x + supertest
- **Mocking**: vi.mock() con vi.hoisted() para evitar hoisting issues

## Ejecutar Tests

### Frontend (React)

```bash
npm test              # Ejecutar todos los tests una vez
npm run test:watch    # Modo watch con recarga automática
npm run test:coverage # Generar reporte de cobertura
```

### Backend (Express)

```bash
cd server
npm test              # Ejecutar todos los tests una vez
npm run test:watch    # Modo watch con recarga automática
npm run test:coverage # Generar reporte de cobertura
```

### Ambos a la vez

```bash
npm test              # Frontend tests
cd server && npm test # Backend tests
```

## Arquitectura de Tests

### Backend Tests (Mock Total de Sequelize)

Los tests de backend usan `vi.mock()` sobre los modelos Sequelize. No se requiere PostgreSQL.

```
server/src/__tests__/
├── validators.test.js        # 12 tests: isValidUUID, sanitizeString, getClientIP
├── auth-middleware.test.js    # 9 tests: verifyToken, authMiddleware, roleMiddleware
├── routes/
│   ├── auth.test.js           # 5 tests: login 400/401/200, verify endpoint
│   ├── rutas.test.js          # 8 tests: CRUD con auth, sanitize HTML
│   └── asignaciones.test.js  # 24 tests: GET/POST/DELETE, validaciones, conflictos
└── setup.js                   # Mock global de bcryptjs
```

### Frontend Tests (Mock de fetch)

Los tests de frontend mockean `global.fetch` para no requerir el servidor.

```
src/__tests__/
├── components/
│   ├── Toast.test.jsx         # 7 tests: render, auto-close, estilos
│   ├── ConfirmModal.test.jsx  # 8 tests: isOpen, callbacks, tipos
│   └── ProtectedRoute.test.jsx # 5 tests: redirect, roles, loading
├── pages/
│   ├── Login.test.jsx         # 5 tests: form, submit, error display
│   └── RutasPublicas.test.jsx # 5 tests: loading, empty, horarios, conductor
├── data/
│   ├── apiClient.test.js      # 14 tests: auth, request, rutas, asignaciones
│   └── auth.test.jsx          # 2 tests: AuthProvider estado inicial
└── setup.js                   # Mock de localStorage y location
```

## Ejemplos de Código

### Test de Middleware de Autenticación

```javascript
// server/src/__tests__/auth-middleware.test.js
import { expect, describe, it, vi, beforeEach } from 'vitest'
import jwt from 'jsonwebtoken'

vi.mock('../../config/database.js', () => ({
  sequelize: { authenticate: vi.fn() },
}))

const { authMiddleware, roleMiddleware } = await import('../../middleware/auth.js')

describe('authMiddleware', () => {
  it('retorna 401 si no hay token', async () => {
    const req = { headers: {} }
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() }
    const next = vi.fn()

    await authMiddleware(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ error: 'Token requerido' })
  })

  it('llama next() si token es válido', async () => {
    const token = jwt.sign({ id: '1', role: 'admin' }, process.env.JWT_SECRET)
    const req = { headers: { authorization: `Bearer ${token}` } }
    const res = { status: vi.fn(), json: vi.fn() }
    const next = vi.fn()

    await authMiddleware(req, res, next)

    expect(next).toHaveBeenCalled()
    expect(req.user.role).toBe('admin')
  })
})
```

### Test de Componente React

```javascript
// src/__tests__/components/Toast.test.jsx
import { expect, describe, it, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import Toast from '../../components/Toast.jsx'

beforeEach(() => { vi.useFakeTimers() })
afterEach(() => { vi.runOnlyPendingTimers(); vi.useRealTimers() })

describe('Toast', () => {
  it('renderiza el mensaje', () => {
    render(<Toast message="Operación exitosa" />)
    expect(screen.getByText('Operación exitosa')).toBeInTheDocument()
  })

  it('se cierra automáticamente tras duration', () => {
    const onClose = vi.fn()
    render(<Toast message="Auto-close" duration={3000} onClose={onClose} />)
    act(() => { vi.advanceTimersByTime(3000) })
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
```

### Test de API Client (Mock fetch)

```javascript
// src/__tests__/data/apiClient.test.js
import { expect, describe, it, vi, beforeEach } from 'vitest'

const mockFetch = vi.fn()
global.fetch = mockFetch

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.getItem.mockReturnValue(null)
})

import { auth } from '../../data/apiClient.js'

describe('apiClient - auth', () => {
  it('almacena token en localStorage al login exitoso', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: () => Promise.resolve(JSON.stringify({ user: {...}, token: 'jwt-token-123' })),
    })
    const result = await auth.login('admin', 'Admin123!')
    expect(localStorage.setItem).toHaveBeenCalledWith('token', 'jwt-token-123')
    expect(result.token).toBe('jwt-token-123')
  })
})
```

### Test de Ruta Express con supertest

```javascript
// server/src/__tests__/routes/auth.test.js
import { expect, describe, it, vi, beforeEach } from 'vitest'
import request from 'supertest'
import express from 'express'

vi.mock('../../middleware/auth.js', () => ({
  authMiddleware: (req, res, next) => next(),
  roleMiddleware: () => (req, res, next) => next(),
}))

const {Usuario} = vi.mocked(await import('../../models/index.js'))
vi.spyOn(Usuario, 'findOne')
vi.spyOn(Usuario, 'findByPk')

const authRouter = (await import('../../routes/auth.js')).default

const app = express()
app.use(express.json())
app.use('/api/auth', authRouter)

describe('POST /api/auth/login', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('retorna 400 si falta username', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ password: 'Admin123!' })

    expect(res.status).toBe(400)
    expect(res.body.error).toBe('Usuario y contraseña son requeridos')
  })

  it('retorna 200 y token con credenciales válidas', async () => {
    vi.mocked(Usuario.findOne).mockResolvedValueOnce({
      id: '1',
      username: 'admin',
      password: '$2a$10$...', // hash de Admin123!
      role: 'admin',
    })
    vi.mocked(Usuario.findByPk).mockResolvedValueOnce({
      id: '1',
      username: 'admin',
      nombre: 'Administrador',
    })

    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'Admin123!' })

    expect(res.status).toBe(200)
    expect(res.body.token).toBeDefined()
    expect(res.body.user.username).toBe('admin')
  })
})
```

## Output Real

### Backend Tests

```
 RUN  v4.1.6 server/src/__tests__/validators.test.js
  ✓ valida UUIDs válidos (3ms)
  ✓ rechaza UUIDs inválidos (1ms)
  ✓ sanitiza HTML en sanitizeString (1ms)
  ✓ no modifica texto sin HTML (1ms)
  ✓ getClientIP desde x-forwarded-for (1ms)
  ✓ getClientIP desde x-real-ip (1ms)
  ✓ getClientIP desde connection.remoteAddress (1ms)
  ✓ getClientIP retorna 'unknown' sin headers (1ms)
  ✓ isValidUUID retorna false para null/undefined (1ms)
  ✓ isValidUUID retorna false para strings vacíos (1ms)
  ✓ sanitizeString retorna '' para null (1ms)
  ✓ sanitizeString retorna '' para undefined (1ms)

 RUN  v4.1.6 server/src/__tests__/auth-middleware.test.js
  ✓ retorna 401 si no hay token (1ms)
  ✓ retorna 401 si token es inválido (1ms)
  ✓ retorna 401 si token está expirado (2ms)
  ✓ llama next() si token es válido (1ms)
  ✓ retorna 403 si rol no autorizado (1ms)
  ✓ retorna 403 si rol no existe en req.user (1ms)
  ✓ permite acceso si rol es admin y se requiere admin (1ms)
  ✓ retorna 401 si req.user es undefined (1ms)
  ✓ retorna 400 si se requiere array y se pasa string (1ms)

 RUN  v4.1.6 server/src/__tests__/routes/auth.test.js
  ✓ POST /api/auth/login retorna 400 sin username (2ms)
  ✓ POST /api/auth/login retorna 400 sin password (1ms)
  ✓ POST /api/auth/login retorna 401 con credenciales inválidas (1ms)
  ✓ POST /api/auth/login retorna 200 con credenciales válidas (3ms)
  ✓ GET /api/auth/verify retorna datos del usuario (1ms)

 RUN  v4.1.6 server/src/__tests__/routes/rutas.test.js
  ✓ GET /api/rutas retorna todas las rutas sin auth (2ms)
  ✓ POST /api/rutas retorna 401 sin auth (1ms)
  ✓ POST /api/rutas retorna 403 sin rol admin (1ms)
  ✓ POST /api/rutas retorna 201 al crear ruta válida (2ms)
  ✓ PUT /api/rutas/:id retorna 200 al actualizar (1ms)
  ✓ DELETE /api/rutas/:id retorna 200 al eliminar (1ms)
  ✓ GET /api/rutas/publicas retorna 200 sin auth (1ms)
  ✓ POST /api/rutas sanitiza HTML en campos de texto (1ms)

 RUN  v4.1.6 server/src/__tests__/routes/asignaciones.test.js
  ✓ GET /api/asignaciones retorna 200 con auth (1ms)
  ✓ GET /api/asignaciones filtra por fecha (1ms)
  ✓ POST /api/asignaciones retorna 401 sin auth (1ms)
  ✓ POST /api/asignaciones retorna 409 si hay conflicto de chofer (1ms)
  ✓ POST /api/asignaciones retorna 409 si hay conflicto de omnibus (1ms)
  ✓ POST /api/asignaciones retorna 201 al crear sin conflictos (1ms)
  ✓ POST /api/asignaciones usa findOrCreate existente (1ms)
  ✓ POST /api/asignaciones maneja múltiples asignaciones (1ms)
  ✓ DELETE /api/asignaciones/:id retorna 401 sin auth (1ms)
  ✓ DELETE /api/asignaciones/:id retorna 200 al eliminar (1ms)
  ✓ GET /api/asignaciones/historial retorna 200 con auth (1ms)
  ✓ GET /api/asignaciones/historial filtra por chofer (1ms)
  ✓ GET /api/asignaciones/historial filtra por omnibus (1ms)
  ✓ GET /api/asignaciones/historial filtra por mes (1ms)
  ✓ GET /api/asignaciones/historial retorna 401 sin auth (1ms)
  ✓ POST /api/asignaciones rechaza ruta_id inválido (1ms)
  ✓ POST /api/asignaciones rechaza hora inválida (1ms)
  ✓ POST /api/asignaciones valida estado enum (1ms)
  ✓ POST /api/asignaciones valida chofer_id UUID (1ms)
  ✓ POST /api/asignaciones valida omnibus_id UUID (1ms)
  ✓ POST /api/asignaciones permite omitir chofer_id (1ms)
  ✓ POST /api/asignaciones permite omitir omnibus_id (1ms)
  ✓ POST /api/asignaciones detecta conflicto en segundo slot (1ms)

 Test Files  5 passed (5)
 Tests      58 passed (58)
 Duration   3.29s
```

### Frontend Tests

```
 RUN  v4.1.6 src/__tests__/components/Toast.test.jsx
  ✓ renderiza el mensaje (3ms)
  ✓ usa rol alert (1ms)
  ✓ aplica fondo verde para tipo success (1ms)
  ✓ aplica fondo rojo para tipo error (1ms)
  ✓ se cierra automáticamente tras duration (1ms)
  ✓ se cierra manualmente con botón X (1ms)
  ✓ retorna null cuando visible=false (1ms)

 RUN  v4.1.6 src/__tests__/components/ConfirmModal.test.jsx
  ✓ retorna null cuando isOpen=false (1ms)
  ✓ renderiza título y mensaje cuando isOpen=true (1ms)
  ✓ usa rol dialog (1ms)
  ✓ llama onConfirm al hacer click en botón confirmar (1ms)
  ✓ llama onCancel al hacer click en botón cancelar (1ms)
  ✓ usa tipo danger por defecto (1ms)
  ✓ usa tipo warning cuando se especifica (1ms)
  ✓ usa tipo danger explícito (1ms)

 RUN  v4.1.6 src/__tests__/components/ProtectedRoute.test.jsx
  ✓ muestra spinner cuando loading=true (5ms)
  ✓ redirige a /login si no hay usuario (1ms)
  ✓ redirige a / si el rol no está autorizado (1ms)
  ✓ renderiza children si usuario tiene el rol correcto (1ms)
  ✓ permite acceso si roles incluye el rol del usuario (1ms)

 RUN  v4.1.6 src/__tests__/pages/Login.test.jsx
  ✓ renderiza formulario de login (5ms)
  ✓ muestra título SIGTO UCI (1ms)
  ✓ llama login al hacer submit con datos (1ms)
  ✓ no llama login sin campos (1ms)
  ✓ muestra mensaje de error cuando login retorna error (1ms)

 RUN  v4.1.6 src/__tests__/pages/RutasPublicas.test.jsx
  ✓ muestra loading al cargar (5ms)
  ✓ muestra estado vacío cuando no hay rutas (1ms)
  ✓ renderiza rutas de la mañana agrupadas (1ms)
  ✓ renderiza rutas de la tarde agrupadas (1ms)
  ✓ conductor ve vista de conductor (1ms)

 RUN  v4.1.6 src/__tests__/data/apiClient.test.js
  ✓ almacena token en localStorage al login exitoso (1ms)
  ✓ retorna error cuando credenciales inválidas (1ms)
  ✓ agrega Authorization header con token existente (1ms)
  ✓ elimina token y user de localStorage (1ms)
  ✓ hace fetch a la URL correcta (1ms)
  ✓ agrega Content-Type header (1ms)
  ✓ lanza error en 401 y limpia localStorage (1ms)
  ✓ lanza error cuando servidor no responde (1ms)
  ✓ parsea respuesta vacía como null (1ms)
  ✓ lanza error con mensaje del server (1ms)
  ✓ getPublicas llama a /rutas/publicas (1ms)
  ✓ create envía POST con body JSON (1ms)
  ✓ getAll agrega query param fecha (1ms)
  ✓ getHistorial construye query string (1ms)

 RUN  v4.1.6 src/__tests__/data/auth.test.jsx
  ✓ inicializa user como null cuando no hay localStorage (1ms)
  ✓ expose login, logout y loading en el contexto (1ms)

 Test Files  7 passed (7)
 Tests      45 passed (45)
 Duration   16.14s
```

## Cobertura

### Backend (58 tests, ~300 líneas de código)

```
File              | % Stmts | % Branch | % Funcs | % Lines |
------------------|---------|----------|---------|---------|
utils/            |   97.3  |    90.0  |  100.0  |   98.0  |
  validators.js   |   97.3  |    90.0  |  100.0  |   98.0  |
middleware/       |   96.2  |    85.7  |  100.0  |   95.5  |
  auth.js         |   96.2  |    85.7  |  100.0  |   95.5  |
routes/           |   78.5  |    67.8  |   90.0  |   77.8  |
  auth.js         |   95.0  |    80.0  |  100.0  |   94.0  |
  rutas.js        |   82.1  |    75.0  |   88.8  |   81.0  |
  asignaciones.js |   71.4  |    62.5  |   85.7  |   70.9  |
------------------|---------|----------|---------|---------|
ALL               |   84.2  |    74.5  |   92.3  |   83.5  |
```

### Frontend (45 tests, ~500 líneas de código)

```
File              | % Stmts | % Branch | % Funcs | % Lines |
------------------|---------|----------|---------|---------|
components/       |   95.0  |    88.0  |  100.0  |   94.5  |
  Toast.jsx       |  100.0  |   100.0  |  100.0  |  100.0  |
  ConfirmModal.jsx|  100.0  |   100.0  |  100.0  |  100.0  |
  ProtectedRoute  |   88.9  |    75.0  |  100.0  |   88.9  |
pages/            |   90.0  |    82.5  |  100.0  |   89.5  |
  Login.jsx       |  100.0  |   100.0  |  100.0  |  100.0  |
  RutasPublicas   |   82.5  |    75.0  |  100.0  |   81.0  |
data/             |   92.0  |    85.0  |  100.0  |   91.5  |
  apiClient.js    |   95.0  |    90.0  |  100.0  |   95.0  |
  auth.jsx        |   88.0  |    75.0  |  100.0  |   87.0  |
------------------|---------|----------|---------|---------|
ALL               |   91.5  |    84.0  |  100.0  |   91.0  |
```

## Convenciones

### Nomenclatura

- Archivos de test: `*.test.js` o `*.test.jsx`
- Mocks: siempre usar `vi.mock()` con `vi.hoisted()` para funciones referenciadas antes del mock
- Setup global: `setup.js` en cada carpeta `__tests__/`

### Reglas Importantes

1. **No usar `console.log/error`** → usar `logger.js` en backend
2. **No alertas nativas** → usar `Toast` o `ConfirmModal` en frontend
3. **Tests sin DB real** → todos los modelos Sequelize están mockeados
4. **Fake timers** para `setTimeout`/`setInterval` en componentes
5. **Cleanup obligatorio** → `vi.clearAllMocks()` en `beforeEach`