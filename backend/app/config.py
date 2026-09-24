from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    anthropic_api_key: str = ""
    claude_model: str = "claude-sonnet-5"
    frontend_origin: str = "http://localhost:3000"

    class Config:
        env_file = ".env"


settings = Settings()
