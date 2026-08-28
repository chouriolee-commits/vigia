import DetectionLabel from './DetectionLabel'
import { PawIcon } from './icons'
import './DetectionOverlay.css'

const BEHAVIOR_CLASS = { pastoreo: 'neutral', descanso: 'accent', anomalo: 'alert', desconocido: 'unknown' }

// specs/005-yolov8-detection/design.md — sin imagen real del dron disponible: el "campo" es
// un fondo simulado en CSS (mismo criterio que la ilustración de 013-authentication: 2D, sin
// assets externos). bbox llega normalizado 0–1, re-escala solo con el tamaño del contenedor.
export default function DetectionOverlay({ detections = [] }) {
  return (
    <div className="detection-overlay">
      <div className="detection-overlay__field" aria-hidden="true" />
      {detections.map((d, i) => {
        const showLabel = d.behavior === 'anomalo' || i < 3
        return (
          <div
            key={d.livestock_id ?? `unk-${i}`}
            className={`detection-overlay__box detection-overlay__box--${BEHAVIOR_CLASS[d.behavior] ?? 'neutral'}`}
            style={{
              left: `${d.bbox.x * 100}%`,
              top: `${d.bbox.y * 100}%`,
              width: `${d.bbox.width * 100}%`,
              height: `${d.bbox.height * 100}%`,
            }}
          >
            <PawIcon width={14} height={14} className="detection-overlay__paw" />
            {showLabel && (
              <div className="detection-overlay__tag">
                <DetectionLabel tag={d.livestock_tag} behavior={d.behavior} />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
