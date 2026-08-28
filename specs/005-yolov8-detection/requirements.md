# 005 — YOLOv8 Detection (contrato + overlay — reducido en auditoría)

> **Corrección de auditoría:** se elimina el `DetectionDetailPanel`/modal de detalle de una detección individual como interacción propia — no es uno de los 3 botones y duplicaría lo que ya muestra el panel "Evento detectado" del dashboard (`002-dashboard`). Esta spec se enfoca en: (1) el contrato de detección compartido entre `vision`→`backend`→`frontend`, y (2) el componente `DetectionOverlay` que dibuja bounding boxes.

## Problema
El sistema necesita mostrar, de forma consistente, las detecciones generadas por YOLOv8 (animal, confidence, bounding box, comportamiento) sin acoplar la UI a los detalles internos del modelo. Esta es la pieza que demuestra que **la IA está conectada al flujo real**, no es decorativa.

## Objetivo
Definir el contrato de detección y el componente de overlay usado dentro de `LiveFeedPanel` (`004-drone-media`) y en el panel "Evento detectado" (`002-dashboard`).

## Usuario
Operador (consumidor visual); backend/vision (productores del contrato).

## Requisitos funcionales

### MVP obligatorio
- RF1 **[MVP]** Contrato de detección único:
  ```
  { id, media_id, livestock_id | null, livestock_tag | null, potrero_id, bbox: {x,y,width,height} (0–1), confidence (0–1), behavior, detected_at, model_version }
  ```
- RF2 **[MVP]** `DetectionOverlay`: dibuja bounding boxes sobre una imagen dado un array de detecciones. Reutilizado por `LiveFeedPanel`.
- RF3 **[MVP]** Etiqueta visual: `Animal #<tag> - Comportamiento: <behavior>` (fiel al diseño).
- RF4 **[MVP]** Colores de bbox por comportamiento (ver `design.md`).
- RF5 **[MVP]** `vision/inference/` genera detecciones **simuladas o con un modelo YOLOv8 pre-entrenado (COCO, clase "cow")** que cumplen el contrato — no se entrena un modelo propio durante el hackathon (ver `skills/yolov8`, `skills/roboflow`).
- RF6 **[MVP]** Detecciones con `confidence` por debajo del umbral configurado (`MIN_DETECTION_CONFIDENCE = 0.5`) no se muestran por defecto.

### Fase futura
- RF7 **[Fase futura]** Panel/modal de detalle de una detección individual como interacción propia (click en un bbox → detalle ampliado). El MVP ya expone lo esencial de una detección relevante vía el panel "Evento detectado" del dashboard.
- RF8 **[Fase futura]** Entrenamiento de modelo propio con dataset anotado en Roboflow.

## Requisitos no funcionales
- RNF1 **[MVP]** El overlay usa bbox normalizado (0–1) para re-escalar sin importar el tamaño de render.
- RNF2 **[MVP]** El pipeline debe soportar swap de modelo simulado/pre-entrenado → modelo propio sin cambiar el contrato ni el frontend.

## Criterios de aceptación (Given/When/Then)

```
Dado un frame con 3 detecciones activas (una por cada comportamiento: pastoreo, descanso, anómalo),
cuando se renderiza DetectionOverlay,
entonces se dibujan 3 bounding boxes en las posiciones normalizadas correctas,
con el color correspondiente a cada comportamiento (ver design.md),
y la detección con behavior='anomalo' es la que alimenta el panel "Evento detectado" del dashboard.

Dado que una detección tiene confidence = 0.3 (por debajo del umbral 0.5),
cuando se procesa el frame,
entonces esa detección no se muestra en el overlay ni se cuenta en los KPIs del dashboard.
```

## Casos límite
- Detección con `livestock_id = null` → etiqueta "Animal no identificado".
- Múltiples detecciones cercanas/superpuestas → el overlay no se vuelve ilegible (sin algoritmo de layout complejo en el MVP).

## Restricciones
- El frontend no recalcula bounding boxes: los muestra tal cual llegan.
- No se implementa entrenamiento de modelo en esta spec.
