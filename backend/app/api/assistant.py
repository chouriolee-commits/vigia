from fastapi import APIRouter

from app.schemas.assistant import AssistantMessageIn, AssistantMessageOut
from app.services import assistant_service

router = APIRouter(prefix="/api/asistente", tags=["asistente"])


@router.post("/mensajes", response_model=AssistantMessageOut)
def enviar_mensaje(payload: AssistantMessageIn):
    return assistant_service.ask(payload.message, payload.context)
