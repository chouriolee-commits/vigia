from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.media import MediaIn, MediaOut
from app.services import media_service

router = APIRouter(prefix="/api/media", tags=["media"])


@router.post("", response_model=MediaOut, status_code=201)
def crear_media(payload: MediaIn, db: Session = Depends(get_db)):
    try:
        return media_service.create_media(db, payload)
    except media_service.MisionNoEncontrada:
        raise HTTPException(status_code=404, detail="mission_id no encontrado")
