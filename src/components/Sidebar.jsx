import { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../data/auth'
import { getRutas, getChoferes, getOmnibus } from '../data/api'

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: HomeIcon, roles: ['admin'], end: true },
  { to: '/admin/rutas', label: 'Rutas', icon: MapIcon, roles: ['admin'] },
  { to: '/admin/choferes', label: 'Choferes', icon: UserIcon, roles: ['admin'] },
  { to: '/admin/omnibus', label: 'Ómnibus', icon: BusIcon, roles: ['admin'] },
  { to: '/admin/asignaciones', label: 'Asignaciones', icon: CalendarIcon, roles: ['admin'] },
  { to: '/admin/historial', label: 'Historial', icon: ChartIcon, roles: ['admin'] },
  { to: '/admin/reportes', label: 'Reportes', icon: ReportIcon, roles: ['admin'] },
  { to: '/conductor', label: 'Mis Rutas', icon: RouteIcon, roles: ['conductor'] },
]

function HomeIcon({ className }) {
  return (
    <svg className={className || 'w-5 h-5'} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  )
}

function MapIcon({ className }) {
  return (
    <svg className={className || 'w-5 h-5'} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0121 18.382V7.618a1 1 0 01-.553-.894L15 4m0 13V4m0 0L9 7" />
    </svg>
  )
}

function CalendarIcon({ className }) {
  return (
    <svg className={className || 'w-5 h-5'} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  )
}

function UserIcon({ className }) {
  return (
    <svg className={className || 'w-5 h-5'} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  )
}

function BusIcon({ className }) {
  return (
    <svg className={className || 'w-5 h-5'} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    </svg>
  )
}

function ChartIcon({ className }) {
  return (
    <svg className={className || 'w-5 h-5'} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )
}

function ReportIcon({ className }) {
  return (
    <svg className={className || 'w-5 h-5'} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )
}

function RouteIcon({ className }) {
  return (
    <svg className={className || 'w-5 h-5'} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0121 18.382V7.618a1 1 0 01-.553-.894L15 4m0 13V4m0 0L9 7" />
    </svg>
  )
}

function MenuIcon({ className }) {
  return (
    <svg className={className || 'w-6 h-6'} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  )
}

function CloseIcon({ className }) {
  return (
    <svg className={className || 'w-6 h-6'} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [totalRutas, setTotalRutas] = useState(null)
  const [totalChoferes, setTotalChoferes] = useState(null)
  const [totalOmnibus, setTotalOmnibus] = useState(null)

  useEffect(() => {
    if (user?.role === 'admin') {
      Promise.all([
        getRutas().then(r => r?.length ?? null),
        getChoferes().then(c => c?.length ?? null),
        getOmnibus().then(o => o?.length ?? null)
      ]).then(([r, c, o]) => {
        setTotalRutas(r)
        setTotalChoferes(c)
        setTotalOmnibus(o)
      }).catch(() => {})
    }
  }, [user])

  const filteredNav = navItems.filter(item => item.roles.includes(user?.role))

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const getRoleLabel = (role) => {
    const labels = { admin: 'Administrador', conductor: 'Conductor' }
    return labels[role] || role
  }

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)

  return (
    <>
      {/* Botón hamburguesa para móvil */}
      <button 
        onClick={toggleSidebar}
        aria-label={sidebarOpen ? 'Cerrar menú' : 'Abrir menú'}
        className="hamburger fixed top-4 left-4 z-50 p-2 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        style={{ background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)' }}
      >
        {sidebarOpen ? <CloseIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
      </button>

      {/* Overlay para móvil */}
      <div 
        className={`sidebar-overlay ${sidebarOpen ? 'show' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`} style={{ background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)' }}>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)' }}
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">SIGTO UCI</h1>
              <p className="text-xs" style={{ color: '#94a3b8' }}>Transporte Obrero</p>
            </div>
          </div>
        </div>
        
        <nav className="px-4 space-y-1">
          {filteredNav.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 ${
                  isActive ? 'text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`
              }
              style={({ isActive }) => isActive ? { background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)' } : {}}
            >
              <item.icon />
              <span className="font-medium">{item.label}</span>
              {item.label === 'Rutas' && totalRutas !== null && (
                <span className="ml-auto px-2 py-0.5 text-xs rounded-full font-medium"
                  style={{ background: 'rgba(255,255,255,0.15)', color: '#e2e8f0' }}>
                  {totalRutas}
                </span>
              )}
              {item.label === 'Choferes' && totalChoferes !== null && (
                <span className="ml-auto px-2 py-0.5 text-xs rounded-full font-medium"
                  style={{ background: 'rgba(255,255,255,0.15)', color: '#e2e8f0' }}>
                  {totalChoferes}
                </span>
              )}
              {item.label === 'Ómnibus' && totalOmnibus !== null && (
                <span className="ml-auto px-2 py-0.5 text-xs rounded-full font-medium"
                  style={{ background: 'rgba(255,255,255,0.15)', color: '#e2e8f0' }}>
                  {totalOmnibus}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
        
        <div className="absolute bottom-0 left-0 right-0 p-4" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-3 px-2 py-3 mb-3">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)' }}
            >
              {user?.nombre?.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-medium text-white">{user?.nombre}</p>
              <p className="text-xs" style={{ color: '#94a3b8' }}>{getRoleLabel(user?.role)}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2.5 rounded-lg text-left transition-colors duration-200 hover:bg-white/5 hover:text-white text-gray-400 flex items-center gap-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Cerrar Sesión
          </button>
        </div>
      </aside>
    </>
  )
}