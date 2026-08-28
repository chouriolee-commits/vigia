from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Media(Base):
    __tablename__ = "media"
    __table_args__ = (CheckConstraint("type IN ('imagen','video')", name="ck_media_type"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    mission_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("drone_missions.id"), nullable=False, index=True
    )
    type: Mapped[str] = mapped_column(String(10), nullable=False)
    url: Mapped[str] = mapped_column(String(500), nullable=False)
    captured_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    mission = relationship("DroneMission")
