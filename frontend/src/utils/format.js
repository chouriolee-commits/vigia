export function formatTime(isoString) {
  if (!isoString) return '—'
  return new Date(isoString).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export function formatDateTime(isoString) {
  if (!isoString) return '—'
  return new Date(isoString).toLocaleString('es-CO', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatConfidence(value) {
  if (value === null || value === undefined) return '—'
  return `${Math.round(value * 100)}%`
}

export const PRIORITY_LABEL = { baja: 'Baja', media: 'Media', alta: 'Alta', critica: 'Crítica' }
export const ALERT_TYPE_LABEL = {
  comportamiento_anomalo: 'Comportamiento anómalo',
  animal_faltante: 'Animal faltante',
  animal_desconocido: 'Animal desconocido',
  salud: 'Salud',
}
export const BEHAVIOR_LABEL = {
  pastoreo: 'Pastoreo',
  descanso: 'Descanso',
  anomalo: 'Anómalo',
  desconocido: 'Desconocido',
}
export const STATUS_LABEL = {
  activa: 'Activa',
  en_revision: 'En revisión',
  resuelta: 'Resuelta',
  descartada: 'Descartada',
}
