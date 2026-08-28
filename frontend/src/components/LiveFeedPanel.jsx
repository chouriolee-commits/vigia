import { useCallback, useEffect, useRef, useState } from 'react'
import DetectionOverlay from './DetectionOverlay'
import CapturedImagesModal from './CapturedImagesModal'
import { CameraIcon } from './icons'
import { formatTime } from '../utils/format'
import { startSimulation } from '../services/simulationService'
import { usePotreros } from '../hooks/usePotreros'
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
// Un potrero por id, en el mismo orden que aparecen sus videos arriba -- la
// selección real siempre pasa primero por acá (potrero) y recién después por
// VIDEO_OPTIONS filtrado a ese potrero (video).
const POTRERO_IDS = [...new Set(VIDEO_OPTIONS.map((v) => v.potreroId))]
const VIDEO_STORAGE_KEY = 'vigia_video_seleccionado'
const POTRERO_STORAGE_KEY = 'vigia_potrero_seleccionado'

function seleccionInicial() {
  try {
    const potreroGuardado = Number(window.localStorage.getItem(POTRERO_STORAGE_KEY))
    const potreroId = POTRERO_IDS.includes(potreroGuardado) ? potreroGuardado : POTRERO_IDS[0]
    const videoGuardado = window.localStorage.getItem(VIDEO_STORAGE_KEY)
    const opcionGuardada = VIDEO_OPTIONS.find((v) => v.key === videoGuardado && v.potreroId === potreroId)
    const videoKey = opcionGuardada ? opcionGuardada.key : VIDEO_OPTIONS.find((v) => v.potreroId === potreroId).key
    return { potreroId, videoKey }
  } catch {
    return { potreroId: POTRERO_IDS[0], videoKey: VIDEO_OPTIONS[0].key }
  }
}

function persistirSeleccion(potreroId, videoKey) {
  try {
    window.localStorage.setItem(POTRERO_STORAGE_KEY, String(potreroId))
    window.localStorage.setItem(VIDEO_STORAGE_KEY, videoKey)
  } catch {
    // localStorage no disponible (ej. navegación privada) — la selección solo
    // dura la sesión actual de la pestaña, degradación aceptada.
  }
}

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
  const { potreros } = usePotreros()
  const [now, setNow] = useState(() => new Date())
  const [captures, setCaptures] = useState([])
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [seleccion, setSeleccion] = useState(seleccionInicial)
  const { potreroId, videoKey } = seleccion
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
  // Guard con ref: en desarrollo, StrictMode monta/desmonta/monta este efecto dos
  // veces a propósito -- sin esto, cada carga de página disparaba DOS escaneos
  // seguidos (el primero quedaba a medias, con una misión y un par de detecciones
  // sueltas antes de que el segundo lo matara), ensuciando los datos del potrero.
  const yaInicioRef = useRef(false)
  useEffect(() => {
    if (yaInicioRef.current) return
    yaInicioRef.current = true
    iniciarEscaneo(VIDEO_OPTIONS.find((v) => v.key === videoKey) ?? VIDEO_OPTIONS[0])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Paso 1: elegir el potrero -- se autoselecciona su primer (y hoy único) video
  // y arranca el escaneo de una. Paso 2 (abajo) deja elegir OTRO video para ese
  // mismo potrero si en el futuro hay más de uno mapeado.
  function handlePotreroChange(event) {
    const id = Number(event.target.value)
    const primerVideo = VIDEO_OPTIONS.find((v) => v.potreroId === id)
    if (!primerVideo) return
    setSeleccion({ potreroId: id, videoKey: primerVideo.key })
    persistirSeleccion(id, primerVideo.key)
    iniciarEscaneo(primerVideo)
  }

  function handleVideoChange(event) {
    const key = event.target.value
    const opcion = VIDEO_OPTIONS.find((v) => v.key === key)
    if (!opcion) return
    setSeleccion({ potreroId: opcion.potreroId, videoKey: opcion.key })
    persistirSeleccion(opcion.potreroId, opcion.key)
    iniciarEscaneo(opcion)
  }

  const videoOpcionActual = VIDEO_OPTIONS.find((v) => v.key === videoKey) ?? VIDEO_OPTIONS[0]
  const videoSrc = `/video/${videoOpcionActual.file}`
  const videosDelPotrero = VIDEO_OPTIONS.filter((v) => v.potreroId === potreroId)
  const potreroActual = potreros.find((p) => p.id === potreroId)
  const potreroNombre = potreroActual?.name ?? `Potrero ${potreroId}`

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
            <span className="sr-only">Potrero a escanear</span>
            <select value={potreroId} onChange={handlePotreroChange}>
              {POTRERO_IDS.map((id) => (
                <option key={id} value={id}>
                  {potreros.find((p) => p.id === id)?.name ?? `Potrero ${id}`}
                </option>
              ))}
            </select>
          </label>
          <label className="live-feed-panel__video-select">
            <span className="sr-only">Video de la fuente</span>
            <select value={videoKey} onChange={handleVideoChange}>
              {videosDelPotrero.map((opt) => (
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
            <span className="live-feed-panel__potrero-badge">{potreroNombre}</span>
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
