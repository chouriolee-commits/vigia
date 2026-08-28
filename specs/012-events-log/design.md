# 012 — Events Log — Design

## Componentes involucrados (MVP)
```
pages/EventsLogPage.jsx
├── components/BackButton.jsx
├── components/LivestockTable.jsx    (tabla genérica, reutilizada de 003-livestock-monitoring)
└── components/EventTypeIcon.jsx
```

## Flujo de datos
```
EventsLogPage
  → useEventsToday() [hook]
      → eventService.getEventsToday() [service]
          → MVP: mock: services/mocks/events.mock.js
          → Fase futura: GET /api/eventos?date=hoy → query derivada de 008-postgresql-data-model/design.md (alerts + detections anómalas, sin tabla events)
  ← [{ id, type, title, description, occurred_at, related_livestock_tag, related_potrero_name, related_alert_id }, ...]
```

## Decisión técnica
- El mock de esta spec debe construirse **a partir de** (o ser consistente con) el mock de `006-alert-system` y `005-yolov8-detection`, no como datos inventados aparte — para que la demo cuente una historia coherente (la misma alerta del animal #024 aparece en el dashboard, en alertas y en eventos de hoy).
- Si se conecta backend (fase 2), el endpoint reutiliza la query derivada ya documentada en `008-postgresql-data-model/design.md` — no se crea infraestructura nueva.

## Fase futura
- Click en evento tipo `alerta` → reutiliza `/alertas` (no un modal nuevo).
- Tabla `events` persistida (si se necesita auditoría histórica más allá del día actual).
