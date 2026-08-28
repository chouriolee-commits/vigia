from app.services import simulation_service


class _ProcesoFalso:
    """Doble de subprocess.Popen — nunca lanza nada real en la suite de tests."""

    def __init__(self, *args, **kwargs):
        self._vivo = True

    def poll(self):
        return None if self._vivo else 0

    def terminate(self):
        self._vivo = False

    def wait(self, timeout=None):
        return 0

    def kill(self):
        self._vivo = False


def test_estado_inicial_no_corriendo(client):
    simulation_service.detener()  # aislar del resto de la suite (estado en memoria)
    body = client.get("/api/simulacion").json()
    assert body == {"corriendo": False, "potrero_id": None, "video": None}


def test_iniciar_video_inexistente_404(client):
    response = client.post("/api/simulacion", json={"potrero_id": 1, "video": "no-existe.mp4"})
    assert response.status_code == 404


def test_iniciar_rechaza_path_traversal(client):
    response = client.post("/api/simulacion", json={"potrero_id": 1, "video": "../secreto.mp4"})
    assert response.status_code == 404


def test_iniciar_y_detener_actualiza_estado(client, monkeypatch):
    monkeypatch.setattr(simulation_service.subprocess, "Popen", _ProcesoFalso)

    response = client.post("/api/simulacion", json={"potrero_id": 1, "video": "corral-vertical.mp4"})
    assert response.status_code == 200
    assert response.json() == {"corriendo": True, "potrero_id": 1, "video": "corral-vertical.mp4"}

    response = client.delete("/api/simulacion")
    assert response.json() == {"corriendo": False, "potrero_id": None, "video": None}


def test_iniciar_de_nuevo_detiene_la_sesion_anterior(client, monkeypatch):
    monkeypatch.setattr(simulation_service.subprocess, "Popen", _ProcesoFalso)

    client.post("/api/simulacion", json={"potrero_id": 1, "video": "corral-vertical.mp4"})
    response = client.post("/api/simulacion", json={"potrero_id": 2, "video": "pastizal-suelo.mp4"})

    assert response.json() == {"corriendo": True, "potrero_id": 2, "video": "pastizal-suelo.mp4"}
    simulation_service.detener()
