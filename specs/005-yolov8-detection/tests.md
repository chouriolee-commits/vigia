# 005 — YOLOv8 Detection — Tests

## Críticos (MVP)
- `DetectionOverlay` posiciona correctamente un bbox normalizado (ej. `{x:0.5,y:0.5,width:0.1,height:0.1}` cae en el centro del contenedor de prueba).
- `DetectionLabel` renderiza `"Animal #024 - Comportamiento: Anómalo"` y `"Animal no identificado"` cuando `livestock_id` es null.
- Detección con `confidence < 0.5` no se renderiza en el overlay.
- (Si se implementa vision real) `mock_detector` y `detector` devuelven objetos con el mismo contrato.

## Opcionales / fase futura
- Tests de `DetectionDetailPanel` (solo si esa fase se implementa).
