import { useMemo } from 'react'
import { useChat } from '../hooks/useChat'
import ChatMessageList from './ChatMessageList'
import ChatInput from './ChatInput'
import { BotIcon } from './icons'
import './AiAssistantPanel.css'

// specs/007-ai-assistant/design.md — `context` es el mismo objeto (alertas + detecciones reales)
// que ya consume el dashboard: esto es lo que hace que la respuesta no sea un chatbot decorativo.
// Nunca llama a aiService directamente: todo pasa por useChat (regla 4 de la tarea).
export default function AiAssistantPanel({ data }) {
  const context = useMemo(
    () => ({
      alertas_activas: data.alertas_activas.map((a) => ({
        livestock_tag: a.livestock_tag,
        type: a.type,
        priority: a.priority,
        description: a.description,
        confidence: a.confidence,
      })),
      detecciones_recientes: data.feed_detecciones,
    }),
    [data],
  )

  // Solo se calcula una vez al montar (useChat guarda el estado inicial con useState) — para
  // cuando este panel se monta, DashboardPage ya garantiza que `data` está cargado.
  const initialMessages = useMemo(() => {
    if (!data.evento_detectado) return []
    return [
      {
        role: 'assistant',
        content: `He detectado comportamiento inusual en ${data.evento_detectado.livestock_tag}. ¿Deseas ver el análisis?`,
        suggested_action: { label: 'Ver análisis', route: '/alertas' },
      },
    ]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const { messages, isTyping, send } = useChat({ context, initialMessages })

  return (
    <section className="ai-assistant-panel">
      <header className="ai-assistant-panel__header">
        <span className="ai-assistant-panel__icon" aria-hidden="true">
          <BotIcon width={20} height={20} />
        </span>
        <div>
          <h2 className="ai-assistant-panel__title">
            VIGÍA AI
            <span className="ai-assistant-panel__status" aria-hidden="true" />
          </h2>
          <p className="ai-assistant-panel__subtitle">Asistente inteligente de monitoreo</p>
        </div>
      </header>

      <ChatMessageList messages={messages} isTyping={isTyping} />
      <ChatInput onSend={send} disabled={isTyping} />
    </section>
  )
}
