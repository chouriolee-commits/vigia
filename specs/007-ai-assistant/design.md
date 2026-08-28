# 007 — AI Assistant — Design

## Por qué esto NO es "Dashboard → ChatGPT"
El input de `aiService.sendMessage` no es solo el texto del usuario: es `(text, context)`, donde `context` es el mismo objeto que ya consumen el dashboard y las 3 pantallas de detalle (KPIs, alertas activas, detecciones recientes). La respuesta se construye **a partir de ese contexto**, igual que lo haría un agente real con function-calling/RAG sobre el backend — la heurística del MVP es la versión más simple de esa misma arquitectura, no un atajo conceptual distinto. Esto es lo que se debe explicar a los jueces (ver `README.md` §2).

## Componentes involucrados
```
components/AiAssistantPanel.jsx   (usado en 002-dashboard)
├── components/ChatMessageList.jsx
├── components/ChatMessage.jsx     (variante user/assistant)
└── components/ChatInput.jsx
```

## Flujo de datos
```
AiAssistantPanel
  → useChat(dashboardContext) [hook]  → estado local: messages[], isTyping
      → aiService.sendMessage(text, context) [service]
          → MVP: heurística local sobre `context` (services/mocks/ai.mock.js)
          → Fase futura: POST /api/asistente/mensajes (mismo `context` enviado al backend, que lo pasa a un LLM)
  ← { role: 'assistant', content: '...', suggested_action?: { label, route } }
```

`context` (mismo shape que ya usan `002-dashboard` y `006-alert-system`):
```json
{
  "alertas_activas": [{ "livestock_tag": "#024", "type": "comportamiento_anomalo", "priority": "alta", "description": "...", "confidence": 0.94 }],
  "detecciones_recientes": [{ "livestock_tag": "#055", "behavior": "descanso", "detected_at": "..." }]
}
```

## Heurística de respuesta (MVP)
1. Mensaje contiene `#\d+` (ID de animal) presente en `context.alertas_activas` o `context.detecciones_recientes` → responde citando esa descripción/confidence exacta.
2. Mensaje contiene "atención" → lista `context.alertas_activas` (tag + tipo + prioridad).
3. Mensaje contiene "último monitoreo" / "qué ocurrió" → resume `context.detecciones_recientes`.
4. Mensaje contiene "por qué" + referencia a alerta → devuelve `description` + `confidence` de la alerta más reciente del contexto.
5. Sin match → fallback documentado en `requirements.md`.

Esta heurística vive en `services/aiService.js`, no en el componente (`skills/frontend` regla 2).

## Fase futura — contrato REST (documentado, no implementado)
`POST /api/asistente/mensajes`
```json
// request: { "message": "...", "context": { ...mismo shape... } }
// response: { "role": "assistant", "content": "...", "suggested_action": { "label": "Ver análisis", "route": "/alertas" } }
```
El backend, en fase futura, reenvía `message` + `context` a un LLM (o mantiene la misma heurística en Python) — el contrato no cambia entre MVP y fase futura, solo la implementación interna de `aiService`.

## Decisión técnica — LLM real con Groq (fase futura, ya configurado)

**Modelo elegido:** `llama-3.3-70b-versatile` (free tier de Groq).
Justificación: mejor razonamiento/calidad del tier gratuito, buen soporte de español (el usuario es productor en Casanare), latencia muy baja (LPU, ~394 tokens/s) y el cupo de 100K tokens/día / 1,000 requests/día sobra para la demo y para un MVP real.

> **Nota de contingencia:** este modelo es la elección por defecto, pero **no es un requisito rígido**. Si `llama-3.3-70b-versatile` no puede integrarse cuando se implemente el backend (dado de baja del free tier, renombrado, rate limits demasiado ajustados, errores de compatibilidad), se debe integrar **cualquier otro modelo de Groq que funcione correctamente** para el chat del sistema (ej. `llama-4-scout` o `qwen3-32b` del mismo free tier, o la alternativa gratuita que en ese momento esté disponible y sea estable). Lo único no negociable es: (1) el contrato REST con el frontend no cambia (`message` + `context` → `role/content`), (2) el fallback a la heurística local se mantiene si el LLM no responde, y (3) la key se lee siempre de `GROQ_API_KEY` en `core/config.py`. El valor exacto de `GROQ_MODEL` queda como variable de entorno precisamente para permitir este swap sin tocar código.

| Config | Valor |
|---|---|
| API key (env) | `GROQ_API_KEY` — vive en `backend/.env` (gitignoreado, `backend/.env.example` para referencia) |
| Modelo (env) | `GROQ_MODEL=llama-3.3-70b-versatile` |
| Endpoint | `GROQ_BASE_URL=https://api.groq.com/openai/v1` (OpenAI-compatible) |
| Límites free tier | 30 RPM / 1,000 RPD / 12K TPM / 100K TPD |

**Integración (cuando se implemente el backend):**
- El endpoint `POST /api/asistente/mensajes` lee `message` + `context` de la request y construye el prompt:
  - `system`: instrucciones de rol del asistente + el `context` estructurado (alertas_activas, detecciones_recientes, KPIs). Groq permite streaming (`stream: true`) para el efecto "escribiendo..." ya modelado en el frontend con `isTyping`.
  - `user`: el `message`.
- La key se lee en `backend/app/core/config.py` desde `GROQ_API_KEY` (nunca hardcodearla). Ver `skills/backend`.
- SDK: `pip install groq` (o el cliente OpenAI apuntando a `GROQ_BASE_URL`).
- El `context` se serializa a JSON en el system prompt con los campos ya definidos (§ "Heurística de respuesta") — no se cambia el contrato del frontend.
- Si la key falta o Groq falla (429 por rate limit/red), se hace **fallback a la heurística local** (la del MVP) para no romper la demo — mismo patrón que `VITE_USE_MOCK` en el frontend.
- Alternativas gratuitas anotadas (si se agota el free tier de Groq): Gemini Flash (Google, 1,500 req/día gratis) vía endpoint propio; OpenRouter (variedad de open-source con tier free). No se implementan sin justificación en este design.md.

**Seguridad:** la API key real NO se documenta en este spec ni se commitea. Vive únicamente en `backend/.env` (ignorado por `.gitignore`). Esto es deliberado: el repo está en GitHub y una key commiteada quedaría expuesta.

## Decisión técnica
- `suggested_action.route` solo puede apuntar a una de las 4 rutas ya existentes (`/`, `/animales`, `/alertas`, `/eventos`) — nunca crea una ruta nueva (consistente con `README.md` §3).
