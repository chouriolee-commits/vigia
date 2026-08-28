# Skill: Backend (VIGÍA)

## Contexto
El backend real es **Fase futura** dentro del hackathon de 3h30 (`README.md` §4, §9): se conecta solo si el frontend con mocks ya demuestra el flujo completo. Si se implementa, cubre únicamente los 6 endpoints que sobrevivieron la auditoría de alcance (`009-api-integration`) — nada de autenticación, nada de `users`, nada de endpoints para pantallas que ya se eliminaron del MVP (galería de medios, detalle de detección).

## Propósito
Guiar la construcción del backend de VIGÍA (FastAPI) con una arquitectura modular en capas, contratos REST estables para el frontend y para el servicio de visión artificial.

## Cuándo utilizarla
- Al crear cualquier endpoint, servicio, repositorio, modelo o schema en `backend/`.
- Al definir el contrato de un endpoint que el frontend va a consumir (debe coincidir con el mock ya usado en `frontend/src/services/`).
- Al integrar el output de `vision/` (detecciones YOLOv8) hacia PostgreSQL.

## Tecnologías relacionadas
Python, FastAPI, Pydantic, PostgreSQL (vía SQLAlchemy o similar ORM/driver a definir en `001-project-foundation`), Pytest, HTTPX.

## Reglas
1. Los routers (`api/`) solo reciben la request, validan con Pydantic, llaman a un service y devuelven la respuesta. No contienen lógica de negocio ni queries.
2. Los `services/` contienen la lógica de negocio (ej. reconciliación de animales esperados vs detectados, cálculo de prioridad de alerta). No conocen detalles de HTTP ni de SQL crudo.
3. Los `repositories/` son la única capa que habla con la base de datos (ORM/queries). Ningún otro módulo ejecuta SQL.
4. Los `models/` representan las tablas (ORM); los `schemas/` representan los contratos de entrada/salida de la API (Pydantic). Nunca se expone un `model` directamente como respuesta: siempre se serializa a un `schema`.
5. Todo endpoint nuevo debe existir primero en el `design.md` de su spec (contrato: método, ruta, request, response, códigos de error) antes de implementarse.
6. No inventar endpoints que el frontend no necesita ni que no estén documentados en una spec.
7. Los errores se devuelven con códigos HTTP correctos (400 validación, 404 no encontrado, 422 Pydantic, 500 solo para errores no controlados) y un cuerpo JSON consistente (`{ "detail": "..." }` o estructura equivalente definida en `009-api-integration`).

## Buenas prácticas
- Un router por dominio: `livestock.py`, `detections.py`, `alerts.py`, `events.py`, `potreros.py`, `assistant.py`.
- Paginación y filtros (por potrero, por fecha, por estado) definidos explícitamente en el schema de query params, no como parámetros libres sin validar.
- Configuración (DB URL, CORS, puertos) centralizada en `core/config.py`, leída desde variables de entorno.
- Logging estructurado mínimo en `core/` para poder depurar durante la demo.
- CORS habilitado explícitamente para el origin del frontend en desarrollo (`http://localhost:5173` o el que use Vite).

## Restricciones
- No usar MySQL/MariaDB: solo PostgreSQL.
- No colocar lógica de negocio compleja dentro de un endpoint.
- No acceder a la base de datos desde `vision/` directamente: `vision/` entrega su output al backend (endpoint de ingesta) y es el backend quien persiste.
- No implementar autenticación ni tabla `users` — no forman parte del MVP (Fase futura en `008-postgresql-data-model`).
- Para una única query de solo lectura sencilla (ej. "eventos hoy" derivado), está permitido saltarse la separación estricta repository/service si el tiempo apremia — documentarlo como simplificación consciente, no como default.

## Estructura esperada
```
backend/
├── app/
│   ├── api/            # routers por dominio (livestock, detections, alerts, events, potreros, assistant)
│   ├── core/            # config, db session, CORS, logging
│   ├── models/          # ORM: User, Potrero, Livestock, DroneMission, Media, Detection, Alert, Event
│   ├── schemas/         # Pydantic: request/response por dominio
│   ├── services/        # lógica de negocio (reconciliación, prioridad de alerta, etc.)
│   ├── repositories/     # acceso a datos por dominio
│   └── main.py
└── tests/
```

## Testing requerido
- **Pytest + HTTPX** contra la app FastAPI (TestClient/AsyncClient).
- Cobertura mínima: cada endpoint (happy path + validación fallida + no encontrado), cada service con lógica no trivial (ej. reconciliación de animales por potrero), repositorios contra una base de datos de test (o SQLite/Postgres de test vía Docker, a definir en `011-docker-environment`).

## Criterios de aceptación
- Cada endpoint documentado en una spec existe, responde el contrato exacto (forma y tipos) definido en `design.md`, y tiene tests en verde.
- Ningún router contiene lógica de negocio ni SQL directo.
- `pytest` pasa en verde localmente y en Docker.

## Errores que debe evitar la IA
- Devolver un modelo ORM serializado directamente sin pasar por un schema.
- Escribir queries SQL dentro de un router o un service.
- Crear un endpoint sin spec previa o sin que el frontend lo necesite.
- Ignorar validaciones de Pydantic y validar "a mano" dentro del endpoint.
