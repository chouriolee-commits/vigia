# 003 — Livestock Monitoring — Design

## Componentes involucrados

```
pages/LivestockMonitoringPage.jsx
├── components/BackButton.jsx
├── components/PotreroSelector.jsx        (Fase futura — MVP usa 1 potrero fijo del seed/mock)
├── components/LivestockTable.jsx          (reutilizada 2 veces: variante "real" y variante "esperado")
└── components/StatusBadge.jsx             (faltante / desconocido / ok)
```

`LivestockTable` es un componente genérico de tabla (columnas configurables por props) reutilizado también por `006-alert-system` y `012-events-log` para no duplicar el componente de tabla base.

## Flujo de datos

```
LivestockMonitoringPage
  → useLivestockReconciliation(potreroId) [hook]
      → livestockService.getReconciliation(potreroId) [service]
          → mock: services/mocks/livestock.mock.js
          → real (futuro): GET /api/potreros/{id}/reconciliacion
  ← { potrero, animales_reales: [...], animales_esperados: [...] }
```

## API necesaria (contrato — implementación real en 009-api-integration)

`GET /api/potreros/{id}/reconciliacion`
```json
{
  "potrero": { "id": 1, "name": "Potrero Norte" },
  "ventana_horas": 2,
  "animales_reales": [
    { "livestock_id": 24, "livestock_tag": "#024", "alias": null, "detected_at": "2026-08-27T10:45:00Z", "behavior": "anomalo", "confidence": 0.94, "es_esperado_aqui": true },
    { "livestock_id": null, "livestock_tag": null, "alias": "Animal no identificado", "detected_at": "2026-08-27T10:40:00Z", "behavior": "pastoreo", "confidence": 0.71, "es_esperado_aqui": false }
  ],
  "animales_esperados": [
    { "livestock_id": 24, "livestock_tag": "#024", "species": "bovino", "breed": "Holstein", "status": "activo", "detectado_recientemente": true },
    { "livestock_id": 30, "livestock_tag": "#030", "species": "bovino", "breed": "Angus", "status": "activo", "detectado_recientemente": false }
  ]
}
```
> Campo unificado con el resto de specs: `livestock_id` + `livestock_tag` (ver nota de consistencia en `005-yolov8-detection/design.md`). En PostgreSQL la columna real sigue siendo `tag_code` (`008-postgresql-data-model`); `livestock_tag` es el nombre de campo en el contrato de API/mock.

## Modelo de datos
Usa `livestock`, `detections`, `potreros` de `008-postgresql-data-model`. La query de reconciliación (definida en `008/design.md`) se encapsula en `backend/app/repositories/livestock_repository.py` (acceso a datos) y se enriquece (marcado de faltante/desconocido) en `backend/app/services/livestock_service.py`.

## Integración frontend/backend
El frontend nunca calcula qué animal falta: recibe `es_esperado_aqui` y `detectado_recientemente` ya resueltos del backend (o del mock con la misma forma). Esto respeta `skills/architecture` regla 3 (sin lógica de negocio en componentes).

## Decisiones técnicas
- Ventana de "reciente" configurable vía constante `RECONCILIATION_WINDOW_HOURS` (backend) — documentar valor elegido para la demo (ej. 2 horas, o "última misión completada" si el tiempo del hackathon lo permite implementar así).
- La tabla de "reales" incluye animales desconocidos (sin `livestock_id`) para visibilizar posibles animales ajenos al hato.
- El resaltado de faltantes/desconocidos usa el mismo `StatusBadge` que `006-alert-system`, manteniendo consistencia visual (rojo/ámbar para atención, verde para ok).
