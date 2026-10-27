"""Pure, testable forecast-selection and accuracy calculation functions & service."""
from __future__ import annotations

from collections import defaultdict
from datetime import date, datetime, timedelta, timezone
from math import sqrt
from typing import Any, Iterable

from app.core.config import FEBRUARY_START, JANUARY_START, Settings
from app.core.errors import ElexonError
from app.services.elexon import ElexonClient

UTC = timezone.utc


def parse_timestamp(value: Any) -> datetime | None:
    """Parse API timestamps as UTC, accepting Z, offsets, or naive values."""
    if not value:
        return None
    try:
        normalized = str(value).replace("Z", "+00:00")
        stamp = datetime.fromisoformat(normalized)
        return stamp.replace(tzinfo=UTC) if stamp.tzinfo is None else stamp.astimezone(UTC)
    except (TypeError, ValueError):
        return None


def _generation(record: dict[str, Any]) -> float | None:
    try:
        value = record.get("generation")
        return None if value is None else float(value)
    except (TypeError, ValueError):
        return None


def _format_timestamp(stamp: datetime | None) -> str | None:
    return stamp.isoformat().replace("+00:00", "Z") if stamp else None


def build_comparisons(
    forecasts: Iterable[dict[str, Any]],
    actuals: Iterable[dict[str, Any]],
    settings: Settings,
    period_start: datetime = JANUARY_START,
    period_end: datetime = FEBRUARY_START,
) -> list[dict[str, Any]]:
    """Select latest forecast published by cutoff and match same UTC half-hour."""
    selected_forecasts: dict[datetime, tuple[datetime, float, int]] = {}
    for index, record in enumerate(forecasts):
        start = parse_timestamp(record.get("startTime"))
        published = parse_timestamp(record.get("publishTime"))
        generation = _generation(record)
        if not start or not published or generation is None or not period_start <= start < period_end:
            continue
        if published > settings.decision_cutoff(start):
            continue
        candidate = (published, generation, index)
        # Later publication wins; an equal publication chooses the latter raw record deterministically.
        if start not in selected_forecasts or candidate[:1] >= selected_forecasts[start][:1]:
            selected_forecasts[start] = candidate

    selected_actuals: dict[datetime, tuple[datetime, float, int]] = {}
    for index, record in enumerate(actuals):
        if str(record.get("fuelType", "")).upper() != "WIND":
            continue
        start = parse_timestamp(record.get("startTime"))
        generation = _generation(record)
        if not start or generation is None or not period_start <= start < period_end:
            continue
        published = parse_timestamp(record.get("publishTime")) or datetime.min.replace(tzinfo=UTC)
        candidate = (published, generation, index)
        if start not in selected_actuals or candidate[:1] >= selected_actuals[start][:1]:
            selected_actuals[start] = candidate

    rows: list[dict[str, Any]] = []
    current = period_start
    while current < period_end:
        forecast = selected_forecasts.get(current)
        actual = selected_actuals.get(current)
        forecast_value = forecast[1] if forecast else None
        actual_value = actual[1] if actual else None
        error = forecast_value - actual_value if forecast_value is not None and actual_value is not None else None
        rows.append({
            "start_time": _format_timestamp(current),
            "forecast_mw": forecast_value,
            "actual_mw": actual_value,
            "error_mw": error,
            "absolute_error_mw": abs(error) if error is not None else None,
            "publication_time": _format_timestamp(forecast[0]) if forecast else None,
        })
        current += timedelta(minutes=30)
    return rows


def calculate_metrics(rows: Iterable[dict[str, Any]]) -> dict[str, float | int | None]:
    matched = [row for row in rows if row.get("error_mw") is not None]
    errors = [float(row["error_mw"]) for row in matched]
    actual_total = sum(float(row["actual_mw"]) for row in matched)
    if not errors:
        return {"mae_mw": None, "rmse_mw": None, "bias_mw": None, "wape_percent": None, "matched_periods": 0}
    return {
        "mae_mw": sum(abs(error) for error in errors) / len(errors),
        "rmse_mw": sqrt(sum(error ** 2 for error in errors) / len(errors)),
        "bias_mw": sum(errors) / len(errors),
        "wape_percent": (sum(abs(error) for error in errors) / actual_total * 100) if actual_total else None,
        "matched_periods": len(errors),
    }


def coverage(rows: Iterable[dict[str, Any]]) -> dict[str, int]:
    rows = list(rows)
    return {
        "expected_periods": len(rows),
        "matched_periods": sum(row["error_mw"] is not None for row in rows),
        "missing_forecasts": sum(row["forecast_mw"] is None for row in rows),
        "missing_actuals": sum(row["actual_mw"] is None for row in rows),
    }


def daily_summaries(rows: Iterable[dict[str, Any]]) -> list[dict[str, Any]]:
    by_day: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for row in rows:
        by_day[row["start_time"][:10]].append(row)
    return [
        {"date": day_str, **calculate_metrics(day_rows), **coverage(day_rows)}
        for day_str, day_rows in sorted(by_day.items())
    ]


def hourly_breakdown(rows: Iterable[dict[str, Any]]) -> list[dict[str, Any]]:
    buckets: dict[int, list[float]] = defaultdict(list)
    for row in rows:
        stamp = parse_timestamp(row.get("start_time"))
        if stamp and row.get("absolute_error_mw") is not None:
            buckets[stamp.hour].append(float(row["absolute_error_mw"]))
    return [
        {"hour": f"{hour:02d}:00", "average_absolute_error_mw": sum(values) / len(values), "matched_periods": len(values)}
        for hour, values in sorted(buckets.items())
    ]


class AnalyticsService:
    """Service layer coordinating Elexon data retrieval and analysis computations."""

    def __init__(self, client: ElexonClient, settings: Settings):
        self.client = client
        self.settings = settings

    def get_comparison_rows(self) -> list[dict[str, Any]]:
        forecasts, actuals = self.client.load_january_records()
        return build_comparisons(forecasts, actuals, self.settings)

    def cutoff_assumption(self) -> str:
        return (
            f"Working assumption: {self.settings.cutoff_hour_utc:02d}:00 UTC on the previous calendar day; "
            "configurable via DAY_AHEAD_CUTOFF_HOUR_UTC."
        )

    def get_overview(self) -> dict[str, Any]:
        rows = self.get_comparison_rows()
        return {
            "period": "2026-01-01 to 2026-01-31",
            "cutoff_assumption": self.cutoff_assumption(),
            "metrics": calculate_metrics(rows),
            "coverage": coverage(rows),
            "daily": daily_summaries(rows),
        }

    def get_daily(self, selected_date: date) -> dict[str, Any]:
        rows = self.get_comparison_rows()
        date_iso = selected_date.isoformat()
        day_rows = [row for row in rows if row["start_time"].startswith(date_iso)]
        misses = sorted(
            (row for row in day_rows if row["absolute_error_mw"] is not None),
            key=lambda row: (-row["absolute_error_mw"], row["start_time"]),
        )[:5]

        return {
            "date": date_iso,
            "cutoff_assumption": self.cutoff_assumption(),
            "metrics": calculate_metrics(day_rows),
            "coverage": coverage(day_rows),
            "periods": day_rows,
            "largest_misses": misses,
            "hourly_error_breakdown": hourly_breakdown(day_rows),
        }
