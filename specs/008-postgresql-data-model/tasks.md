# 008 — PostgreSQL Data Model — Tasks

> Fase 2 del hackathon (ver `README.md` §9) — solo si el frontend con mocks (002, 003, 006, 007, 012) ya está funcionando.

## MVP (si el tiempo alcanza)
- [ ] Configurar Alembic en `backend/`.
- [ ] Crear modelos ORM + migración: `Potrero`, `Livestock`, `DroneMission`, `Media`, `Detection`, `Alert` (en ese orden, por dependencia de FKs).
- [ ] Aplicar migraciones sobre una base vacía.
- [ ] Crear script de seed pequeño (`database/seeds/`): 1 potrero, ~10 animales, 1 misión con media, ~8 detecciones (incluir 1 sin `livestock_id` y 1 animal esperado sin detección), 2-3 alertas.
- [ ] Implementar la query de reconciliación en `backend/app/repositories/livestock_repository.py`.
- [ ] Implementar la query derivada de "eventos hoy" (sin tabla `events`) en `backend/app/repositories/event_repository.py`.
- [ ] Tests mínimos de constraints (ver `tests.md`).

## Fase futura (no bloquea el MVP)
- [ ] Tabla `users` + migración.
- [ ] Tabla `events` persistida + triggers/hooks desde alertas y detecciones.
- [ ] Tablas `ai_conversations` / `ai_messages` + migración.
