"""Tests for Helmet security headers."""

import pytest

pytestmark = pytest.mark.cross_cutting


class TestSecurityHeaders:
    """Verify Helmet-managed security headers on responses."""

    def _get_headers(self, api_client):
        """Helper: fetch root health and return response headers (lowercase keys)."""
        resp = api_client.get("/health")
        assert resp.status_code == 200
        # requests library lowercases header names automatically
        return resp.headers

    def test_x_content_type_options_nosniff(self, api_client):
        """X-Content-Type-Options header is set to 'nosniff'."""
        headers = self._get_headers(api_client)

        assert "x-content-type-options" in headers
        assert headers["x-content-type-options"] == "nosniff"

    def test_x_frame_options_deny(self, api_client):
        """X-Frame-Options header is set to 'DENY' to prevent clickjacking."""
        headers = self._get_headers(api_client)

        assert "x-frame-options" in headers
        assert headers["x-frame-options"].upper() == "DENY"

    def test_strict_transport_security_present(self, api_client):
        """Strict-Transport-Security (HSTS) header is present with max-age."""
        headers = self._get_headers(api_client)

        assert "strict-transport-security" in headers
        hsts = headers["strict-transport-security"]
        assert "max-age=" in hsts
        # Verify our configured max-age of 1 year (31536000)
        assert "31536000" in hsts

    def test_content_security_policy_absent_in_test(self, api_client):
        """Content-Security-Policy header is NOT present in test environment.

        CSP is disabled when NODE_ENV != production to allow Swagger UI.
        """
        headers = self._get_headers(api_client)

        assert "content-security-policy" not in headers

    def test_x_download_options(self, api_client):
        """X-Download-Options header is set to 'noopen'."""
        headers = self._get_headers(api_client)

        assert "x-download-options" in headers
        assert headers["x-download-options"] == "noopen"

    def test_x_dns_prefetch_control(self, api_client):
        """X-DNS-Prefetch-Control header is present."""
        headers = self._get_headers(api_client)

        assert "x-dns-prefetch-control" in headers
        # Helmet defaults to 'off'
        assert headers["x-dns-prefetch-control"] == "off"
