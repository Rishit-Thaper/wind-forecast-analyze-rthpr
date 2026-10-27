from fastapi import APIRouter
from app.schemas.analytics import HealthResponse

router = APIRouter(tags=["Health"])


@router.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    """Service health and liveness check."""
    return HealthResponse(status="ok", service="wind-analytics")
