import { expect, describe, it, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import Toast from '../../components/Toast.jsx'

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.runOnlyPendingTimers()
  vi.useRealTimers()
})

describe('Toast', () => {
  it('renderiza el mensaje', () => {
    render(<Toast message="Operación exitosa" />)
    expect(screen.getByText('Operación exitosa')).toBeInTheDocument()
  })

  it('usa rol alert', () => {
    render(<Toast message="Error" />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('aplica fondo verde para tipo success', () => {
    const { container } = render(<Toast message="OK" type="success" />)
    const div = container.firstChild
    expect(div.style.background).toContain('220')
    expect(div.style.color).toContain('22')
  })

  it('aplica fondo rojo para tipo error', () => {
    const { container } = render(<Toast message="Error" type="error" />)
    const div = container.firstChild
    expect(div.style.background).toContain('254')
    expect(div.style.color).toContain('153')
  })

  it('se cierra automáticamente tras duration', () => {
    const onClose = vi.fn()
    render(<Toast message="Auto-close" duration={3000} onClose={onClose} />)
    act(() => { vi.advanceTimersByTime(3000) })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('se cierra manualmente con botón X', () => {
    const onClose = vi.fn()
    const { container } = render(<Toast message="Manual" onClose={onClose} />)
    const btn = container.querySelector('button')
    act(() => { fireEvent.click(btn) })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('retorna null cuando visible=false', () => {
    const { container } = render(<Toast message="Hidden" />)
    act(() => { vi.advanceTimersByTime(3000) })
    expect(container.firstChild).toBeNull()
  })
})