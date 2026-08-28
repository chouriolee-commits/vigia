from datetime import datetime

from pydantic import BaseModel


class MissionIn(BaseModel):
    potrero_id: int
    drone_identifier: str = "SIM-01"


class MissionOut(BaseModel):
    id: int
    potrero_id: int
    drone_identifier: str
    status: str
    started_at: datetime
