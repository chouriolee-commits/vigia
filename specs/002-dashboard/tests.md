# 002 — Dashboard — Tests

## Unit tests
- `KpiCard` renderiza `label`, `value`, `sublabel` y dispara `onClick` al hacer click o presionar Enter/Space (accesibilidad de teclado).
- `dashboardService.getDashboardSummary()` devuelve un objeto con la forma del contrato definido en `design.md`.
- `useDashboardData` expone `loading: true` inicialmente y luego `loading: false` con `data` poblado.

## Integration tests (React Testing Library)
- `DashboardPage` renderiza las 3 KPI cards con los valores del mock.
- Click en la card "Animales Monitoreados" navega a `/animales`.
- Click en la card "Alertas Activas" navega a `/alertas`.
- Click en la card "Eventos Hoy" navega a `/eventos`.
- Click en "Ver análisis →" navega a `/alertas`.
- Click en "Revisar imágenes capturadas" no navega a ninguna parte (sin ruta en el MVP, ver `004-drone-media`).
- `DetectedEventPanel` muestra el evento del mock (animal, descripción, confidence).

## API tests
No aplica todavía (mock); cuando exista `GET /api/dashboard` real, se cubre en `009-api-integration/tests.md`.

## E2E tests (Playwright, ver también 010-testing)
- Flujo: `Dashboard → click "Animales Monitoreados" → ver pantalla de animales → click "← Volver" → vuelve a Dashboard`.
- Flujo: `Dashboard → click "Alertas Activas" → ver tabla de alertas → click "← Volver" → vuelve a Dashboard`.
- Flujo: `Dashboard → click "Eventos Hoy" → ver tabla de eventos → click "← Volver" → vuelve a Dashboard`.

## Casos positivos
- Con datos mock completos, las 3 cards, el feed, el panel de evento y el chat se renderizan sin errores.

## Casos negativos
- `dashboardService` simula un error (ej. mock que rechaza la promesa) → `useDashboardData` expone `error` y `DashboardPage` muestra un estado de error legible, no una pantalla en blanco.

## Edge cases
- `alertas_activas.total = 0` → la card no muestra el sublabel de "prioridad alta" y sigue siendo clicable.
- `evento_detectado = null` → `DetectedEventPanel` muestra estado vacío ("Sin eventos recientes") en vez de romper.
- `feed_detecciones = []` → `LiveFeedPanel` muestra el feed sin overlays, sin error en consola.
