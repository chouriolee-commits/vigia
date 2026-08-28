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
  it('pregunta por un animal con alerta activa responde con la descripción exacta, sin mencionar confidence (el cliente no lo entiende)', async () => {
    const reply = await sendMessage('¿qué ocurrió con el animal #024?', CONTEXT)
    expect(reply.role).toBe('assistant')
    expect(reply.content).toContain('Patrón de movimiento errático y aislamiento del rebaño.')
    expect(reply.content).not.toContain('94%')
    expect(reply.content.toLowerCase()).not.toContain('confidence')
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

// specs/003-livestock-monitoring: click en una fila de /animales manda al asistente con
// context.animal_foco -- preguntas sin un #tag explícito deben asumirse sobre ese animal.
describe('aiService.sendMessage con animal_foco (llegó desde /animales)', () => {
  const CONTEXT_CON_FOCO = {
    ...CONTEXT,
    animal_foco: {
      livestock_tag: '#030',
      alias: null,
      species: 'bovino',
      breed: 'Angus',
      status: 'activo',
      potrero: 'Potrero Norte',
      comportamiento: 'pastoreo',
      es_esperado_aqui: true,
    },
  }

  it('pregunta por "raza" o "especie" responde con los datos del animal enfocado', async () => {
    const reply = await sendMessage('¿de qué raza es?', CONTEXT_CON_FOCO)
    expect(reply.content).toContain('#030')
    expect(reply.content).toContain('Angus')
  })

  it('pregunta por "estado" responde con el estado y comportamiento del animal enfocado', async () => {
    const reply = await sendMessage('¿cómo está su estado de salud?', CONTEXT_CON_FOCO)
    expect(reply.content).toContain('activo')
    expect(reply.content.toLowerCase()).toContain('pastoreo')
  })

  it('pregunta por "potrero" responde con la ubicación del animal enfocado', async () => {
    const reply = await sendMessage('¿en qué potrero está?', CONTEXT_CON_FOCO)
    expect(reply.content).toContain('Potrero Norte')
  })

  it('una pregunta genérica (sin match de ninguna regla) igual responde con la ficha del animal enfocado, no el fallback vacío', async () => {
    const reply = await sendMessage('cuéntame más', CONTEXT_CON_FOCO)
    expect(reply.content).toContain('#030')
    expect(reply.content).not.toMatch(/no tengo información específica/i)
  })

  it('preguntar por un #tag distinto al enfocado ignora animal_foco y responde sobre ese otro tag', async () => {
    const reply = await sendMessage('¿qué ocurrió con el animal #024?', CONTEXT_CON_FOCO)
    expect(reply.content).toContain('Patrón de movimiento errático y aislamiento del rebaño.')
  })
})

// specs/006-alert-system: click en una fila de /alertas manda al asistente con
// context.alerta_foco -- preguntas sobre "esta alerta" deben responder con SUS datos,
// no con la alerta más reciente del listado general.
describe('aiService.sendMessage con alerta_foco (llegó desde /alertas)', () => {
  const CONTEXT_CON_ALERTA_FOCO = {
    ...CONTEXT,
    alerta_foco: {
      type: 'animal_faltante',
      priority: 'media',
      status: 'activa',
      title: '#030 no registra detecciones recientes',
      description: '#030 no registra detecciones en Potrero Norte durante la última ventana de monitoreo (2 h).',
      livestock_tag: '#030',
      potrero: 'Potrero Norte',
      created_at: '2026-08-27T09:00:00Z',
    },
  }

  it('pregunta por "tipo" responde con el tipo de la alerta enfocada', async () => {
    const reply = await sendMessage('¿qué tipo de alerta es?', CONTEXT_CON_ALERTA_FOCO)
    expect(reply.content.toLowerCase()).toContain('animal faltante')
  })

  it('pregunta por "prioridad" responde con la prioridad de la alerta enfocada', async () => {
    const reply = await sendMessage('¿qué prioridad tiene?', CONTEXT_CON_ALERTA_FOCO)
    expect(reply.content.toLowerCase()).toContain('media')
  })

  it('pregunta por "potrero" responde con la ubicación de la alerta enfocada', async () => {
    const reply = await sendMessage('¿en qué potrero ocurrió?', CONTEXT_CON_ALERTA_FOCO)
    expect(reply.content).toContain('Potrero Norte')
  })

  it('pregunta "por qué" responde con la descripción de LA ALERTA ENFOCADA, no la más reciente del listado general', async () => {
    const reply = await sendMessage('¿por qué se generó esta alerta?', CONTEXT_CON_ALERTA_FOCO)
    expect(reply.content).toContain('#030 no registra detecciones en Potrero Norte durante la última ventana de monitoreo (2 h).')
    expect(reply.content).not.toContain('Patrón de movimiento errático')
  })

  it('una pregunta genérica igual responde con la ficha de la alerta enfocada, no el fallback vacío', async () => {
    const reply = await sendMessage('cuéntame más', CONTEXT_CON_ALERTA_FOCO)
    expect(reply.content).toContain('#030 no registra detecciones recientes')
    expect(reply.content).not.toMatch(/no tengo información específica/i)
  })

  it('preguntar por "atención" con alerta_foco presente sigue listando todas las alertas activas del dashboard', async () => {
    const reply = await sendMessage('¿qué animales requieren atención?', CONTEXT_CON_ALERTA_FOCO)
    expect(reply.content).toContain('#024')
    expect(reply.content).toContain('#030')
  })
})
