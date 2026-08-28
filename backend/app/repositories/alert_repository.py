from datetime import datetime

from sqlalchemy.orm import Session

from app.models.alert import Alert


_PRIORITY_ORDER = {"critica": 0, "alta": 1, "media": 2, "baja": 3}


def create(db: Session, **fields) -> Alert:
    alert = Alert(**fields)
    db.add(alert)
    db.flush()
    return alert


def get_open_for_livestock(db: Session, livestock_id: int, type: str) -> Alert | None:
    """¿Ya hay una alerta ABIERTA (activa/en_revision) de este tipo para este animal?
    Se usa para no duplicar alertas del mismo tipo por el mismo animal (ver
    detection_service._crear_alerta_si_aplica)."""
    return (
        db.query(Alert)
        .filter(
            Alert.livestock_id == livestock_id,
            Alert.type == type,
            Alert.status.in_(["activa", "en_revision"]),
        )
        .first()
    )


def list_by_status(db: Session, statuses: list[str]) -> list[Alert]:
    alerts = db.query(Alert).filter(Alert.status.in_(statuses)).all()
    # Prioridad desc, luego fecha desc (RF3 de 006-alert-system)
    return sorted(
        alerts,
        key=lambda a: (_PRIORITY_ORDER.get(a.priority, 99), -a.created_at.timestamp()),
    )


def list_created_since(db: Session, since: datetime) -> list[Alert]:
    return list(db.query(Alert).filter(Alert.created_at >= since).order_by(Alert.created_at.desc()).all())
