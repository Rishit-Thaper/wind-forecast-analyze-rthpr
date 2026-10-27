from datetime import datetime, timezone

from app.analysis import build_comparisons, calculate_metrics, parse_timestamp
from app.config import Settings


UTC = timezone.utc
SETTINGS = Settings(cutoff_hour_utc=12)
START = datetime(2026, 1, 1, tzinfo=UTC)
END = datetime(2026, 1, 1, 1, tzinfo=UTC)


def rows(forecasts, actuals):
    return build_comparisons(forecasts, actuals, SETTINGS, START, END)


def test_selects_latest_eligible_forecast():
    comparison = rows([
        {"startTime": "2026-01-01T00:00:00Z", "publishTime": "2025-12-31T09:00:00Z", "generation": 100},
        {"startTime": "2026-01-01T00:00:00Z", "publishTime": "2025-12-31T12:00:00Z", "generation": 120},
    ], [{"startTime": "2026-01-01T00:00:00Z", "fuelType": "WIND", "generation": 110}])
    assert comparison[0]["forecast_mw"] == 120
    assert comparison[0]["error_mw"] == 10


def test_excludes_forecasts_after_cutoff():
    comparison = rows([
        {"startTime": "2026-01-01T00:00:00Z", "publishTime": "2025-12-31T12:01:00Z", "generation": 100}
    ], [{"startTime": "2026-01-01T00:00:00Z", "fuelType": "WIND", "generation": 110}])
    assert comparison[0]["forecast_mw"] is None
    assert comparison[0]["error_mw"] is None


def test_matches_only_identical_start_time_and_handles_missing():
    comparison = rows([
        {"startTime": "2026-01-01T00:30:00Z", "publishTime": "2025-12-31T10:00:00Z", "generation": 100}
    ], [{"startTime": "2026-01-01T00:00:00Z", "fuelType": "WIND", "generation": 110}])
    assert comparison[0]["actual_mw"] == 110
    assert comparison[0]["forecast_mw"] is None
    assert comparison[1]["forecast_mw"] == 100
    assert comparison[1]["actual_mw"] is None


def test_normalizes_offsets_to_utc():
    assert parse_timestamp("2026-01-01T01:00:00+01:00") == datetime(2026, 1, 1, tzinfo=UTC)


def test_duplicate_actual_uses_latest_publication_and_metrics_zero_denominator():
    comparison = rows([
        {"startTime": "2026-01-01T00:00:00Z", "publishTime": "2025-12-31T10:00:00Z", "generation": 10}
    ], [
        {"startTime": "2026-01-01T00:00:00Z", "fuelType": "WIND", "generation": 5, "publishTime": "2026-01-01T00:31:00Z"},
        {"startTime": "2026-01-01T00:00:00Z", "fuelType": "WIND", "generation": 0, "publishTime": "2026-01-01T00:32:00Z"},
    ])
    assert comparison[0]["actual_mw"] == 0
    assert calculate_metrics(comparison)["wape_percent"] is None
