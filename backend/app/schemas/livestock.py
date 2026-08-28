from datetime import datetime

from pydantic import BaseModel


class AnimalReal(BaseModel):
    livestock_id: int | None
    tag_code: str | None
    alias: str | None
    detected_at: datetime
    behavior: str | None
    confidence: float
    es_esperado_aqui: bool


class AnimalEsperado(BaseModel):
    livestock_id: int
    tag_code: str
    species: str
    breed: str | None
    status: str
    detectado_recientemente: bool


class ReconciliacionOut(BaseModel):
    potrero: str
    ventana_horas: int
    animales_reales: list[AnimalReal]
    animales_esperados: list[AnimalEsperado]
