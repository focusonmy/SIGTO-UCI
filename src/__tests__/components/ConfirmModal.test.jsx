import { expect, describe, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ConfirmModal from '../../components/ConfirmModal.jsx'

describe('ConfirmModal', () => {
  it('retorna null cuando isOpen=false', () => {
    const { container } = render(
      <ConfirmModal isOpen={false} title="Test" message="Msg" onConfirm={vi.fn()} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renderiza título y mensaje cuando isOpen=true', () => {
    render(
      <ConfirmModal
        isOpen={true}
        title="¿Eliminar?"
        message="Esta acción es irreversible"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    )
    expect(screen.getByText('¿Eliminar?')).toBeInTheDocument()
    expect(screen.getByText('Esta acción es irreversible')).toBeInTheDocument()
  })

  it('usa rol dialog', () => {
    render(
      <ConfirmModal isOpen={true} title="Test" message="Msg" onConfirm={vi.fn()} onCancel={vi.fn()} />
    )
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('llama onConfirm al hacer click en botón confirmar', () => {
    const onConfirm = vi.fn()
    render(
      <ConfirmModal
        isOpen={true}
        title="Confirmar"
        message="¿Continuar?"
        onConfirm={onConfirm}
        onCancel={vi.fn()}
        confirmLabel="Sí, continuar"
      />
    )
    fireEvent.click(screen.getByText('Sí, continuar'))
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('llama onCancel al hacer click en botón cancelar', () => {
    const onCancel = vi.fn()
    render(
      <ConfirmModal
        isOpen={true}
        title="Confirmar"
        message="¿Continuar?"
        onConfirm={vi.fn()}
        onCancel={onCancel}
        cancelLabel="Cancelar"
      />
    )
    fireEvent.click(screen.getByText('Cancelar'))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('usa tipo danger por defecto', () => {
    const { container } = render(
      <ConfirmModal isOpen={true} title="Test" message="Msg" onConfirm={vi.fn()} onCancel={vi.fn()} />
    )
    const btns = container.querySelectorAll('button')
    expect(btns[1].style.background).toContain('220')
  })

  it('usa tipo warning cuando se especifica', () => {
    const { container } = render(
      <ConfirmModal
        isOpen={true}
        type="warning"
        title="Test"
        message="Msg"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    )
    const btns = container.querySelectorAll('button')
    expect(btns[1].style.background).toContain('37')
  })
})