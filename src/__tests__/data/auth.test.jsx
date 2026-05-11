import { expect, describe, it, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { AuthProvider, useAuth } from '../../data/auth.jsx'

beforeEach(() => {
  localStorage.getItem.mockImplementation((key) => null)
  localStorage.setItem.mockClear()
  localStorage.removeItem.mockClear()
})

describe('AuthProvider', () => {
  it('inicializa user como null cuando no hay localStorage', () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider })
    expect(result.current.user).toBeNull()
  })

  it('expose login, logout y loading en el contexto', () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider })
    expect(typeof result.current.login).toBe('function')
    expect(typeof result.current.logout).toBe('function')
    expect(typeof result.current.loading).toBe('boolean')
  })
})