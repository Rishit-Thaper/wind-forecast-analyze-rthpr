"""FastAPI dependency injection providers."""
from fastapi import Depends

from app.core.config import Settings, get_settings
from app.services.analysis import AnalyticsService
from app.services.elexon import ElexonClient


def get_elexon_client(settings: Settings = Depends(get_settings)) -> ElexonClient:
    return ElexonClient(settings)


def get_analytics_service(
    client: ElexonClient = Depends(get_elexon_client),
    settings: Settings = Depends(get_settings),
) -> AnalyticsService:
    return AnalyticsService(client=client, settings=settings)
