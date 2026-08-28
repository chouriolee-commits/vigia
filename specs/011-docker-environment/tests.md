# 011 — Docker Environment — Tests

## Validación manual (documentada, no automatizada en la suite estándar)
- `docker compose up` levanta los 4 servicios declarados sin error de configuración.
- `postgres` pasa su healthcheck antes de que `backend` intente conectarse.
- `backend` responde `GET /health` (200) accedido desde el host vía el puerto expuesto.
- `frontend` (con `VITE_USE_MOCK=false`) carga el dashboard con datos reales desde `backend`.

## Casos positivos
- Levantar el stack completo en una máquina limpia (sin contenedores previos) funciona siguiendo solo el `README.md`.

## Casos negativos
- Si `postgres` no está healthy, `backend` no debe arrancar en un estado inconsistente (falla explícita, visible en logs de `docker compose logs backend`).
- Puerto `5432`/`8000`/`5173` ya ocupado en el host → documentado cómo remapear en `.env`.

## Edge cases
- `vision` no implementado completamente (Dockerfile mínimo) no debe impedir que `docker compose up` levante el resto del stack (dependencia unidireccional `vision → backend`, no al revés).
