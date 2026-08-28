import { getActiveAlertsMock } from './alerts.mock'
import { getEventsTodayMock } from './events.mock'
import { DETECTIONS, LIVESTOCK, MIN_DETECTION_CONFIDENCE } from './seed'

// Contrato: specs/002-dashboard/design.md — GET /api/dashboard
export function getDashboardSummaryMock() {
  const alertas_activas = getActiveAlertsMock()
  const top = alertas_activas[0] ?? null

  return {
    animales_monitoreados: { total: LIVESTOCK.length, actualizado_at: new Date().toISOString() },
    alertas_activas,
    eventos_hoy: { total: getEventsTodayMock().length },
    evento_detectado: top && {
      livestock_id: top.livestock_id,
      livestock_tag: top.livestock_tag,
      titulo: 'Atención requerida',
      descripcion: top.description,
      confidence: top.confidence,
      alert_id: top.id,
    },
    feed_detecciones: DETECTIONS.filter((d) => d.confidence >= MIN_DETECTION_CONFIDENCE).map((d) => ({
      livestock_id: d.livestock_id,
      livestock_tag: d.livestock_tag,
      bbox: d.bbox,
      behavior: d.behavior,
    })),
  }
}
