def test_listar_potreros_vacio(client):
    assert client.get("/api/potreros").json() == []


def test_listar_potreros_incluye_los_creados(client, seed_media):
    body = client.get("/api/potreros").json()
    assert body == [{"id": seed_media["potrero_id"], "name": "Potrero Norte"}]


def test_reconciliacion_potrero_inexistente_404(client):
    response = client.get("/api/potreros/9999/reconciliacion")
    assert response.status_code == 404


def test_reconciliacion_lista_animal_esperado_no_detectado(client, seed_media):
    response = client.get(f"/api/potreros/{seed_media['potrero_id']}/reconciliacion")
    assert response.status_code == 200
    body = response.json()
    assert body["potrero"]["name"] == "Potrero Norte"
    assert len(body["animales_esperados"]) == 1
    assert body["animales_esperados"][0]["livestock_tag"] == "VG-001"
    assert body["animales_esperados"][0]["detectado_recientemente"] is False
    assert body["animales_reales"] == []


def test_reconciliacion_no_repite_el_mismo_animal(client, db, seed_media):
    """Un escaneo genera muchas detecciones del mismo animal (varios frames) --
    animales_reales debe listarlo una sola vez, no una fila por detección."""
    from datetime import datetime, timezone

    from app.repositories import detection_repository

    for _ in range(5):
        detection_repository.create(
            db,
            media_id=seed_media["media_id"],
            livestock_id=seed_media["livestock_id"],
            potrero_id=seed_media["potrero_id"],
            bbox_x=0.1, bbox_y=0.1, bbox_width=0.1, bbox_height=0.1,
            confidence=0.9, behavior="pastoreo", model_version="test",
            detected_at=datetime.now(timezone.utc),
        )
    # Un animal sin identificar no se deduplica -- cada uno podría ser distinto.
    detection_repository.create(
        db,
        media_id=seed_media["media_id"], livestock_id=None, potrero_id=seed_media["potrero_id"],
        bbox_x=0.1, bbox_y=0.1, bbox_width=0.1, bbox_height=0.1,
        confidence=0.9, behavior="pastoreo", model_version="test",
        detected_at=datetime.now(timezone.utc),
    )
    detection_repository.create(
        db,
        media_id=seed_media["media_id"], livestock_id=None, potrero_id=seed_media["potrero_id"],
        bbox_x=0.1, bbox_y=0.1, bbox_width=0.1, bbox_height=0.1,
        confidence=0.9, behavior="pastoreo", model_version="test",
        detected_at=datetime.now(timezone.utc),
    )
    db.commit()

    body = client.get(f"/api/potreros/{seed_media['potrero_id']}/reconciliacion").json()
    identificados = [a for a in body["animales_reales"] if a["livestock_id"] is not None]
    sin_identificar = [a for a in body["animales_reales"] if a["livestock_id"] is None]
    assert len(identificados) == 1
    assert len(sin_identificar) == 2
