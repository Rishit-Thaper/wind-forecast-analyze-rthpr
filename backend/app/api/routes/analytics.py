from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query

from app.api.deps import get_analytics_service
from app.schemas.analytics import DailyResponse, OverviewResponse
from app.services.analysis import AnalyticsService

router = APIRouter(tags=["Analytics"])


@router.get("/overview", response_model=OverviewResponse)
def get_overview(
    service: AnalyticsService = Depends(get_analytics_service),
) -> OverviewResponse:
    """Retrieve January 2026 overall performance summary and daily metrics."""
    return service.get_overview()


@router.get("/daily", response_model=DailyResponse)
def get_daily(
    selected_date: date = Query(..., alias="date", description="Target date in January 2026 (YYYY-MM-DD)"),
    service: AnalyticsService = Depends(get_analytics_service),
) -> DailyResponse:
    """Retrieve half-hourly wind forecast vs actual generation comparisons for a specific January 2026 date."""
    if not (date(2026, 1, 1) <= selected_date <= date(2026, 1, 31)):
        raise HTTPException(
            status_code=422,
            detail="date must be between 2026-01-01 and 2026-01-31",
        )
    return service.get_daily(selected_date)
