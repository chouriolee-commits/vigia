from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.media import Media
from app.repositories import alert_repository, detection_repository, livestock_repository
from app.schemas.detection import DetectionIn, DetectionOut


class LivestockNoEncontrado(Exception):
    pass


def ingest_detection(db: Session, media_id: int, payload: DetectionIn) -> DetectionOut | None:
    """
    Persiste una detección que llega desde vision/inference (contrato 005-yolov8-detection).
    Devuelve None si la confianza no supera el umbral mínimo (no se persiste, RF6).
    Lanza LivestockNoEncontrado si viene un livestock_id que no existe (evita un
    IntegrityError crudo de Postgres por violación de FK).
    """
    if payload.confidence < settings.min_detection_confidence:
        return None

    media = db.get(Media, media_id)
    if media is None:
        return None

    if payload.livestock_id is not None and livestock_repository.get(db, payload.livestock_id) is None:
        raise LivestockNoEncontrado()

    detection = detection_repository.create(
        db,
        media_id=media_id,
        livestock_id=payload.livestock_id,
        potrero_id=media.mission.potrero_id,
        bbox_x=payload.bbox.x,
        bbox_y=payload.bbox.y,
        bbox_width=payload.bbox.width,
        bbox_height=payload.bbox.height,
        confidence=payload.confidence,
        behavior=payload.behavior,
        model_version=payload.model_version,
        detected_at=payload.detected_at,
    )

    _crear_alerta_si_aplica(db, detection, payload)

    db.commit()
    db.refresh(detection)

    return DetectionOut(
        id=detection.id,
        media_id=detection.media_id,
        potrero_id=detection.potrero_id,
        livestock_id=detection.livestock_id,
        animal_label=payload.animal_label,
        bbox=payload.bbox,
        confidence=float(detection.confidence),
        behavior=detection.behavior,
        detected_at=detection.detected_at,
        model_version=detection.model_version,
    )


def _crear_alerta_si_aplica(db: Session, detection, payload: DetectionIn) -> None:
    """Comportamiento anómalo o animal no identificado generan alerta (006-alert-system)."""
    if payload.behavior == "anomalo":
        alert_repository.create(
            db,
            detection_id=detection.id,
            livestock_id=detection.livestock_id,
            potrero_id=detection.potrero_id,
            type="comportamiento_anomalo",
            priority="alta",
            status="activa",
            title="Comportamiento anómalo detectado",
            description=f"Detección {detection.id}: confianza {detection.confidence}",
        )
    elif detection.livestock_id is None:
        alert_repository.create(
            db,
            detection_id=detection.id,
            livestock_id=None,
            potrero_id=detection.potrero_id,
            type="animal_desconocido",
            priority="media",
            status="activa",
            title="Animal no identificado en el rebaño",
            description=f"Detección {detection.id}: sin coincidencia con livestock registrado",
        )
