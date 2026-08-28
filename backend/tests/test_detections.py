DETECTION_PAYLOAD = {
    "livestock_id": None,
    "animal_label": "cow",
    "bbox": {"x": 0.1, "y": 0.2, "width": 0.15, "height": 0.2},
    "confidence": 0.83,
    "behavior": "desconocido",
    "detected_at": "2026-08-27T20:00:00Z",
    "model_version": "test-v1",
}


def test_deteccion_valida_se_persiste(client, seed_media):
    media_id = seed_media["media_id"]

    response = client.post(f"/api/media/{media_id}/detecciones", json=DETECTION_PAYLOAD)
    assert response.status_code == 200
    body = response.json()
    assert body["id"] is not None
    assert body["potrero_id"] == seed_media["potrero_id"]


def test_deteccion_sin_livestock_id_no_genera_alerta(client, seed_media):
    """
    Sin re-identificación real, TODA detección viene sin livestock_id — alertar
    por eso inundaría la pantalla de alertas sin aportar información útil.
    """
    client.post(f"/api/media/{seed_media['media_id']}/detecciones", json=DETECTION_PAYLOAD)
    assert client.get("/api/alertas").json() == []


def test_deteccion_confianza_baja_se_descarta_sin_alerta(client, seed_media):
    payload = {**DETECTION_PAYLOAD, "confidence": 0.3}
    response = client.post(f"/api/media/{seed_media['media_id']}/detecciones", json=payload)
    assert response.status_code == 200
    assert response.json() is None
    assert client.get("/api/alertas").json() == []


def test_deteccion_comportamiento_anomalo_genera_alerta_correspondiente(client, seed_media):
    payload = {**DETECTION_PAYLOAD, "behavior": "anomalo"}
    client.post(f"/api/media/{seed_media['media_id']}/detecciones", json=payload)

    alertas = client.get("/api/alertas").json()
    assert alertas[0]["type"] == "comportamiento_anomalo"
    assert alertas[0]["priority"] == "alta"


def test_deteccion_anomala_con_motivo_usa_titulo_especifico(client, seed_media):
    """El simulador de demo manda 'motivo' (ej. fiebre/celo/parto simulados) — debe
    verse reflejado en el título de la alerta en vez del genérico."""
    payload = {**DETECTION_PAYLOAD, "behavior": "anomalo", "motivo": "Sospecha de fiebre (40.6°C)"}
    client.post(f"/api/media/{seed_media['media_id']}/detecciones", json=payload)

    alertas = client.get("/api/alertas").json()
    assert alertas[0]["title"] == "Sospecha de fiebre (40.6°C)"


def test_deteccion_media_inexistente_devuelve_404(client):
    response = client.post("/api/media/9999/detecciones", json=DETECTION_PAYLOAD)
    assert response.status_code == 404


def test_deteccion_livestock_id_inexistente_devuelve_404_no_500(client, seed_media):
    """Regresión: antes reventaba con 500 (IntegrityError de FK) en vez de un 404 limpio."""
    payload = {**DETECTION_PAYLOAD, "livestock_id": 999999}
    response = client.post(f"/api/media/{seed_media['media_id']}/detecciones", json=payload)
    assert response.status_code == 404
