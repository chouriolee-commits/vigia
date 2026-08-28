import { apiFetch, USE_MOCK } from './api'
import { getAssistantReplyMock } from './mocks/ai.mock'
import { delay } from '../utils/delay'

// Contrato: specs/007-ai-assistant/design.md
// `context` viaja siempre — es lo que hace que la respuesta no sea un chatbot decorativo.
export async function sendMessage(text, context) {
  if (USE_MOCK) {
    await delay(400)
    return getAssistantReplyMock(text, context)
  }
  return apiFetch('/api/asistente/mensajes', {
    method: 'POST',
    body: JSON.stringify({ message: text, context }),
  })
}
