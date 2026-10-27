from datetime import datetime, time, timedelta, timezone
from functools import lru_cache
from pathlib import Path
from typing import List

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

UTC = timezone.utc
JANUARY_START = datetime(2026, 1, 1, tzinfo=UTC)
FEBRUARY_START = datetime(2026, 2, 1, tzinfo=UTC)


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    cutoff_hour_utc: int = Field(default=12, alias="DAY_AHEAD_CUTOFF_HOUR_UTC")
    timeout_seconds: float = Field(default=30.0, alias="ELEXON_TIMEOUT_SECONDS")
    cache_ttl_seconds: int = Field(default=21600, alias="ELEXON_CACHE_TTL_SECONDS")
    forecast_lookback_days: int = Field(default=31, alias="FORECAST_LOOKBACK_DAYS")
    cache_dir: Path = Field(
        default_factory=lambda: Path(__file__).resolve().parents[2] / ".cache",
        alias="ELEXON_CACHE_DIR",
    )
    cors_origins: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:80",
        "http://localhost",
    ]

    def decision_cutoff(self, delivery_start: datetime) -> datetime:
        """Working assumption: cutoff_hour_utc on the preceding calendar day."""
        delivery_utc = delivery_start.astimezone(UTC)
        previous_day = (delivery_utc - timedelta(days=1)).date()
        return datetime.combine(previous_day, time(self.cutoff_hour_utc), tzinfo=UTC)


@lru_cache
def get_settings() -> Settings:
    return Settings()


# Default singleton instance for direct import compatibility
settings = get_settings()
