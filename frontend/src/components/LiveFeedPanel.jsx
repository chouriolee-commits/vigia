import { useLiveFeed } from '../hooks/useLiveFeed'
import DetectionOverlay from './DetectionOverlay'
import { CameraIcon } from './icons'
import { formatTime } from '../utils/format'
import './LiveFeedPanel.css'

// specs/004-drone-media/design.md — feed 100% mock, embebido en 002-dashboard (no es pantalla propia).
export default function LiveFeedPanel() {
  const { frame, now, loading, error } = useLiveFeed()

  return (
    <section className="live-feed-panel">
      <h2 className="live-feed-panel__heading">Monitoreo actual</h2>

      <div className="live-feed-panel__frame">
        {loading && (
          <div className="live-feed-panel__status" role="status">
            Cargando feed en vivo…
          </div>
        )}
        {!loading && error && (
          <div className="live-feed-panel__status live-feed-panel__status--error" role="alert">
            No se pudo cargar el feed en vivo.
          </div>
        )}
        {!loading && !error && (
          <>
            <DetectionOverlay detections={frame?.detections ?? []} />
            <span className="live-feed-panel__badge">
              <span className="live-feed-panel__badge-dot" aria-hidden="true" />
              VIVO
            </span>
            <span className="live-feed-panel__timestamp mono">{formatTime(now.toISOString())}</span>
          </>
        )}
      </div>

      {/*
        specs/004-drone-media: botón fiel al diseño, sin navegación en el MVP (galería eliminada
        de la auditoría). Se evita `disabled` real para que siga siendo focuseable/accesible.
      */}
      <button type="button" className="live-feed-panel__gallery-btn" title="Próximamente" aria-disabled="true">
        <CameraIcon width={18} height={18} />
        Revisar imágenes capturadas
      </button>
    </section>
  )
}
