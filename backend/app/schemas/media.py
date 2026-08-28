from datetime import datetime
from typing import Literal

from pydantic import BaseModel


class MediaIn(BaseModel):
    mission_id: int
    type: Literal["imagen", "video"] = "imagen"
    url: str
    captured_at: datetime


class MediaOut(BaseModel):
    id: int
    mission_id: int
    type: str
    url: str
    captured_at: datetime
