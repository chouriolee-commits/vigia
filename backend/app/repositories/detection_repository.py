from datetime import datetime

from sqlalchemy.orm import Session

from app.models.detection import Detection


def create(db: Session, **fields) -> Detection:
    detection = Detection(**fields)
    db.add(detection)
    db.flush()  # asigna id sin cerrar la transacción (el service decide el commit)
    return detection


def list_recent(db: Session, limit: int = 20) -> list[Detection]:
    """Últimas detecciones, para el feed en vivo del dashboard (002)."""
    return list(db.query(Detection).order_by(Detection.detected_at.desc()).limit(limit).all())


def list_anomalous_since(db: Session, since: datetime) -> list[Detection]:
    return list(
        db.query(Detection)
        .filter(Detection.behavior == "anomalo", Detection.detected_at >= since)
        .order_by(Detection.detected_at.desc())
        .all()
    )
