"""Pytest fixtures for backend tests."""
import pytest
from fastapi.testclient import TestClient

from app.api.deps import get_analytics_service, get_settings
from app.core.config import Settings
from app.main import app
from app.services.analysis import AnalyticsService


@pytest.fixture
def test_settings() -> Settings:
    return Settings(
        cutoff_hour_utc=12,
        timeout_seconds=5.0,
        cache_ttl_seconds=3600,
    )


@pytest.fixture
def mock_analytics_service(test_settings: Settings) -> AnalyticsService:
    class MockElexonClient:
        def load_january_records(self):
            # Return sample records for testing
            forecasts = [
                {"startTime": "2026-01-15T00:00:00Z", "publishTime": "2026-01-14T11:00:00Z", "generation": 5000.0},
                {"startTime": "2026-01-15T00:30:00Z", "publishTime": "2026-01-14T11:00:00Z", "generation": 5200.0},
            ]
            actuals = [
                {"startTime": "2026-01-15T00:00:00Z", "fuelType": "WIND", "generation": 4800.0, "publishTime": "2026-01-15T00:35:00Z"},
                {"startTime": "2026-01-15T00:30:00Z", "fuelType": "WIND", "generation": 5100.0, "publishTime": "2026-01-15T01:05:00Z"},
            ]
            return forecasts, actuals

    return AnalyticsService(client=MockElexonClient(), settings=test_settings)


@pytest.fixture
def client(mock_analytics_service: AnalyticsService, test_settings: Settings) -> TestClient:
    app.dependency_overrides[get_settings] = lambda: test_settings
    app.dependency_overrides[get_analytics_service] = lambda: mock_analytics_service
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
