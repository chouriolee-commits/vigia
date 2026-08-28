import { describe, it, expect } from 'vitest'
import { sendMessage } from './aiService'

// specs/007-ai-assistant/tests.md — "Críticos (MVP)": cada regla de la heurística debe usar
// el `context` real (nunca una respuesta genérica); este es el test que demuestra que la IA
// del MVP razona sobre datos estructurados reales, no sobre texto libre.
const CONTEXT = {
  alertas_activas: [
    {
      livestock_tag: '#024',
      type: 'comportamiento_anomalo',
      priority: 'alta',
      description: 'Patrón de movimiento errático y aislamiento del rebaño.',
      confidence: 0.94,
    },
    {
      livestock_tag: '#030',
      type: 'animal_faltante',
      priority: 'media',
      description: '#030 no registra detecciones recientes.',
      confidence: null,
    },
  ],
  detecciones_recientes: [
    { livestock_tag: '#055', behavior: 'descanso', confidence: 0.88 },
    { livestock_tag: '#101', behavior: 'pastoreo', confidence: 0.91 },
  ],
}

describe('aiService.sendMessage (heurística MVP sobre context real)', () => {
  it('pregunta por un animal con alerta activa responde con descripción y confidence exactos', async () => {
    const reply = await sendMessage('¿qué ocurrió con el animal #024?', CONTEXT)
    expect(reply.role).toBe('assistant')
    expect(reply.content).toContain('Patrón de movimiento errático y aislamiento del rebaño.')
    expect(reply.content).toContain('94%')
    expect(reply.suggested_action).toEqual({ label: 'Ver análisis', route: '/alertas' })
  })

  it('pregunta por "atención" lista todos los animales con alertas activas (tag + tipo + prioridad)', async () => {
    const reply = await sendMessage('¿qué animales requieren atención?', CONTEXT)
    expect(reply.content).toContain('#024')
    expect(reply.content).toContain('#030')
    expect(reply.content.toLowerCase()).toContain('alta')
    expect(reply.content.toLowerCase()).toContain('media')
  })

  it('pregunta por "último monitoreo" resume las detecciones recientes', async () => {
    const reply = await sendMessage('¿qué ocurrió en el último monitoreo?', CONTEXT)
    expect(reply.content).toContain('#055')
    expect(reply.content).toContain('#101')
  })

  it('pregunta "por qué" responde con la descripción/confidence de la alerta más reciente', async () => {
    const reply = await sendMessage('¿por qué se generó esta alerta?', CONTEXT)
    expect(reply.content).toContain('Patrón de movimiento errático y aislamiento del rebaño.')
  })

  it('sin match responde con el fallback explícito, nunca vacío ni un error', async () => {
    const reply = await sendMessage('¿cuál es el clima hoy?', CONTEXT)
    expect(reply.role).toBe('assistant')
    expect(reply.content).toMatch(/no tengo información específica/i)
  })

  it('pregunta sobre un animal que no existe en el contexto responde con fallback, no un error', async () => {
    const reply = await sendMessage('¿qué pasó con el animal #999?', CONTEXT)
    expect(reply.role).toBe('assistant')
    expect(reply.content).toBeTruthy()
  })
})
