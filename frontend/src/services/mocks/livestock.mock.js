import { DETECTIONS, LIVESTOCK, POTRERO } from './seed'

// Contrato: specs/003-livestock-monitoring/design.md — GET /api/potreros/{id}/reconciliacion
export function getReconciliationMock(potreroId = POTRERO.id) {
  const potrero = potreroId === POTRERO.id ? POTRERO : { id: potreroId, name: `Potrero ${potreroId}` }

  const detectionsHere = DETECTIONS.filter((d) => d.potrero_id === potreroId)
  const expectedTags = new Set(LIVESTOCK.filter((l) => l.potrero_id === potreroId).map((l) => l.livestock_id))

  const animales_reales = detectionsHere.map((d) => ({
    livestock_id: d.livestock_id,
    livestock_tag: d.livestock_tag,
    alias: d.livestock_id ? null : 'Animal no identificado',
    detected_at: d.detected_at,
    behavior: d.behavior,
    confidence: d.confidence,
    es_esperado_aqui: d.livestock_id !== null && expectedTags.has(d.livestock_id),
  }))

  const detectedIds = new Set(detectionsHere.map((d) => d.livestock_id).filter(Boolean))

  const animales_esperados = LIVESTOCK.filter((l) => l.potrero_id === potreroId).map((l) => ({
    livestock_id: l.livestock_id,
    livestock_tag: l.livestock_tag,
    species: l.species,
    breed: l.breed,
    status: l.status,
    detectado_recientemente: detectedIds.has(l.livestock_id),
  }))

  return { potrero, ventana_horas: 2, animales_reales, animales_esperados }
}
