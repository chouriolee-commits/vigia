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
    animal_id: int | None
    animal_tag: str | None
    titulo: str
    descripcion: str | None
    confidence: float | None
    alert_id: int


class FeedDeteccion(BaseModel):
    animal_id: int | None
    bbox: BBox
    behavior: Behavior


class DashboardOut(BaseModel):
    animales_monitoreados: AnimalesMonitoreados
    alertas_activas: list[DashboardAlerta]
    eventos_hoy: EventosHoy
    evento_detectado: EventoDetectado | None
    feed_detecciones: list[FeedDeteccion]
