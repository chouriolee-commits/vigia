from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.mission import MissionIn, MissionOut
from app.services import media_service

router = APIRouter(prefix="/api/misiones", tags=["misiones"])


@router.post("", response_model=MissionOut, status_code=201)
def crear_mision(payload: MissionIn, db: Session = Depends(get_db)):
    try:
        return media_service.create_mission(db, payload)
    except media_service.PotreroNoEncontrado:
        raise HTTPException(status_code=404, detail="potrero_id no encontrado")
