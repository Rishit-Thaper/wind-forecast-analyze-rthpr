from datetime import date, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query

from app.api.deps import get_analytics_service
from app.core.config import DELIVERY_END, DELIVERY_START
from app.schemas.analytics import DailyResponse, OverviewResponse
from app.services.analysis import AnalyticsService

router = APIRouter(tags=["Analytics"])


@router.get("/overview", response_model=OverviewResponse)
def get_overview(
    service: AnalyticsService = Depends(get_analytics_service),
) -> OverviewResponse:
    """Retrieve forecast performance for delivery days decided in January 2026."""
    return service.get_overview()


@router.get("/daily", response_model=DailyResponse)
def get_daily(
    selected_date: date = Query(..., alias="date", description="Delivery date, 2026-01-02 to 2026-02-01 (YYYY-MM-DD)"),
    service: AnalyticsService = Depends(get_analytics_service),
) -> DailyResponse:
    """Retrieve hourly wind forecast vs actual generation comparisons for one delivery date."""
    first_day, last_day = DELIVERY_START.date(), (DELIVERY_END - timedelta(days=1)).date()
    if not (first_day <= selected_date <= last_day):
        raise HTTPException(
            status_code=422,
            detail=f"date must be between {first_day} and {last_day}",
        )
    return service.get_daily(selected_date)
