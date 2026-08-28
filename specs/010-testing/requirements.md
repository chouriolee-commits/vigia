# 010 — Testing (estrategia transversal, alcance reducido)

> Ver `README.md` §8. Regla: solo lo crítico durante las 3h30. Cobertura exhaustiva de edge cases es Fase futura.

## Problema
Sin una estrategia explícita y priorizada, una feature podría "implementarse" sin verificación real bajo la presión de tiempo del hackathon — pero tampoco hay tiempo para una suite exhaustiva.

## Objetivo
Definir el mínimo de testing que da confianza para demostrar el MVP ante un jurado, priorizado explícitamente.

## Requisitos funcionales

### MVP obligatorio — lo único que se testea de forma no negociable
- RF1 **[MVP]** Frontend (Vitest + RTL): `npm run test` corre y pasa para: `Dashboard` (KPI cards, evento detectado), `DetectionOverlay` (overlay de detecciones), `AlertsPage` (tabla), `AiAssistantPanel` (envío + respuesta con datos reales).
- RF2 **[MVP]** Un (1) flujo E2E (Playwright) que cubre el **flujo principal completo**: `Dashboard → click en cada uno de los 3 botones → ver la pantalla → ← Volver → Dashboard` (los 3 destinos en un solo test o en 3 tests cortos, no una suite grande).
- RF3 **[Fase futura, si hay backend conectado]** Pytest + HTTPX para los endpoints de `009-api-integration`.

### Fase futura
- RF4 **[Fase futura]** Tests de edge cases exhaustivos por spec (ya documentados en cada `tests.md` de dominio como referencia, pero no obligatorios para cerrar el MVP).
- RF5 **[Fase futura]** E2E de flujos secundarios (galería de medios, detalle de detección — features que ya son Fase futura en sus specs de origen).

## Requisitos no funcionales
- RNF1 **[MVP]** La suite crítica debe correr en menos de 1-2 minutos.

## Criterios de aceptación (Given/When/Then)
```
Dado que se completó la implementación de 002, 003, 006, 007 y 012 con mocks,
cuando se ejecuta npm run test,
entonces pasan los tests críticos de RF1 sin errores.

Dado que el frontend está corriendo en modo mock,
cuando se ejecuta el flujo E2E de RF2,
entonces navega correctamente por los 3 botones y regresa al dashboard en cada caso.
```

## Restricciones
- No se agregan frameworks de testing adicionales a Vitest/RTL/Pytest/HTTPX/Playwright.
- No se bloquea el cierre de una tarea del hackathon por un test de edge case no crítico — se documenta como pendiente y se sigue.
