"""Backward compatibility alias for app.schemas.analytics."""
from app.schemas.analytics import (
    Coverage,
    DailyResponse,
    DailySummary,
    DeliveryHour,
    ForecastFreshness,
    ForecastLevelAccuracy,
    HealthResponse,
    HourOfDayAccuracy,
    LargestMiss,
    Metrics,
    OverviewResponse,
)

__all__ = [
    "Coverage",
    "DailyResponse",
    "DailySummary",
    "DeliveryHour",
    "HealthResponse",
    "ForecastFreshness",
    "ForecastLevelAccuracy",
    "HourOfDayAccuracy",
    "LargestMiss",
    "Metrics",
    "OverviewResponse",
]
