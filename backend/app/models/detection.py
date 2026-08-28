from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Integer, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Detection(Base):
    __tablename__ = "detections"
    __table_args__ = (
        CheckConstraint("confidence >= 0 AND confidence <= 1", name="ck_detections_confidence"),
        CheckConstraint(
            "behavior IN ('pastoreo','descanso','anomalo','desconocido')", name="ck_detections_behavior"
        ),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    media_id: Mapped[int] = mapped_column(Integer, ForeignKey("media.id"), nullable=False, index=True)
    livestock_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("livestock.id"), nullable=True, index=True
    )
    # Denormalizado desde la misión (evita joins media->mission->potrero en cada query)
    potrero_id: Mapped[int] = mapped_column(Integer, ForeignKey("potreros.id"), nullable=False, index=True)

    # bbox normalizado 0-1, convención fijada en 005-yolov8-detection
    bbox_x: Mapped[float] = mapped_column(Numeric, nullable=False)
    bbox_y: Mapped[float] = mapped_column(Numeric, nullable=False)
    bbox_width: Mapped[float] = mapped_column(Numeric, nullable=False)
    bbox_height: Mapped[float] = mapped_column(Numeric, nullable=False)

    confidence: Mapped[float] = mapped_column(Numeric(4, 3), nullable=False)
    behavior: Mapped[str | None] = mapped_column(String(20), nullable=True)
    model_version: Mapped[str] = mapped_column(String(40), nullable=False)
    detected_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)

    livestock = relationship("Livestock")
    potrero = relationship("Potrero")
    media = relationship("Media")
