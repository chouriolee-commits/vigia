from datetime import datetime

from pydantic import BaseModel


class PotreroOut(BaseModel):
    id: int
    name: str


class AnimalReal(BaseModel):
    # livestock_tag (no tag_code): nombre de campo fijado en 005-yolov8-detection
    # ("Nota de consistencia") — tag_code sigue siendo el nombre real de la columna en
    # PostgreSQL, pero el contrato de API/mock usa livestock_tag en todas las specs.
    livestock_id: int | None
    livestock_tag: str | None
    alias: str | None
    detected_at: datetime
    behavior: str | None
    confidence: float
    es_esperado_aqui: bool


class AnimalEsperado(BaseModel):
    livestock_id: int
    livestock_tag: str
    species: str
    breed: str | None
    status: str
    detectado_recientemente: bool


class ReconciliacionOut(BaseModel):
    potrero: PotreroOut
    ventana_horas: int
    animales_reales: list[AnimalReal]
    animales_esperados: list[AnimalEsperado]
