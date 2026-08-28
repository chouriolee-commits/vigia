# Skill: Testing (VIGÍA)

## Contexto
Con 3h30 disponibles, testear todo con el mismo nivel de detalle es contraproducente. La prioridad (`010-testing`, `README.md` §8) es: Dashboard, Detecciones (overlay), Alertas, API (si hay backend), el flujo de los 3 botones + volver, y el Chat IA respondiendo con datos reales. Todo lo demás (edge cases exhaustivos, tests de features Fase futura) es opcional y no bloquea marcar una tarea MVP como completada.

## Propósito
Definir la estrategia de testing transversal de VIGÍA (frontend, backend, E2E) y las reglas para considerar una tarea/feature realmente "terminada".

## Cuándo utilizarla
- Al terminar la implementación de cualquier tarea de un `tasks.md`.
- Al escribir el `tests.md` de una nueva spec.
- Antes de marcar una tarea como completada (regla obligatoria: no se marca `[x]` sin tests en verde).

## Tecnologías relacionadas
Vitest, React Testing Library (frontend); Pytest, HTTPX (backend); Playwright (E2E).

## Reglas
1. Ninguna tarea de `tasks.md` se marca como completada sin que sus tests correspondientes (definidos en `tests.md` de la misma spec) pasen en verde.
2. Toda feature crítica (definida como tal en `requirements.md` de su spec) requiere al menos: 1 caso positivo, 1 caso negativo/error, 1 edge case.
3. Los tests de frontend no dependen de un backend real (usan mocks); los tests de backend no dependen del frontend ni del modelo real de visión (usan datos de prueba/mock del pipeline de detección).
4. Los tests E2E (Playwright) corren contra la app completa (o el mínimo levantado necesario) y cubren los flujos críticos definidos en `010-testing/requirements.md`.
5. Un test que falla no se comenta/skippea para "hacerlo pasar": se corrige el código o se ajusta el test si el comportamiento esperado cambió deliberadamente (y se documenta por qué).

## Buenas prácticas
- Nombrar tests describiendo el comportamiento esperado, no la implementación (`"muestra el botón volver en la pantalla de alertas"`, no `"renderiza AlertsPage"`).
- Un test, una aserción de comportamiento (evitar tests gigantes que validan 10 cosas a la vez).
- Reutilizar fixtures/mocks entre tests relacionados (ej. un mock de "potrero con animales" reutilizado en tests de dashboard y de la pantalla de animales).
- Ejecutar la suite completa localmente antes de considerar una spec cerrada.

## Restricciones
- No agregar frameworks de testing adicionales a los ya definidos (Vitest, RTL, Pytest, HTTPX, Playwright) sin justificación.
- No escribir tests que dependan de servicios externos reales (Roboflow API, modelo real pesado) en la suite estándar — esos casos van marcados como manuales/opcionales.

## Estructura esperada
```
frontend/tests/            # Vitest + RTL
backend/tests/             # Pytest + HTTPX
e2e/                        # Playwright (nivel raíz del monorepo o dentro de frontend/, a decidir en 010-testing)
```

## Testing requerido (de esta skill sobre sí misma)
- `010-testing` spec define y prioriza los flujos E2E críticos:
  - Dashboard → Animales Monitoreados (click en card, ver 2 tablas, volver).
  - Dashboard → Alertas Activas (click en card, ver tabla, volver).
  - Dashboard → Eventos Hoy (click en card, ver tabla, volver).
  - Monitoreo → Detección (ver detecciones sobre el feed simulado).
  - AI Assistant → enviar mensaje y recibir respuesta simulada.

## Criterios de aceptación
- `npm run test` (frontend) y `pytest` (backend) pasan en verde en cada spec cerrada.
- Los flujos E2E críticos definidos en `010-testing` pasan contra la app con datos mock.
- Cobertura de casos positivos, negativos y edge cases documentada por feature en cada `tests.md`.

## Errores que debe evitar la IA
- Marcar una tarea como completada sin correr los tests.
- Escribir tests que solo verifican que "no truena" sin validar el comportamiento esperado.
- Dejar tests rotos/skippeados sin justificación documentada.
