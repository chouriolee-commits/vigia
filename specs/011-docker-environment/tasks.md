# 011 — Docker Environment — Tasks

> No ejecutar durante las 3h30 salvo que todo lo MVP (README §4) ya esté demostrable. Útil para la entrega del repo post-hackathon.

- [ ] Crear `docker-compose.yml` en la raíz con los servicios que existan (`design.md`).
- [ ] Crear `.env.example` en la raíz con todas las variables usadas por Compose.
- [ ] Crear `backend/Dockerfile` (Python slim + uvicorn).
- [ ] Crear `frontend/Dockerfile` (build Vite; servir estático o modo dev, según se decida).
- [ ] Crear `vision/Dockerfile` (mínimo, documentar qué falta para inferencia real).
- [ ] Validar `docker compose up` levanta `postgres` + `backend` correctamente (healthcheck en verde).
- [ ] Validar `docker compose up` levanta `frontend` y puede alcanzar `backend`.
- [ ] Documentar en `README.md` raíz: modo full-Docker vs. modo desarrollo (solo `postgres` en Docker).
- [ ] Documentar comando de migraciones dentro de Docker (`docker compose exec backend alembic upgrade head`).
