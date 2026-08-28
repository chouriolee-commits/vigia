# 009 — API Integration — Design

## Cliente HTTP base (frontend)

```
frontend/src/services/api.js
  export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
  export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'  // default: true (mock) hasta que el backend esté listo
  export async function apiFetch(path, options) { ... fetch(`${API_BASE_URL}${path}`, ...) ... }
```

Cada service de dominio (`dashboardService.js`, `livestockService.js`, `alertService.js`, `eventService.js`, `droneService.js`, `detectionService.js`, `aiService.js`) implementa:

```js
export async function getX(...) {
  if (USE_MOCK) return getXMock(...)
  return apiFetch('/api/...')
}
```

## Tabla de endpoints (reducida tras la auditoría — solo lo que sobrevive en el MVP+fase 2)

| Método | Ruta | Spec origen | Router backend |
|---|---|---|---|
| GET | `/health` | 001 | `api/health.py` |
| GET | `/api/dashboard` | 002 | `api/dashboard.py` |
| GET | `/api/potreros/{id}/reconciliacion` | 003 | `api/potreros.py` |
| GET | `/api/alertas` | 006 | `api/alerts.py` |
| GET | `/api/eventos?date=hoy` | 012 | `api/events.py` (query derivada, sin tabla `events`) |
| POST | `/api/asistente/mensajes` | 007 | `api/assistant.py` (opcional, MVP ya funciona sin esto). En fase futura delega en el LLM de Groq: `llama-3.3-70b-versatile`, key y endpoint vía `GROQ_API_KEY`/`GROQ_BASE_URL` en `backend/.env` — ver `007-ai-assistant/design.md` |

`POST /api/media/{id}/detecciones` (ingesta desde `vision`) solo se implementa si se conecta el pipeline de visión real al backend — no es parte del contrato de UI, es interno vision↔backend.

## Arquitectura backend (routers → services → repositories → models)

Cada router de la tabla anterior sigue `skills/backend`: solo valida input (Pydantic) y delega a su `service` correspondiente en `backend/app/services/`, que a su vez usa su `repository` en `backend/app/repositories/`.

## Modelo de datos
Sin cambios adicionales sobre `008-postgresql-data-model`; esta spec solo expone vía REST lo ya modelado.

## Decisiones técnicas
- `VITE_USE_MOCK` por defecto en `true` durante todo el desarrollo del hackathon hasta que el backend esté verificado end-to-end; se cambia a `false` explícitamente para la demo con datos reales (o se deja en mock como plan B de demo si el backend falla en vivo).
- Los contratos de esta spec son un **espejo**, no una redefinición: cualquier cambio de campo debe originarse en la spec de dominio correspondiente (002–007, 012), nunca inventarse aquí.
