"""
Asistente IA del dashboard (007-ai-assistant, fase futura). LLM real vía Groq
(API compatible con OpenAI) usando httpx directo — evita sumar un SDK nuevo al
stack (ya tenemos httpx para tests).

Si falta la API key o la llamada a Groq falla (red, 429, etc.), se responde con
un mensaje de fallback en vez de reventar el endpoint: el chat sigue disponible,
solo avisa que no pudo consultar al modelo.
"""

import httpx

from app.core.config import settings
from app.schemas.assistant import AssistantMessageOut

_SYSTEM_PROMPT = (
    "Eres VIGÍA AI, el asistente del dashboard de monitoreo de ganado bovino. "
    "Respondes preguntas en español, de forma breve y concreta, usando ÚNICAMENTE "
    "los datos reales que se te dan en el contexto (alertas activas, detecciones "
    "recientes, KPIs). Si el contexto no tiene la información pedida, dilo "
    "explícitamente en vez de inventar datos. "
    "El usuario es un productor ganadero, no un técnico: NUNCA menciones datos técnicos "
    "internos del sistema de visión artificial — nivel de confianza/confidence, "
    "coordenadas o bounding box (x, y, width, height, área del cuadro de detección), "
    "IDs internos (livestock_id, detection_id, media_id) ni nombres de modelo/versión. "
    "Nada de eso le aporta algo al productor y no lo va a entender. Tradúcelo siempre a "
    "lenguaje simple: en vez de 'con 94% de confianza' di 'se detectó claramente'; en vez "
    "de dar una posición en coordenadas, describe dónde está en términos que un ganadero "
    "reconozca (el potrero, cerca de tal grupo, etc.) o simplemente omite la ubicación si "
    "el contexto no trae algo entendible."
)

_FALLBACK_MESSAGE = (
    "No pude conectar con el asistente en este momento. Intenta de nuevo en unos segundos."
)


def ask(message: str, context: dict) -> AssistantMessageOut:
    if not settings.groq_api_key:
        return AssistantMessageOut(content=_FALLBACK_MESSAGE)

    try:
        response = httpx.post(
            f"{settings.groq_base_url}/chat/completions",
            headers={"Authorization": f"Bearer {settings.groq_api_key}"},
            json={
                "model": settings.groq_model,
                "messages": [
                    {"role": "system", "content": f"{_SYSTEM_PROMPT}\n\nContexto: {context}"},
                    {"role": "user", "content": message},
                ],
                "temperature": 0.3,
                "max_tokens": 400,
            },
            timeout=15.0,
        )
        response.raise_for_status()
        content = response.json()["choices"][0]["message"]["content"]
        return AssistantMessageOut(content=content.strip())
    except (httpx.HTTPError, KeyError, IndexError):
        return AssistantMessageOut(content=_FALLBACK_MESSAGE)
