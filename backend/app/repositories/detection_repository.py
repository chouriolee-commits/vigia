from datetime import datetime

from sqlalchemy.orm import Session

from app.models.detection import Detection
from app.models.media import Media


def create(db: Session, **fields) -> Detection:
    detection = Detection(**fields)
    db.add(detection)
    db.flush()  # asigna id sin cerrar la transacción (el service decide el commit)
    return detection


def list_recent_by_mission(db: Session, mission_id: int, limit: int = 20) -> list[Detection]:
    """Últimas detecciones de UNA misión — evita mezclar cajas de la sesión anterior
    con la actual mientras la misión nueva todavía no acumula suficientes."""
    return list(
        db.query(Detection)
        .join(Media, Media.id == Detection.media_id)
        .filter(Media.mission_id == mission_id)
        .order_by(Detection.detected_at.desc())
        .limit(limit)
        .all()
    )


def count_all(db: Session) -> int:
    """Total acumulado histórico de todas las detecciones reales (todas las misiones)."""
    return db.query(Detection).count()


def count_by_mission(db: Session, mission_id: int) -> int:
    """
    Total de detecciones reales de UNA misión (sesión de escaneo) puntual. Cada
    detección ya pasó el umbral de confianza — RF6 de 005-yolov8-detection. Al
    empezar una misión nueva (otro video/potrero) esto arranca en 0 de nuevo; nada
    de lo anterior se borra, sigue disponible por potrero via la reconciliación.
    """
    return (
        db.query(Detection)
        .join(Media, Media.id == Detection.media_id)
        .filter(Media.mission_id == mission_id)
        .count()
    )


def list_anomalous_since(db: Session, since: datetime) -> list[Detection]:
    return list(
        db.query(Detection)
        .filter(Detection.behavior == "anomalo", Detection.detected_at >= since)
        .order_by(Detection.detected_at.desc())
        .all()
    )
