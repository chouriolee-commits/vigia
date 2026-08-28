from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.repositories import alert_repository, detection_repository, livestock_repository
from app.schemas.dashboard import (
    AnimalesMonitoreados,
    DashboardAlerta,
    DashboardOut,
    EventoDetectado,
    EventosHoy,
    FeedDeteccion,
)
from app.services import event_service

_ESTADOS_ABIERTOS = ["activa", "en_revision"]


def get_dashboard_summary(db: Session) -> DashboardOut:
    total_animales = livestock_repository.count_active(db)

    alertas_orm = alert_repository.list_by_status(db, _ESTADOS_ABIERTOS)
    alertas_activas = [
        DashboardAlerta(
            id=a.id,
            livestock_tag=a.livestock.tag_code if a.livestock_id and a.livestock else None,
            type=a.type,
            priority=a.priority,
            status=a.status,
            description=a.description,
            confidence=float(a.detection.confidence) if a.detection_id and a.detection else None,
            created_at=a.created_at,
        )
        for a in alertas_orm
    ]

    # "El de mayor prioridad/más reciente de alertas_activas" (design.md 002) — ya viene
    # ordenada así desde alert_repository.list_by_status.
    evento_detectado = None
    if alertas_orm:
        top = alertas_orm[0]
        evento_detectado = EventoDetectado(
            livestock_id=top.livestock_id,
            livestock_tag=top.livestock.tag_code if top.livestock_id and top.livestock else None,
            titulo="Atención requerida",
            descripcion=top.description,
            confidence=float(top.detection.confidence) if top.detection_id and top.detection else None,
            alert_id=top.id,
        )

    eventos_hoy_total = len(event_service.get_events_today(db))

    feed = [
        FeedDeteccion(
            livestock_id=d.livestock_id,
            livestock_tag=d.livestock.tag_code if d.livestock_id and d.livestock else None,
            bbox={
                "x": float(d.bbox_x),
                "y": float(d.bbox_y),
                "width": float(d.bbox_width),
                "height": float(d.bbox_height),
            },
            behavior=d.behavior or "desconocido",
        )
        for d in detection_repository.list_recent(db)
    ]

    return DashboardOut(
        animales_monitoreados=AnimalesMonitoreados(
            total=total_animales, actualizado_at=datetime.now(timezone.utc)
        ),
        alertas_activas=alertas_activas,
        eventos_hoy=EventosHoy(total=eventos_hoy_total),
        evento_detectado=evento_detectado,
        feed_detecciones=feed,
    )
