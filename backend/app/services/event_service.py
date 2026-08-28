from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.repositories import alert_repository, detection_repository
from app.schemas.evento import EventoOut


def get_events_today(db: Session) -> list[EventoOut]:
    """
    'Eventos' no es una tabla propia (decisión de 008-postgresql-data-model): es la unión
    de alertas + detecciones anómalas del día, ordenada por fecha descendente.
    """
    hoy = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)

    alertas = alert_repository.list_created_since(db, hoy)
    detecciones = detection_repository.list_anomalous_since(db, hoy)

    eventos = [
        EventoOut(
            id=f"alerta-{a.id}",
            type="alerta",
            title=a.title,
            description=a.description,
            occurred_at=a.created_at,
            related_livestock_tag=a.livestock.tag_code if a.livestock_id and a.livestock else None,
            related_potrero_name=a.potrero.name if a.potrero_id and a.potrero else None,
            related_alert_id=a.id,
        )
        for a in alertas
    ] + [
        EventoOut(
            id=f"deteccion-{d.id}",
            type="deteccion",
            title="Comportamiento anómalo detectado",
            description=f"Confianza {d.confidence}",
            occurred_at=d.detected_at,
            related_livestock_tag=d.livestock.tag_code if d.livestock_id and d.livestock else None,
            related_potrero_name=d.potrero.name if d.potrero else None,
            related_alert_id=None,
        )
        for d in detecciones
    ]

    return sorted(eventos, key=lambda e: e.occurred_at, reverse=True)
