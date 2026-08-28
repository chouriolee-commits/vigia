# 006 — Alert System — Design

## Componentes involucrados
```
pages/AlertsPage.jsx
├── components/BackButton.jsx
├── components/LivestockTable.jsx     (reutilizado como tabla genérica, ver 003-livestock-monitoring)
└── components/StatusBadge.jsx        (prioridad y estado)

# Fase futura (no MVP):
├── components/StatusFilter.jsx       (filtro por estado)
└── components/AlertDetailModal.jsx
```

## Flujo de datos
```
AlertsPage
  → useAlerts(filters) [hook]
      → alertService.getAlerts(filters) [service]
          → mock: services/mocks/alerts.mock.js
          → real (futuro): GET /api/alertas?status=...
  ← [{ id, priority, livestock_tag, type, description, created_at, status, detection_id, livestock_id }, ...]
```

## API necesaria (contrato)
`GET /api/alertas?status=activa,en_revision`
```json
[
  {
    "id": 101,
    "priority": "alta",
    "type": "comportamiento_anomalo",
    "status": "activa",
    "title": "Comportamiento inusual detectado",
    "description": "Patrón de movimiento errático y aislamiento del rebaño.",
    "livestock_id": 24,
    "livestock_tag": "#024",
    "potrero_id": 1,
    "potrero_name": "Potrero Norte",
    "detection_id": 555,
    "confidence": 0.94,
    "created_at": "2026-08-27T10:45:00Z",
    "resolved_at": null
  }
]
```

## Modelo de datos
Usa `alerts` (con joins a `livestock` y `potreros` para mostrar `tag`/`name`) de `008-postgresql-data-model`. Resuelto en `backend/app/services/alert_service.py` + `backend/app/repositories/alert_repository.py`.

## Decisiones técnicas
- Orden por defecto (prioridad desc, fecha desc) se resuelve en el backend (query ordenada), no en el frontend, para que la paginación futura sea consistente.
- El detalle de alerta reutiliza el mismo patrón de modal que se usará en `005-yolov8-detection` para mostrar el detalle de una detección (bbox, confidence, imagen).
