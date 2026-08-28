import { ALERT_TYPE_LABEL, BEHAVIOR_LABEL, PRIORITY_LABEL, STATUS_LABEL } from '../../utils/format'

// Heurística de respuesta — specs/007-ai-assistant/design.md.
// Regla no negociable: responde SIEMPRE a partir de `context` (alertas/detecciones reales
// del mismo dashboard), nunca con texto genérico desconectado del sistema.
const FALLBACK = 'No tengo información específica sobre eso todavía. Puedo ayudarte con animales, alertas o eventos recientes.'

function findAnimalTag(message) {
  const match = message.match(/#?(\d{1,4})/)
  return match ? `#${match[1]}` : null
}

export function getAssistantReplyMock(message, context = {}) {
  const alertas = context.alertas_activas ?? []
  const detecciones = context.detecciones_recientes ?? []
  const foco = context.animal_foco ?? null
  const alertaFoco = context.alerta_foco ?? null
  const text = message.toLowerCase()

  const tag = findAnimalTag(message)
  if (tag) {
    const alert = alertas.find((a) => a.livestock_tag === tag)
    if (alert) {
      return {
        role: 'assistant',
        content: `${tag}: ${alert.description} Prioridad ${PRIORITY_LABEL[alert.priority]?.toLowerCase()}.`,
        suggested_action: { label: 'Ver análisis', route: '/alertas' },
      }
    }
    const detection = detecciones.find((d) => d.livestock_tag === tag)
    if (detection) {
      return {
        role: 'assistant',
        content: `${tag} fue detectado con comportamiento "${BEHAVIOR_LABEL[detection.behavior] ?? detection.behavior}". No tiene alertas activas.`,
        suggested_action: { label: 'Ver animales monitoreados', route: '/animales' },
      }
    }
    return { role: 'assistant', content: `No encuentro a ${tag} en las detecciones ni alertas recientes.` }
  }

  // Con un animal enfocado (llegó desde /animales al hacer click en una fila) las preguntas
  // sin un #tag explícito se asumen sobre ESE animal — es lo que el usuario está viendo.
  if (foco) {
    if (text.includes('raza') || text.includes('especie')) {
      return { role: 'assistant', content: `${foco.livestock_tag} es de la especie ${foco.species}, raza ${foco.breed ?? 'sin registrar'}.` }
    }
    if (text.includes('estado') || text.includes('salud')) {
      const comportamiento = foco.comportamiento ? `, con comportamiento reciente "${BEHAVIOR_LABEL[foco.comportamiento] ?? foco.comportamiento}"` : ''
      return { role: 'assistant', content: `${foco.livestock_tag} tiene estado "${foco.status}"${comportamiento}.` }
    }
    if (text.includes('potrero') || text.includes('dónde') || text.includes('donde')) {
      return { role: 'assistant', content: `${foco.livestock_tag} está en ${foco.potrero}.` }
    }
  }

  // Con una alerta enfocada (llegó desde /alertas al hacer click en una fila) las preguntas
  // sobre esta alerta en particular se responden con SUS datos, no con la alerta más reciente
  // del listado general (que es lo que hace el bloque genérico de "por qué" más abajo).
  if (alertaFoco) {
    if (text.includes('tipo')) {
      return { role: 'assistant', content: `Es una alerta de tipo "${ALERT_TYPE_LABEL[alertaFoco.type] ?? alertaFoco.type}".` }
    }
    if (text.includes('prioridad')) {
      return { role: 'assistant', content: `Esta alerta tiene prioridad ${PRIORITY_LABEL[alertaFoco.priority]?.toLowerCase()}.` }
    }
    if (text.includes('estado')) {
      return { role: 'assistant', content: `Esta alerta está en estado "${STATUS_LABEL[alertaFoco.status] ?? alertaFoco.status}".` }
    }
    if (text.includes('potrero') || text.includes('dónde') || text.includes('donde')) {
      return {
        role: 'assistant',
        content: alertaFoco.potrero ? `Ocurrió en ${alertaFoco.potrero}.` : 'Esta alerta no tiene un potrero asociado.',
      }
    }
    if (text.includes('por qué') || text.includes('por que')) {
      return { role: 'assistant', content: `Se generó porque: ${alertaFoco.description ?? alertaFoco.title}.` }
    }
  }

  if (text.includes('atenci')) {
    if (alertas.length === 0) return { role: 'assistant', content: 'Ningún animal requiere atención en este momento.' }
    const lines = alertas
      .map((a) => `${a.livestock_tag ?? 'animal no identificado'} — ${ALERT_TYPE_LABEL[a.type] ?? a.type} (prioridad ${PRIORITY_LABEL[a.priority]?.toLowerCase()})`)
      .join('; ')
    return { role: 'assistant', content: `Animales que requieren atención: ${lines}.`, suggested_action: { label: 'Ver alertas', route: '/alertas' } }
  }

  if (text.includes('último monitoreo') || text.includes('ultimo monitoreo') || text.includes('qué ocurrió') || text.includes('que ocurrio')) {
    if (detecciones.length === 0) return { role: 'assistant', content: 'Todavía no hay detecciones registradas en este monitoreo.' }
    const lines = detecciones
      .slice(0, 4)
      .map((d) => `${d.livestock_tag ?? 'animal no identificado'} (${BEHAVIOR_LABEL[d.behavior] ?? d.behavior})`)
      .join(', ')
    return { role: 'assistant', content: `En el último monitoreo se detectaron: ${lines}.` }
  }

  if (text.includes('por qué') || text.includes('por que')) {
    const latest = alertas[0]
    if (!latest) return { role: 'assistant', content: 'No hay alertas activas para explicar en este momento.' }
    return {
      role: 'assistant',
      content: `La alerta más reciente (${latest.livestock_tag ?? 'sin animal identificado'}) se generó porque: ${latest.description}`,
      suggested_action: { label: 'Ver análisis', route: '/alertas' },
    }
  }

  if (foco) {
    return {
      role: 'assistant',
      content: `${foco.livestock_tag}${foco.alias ? ` (${foco.alias})` : ''}: ${foco.species}/${foco.breed ?? 'raza sin registrar'}, estado ${foco.status}, en ${foco.potrero}.`,
    }
  }

  if (alertaFoco) {
    return {
      role: 'assistant',
      content: `"${alertaFoco.title}" (${ALERT_TYPE_LABEL[alertaFoco.type] ?? alertaFoco.type}, prioridad ${PRIORITY_LABEL[alertaFoco.priority]?.toLowerCase()}): ${alertaFoco.description ?? 'sin descripción adicional'}.`,
    }
  }

  return { role: 'assistant', content: FALLBACK }
}
