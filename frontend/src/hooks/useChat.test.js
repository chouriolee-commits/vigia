import { renderHook, waitFor, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useChat } from './useChat'
import { sendMessage } from '../services/aiService'

vi.mock('../services/aiService')

describe('useChat', () => {
  beforeEach(() => {
    vi.mocked(sendMessage).mockReset()
  })

  it('agrega el mensaje del usuario inmediatamente (optimistic) y luego la respuesta del asistente', async () => {
    vi.mocked(sendMessage).mockResolvedValue({ role: 'assistant', content: 'Respuesta de prueba.' })
    const { result } = renderHook(() => useChat({ context: {} }))

    act(() => {
      result.current.send('¿qué animales requieren atención?')
    })

    // el mensaje del usuario aparece de inmediato, antes de resolver la promesa
    expect(result.current.messages).toHaveLength(1)
    expect(result.current.messages[0]).toMatchObject({ role: 'user', content: '¿qué animales requieren atención?' })
    expect(result.current.isTyping).toBe(true)

    await waitFor(() => expect(result.current.isTyping).toBe(false))
    expect(result.current.messages).toHaveLength(2)
    expect(result.current.messages[1]).toMatchObject({ role: 'assistant', content: 'Respuesta de prueba.' })
  })

  it('respeta initialMessages como historial inicial', () => {
    const { result } = renderHook(() =>
      useChat({ context: {}, initialMessages: [{ role: 'assistant', content: 'Hola' }] }),
    )
    expect(result.current.messages).toHaveLength(1)
    expect(result.current.messages[0]).toMatchObject({ role: 'assistant', content: 'Hola' })
  })

  it('no envía mensajes vacíos', () => {
    const { result } = renderHook(() => useChat({ context: {} }))
    act(() => {
      result.current.send('   ')
    })
    expect(result.current.messages).toHaveLength(0)
    expect(sendMessage).not.toHaveBeenCalled()
  })
})
