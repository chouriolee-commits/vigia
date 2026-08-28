# 001 — Project Foundation — Tasks

> Orden real de ejecución en el hackathon: MVP primero (frontend), fase futura solo si sobra tiempo (ver `README.md` §9).

## MVP (minuto 0:00–0:20)
- [ ] Inicializar `frontend/` con Vite + React (JavaScript template).
- [ ] Instalar y configurar React Router en `frontend/`.
- [ ] Configurar Vitest + React Testing Library en `frontend/`.
- [ ] Crear estructura `frontend/src/{components,pages,layouts,hooks,services,utils,types,assets,styles}`.
- [ ] Crear `frontend/src/styles/theme.css` con los tokens de color de `skills/frontend/skill.md` (`--bg`, `--surface`, `--accent`, etc.) e importarlo una sola vez en `main.jsx`.
- [ ] Validar que `npm run dev` levanta el frontend sin errores.

## Fase futura (solo si el tiempo alcanza tras completar 002, 003, 006, 007, 012)
- [ ] Crear `backend/` con estructura (`api/`, `core/`, `models/`, `schemas/`, `services/`, `repositories/`).
- [ ] Configurar SQLAlchemy + Alembic en `backend/`.
- [ ] Crear `backend/.env.example` (`DATABASE_URL`, `CORS_ORIGINS`) y `frontend/.env.example` (`VITE_API_URL`).
- [ ] Crear `backend/app/main.py` con endpoint `GET /health`.
- [ ] Crear `vision/` con subcarpetas `models/`, `inference/`, `preprocessing/`, `tests/`.
- [ ] Crear `database/migrations/` y `database/seeds/`.
- [ ] Configurar Pytest + HTTPX en `backend/`.
- [ ] Validar que `uvicorn app.main:app --reload` levanta el backend y `GET /health` responde 200.
