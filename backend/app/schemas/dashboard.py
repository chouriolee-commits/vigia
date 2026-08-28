from datetime import datetime

from pydantic import BaseModel

from app.schemas.alert import AlertPriority, AlertStatus, AlertType
from app.schemas.detection import BBox, Behavior


class AnimalesMonitoreados(BaseModel):
    total: int
    actualizado_at: datetime


class DashboardAlerta(BaseModel):
    id: int
    livestock_tag: str | None
    type: AlertType
    priority: AlertPriority
    status: AlertStatus
    description: str | None
    confidence: float | None
    created_at: datetime


class EventosHoy(BaseModel):
    total: int


class EventoDetectado(BaseModel):
    # livestock_id/livestock_tag: nombres fijados en 005-yolov8-detection ("Nota de
    # consistencia") y usados igual en 002/003/006/012 — no reintroducir animal_id/animal_tag.
    livestock_id: int | None
    livestock_tag: str | None
    titulo: str
    descripcion: str | None
    confidence: float | None
    alert_id: int


class FeedDeteccion(BaseModel):
    livestock_id: int | None
    livestock_tag: str | None
    bbox: BBox
    behavior: Behavior


class DashboardOut(BaseModel):
    animales_monitoreados: AnimalesMonitoreados
    alertas_activas: list[DashboardAlerta]
    eventos_hoy: EventosHoy
    evento_detectado: EventoDetectado | None
    feed_detecciones: list[FeedDeteccion]
