import { useCallback, useEffect, useRef, useState } from 'react'
import DetectionOverlay from './DetectionOverlay'
import CapturedImagesModal from './CapturedImagesModal'
import { CameraIcon } from './icons'
import { formatTime } from '../utils/format'
import { startSimulation } from '../services/simulationService'
import './LiveFeedPanel.css'

const MAX_CAPTURES = 12
const CAPTURE_INTERVAL_MS = 12000
const MAX_BOXES = 5

// Videos ya disponibles en frontend/public/video — cambiar acá no requiere pisar
// archivos por terminal. Cada opción está mapeada a UN potrero: al elegir un
// video, se le pide al backend (POST /api/simulacion) que arranque un escaneo
// real de vision/simulator.py contra ESE video/potrero — el panel deja de ser
// solo cosmético, el conteo del dashboard sí cambia con la selección.
const VIDEO_OPTIONS = [
  { key: 'corral-vertical', label: 'Corral (vertical)', file: 'corral-vertical.mp4', potreroId: 1 },
  { key: 'pastizal-suelo', label: 'Pastizal (suelo)', file: 'pastizal-suelo.mp4', potreroId: 2 },
  { key: 'pastizal-aereo', label: 'Pastizal (aéreo)', file: 'pastizal-aereo.mp4', potreroId: 3 },
]
const VIDEO_STORAGE_KEY = 'vigia_video_seleccionado'

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
  const [videoKey, setVideoKey] = useState(() => {
    try {
      return window.localStorage.getItem(VIDEO_STORAGE_KEY) || VIDEO_OPTIONS[0].key
    } catch {
      return VIDEO_OPTIONS[0].key
    }
  })
  const nextIdRef = useRef(0)

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const [escaneando, setEscaneando] = useState(false)

  function iniciarEscaneo(opcion) {
    setEscaneando(true)
    startSimulation(opcion.potreroId, opcion.file)
      .catch(() => {
        // No bloquea la vista previa del video si el backend no está disponible
        // (ej. modo mock, o backend caído) — solo se pierde el escaneo real.
      })
      .finally(() => setEscaneando(false))
  }

  // Arranca el escaneo de la opción por defecto al montar (no solo al cambiar).
  useEffect(() => {
    iniciarEscaneo(VIDEO_OPTIONS.find((v) => v.key === videoKey) ?? VIDEO_OPTIONS[0])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleVideoChange(event) {
    const key = event.target.value
    setVideoKey(key)
    try {
      window.localStorage.setItem(VIDEO_STORAGE_KEY, key)
    } catch {
      // localStorage no disponible (ej. navegación privada) — la selección solo
      // dura la sesión actual de la pestaña, degradación aceptada.
    }
    const opcion = VIDEO_OPTIONS.find((v) => v.key === key)
    if (opcion) iniciarEscaneo(opcion)
  }

  const videoOpcionActual = VIDEO_OPTIONS.find((v) => v.key === videoKey) ?? VIDEO_OPTIONS[0]
  const videoSrc = `/video/${videoOpcionActual.file}`

  const handleCapture = useCallback((dataUrl) => {
    nextIdRef.current += 1
    const capture = { id: nextIdRef.current, dataUrl, capturedAt: new Date() }
    setCaptures((prev) => [capture, ...prev].slice(0, MAX_CAPTURES))
  }, [])

  return (
    <section className="live-feed-panel">
      <div className="live-feed-panel__header">
        <h2 className="live-feed-panel__heading">Monitoreo actual</h2>
        <div className="live-feed-panel__video-controls">
          {escaneando && <span className="live-feed-panel__scanning">Iniciando escaneo…</span>}
          <label className="live-feed-panel__video-select">
            <span className="sr-only">Video de la fuente</span>
            <select value={videoKey} onChange={handleVideoChange}>
              {VIDEO_OPTIONS.map((opt) => (
                <option key={opt.key} value={opt.key}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

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
              key={videoKey}
              detections={(detections ?? []).slice(0, MAX_BOXES)}
              videoSrc={videoSrc}
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
