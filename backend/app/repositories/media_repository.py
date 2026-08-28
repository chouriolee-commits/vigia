from sqlalchemy.orm import Session

from app.models.media import Media


def create(db: Session, **fields) -> Media:
    media = Media(**fields)
    db.add(media)
    db.flush()
    return media
