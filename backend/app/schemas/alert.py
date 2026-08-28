from datetime import datetime
from typing import Literal

from pydantic import BaseModel

AlertType = Literal[
    "comportamiento_anomalo", "animal_faltante", "animal_desconocido", "salud", "sistema"
]
AlertPriority = Literal["baja", "media", "alta", "critica"]
AlertStatus = Literal["activa", "en_revision", "resuelta", "descartada"]


class AlertOut(BaseModel):
    id: int
    priority: AlertPriority
    type: AlertType
    status: AlertStatus
    title: str
    description: str | None
    livestock_id: int | None
    livestock_tag: str | None
    potrero_id: int | None
    potrero_name: str | None
    detection_id: int | None
    confidence: float | None
    created_at: datetime
    resolved_at: datetime | None
