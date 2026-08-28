import { DETECTIONS, MIN_DETECTION_CONFIDENCE, POTRERO } from './seed'

// Contrato: specs/004-drone-media/design.md + specs/005-yolov8-detection/design.md
// Mismas detecciones que alimentan /animales, /alertas y /eventos — el feed no inventa datos aparte.
export function getLiveFeedFrameMock() {
  const detections = DETECTIONS.filter((d) => d.confidence >= MIN_DETECTION_CONFIDENCE).map((d) => ({
    livestock_id: d.livestock_id,
    livestock_tag: d.livestock_tag,
    bbox: d.bbox,
    behavior: d.behavior,
    confidence: d.confidence,
  }))

  return {
    potreroName: POTRERO.name,
    detections,
  }
}
