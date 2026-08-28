# 007 — AI Assistant — Tasks

## MVP
- [ ] Crear `components/ChatMessageList.jsx`, `components/ChatMessage.jsx`, `components/ChatInput.jsx`.
- [ ] Crear `components/AiAssistantPanel.jsx`.
- [ ] Crear `services/mocks/ai.mock.js` con la heurística de `design.md` operando sobre el `context` real del dashboard (no respuestas fijas desconectadas de los datos).
- [ ] Crear `services/aiService.js` (`sendMessage(text, context)`).
- [ ] Crear hook `hooks/useChat.js` (recibe `context` desde `useDashboardData`, expone `messages`, `isTyping`, `sendMessage`).
- [ ] Integrar `AiAssistantPanel` dentro de `DashboardPage`, pasando el `context` real (mismo objeto que alimenta las KPI cards).
- [ ] Validar manualmente las 4 preguntas de ejemplo del reto (§7.5 del prompt de auditoría): "¿qué animales requieren atención?", "¿cuáles presentan eventos recientes?", "¿qué ocurrió en el último monitoreo?", "¿por qué se generó esta alerta?".

## Fase futura
- [ ] Endpoint `POST /api/asistente/mensajes` conectado a un LLM real.
- [ ] Persistencia de conversación (`ai_conversations`/`ai_messages`).
