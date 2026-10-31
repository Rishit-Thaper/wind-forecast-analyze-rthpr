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
    assert data["period"] == "2026-01-02 to 2026-02-01"
    assert data["cutoff_time_utc"] == "09:20"
    assert len(data["error_by_hour"]) == 24
    assert len(data["error_by_forecast_level"]) == 4
    assert data["forecast_freshness"][0]["as_of_utc"] == "07:30"


def test_daily_endpoint_valid_date(client: TestClient):
    response = client.get("/api/daily?date=2026-01-15")
    assert response.status_code == 200
    data = response.json()
    assert data["date"] == "2026-01-15"
    assert "metrics" in data
    assert "periods" in data
    assert "largest_misses" in data
    assert data["decision_date"] == "2026-01-14"
    assert data["forecast_publications"] == ["2026-01-14T07:30:00Z"]
    assert len(data["periods"]) == 24
    assert data["periods"][0]["actual_mw"] == 4950.0
    assert data["metrics"]["matched_periods"] == 2


def test_daily_endpoint_accepts_last_delivery_day(client: TestClient):
    assert client.get("/api/daily?date=2026-02-01").status_code == 200


def test_daily_endpoint_invalid_date(client: TestClient):
    # 1 January was decided on 31 December, outside the January decision window.
    response = client.get("/api/daily?date=2026-01-01")
    assert response.status_code == 422
    assert "date must be between 2026-01-02 and 2026-02-01" in response.json()["detail"]


def test_daily_endpoint_invalid_date_format(client: TestClient):
    response = client.get("/api/daily?date=not-a-date")
    assert response.status_code == 422
