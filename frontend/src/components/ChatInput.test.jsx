import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import ChatInput from './ChatInput'

describe('ChatInput', () => {
  it('botón enviar deshabilitado con input vacío', () => {
    render(<ChatInput onSend={vi.fn()} />)
    expect(screen.getByRole('button', { name: /enviar/i })).toBeDisabled()
  })

  it('habilita el botón al escribir texto y dispara onSend limpiando el input', () => {
    const onSend = vi.fn()
    render(<ChatInput onSend={onSend} />)
    const input = screen.getByLabelText(/escribe tu pregunta/i)
    const button = screen.getByRole('button', { name: /enviar/i })

    fireEvent.change(input, { target: { value: '¿Qué animales requieren atención?' } })
    expect(button).not.toBeDisabled()

    fireEvent.click(button)
    expect(onSend).toHaveBeenCalledWith('¿Qué animales requieren atención?')
    expect(input).toHaveValue('')
  })

  it('no dispara onSend con texto solo de espacios', () => {
    const onSend = vi.fn()
    render(<ChatInput onSend={onSend} />)
    const input = screen.getByLabelText(/escribe tu pregunta/i)
    fireEvent.change(input, { target: { value: '   ' } })
    expect(screen.getByRole('button', { name: /enviar/i })).toBeDisabled()
    expect(onSend).not.toHaveBeenCalled()
  })

  it('respeta disabled externo (ej. mientras el asistente escribe)', () => {
    render(<ChatInput onSend={vi.fn()} disabled />)
    const input = screen.getByLabelText(/escribe tu pregunta/i)
    fireEvent.change(input, { target: { value: 'hola' } })
    expect(screen.getByRole('button', { name: /enviar/i })).toBeDisabled()
  })
})
