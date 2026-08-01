from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DATABASE_URL: str
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int
    GEMINI_API_KEY: str | None = None
    GEMINI_MODEL: str = "gemini-2.5-flash"
    RESEND_API_KEY: str | None = None
    FROM_EMAIL: str = "JournalX <onboarding@resend.dev>"
    MONGODB_URL: str = "mongodb://localhost:27017/journalx"

    STRIPE_SECRET_KEY: str | None = None
    STRIPE_WEBHOOK_SECRET: str | None = None
    STRIPE_PRO_PRICE_ID: str | None = None
    STRIPE_ELITE_PRICE_ID: str | None = None
    FRONTEND_URL: str = "http://localhost:3000"
    GOOGLE_CLIENT_ID: str | None = None

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
    )


settings = Settings()
