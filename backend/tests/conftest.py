import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import Base, get_db
from app.main import app

_engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
_TestingSessionLocal = sessionmaker(bind=_engine, autoflush=False, autocommit=False)


def _override_get_db():
    db = _TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = _override_get_db


@pytest.fixture(autouse=True)
def _fresh_schema():
    """Recrea el esquema en cada test — aislamiento total, sin depender de orden."""
    Base.metadata.create_all(_engine)
    yield
    Base.metadata.drop_all(_engine)


@pytest.fixture
def db():
    session = _TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def client():
    from fastapi.testclient import TestClient

    return TestClient(app)


@pytest.fixture
def seed_media(db):
    """Crea potrero + livestock + mission + media mínimos y devuelve sus ids."""
    from datetime import datetime, timezone

    from app.models.drone_mission import DroneMission
    from app.models.livestock import Livestock
    from app.models.media import Media
    from app.models.potrero import Potrero

    potrero = Potrero(name="Potrero Norte")
    db.add(potrero)
    db.flush()

    livestock = Livestock(tag_code="VG-001", alias="Lola", species="bovino", potrero_id=potrero.id)
    db.add(livestock)

    mission = DroneMission(
        potrero_id=potrero.id,
        drone_identifier="DRONE-01",
        started_at=datetime.now(timezone.utc),
        status="completada",
    )
    db.add(mission)
    db.flush()

    media = Media(
        mission_id=mission.id, type="imagen", url="file:///test.jpg", captured_at=datetime.now(timezone.utc)
    )
    db.add(media)
    db.commit()

    return {"potrero_id": potrero.id, "livestock_id": livestock.id, "media_id": media.id}
