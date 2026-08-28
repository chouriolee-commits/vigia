from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Alert(Base):
    __tablename__ = "alerts"
    __table_args__ = (
        CheckConstraint(
            "type IN ('comportamiento_anomalo','animal_faltante','animal_desconocido','salud','sistema')",
            name="ck_alerts_type",
        ),
        CheckConstraint("priority IN ('baja','media','alta','critica')", name="ck_alerts_priority"),
        CheckConstraint(
            "status IN ('activa','en_revision','resuelta','descartada')", name="ck_alerts_status"
        ),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    detection_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("detections.id"), nullable=True
    )
    livestock_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("livestock.id"), nullable=True)
    potrero_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("potreros.id"), nullable=True, index=True)

    type: Mapped[str] = mapped_column(String(30), nullable=False)
    priority: Mapped[str] = mapped_column(String(10), nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False, server_default="activa")
    title: Mapped[str] = mapped_column(String(160), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), index=True
    )
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    livestock = relationship("Livestock")
    potrero = relationship("Potrero")
    detection = relationship("Detection")
