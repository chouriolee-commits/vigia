from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.repositories import potrero_repository
from app.schemas.livestock import PotreroOut, ReconciliacionOut
from app.services import livestock_service

router = APIRouter(prefix="/api/potreros", tags=["potreros"])


@router.get("", response_model=list[PotreroOut])
def listar_potreros(db: Session = Depends(get_db)):
    """Para que el frontend pueda ofrecer un selector de cualquier potrero ya escaneado."""
    return [PotreroOut(id=p.id, name=p.name) for p in potrero_repository.list_all(db)]


@router.get("/{potrero_id}/reconciliacion", response_model=ReconciliacionOut)
def reconciliacion(potrero_id: int, db: Session = Depends(get_db)):
    resultado = livestock_service.get_reconciliation(db, potrero_id)
    if resultado is None:
        raise HTTPException(status_code=404, detail="Potrero no encontrado")
    return resultado
