"""External Elexon BMRS client with disk caching and retry logic."""
from __future__ import annotations

import json
import logging
import time
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any

import httpx

from app.core.config import FEBRUARY_START, JANUARY_START, Settings
from app.core.errors import ElexonError

logger = logging.getLogger(__name__)

BASE_URL = "https://data.elexon.co.uk/bmrs/api/v1/datasets"


class ElexonClient:
    """Client for fetching WINDFOR and FUELHH streams from Elexon BMRS."""

    def __init__(self, app_settings: Settings):
        self.settings = app_settings
        self.settings.cache_dir.mkdir(parents=True, exist_ok=True)

    @staticmethod
    def _iso(stamp: datetime) -> str:
        return stamp.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")

    def _cache_file(self, dataset: str) -> Path:
        return self.settings.cache_dir / f"{dataset.lower()}_jan_2026.json"

    def _read_cache(self, dataset: str) -> list[dict[str, Any]] | None:
        path = self._cache_file(dataset)
        if not path.exists():
            return None
        try:
            mtime = path.stat().st_mtime
            if time.time() - mtime > self.settings.cache_ttl_seconds:
                logger.info("Cache for %s expired (TTL: %s s)", dataset, self.settings.cache_ttl_seconds)
                return None
            payload = json.loads(path.read_text(encoding="utf-8"))
            if isinstance(payload, list):
                logger.info("Loaded %d records for %s from cache", len(payload), dataset)
                return payload
            return None
        except (OSError, json.JSONDecodeError) as exc:
            logger.warning("Could not read cache file %s: %s", path, exc)
            return None

    def _write_cache(self, dataset: str, records: list[dict[str, Any]]) -> None:
        path = self._cache_file(dataset)
        try:
            path.write_text(json.dumps(records), encoding="utf-8")
            logger.info("Wrote %d records for %s to cache", len(records), dataset)
        except OSError as exc:
            logger.warning("Failed writing to cache file %s: %s", path, exc)

    @staticmethod
    def _records(payload: Any) -> list[dict[str, Any]]:
        if isinstance(payload, list):
            records = payload
        elif isinstance(payload, dict) and isinstance(payload.get("data"), list):
            records = payload["data"]
        else:
            raise ElexonError("Elexon returned an unexpected response shape.")
        return [item for item in records if isinstance(item, dict)]

    def _fetch(self, dataset: str, start: datetime, end: datetime) -> list[dict[str, Any]]:
        cached = self._read_cache(dataset)
        if cached is not None:
            return cached

        params = {
            "publishDateTimeFrom": self._iso(start),
            "publishDateTimeTo": self._iso(end),
        }
        logger.info("Fetching %s from Elexon (%s to %s)", dataset, params["publishDateTimeFrom"], params["publishDateTimeTo"])
        response: httpx.Response | None = None

        for attempt in range(2):
            try:
                response = httpx.get(
                    f"{BASE_URL}/{dataset}/stream",
                    params=params,
                    timeout=self.settings.timeout_seconds,
                )
                if response.status_code == 429:
                    raise ElexonError("Elexon is rate limiting requests. Please try again shortly.")
                if response.status_code < 500:
                    break
            except ElexonError:
                raise
            except httpx.TimeoutException:
                logger.warning("Attempt %d: Elexon request timed out", attempt + 1)
                response = None
            except httpx.RequestError as exc:
                logger.warning("Attempt %d: Elexon request error: %s", attempt + 1, exc)
                response = None

            if attempt == 0:
                time.sleep(0.4)

        try:
            if response is None:
                raise ElexonError("Elexon request timed out or could not connect. Please try again.")
            response.raise_for_status()
            records = self._records(response.json())
        except httpx.HTTPStatusError as exc:
            raise ElexonError(f"Elexon request failed with status {exc.response.status_code}.") from exc
        except ValueError as exc:
            raise ElexonError("Elexon returned malformed JSON data.") from exc

        self._write_cache(dataset, records)
        return records

    def load_january_records(self) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
        """Load WINDFOR forecasts and FUELHH wind actuals for January 2026."""
        forecast_start = JANUARY_START - timedelta(days=self.settings.forecast_lookback_days)
        forecasts = self._fetch("WINDFOR", forecast_start, FEBRUARY_START)
        actuals = self._fetch("FUELHH", JANUARY_START, FEBRUARY_START + timedelta(days=2))
        return forecasts, actuals
