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
    """
    Comportamiento anómalo genera alerta (006-alert-system).

    Nota: NO se genera alerta `animal_desconocido` por cada detección sin
    livestock_id todavía — hoy el sistema no tiene re-identificación individual
    real, así que TODA detección viene sin livestock_id, y alertar por eso
    inundaría la pantalla de alertas con una entrada por cada animal en cada
    frame sin aportar información útil. Se retoma cuando haya re-identificación.
    """
    if payload.behavior == "anomalo":
        titulo = payload.motivo or "Comportamiento anómalo detectado"
        descripcion = payload.motivo or f"Detección {detection.id}: confianza {detection.confidence}"

        # Sin re-identificación real, un mismo escaneo genera muchas detecciones "anomalo"
        # seguidas del MISMO animal (una por cada frame muestreado) — sin esto, cada una
        # crea una alerta nueva y la pantalla de alertas termina con decenas de filas
        # idénticas por el mismo animal. En vez de duplicar, si ya hay una alerta ABIERTA
        # de este tipo para este animal se actualiza esa misma fila con el motivo/detección
        # más reciente (ej. la temperatura de la fiebre cambió entre frames) en vez de
        # crear una nueva. Detecciones sin livestock_id no se deduplican entre sí: cada
        # una podría ser un animal distinto.
        if detection.livestock_id is not None:
            existente = alert_repository.get_open_for_livestock(db, detection.livestock_id, "comportamiento_anomalo")
            if existente is not None:
                existente.title = titulo
                existente.description = descripcion
                existente.detection_id = detection.id
                return

        alert_repository.create(
            db,
            detection_id=detection.id,
            livestock_id=detection.livestock_id,
            potrero_id=detection.potrero_id,
            type="comportamiento_anomalo",
            priority="alta",
            status="activa",
            title=titulo,
            description=descripcion,
        )
