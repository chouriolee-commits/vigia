from datetime import datetime

from sqlalchemy.orm import Session

from app.models.alert import Alert


_PRIORITY_ORDER = {"critica": 0, "alta": 1, "media": 2, "baja": 3}


def create(db: Session, **fields) -> Alert:
    alert = Alert(**fields)
    db.add(alert)
    db.flush()
    return alert


def list_by_status(db: Session, statuses: list[str]) -> list[Alert]:
    alerts = db.query(Alert).filter(Alert.status.in_(statuses)).all()
    # Prioridad desc, luego fecha desc (RF3 de 006-alert-system)
    return sorted(
        alerts,
        key=lambda a: (_PRIORITY_ORDER.get(a.priority, 99), -a.created_at.timestamp()),
    )


def list_created_since(db: Session, since: datetime) -> list[Alert]:
    return list(db.query(Alert).filter(Alert.created_at >= since).order_by(Alert.created_at.desc()).all())
