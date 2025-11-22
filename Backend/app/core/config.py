from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List, Union
from pydantic import field_validator
from pathlib import Path

# Get the project root directory (Backend folder)
BASE_DIR = Path(__file__).resolve().parent.parent.parent
ENV_FILE = BASE_DIR / ".env"


class Settings(BaseSettings):
    # Project Info
    PROJECT_NAME: str = "Questions Game API"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = "Backend API for Questions Game with Gemini AI"
    API_V1_STR: str = "/api/v1"

    # Security - can be "*" or comma-separated list like "http://localhost:3000,https://app.com"
    ALLOWED_ORIGINS: Union[str, List[str]] = "*"

    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def parse_cors(cls, v):
        if isinstance(v, str):
            if v == "*":
                return ["*"]
            # Split by comma for multiple origins
            return [origin.strip() for origin in v.split(",")]
        return v

    # Database - Railway PostgreSQL URL using TCP Proxy
    # TCP Proxy: caboose.proxy.rlwy.net:23203 -> :5432
    # Loaded from .env file
    DATABASE_URL: str

    # Gemini API - Loaded from .env file
    GOOGLE_API_KEY: str
    GEMINI_MODEL: str = "gemini-2.5-flash"  # Using stable model with full path

    # LangChain
    LANGCHAIN_TRACING_V2: str = "false"
    LANGCHAIN_API_KEY: str = ""

    model_config = SettingsConfigDict(
        env_file=str(ENV_FILE),
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )


settings = Settings()

