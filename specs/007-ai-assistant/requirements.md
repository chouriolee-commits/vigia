# 007 — AI Assistant (VIGÍA AI)

> **Corrección de auditoría:** esta es la spec que demuestra que la IA participa en la solución (no es un chatbot decorativo tipo "Dashboard → ChatGPT"). El requisito no negociable es que el asistente **razona sobre datos estructurados reales del sistema** (detecciones, alertas, potreros), no sobre texto libre sin contexto. Se elimina la persistencia en PostgreSQL del historial (fase futura) para no gastar tiempo del hackathon en algo que no aporta a la demo.

## Problema
El productor necesita consultar el estado del monitoreo en lenguaje natural, sin navegar manualmente por cada pantalla, y necesita que las respuestas reflejen datos reales del sistema, no texto genérico.

## Objetivo
Construir el chat "VIGÍA AI" del dashboard con respuestas generadas a partir del **contexto real** (mock o backend) de detecciones/alertas/potreros.

## Usuario
Productor ganadero / administrador de finca.

## User stories
- Como operador, quiero preguntar "¿qué animales requieren atención?" y recibir una respuesta basada en las alertas/detecciones activas reales.
- Como operador, quiero preguntar "¿qué ocurrió en el último monitoreo?" y recibir un resumen de las detecciones más recientes.
- Como operador, quiero preguntar "¿por qué se generó esta alerta?" y recibir la descripción/confidence de esa alerta específica.
- Como operador, quiero ver el historial de la conversación con avatares distintos (usuario/asistente).

## Requisitos funcionales

### MVP obligatorio
- RF1 **[MVP]** Panel de chat: nombre "VIGÍA AI", subtítulo "Asistente inteligente de monitoreo", lista de mensajes, input + botón enviar.
- RF2 **[MVP]** Al enviar un mensaje, se agrega inmediatamente a la lista (optimistic) y se solicita respuesta a `aiService.sendMessage(text, context)`.
- RF3 **[MVP] — núcleo de la demo de IA:** `aiService.sendMessage` construye el `context` a partir de los datos ya cargados en el dashboard (KPIs, evento detectado, lista de alertas activas) y responde según el mensaje:
  - Menciona un ID de animal (`#\d+`) → responde con la última detección/alerta de ese animal.
  - Menciona "atención"/"requieren atención" → responde con la lista de animales con alertas activas (tag + tipo + prioridad).
  - Menciona "último monitoreo"/"qué ocurrió" → responde con un resumen de las detecciones más recientes del feed.
  - Menciona "por qué"/"esta alerta" → responde con la descripción y confidence de la alerta más reciente del contexto.
  - Sin match → fallback: "No tengo información específica sobre eso todavía. Puedo ayudarte con animales, alertas o eventos recientes."
- RF4 **[MVP]** Estado "escribiendo..." mientras se resuelve la respuesta (aunque sea instantáneo, simular latencia corta para que se sienta real).
- RF5 **[MVP]** El historial de conversación vive en estado de React (`useChat`) durante la sesión — **no se persiste en PostgreSQL** en el MVP.
- RF6 **[Fase futura]** El servicio está preparado para reemplazar la heurística local por `POST /api/asistente/mensajes` (LLM real con el mismo contexto), sin cambiar el componente de chat. **LLM elegido: `llama-3.3-70b-versatile` (Groq, free tier)** — key y config ya documentadas en `design.md`, key real en `backend/.env` (gitignoreado).

## Requisitos no funcionales
- RNF1 **[MVP]** La respuesta debe poder justificarse ante un jurado como "generada a partir de datos reales del sistema", no como texto aleatorio.
- RNF2 **[MVP]** El chat debe funcionar completamente offline (sin backend) para garantizar la demo.

## Criterios de aceptación (Given/When/Then)

```
Dado que existe una alerta activa para el animal #024 con descripción "movimiento errático" y confidence 94%,
cuando el usuario pregunta "¿qué ocurrió con el animal #024?",
entonces el asistente responde citando esa descripción y ese confidence exactos (no una respuesta genérica).

Dado que hay 2 alertas activas en el contexto (animales #024 y #030),
cuando el usuario pregunta "¿qué animales requieren atención?",
entonces el asistente lista ambos animales con su tipo de alerta y prioridad.

Dado que el usuario hace una pregunta sin relación a los datos del sistema,
cuando no hay match en la heurística,
entonces el asistente responde con el fallback explícito, nunca con un error ni una respuesta vacía.
```

## Casos límite
- Mensaje vacío → botón enviar deshabilitado.
- Pregunta sobre un animal que no existe en el contexto → fallback, no un error.

## Restricciones
- No se integra un LLM real en el MVP (la heurística basada en el contexto real ya demuestra el punto: "IA usando datos del sistema", no "IA aislada"). La integración de un LLM real queda preparada (RF6) pero es fase futura.
- No se persiste el historial en base de datos en el MVP.
