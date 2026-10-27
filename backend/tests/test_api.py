"""Integration tests for FastAPI endpoints."""
from fastapi.testclient import TestClient


def test_health_endpoint(client: TestClient):
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "wind-analytics"


def test_overview_endpoint(client: TestClient):
    response = client.get("/api/overview")
    assert response.status_code == 200
    data = response.json()
    assert "period" in data
    assert "metrics" in data
    assert "coverage" in data
    assert "daily" in data
    assert data["period"] == "2026-01-01 to 2026-01-31"


def test_daily_endpoint_valid_date(client: TestClient):
    response = client.get("/api/daily?date=2026-01-15")
    assert response.status_code == 200
    data = response.json()
    assert data["date"] == "2026-01-15"
    assert "metrics" in data
    assert "periods" in data
    assert "largest_misses" in data
    assert "hourly_error_breakdown" in data


def test_daily_endpoint_invalid_date(client: TestClient):
    response = client.get("/api/daily?date=2025-12-31")
    assert response.status_code == 422
    assert "date must be between 2026-01-01 and 2026-01-31" in response.json()["detail"]


def test_daily_endpoint_invalid_date_format(client: TestClient):
    response = client.get("/api/daily?date=not-a-date")
    assert response.status_code == 422
