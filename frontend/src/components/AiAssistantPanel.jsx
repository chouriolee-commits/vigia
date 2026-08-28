import { useMemo } from 'react'
import { useChat } from '../hooks/useChat'
import ChatMessageList from './ChatMessageList'
import ChatInput from './ChatInput'
import { BotIcon } from './icons'
import { formatDateTime, BEHAVIOR_LABEL } from '../utils/format'
import './AiAssistantPanel.css'

// specs/007-ai-assistant/design.md — `context` es el mismo objeto (alertas + detecciones reales)
// que ya consume el dashboard: esto es lo que hace que la respuesta no sea un chatbot decorativo.
// Nunca llama a aiService directamente: todo pasa por useChat (regla 4 de la tarea).
//
// `animalFoco` (opcional): llega desde /animales cuando el usuario hace click en un animal de
// la tabla (LivestockMonitoringPage → navigate('/', { state: { animalFoco } })). Cuando está
// presente, el mensaje inicial del asistente pasa a ser la ficha completa de ESE animal en vez
// del aviso genérico de evento_detectado, y el contexto que viaja al modelo incluye sus datos
// para que las preguntas de seguimiento ("¿por qué está así?", "¿qué raza es?") tengan grounding.
export default function AiAssistantPanel({ data, animalFoco }) {
  // El cliente no es técnico: el contexto que le llega al modelo (mock o Groq real) solo
  // trae campos que un productor entiende. Nunca se manda bbox/coordenadas/ids/confidence —
  // así el dato técnico no puede "salírsele" al modelo en una respuesta, porque nunca lo tiene.
  const context = useMemo(
    () => ({
      alertas_activas: data.alertas_activas.map((a) => ({
        livestock_tag: a.livestock_tag,
        type: a.type,
        priority: a.priority,
        description: a.description,
      })),
      detecciones_recientes: data.feed_detecciones.map((d) => ({
        livestock_tag: d.livestock_tag,
        behavior: d.behavior,
      })),
      ...(animalFoco && {
        animal_foco: {
          livestock_tag: animalFoco.livestock_tag,
          alias: animalFoco.alias,
          species: animalFoco.species,
          breed: animalFoco.breed,
          status: animalFoco.status,
          potrero: animalFoco.potrero,
          comportamiento: animalFoco.comportamiento,
          es_esperado_aqui: animalFoco.es_esperado_aqui,
        },
      }),
    }),
    [data, animalFoco],
  )

  // Solo se calcula una vez al montar (useChat guarda el estado inicial con useState) — como
  // esta página se monta de nuevo cada vez que se navega a "/" (React Router desmonta la
  // anterior), llegar aquí desde /animales con un animalFoco distinto sí produce un mensaje
  // inicial nuevo y correcto, aunque el valor no sea reactivo dentro de una misma visita.
  const initialMessages = useMemo(() => {
    if (animalFoco) {
      const ficha = [
        `Aquí tienes la información de ${animalFoco.livestock_tag}${animalFoco.alias ? ` ("${animalFoco.alias}")` : ''}:`,
        `• Especie/raza: ${animalFoco.species ?? '—'} / ${animalFoco.breed ?? '—'}`,
        `• Estado: ${animalFoco.status ?? '—'}`,
        `• Potrero: ${animalFoco.potrero ?? '—'}`,
        `• Última detección: ${animalFoco.ultima_deteccion ? formatDateTime(animalFoco.ultima_deteccion) : 'sin detecciones recientes'}`,
        `• Comportamiento: ${animalFoco.comportamiento ? (BEHAVIOR_LABEL[animalFoco.comportamiento] ?? animalFoco.comportamiento) : '—'}`,
        '',
        '¿Qué quieres saber sobre este animal?',
      ]
      return [{ role: 'assistant', content: ficha.join('\n') }]
    }
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
