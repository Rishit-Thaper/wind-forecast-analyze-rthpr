"""Backward compatibility alias for app.services.analysis."""
from app.services.analysis import (
    AnalyticsService,
    build_comparisons,
    calculate_metrics,
    coverage,
    daily_summaries,
    hourly_breakdown,
    parse_timestamp,
)

__all__ = [
    "AnalyticsService",
    "build_comparisons",
    "calculate_metrics",
    "coverage",
    "daily_summaries",
    "hourly_breakdown",
    "parse_timestamp",
]
