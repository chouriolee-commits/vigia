from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.alert import AlertOut
from app.services import alert_service

router = APIRouter(prefix="/api/alertas", tags=["alertas"])


@router.get("", response_model=list[AlertOut])
def listar_alertas(db: Session = Depends(get_db)):
    return alert_service.list_active_alerts(db)
