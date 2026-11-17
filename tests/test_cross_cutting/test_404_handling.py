"""Tests for 404 Not Found handling."""

import pytest

pytestmark = pytest.mark.cross_cutting


class TestNotFoundHandling:
    """Verify that unknown routes return proper 404 JSON responses."""

    def test_unknown_route_returns_404_json(self, api_client):
        """A request to a non-existent route returns 404 with JSON body."""
        resp = api_client.get("/api/v1/this-does-not-exist")

        assert resp.status_code == 404
        body = resp.json()
        assert body["success"] is False

    def test_404_response_has_correct_format(self, api_client):
        """The 404 response follows the standard error envelope format."""
        resp = api_client.get("/api/v1/nonexistent-endpoint")

        assert resp.status_code == 404
        body = resp.json()
        assert body["success"] is False
        assert "error" in body
        assert "message" in body["error"]
        # The notFoundHandler includes the requested URL in the message
        assert "not found" in body["error"]["message"].lower()

    def test_wrong_http_method_returns_404(self, api_client):
        """Using the wrong HTTP method on a known path returns 404.

        For example, DELETE /health does not exist (only GET is defined).
        """
        resp = api_client.delete("/health")

        assert resp.status_code == 404
        body = resp.json()
        assert body["success"] is False

    def test_nested_unknown_route_returns_404(self, api_client):
        """A deeply nested non-existent path also returns a proper 404."""
        resp = api_client.get("/api/v1/some/deeply/nested/nonexistent/resource")

        assert resp.status_code == 404
        body = resp.json()
        assert body["success"] is False
        assert "error" in body
        assert "message" in body["error"]
