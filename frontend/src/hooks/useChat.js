import { useCallback, useState } from 'react'
import { sendMessage as sendMessageToAssistant } from '../services/aiService'

let nextId = 1

// specs/007-ai-assistant/design.md — `context` viaja en cada mensaje (alertas + detecciones reales).
export function useChat({ context, initialMessages = [] } = {}) {
  const [messages, setMessages] = useState(() =>
    initialMessages.map((m) => ({ id: nextId++, ...m })),
  )
  const [isTyping, setIsTyping] = useState(false)

  const send = useCallback(
    async (text) => {
      const trimmed = text.trim()
      if (!trimmed) return

      setMessages((prev) => [...prev, { id: nextId++, role: 'user', content: trimmed }])
      setIsTyping(true)
      try {
        const reply = await sendMessageToAssistant(trimmed, context)
        setMessages((prev) => [...prev, { id: nextId++, ...reply }])
      } catch {
        setMessages((prev) => [
          ...prev,
          { id: nextId++, role: 'assistant', content: 'No pude responder en este momento. Intenta de nuevo.' },
        ])
      } finally {
        setIsTyping(false)
      }
    },
    [context],
  )

  return { messages, isTyping, send }
}
