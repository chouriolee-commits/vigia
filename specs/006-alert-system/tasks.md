# 006 — Alert System — Tasks

## MVP
- [ ] Crear `services/mocks/alerts.mock.js` con el contrato de `design.md` (incluir prioridades y tipos variados, coherente con el evento detectado del dashboard).
- [ ] Crear `services/alertService.js` (`getAlerts()`).
- [ ] Crear hook `hooks/useAlerts.js`.
- [ ] Crear `pages/AlertsPage.jsx` (tabla + `BackButton`, sin filtro ni modal).
- [ ] Registrar ruta `/alertas`.

## Fase futura
- [ ] Crear componente `components/StatusFilter.jsx`.
- [ ] Crear componente `components/AlertDetailModal.jsx`.
- [ ] (Backend) `alert_repository`, `alert_service`, endpoint `GET /api/alertas`.
- [ ] Escribir tests (ver `tests.md`).
