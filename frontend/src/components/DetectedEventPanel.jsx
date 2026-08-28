import { Link } from 'react-router-dom'
import { AlertTriangleIcon, PawIcon } from './icons'
import { formatConfidence } from '../utils/format'
import './DetectedEventPanel.css'

// specs/002-dashboard: "Ver análisis →" reutiliza /alertas — nunca crea una pantalla nueva.
export default function DetectedEventPanel({ eventoDetectado }) {
  return (
    <section className="detected-event-panel">
      <h2 className="detected-event-panel__heading">Evento detectado</h2>

      {!eventoDetectado ? (
        <div className="detected-event-panel__empty">
          <AlertTriangleIcon width={22} height={22} />
          <p>Sin eventos recientes</p>
        </div>
      ) : (
        <>
          <div className="detected-event-panel__alert">
            <AlertTriangleIcon width={20} height={20} className="detected-event-panel__alert-icon" />
            <span>{eventoDetectado.titulo}</span>
          </div>

          <div className="detected-event-panel__animal">
            <span className="detected-event-panel__avatar" aria-hidden="true">
              <PawIcon width={22} height={22} />
            </span>
            <span className="detected-event-panel__tag mono">Animal {eventoDetectado.livestock_tag}</span>
          </div>

          <p className="detected-event-panel__description">{eventoDetectado.descripcion}</p>

          <div className="detected-event-panel__confidence">
            <div className="detected-event-panel__confidence-row">
              <span>Confidence</span>
              <span className="mono">{formatConfidence(eventoDetectado.confidence)}</span>
            </div>
            <div className="detected-event-panel__bar">
              <div className="detected-event-panel__bar-fill" style={{ width: formatConfidence(eventoDetectado.confidence) }} />
            </div>
          </div>

          <Link to="/alertas" className="detected-event-panel__link">
            Ver análisis →
          </Link>
        </>
      )}
    </section>
  )
}
