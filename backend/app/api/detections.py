from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.media import Media
from app.schemas.detection import DetectionIn, DetectionOut
from app.services import detection_service

# Contrato interno vision -> backend (009-api-integration). No se expone a la UI.
router = APIRouter(prefix="/api/media", tags=["detecciones"])


@router.post("/{media_id}/detecciones", response_model=DetectionOut | None)
def ingestar_deteccion(media_id: int, payload: DetectionIn, db: Session = Depends(get_db)):
    try:
        resultado = detection_service.ingest_detection(db, media_id, payload)
    except detection_service.LivestockNoEncontrado:
        raise HTTPException(status_code=404, detail="livestock_id no encontrado")

    if resultado is None:
        # Puede ser confianza bajo el umbral (se descarta silenciosamente, no es error)
        # o media_id inexistente. Solo el segundo caso es un error real del cliente.
        if db.get(Media, media_id) is None:
            raise HTTPException(status_code=404, detail="Media no encontrada")
    return resultado
