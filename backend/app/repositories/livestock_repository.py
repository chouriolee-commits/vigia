from datetime import datetime

from sqlalchemy.orm import Session

from app.models.detection import Detection
from app.models.livestock import Livestock


def get(db: Session, livestock_id: int) -> Livestock | None:
    return db.get(Livestock, livestock_id)


def count_active(db: Session) -> int:
    """Total de animales bajo monitoreo (tarjeta 'Animales Monitoreados' del dashboard)."""
    return db.query(Livestock).filter(Livestock.status == "activo").count()


def list_expected_in_potrero(db: Session, potrero_id: int) -> list[Livestock]:
    """Animales que deberían estar en el potrero (asignación en tabla livestock)."""
    return list(
        db.query(Livestock)
        .filter(Livestock.potrero_id == potrero_id, Livestock.status == "activo")
        .order_by(Livestock.tag_code)
        .all()
    )


def list_detections_since(db: Session, potrero_id: int, since: datetime) -> list[Detection]:
    """Detecciones reales en el potrero dentro de la ventana de reconciliación."""
    return list(
        db.query(Detection)
        .filter(Detection.potrero_id == potrero_id, Detection.detected_at >= since)
        .order_by(Detection.detected_at.desc())
        .all()
    )
