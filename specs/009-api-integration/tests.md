# 009 — API Integration — Tests

## Unit tests
- Cada `services/*.js` respeta `USE_MOCK`: con `USE_MOCK=true` nunca llama a `fetch`; con `USE_MOCK=false` siempre llama a `apiFetch`.

## Integration tests
- Con el backend levantado (Docker o local) y `VITE_USE_MOCK=false`, cada pantalla del frontend (Dashboard, Animales, Alertas, Eventos, Monitoreo, Asistente) carga datos reales sin errores de contrato (mismos campos que el mock).

## API tests (Pytest + HTTPX, por endpoint)
- Cada endpoint de la tabla en `design.md`: caso positivo (200/201), caso de recurso no encontrado (404 donde aplique), caso de validación fallida (422).
- Test de contrato: la respuesta de cada endpoint tiene exactamente los campos documentados en la spec de origen (ni de más ni de menos en los campos requeridos).

## Casos positivos
- Flujo completo: `POST /api/media/{id}/detecciones` (ingesta simulando vision) → `GET /api/dashboard` refleja el nuevo conteo/evento.

## Casos negativos
- Backend apagado + `VITE_USE_MOCK=false` → cada hook expone `error`, ninguna pantalla queda en blanco sin mensaje.
- Payload de ingesta de detección con `confidence` fuera de rango → 422, no se persiste.

## Edge cases
- CORS: request desde el origin del frontend de desarrollo no es bloqueado.
- Timeout/latencia simulada del backend no cuelga la UI (loading state visible, sin freeze).
