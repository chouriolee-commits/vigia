from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models.drone_mission import DroneMission
from app.repositories import media_repository, mission_repository, potrero_repository
from app.schemas.media import MediaIn, MediaOut
from app.schemas.mission import MissionIn, MissionOut


class PotreroNoEncontrado(Exception):
    pass


class MisionNoEncontrada(Exception):
    pass


def create_mission(db: Session, payload: MissionIn) -> MissionOut:
    if potrero_repository.get(db, payload.potrero_id) is None:
        raise PotreroNoEncontrado()

    mission = mission_repository.create(
        db,
        potrero_id=payload.potrero_id,
        drone_identifier=payload.drone_identifier,
        started_at=datetime.now(timezone.utc),
        status="en_progreso",
    )
    db.commit()
    db.refresh(mission)
    return MissionOut(
        id=mission.id,
        potrero_id=mission.potrero_id,
        drone_identifier=mission.drone_identifier,
        status=mission.status,
        started_at=mission.started_at,
    )


def create_media(db: Session, payload: MediaIn) -> MediaOut:
    if db.get(DroneMission, payload.mission_id) is None:
        raise MisionNoEncontrada()

    media = media_repository.create(
        db,
        mission_id=payload.mission_id,
        type=payload.type,
        url=payload.url,
        captured_at=payload.captured_at,
    )
    db.commit()
    db.refresh(media)
    return MediaOut(
        id=media.id, mission_id=media.mission_id, type=media.type, url=media.url,
        captured_at=media.captured_at,
    )
