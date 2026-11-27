"""Tests for POST /api/v1/auth/logout and POST /api/v1/auth/logout-all."""

import pytest
from concurrent.futures import ThreadPoolExecutor

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

    def test_logout_with_nonexistent_token_is_idempotent(self, api_client):
        """Logging out with a token that doesn't exist in the DB returns 200
        (idempotent), not 500. Regression test: deleteRefreshToken() used
        prisma.refreshToken.delete() (throws on missing record) instead of
        deleteMany() (0-row no-op), so this previously raised an unhandled
        P2025 that surfaced as a raw 500."""
        resp = api_client.logout("some-nonexistent-token-value")
        assert_success(resp)

    def test_logout_twice_with_same_token_is_idempotent(self, api_client, registered_user):
        """Logging out twice with the same (now-already-deleted) token
        succeeds both times rather than 500ing on the second call."""
        refresh_token = registered_user["tokens"]["refreshToken"]
        api_client.logout(refresh_token)

        resp = api_client.logout(refresh_token)
        assert_success(resp)


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
        """After logout-all, all refresh tokens for the user are invalidated."""
        email = registered_user["email"]
        password = registered_user["password"]

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

    def test_concurrent_logout_calls_never_500(self, api_client, registered_user):
        """10 parallel logout calls with the same token must never 500 — each
        after the first is a no-op delete of an already-removed row."""
        refresh_token = registered_user["tokens"]["refreshToken"]

        def attempt():
            return api_client.logout(refresh_token)

        with ThreadPoolExecutor(max_workers=10) as pool:
            responses = list(pool.map(lambda _: attempt(), range(10)))

        status_codes = [r.status_code for r in responses]
        assert 500 not in status_codes, f"Got a 500 in concurrent logout: {status_codes}"
        assert all(c == 200 for c in status_codes), f"Expected all 200s, got: {status_codes}"
