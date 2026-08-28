# 001 — Project Foundation — Design

## Stack definitivo

| Capa | Tecnología | Versión mínima sugerida |
|---|---|---|
| Frontend | React + Vite (JavaScript) | Node 18+ |
| Routing | React Router | v6+ |
| HTTP client | Fetch API (nativo) o Axios (a decidir en la primera tarea de implementación; si se usa Axios, justificar en este archivo) | — |
| Backend | FastAPI + Pydantic | Python 3.11+ |
| ORM/migraciones | SQLAlchemy + Alembic | — |
| Base de datos | PostgreSQL | 15+ |
| Visión artificial | YOLOv8 (Ultralytics) + OpenCV | — |
| Dataset | Roboflow | — |
| Infraestructura | Docker + Docker Compose | — |
| Testing frontend | Vitest + React Testing Library | — |
| Testing backend | Pytest + HTTPX | — |
| Testing E2E | Playwright | — |

## Estructura de carpetas (monorepo)

```
VIGIA/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── layouts/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── types/
│   │   └── assets/
│   ├── tests/
│   ├── public/
│   └── package.json
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── repositories/
│   │   └── main.py
│   └── tests/
├── vision/
│   ├── models/
│   ├── inference/
│   ├── preprocessing/
│   └── tests/
├── database/
│   ├── migrations/
│   └── seeds/
├── skills/
├── specs/
├── docker-compose.yml
├── .env.example
└── README.md
```

Esta estructura es la misma definida en `skills/architecture/skill.md`; esta spec es la fuente de verdad operativa (comandos, versiones) y esa skill es la fuente de verdad de reglas/arquitectura.

## Convenciones

- **Nombres de archivo frontend:** componentes en PascalCase (`AlertCard.jsx`), hooks en camelCase con prefijo `use`, servicios en camelCase.
- **Nombres de archivo backend:** módulos en snake_case (`livestock_service.py`).
- **Variables de entorno:**
  - `frontend/.env.example` → `VITE_API_URL=http://localhost:8000`
  - `backend/.env.example` → `DATABASE_URL=postgresql://vigia:vigia@localhost:5432/vigia`, `CORS_ORIGINS=http://localhost:5173`
- **Puertos por defecto:** frontend `5173` (Vite dev server), backend `8000` (uvicorn), postgres `5432`.

## Decisiones técnicas

- **JavaScript, no TypeScript:** prioriza velocidad de desarrollo en el hackathon (RNF2 de `requirements.md`); los contratos de datos se documentan igual vía `types/` (JSDoc) y los schemas Pydantic del backend.
- **SQLAlchemy + Alembic:** ORM y migraciones estándar de facto en FastAPI, evita reinventar acceso a datos o migraciones manuales (viola regla 7 de `skills/postgresql`).
- **Sin Redux:** el estado del MVP es mayormente server-state (datos remotos/mock) resuelto vía hooks; no se justifica un store global para el alcance de hackathon.

## Comandos base (referencia, no ejecutados en esta spec)

```bash
# Frontend
cd frontend && npm install && npm run dev

# Backend
cd backend && python -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt && uvicorn app.main:app --reload

# Base de datos (vía Docker, ver 011-docker-environment)
docker compose up postgres
```
