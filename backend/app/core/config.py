from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Configuración centralizada, leída de variables de entorno (.env)."""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql://vigia:vigia@localhost:5432/vigia"
    cors_origins: str = "http://localhost:5173"

    # Umbral bajo el cual una detección no se persiste ni se cuenta (005-yolov8-detection)
    min_detection_confidence: float = 0.5

    # Asistente IA (007-ai-assistant, fase futura)
    groq_api_key: str = ""
    groq_model: str = "openai/gpt-oss-120b"
    groq_base_url: str = "https://api.groq.com/openai/v1"

    # Autenticación (013-authentication)
    jwt_secret_key: str = "cambiar-en-produccion-vigia-dev-secret"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60 * 24  # 24h

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


settings = Settings()
