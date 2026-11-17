"""Tests for malformed request handling."""

import requests
import pytest

pytestmark = pytest.mark.cross_cutting


class TestMalformedRequests:
    """Verify that the API handles malformed or edge-case requests gracefully."""

    def test_malformed_json_body_returns_error(self, api_client):
        """Sending invalid JSON in the request body returns an error.

        Express may return 400 or 500 for malformed JSON depending on the
        error-handling middleware configuration. We accept either here.
        """
        resp = api_client.post(
            "/api/v1/auth/register",
            data="{ this is not valid json }",
            headers={"Content-Type": "application/json"},
        )

        assert resp.status_code in (400, 500), (
            f"Expected 400 or 500 for malformed JSON, got {resp.status_code}: {resp.text}"
        )
        body = resp.json()
        assert body["success"] is False

    def test_very_large_payload_returns_error(self, api_client):
        """Sending a payload larger than the body limit returns an error.

        Express may return 413 (Payload Too Large) or 500 depending on the
        body-parser configuration and error-handling middleware. We accept
        either here.
        """
        # Build a payload slightly over 10MB
        oversized_data = "x" * (11 * 1024 * 1024)

        resp = api_client.post(
            "/api/v1/auth/register",
            data=oversized_data,
            headers={"Content-Type": "application/json"},
        )

        assert resp.status_code in (413, 500), (
            f"Expected 413 or 500 for oversized payload, got {resp.status_code}: {resp.text}"
        )

    def test_empty_content_type_with_body(self, api_client):
        """Sending a body without Content-Type header is handled gracefully."""
        resp = api_client.post(
            "/api/v1/auth/register",
            data='{"email":"test@test.com","password":"Test@12345"}',
            headers={"Content-Type": ""},
        )

        # Without proper Content-Type, body won't be parsed as JSON.
        # This should result in a validation error (422) since fields appear missing,
        # or a 400 depending on how Express handles it.
        assert resp.status_code in (400, 422)
        body = resp.json()
        assert body["success"] is False

    def test_missing_required_fields_returns_422(self, api_client):
        """Sending a register request without required fields returns 422."""
        # Missing both email and password
        resp = api_client.post("/api/v1/auth/register", json={})

        assert resp.status_code == 422
        body = resp.json()
        assert body["success"] is False
        assert "error" in body

    def test_extra_fields_ignored_on_register(self, api_client):
        """Extra fields in the register payload do not cause errors.

        The Zod schema validates only known fields; extras are ignored.
        Registration should still succeed with a 201.
        """
        resp = api_client.post("/api/v1/auth/register", json={
            "email": "extra_fields_test@test.com",
            "password": "Test@12345",
            "someExtraField": "should-be-ignored",
            "anotherOne": 42,
        })

        # Should succeed (201) — extra fields are simply stripped/ignored
        assert resp.status_code == 201
        body = resp.json()
        assert body["success"] is True
