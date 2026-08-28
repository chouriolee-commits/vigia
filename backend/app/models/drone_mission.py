from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class DroneMission(Base):
    __tablename__ = "drone_missions"
    __table_args__ = (
        CheckConstraint(
            "status IN ('en_progreso','completada','fallida')", name="ck_drone_missions_status"
        ),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    potrero_id: Mapped[int] = mapped_column(Integer, ForeignKey("potreros.id"), nullable=False, index=True)
    drone_identifier: Mapped[str] = mapped_column(String(60), nullable=False)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    ended_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False, server_default="en_progreso")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    potrero = relationship("Potrero")
