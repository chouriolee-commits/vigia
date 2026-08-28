from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.livestock import ReconciliacionOut
from app.services import livestock_service

router = APIRouter(prefix="/api/potreros", tags=["potreros"])


@router.get("/{potrero_id}/reconciliacion", response_model=ReconciliacionOut)
def reconciliacion(potrero_id: int, db: Session = Depends(get_db)):
    resultado = livestock_service.get_reconciliation(db, potrero_id)
    if resultado is None:
        raise HTTPException(status_code=404, detail="Potrero no encontrado")
    return resultado
