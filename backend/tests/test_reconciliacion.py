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
