# 009 — API Integration

> **Toda esta spec es Fase 2** (ver `README.md` §4 y §9): se implementa solo si el frontend con mocks (002, 003, 006, 007, 012) ya funciona completo y sobra tiempo de las 3h30. No bloquea la demo.

## Problema
Cada spec de frontend define un contrato de API "a futuro" contra mocks. Esta spec centraliza esos contratos como la API REST real de FastAPI, y define el swap mock → real.

## Objetivo
Implementar los endpoints FastAPI que cumplen los contratos ya documentados, y el mecanismo de swap (`services/api.js` + variable de entorno) sin reescribir el frontend.

## Requisitos funcionales

### Fase futura (spec completa)
- RF1 **[Fase futura]** Implementar los endpoints ya contratados y aún vigentes tras la reducción de alcance:
  - `GET /health` (001)
  - `GET /api/dashboard` (002)
  - `GET /api/potreros/{id}/reconciliacion` (003)
  - `GET /api/alertas` (006)
  - `GET /api/eventos?date=hoy` (012, query derivada — sin tabla `events`)
  - `POST /api/asistente/mensajes` (007, opcional — el MVP ya funciona con heurística local)

  **Eliminados de esta lista** (spec reducida en esta auditoría, ya no existen como feature): `GET /api/misiones/{id}/media` (galería, fase futura de `004`), `GET|POST /api/media/{id}/detecciones` como endpoint de UI (el contrato de detección de `005` sigue vigente para `vision`↔`backend`, pero no se expone como pantalla propia).
- RF2 **[Fase futura]** Cada `services/*.js` implementa modo dual (`VITE_USE_MOCK`) — mock por defecto, real si se activa.
- RF3 **[Fase futura]** Schemas Pydantic coinciden campo por campo con los contratos ya documentados.
- RF4 **[Fase futura]** CORS configurado para el origin del frontend en desarrollo.

## Criterios de aceptación (Given/When/Then)
```
Dado el backend levantado con el seed de 008-postgresql-data-model,
cuando el frontend corre con VITE_USE_MOCK=false,
entonces el dashboard, /animales, /alertas y /eventos muestran los mismos datos
(en forma y contenido equivalente) que mostraban con los mocks.
```

## Restricciones
- No se agregan endpoints que ninguna spec de frontend vigente haya contratado.
- El modo mock debe seguir funcionando aunque exista backend real (plan B de demo).
