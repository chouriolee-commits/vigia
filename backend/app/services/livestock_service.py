from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.repositories import livestock_repository, potrero_repository
from app.schemas.livestock import AnimalEsperado, AnimalReal, ReconciliacionOut

RECONCILIATION_WINDOW_HOURS = 2


def get_reconciliation(db: Session, potrero_id: int) -> ReconciliacionOut | None:
    potrero = potrero_repository.get(db, potrero_id)
    if potrero is None:
        return None

    since = datetime.now(timezone.utc) - timedelta(hours=RECONCILIATION_WINDOW_HOURS)
    esperados = livestock_repository.list_expected_in_potrero(db, potrero_id)
    detecciones = livestock_repository.list_detections_since(db, potrero_id, since)

    ids_detectados_recientemente = {d.livestock_id for d in detecciones if d.livestock_id is not None}

    animales_reales = [
        AnimalReal(
            livestock_id=d.livestock_id,
            tag_code=d.livestock.tag_code if d.livestock_id and d.livestock else None,
            alias=d.livestock.alias if d.livestock_id and d.livestock else None,
            detected_at=d.detected_at,
            behavior=d.behavior,
            confidence=float(d.confidence),
            es_esperado_aqui=(d.livestock_id in {a.id for a in esperados}) if d.livestock_id else False,
        )
        for d in detecciones
    ]

    animales_esperados = [
        AnimalEsperado(
            livestock_id=a.id,
            tag_code=a.tag_code,
            species=a.species,
            breed=a.breed,
            status=a.status,
            detectado_recientemente=a.id in ids_detectados_recientemente,
        )
        for a in esperados
    ]

    return ReconciliacionOut(
        potrero=potrero.name,
        ventana_horas=RECONCILIATION_WINDOW_HOURS,
        animales_reales=animales_reales,
        animales_esperados=animales_esperados,
    )
