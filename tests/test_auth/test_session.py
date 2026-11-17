"""Tests for GET /api/v1/auth/session."""

import pytest

from utils.auth_helpers import get_auth_headers
from utils.assertions import (
    assert_success,
    assert_unauthorized,
)

pytestmark = pytest.mark.auth


class TestSessionSuccess:
    """Successful session retrieval scenarios."""

    def test_session_with_valid_token_returns_200(self, api_client, registered_user):
        """Accessing session with a valid access token returns 200."""
        headers = get_auth_headers(registered_user["tokens"])
        resp = api_client.get_session(headers)
        assert_success(resp)

    def test_session_returns_user_profile(self, api_client, registered_user):
        """Session response contains user profile data with correct email."""
        headers = get_auth_headers(registered_user["tokens"])
        resp = api_client.get_session(headers)
        body = assert_success(resp)

        user = body["data"]
        assert user["email"] == registered_user["email"]
        assert "id" in user

    def test_session_response_excludes_password(self, api_client, registered_user):
        """Session response does NOT contain the password field."""
        headers = get_auth_headers(registered_user["tokens"])
        resp = api_client.get_session(headers)
        body = assert_success(resp)

        assert "password" not in body["data"]


class TestSessionFailure:
    """Failed session access scenarios."""

    def test_session_no_token_returns_401(self, api_client):
        """Accessing session without any token returns 401."""
        resp = api_client.get_session(headers={})
        assert_unauthorized(resp)

    def test_session_invalid_token_returns_401(self, api_client):
        """Accessing session with an invalid token returns 401."""
        headers = {"Authorization": "Bearer invalid-token-string"}
        resp = api_client.get_session(headers)
        assert_unauthorized(resp)

    def test_session_expired_format_token_returns_401(self, api_client):
        """Accessing session with a malformed Bearer header returns 401."""
        headers = {"Authorization": "NotBearer some-token"}
        resp = api_client.get_session(headers)
        assert_unauthorized(resp)
