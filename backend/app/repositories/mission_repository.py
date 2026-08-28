from sqlalchemy.orm import Session

from app.models.drone_mission import DroneMission


def create(db: Session, **fields) -> DroneMission:
    mission = DroneMission(**fields)
    db.add(mission)
    db.flush()
    return mission
