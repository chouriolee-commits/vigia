from sqlalchemy.orm import Session

from app.repositories import alert_repository
from app.schemas.alert import AlertOut

_ESTADOS_ABIERTOS = ["activa", "en_revision"]


def list_active_alerts(db: Session) -> list[AlertOut]:
    alerts = alert_repository.list_by_status(db, _ESTADOS_ABIERTOS)
    return [
        AlertOut(
            id=a.id,
            priority=a.priority,
            type=a.type,
            status=a.status,
            title=a.title,
            description=a.description,
            livestock_id=a.livestock_id,
            livestock_tag=a.livestock.tag_code if a.livestock_id and a.livestock else None,
            potrero_id=a.potrero_id,
            potrero_name=a.potrero.name if a.potrero_id and a.potrero else None,
            detection_id=a.detection_id,
            confidence=float(a.detection.confidence) if a.detection_id and a.detection else None,
            created_at=a.created_at,
            resolved_at=a.resolved_at,
        )
        for a in alerts
    ]
