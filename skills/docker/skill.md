# Skill: Docker (VIGÍA)

## Contexto
**Fase futura completa** (`011-docker-environment`, `README.md` §4). Docker no es necesario para demostrar el MVP en 3h30 — `npm run dev` alcanza para la demo. Esta skill se usa solo si todo el MVP (dashboard + 3 botones + IA) ya está demostrable y sobra tiempo, o al preparar el repo para entrega final.

## Propósito
Definir cómo se contiene y orquesta cada servicio de VIGÍA (frontend, backend, postgres, vision) para que el proyecto sea reproducible con `docker compose up`, sin bloquear el desarrollo local sin Docker durante el hackathon.

## Cuándo utilizarla
- Al crear/modificar un `Dockerfile` de cualquier servicio.
- Al modificar `docker-compose.yml`.
- Al definir variables de entorno compartidas entre servicios.

## Tecnologías relacionadas
Docker, Docker Compose.

## Reglas
1. Cada servicio (`frontend`, `backend`, `postgres`, `vision`) tiene su propio `Dockerfile` dentro de su carpeta (`frontend/Dockerfile`, `backend/Dockerfile`, `vision/Dockerfile`).
2. `docker-compose.yml` en la raíz orquesta los 4 servicios, con nombres de servicio estables (`frontend`, `backend`, `postgres`, `vision`) que se usan como hostname interno (ej. backend se conecta a `postgres:5432`, frontend en dev usa `localhost:8000` para backend salvo que se proxee).
3. Variables sensibles/configurables (DB credentials, API URLs, puertos) van en `.env` (no versionado) con un `.env.example` versionado como referencia.
4. No es obligatorio que los 4 servicios estén 100% implementados desde el primer commit, pero `docker-compose.yml` debe declarar la arquitectura completa (aunque algún servicio aún no tenga Dockerfile funcional, se documenta como pendiente).
5. El servicio `vision` no necesita estar siempre "up" como servidor: puede definirse como job/one-off container si así se decide en `011-docker-environment`, documentando la decisión.

## Buenas prácticas
- Imágenes base livianas (`node:XX-alpine` para frontend build, `python:3.XX-slim` para backend/vision).
- Multi-stage build para el frontend (build con Vite, servir estático) si el tiempo del hackathon lo permite; si no, documentar como simplificación consciente.
- Healthchecks básicos en `postgres` y `backend` para que `depends_on` con `condition: service_healthy` funcione correctamente.
- Volúmenes nombrados para persistencia de PostgreSQL (`postgres_data`).

## Restricciones
- No exponer puertos innecesarios.
- No commitear `.env` con credenciales reales.
- No usar `latest` como tag de imágenes base en producción-like configs; fijar versión.

## Estructura esperada
```
VIGIA/
├── docker-compose.yml
├── .env.example
├── frontend/Dockerfile
├── backend/Dockerfile
├── vision/Dockerfile
└── database/ (scripts de init/seed montados como volumen en postgres)
```

## Testing requerido
- Validación manual/documentada: `docker compose up` levanta los 4 servicios sin error y el frontend puede alcanzar al backend, el backend a postgres.
- (Opcional, si el tiempo alcanza) smoke test automatizado que golpea `GET /health` del backend tras `docker compose up`.

## Criterios de aceptación
- `docker-compose.yml` declara los 4 servicios de la arquitectura, aunque no todos estén completamente implementados en el primer commit.
- Los servicios implementados levantan correctamente con `docker compose up`.
- La configuración de red permite que backend↔postgres y frontend↔backend se comuniquen según lo definido en `011-docker-environment`.

## Errores que debe evitar la IA
- Hardcodear `localhost` como host de otro contenedor en vez del nombre de servicio de Compose.
- Commitear secretos en `docker-compose.yml` o en Dockerfiles.
- Declarar un servicio en Compose que no corresponde a ninguna carpeta real del monorepo.
