import './KpiCard.css'

// specs/002-dashboard/design.md — las 3 KPI cards SON la navegación (dashboard → 3 botones).
// tone: diferencia visual por tarjeta (auditoría de diseño) — no altera la función.
export default function KpiCard({ icon: Icon, label, value, sublabel, tone = 'accent', onClick }) {
  return (
    <div
      className={`kpi-card kpi-card--${tone}`}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick?.()
        }
      }}
    >
      <div className="kpi-card__icon">
        <Icon width={20} height={20} />
      </div>
      <div className="kpi-card__body">
        <span className="kpi-card__label">{label}</span>
        <span className="kpi-card__value">{value}</span>
        {sublabel && <span className="kpi-card__sublabel">{sublabel}</span>}
      </div>
    </div>
  )
}
