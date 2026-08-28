PAYLOAD = {"name": "Angel", "email": "angel@vigia.co", "password": "vigia2026"}


def test_registro_exitoso_devuelve_token_y_hashea_password(client, db):
    response = client.post("/api/auth/register", json=PAYLOAD)
    assert response.status_code == 201
    body = response.json()
    assert body["user"]["email"] == "angel@vigia.co"
    assert "access_token" in body

    from app.models.user import User

    user = db.query(User).filter(User.email == "angel@vigia.co").first()
    assert user.password_hash != "vigia2026"  # nunca texto plano


def test_registro_email_duplicado_409(client):
    client.post("/api/auth/register", json=PAYLOAD)
    response = client.post("/api/auth/register", json=PAYLOAD)
    assert response.status_code == 409


def test_login_correcto_devuelve_token(client):
    client.post("/api/auth/register", json=PAYLOAD)
    response = client.post(
        "/api/auth/login", json={"email": PAYLOAD["email"], "password": PAYLOAD["password"]}
    )
    assert response.status_code == 200
    assert response.json()["user"]["email"] == PAYLOAD["email"]


def test_login_password_incorrecta_401(client):
    client.post("/api/auth/register", json=PAYLOAD)
    response = client.post("/api/auth/login", json={"email": PAYLOAD["email"], "password": "mala"})
    assert response.status_code == 401


def test_login_email_inexistente_401(client):
    response = client.post("/api/auth/login", json={"email": "nadie@vigia.co", "password": "x"})
    assert response.status_code == 401


def test_email_se_normaliza_a_minusculas(client):
    """Regresión: registrar en mayúsculas y loguear en minúsculas debía fallar (401) antes del fix."""
    client.post(
        "/api/auth/register",
        json={"name": "Case", "email": "MayusTest@Vigia.co", "password": "vigia2026"},
    )
    response = client.post(
        "/api/auth/login", json={"email": "mayustest@vigia.co", "password": "vigia2026"}
    )
    assert response.status_code == 200
