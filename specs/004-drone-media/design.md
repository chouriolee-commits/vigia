# 004 — Drone Media — Design (reducido)

## Componentes involucrados (MVP)
```
components/LiveFeedPanel.jsx   (usado dentro de pages/DashboardPage.jsx, 002-dashboard)
└── components/DetectionOverlay.jsx   (de 005-yolov8-detection)
```

## Flujo de datos
```
LiveFeedPanel
  → useLiveFeed() [hook]
      → droneService.getLiveFeedFrame() [service]
          → mock: services/mocks/liveFeed.mock.js (2-3 frames de ejemplo, timestamp real del cliente)
  ← { imageUrl, detections: [...], capturedAt }
```

No hay llamada a backend en el MVP para esta spec (el feed es 100% mock/simulado, incluso si `009-api-integration` conecta otras pantallas).

## Decisión técnica
- Se elimina la galería (`MediaGrid`, `MediaCard`, `MediaDetailModal`, ruta `/monitoreo/capturas`) del alcance MVP. El componente `LiveFeedPanel` es autosuficiente y no depende de esa infraestructura.
- El botón "Revisar imágenes capturadas" se implementa como elemento visual fiel al diseño, sin handler de navegación (o con un handler no-op / tooltip), documentado explícitamente para que no se interprete como bug.

## Fase futura — diseño de referencia (no implementar en el MVP)
```
pages/DroneMediaGalleryPage.jsx (ruta /monitoreo/capturas)
├── components/MediaGrid.jsx
├── components/MediaCard.jsx
└── components/MediaDetailModal.jsx

GET /api/misiones/{id}/media
[{ "id":501, "type":"imagen", "url":"/mock/frame-1.jpg", "captured_at":"...", "detections_count":6 }]
```
Se retoma solo si el MVP principal (dashboard + 3 botones + IA) ya está demostrable y sobra tiempo.
