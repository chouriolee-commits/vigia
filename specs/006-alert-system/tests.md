# 006 — Alert System — Tests

## Críticos (MVP)
- `alertService.getAlerts()` devuelve el contrato esperado.
- `AlertsPage` renderiza la tabla ordenada por prioridad/fecha según el mock.
- Click en "← Volver" navega a `/`.
- Alerta con `livestock_id: null` muestra "N/A" en la columna Animal sin romper el render.

## Opcionales / fase futura
- `StatusFilter` dispara el callback correcto al cambiar de estado.
- Click en una fila abre `AlertDetailModal` con los datos correctos.

## API tests (backend, cuando exista)
- `GET /api/alertas` — positivo (200 + orden correcto), filtro por `status` funciona, sin alertas devuelve `[]` (no error).

## Casos positivos
- Lista con alertas de las 4 prioridades se renderiza y ordena correctamente.

## Casos negativos
- Error en `alertService` (mock que rechaza) → estado de error visible en la página.

## Edge cases
- 0 alertas → estado vacío explícito.
- Alerta tipo `sistema` sin animal ni potrero asociado.
