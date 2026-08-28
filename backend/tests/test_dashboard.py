from app.repositories import alert_repository


def test_dashboard_vacio_sin_datos(client):
    response = client.get("/api/dashboard")
    assert response.status_code == 200
    body = response.json()
    assert body["animales_monitoreados"]["total"] == 0
    assert body["alertas_activas"] == []
    assert body["eventos_hoy"]["total"] == 0
    assert body["evento_detectado"] is None
    assert body["feed_detecciones"] == []


def test_dashboard_agrega_animales_y_alerta_top(client, db, seed_media):
    alert_repository.create(
        db, type="salud", priority="critica", status="activa", title="Urgente",
        potrero_id=seed_media["potrero_id"], livestock_id=seed_media["livestock_id"],
    )
    db.commit()

    body = client.get("/api/dashboard").json()
    assert body["animales_monitoreados"]["total"] == 1
    assert len(body["alertas_activas"]) == 1
    assert body["evento_detectado"]["titulo"] == "Atención requerida"
    assert body["evento_detectado"]["livestock_tag"] == "VG-001"
