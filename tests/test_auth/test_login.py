"""Tests for POST /api/v1/auth/login."""

import pytest
from concurrent.futures import ThreadPoolExecutor

from utils.auth_helpers import unique_email
from utils.assertions import (
    assert_success,
    assert_unauthorized,
    assert_validation_error,
)

pytestmark = pytest.mark.auth


class TestLoginSuccess:
    """Successful login scenarios."""

    def test_login_with_valid_credentials_returns_200(self, api_client, registered_user):
        """Login with correct email and password returns 200."""
        resp = api_client.login(registered_user["email"], registered_user["password"])
        assert_success(resp)

    def test_login_returns_user_and_tokens(self, api_client, registered_user):
        """Successful login returns user object and tokens."""
        resp = api_client.login(registered_user["email"], registered_user["password"])
        body = assert_success(resp)

        data = body["data"]
        assert "user" in data
        assert "tokens" in data
        assert "accessToken" in data["tokens"]
        assert "refreshToken" in data["tokens"]

    def test_login_user_excludes_password(self, api_client, registered_user):
        """Returned user object does not contain the password field."""
        resp = api_client.login(registered_user["email"], registered_user["password"])
        body = assert_success(resp)

        assert "password" not in body["data"]["user"]

    def test_login_email_case_insensitive(self, api_client, registered_user):
        """Login works with different email casing."""
        resp = api_client.login(
            registered_user["email"].upper(), registered_user["password"]
        )
        assert_success(resp)


class TestLoginFailure:
    """Failed login scenarios."""

    def test_login_wrong_password_returns_401(self, api_client, registered_user):
        """Incorrect password returns 401."""
        resp = api_client.login(registered_user["email"], "Wr0ng@Pass!")
        assert_unauthorized(resp)

    def test_login_nonexistent_email_returns_401(self, api_client):
        """Login with an email that does not exist returns 401."""
        resp = api_client.login("nobody@nowhere.com", "Test@12345")
        assert_unauthorized(resp)

    def test_login_unverified_email_returns_401(self, api_client, unverified_user):
        """Login with an unverified email returns 401."""
        resp = api_client.login(unverified_user["email"], unverified_user["password"])
        assert_unauthorized(resp)

    def test_login_unverified_email_message(self, api_client, unverified_user):
        """Login with unverified email mentions email verification."""
        resp = api_client.login(unverified_user["email"], unverified_user["password"])
        body = assert_unauthorized(resp)
        assert "verify" in body["error"]["message"].lower()


class TestLoginAccountLocking:
    """Account lockout after failed attempts."""

    def test_login_locked_after_5_failed_attempts(self, api_client, registered_user):
        """Account is locked after 5 consecutive wrong-password attempts."""
        email = registered_user["email"]

        for _ in range(5):
            api_client.login(email, "Wr0ng@Pass!")

        # 6th attempt should indicate lockout
        resp = api_client.login(email, "Wr0ng@Pass!")
        body = assert_unauthorized(resp)
        assert "locked" in body["error"]["message"].lower() or \
               "too many" in body["error"]["message"].lower()

    def test_login_locked_even_with_correct_password(self, api_client, registered_user):
        """After lockout, even correct password is rejected."""
        email = registered_user["email"]
        password = registered_user["password"]

        for _ in range(5):
            api_client.login(email, "Wr0ng@Pass!")

        resp = api_client.login(email, password)
        assert_unauthorized(resp)

    def test_login_failed_attempt_error_message(self, api_client, registered_user):
        """Wrong password gives a generic 'invalid credentials' message (no info leak)."""
        resp = api_client.login(registered_user["email"], "Wr0ng@Pass!")
        body = assert_unauthorized(resp)
        message = body["error"]["message"].lower()
        assert "invalid" in message or "incorrect" in message


class TestLoginConcurrency:
    """Concurrent token issuance for the same account."""

    def test_concurrent_logins_all_succeed_with_distinct_tokens(
        self, api_client, registered_user
    ):
        """10 parallel logins with the same valid credentials, all within the same
        wall-clock second, must all succeed — each a legitimate independent session
        (e.g. multiple devices logging in near-simultaneously). Regression test:
        generateRefreshToken() previously signed {userId, email} with no random
        claim, so two tokens issued for the same user in the same second were
        byte-identical, colliding on RefreshToken.token's unique constraint and
        causing spurious 409s for what should be independent successful logins."""
        email = registered_user["email"]
        password = registered_user["password"]

        def attempt():
            return api_client.login(email, password)

        with ThreadPoolExecutor(max_workers=10) as pool:
            responses = list(pool.map(lambda _: attempt(), range(10)))

        status_codes = [r.status_code for r in responses]
        assert status_codes.count(200) == 10, f"Expected all ten 200s, got: {status_codes}"

        tokens = [r.json()["data"]["tokens"]["refreshToken"] for r in responses]
        assert len(set(tokens)) == 10, "Expected ten distinct refresh tokens, got duplicates"

    def test_concurrent_wrong_password_attempts_never_500(self, api_client, registered_user):
        """10 parallel wrong-password attempts (racing the failed-attempt counter
        and potentially crossing the lockout threshold mid-flight) must never 500."""
        email = registered_user["email"]

        def attempt():
            return api_client.login(email, "Wr0ng@Pass!")

        with ThreadPoolExecutor(max_workers=10) as pool:
            responses = list(pool.map(lambda _: attempt(), range(10)))

        status_codes = [r.status_code for r in responses]
        assert 500 not in status_codes, f"Got a 500 in concurrent login attempts: {status_codes}"
        assert all(c == 401 for c in status_codes), f"Expected all 401s, got: {status_codes}"


class TestLoginInputValidation:
    """Input validation for login endpoint."""

    def test_login_missing_email(self, api_client):
        """Missing email returns 422."""
        resp = api_client.post("/api/v1/auth/login", json={"password": "Test@12345"})
        assert_validation_error(resp)

    def test_login_missing_password(self, api_client):
        """Missing password returns 422."""
        resp = api_client.post("/api/v1/auth/login", json={"email": unique_email()})
        assert_validation_error(resp)

    def test_login_empty_body(self, api_client):
        """Empty body returns 422."""
        resp = api_client.post("/api/v1/auth/login", json={})
        assert_validation_error(resp)
