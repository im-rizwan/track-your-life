"""Tests for health check endpoints."""

import time
import pytest

pytestmark = pytest.mark.health


class TestRootHealth:
    """Tests for GET /health (root-level health check)."""

    def test_root_health_returns_200_with_status_ok(self, api_client):
        """Root health endpoint returns 200 with status 'ok'."""
        resp = api_client.get("/health")

        assert resp.status_code == 200
        body = resp.json()
        assert body["status"] == "ok"

    def test_root_health_response_contains_timestamp(self, api_client):
        """Root health endpoint includes a valid ISO timestamp."""
        resp = api_client.get("/health")

        assert resp.status_code == 200
        body = resp.json()
        assert "timestamp" in body
        # Verify it looks like an ISO 8601 timestamp (e.g. 2026-02-13T12:00:00.000Z)
        ts = body["timestamp"]
        assert isinstance(ts, str)
        assert "T" in ts


class TestApiHealth:
    """Tests for GET /api/v1/health."""

    def test_api_health_returns_200(self, api_client):
        """API health endpoint returns 200."""
        resp = api_client.get("/api/v1/health")

        assert resp.status_code == 200

    def test_api_health_response_has_correct_structure(self, api_client):
        """API health response contains status, timestamp, uptime, and environment."""
        resp = api_client.get("/api/v1/health")

        assert resp.status_code == 200
        body = resp.json()

        # All expected keys must be present
        assert body["status"] == "ok"
        assert "timestamp" in body
        assert "T" in body["timestamp"]
        assert "uptime" in body
        assert isinstance(body["uptime"], (int, float))
        assert body["uptime"] > 0
        assert "environment" in body
        assert body["environment"] == "test"


class TestDatabaseHealth:
    """Tests for GET /api/v1/health/db."""

    def test_api_health_db_returns_200(self, api_client):
        """Database health endpoint returns 200 with database: connected."""
        resp = api_client.get("/api/v1/health/db")

        assert resp.status_code == 200
        body = resp.json()
        assert body["status"] == "ok"
        assert body["database"] == "connected"
        assert "timestamp" in body


class TestHealthPerformance:
    """Tests for health endpoint response time."""

    def test_health_responds_quickly(self, api_client):
        """Health endpoint responds within 3 seconds."""
        start = time.time()
        resp = api_client.get("/health")
        elapsed = time.time() - start

        assert resp.status_code == 200
        assert elapsed < 3.0, f"Health check took {elapsed:.2f}s, expected < 3s"
