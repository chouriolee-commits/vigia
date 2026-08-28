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
export default function DetectionOverlay({ detections = [], videoSrc = null, onCapture = null, captureIntervalMs = 12000 }) {
  const videoRef = useRef(null)
  const [muted, setMuted] = useState(true)
  const onCaptureRef = useRef(onCapture)

  useEffect(() => {
    onCaptureRef.current = onCapture
  }, [onCapture])

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
    <div className={`detection-overlay${videoSrc ? ' detection-overlay--video' : ''}`}>
      {videoSrc ? (
        <>
          <video
            ref={videoRef}
            className="detection-overlay__video"
            src={videoSrc}
            autoPlay
            loop
            muted={muted}
            playsInline
            aria-hidden="true"
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
