import { BellIcon, AlertTriangleIcon, DroneIcon } from './icons'
import './EventTypeIcon.css'

// specs/012-events-log/design.md — ícono distinto por tipo de evento (alerta/detección/misión).
const ICON_BY_TYPE = { alerta: BellIcon, deteccion: AlertTriangleIcon, mision: DroneIcon }
const LABEL_BY_TYPE = { alerta: 'Alerta', deteccion: 'Detección', mision: 'Misión' }

export default function EventTypeIcon({ type }) {
  const Icon = ICON_BY_TYPE[type] ?? AlertTriangleIcon
  return (
    <span className="event-type-icon">
      <Icon width={16} height={16} />
      {LABEL_BY_TYPE[type] ?? type}
    </span>
  )
}
