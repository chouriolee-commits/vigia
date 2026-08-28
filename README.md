# VIGÍA

Plataforma de monitoreo ganadero con drones/cámaras, visión artificial (YOLOv8) y un agente de IA — MVP para el hackathon de diversificación económica de Casanare (cadena ganadera, no petrolera).

> **Único README del proyecto.** Todo lo que antes vivía repartido en `skills/README.md` y `specs/README.md` está consolidado aquí.

---

## 1. El problema real

Un productor ganadero no puede supervisar continuamente grandes extensiones de terreno. Un animal enfermo, aislado o con baja actividad puede pasar desapercibido hasta que el problema ya es grave. Hoy esa vigilancia depende casi por completo de la observación manual.

**Usuario afectado:** productor ganadero / administrador de finca en Casanare.

**Solución:** VIGÍA usa visión artificial sobre imágenes/video (drone o cámara) para detectar animales, analizar su comportamiento y generar alertas cuando algo requiere revisión. Un agente de IA interpreta esos eventos usando los datos reales del sistema y ayuda al productor a decidir qué revisar primero.

**Importante — límite de responsabilidad de la IA:** VIGÍA nunca presenta un diagnóstico veterinario. Solo reporta: detección, anomalía, comportamiento inusual, evento que requiere revisión, recomendación de inspección.

### La historia que debe poder contarse a un jurado en 30 segundos

> Un dron obtiene información del ganado. VIGÍA usa visión artificial para detectar animales y analizar su comportamiento. Cuando identifica una situación que requiere atención, genera una alerta. El agente de IA interpreta esa información y ayuda al productor a decidir qué revisar. Todo queda registrado y se visualiza desde el dashboard.

## 2. Flujo conceptual (IA como núcleo, no como decoración)

```
DRON / CÁMARA → IMAGEN/VIDEO → YOLOv8 (detección) → DETECTIONS (+ comportamiento)
                                                            ↓
                                                    EVENTO / ALERTA
                                                    ↙              ↘
                                          PostgreSQL          AGENTE DE IA
                                                    ↘              ↙
                                                       FASTAPI
                                                            ↓
                                                    REACT — VIGÍA UI
```

El agente de IA **no es un chatbot decorativo**: recibe como contexto las detecciones/alertas reales del sistema y responde preguntas como *"¿qué animales requieren atención?"*, *"¿qué ocurrió en el último monitoreo?"*, *"¿por qué se generó esta alerta?"*. Ver `specs/007-ai-assistant/`.

## 3. Restricción de diseño — solo 3 botones, sin funcionalidades adicionales

La UI es **exactamente** la de `fotos-diseño/` (desktop y mobile). No se agrega ninguna pantalla ni interacción que no esté ya cubierta por:

- El dashboard (feed simulado + panel de evento detectado + chat VIGÍA AI), tal cual aparece en las imágenes.
- Los **3 botones/cards** clicables del dashboard, cada uno navega a una pantalla de detalle con botón "← Volver":
  - **Animales Monitoreados** → `/animales` (2 tablas: reales vs. esperados por potrero).
  - **Alertas Activas** → `/alertas` (tabla de alertas).
  - **Eventos Hoy** → `/eventos` (tabla de eventos del día).

Nada más navega a una pantalla nueva. En concreto (corregido en esta auditoría):
- El botón "Revisar imágenes capturadas" **no abre una galería nueva**: es parte del feed del dashboard, sin ruta propia en el MVP (ver `specs/004-drone-media`, reducido).
- El link "Ver análisis →" del panel de evento detectado **reutiliza `/alertas`**, no crea una pantalla de detalle nueva (ver `specs/005-yolov8-detection`, reducido).

**Excepción añadida después de la auditoría:** se agregó `/login` como puerta de entrada antes del dashboard (`specs/013-authentication`) — login **y registro** funcionales (mock) en el mismo panel, con la paleta de VIGÍA e ilustración 2D de un dron grabando vacas dentro del propio div del formulario. No forma parte de los 3 botones ni de `fotos-diseño/`; es la única pantalla del MVP que se agregó fuera de esa regla, y se agregó a petición explícita, no por interpretación libre.

## 4. MVP obligatorio vs. Fase futura (hackathon de 3h30)

| # | Feature | MVP obligatorio | Fase futura |
|---|---|---|---|
| Dashboard | KPI cards + feed + evento detectado + chat | ✅ | — |
| Animales Monitoreados (2 tablas) | ✅ | Selector multi-potrero si hay tiempo |
| Alertas Activas (tabla) | ✅ | Cambiar estado de alerta desde la UI |
| Eventos Hoy (tabla) | ✅ (derivado por query, sin tabla propia) | Tabla `events` persistida con triggers |
| Detección YOLOv8 | ✅ (modelo simulado o pre-entrenado COCO) | Modelo propio entrenado con Roboflow |
| Alertas generadas desde detección | ✅ | Reglas de negocio más sofisticadas |
| Agente de IA con contexto real | ✅ (heurística local; LLM real preparado: Groq `llama-3.3-70b-versatile`) | Historial persistido (`ai_conversations`) |
| Backend FastAPI + PostgreSQL real | 🟡 deseable, no bloqueante — frontend con mocks garantiza la demo | Persistencia completa, migraciones en CI |
| Login (`/login`, mock, paleta VIGÍA + ilustración dron) | ✅ (`013-authentication`) | Autenticación real contra tabla `users` |
| Docker Compose completo | 🟡 arquitectura definida, no bloqueante para la demo | Healthchecks, multi-stage build |
| Testing exhaustivo (todos los edge cases) | ❌ solo lo crítico (ver §8) | Cobertura completa |

**Regla de oro para las 3h30:** el frontend con datos mock es el plan que garantiza la demo. Backend/PostgreSQL/Docker se conectan **si el tiempo alcanza**, sin bloquear lo anterior.

## 5. Stack

React + Vite + React Router + JS (frontend) · FastAPI + Pydantic (backend) · PostgreSQL (única BD) · YOLOv8 + Roboflow + OpenCV (visión) · Docker Compose (infra, fase futura) · Vitest/RTL, Pytest/HTTPX, Playwright (testing, alcance reducido).

## 6. Skills — cómo trabajar dentro de VIGÍA

Instrucciones especializadas por dominio, escritas para VIGÍA (no tutoriales genéricos). Leer la relevante **antes** de tocar esa capa.

| Skill | Cuándo leerla |
|---|---|
| [`skills/architecture/skill.md`](skills/architecture/skill.md) | Siempre, antes de cualquier spec — define capas y límites. |
| [`skills/frontend/skill.md`](skills/frontend/skill.md) | Antes de tocar `frontend/` — incluye la restricción de "solo 3 botones". |
| [`skills/backend/skill.md`](skills/backend/skill.md) | Antes de tocar `backend/`. |
| [`skills/postgresql/skill.md`](skills/postgresql/skill.md) | Antes de crear tablas/migraciones. |
| [`skills/computer-vision/skill.md`](skills/computer-vision/skill.md) | Antes de tocar el pipeline general de `vision/`. |
| [`skills/yolov8/skill.md`](skills/yolov8/skill.md) | Antes de implementar `vision/inference/`. |
| [`skills/roboflow/skill.md`](skills/roboflow/skill.md) | Antes de gestionar dataset/anotaciones. |
| [`skills/docker/skill.md`](skills/docker/skill.md) | Fase futura — solo si sobra tiempo. |
| [`skills/testing/skill.md`](skills/testing/skill.md) | Antes de cerrar cualquier tarea — alcance reducido a lo crítico. |

## 7. Specs — features reales del producto

Cada `specs/00X-*/` tiene `requirements.md` (con etiqueta **MVP obligatorio** o **Fase futura** por requisito, y criterios de aceptación en formato Given/When/Then), `design.md`, `tasks.md`, `tests.md`.

| # | Spec | MVP crítico | Resumen |
|---|---|---|---|
| 001 | [project-foundation](specs/001-project-foundation/requirements.md) | ✅ | Estructura, stack, estrategia "frontend-mock-first" para 3h30. |
| 002 | [dashboard](specs/002-dashboard/requirements.md) | ✅ | Pantalla principal: feed, 3 KPI cards/navegación, evento detectado, chat. |
| 003 | [livestock-monitoring](specs/003-livestock-monitoring/requirements.md) | ✅ | "Animales Monitoreados": 2 tablas reales vs. esperados. |
| 004 | [drone-media](specs/004-drone-media/requirements.md) | ✅ (solo feed embebido) | Feed simulado del dron. Galería = Fase futura. |
| 005 | [yolov8-detection](specs/005-yolov8-detection/requirements.md) | ✅ (contrato + overlay) | Contrato de detección YOLOv8. Detalle en página propia = Fase futura. |
| 006 | [alert-system](specs/006-alert-system/requirements.md) | ✅ | "Alertas Activas": tabla de alertas. |
| 007 | [ai-assistant](specs/007-ai-assistant/requirements.md) | ✅ | Agente de IA con contexto real (no chatbot decorativo). |
| 008 | [postgresql-data-model](specs/008-postgresql-data-model/requirements.md) | ✅ (6 tablas núcleo) | Modelo de datos — `users`/`events`/`ai_*` son Fase futura. |
| 009 | [api-integration](specs/009-api-integration/requirements.md) | 🟡 | Contratos REST — conecta si el tiempo alcanza. |
| 010 | [testing](specs/010-testing/requirements.md) | ✅ (reducido) | Solo: dashboard, detecciones, alertas, API, flujo 3-botones+volver, chat IA. |
| 011 | [docker-environment](specs/011-docker-environment/requirements.md) | 🟡 Fase futura | `docker-compose.yml` mínimo, no bloqueante. |
| 012 | [events-log](specs/012-events-log/requirements.md) | ✅ (derivado, sin tabla propia) | "Eventos Hoy": tabla de eventos del día. |
| 013 | [authentication](specs/013-authentication/requirements.md) | ✅ | `/login`: login + registro funcionales (mock, mismo card) + ilustración 2D de dron grabando vacas. Única pantalla fuera de los 3 botones. |

### Orden de dependencias

```
001-project-foundation → 008-postgresql-data-model (modelo, aunque backend sea fase 2)
        ↓
013-authentication (puerta de entrada)
        ↓
002-dashboard (+ contrato de navegación de los 3 botones)
   ┌────┼──────────────┬───────────────┐
   ↓                   ↓               ↓
003-livestock-      006-alert-      012-events-log
monitoring           system
        ↓
004-drone-media → 005-yolov8-detection → 007-ai-assistant
        ↓
009-api-integration → 010-testing → 011-docker-environment
```

### Contrato de navegación (única fuente de verdad — reemplaza lo que antes estaba en `specs/README.md`)

- `/login` es pública y es el único punto de entrada sin sesión; `/`, `/animales`, `/alertas`, `/eventos` quedan protegidas por un guard (`013-authentication`) — sin sesión, cualquiera de esas 4 redirige a `/login`.
- Dashboard (`/`) tiene 3 elementos clicables: **Animales Monitoreados**, **Alertas Activas**, **Eventos Hoy** → navegan a `/animales`, `/alertas`, `/eventos`.
- Cada pantalla de detalle muestra "← Volver" → `navigate('/')`.
- Ninguna otra ruta existe en el MVP. El botón "Revisar imágenes capturadas" y el link "Ver análisis →" **no** crean rutas nuevas (ver §3).

## 8. Testing — prioridad para 3h30

Solo lo crítico (`skills/testing/skill.md` + `specs/010-testing/`): **Dashboard**, **Detecciones** (overlay + contrato), **Alertas**, **API** (si hay backend conectado), **flujo principal** (dashboard → cada uno de los 3 botones → volver), **Chat IA**. Todo lo demás (edge cases exhaustivos, E2E de flujos secundarios) es opcional/fase futura.

## 9. Orden recomendado de implementación durante el hackathon (3h30)

```
0:00–0:20  001-project-foundation (estructura + mocks base)
0:20–0:35  013-authentication (login mock + ilustración del dron + guard de rutas)
0:35–1:20  002-dashboard con mocks (feed, 3 cards navegables, evento detectado, chat mock)
1:20–1:50  003-livestock-monitoring + 006-alert-system + 012-events-log (con mocks)
1:50–2:20  007-ai-assistant respondiendo con contexto de los mocks (esto es la IA "central" — no dejar para el final)
2:20–2:50  005-yolov8-detection: overlay real sobre imágenes/video de ejemplo (demuestra CV funcionando)
2:50–3:20  Si alcanza el tiempo: 008/009 backend+DB real conectado a 1-2 endpoints (ideal: detecciones y alertas)
3:20–3:30  Pulido visual + ensayo de la demo (narrativa de §1)
```

Si el tiempo se agota antes de 2:50, **el frontend con mocks ya es una demo completa y defendible** — ese es el objetivo de priorizar así.

## 10. Flujo de trabajo obligatorio (SKILL → SPEC → TASK → IMPLEMENTATION → TEST → VALIDATION)

```
1. Leer este README (contexto del proyecto + qué es MVP vs fase futura)
        ↓
2. Leer la(s) skill(s) relevantes a la capa que se va a tocar
        ↓
3. Leer la spec completa (requirements → design → tasks → tests)
        ↓
4. Analizar arquitectura/código existente relacionado
        ↓
5. Implementar la tarea marcada como MVP (una a la vez, desde tasks.md)
        ↓
6. Ejecutar los tests críticos definidos en tests.md
        ↓
7. Corregir errores hasta que pasen
        ↓
8. Validar contra los criterios de aceptación (Given/When/Then) de requirements.md
        ↓
9. Marcar la tarea como [x] en tasks.md SOLO si sus tests críticos pasan
        ↓
10. Continuar con la siguiente tarea MVP; dejar las de Fase futura para el final
```

**Ninguna IA debe empezar a programar una feature importante sin haber leído su spec completa primero.**

## 11. Reglas globales

1. No modificar la arquitectura sin justificarlo por escrito en el `design.md` correspondiente.
2. No instalar dependencias fuera del stack definido en `001-project-foundation`.
3. No duplicar lógica entre capas o entre frontend/backend.
4. No colocar lógica de negocio dentro de componentes React ni en endpoints FastAPI.
5. Mantener separación de responsabilidades (`skills/architecture`).
6. No romper funcionalidades existentes.
7. Revisar la spec antes de implementar.
8. Marcar una tarea como completada solo después de validar sus tests críticos.
9. No inventar APIs ni pantallas que no estén en una spec — **especialmente: no crear rutas fuera de las 5 ya definidas (`/login`, `/`, `/animales`, `/alertas`, `/eventos`)**.
10. Usar mocks cuando el backend/modelo real todavía no esté implementado.
11. Mantener contratos claros y versionados entre frontend, backend y vision.
12. PostgreSQL es la única base de datos permitida.
13. Priorizar SIEMPRE que la demo funcione con mocks antes que perfeccionar backend/infra.
14. La IA (visión + agente) debe estar conectada al flujo de datos real del sistema, nunca aislada como un chatbot decorativo.
15. Documentar toda decisión técnica importante en el `design.md` de la spec correspondiente.
