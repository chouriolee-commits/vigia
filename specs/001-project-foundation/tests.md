# 001 — Project Foundation — Tests

## Unit tests
No aplica (spec estructural, sin lógica de negocio).

## Integration tests
- El backend expone `GET /health` y responde `200 OK` con un body mínimo (ej. `{"status": "ok"}`).

## API tests
- `GET /health` — caso positivo: 200. No hay casos negativos (endpoint sin parámetros).

## E2E tests
No aplica en esta spec (no hay UI de usuario final todavía).

## Casos positivos
- `npm install && npm run dev` en `frontend/` levanta el servidor de desarrollo sin errores en consola.
- `uvicorn app.main:app --reload` en `backend/` levanta sin errores y `GET /health` responde 200.

## Casos negativos
- Si falta `DATABASE_URL` en el entorno, el backend debe fallar de forma explícita al arrancar (no silenciosamente) — se valida en `008-postgresql-data-model` una vez exista conexión real a la base de datos.

## Edge cases
- Estructura de carpetas: verificar que no existan carpetas duplicadas o fuera de la convención definida en `design.md` antes de dar por cerrada la spec.
