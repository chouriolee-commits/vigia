import { useCallback, useEffect, useRef, useState } from 'react'
import DetectionOverlay from './DetectionOverlay'
import CapturedImagesModal from './CapturedImagesModal'
import { CameraIcon } from './icons'
import { formatTime } from '../utils/format'
import './LiveFeedPanel.css'

const MAX_CAPTURES = 12
const CAPTURE_INTERVAL_MS = 12000

// specs/004-drone-media/design.md — video real (frontend/public/video), sin bounding boxes: las
// detecciones de vision/simulator.py son reales pero vienen de una corrida puntual (no sincronizada
// frame a frame con el loop del video) y con yolov8n-COCO sub-detecta bastante footage aéreo real
// (desajuste de dominio, ver skills/roboflow) — mostrarlas encima del video se ve más incoherente
// que informativo para el prototipo. `loading`/`error` vienen de DashboardPage (useDashboardData).
//
// "Revisar imágenes capturadas": en vez de depender del pipeline de detección, DetectionOverlay
// toma un snapshot del video real cada CAPTURE_INTERVAL_MS y este panel guarda los últimos
// MAX_CAPTURES en memoria (no persisten al recargar) para mostrarlos en CapturedImagesModal.
export default function LiveFeedPanel({ loading, error }) {
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
