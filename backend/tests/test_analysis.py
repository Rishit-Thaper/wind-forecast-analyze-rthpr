from datetime import datetime, time, timezone

from app.analysis import (
    build_comparisons,
    calculate_metrics,
    error_by_forecast_level,
    forecast_freshness,
    hourly_actuals,
    index_forecasts,
    parse_timestamp,
)
from app.config import DELIVERY_END, DELIVERY_START, Settings

UTC = timezone.utc
SETTINGS = Settings(cutoff_time_utc=time(9, 20))
START = datetime(2026, 1, 2, tzinfo=UTC)
END = datetime(2026, 1, 2, 1, tzinfo=UTC)


def actual(start, generation, published=None):
    record = {"startTime": start, "fuelType": "WIND", "generation": generation}
    if published:
        record["publishTime"] = published
    return record


def hour_actuals(first_half=110, second_half=110):
    return [actual("2026-01-02T00:00:00Z", first_half), actual("2026-01-02T00:30:00Z", second_half)]


def rows(forecasts, actuals, settings=SETTINGS):
    return build_comparisons(forecasts, actuals, settings, START, END)


def test_delivery_window_covers_decisions_made_in_january():
    assert DELIVERY_START == datetime(2026, 1, 2, tzinfo=UTC)
    assert DELIVERY_END == datetime(2026, 2, 2, tzinfo=UTC)
    comparison = build_comparisons([], [], SETTINGS)
    assert len(comparison) == 31 * 24
    assert comparison[0]["start_time"] == "2026-01-02T00:00:00Z"
    assert comparison[-1]["start_time"] == "2026-02-01T23:00:00Z"


def test_selects_latest_forecast_published_by_gate_closure():
    comparison = rows([
        {"startTime": "2026-01-02T00:00:00Z", "publishTime": "2026-01-01T07:30:00Z", "generation": 120},
        {"startTime": "2026-01-02T00:00:00Z", "publishTime": "2026-01-01T04:30:00Z", "generation": 100},
        {"startTime": "2026-01-02T00:00:00Z", "publishTime": "2026-01-01T09:30:00Z", "generation": 140},
    ], hour_actuals())
    assert comparison[0]["forecast_mw"] == 120
    assert comparison[0]["error_mw"] == 10
    assert comparison[0]["publication_time"] == "2026-01-01T07:30:00Z"
    assert comparison[0]["lead_time_hours"] == 16.5


def test_cutoff_is_inclusive_to_the_minute():
    forecasts = [{"startTime": "2026-01-02T00:00:00Z", "publishTime": "2026-01-01T09:20:00Z", "generation": 100}]
    assert rows(forecasts, hour_actuals())[0]["forecast_mw"] == 100
    late = [{"startTime": "2026-01-02T00:00:00Z", "publishTime": "2026-01-01T09:21:00Z", "generation": 100}]
    assert rows(late, hour_actuals())[0]["forecast_mw"] is None


def test_cutoff_time_is_configurable_from_environment(monkeypatch):
    monkeypatch.setenv("DAY_AHEAD_CUTOFF_UTC", "09:50")
    assert Settings().cutoff_time_utc == time(9, 50)


def test_hourly_actual_is_mean_of_its_two_settlement_periods():
    comparison = rows([
        {"startTime": "2026-01-02T00:00:00Z", "publishTime": "2026-01-01T07:30:00Z", "generation": 100}
    ], hour_actuals(first_half=90, second_half=130))
    assert comparison[0]["actual_mw"] == 110
    assert comparison[0]["error_mw"] == -10


def test_hour_missing_a_settlement_period_has_no_actual():
    comparison = rows([
        {"startTime": "2026-01-02T00:00:00Z", "publishTime": "2026-01-01T07:30:00Z", "generation": 100}
    ], [actual("2026-01-02T00:00:00Z", 110)])
    assert comparison[0]["forecast_mw"] == 100
    assert comparison[0]["actual_mw"] is None
    assert comparison[0]["error_mw"] is None


def test_normalizes_offsets_to_utc():
    assert parse_timestamp("2026-01-01T01:00:00+01:00") == datetime(2026, 1, 1, tzinfo=UTC)


def test_duplicate_actual_uses_latest_publication_and_metrics_zero_denominator():
    comparison = rows([
        {"startTime": "2026-01-02T00:00:00Z", "publishTime": "2026-01-01T07:30:00Z", "generation": 10}
    ], [
        actual("2026-01-02T00:00:00Z", 5, "2026-01-02T00:31:00Z"),
        actual("2026-01-02T00:00:00Z", 0, "2026-01-02T00:32:00Z"),
        actual("2026-01-02T00:30:00Z", 0, "2026-01-02T01:01:00Z"),
    ])
    assert comparison[0]["actual_mw"] == 0
    assert calculate_metrics(comparison)["wape_percent"] is None


def test_error_percentiles_describe_shortfall_risk():
    errors = [float(value) for value in range(-100, 1000, 100)]  # -100 .. 900
    metrics = calculate_metrics({"error_mw": error, "actual_mw": 1000} for error in errors)
    assert metrics["p10_error_mw"] == 0
    assert metrics["p50_error_mw"] == 400
    assert metrics["p90_error_mw"] == 800
    single = calculate_metrics([{"error_mw": 50, "actual_mw": 1000}])
    assert single["p10_error_mw"] == single["p90_error_mw"] == 50


def test_error_by_forecast_level_groups_on_forecast_value():
    levels = error_by_forecast_level([
        {"forecast_mw": 4000, "error_mw": 100, "actual_mw": 3900},
        {"forecast_mw": 16000, "error_mw": 3000, "actual_mw": 13000},
        {"forecast_mw": None, "error_mw": None, "actual_mw": 9000},
    ])
    assert [(level["lower_mw"], level["upper_mw"]) for level in levels] == [
        (0, 5000), (5000, 10000), (10000, 15000), (15000, None)
    ]
    assert levels[0]["bias_mw"] == 100
    assert levels[1]["matched_periods"] == 0
    assert levels[3]["bias_mw"] == 3000


def test_forecast_freshness_marks_publications_available_before_cutoff():
    forecasts = []
    for day in range(1, 32):
        for published, generation in (("07:30", 120), ("11:30", 110)):
            forecasts.append({
                "startTime": f"2026-01-{day + 1:02d}T00:00:00Z" if day < 31 else "2026-02-01T00:00:00Z",
                "publishTime": f"2026-01-{day:02d}T{published}:00Z",
                "generation": generation,
            })
    actuals = [actual("2026-01-02T00:00:00Z", 110), actual("2026-01-02T00:30:00Z", 110)]
    freshness = forecast_freshness(index_forecasts(forecasts), hourly_actuals(actuals), SETTINGS)
    assert [(row["as_of_utc"], row["before_cutoff"]) for row in freshness] == [("07:30", True), ("11:30", False)]
    assert freshness[0]["bias_mw"] == 10
    assert freshness[1]["bias_mw"] == 0
