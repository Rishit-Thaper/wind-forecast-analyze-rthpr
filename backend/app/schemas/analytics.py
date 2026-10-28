"""Pydantic request/response schemas for Wind Analytics API."""
from typing import List, Optional

from pydantic import BaseModel, Field


class Metrics(BaseModel):
    mae_mw: Optional[float] = Field(None, description="Mean Absolute Error in Megawatts")
    rmse_mw: Optional[float] = Field(None, description="Root Mean Square Error in Megawatts")
    bias_mw: Optional[float] = Field(None, description="Mean signed forecast error (positive = over-forecasting)")
    wape_percent: Optional[float] = Field(None, description="Weighted Absolute Percentage Error (null if generation is 0)")
    matched_periods: int = Field(..., description="Number of valid matched delivery periods")


class Coverage(BaseModel):
    expected_periods: int = Field(..., description="Total expected delivery periods in the interval")
    matched_periods: int = Field(..., description="Total successfully matched periods")
    missing_forecasts: int = Field(..., description="Periods missing eligible WINDFOR forecasts")
    missing_actuals: int = Field(..., description="Periods missing FUELHH wind actuals")


class DailySummary(Metrics, Coverage):
    date: str = Field(..., description="Calendar date in YYYY-MM-DD format")


class HalfHourPeriod(BaseModel):
    start_time: str = Field(..., description="Half-hour start timestamp in UTC ISO format")
    forecast_mw: Optional[float] = Field(None, description="Selected day-ahead wind forecast in MW")
    actual_mw: Optional[float] = Field(None, description="Actual wind generation outturn in MW")
    error_mw: Optional[float] = Field(None, description="Signed forecast error (forecast - actual) in MW")
    absolute_error_mw: Optional[float] = Field(None, description="Absolute forecast error in MW")
    publication_time: Optional[str] = Field(None, description="Timestamp when the selected forecast was published")


class LargestMiss(HalfHourPeriod):
    pass


class HourlyErrorBreakdown(BaseModel):
    hour: str = Field(..., description="Hour of day (HH:00)")
    average_absolute_error_mw: float = Field(..., description="Average absolute forecast error during this hour")
    matched_periods: int = Field(..., description="Number of matched delivery periods in this hour")


class OverviewResponse(BaseModel):
    period: str = Field(..., description="Analyzed period range")
    cutoff_assumption: str = Field(..., description="Human-readable decision cutoff description")
    metrics: Metrics
    coverage: Coverage
    daily: List[DailySummary]


class DailyResponse(BaseModel):
    date: str = Field(..., description="Date analyzed (YYYY-MM-DD)")
    cutoff_assumption: str = Field(..., description="Human-readable decision cutoff description")
    metrics: Metrics
    coverage: Coverage
    periods: List[HalfHourPeriod]
    largest_misses: List[LargestMiss]
    hourly_error_breakdown: List[HourlyErrorBreakdown]


class HealthResponse(BaseModel):
    status: str = "ok"
    service: str = "wind-analytics"
