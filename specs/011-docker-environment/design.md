# 011 — Docker Environment — Design

## Servicios (docker-compose.yml, referencia conceptual)

```yaml
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: vigia
      POSTGRES_PASSWORD: vigia
      POSTGRES_DB: vigia
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U vigia"]

  backend:
    build: ./backend
    environment:
      DATABASE_URL: postgresql://vigia:vigia@postgres:5432/vigia
      CORS_ORIGINS: http://localhost:5173
    depends_on:
      postgres:
        condition: service_healthy
    ports:
      - "8000:8000"

  frontend:
    build: ./frontend
    environment:
      VITE_API_URL: http://localhost:8000
      VITE_USE_MOCK: "false"
    depends_on:
      - backend
    ports:
      - "5173:5173"

  vision:
    build: ./vision
    depends_on:
      - backend
    # servicio mínimo/job — implementación completa pendiente hasta que 005-yolov8-detection esté cerrada

volumes:
  postgres_data:
```

## Dependencias entre servicios
```
postgres (healthy) → backend → frontend
                    ↘ vision (ingesta hacia backend)
```

## Modelo de datos
No aplica directamente; `postgres` monta el volumen de datos, las migraciones (`008-postgresql-data-model`) se ejecutan como paso posterior a levantar el contenedor (comando documentado en `README.md`, ej. `docker compose exec backend alembic upgrade head`).

## Decisiones técnicas
- `vision` se declara desde el primer commit de `docker-compose.yml` (cumple RF1 de arquitectura completa) aunque su Dockerfile pueda ser mínimo hasta que `005-yolov8-detection` tenga inferencia real.
- Se documentan 2 modos de trabajo: (a) todo en Docker para la demo/evaluación, (b) solo `postgres` en Docker + frontend/backend locales para desarrollo activo más rápido (hot reload).
