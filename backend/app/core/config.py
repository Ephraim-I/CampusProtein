
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "CampusProtein API"
    app_version: str = "0.1.0"
    environment: str = "development"
    database_url: str = "sqlite:///./campusprotein.db"

    jwt_secret_key: str = "development-only-change-this-secret"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
