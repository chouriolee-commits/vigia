from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.evento import EventoOut
from app.services import event_service

router = APIRouter(prefix="/api/eventos", tags=["eventos"])


@router.get("", response_model=list[EventoOut])
def listar_eventos(date: str = "hoy", db: Session = Depends(get_db)):
    # Único valor soportado por ahora es "hoy" (RF4 de 012-events-log); se deja el
    # parámetro para no romper el contrato si a futuro se agregan rangos de fecha.
    return event_service.get_events_today(db)
