# 012 — Events Log — Tests

## Críticos (MVP)
- `EventsLogPage` renderiza la tabla ordenada cronológicamente según el mock.
- Evento sin animal/potrero relacionado muestra "N/A" sin romper el render.
- Click en "← Volver" navega a `/`.
- 0 eventos hoy → estado vacío explícito.

## Opcionales / fase futura
- `GET /api/eventos?date=hoy` (backend).
- Navegación desde un evento tipo alerta hacia `/alertas`.
