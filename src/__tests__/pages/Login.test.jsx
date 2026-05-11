import { expect, describe, it, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

const mockLogin = vi.fn()
const mockLogout = vi.fn()
const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

vi.mock('../../data/auth', () => ({
  useAuth: () => ({ login: mockLogin, logout: mockLogout, user: null, loading: false }),
}))

beforeEach(() => {
  mockLogin.mockReset()
  mockLogout.mockReset()
  mockNavigate.mockReset()
})

import Login from '../../pages/Login.jsx'

describe('Login', () => {
  it('renderiza formulario de login', () => {
    render(<MemoryRouter><Login /></MemoryRouter>)
    expect(screen.getByPlaceholderText('Ingresa tu usuario')).toBeInTheDocument()
  })

  it('muestra título SIGTO UCI', () => {
    render(<MemoryRouter><Login /></MemoryRouter>)
    expect(screen.getByText('SIGTO UCI')).toBeInTheDocument()
  })

  it('llama login al hacer submit con datos', async () => {
    mockLogin.mockResolvedValueOnce({ success: false })
    render(<MemoryRouter><Login /></MemoryRouter>)
    const user = screen.getByPlaceholderText('Ingresa tu usuario')
    const pass = screen.getByPlaceholderText('••••••••')
    fireEvent.change(user, { target: { value: 'admin' } })
    fireEvent.change(pass, { target: { value: 'password' } })
    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }))
    expect(mockLogin).toHaveBeenCalledWith('admin', 'password')
  })

  it('no llama login sin campos', () => {
    render(<MemoryRouter><Login /></MemoryRouter>)
    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }))
    expect(mockLogin).not.toHaveBeenCalled()
  })

  it('muestra mensaje de error cuando login retorna error', async () => {
    mockLogin.mockResolvedValueOnce({ success: false, error: 'Credenciales inválidas' })
    render(<MemoryRouter><Login /></MemoryRouter>)
    const user = screen.getByPlaceholderText('Ingresa tu usuario')
    const pass = screen.getByPlaceholderText('••••••••')
    fireEvent.change(user, { target: { value: 'bad' } })
    fireEvent.change(pass, { target: { value: 'wrong' } })
    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }))
    await waitFor(() => {
      expect(screen.getByText('Credenciales inválidas')).toBeInTheDocument()
    })
  })
})