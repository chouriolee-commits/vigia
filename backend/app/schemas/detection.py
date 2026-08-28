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
    # Opcional: motivo específico cuando behavior="anomalo" (ej. "Sospecha de fiebre
    # (40.6°C)"). Si no viene, la alerta usa un título genérico. Pensado para que
    # una fuente que sí simule/mida salud (sensores, o el simulador de demo) pueda
    # dar contexto más rico sin que el backend invente nada por su cuenta.
    motivo: str | None = None


class DetectionOut(DetectionIn):
    id: int
    media_id: int
    potrero_id: int
