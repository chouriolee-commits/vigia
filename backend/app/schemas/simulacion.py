from pydantic import BaseModel


class IniciarSimulacionIn(BaseModel):
    potrero_id: int
    video: str  # nombre del archivo en frontend/public/video, ej. "corral-vertical.mp4"


class SimulacionOut(BaseModel):
    corriendo: bool
    potrero_id: int | None
    video: str | None
