// Set de íconos propio (SVG inline, sin librerías) — mismo trazo en toda la app.
const base = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' }

export function PawIcon(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="15" r="4.2" />
      <circle cx="5" cy="9" r="2" />
      <circle cx="9.5" cy="5" r="2" />
      <circle cx="14.5" cy="5" r="2" />
      <circle cx="19" cy="9" r="2" />
    </svg>
  )
}

export function BellIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M6 10a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 14 6 10Z" />
      <path d="M10 19a2 2 0 0 0 4 0" />
    </svg>
  )
}

export function CalendarIcon(props) {
  return (
    <svg {...base} {...props}>
      <rect x="3.5" y="5" width="17" height="15" rx="2" />
      <line x1="3.5" y1="10" x2="20.5" y2="10" />
      <line x1="8" y1="3" x2="8" y2="7" />
      <line x1="16" y1="3" x2="16" y2="7" />
    </svg>
  )
}

export function AlertTriangleIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 4 2.5 20h19L12 4Z" />
      <line x1="12" y1="10" x2="12" y2="14.5" />
      <circle cx="12" cy="17.3" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function ArrowLeftIcon(props) {
  return (
    <svg {...base} {...props}>
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="11,6 5,12 11,18" />
    </svg>
  )
}

export function LogoutIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3" />
      <polyline points="15,8 20,12 15,16" />
      <line x1="20" y1="12" x2="9" y2="12" />
    </svg>
  )
}

export function SendIcon(props) {
  return (
    <svg {...base} {...props}>
      <line x1="21" y1="3" x2="10" y2="14" />
      <polygon points="21,3 14,21 10,14 3,10" />
    </svg>
  )
}

export function BotIcon(props) {
  return (
    <svg {...base} {...props}>
      <rect x="4" y="8" width="16" height="12" rx="3" />
      <line x1="12" y1="4" x2="12" y2="8" />
      <circle cx="12" cy="3" r="1" fill="currentColor" stroke="none" />
      <circle cx="9" cy="14" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="15" cy="14" r="1.3" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function UserIcon(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5 20c1-3.5 4-5.5 7-5.5s6 2 7 5.5" />
    </svg>
  )
}

export function CameraIcon(props) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="7" width="14" height="11" rx="2" />
      <path d="M17 10.5 21 8v8l-4-2.5" />
    </svg>
  )
}

export function DroneIcon(props) {
  return (
    <svg {...base} {...props}>
      <rect x="9.5" y="10.5" width="5" height="3" rx="1" />
      <line x1="9.5" y1="11.5" x2="4.5" y2="6.5" />
      <line x1="14.5" y1="11.5" x2="19.5" y2="6.5" />
      <line x1="9.5" y1="13.5" x2="4.5" y2="18.5" />
      <line x1="14.5" y1="13.5" x2="19.5" y2="18.5" />
      <circle cx="4.5" cy="6.5" r="2" />
      <circle cx="19.5" cy="6.5" r="2" />
      <circle cx="4.5" cy="18.5" r="2" />
      <circle cx="19.5" cy="18.5" r="2" />
    </svg>
  )
}

export function MuteIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M4 9v6h4l5 4V5L8 9H4Z" />
      <line x1="16" y1="9" x2="21" y2="15" />
      <line x1="21" y1="9" x2="16" y2="15" />
    </svg>
  )
}

export function UnmuteIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M4 9v6h4l5 4V5L8 9H4Z" />
      <path d="M16 8.5a5 5 0 0 1 0 7" />
      <path d="M18.5 6a8.5 8.5 0 0 1 0 12" />
    </svg>
  )
}
