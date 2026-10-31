"""Pure, testable forecast-selection and accuracy calculation functions & service."""
from __future__ import annotations

from collections import defaultdict
from datetime import date, datetime, time, timedelta, timezone
from math import sqrt
from statistics import quantiles
from typing import Any, Iterable

from app.core.config import DELIVERY_END, DELIVERY_START, Settings
from app.services.elexon import ElexonClient

UTC = timezone.utc
HOUR = timedelta(hours=1)
SETTLEMENT_PERIOD = timedelta(minutes=30)
# Bands of the forecast value (lower inclusive, upper exclusive, MW): the forecast is what a trader sees at decision time.
FORECAST_LEVEL_BANDS: tuple[tuple[float, float | None], ...] = ((0, 5000), (5000, 10000), (10000, 15000), (15000, None))

# Delivery hour -> publication time -> forecast MW.
ForecastIndex = dict[datetime, dict[datetime, float]]


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


def index_forecasts(
    forecasts: Iterable[dict[str, Any]],
    period_start: datetime = DELIVERY_START,
    period_end: datetime = DELIVERY_END,
) -> ForecastIndex:
    """Group WINDFOR values by delivery hour and publication; a repeated pair keeps the latter raw record."""
    index: ForecastIndex = defaultdict(dict)
    for record in forecasts:
        start = parse_timestamp(record.get("startTime"))
        published = parse_timestamp(record.get("publishTime"))
        generation = _generation(record)
        if start and published and generation is not None and period_start <= start < period_end:
            index[start][published] = generation
    return index


def hourly_actuals(
    actuals: Iterable[dict[str, Any]],
    period_start: datetime = DELIVERY_START,
    period_end: datetime = DELIVERY_END,
) -> dict[datetime, float]:
    """Average FUELHH wind settlement periods up to WINDFOR's hourly resolution.

    The latest publication of each half-hour wins, and an hour missing either half-hour has no actual.
    """
    half_hours: dict[datetime, tuple[datetime, float]] = {}
    for record in actuals:
        if str(record.get("fuelType", "")).upper() != "WIND":
            continue
        start = parse_timestamp(record.get("startTime"))
        generation = _generation(record)
        if not start or generation is None or not period_start <= start < period_end:
            continue
        published = parse_timestamp(record.get("publishTime")) or datetime.min.replace(tzinfo=UTC)
        if start not in half_hours or published >= half_hours[start][0]:
            half_hours[start] = (published, generation)

    hourly: dict[datetime, float] = {}
    for start, (_, first_half) in half_hours.items():
        second_half = half_hours.get(start + SETTLEMENT_PERIOD)
        if start.minute == 0 and second_half is not None:
            hourly[start] = (first_half + second_half[1]) / 2
    return hourly


def pair_forecasts(
    index: ForecastIndex,
    actuals_by_hour: dict[datetime, float],
    settings: Settings,
    period_start: datetime = DELIVERY_START,
    period_end: datetime = DELIVERY_END,
) -> list[dict[str, Any]]:
    """Pair each delivery hour's latest forecast published by the decision cutoff with its outturn."""
    rows: list[dict[str, Any]] = []
    current = period_start
    while current < period_end:
        cutoff = settings.decision_cutoff(current)
        eligible = [published for published in index.get(current, {}) if published <= cutoff]
        published = max(eligible) if eligible else None
        forecast_value = index[current][published] if published else None
        actual_value = actuals_by_hour.get(current)
        error = forecast_value - actual_value if forecast_value is not None and actual_value is not None else None
        rows.append({
            "start_time": _format_timestamp(current),
            "forecast_mw": forecast_value,
            "actual_mw": actual_value,
            "error_mw": error,
            "absolute_error_mw": abs(error) if error is not None else None,
            "publication_time": _format_timestamp(published),
            "lead_time_hours": (current - published) / HOUR if published else None,
        })
        current += HOUR
    return rows


def build_comparisons(
    forecasts: Iterable[dict[str, Any]],
    actuals: Iterable[dict[str, Any]],
    settings: Settings,
    period_start: datetime = DELIVERY_START,
    period_end: datetime = DELIVERY_END,
) -> list[dict[str, Any]]:
    """Select latest forecast published by cutoff and match it to the same UTC hour's outturn."""
    return pair_forecasts(
        index_forecasts(forecasts, period_start, period_end),
        hourly_actuals(actuals, period_start, period_end),
        settings,
        period_start,
        period_end,
    )


def _error_percentiles(errors: list[float]) -> tuple[float, float, float]:
    """P10, P50 and P90 of signed error, interpolated between observations."""
    if len(errors) == 1:
        return errors[0], errors[0], errors[0]
    deciles = quantiles(errors, n=10, method="inclusive")
    return deciles[0], deciles[4], deciles[8]


def calculate_metrics(rows: Iterable[dict[str, Any]]) -> dict[str, float | int | None]:
    matched = [row for row in rows if row.get("error_mw") is not None]
    errors = [float(row["error_mw"]) for row in matched]
    actual_total = sum(float(row["actual_mw"]) for row in matched)
    if not errors:
        return {
            "mae_mw": None,
            "rmse_mw": None,
            "bias_mw": None,
            "wape_percent": None,
            "p10_error_mw": None,
            "p50_error_mw": None,
            "p90_error_mw": None,
            "matched_periods": 0,
        }
    p10, p50, p90 = _error_percentiles(errors)
    return {
        "mae_mw": sum(abs(error) for error in errors) / len(errors),
        "rmse_mw": sqrt(sum(error ** 2 for error in errors) / len(errors)),
        "bias_mw": sum(errors) / len(errors),
        "wape_percent": (sum(abs(error) for error in errors) / actual_total * 100) if actual_total else None,
        "p10_error_mw": p10,
        "p50_error_mw": p50,
        "p90_error_mw": p90,
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


def error_by_hour(rows: Iterable[dict[str, Any]]) -> list[dict[str, Any]]:
    """Accuracy for each hour of the delivery day across the whole window."""
    by_hour: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for row in rows:
        by_hour[row["start_time"][11:16]].append(row)
    return [{"hour": hour, **calculate_metrics(hour_rows)} for hour, hour_rows in sorted(by_hour.items())]


def error_by_forecast_level(rows: Iterable[dict[str, Any]]) -> list[dict[str, Any]]:
    """Accuracy grouped by how much wind was forecast."""
    rows = [row for row in rows if row["forecast_mw"] is not None]
    return [
        {
            "lower_mw": lower,
            "upper_mw": upper,
            **calculate_metrics(
                row for row in rows if row["forecast_mw"] >= lower and (upper is None or row["forecast_mw"] < upper)
            ),
        }
        for lower, upper in FORECAST_LEVEL_BANDS
    ]


def regular_publication_times(index: ForecastIndex) -> list[time]:
    """Times of day at which WINDFOR is routinely published (on at least half of the days observed)."""
    days_by_time: dict[time, set[date]] = defaultdict(set)
    for publications in index.values():
        for published in publications:
            days_by_time[published.time()].add(published.date())
    observed_days = len(set().union(*days_by_time.values())) if days_by_time else 0
    return sorted(stamp for stamp, days in days_by_time.items() if len(days) * 2 >= observed_days)


def forecast_freshness(
    index: ForecastIndex,
    actuals_by_hour: dict[datetime, float],
    settings: Settings,
) -> list[dict[str, Any]]:
    """Accuracy had decisions used the latest forecast as of each routine publication time on the day before."""
    return [
        {
            "as_of_utc": f"{as_of:%H:%M}",
            "before_cutoff": as_of <= settings.cutoff_time_utc,
            **calculate_metrics(pair_forecasts(index, actuals_by_hour, settings.model_copy(update={"cutoff_time_utc": as_of}))),
        }
        for as_of in regular_publication_times(index)
    ]


class AnalyticsService:
    """Service layer coordinating Elexon data retrieval and analysis computations."""

    def __init__(self, client: ElexonClient, settings: Settings):
        self.client = client
        self.settings = settings

    def _load(self) -> tuple[ForecastIndex, dict[datetime, float]]:
        forecasts, actuals = self.client.load_january_records()
        return index_forecasts(forecasts), hourly_actuals(actuals)

    def get_comparison_rows(self) -> list[dict[str, Any]]:
        index, actuals = self._load()
        return pair_forecasts(index, actuals, self.settings)

    def cutoff_assumption(self) -> str:
        return (
            f"Forecasts must be published by {self.settings.cutoff_label} on the day before delivery. "
            "The default, 09:20, is the EPEX GB day-ahead auction gate closure (UK time equals UTC in January); "
            "configurable via DAY_AHEAD_CUTOFF_UTC."
        )

    def _cutoff_fields(self) -> dict[str, str]:
        return {
            "cutoff_time_utc": f"{self.settings.cutoff_time_utc:%H:%M}",
            "cutoff_assumption": self.cutoff_assumption(),
        }

    def get_overview(self) -> dict[str, Any]:
        index, actuals = self._load()
        rows = pair_forecasts(index, actuals, self.settings)
        last_delivery_day = DELIVERY_END - timedelta(days=1)
        return {
            "period": f"{DELIVERY_START:%Y-%m-%d} to {last_delivery_day:%Y-%m-%d}",
            **self._cutoff_fields(),
            "metrics": calculate_metrics(rows),
            "coverage": coverage(rows),
            "daily": daily_summaries(rows),
            "error_by_hour": error_by_hour(rows),
            "error_by_forecast_level": error_by_forecast_level(rows),
            "forecast_freshness": forecast_freshness(index, actuals, self.settings),
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
            "decision_date": (selected_date - timedelta(days=1)).isoformat(),
            **self._cutoff_fields(),
            "metrics": calculate_metrics(day_rows),
            "coverage": coverage(day_rows),
            "periods": day_rows,
            "largest_misses": misses,
            "forecast_publications": sorted({row["publication_time"] for row in day_rows if row["publication_time"]}),
        }
