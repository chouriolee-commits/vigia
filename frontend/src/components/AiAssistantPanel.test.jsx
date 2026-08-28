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

const ANIMAL_FOCO = {
  livestock_id: 30,
  livestock_tag: '#030',
  alias: null,
  species: 'bovino',
  breed: 'Angus',
  status: 'activo',
  potrero: 'Potrero Norte',
  detectado_recientemente: false,
  es_esperado_aqui: false,
  ultima_deteccion: null,
  comportamiento: null,
  confidence: null,
}

const ALERTA_FOCO = {
  livestock_tag: '#030',
  potrero_name: 'Potrero Norte',
  type: 'animal_faltante',
  priority: 'media',
  status: 'activa',
  title: '#030 no registra detecciones recientes',
  description: '#030 no registra detecciones en Potrero Norte durante la última ventana de monitoreo (2 h).',
  confidence: null,
  created_at: '2026-08-27T09:00:00Z',
}

function renderPanel(props = {}) {
  return render(
    <MemoryRouter>
      <AiAssistantPanel data={DATA} {...props} />
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

  it('con animalFoco (llegó desde /animales), el mensaje inicial es la ficha del animal, no el aviso de evento_detectado', () => {
    vi.mocked(useChat).mockReturnValue({ messages: [], isTyping: false, send: vi.fn() })
    renderPanel({ animalFoco: ANIMAL_FOCO })

    const [{ context, initialMessages }] = vi.mocked(useChat).mock.calls[0]
    expect(initialMessages).toHaveLength(1)
    expect(initialMessages[0].content).toContain('#030')
    expect(initialMessages[0].content).toContain('Angus')
    expect(initialMessages[0].content).toContain('Potrero Norte')
    expect(initialMessages[0].suggested_action).toBeUndefined()

    // El contexto que viaja al modelo incluye al animal enfocado, sin ids/confidence.
    expect(context.animal_foco).toEqual({
      livestock_tag: '#030',
      alias: null,
      species: 'bovino',
      breed: 'Angus',
      status: 'activo',
      potrero: 'Potrero Norte',
      comportamiento: null,
      es_esperado_aqui: false,
    })
    expect(context.animal_foco).not.toHaveProperty('livestock_id')
    expect(context.animal_foco).not.toHaveProperty('confidence')
  })

  it('con alertaFoco (llegó desde /alertas), el mensaje inicial es la ficha de la alerta, no el aviso de evento_detectado', () => {
    vi.mocked(useChat).mockReturnValue({ messages: [], isTyping: false, send: vi.fn() })
    renderPanel({ alertaFoco: ALERTA_FOCO })

    const [{ context, initialMessages }] = vi.mocked(useChat).mock.calls[0]
    expect(initialMessages).toHaveLength(1)
    expect(initialMessages[0].content).toContain('#030 no registra detecciones recientes')
    expect(initialMessages[0].content).toContain('Media')
    expect(initialMessages[0].content).toContain('Potrero Norte')
    expect(initialMessages[0].suggested_action).toBeUndefined()

    // El contexto que viaja al modelo incluye la alerta enfocada, sin confidence.
    expect(context.alerta_foco).toEqual({
      type: 'animal_faltante',
      priority: 'media',
      status: 'activa',
      title: '#030 no registra detecciones recientes',
      description: '#030 no registra detecciones en Potrero Norte durante la última ventana de monitoreo (2 h).',
      livestock_tag: '#030',
      potrero: 'Potrero Norte',
      created_at: '2026-08-27T09:00:00Z',
    })
    expect(context.alerta_foco).not.toHaveProperty('confidence')
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
