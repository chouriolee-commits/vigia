import { BEHAVIOR_LABEL } from '../utils/format'

// specs/005-yolov8-detection/design.md
export default function DetectionLabel({ tag, behavior }) {
  const name = tag ? `Animal ${tag}` : 'Animal no identificado'
  return (
    <span className="detection-label mono">
      {name} - Comportamiento: {BEHAVIOR_LABEL[behavior] ?? behavior}
    </span>
  )
}
