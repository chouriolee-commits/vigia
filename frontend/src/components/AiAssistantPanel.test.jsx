import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import AiAssistantPanel from './AiAssistantPanel'
import { useChat } from '../hooks/useChat'

vi.mock('../hooks/useChat')

const DATA = {
  animales_monitoreados: { total: 24, actualizado_at: '2026-08-27T10:45:00Z' },
  alertas_activas: [
    {
      id: 101,
      livestock_tag: '#024',
      type: 'comportamiento_anomalo',
      priority: 'alta',
      status: 'activa',
      description: 'Patrón de movimiento errático y aislamiento del rebaño.',
      confidence: 0.94,
      created_at: '2026-08-27T10:45:00Z',
    },
  ],
  eventos_hoy: { total: 5 },
  evento_detectado: {
    livestock_id: 24,
    livestock_tag: '#024',
    titulo: 'Atención requerida',
    descripcion: 'Comportamiento inusual detectado...',
    confidence: 0.94,
    alert_id: 101,
  },
  feed_detecciones: [{ livestock_id: 24, livestock_tag: '#024', bbox: { x: 0.1, y: 0.1, width: 0.1, height: 0.1 }, behavior: 'anomalo', confidence: 0.94 }],
}

function renderPanel() {
  return render(
    <MemoryRouter>
      <AiAssistantPanel data={DATA} />
    </MemoryRouter>,
  )
}

describe('AiAssistantPanel', () => {
  beforeEach(() => {
    vi.mocked(useChat).mockReset()
  })

  it('muestra nombre, subtítulo y usa useChat con context construido a partir de data (nunca aiService directo)', () => {
    vi.mocked(useChat).mockReturnValue({ messages: [], isTyping: false, send: vi.fn() })
    renderPanel()

    expect(screen.getByText('VIGÍA AI')).toBeInTheDocument()
    expect(screen.getByText('Asistente inteligente de monitoreo')).toBeInTheDocument()

    const [{ context, initialMessages }] = vi.mocked(useChat).mock.calls[0]
    // El cliente no es técnico: el modelo nunca recibe confidence/bbox/ids — solo lo que
    // puede explicar en palabras (tag, tipo, prioridad, descripción, comportamiento).
    expect(context.alertas_activas).toEqual([
      { livestock_tag: '#024', type: 'comportamiento_anomalo', priority: 'alta', description: 'Patrón de movimiento errático y aislamiento del rebaño.' },
    ])
    expect(context.detecciones_recientes).toEqual([{ livestock_tag: '#024', behavior: 'anomalo' }])
    const alertaContext = context.alertas_activas[0]
    expect(alertaContext).not.toHaveProperty('confidence')
    const deteccionContext = context.detecciones_recientes[0]
    expect(deteccionContext).not.toHaveProperty('bbox')
    expect(deteccionContext).not.toHaveProperty('confidence')
    expect(deteccionContext).not.toHaveProperty('livestock_id')
    expect(initialMessages).toEqual([
      {
        role: 'assistant',
        content: 'He detectado comportamiento inusual en #024. ¿Deseas ver el análisis?',
        suggested_action: { label: 'Ver análisis', route: '/alertas' },
      },
    ])
  })

  it('envía el mensaje del usuario a través de send() de useChat', () => {
    const send = vi.fn()
    vi.mocked(useChat).mockReturnValue({ messages: [], isTyping: false, send })
    renderPanel()

    fireEvent.change(screen.getByLabelText(/escribe tu pregunta/i), { target: { value: '¿Qué ocurrió con el animal #024?' } })
    fireEvent.click(screen.getByRole('button', { name: /enviar/i }))

    expect(send).toHaveBeenCalledWith('¿Qué ocurrió con el animal #024?')
  })

  it('sin evento_detectado no genera mensaje inicial', () => {
    vi.mocked(useChat).mockReturnValue({ messages: [], isTyping: false, send: vi.fn() })
    render(
      <MemoryRouter>
        <AiAssistantPanel data={{ ...DATA, evento_detectado: null }} />
      </MemoryRouter>,
    )
    const [{ initialMessages }] = vi.mocked(useChat).mock.calls[0]
    expect(initialMessages).toEqual([])
  })
})
