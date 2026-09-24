from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    anthropic_api_key: str = ""
    claude_model: str = "claude-sonnet-5"
    frontend_origin: str = "http://localhost:3000"
    database_url: str = "sqlite:///./accesslens.db"
    # Dev-only default. Must be overridden via .env for anything beyond local use,
    # since anyone with this value could forge login tokens.
    secret_key: str = "dev-only-insecure-secret-change-me"
    access_token_expire_minutes: int = 60 * 24 * 7
    resend_api_key: str = ""
    # No custom domain yet, so this uses Resend's shared sending address.
    email_from: str = "AccessLens <onboarding@resend.dev>"

    class Config:
        env_file = ".env"


settings = Settings()
