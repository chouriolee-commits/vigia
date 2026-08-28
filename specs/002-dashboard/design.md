# 002 — Dashboard — Design

## Contrato de navegación (única fuente de verdad, junto con `README.md` §7)

| Origen (dashboard) | Ruta destino | Spec |
|---|---|---|
| Card "Animales Monitoreados" | `/animales` | `003-livestock-monitoring` |
| Card "Alertas Activas" | `/alertas` | `006-alert-system` |
| Card "Eventos Hoy" | `/eventos` | `012-events-log` |
| Link "Ver análisis →" | `/alertas` | `006-alert-system` (reutilizada, no nueva pantalla) |
| Botón "Revisar imágenes capturadas" | ninguna (sin navegación en MVP) | `004-drone-media` |

Toda ruta que no sea `/` renderiza un `BackButton` ("← Volver" → `navigate('/')`). No existen más rutas que estas 4 dentro de la app autenticada — la única ruta adicional en todo el MVP es `/login` (pública, `013-authentication`), que no se navega desde el dashboard sino que lo antecede.

## Rutas (React Router)
```
/           → DashboardPage
/animales   → LivestockMonitoringPage (003)
/alertas    → AlertsPage (006)
/eventos    → EventsLogPage (012)
```

## Componentes involucrados
```
pages/DashboardPage.jsx
├── layouts/AppShell.jsx            (sidebar/topbar desktop, bottom-nav mobile)
├── components/LiveFeedPanel.jsx     (004-drone-media)
├── components/KpiCard.jsx           (reutilizado 3 veces)
├── components/DetectedEventPanel.jsx (link "Ver análisis" → /alertas)
└── components/AiAssistantPanel.jsx  (007-ai-assistant)
```

## Flujo de datos
```
DashboardPage
  → useDashboardData() [hook]
      → dashboardService.getDashboardSummary() [service]
          → MVP: mock: services/mocks/dashboard.mock.js
          → Fase futura: GET /api/dashboard (009-api-integration)
  ← { animales_monitoreados, alertas_activas, eventos_hoy, evento_detectado, feed_detecciones }
```

`useDashboardData` expone `{ data, loading, error }`. El mismo `data` (o un subconjunto: alertas + detecciones) se pasa como `context` a `AiAssistantPanel` (`007-ai-assistant`).

## Contrato del mock/API (MVP)
```json
{
  "animales_monitoreados": { "total": 24, "actualizado_at": "2026-08-27T10:45:00Z" },
  "alertas_activas": [
    { "id": 101, "livestock_tag": "#024", "type": "comportamiento_anomalo", "priority": "alta", "status": "activa", "description": "Patrón de movimiento errático y aislamiento del rebaño.", "confidence": 0.94, "created_at": "2026-08-27T10:45:00Z" }
  ],
  "eventos_hoy": { "total": 5 },
  "evento_detectado": { "livestock_id": 24, "livestock_tag": "#024", "titulo": "Atención requerida", "descripcion": "Comportamiento inusual detectado...", "confidence": 0.94, "alert_id": 101 },
  "feed_detecciones": [
    { "livestock_id": 24, "livestock_tag": "#024", "bbox": {"x":0.42,"y":0.3,"width":0.08,"height":0.1}, "behavior": "anomalo" },
    { "livestock_id": 55, "livestock_tag": "#055", "bbox": {"x":0.63,"y":0.45,"width":0.09,"height":0.11}, "behavior": "descanso" }
  ]
}
```

Nótese que `alertas_activas` viaja completo (no solo el conteo) — es el mismo dato que necesita `006-alert-system` y `007-ai-assistant` como `context`, evitando 2 fuentes de verdad distintas para la misma información.

## Decisiones técnicas
- Las 3 KPI cards son componentes activos (`onClick` + accesibilidad de teclado).
- El "evento detectado" es siempre el de mayor prioridad/más reciente de `alertas_activas`.
- `feed_detecciones` reutiliza el mismo shape que el contrato de `005-yolov8-detection` — incluye `livestock_id` **y** `livestock_tag` (no solo el id) para que `DetectionLabel` pueda mostrar "Animal #024 - Comportamiento: X" sin ir a buscar el tag a otro lado.
