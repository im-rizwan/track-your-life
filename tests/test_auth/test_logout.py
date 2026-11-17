"""Tests for POST /api/v1/auth/logout and POST /api/v1/auth/logout-all."""

import time

import pytest

from utils.auth_helpers import create_verified_user, get_auth_headers, login_user
from utils.assertions import (
    assert_success,
    assert_unauthorized,
    assert_validation_error,
)

pytestmark = pytest.mark.auth


class TestLogout:
    """Tests for POST /api/v1/auth/logout."""

    def test_logout_returns_200(self, api_client, registered_user):
        """Logout with a valid refresh token returns 200."""
        refresh_token = registered_user["tokens"]["refreshToken"]
        resp = api_client.logout(refresh_token)
        assert_success(resp)

    def test_logout_invalidates_refresh_token(self, api_client, registered_user):
        """After logout, the refresh token can no longer be used."""
        refresh_token = registered_user["tokens"]["refreshToken"]
        api_client.logout(refresh_token)

        resp = api_client.refresh(refresh_token)
        assert_unauthorized(resp)

    def test_logout_access_token_still_works(self, api_client, registered_user):
        """After logout, the access token is NOT revoked (still valid until expiry)."""
        access_token = registered_user["tokens"]["accessToken"]
        refresh_token = registered_user["tokens"]["refreshToken"]

        api_client.logout(refresh_token)

        headers = {"Authorization": f"Bearer {access_token}"}
        resp = api_client.get_session(headers)
        assert_success(resp)

    def test_logout_missing_token_returns_422(self, api_client):
        """Missing refreshToken field returns 422."""
        resp = api_client.post("/api/v1/auth/logout", json={})
        assert_validation_error(resp)

    def test_logout_with_invalid_token_returns_500(self, api_client):
        """Logging out with a non-existent token returns 500.

        The API calls prisma.refreshToken.delete() which throws a
        RecordNotFound error when the token does not exist. The error is not
        caught, so it surfaces as a 500. Ideally this would be idempotent (200)
        but the current implementation does not handle the missing-record case.
        """
        resp = api_client.logout("some-nonexistent-token-value")
        assert resp.status_code == 500, (
            f"Expected 500 for non-existent token, got {resp.status_code}: {resp.text}"
        )


class TestLogoutAll:
    """Tests for POST /api/v1/auth/logout-all."""

    def test_logout_all_requires_auth(self, api_client):
        """Logout-all without auth token returns 401."""
        resp = api_client.logout_all(headers={})
        assert_unauthorized(resp)

    def test_logout_all_returns_200(self, api_client, registered_user):
        """Logout-all with valid auth returns 200."""
        headers = get_auth_headers(registered_user["tokens"])
        resp = api_client.logout_all(headers)
        assert_success(resp)

    def test_logout_all_invalidates_all_tokens(
        self, api_client, db_connection, registered_user
    ):
        """After logout-all, all refresh tokens for the user are invalidated.

        A 1-second sleep before the second login prevents a Prisma unique
        constraint violation on RefreshToken caused by identical JWT strings
        generated within the same second.
        """
        email = registered_user["email"]
        password = registered_user["password"]

        # Sleep to avoid JWT token collision (same-second = identical token)
        time.sleep(1)

        # Login a second time to create a second refresh token
        second_login = login_user(api_client, email, password)
        second_refresh = second_login["tokens"]["refreshToken"]

        # Use the first session's access token to logout-all
        headers = get_auth_headers(registered_user["tokens"])
        api_client.logout_all(headers)

        # Both refresh tokens should be invalidated
        resp1 = api_client.refresh(registered_user["tokens"]["refreshToken"])
        assert_unauthorized(resp1)

        resp2 = api_client.refresh(second_refresh)
        assert_unauthorized(resp2)

    def test_logout_all_access_token_still_works(self, api_client, registered_user):
        """After logout-all, the access token used to invoke it still works until expiry."""
        headers = get_auth_headers(registered_user["tokens"])
        api_client.logout_all(headers)

        resp = api_client.get_session(headers)
        assert_success(resp)

    def test_logout_all_invalid_token_returns_401(self, api_client):
        """Logout-all with an invalid Bearer token returns 401."""
        headers = {"Authorization": "Bearer invalid-token"}
        resp = api_client.logout_all(headers)
        assert_unauthorized(resp)
