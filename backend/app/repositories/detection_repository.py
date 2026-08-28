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


def count_in_latest_media(db: Session) -> tuple[int, datetime | None]:
    """
    Cuántos animales detectó YOLOv8 de verdad en el último frame procesado — el
    equivalente real a `len(detecciones_finales)` del prototipo original
    (simulador_video.py/app.py): un conteo por frame, no un tope artificial contra
    el inventario registrado (un frame puede tener más animales visibles que los
    que ya están dados de alta en `livestock`).
    """
    ultima = db.query(Detection).order_by(Detection.detected_at.desc()).first()
    if ultima is None:
        return 0, None

    total = db.query(Detection).filter(Detection.media_id == ultima.media_id).count()
    return total, ultima.detected_at


def list_anomalous_since(db: Session, since: datetime) -> list[Detection]:
    return list(
        db.query(Detection)
        .filter(Detection.behavior == "anomalo", Detection.detected_at >= since)
        .order_by(Detection.detected_at.desc())
        .all()
    )
