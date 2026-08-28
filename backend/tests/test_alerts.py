from app.repositories import alert_repository


def test_alertas_vacio_sin_datos(client):
    response = client.get("/api/alertas")
    assert response.status_code == 200
    assert response.json() == []


def test_alertas_solo_activas_y_en_revision(client, db, seed_media):
    alert_repository.create(
        db, type="salud", priority="alta", status="activa", title="A activa",
        potrero_id=seed_media["potrero_id"],
    )
    alert_repository.create(
        db, type="salud", priority="baja", status="resuelta", title="B resuelta",
        potrero_id=seed_media["potrero_id"],
    )
    db.commit()

    response = client.get("/api/alertas")
    assert response.status_code == 200
    body = response.json()
    assert len(body) == 1
    assert body[0]["title"] == "A activa"


def test_alertas_ordenadas_por_prioridad_desc(client, db, seed_media):
    alert_repository.create(
        db, type="salud", priority="baja", status="activa", title="Baja",
        potrero_id=seed_media["potrero_id"],
    )
    alert_repository.create(
        db, type="salud", priority="critica", status="activa", title="Critica",
        potrero_id=seed_media["potrero_id"],
    )
    db.commit()

    body = client.get("/api/alertas").json()
    assert [a["title"] for a in body] == ["Critica", "Baja"]
