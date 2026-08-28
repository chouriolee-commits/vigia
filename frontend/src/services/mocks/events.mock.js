import { ALERTS, DETECTIONS, MISSION_EVENT, POTRERO } from './seed'

// Contrato: specs/012-events-log/design.md — "query derivada", sin tabla `events` propia.
// Se construye por unión de alerts + detections anómalas + eventos de misión, igual que
// haría el backend en fase 2 (008-postgresql-data-model/design.md, "Query de eventos de hoy").
export function getEventsTodayMock() {
  const fromAlerts = ALERTS.map((a) => ({
    id: `alert-${a.id}`,
    type: 'alerta',
    title: a.title,
    description: a.description,
    occurred_at: a.created_at,
    related_livestock_tag: a.livestock_tag,
    related_potrero_name: POTRERO.name,
    related_alert_id: a.id,
  }))

  const fromDetections = DETECTIONS.filter((d) => d.behavior === 'anomalo').map((d) => ({
    id: `det-${d.id}`,
    type: 'deteccion',
    title: 'Comportamiento anómalo detectado',
    description: `${d.livestock_tag ?? 'Animal no identificado'} — confidence ${Math.round(d.confidence * 100)}%`,
    occurred_at: d.detected_at,
    related_livestock_tag: d.livestock_tag,
    related_potrero_name: POTRERO.name,
    related_alert_id: null,
  }))

  const fromMissions = [
    {
      id: MISSION_EVENT.id,
      type: 'mision',
      title: MISSION_EVENT.title,
      description: MISSION_EVENT.description,
      occurred_at: MISSION_EVENT.occurred_at,
      related_livestock_tag: null,
      related_potrero_name: POTRERO.name,
      related_alert_id: null,
    },
  ]

  return [...fromAlerts, ...fromDetections, ...fromMissions].sort(
    (a, b) => new Date(b.occurred_at) - new Date(a.occurred_at),
  )
}
