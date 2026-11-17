"""Tests for POST /api/v1/auth/login."""

import time

import pytest

from utils.auth_helpers import unique_email, create_verified_user
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
        time.sleep(1)
        resp = api_client.login(registered_user["email"], registered_user["password"])
        assert_success(resp)

    def test_login_returns_user_and_tokens(self, api_client, registered_user):
        """Successful login returns user object and tokens.

        A 1-second sleep prevents a Prisma unique constraint violation on the
        RefreshToken table that occurs when two JWTs with the same payload are
        generated in the same second (producing identical token strings).
        """
        time.sleep(1)
        resp = api_client.login(registered_user["email"], registered_user["password"])
        body = assert_success(resp)

        data = body["data"]
        assert "user" in data
        assert "tokens" in data
        assert "accessToken" in data["tokens"]
        assert "refreshToken" in data["tokens"]

    def test_login_user_excludes_password(self, api_client, registered_user):
        """Returned user object does not contain the password field."""
        time.sleep(1)
        resp = api_client.login(registered_user["email"], registered_user["password"])
        body = assert_success(resp)

        assert "password" not in body["data"]["user"]

    def test_login_email_case_insensitive(self, api_client, registered_user):
        """Login works with different email casing."""
        time.sleep(1)
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
