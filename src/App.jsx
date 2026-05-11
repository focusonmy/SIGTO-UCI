import { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './data/auth'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Layout from './components/Layout'

const RutasPublicas = lazy(() => import('./pages/RutasPublicas'))
const Dashboard = lazy(() => import('./pages/Admin/Dashboard'))
const Rutas = lazy(() => import('./pages/Admin/Rutas'))
const Choferes = lazy(() => import('./pages/Admin/Choferes'))
const Omnibus = lazy(() => import('./pages/Admin/Omnibus'))
const Reportes = lazy(() => import('./pages/Admin/Reportes'))
const AdminAsignaciones = lazy(() => import('./pages/Admin/Asignaciones'))
const AdminHistorial = lazy(() => import('./pages/Admin/Historial'))

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
    </div>
  )
}

function AppRoutes() {
  const { user } = useAuth()

  return (
    <Routes>
      <Route path="/" element={<RutasPublicas />} />
      <Route path="/login" element={<Login />} />
      
      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={['admin']}>
            <Layout>
              <Suspense fallback={<LoadingFallback />}>
                <Dashboard />
              </Suspense>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/rutas"
        element={
          <ProtectedRoute roles={['admin']}>
            <Layout>
              <Suspense fallback={<LoadingFallback />}>
                <Rutas />
              </Suspense>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/choferes"
        element={
          <ProtectedRoute roles={['admin']}>
            <Layout>
              <Suspense fallback={<LoadingFallback />}>
                <Choferes />
              </Suspense>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/omnibus"
        element={
          <ProtectedRoute roles={['admin']}>
            <Layout>
              <Suspense fallback={<LoadingFallback />}>
                <Omnibus />
              </Suspense>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reportes"
        element={
          <ProtectedRoute roles={['admin']}>
            <Layout>
              <Suspense fallback={<LoadingFallback />}>
                <Reportes />
              </Suspense>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/asignaciones"
        element={
          <ProtectedRoute roles={['admin']}>
            <Layout>
              <Suspense fallback={<LoadingFallback />}>
                <AdminAsignaciones />
              </Suspense>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/historial"
        element={
          <ProtectedRoute roles={['admin']}>
            <Layout>
              <Suspense fallback={<LoadingFallback />}>
                <AdminHistorial />
              </Suspense>
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/conductor"
        element={
          <ProtectedRoute roles={['conductor']}>
            <Layout>
              <Suspense fallback={<LoadingFallback />}>
                <RutasPublicas />
              </Suspense>
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  )
}