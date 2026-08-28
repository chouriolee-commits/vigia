import './StatusBadge.css'

// Tonos semánticos — mapean a los tokens de skills/frontend/skill.md.
// tone: 'accent' | 'danger' | 'warning' | 'info' | 'neutral'
export default function StatusBadge({ tone = 'neutral', children }) {
  return <span className={`status-badge status-badge--${tone}`}>{children}</span>
}

export const PRIORITY_TONE = { baja: 'neutral', media: 'info', alta: 'warning', critica: 'danger' }
export const ALERT_STATUS_TONE = { activa: 'danger', en_revision: 'warning', resuelta: 'accent', descartada: 'neutral' }
export const RECONCILIATION_TONE = { ok: 'accent', faltante: 'danger', desconocido: 'warning' }
