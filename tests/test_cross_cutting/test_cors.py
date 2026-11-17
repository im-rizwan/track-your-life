"""Tests for CORS configuration."""

import pytest

pytestmark = pytest.mark.cross_cutting


class TestCors:
    """Verify CORS headers are correctly configured."""

    def test_cors_allows_configured_origin(self, api_client):
        """Response includes Access-Control-Allow-Origin matching the configured origin.

        With CORS_ORIGIN=* in test, the header should be '*'.
        """
        resp = api_client.get(
            "/health",
            headers={"Origin": "http://example.com"},
        )

        assert resp.status_code == 200
        assert "access-control-allow-origin" in resp.headers
        assert resp.headers["access-control-allow-origin"] == "*"

    def test_cors_options_preflight(self, api_client):
        """An OPTIONS preflight request returns proper CORS headers."""
        resp = api_client.session.options(
            f"{api_client.base_url}/api/v1/health",
            headers={
                "Origin": "http://example.com",
                "Access-Control-Request-Method": "GET",
                "Access-Control-Request-Headers": "Authorization, Content-Type",
            },
        )

        # Preflight should succeed with 204 or 200
        assert resp.status_code in (200, 204)
        assert "access-control-allow-origin" in resp.headers
        assert "access-control-allow-methods" in resp.headers
        # Verify allowed methods include those configured
        allowed_methods = resp.headers["access-control-allow-methods"]
        assert "GET" in allowed_methods
        assert "POST" in allowed_methods

    def test_cors_includes_credentials_header(self, api_client):
        """Response includes Access-Control-Allow-Credentials: true."""
        resp = api_client.get(
            "/health",
            headers={"Origin": "http://example.com"},
        )

        assert resp.status_code == 200
        assert "access-control-allow-credentials" in resp.headers
        assert resp.headers["access-control-allow-credentials"] == "true"
