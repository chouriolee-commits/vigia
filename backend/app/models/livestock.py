from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Livestock(Base):
    __tablename__ = "livestock"
    __table_args__ = (
        CheckConstraint("status IN ('activo','vendido','fallecido','perdido')", name="ck_livestock_status"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    tag_code: Mapped[str] = mapped_column(String(40), unique=True, nullable=False)
    alias: Mapped[str | None] = mapped_column(String(80), nullable=True)
    species: Mapped[str] = mapped_column(String(40), nullable=False, server_default="bovino")
    breed: Mapped[str | None] = mapped_column(String(80), nullable=True)
    potrero_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("potreros.id"), nullable=True, index=True
    )
    status: Mapped[str] = mapped_column(String(20), nullable=False, server_default="activo")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    potrero = relationship("Potrero")
