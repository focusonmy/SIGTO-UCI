import { expect, describe, it, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import ProtectedRoute from '../../components/ProtectedRoute.jsx'

vi.mock('../../data/auth', () => ({
  useAuth: vi.fn(),
}))

import { useAuth } from '../../data/auth.jsx'

beforeEach(() => {
  vi.clearAllMocks()
})

const renderWithAuth = (userMock, loadingMock = false) => {
  useAuth.mockReturnValue({ user: userMock, loading: loadingMock })
  return render(
    <MemoryRouter initialEntries={['/admin']}>
      <Routes>
        <Route path="/" element={<div>Página pública</div>} />
        <Route path="/admin" element={
          <ProtectedRoute roles={['admin']}>
            <div>Panel Admin</div>
          </ProtectedRoute>
        } />
        <Route path="/login" element={<div>Login</div>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('ProtectedRoute', () => {
  it('muestra spinner cuando loading=true', () => {
    renderWithAuth(null, true)
    expect(document.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('redirige a /login si no hay usuario', () => {
    renderWithAuth(null, false)
    expect(screen.getByText('Login')).toBeInTheDocument()
    expect(screen.queryByText('Panel Admin')).not.toBeInTheDocument()
  })

  it('redirige a / si el rol no está autorizado', () => {
    renderWithAuth({ id: '1', username: 'conductor1', role: 'conductor', nombre: 'Juan' }, false)
    expect(screen.getByText('Página pública')).toBeInTheDocument()
    expect(screen.queryByText('Panel Admin')).not.toBeInTheDocument()
  })

  it('renderiza children si usuario tiene el rol correcto', () => {
    renderWithAuth({ id: '1', username: 'admin', role: 'admin', nombre: 'Admin' }, false)
    expect(screen.getByText('Panel Admin')).toBeInTheDocument()
    expect(screen.queryByText('Login')).not.toBeInTheDocument()
  })

  it('permite acceso si roles incluye el rol del usuario', () => {
    useAuth.mockReturnValue({ user: { role: 'conductor' }, loading: false })
    render(
      <MemoryRouter initialEntries={['/conductor']}>
        <Routes>
          <Route path="/" element={<div>Público</div>} />
          <Route path="/conductor" element={
            <ProtectedRoute roles={['conductor']}>
              <div>Panel Conductor</div>
            </ProtectedRoute>
          } />
          <Route path="/login" element={<div>Login</div>} />
        </Routes>
      </MemoryRouter>
    )
    expect(screen.getByText('Panel Conductor')).toBeInTheDocument()
  })
})