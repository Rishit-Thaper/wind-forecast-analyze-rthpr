import json
from datetime import datetime, time, timedelta, timezone
from functools import lru_cache
from pathlib import Path
from typing import List, Union

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

UTC = timezone.utc
# Purchase decisions are made in January 2026, so delivery days run from 2 January to 1 February.
DECISION_START = datetime(2026, 1, 1, tzinfo=UTC)
DECISION_END = datetime(2026, 2, 1, tzinfo=UTC)
DELIVERY_START = DECISION_START + timedelta(days=1)
DELIVERY_END = DECISION_END + timedelta(days=1)


def _default_cache_dir() -> Path:
    import os

    if os.environ.get("VERCEL") or os.environ.get("AWS_LAMBDA_FUNCTION_NAME"):
        return Path("/tmp/.cache")
    return Path(__file__).resolve().parents[2] / ".cache"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        populate_by_name=True,
    )

    # EPEX GB day-ahead (hourly) auction gate closure, 09:20 UK time; UK time equals UTC in January.
    cutoff_time_utc: time = Field(default=time(9, 20), alias="DAY_AHEAD_CUTOFF_UTC")
    timeout_seconds: float = Field(default=30.0, alias="ELEXON_TIMEOUT_SECONDS")
    cache_ttl_seconds: int = Field(default=21600, alias="ELEXON_CACHE_TTL_SECONDS")
    forecast_lookback_days: int = Field(default=31, alias="FORECAST_LOOKBACK_DAYS")
    cache_dir: Path = Field(
        default_factory=_default_cache_dir,
        alias="ELEXON_CACHE_DIR",
    )
    cors_origins: Union[List[str], str] = Field(
        default=[
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:80",
            "http://localhost",
        ],
        alias="CORS_ORIGINS",
    )

    @field_validator("cors_origins")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            v = v.strip()
            if v.startswith("[") and v.endswith("]"):
                return json.loads(v)
            return [i.strip() for i in v.split(",") if i.strip()]
        return v

    @property
    def cutoff_label(self) -> str:
        return f"{self.cutoff_time_utc:%H:%M} UTC"

    def decision_cutoff(self, delivery_start: datetime) -> datetime:
        """Latest usable forecast publication time: the cutoff on the calendar day before delivery."""
        delivery_utc = delivery_start.astimezone(UTC)
        previous_day = (delivery_utc - timedelta(days=1)).date()
        return datetime.combine(previous_day, self.cutoff_time_utc, tzinfo=UTC)


@lru_cache
def get_settings() -> Settings:
    return Settings()


# Default singleton instance for direct import compatibility
settings = get_settings()
