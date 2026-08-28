from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.dashboard import DashboardOut
from app.services import dashboard_service

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("", response_model=DashboardOut)
def obtener_dashboard(db: Session = Depends(get_db)):
    return dashboard_service.get_dashboard_summary(db)
