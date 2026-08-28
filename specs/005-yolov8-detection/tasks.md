# 005 — YOLOv8 Detection — Tasks

## MVP
- [ ] Documentar `types/detection.js` (JSDoc) con el contrato exacto.
- [ ] Crear `components/DetectionOverlay.jsx` (bbox normalizado → posición absoluta).
- [ ] Crear `components/DetectionLabel.jsx`.
- [ ] Crear `services/mocks/detections.mock.js` (cubrir los 4 `behavior`, incluir 1 `livestock_id: null` y 1 por debajo del umbral).
- [ ] Integrar `DetectionOverlay` dentro de `LiveFeedPanel` (004) y alimentar el panel "Evento detectado" (002) con la detección `anomalo` de mayor confidence.
- [ ] (Vision, si el tiempo alcanza) `vision/inference/mock_detector.py`.
- [ ] (Vision, si el tiempo alcanza) `vision/inference/detector.py` con YOLOv8 pre-entrenado (COCO) sobre 1-2 imágenes de ejemplo — demuestra CV real funcionando, sin entrenar modelo propio.

## Fase futura
- [ ] `DetectionDetailPanel` + interacción de click en detección individual.
- [ ] Entrenamiento de modelo propio con Roboflow.
