from datetime import datetime
from typing import Literal

from pydantic import BaseModel

EventoType = Literal["alerta", "deteccion"]


class EventoOut(BaseModel):
    id: str
    type: EventoType
    title: str
    description: str | None
    occurred_at: datetime
    related_livestock_tag: str | None
    related_potrero_name: str | None
    related_alert_id: int | None
