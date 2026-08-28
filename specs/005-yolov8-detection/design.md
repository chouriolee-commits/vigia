# 005 — YOLOv8 Detection — Design (reducido)

## Contrato de detección (fuente de verdad — respetado en vision/backend/frontend)

```json
{
  "id": 555,
  "media_id": 501,
  "livestock_id": 24,
  "potrero_id": 1,
  "animal_label": "#024",
  "bbox": { "x": 0.42, "y": 0.30, "width": 0.08, "height": 0.10 },
  "confidence": 0.94,
  "behavior": "anomalo",
  "detected_at": "2026-08-27T10:45:00Z",
  "model_version": "yolov8n-coco-pretrained"
}
```

## Mapeo de color por comportamiento
| behavior | Color bbox |
|---|---|
| `pastoreo` | blanco/neutro |
| `descanso` | teal (acento de marca) |
| `anomalo` | verde brillante / borde de alerta |
| `desconocido` | gris punteado |

## Componentes involucrados (MVP)
```
components/DetectionOverlay.jsx   (usado por LiveFeedPanel de 004-drone-media)
components/DetectionLabel.jsx      ("Animal #ID - Comportamiento: X")
```
`DetectionDetailPanel`/modal individual: **eliminado del MVP** (ver Fase futura abajo). El panel "Evento detectado" de `002-dashboard` ya muestra animal, descripción y confidence de la detección más relevante — no se duplica esa información en una pantalla nueva.

## Pipeline vision (MVP)
```
vision/inference/mock_detector.py   → detecciones simuladas, contrato exacto
vision/inference/detector.py         → wrapper YOLOv8 pre-entrenado (COCO, clase "cow") como opción "real" sin entrenamiento propio
```
Ambos exponen la misma interfaz `detect(image) -> list[Detection]`.

## Umbral de confianza
`MIN_DETECTION_CONFIDENCE = 0.5`, aplicado en `vision/inference/` y replicado como filtro en `backend/app/services/detection_service.py` (si el backend se conecta) o directamente en el mock del frontend (si no).

## Fase futura (documentado, no implementado)
- `components/DetectionDetailPanel.jsx` + interacción de click en un bbox individual.
- Entrenamiento de modelo propio vía Roboflow (`skills/roboflow`) con dataset anotado del hackathon.
