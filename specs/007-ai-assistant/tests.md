# 007 — AI Assistant — Tests

## Críticos (MVP)
- `aiService.sendMessage` aplica correctamente cada regla de la heurística usando el `context` de prueba (match por animal, por "atención", por "último monitoreo", por "por qué", fallback).
- Pregunta sobre un animal con alerta activa en el `context` de prueba devuelve una respuesta que **incluye la descripción y confidence exactos** de esa alerta (no una respuesta genérica) — este es el test que prueba que la IA usa datos reales.
- `useChat` agrega el mensaje del usuario inmediatamente y luego la respuesta del asistente.
- Botón enviar deshabilitado con input vacío.

## Opcionales / fase futura
- Tests de integración contra `POST /api/asistente/mensajes` (solo si se implementa).
- Persistencia de conversación.
