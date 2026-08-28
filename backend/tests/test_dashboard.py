from datetime import datetime, timedelta, timezone

from app.repositories import alert_repository, detection_repository


def _crear_deteccion(db, seed_media, *, livestock_id=None, detected_at=None, media_id=None):
    detection_repository.create(
        db,
        media_id=media_id or seed_media["media_id"],
        livestock_id=livestock_id,
        potrero_id=seed_media["potrero_id"],
        bbox_x=0.1, bbox_y=0.1, bbox_width=0.1, bbox_height=0.1,
        confidence=0.9, behavior="pastoreo", model_version="test",
        detected_at=detected_at or datetime.now(timezone.utc),
    )


def test_dashboard_vacio_sin_datos(client):
    response = client.get("/api/dashboard")
    assert response.status_code == 200
    body = response.json()
    assert body["animales_monitoreados"]["total"] == 0
    assert body["alertas_activas"] == []
    assert body["eventos_hoy"]["total"] == 0
    assert body["evento_detectado"] is None
    assert body["feed_detecciones"] == []


def test_dashboard_suma_detecciones_de_la_mision_activa(client, db, seed_media):
    """animales_monitoreados suma las detecciones reales de la misión (sesión de
    escaneo) más reciente, no una foto de un solo frame ni un tope contra el
    inventario registrado — sigue sumando aunque vengan de frames/animales distintos,
    mientras sea la misma misión."""
    _crear_deteccion(db, seed_media, livestock_id=seed_media["livestock_id"])
    _crear_deteccion(db, seed_media, livestock_id=None)  # animal sin identificar, cuenta igual
    _crear_deteccion(db, seed_media, livestock_id=None)
    db.commit()

    body = client.get("/api/dashboard").json()
    assert body["animales_monitoreados"]["total"] == 3


def test_dashboard_suma_detecciones_de_distintos_frames_misma_mision(client, db, seed_media):
    """Detecciones de frames/momentos distintos se suman todas, no solo el último
    frame — siempre que sigan siendo parte de la misma misión."""
    hace_rato = datetime.now(timezone.utc) - timedelta(minutes=30)
    for _ in range(5):
        _crear_deteccion(db, seed_media, media_id=seed_media["media_id"], detected_at=hace_rato)

    from app.models.media import Media
    media_reciente = Media(
        mission_id=seed_media["media_id"] and db.get(Media, seed_media["media_id"]).mission_id,
        type="imagen", url="file:///reciente.jpg", captured_at=datetime.now(timezone.utc),
    )
    db.add(media_reciente)
    db.flush()
    _crear_deteccion(db, seed_media, media_id=media_reciente.id)
    _crear_deteccion(db, seed_media, media_id=media_reciente.id)
    db.commit()

    body = client.get("/api/dashboard").json()
    assert body["animales_monitoreados"]["total"] == 7


def test_dashboard_resetea_a_cero_al_iniciar_mision_nueva(client, db, seed_media):
    """Regresión: cambiar de video/potrero (= arrancar una misión nueva) debe volver
    el conteo a 0, sin borrar lo detectado en la misión anterior (sigue disponible
    por potrero vía /api/potreros/{id}/reconciliacion)."""
    from app.models.drone_mission import DroneMission
    from app.models.media import Media

    _crear_deteccion(db, seed_media, livestock_id=seed_media["livestock_id"])
    _crear_deteccion(db, seed_media, livestock_id=None)
    db.commit()
    assert client.get("/api/dashboard").json()["animales_monitoreados"]["total"] == 2

    mision_nueva = DroneMission(
        potrero_id=seed_media["potrero_id"], drone_identifier="DRONE-02",
        started_at=datetime.now(timezone.utc), status="en_progreso",
    )
    db.add(mision_nueva)
    db.flush()
    media_nueva = Media(
        mission_id=mision_nueva.id, type="imagen", url="file:///nueva.jpg",
        captured_at=datetime.now(timezone.utc),
    )
    db.add(media_nueva)
    db.commit()

    body = client.get("/api/dashboard").json()
    assert body["animales_monitoreados"]["total"] == 0
    assert body["feed_detecciones"] == []


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
