from datetime import datetime, timezone

from app.repositories import alert_repository, detection_repository


def test_dashboard_vacio_sin_datos(client):
    response = client.get("/api/dashboard")
    assert response.status_code == 200
    body = response.json()
    assert body["animales_monitoreados"]["total"] == 0
    assert body["alertas_activas"] == []
    assert body["eventos_hoy"]["total"] == 0
    assert body["evento_detectado"] is None
    assert body["feed_detecciones"] == []


def test_dashboard_cuenta_animales_distintos_con_deteccion_real(client, db, seed_media):
    """animales_monitoreados debe reflejar detecciones reales, no el inventario total
    del sistema (regresión: antes mostraba siempre el mismo número sin importar qué
    video/potrero se estuviera monitoreando)."""
    detection_repository.create(
        db,
        media_id=seed_media["media_id"],
        livestock_id=seed_media["livestock_id"],
        potrero_id=seed_media["potrero_id"],
        bbox_x=0.1, bbox_y=0.1, bbox_width=0.1, bbox_height=0.1,
        confidence=0.9, behavior="pastoreo", model_version="test",
        detected_at=datetime.now(timezone.utc),
    )
    db.commit()

    body = client.get("/api/dashboard").json()
    assert body["animales_monitoreados"]["total"] == 1


def test_dashboard_agrega_alerta_top(client, db, seed_media):
    alert_repository.create(
        db, type="salud", priority="critica", status="activa", title="Urgente",
        potrero_id=seed_media["potrero_id"], livestock_id=seed_media["livestock_id"],
    )
    db.commit()

    body = client.get("/api/dashboard").json()
    assert len(body["alertas_activas"]) == 1
    assert body["evento_detectado"]["titulo"] == "Atención requerida"
    assert body["evento_detectado"]["livestock_tag"] == "VG-001"
