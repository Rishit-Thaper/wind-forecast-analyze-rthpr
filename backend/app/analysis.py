"""Backward compatibility alias for app.services.analysis."""
from app.services.analysis import (
    AnalyticsService,
    build_comparisons,
    calculate_metrics,
    coverage,
    daily_summaries,
    error_by_forecast_level,
    error_by_hour,
    forecast_freshness,
    hourly_actuals,
    index_forecasts,
    pair_forecasts,
    parse_timestamp,
)

__all__ = [
    "AnalyticsService",
    "build_comparisons",
    "calculate_metrics",
    "coverage",
    "daily_summaries",
    "error_by_forecast_level",
    "error_by_hour",
    "forecast_freshness",
    "hourly_actuals",
    "index_forecasts",
    "pair_forecasts",
    "parse_timestamp",
]
