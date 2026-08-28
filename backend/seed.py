"""
Seed de demo — replica exactamente frontend/src/services/mocks/seed.js para que la
demo cuente la misma historia con datos mock o con el backend real (mismo potrero,
mismos animales, mismas detecciones/alertas). Ver 008-postgresql-data-model.

Uso: python seed.py   (con el venv activado y DATABASE_URL apuntando a la BD deseada)
"""

from datetime import datetime, timedelta, timezone

from app.core.database import Base, SessionLocal, engine
from app.core.security import hash_password
from app.models import Alert, Detection, DroneMission, Livestock, Media, Potrero, User


def minutes_ago(n):
    return datetime.now(timezone.utc) - timedelta(minutes=n)


def run():
    Base.metadata.create_all(bind=engine)  # no-op si alembic ya corrió; red de seguridad
    db = SessionLocal()
    try:
        if db.query(Potrero).count() > 0:
            print("Ya hay datos — seed omitido (borra las tablas si quieres re-sembrar).")
            return

        potrero = Potrero(name="Potrero Norte", capacity_estimate=10)
        db.add(potrero)
        db.flush()

        demo_user = User(
            name="Demo", email="demo@vigia.co", password_hash=hash_password("vigia2026"), role="operador"
        )
        db.add(demo_user)

        livestock_data = [
            ("#024", "Holstein"),
            ("#030", "Angus"),
            ("#055", "Jersey"),
            ("#101", "Holstein"),
            ("#012", "Angus"),
            ("#045", "Jersey"),
            ("#067", "Holstein"),
            ("#078", "Angus"),
            ("#089", "Jersey"),
            ("#099", "Holstein"),
        ]
        livestock_by_tag = {}
        for tag, breed in livestock_data:
            l = Livestock(tag_code=tag, species="bovino", breed=breed, potrero_id=potrero.id, status="activo")
            db.add(l)
            db.flush()
            livestock_by_tag[tag] = l

        mission = DroneMission(
            potrero_id=potrero.id,
            drone_identifier="DJI-01",
            started_at=minutes_ago(20),
            ended_at=minutes_ago(2),
            status="completada",
        )
        db.add(mission)
        db.flush()

        media = Media(mission_id=mission.id, type="imagen", url="/seed/frame-1.jpg", captured_at=minutes_ago(2))
        db.add(media)
        db.flush()

        # (tag, bbox, confidence, behavior, minutos_atras) — #030 y #078 quedan SIN detección (faltantes)
        detections_data = [
            ("#024", (0.42, 0.30, 0.08, 0.10), 0.94, "anomalo", 2),
            ("#055", (0.20, 0.55, 0.09, 0.11), 0.88, "descanso", 5),
            ("#101", (0.58, 0.62, 0.07, 0.09), 0.91, "pastoreo", 6),
            ("#012", (0.72, 0.28, 0.08, 0.10), 0.85, "pastoreo", 8),
            ("#045", (0.10, 0.20, 0.07, 0.09), 0.79, "pastoreo", 9),
            ("#067", (0.85, 0.50, 0.07, 0.09), 0.90, "descanso", 11),
            ("#089", (0.33, 0.72, 0.08, 0.10), 0.82, "pastoreo", 12),
            ("#099", (0.63, 0.15, 0.07, 0.09), 0.87, "pastoreo", 14),
        ]
        detections_by_tag = {}
        for tag, bbox, confidence, behavior, mins in detections_data:
            d = Detection(
                media_id=media.id,
                livestock_id=livestock_by_tag[tag].id,
                potrero_id=potrero.id,
                bbox_x=bbox[0], bbox_y=bbox[1], bbox_width=bbox[2], bbox_height=bbox[3],
                confidence=confidence,
                behavior=behavior,
                model_version="yolov8n-coco-pretrained",
                detected_at=minutes_ago(mins),
            )
            db.add(d)
            db.flush()
            detections_by_tag[tag] = d

        # detección sin match (animal no identificado)
        unknown = Detection(
            media_id=media.id,
            livestock_id=None,
            potrero_id=potrero.id,
            bbox_x=0.48, bbox_y=0.80, bbox_width=0.06, bbox_height=0.08,
            confidence=0.68,
            behavior="desconocido",
            model_version="yolov8n-coco-pretrained",
            detected_at=minutes_ago(15),
        )
        db.add(unknown)
        db.flush()

        db.add(Alert(
            detection_id=detections_by_tag["#024"].id,
            livestock_id=livestock_by_tag["#024"].id,
            potrero_id=potrero.id,
            type="comportamiento_anomalo",
            priority="alta",
            status="activa",
            title="Comportamiento inusual detectado",
            description="Patrón de movimiento errático y aislamiento del rebaño.",
        ))
        db.add(Alert(
            detection_id=None,
            livestock_id=livestock_by_tag["#030"].id,
            potrero_id=potrero.id,
            type="animal_faltante",
            priority="media",
            status="activa",
            title="Animal sin detección reciente",
            description="#030 no registra detecciones en Potrero Norte durante la última ventana de monitoreo (2 h).",
        ))
        db.add(Alert(
            detection_id=unknown.id,
            livestock_id=None,
            potrero_id=potrero.id,
            type="animal_desconocido",
            priority="baja",
            status="en_revision",
            title="Detección sin identificar",
            description="Se detectó un animal en Potrero Norte que no coincide con el listado registrado.",
        ))

        db.commit()
        print(f"Seed OK — potrero={potrero.id}, {len(livestock_by_tag)} animales, "
              f"{len(detections_by_tag) + 1} detecciones, 3 alertas, usuario demo@vigia.co/vigia2026")
    finally:
        db.close()


if __name__ == "__main__":
    run()
