# 003 — Livestock Monitoring — Tasks

- [ ] Crear componente genérico `components/LivestockTable.jsx` (columnas configurables por props).
- [ ] Crear componente `components/StatusBadge.jsx` (variantes: ok, faltante, desconocido).
- [ ] (Fase futura, no MVP) Crear componente `components/PotreroSelector.jsx` (dropdown) — el MVP usa 1 potrero fijo.
- [ ] Crear `services/mocks/livestock.mock.js` con el contrato de `design.md` (incluir al menos 1 faltante y 1 desconocido).
- [ ] Crear `services/livestockService.js` (`getReconciliation(potreroId)`).
- [ ] Crear hook `hooks/useLivestockReconciliation.js` (`{ data, loading, error }`).
- [ ] Crear `pages/LivestockMonitoringPage.jsx` con las 2 tablas lado a lado (desktop) / apiladas (mobile) + `BackButton`.
- [ ] Registrar ruta `/animales` en el router.
- [ ] (Backend, cuando se implemente) Crear `livestock_repository.get_reconciliation(potrero_id)` con la query de `008-postgresql-data-model/design.md`.
- [ ] (Backend, cuando se implemente) Crear `livestock_service.get_reconciliation(potrero_id)` que marca `es_esperado_aqui` y `detectado_recientemente`.
- [ ] (Backend, cuando se implemente) Crear endpoint `GET /api/potreros/{id}/reconciliacion`.
- [ ] Escribir tests (ver `tests.md`).
