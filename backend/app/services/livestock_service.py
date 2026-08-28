from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.repositories import livestock_repository, potrero_repository
from app.schemas.livestock import AnimalEsperado, AnimalReal, PotreroOut, ReconciliacionOut

RECONCILIATION_WINDOW_HOURS = 2


def get_reconciliation(db: Session, potrero_id: int) -> ReconciliacionOut | None:
    potrero = potrero_repository.get(db, potrero_id)
    if potrero is None:
        return None

    since = datetime.now(timezone.utc) - timedelta(hours=RECONCILIATION_WINDOW_HOURS)
    esperados = livestock_repository.list_expected_in_potrero(db, potrero_id)
    detecciones = livestock_repository.list_detections_since(db, potrero_id, since)

    ids_detectados_recientemente = {d.livestock_id for d in detecciones if d.livestock_id is not None}

    # No repetir el mismo animal por cada detección (un escaneo genera muchas
    # detecciones del mismo animal en distintos frames) — una fila por animal,
    # con su detección más reciente. Las anomalías puntuales de por medio ya se
    # ven en Alertas (006-alert-system), no hace falta repetir la fila aquí para
    # mostrarlas. Detecciones sin identificar (livestock_id None) sí se listan
    # todas: cada una podría ser un animal desconocido distinto.
    vistos: set[int] = set()
    detecciones_unicas = []
    for d in detecciones:  # ya viene ordenado por detected_at desc
        if d.livestock_id is None:
            detecciones_unicas.append(d)
        elif d.livestock_id not in vistos:
            vistos.add(d.livestock_id)
            detecciones_unicas.append(d)

    animales_reales = [
        AnimalReal(
            livestock_id=d.livestock_id,
            livestock_tag=d.livestock.tag_code if d.livestock_id and d.livestock else None,
            alias=d.livestock.alias if d.livestock_id and d.livestock else None,
            detected_at=d.detected_at,
            behavior=d.behavior,
            confidence=float(d.confidence),
            es_esperado_aqui=(d.livestock_id in {a.id for a in esperados}) if d.livestock_id else False,
        )
        for d in detecciones_unicas
    ]

    animales_esperados = [
        AnimalEsperado(
            livestock_id=a.id,
            livestock_tag=a.tag_code,
            species=a.species,
            breed=a.breed,
            status=a.status,
            detectado_recientemente=a.id in ids_detectados_recientemente,
        )
        for a in esperados
    ]

    return ReconciliacionOut(
        potrero=PotreroOut(id=potrero.id, name=potrero.name),
        ventana_horas=RECONCILIATION_WINDOW_HOURS,
        animales_reales=animales_reales,
        animales_esperados=animales_esperados,
    )
