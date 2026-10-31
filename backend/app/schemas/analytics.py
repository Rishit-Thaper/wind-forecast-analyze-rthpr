"""Pydantic request/response schemas for Wind Analytics API."""
from typing import List, Optional

from pydantic import BaseModel, Field


class Metrics(BaseModel):
    mae_mw: Optional[float] = Field(None, description="Mean Absolute Error in Megawatts")
    rmse_mw: Optional[float] = Field(None, description="Root Mean Square Error in Megawatts")
    bias_mw: Optional[float] = Field(None, description="Mean signed forecast error (positive = over-forecasting)")
    wape_percent: Optional[float] = Field(None, description="Weighted Absolute Percentage Error (null if generation is 0)")
    p10_error_mw: Optional[float] = Field(None, description="10th percentile of signed error (forecast - actual)")
    p50_error_mw: Optional[float] = Field(None, description="Median signed error (forecast - actual)")
    p90_error_mw: Optional[float] = Field(
        None, description="90th percentile of signed error: actual fell short of forecast by more than this in 1 hour in 10"
    )
    matched_periods: int = Field(..., description="Number of valid matched delivery hours")


class Coverage(BaseModel):
    expected_periods: int = Field(..., description="Total expected delivery hours in the interval")
    matched_periods: int = Field(..., description="Total successfully matched hours")
    missing_forecasts: int = Field(..., description="Hours missing an eligible WINDFOR forecast")
    missing_actuals: int = Field(..., description="Hours missing either FUELHH wind settlement period")


class DailySummary(Metrics, Coverage):
    date: str = Field(..., description="Calendar date in YYYY-MM-DD format")


class DeliveryHour(BaseModel):
    start_time: str = Field(..., description="Delivery hour start timestamp in UTC ISO format")
    forecast_mw: Optional[float] = Field(None, description="Selected day-ahead wind forecast in MW")
    actual_mw: Optional[float] = Field(None, description="Mean wind outturn of the hour's two settlement periods in MW")
    error_mw: Optional[float] = Field(None, description="Signed forecast error (forecast - actual) in MW")
    absolute_error_mw: Optional[float] = Field(None, description="Absolute forecast error in MW")
    publication_time: Optional[str] = Field(None, description="Timestamp when the selected forecast was published")
    lead_time_hours: Optional[float] = Field(None, description="Hours between forecast publication and delivery")


class LargestMiss(DeliveryHour):
    pass


class HourOfDayAccuracy(Metrics):
    hour: str = Field(..., description="Delivery hour of day (HH:00 UTC)")


class ForecastLevelAccuracy(Metrics):
    lower_mw: float = Field(..., description="Inclusive lower bound of the forecast band in MW")
    upper_mw: Optional[float] = Field(None, description="Exclusive upper bound of the forecast band in MW (null = open)")


class ForecastFreshness(Metrics):
    as_of_utc: str = Field(..., description="Latest forecast as of this time (HH:MM UTC) on the day before delivery")
    before_cutoff: bool = Field(..., description="Whether this forecast is available before the decision cutoff")


class OverviewResponse(BaseModel):
    period: str = Field(..., description="Delivery days analyzed (decisions made in January 2026)")
    cutoff_time_utc: str = Field(..., description="Decision cutoff on the day before delivery (HH:MM UTC)")
    cutoff_assumption: str = Field(..., description="Human-readable decision cutoff description")
    metrics: Metrics
    coverage: Coverage
    daily: List[DailySummary]
    error_by_hour: List[HourOfDayAccuracy]
    error_by_forecast_level: List[ForecastLevelAccuracy]
    forecast_freshness: List[ForecastFreshness]


class DailyResponse(BaseModel):
    date: str = Field(..., description="Delivery date analyzed (YYYY-MM-DD)")
    decision_date: str = Field(..., description="Date the day-ahead purchase decision was made (YYYY-MM-DD)")
    cutoff_time_utc: str = Field(..., description="Decision cutoff on the day before delivery (HH:MM UTC)")
    cutoff_assumption: str = Field(..., description="Human-readable decision cutoff description")
    metrics: Metrics
    coverage: Coverage
    periods: List[DeliveryHour]
    largest_misses: List[LargestMiss]
    forecast_publications: List[str] = Field(..., description="Publication times of the forecasts used for this day")


class HealthResponse(BaseModel):
    status: str = "ok"
    service: str = "wind-analytics"
