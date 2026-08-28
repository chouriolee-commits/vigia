import { useEffect } from 'react'
import { CameraIcon } from './icons'
import { formatTime } from '../utils/format'
import './CapturedImagesModal.css'

// specs/004-drone-media/design.md — galería de capturas: snapshots del video real tomados
// automáticamente por DetectionOverlay (onCapture), no del pipeline de detección (poco confiable
// hoy, ver skills/roboflow). Reemplaza el botón "Próximamente" original.
export default function CapturedImagesModal({ open, captures, onClose }) {
  useEffect(() => {
    if (!open) return undefined
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="captured-images-modal__backdrop" onClick={onClose}>
      <div
        className="captured-images-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Imágenes capturadas"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="captured-images-modal__header">
          <h2>Imágenes capturadas</h2>
          <button type="button" className="captured-images-modal__close" onClick={onClose} aria-label="Cerrar">
            ×
          </button>
        </div>

        {captures.length === 0 ? (
          <div className="captured-images-modal__empty">
            <CameraIcon width={28} height={28} />
            <p>Aún no hay imágenes capturadas. El feed toma una automáticamente cada pocos segundos.</p>
          </div>
        ) : (
          <div className="captured-images-modal__grid">
            {captures.map((c) => (
              <figure key={c.id} className="captured-images-modal__item">
                <img src={c.dataUrl} alt={`Captura de ${formatTime(c.capturedAt.toISOString())}`} />
                <figcaption className="mono">{formatTime(c.capturedAt.toISOString())}</figcaption>
              </figure>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
