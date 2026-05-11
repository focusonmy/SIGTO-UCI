# SIGTO UCI - Sistema de Gestión de Transporte Obrero

Sistema web para administrar rutas, asignaciones de choferes y ómnibus del transporte obrero de la Universidad de las Ciencias Informáticas.

## Stack Tecnológico

- **Frontend**: React 19 + Vite + TailwindCSS + Leaflet
- **Backend**: Express.js + Sequelize + PostgreSQL
- **Auth**: JWT con roles diferenciados (admin, conductor)

## Requisitos

- Node.js 18+
- PostgreSQL 14+
- Git

## Instalación Rápida

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd sistema-transporte-obrero-UCI
```

### 2. Configurar la base de datos

Abre **pgAdmin** y ejecuta en orden:

1. `server/sql/schema.sql` — crea las tablas
2. `server/sql/seed.sql` — carga datos de prueba

### 3. Configurar variables de entorno

Crea el archivo `server/.env`:

```env
JWT_SECRET=supersecretkey123456789012345678901234567890
DB_NAME=transporte-obrero-UCI
DB_USERNAME=postgres
DB_PASSWORD=tu_password_de_postgresql
DB_HOST=localhost
DB_PORT=5432
PORT=3001
NODE_ENV=development
```

> Cambia `DB_USERNAME` y `DB_PASSWORD` por tus credenciales de PostgreSQL.

### 4. Instalar dependencias

```bash
# Dependencias del frontend
npm install

# Dependencias del backend
cd server && npm install
```

### 5. Iniciar los servicios

```bash
# Terminal 1 - Backend (puerto 3001)
cd server && npm start

# Terminal 2 - Frontend (puerto 5173)
npm run dev
```

### 6. Abrir en el navegador

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001

## Cuentas de Prueba

| Rol | Usuario | Contraseña |
|-----|---------|-----------|
| admin | admin | Admin123! |
| conductor | conductor1 | Chofer1! |
| conductor | conductor2 | Chofer2! |
| conductor | conductorN | ChoferN! |

Todas las contraseñas cumplen: mínimo 8 caracteres, 1 mayúscula, 1 minúscula, 1 número, 1 carácter especial.

## Funcionalidades

### Admin
- CRUD de rutas fijas con mapa GPS
- CRUD de choferes y ómnibus
- Asignaciones por fecha y horario (06:45 / 17:15)
- Historial filtrado y paginado
- Reportes y comunicado diario

### Conductor
- Ver sus rutas asignadas del día

### Público
- Consultar rutas garantizadas sin autenticación

## Modelo de Datos

```
usuarios ──┬── choferes ──────── asignacion_ruta
           │        │                   │
           │        └─── omnibus ───────┘
           │              (1:N)
           └── choferes (1:1)
```

## API Endpoints Principales

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/login` | Inicia sesión |
| GET | `/api/rutas/publicas` | Rutas públicas (según hora) |
| GET/POST/PUT/DELETE | `/api/rutas` | CRUD rutas |
| GET/POST/PUT/DELETE | `/api/choferes` | CRUD choferes |
| GET/POST/PUT/DELETE | `/api/omnibus` | CRUD ómnibus |
| GET/POST | `/api/asignaciones` | Asignaciones |
| GET | `/api/asignaciones/historial` | Historial |
| GET/POST | `/api/reportes` | Reportes |

## Estructura del Proyecto

```
sistema-transporte-obrero-UCI/
├── src/
│   ├── components/          # Componentes reutilizables
│   ├── pages/
│   │   ├── Admin/           # Panel de administración
│   │   ├── Login.jsx        # Autenticación
│   │   └── RutasPublicas.jsx
│   └── data/                # Cliente API y auth context
├── server/
│   ├── src/
│   │   ├── models/          # Modelos Sequelize
│   │   ├── routes/          # Endpoints de la API
│   │   ├── middleware/      # Auth JWT
│   │   └── utils/           # Validaciones y logging
│   └── sql/                 # Scripts SQL
└── .gitignore
```
