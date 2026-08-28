from app.repositories import alert_repository


def test_eventos_vacio_sin_datos(client):
    response = client.get("/api/eventos")
    assert response.status_code == 200
    assert response.json() == []


def test_eventos_incluye_alerta_creada_hoy(client, db, seed_media):
    alert_repository.create(
        db, type="salud", priority="media", status="activa", title="Fiebre detectada",
        potrero_id=seed_media["potrero_id"],
    )
    db.commit()

    body = client.get("/api/eventos").json()
    assert len(body) == 1
    assert body[0]["type"] == "alerta"
    assert body[0]["title"] == "Fiebre detectada"
