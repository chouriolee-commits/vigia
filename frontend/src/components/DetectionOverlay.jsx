import { useEffect, useRef, useState } from 'react'
import DetectionLabel from './DetectionLabel'
import { MuteIcon, UnmuteIcon, PawIcon } from './icons'
import './DetectionOverlay.css'

const BEHAVIOR_CLASS = { pastoreo: 'neutral', descanso: 'accent', anomalo: 'alert', desconocido: 'unknown' }

// specs/005-yolov8-detection/design.md — sin imagen real del dron disponible: el "campo" es
// un fondo simulado en CSS (mismo criterio que la ilustración de 013-authentication: 2D, sin
// assets externos), salvo que se pase `videoSrc` (video real comprimido en /public/video).
// bbox llega normalizado 0–1, re-escala solo con el tamaño del contenedor.
//
// El <video> arranca `muted` porque los navegadores bloquean el autoplay con sonido; el botón
// de mute permite al usuario activarlo manualmente (gesto explícito, sí lo permiten).
//
// `onCapture` (opcional): si se pasa junto con `videoSrc`, cada `captureIntervalMs` se dibuja el
// frame actual del video en un <canvas> oculto y se entrega como data URL — alimenta la galería
// de "imágenes capturadas" (004-drone-media) sin depender del pipeline de detección.
// Rectángulo del video "sin transformar": ocupa el contenedor completo — es lo correcto
// cuando no hay video real (fondo simulado) o antes de conocer las dimensiones reales.
const VIDEO_RECT_COMPLETO = { left: 0, top: 0, width: 1, height: 1 }

export default function DetectionOverlay({ detections = [], videoSrc = null, onCapture = null, captureIntervalMs = 12000 }) {
  const videoRef = useRef(null)
  const containerRef = useRef(null)
  const [muted, setMuted] = useState(true)
  const [videoRect, setVideoRect] = useState(VIDEO_RECT_COMPLETO)
  const onCaptureRef = useRef(onCapture)

  useEffect(() => {
    onCaptureRef.current = onCapture
  }, [onCapture])

  // El contenedor tiene un aspect-ratio fijo (16:9) y el <video> usa object-fit:contain,
  // así que un video con otra proporción (ej. vertical) queda "pillarboxed" — no ocupa el
  // ancho/alto completo del contenedor. Sin este cálculo, las cajas normalizadas 0-1 se
  // dibujan como si el video sí ocupara todo el contenedor, y terminan flotando fuera de
  // la imagen real. Se recalcula solo cuando se conocen las dimensiones reales del video
  // (loadedmetadata) — el contenedor no cambia de proporción con el resize de ventana.
  function recalcularVideoRect() {
    const video = videoRef.current
    const container = containerRef.current
    if (!video || !container || !video.videoWidth || !video.videoHeight) return

    const cw = container.clientWidth
    const ch = container.clientHeight
    const videoAspect = video.videoWidth / video.videoHeight
    const containerAspect = cw / ch

    const renderedWidth = videoAspect > containerAspect ? cw : ch * videoAspect
    const renderedHeight = videoAspect > containerAspect ? cw / videoAspect : ch

    setVideoRect({
      left: (cw - renderedWidth) / 2 / cw,
      top: (ch - renderedHeight) / 2 / ch,
      width: renderedWidth / cw,
      height: renderedHeight / ch,
    })
  }

  useEffect(() => {
    if (!videoSrc) setVideoRect(VIDEO_RECT_COMPLETO)
  }, [videoSrc])

  useEffect(() => {
    if (!videoSrc) return undefined
    const id = setInterval(() => {
      const video = videoRef.current
      if (!onCaptureRef.current || !video || video.readyState < 2 || !video.videoWidth) return
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      onCaptureRef.current(canvas.toDataURL('image/jpeg', 0.7))
    }, captureIntervalMs)
    return () => clearInterval(id)
  }, [videoSrc, captureIntervalMs])

  function toggleMuted() {
    setMuted((prev) => !prev)
  }

  return (
    <div ref={containerRef} className={`detection-overlay${videoSrc ? ' detection-overlay--video' : ''}`}>
      {videoSrc ? (
        <>
          <video
            ref={videoRef}
            className="detection-overlay__video"
            src={videoSrc}
            autoPlay
            muted={muted}
            playsInline
            aria-hidden="true"
            onLoadedMetadata={recalcularVideoRect}
          />
          <button
            type="button"
            className="detection-overlay__mute-btn"
            onClick={toggleMuted}
            aria-label={muted ? 'Activar audio' : 'Silenciar audio'}
          >
            {muted ? <MuteIcon width={16} height={16} /> : <UnmuteIcon width={16} height={16} />}
          </button>
        </>
      ) : (
        <div className="detection-overlay__field" aria-hidden="true" />
      )}
      {detections.map((d, i) => {
        const showLabel = d.behavior === 'anomalo' || i < 3
        return (
          <div
            key={`${d.livestock_id ?? 'unk'}-${i}`}
            className={`detection-overlay__box detection-overlay__box--${BEHAVIOR_CLASS[d.behavior] ?? 'neutral'}`}
            style={{
              left: `${(videoRect.left + d.bbox.x * videoRect.width) * 100}%`,
              top: `${(videoRect.top + d.bbox.y * videoRect.height) * 100}%`,
              width: `${d.bbox.width * videoRect.width * 100}%`,
              height: `${d.bbox.height * videoRect.height * 100}%`,
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
