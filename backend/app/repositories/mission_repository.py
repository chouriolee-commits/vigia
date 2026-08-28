from sqlalchemy.orm import Session

from app.models.drone_mission import DroneMission


def create(db: Session, **fields) -> DroneMission:
    mission = DroneMission(**fields)
    db.add(mission)
    db.flush()
    return mission


def get_latest(db: Session) -> DroneMission | None:
    """La misión más reciente — define la 'sesión activa' actual del dashboard."""
    return db.query(DroneMission).order_by(DroneMission.started_at.desc()).first()
