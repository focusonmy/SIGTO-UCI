import { expect, describe, it, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

const { getRutasPublicas, getRutaConductor, useAuth } = vi.hoisted(() => ({
  getRutasPublicas: vi.fn(),
  getRutaConductor: vi.fn(),
  useAuth: vi.fn(),
}))

vi.mock('../../data/api', () => ({
  getRutasPublicas,
  getRutaConductor,
}))

vi.mock('../../data/auth', () => ({
  useAuth,
}))

beforeEach(() => {
  vi.clearAllMocks()
})

import RutasPublicas from '../../pages/RutasPublicas.jsx'

describe('RutasPublicas', () => {
  it('muestra loading al cargar', async () => {
    getRutasPublicas.mockImplementation(() => new Promise(() => {}))
    useAuth.mockReturnValue({ user: null })
    render(<MemoryRouter><RutasPublicas /></MemoryRouter>)
    expect(screen.getByText('Cargando…')).toBeInTheDocument()
  })

  it('muestra estado vacío cuando no hay rutas', async () => {
    getRutasPublicas.mockResolvedValueOnce({ tipo: 'hoy', label: 'Rutas para hoy', rutas: [] })
    useAuth.mockReturnValue({ user: null })
    render(<MemoryRouter><RutasPublicas /></MemoryRouter>)
    await waitFor(() => {
      expect(screen.getByText('No hay rutas garantizadas para esta fecha')).toBeInTheDocument()
    })
  })

  it('renderiza rutas de la mañana agrupadas', async () => {
    getRutasPublicas.mockResolvedValueOnce({
      tipo: 'hoy',
      label: 'Rutas para hoy 11/05',
      rutas: [
        { id: '1', nombre: 'UCI - CUJAE', origen: 'UCI', destino: 'CUJAE', hora: '06:45:00', chofer: { nombre: 'Juan' }, omnibus: { placa: 'A-001', marca: 'Yutong' } },
      ]
    })
    useAuth.mockReturnValue({ user: null })
    render(<MemoryRouter><RutasPublicas /></MemoryRouter>)
    await waitFor(() => {
      expect(screen.getByText('HORARIO MAÑANA (06:45)')).toBeInTheDocument()
      expect(screen.getByText('UCI - CUJAE')).toBeInTheDocument()
    })
  })

  it('renderiza rutas de la tarde agrupadas', async () => {
    getRutasPublicas.mockResolvedValueOnce({
      tipo: 'hoy',
      label: 'Rutas para hoy 11/05',
      rutas: [
        { id: '1', nombre: 'UCI - Vedado', origen: 'UCI', destino: 'Vedado', hora: '17:15:00', omnibus: { placa: 'B-001', marca: 'King Long' } },
      ]
    })
    useAuth.mockReturnValue({ user: null })
    render(<MemoryRouter><RutasPublicas /></MemoryRouter>)
    await waitFor(() => {
      expect(screen.getByText('HORARIO TARDE (17:15)')).toBeInTheDocument()
    })
  })

  it('conductor ve vista de conductor', async () => {
    getRutaConductor.mockResolvedValueOnce({
      chofer: 'Juan Pérez',
      label: 'Rutas para hoy 11/05',
      rutas: [{ id: '1', nombre: 'UCI - CUJAE', origen: 'UCI', destino: 'CUJAE', hora: '06:45:00', omnibus: { placa: 'A-001', marca: 'Yutong', capacidad: 45 } }]
    })
    useAuth.mockReturnValue({ user: { role: 'conductor' } })
    render(<MemoryRouter><RutasPublicas /></MemoryRouter>)
    await waitFor(() => {
      expect(screen.getByText(/hola, juan pérez/i)).toBeInTheDocument()
    })
  })
})