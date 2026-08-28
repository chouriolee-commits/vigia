from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field

Behavior = Literal["pastoreo", "descanso", "anomalo", "desconocido"]


class BBox(BaseModel):
    """Normalizado 0-1 respecto al frame, convención fijada en 005-yolov8-detection."""

    x: float = Field(ge=0, le=1)
    y: float = Field(ge=0, le=1)
    width: float = Field(ge=0, le=1)
    height: float = Field(ge=0, le=1)


class DetectionIn(BaseModel):
    """Contrato que entrega vision/inference al backend (POST /api/media/{id}/detecciones)."""

    livestock_id: int | None = None
    animal_label: str = "cow"
    bbox: BBox
    confidence: float = Field(ge=0, le=1)
    behavior: Behavior = "desconocido"
    detected_at: datetime
    model_version: str


class DetectionOut(DetectionIn):
    id: int
    media_id: int
    potrero_id: int
