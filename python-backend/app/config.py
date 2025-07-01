from pydantic import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    app_name: str = "FTDP Backend"
    debug: bool = False
    cors_origins: List[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]
    secret_key: str = os.environ.get("SECRET_KEY", "dev-key")

    class Config:
        env_file = ".env"

settings = Settings()
