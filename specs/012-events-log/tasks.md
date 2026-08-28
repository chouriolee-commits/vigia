# 012 — Events Log — Tasks

## MVP
- [ ] Crear `components/EventTypeIcon.jsx` (alerta/detección).
- [ ] Crear `services/mocks/events.mock.js`, coherente con los mocks de 005/006/007 (mismos animales/alertas de ejemplo).
- [ ] Crear `services/eventService.js` (`getEventsToday()`).
- [ ] Crear hook `hooks/useEventsToday.js`.
- [ ] Crear `pages/EventsLogPage.jsx` (tabla + `BackButton`).
- [ ] Registrar ruta `/eventos`.

## Fase futura
- [ ] Endpoint `GET /api/eventos?date=hoy` con la query derivada de `008-postgresql-data-model`.
- [ ] Click en evento tipo alerta → navega a `/alertas`.
