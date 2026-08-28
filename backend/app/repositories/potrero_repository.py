from sqlalchemy.orm import Session

from app.models.potrero import Potrero


def get(db: Session, potrero_id: int) -> Potrero | None:
    return db.get(Potrero, potrero_id)


def list_all(db: Session) -> list[Potrero]:
    return list(db.query(Potrero).order_by(Potrero.name).all())
