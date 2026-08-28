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


def get_latest_by_potrero(db: Session, potrero_id: int) -> DroneMission | None:
    """La misión más reciente de UN potrero en particular — para saber cuánto se
    escaneó ahí la última vez, sin importar qué potrero esté activo ahora mismo."""
    return (
        db.query(DroneMission)
        .filter(DroneMission.potrero_id == potrero_id)
        .order_by(DroneMission.started_at.desc())
        .first()
    )
