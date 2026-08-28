import httpx

from app.core.config import settings


def test_asistente_sin_api_key_responde_fallback(client, monkeypatch):
    monkeypatch.setattr(settings, "groq_api_key", "")
    response = client.post("/api/asistente/mensajes", json={"message": "hola", "context": {}})
    assert response.status_code == 200
    assert "no pude conectar" in response.json()["content"].lower()


def test_asistente_responde_con_groq_ok(client, monkeypatch):
    def fake_post(*args, **kwargs):
        request = httpx.Request("POST", "https://fake")
        return httpx.Response(
            200,
            json={"choices": [{"message": {"content": "Hay 0 alertas activas."}}]},
            request=request,
        )

    monkeypatch.setattr(settings, "groq_api_key", "fake-key")
    monkeypatch.setattr(httpx, "post", fake_post)

    response = client.post("/api/asistente/mensajes", json={"message": "¿alertas?", "context": {}})
    assert response.status_code == 200
    assert response.json()["content"] == "Hay 0 alertas activas."


def test_asistente_maneja_error_de_groq_con_fallback(client, monkeypatch):
    def fake_post(*args, **kwargs):
        request = httpx.Request("POST", "https://fake")
        return httpx.Response(500, json={"error": "boom"}, request=request)

    monkeypatch.setattr(settings, "groq_api_key", "fake-key")
    monkeypatch.setattr(httpx, "post", fake_post)

    response = client.post("/api/asistente/mensajes", json={"message": "hola", "context": {}})
    assert response.status_code == 200
    assert "no pude conectar" in response.json()["content"].lower()
