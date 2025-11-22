from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # Project Info
    PROJECT_NAME: str = "20 Questions Game API"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = "Backend API for 20 Questions Game with Gemini AI"
    API_V1_STR: str = "/api/v1"

    # Security
    ALLOWED_ORIGINS: List[str] = ["*"]

    # Database
    DATABASE_URL: str = "postgresql://user:password@localhost:5432/dbname"

    # Gemini API
    GOOGLE_API_KEY: str = "AIzaSyBFU4u52qHu43t_Ne0tEOkRsFWxLQVD0N4"
    GEMINI_MODEL: str = "gemini-pro"

    # LangChain
    LANGCHAIN_TRACING_V2: str = "false"
    LANGCHAIN_API_KEY: str = ""

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()

