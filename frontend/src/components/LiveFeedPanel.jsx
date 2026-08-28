import { useCallback, useEffect, useRef, useState } from 'react'
import DetectionOverlay from './DetectionOverlay'
import CapturedImagesModal from './CapturedImagesModal'
import { CameraIcon } from './icons'
import { formatTime } from '../utils/format'
import './LiveFeedPanel.css'

const MAX_CAPTURES = 12
const CAPTURE_INTERVAL_MS = 12000
const MAX_BOXES = 5

// specs/004-drone-media/design.md — video real (frontend/public/video) con bounding boxes reales:
// vision/simulator.py ahora "reconoce" cada detección contra el inventario real del potrero
// (round-robin, no es re-id real) y simula salud (fiebre/celo/parto) — las cajas ya traen
// livestock_tag real en vez de "Animal no identificado". Siguen sin sincronizarse frame a frame
// con el loop del video (corrida puntual del simulador), así que se limitan a MAX_BOXES para que
// no se vea desordenado. `detections` es `feed_detecciones` de GET /api/dashboard, pasado por
// DashboardPage (useDashboardData). `loading`/`error` también vienen de ahí.
//
// "Revisar imágenes capturadas": en vez de depender del pipeline de detección, DetectionOverlay
// toma un snapshot del video real cada CAPTURE_INTERVAL_MS y este panel guarda los últimos
// MAX_CAPTURES en memoria (no persisten al recargar) para mostrarlos en CapturedImagesModal.
export default function LiveFeedPanel({ detections, loading, error }) {
  const [now, setNow] = useState(() => new Date())
  const [captures, setCaptures] = useState([])
  const [galleryOpen, setGalleryOpen] = useState(false)
  const nextIdRef = useRef(0)

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const handleCapture = useCallback((dataUrl) => {
    nextIdRef.current += 1
    const capture = { id: nextIdRef.current, dataUrl, capturedAt: new Date() }
    setCaptures((prev) => [capture, ...prev].slice(0, MAX_CAPTURES))
  }, [])

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
            <DetectionOverlay
              detections={(detections ?? []).slice(0, MAX_BOXES)}
              videoSrc="/video/video-vacas.mp4"
              onCapture={handleCapture}
              captureIntervalMs={CAPTURE_INTERVAL_MS}
            />
            <span className="live-feed-panel__badge">
              <span className="live-feed-panel__badge-dot" aria-hidden="true" />
              VIVO
            </span>
            <span className="live-feed-panel__timestamp mono">{formatTime(now.toISOString())}</span>
          </>
        )}
      </div>

      <button type="button" className="live-feed-panel__gallery-btn" onClick={() => setGalleryOpen(true)}>
        <CameraIcon width={18} height={18} />
        Revisar imágenes capturadas
        {captures.length > 0 && <span className="live-feed-panel__gallery-count">{captures.length}</span>}
      </button>

      <CapturedImagesModal open={galleryOpen} captures={captures} onClose={() => setGalleryOpen(false)} />
    </section>
  )
}
