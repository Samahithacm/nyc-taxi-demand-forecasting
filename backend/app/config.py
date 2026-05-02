from functools import lru_cache

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Runtime settings loaded from backend/.env with safe development defaults."""

    SECRET_KEY: str = Field(default="dev-secret-key-change-me-32-characters-minimum")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    DEMO_USERNAME: str = "demo"
    DEMO_PASSWORD: str = "demo123"
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"
    MODEL_PATH: str = "../models/adaptive_model_final.pkl"
    FEATURE_COLUMNS_PATH: str = "../models/feature_columns.json"
    ZONES_PATH: str = "../frontend/public/data/zones.json"
    PREDICTION_LOOKUP_PATH: str = "../frontend/public/data/prediction_lookup.json"
    RATE_LIMIT_PUBLIC: str = "10/minute"
    RATE_LIMIT_AUTHENTICATED: str = "60/minute"
    DEBUG: bool = True
    LOG_LEVEL: str = "INFO"

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True, extra="ignore")

    @field_validator("SECRET_KEY")
    @classmethod
    def validate_secret_key(cls, value: str) -> str:
        if len(value) < 32:
            raise ValueError("SECRET_KEY must be at least 32 characters long")
        return value

    @field_validator("DEBUG", mode="before")
    @classmethod
    def parse_debug(cls, value: object) -> bool:
        if isinstance(value, bool):
            return value
        if isinstance(value, str):
            normalized = value.strip().lower()
            if normalized in {"1", "true", "yes", "on", "debug"}:
                return True
            if normalized in {"0", "false", "no", "off", "release", "prod", "production"}:
                return False
        return bool(value)

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
