"""Tests for POST /api/v1/auth/refresh."""

import pytest
from concurrent.futures import ThreadPoolExecutor

from utils.assertions import (
    assert_success,
    assert_unauthorized,
    assert_validation_error,
)

pytestmark = pytest.mark.auth


class TestTokenRefreshSuccess:
    """Successful token refresh scenarios."""

    def test_refresh_with_valid_token_returns_200(self, api_client, registered_user):
        """Refreshing with a valid refresh token returns 200."""
        refresh_token = registered_user["tokens"]["refreshToken"]
        resp = api_client.refresh(refresh_token)
        assert_success(resp)

    def test_refresh_returns_new_tokens(self, api_client, registered_user):
        """Refresh response contains new accessToken and refreshToken."""
        refresh_token = registered_user["tokens"]["refreshToken"]
        resp = api_client.refresh(refresh_token)
        body = assert_success(resp)

        data = body["data"]
        assert "accessToken" in data
        assert "refreshToken" in data
        assert data["accessToken"] != ""
        assert data["refreshToken"] != ""

    def test_refresh_new_tokens_differ_from_old(self, api_client, registered_user):
        """New tokens are different from the ones used to refresh, even when
        issued within the same wall-clock second as the original (relies on
        the random jti added to every refresh token's payload)."""
        old_refresh = registered_user["tokens"]["refreshToken"]
        old_access = registered_user["tokens"]["accessToken"]

        resp = api_client.refresh(old_refresh)
        body = assert_success(resp)

        assert body["data"]["refreshToken"] != old_refresh
        assert body["data"]["accessToken"] != old_access

    def test_refresh_new_access_token_works(self, api_client, registered_user):
        """The new access token can be used to access protected endpoints."""
        refresh_token = registered_user["tokens"]["refreshToken"]
        resp = api_client.refresh(refresh_token)
        body = assert_success(resp)

        new_access_token = body["data"]["accessToken"]
        headers = {"Authorization": f"Bearer {new_access_token}"}
        session_resp = api_client.get_session(headers)
        assert_success(session_resp)


class TestTokenRefreshFailure:
    """Failed token refresh scenarios."""

    def test_refresh_old_token_invalidated(self, api_client, registered_user):
        """After refresh, the old refresh token is strictly invalidated —
        rotation deletes the old row and stores a genuinely distinct new
        token (guaranteed by the random jti fix), so reusing the old one
        must now always fail, with no same-second collision ambiguity."""
        old_refresh = registered_user["tokens"]["refreshToken"]

        api_client.refresh(old_refresh)

        resp = api_client.refresh(old_refresh)
        assert_unauthorized(resp)

    def test_refresh_token_rotation_detects_reuse_across_rapid_sequence(
        self, api_client, registered_user
    ):
        """Chaining 5 refreshes back-to-back, each old token must be dead
        immediately after rotation — guards against any lingering grace
        window in the delete-then-store rotation sequence."""
        token = registered_user["tokens"]["refreshToken"]
        seen = {token}

        for _ in range(5):
            resp = api_client.refresh(token)
            body = assert_success(resp)
            new_token = body["data"]["refreshToken"]
            assert new_token not in seen, "Refresh token reused across rotation"
            seen.add(new_token)

            reuse_resp = api_client.refresh(token)
            assert_unauthorized(reuse_resp)

            token = new_token

    def test_refresh_invalid_token_returns_401(self, api_client):
        """A completely invalid token string returns 401."""
        resp = api_client.refresh("invalid-token-string")
        assert_unauthorized(resp)

    def test_refresh_tampered_token_returns_401(self, api_client, registered_user):
        """A tampered (modified) refresh token returns 401."""
        tampered = registered_user["tokens"]["refreshToken"] + "tampered"
        resp = api_client.refresh(tampered)
        assert_unauthorized(resp)

    def test_refresh_missing_token_returns_422(self, api_client):
        """Missing refreshToken field returns 422."""
        resp = api_client.post("/api/v1/auth/refresh", json={})
        assert_validation_error(resp)


class TestTokenRefreshConcurrency:
    """Race-condition handling for concurrent rotation of the same token."""

    def test_concurrent_refresh_same_token_never_500(self, api_client, registered_user):
        """10 parallel refresh calls with the same valid refresh token must
        never 500. refreshAccessToken() deletes the old token then stores a
        new one without a transaction, so concurrent callers could plausibly
        race on the delete; this should surface as 401s for losers, not 500s."""
        old_refresh = registered_user["tokens"]["refreshToken"]

        def attempt():
            return api_client.refresh(old_refresh)

        with ThreadPoolExecutor(max_workers=10) as pool:
            responses = list(pool.map(lambda _: attempt(), range(10)))

        status_codes = [r.status_code for r in responses]
        assert 500 not in status_codes, f"Got a 500 in concurrent refresh: {status_codes}"
        assert status_codes.count(200) >= 1, f"Expected at least one 200, got: {status_codes}"
