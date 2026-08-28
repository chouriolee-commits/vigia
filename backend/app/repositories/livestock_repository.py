from datetime import datetime

from sqlalchemy.orm import Session

from app.models.detection import Detection
from app.models.livestock import Livestock


def get(db: Session, livestock_id: int) -> Livestock | None:
    return db.get(Livestock, livestock_id)


def count_active(db: Session) -> int:
    """Total de animales activos en el inventario (independiente de si se han detectado)."""
    return db.query(Livestock).filter(Livestock.status == "activo").count()


def count_distinct_identified_since(db: Session, since: datetime) -> int:
    """
    Animales distintos con al menos una detección identificada desde `since` — lo que
    la tarjeta 'Animales Monitoreados' del dashboard debe mostrar: cuántos animales
    REALES está viendo el feed ahora mismo, no el inventario total registrado (ese
    número no cambiaría nunca sin importar qué video/potrero se esté monitoreando).
    """
    return (
        db.query(Detection.livestock_id)
        .filter(Detection.livestock_id.isnot(None), Detection.detected_at >= since)
        .distinct()
        .count()
    )


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
