# Skill: Architecture (VIGÍA)

## Contexto
VIGÍA es un MVP de **3h30 de hackathon** (diversificación económica de Casanare, cadena ganadera). La arquitectura por capas existe para que el equipo no se enrede, no para parecer "empresarial". Ver `README.md` raíz §4 (MVP vs. Fase futura) antes de aplicar cualquier regla de esta skill: si una regla entra en conflicto con entregar la demo a tiempo, la prioridad es la demo — se documenta la deuda técnica, no se bloquea el avance.

## Propósito
Definir y hacer cumplir la arquitectura general del proyecto VIGÍA (monorepo multi-servicio) para que cualquier IA o desarrollador que implemente una feature respete las capas, los límites entre módulos y el flujo de datos, sin importar si trabaja en frontend, backend o visión artificial.

## Cuándo utilizarla
- Antes de empezar cualquier spec, para ubicar en qué capa/carpeta vive cada pieza.
- Cuando exista duda sobre dónde colocar lógica nueva (¿componente, hook, servicio, endpoint, repositorio?).
- Cuando se evalúe agregar una dependencia, un servicio nuevo o modificar la estructura de carpetas.
- Al revisar un PR/spec para validar que no se violó la separación de responsabilidades.

## Tecnologías relacionadas
React + Vite (frontend), FastAPI (backend), PostgreSQL (persistencia), YOLOv8 + Roboflow (visión artificial), Docker Compose (orquestación).

## Arquitectura general (alto nivel)

```
Drone (fuente de datos simulada/real)
   ↓ imagen/video
[vision] YOLOv8 + preprocessing
   ↓ detecciones (json)
[backend] FastAPI (api → services → repositories → models)
   ↓ persiste / expone REST
[database] PostgreSQL
   ↑ consume vía services/*.js
[frontend] React (UI → components → hooks → services → API)
```

Cada servicio (`frontend/`, `backend/`, `vision/`, `database/`) es independiente y se comunica solo por contratos explícitos (REST JSON), nunca por imports cruzados de código.

## Flujo de capas por servicio

**Frontend:** `UI (pages/components) → hooks → services → API (fetch/axios)`
**Backend:** `api (routers) → services (lógica de negocio) → repositories (acceso a datos) → models (ORM/tablas)`
**Vision:** `preprocessing → inference (YOLOv8) → output normalizado (contrato con backend)`

## Reglas
1. No modificar esta arquitectura sin justificar por escrito en el `design.md` de la spec correspondiente.
2. No crear dependencias circulares entre `frontend/`, `backend/` y `vision/`: la única comunicación permitida es HTTP (REST) o, en el caso de vision→backend, el contrato de detección definido en `005-yolov8-detection`.
3. Un componente de React nunca llama a `fetch`/`axios` directamente: pasa por `services/`.
4. Un router de FastAPI nunca contiene lógica de negocio ni queries SQL directas: pasa por `services/` y `repositories/`.
5. `vision/` no conoce PostgreSQL ni FastAPI directamente: produce un output normalizado que el backend consume.
6. Toda nueva carpeta top-level en el monorepo debe justificarse en `specs/001-project-foundation/design.md`.
7. No instalar dependencias/paquetes fuera del stack definido (React, Vite, React Router, FastAPI, Pydantic, PostgreSQL, YOLOv8, OpenCV, Roboflow, Docker) sin justificación explícita y mínima.

## Buenas prácticas
- Un módulo, una responsabilidad: si una carpeta empieza a mezclar UI y lógica de negocio, se refactoriza antes de seguir agregando features.
- Los contratos entre capas (tipos, schemas Pydantic, mocks de frontend) se versionan junto con la spec que los introduce.
- Preferir composición sobre herencia; preferir funciones puras en `services/` y `utils/` sobre clases con estado innecesario.
- Cuando el backend real no exista aún, el frontend consume mocks con la misma forma (shape) que tendrá la respuesta real de FastAPI, para que el swap sea un cambio de una línea en `services/api.js`.

## Restricciones
- No se permite lógica de negocio dentro de componentes React ni dentro de endpoints FastAPI (ver reglas 3 y 4).
- No se permite acceso directo a PostgreSQL desde `vision/` ni desde `frontend/`.
- No se permite saltarse capas (ej. un componente React llamando directo a un repository o a la base de datos).

## Estructura esperada (monorepo)
```
VIGIA/
├── frontend/
├── backend/
├── vision/
├── database/
├── skills/
├── specs/
├── docker-compose.yml
└── README.md
```
Ver el detalle de cada subcarpeta en la skill específica de esa capa.

## Testing requerido
Esta skill no define tests directamente, pero exige que **toda spec** incluya cómo se valida la integración entre capas (contract tests entre frontend↔backend, backend↔vision) en su `tests.md`.

## Criterios de aceptación
- La estructura de carpetas de una nueva feature coincide con lo definido en su `design.md`.
- No hay imports ni llamadas que salten capas.
- Los contratos (schemas, tipos, mocks) están documentados y versionados junto a la spec.

## Errores que debe evitar la IA
- Crear "utils" o "helpers" genéricos que terminan siendo un cajón de sastre con lógica de negocio.
- Duplicar lógica de validación entre frontend y backend en vez de compartir el contrato (mismo schema/forma de datos documentado).
- Acoplar el frontend a la forma interna de la base de datos en lugar de al contrato REST.
- Introducir un framework/librería nueva "porque es mejor" sin justificar por qué el stack definido no alcanza.
- **Crear una ruta/pantalla nueva que no sea una de las 5 ya definidas** (`/login`, `/`, `/animales`, `/alertas`, `/eventos`) — ver `README.md` §3. Esto incluye no reintroducir la galería de medios ni el modal de detalle de detección que se eliminaron del MVP en la auditoría.
- Implementar `users`, `events` (tabla persistida) o `ai_conversations`/`ai_messages` sin que el resto del MVP ya esté demostrable — son Fase futura (`008-postgresql-data-model`).
