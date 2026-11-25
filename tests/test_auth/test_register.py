"""Tests for POST /api/v1/auth/register."""

import pytest
from concurrent.futures import ThreadPoolExecutor

from utils.auth_helpers import unique_email
from utils.assertions import (
    assert_created,
    assert_conflict,
    assert_validation_error,
)

pytestmark = pytest.mark.auth


class TestRegisterSuccess:
    """Successful registration scenarios."""

    def test_register_valid_user_returns_201(self, api_client):
        """Registering with valid email and password returns 201."""
        email = unique_email()
        resp = api_client.register(email, "Test@12345")
        body = assert_created(resp)
        assert body["message"] == "User registered successfully"

    def test_register_response_contains_email_and_message(self, api_client):
        """Response data includes the registered email and a confirmation message."""
        email = unique_email()
        resp = api_client.register(email, "Test@12345")
        body = assert_created(resp)
        assert body["data"]["email"] == email
        assert "message" in body["data"]

    def test_register_trims_email_whitespace(self, api_client):
        """Leading/trailing whitespace in email is trimmed."""
        raw_email = unique_email()
        padded_email = f"  {raw_email}  "
        resp = api_client.register(padded_email, "Test@12345")
        body = assert_created(resp)
        assert body["data"]["email"] == raw_email

    def test_register_lowercases_email(self, api_client):
        """Email is lowercased during registration."""
        base = unique_email()
        upper_email = base.upper()
        resp = api_client.register(upper_email, "Test@12345")
        body = assert_created(resp)
        assert body["data"]["email"] == base.lower()

    def test_register_with_complex_valid_password(self, api_client):
        """A complex password meeting all rules is accepted."""
        email = unique_email()
        resp = api_client.register(email, "C0mpl3x!Pass#2026")
        assert_created(resp)


class TestRegisterDuplicate:
    """Duplicate email handling."""

    def test_register_duplicate_email_returns_409(self, api_client):
        """Registering with an already-used email returns 409 Conflict."""
        email = unique_email()
        api_client.register(email, "Test@12345")

        resp = api_client.register(email, "Test@12345")
        assert_conflict(resp)

    def test_register_duplicate_email_case_insensitive(self, api_client):
        """Duplicate check is case-insensitive."""
        email = unique_email()
        api_client.register(email, "Test@12345")

        resp = api_client.register(email.upper(), "Test@12345")
        assert_conflict(resp)


class TestRegisterPasswordValidation:
    """Password validation rules."""

    def test_register_password_too_short(self, api_client):
        """Password shorter than 8 characters is rejected."""
        resp = api_client.register(unique_email(), "Te@1abc")
        assert_validation_error(resp)

    def test_register_password_no_uppercase(self, api_client):
        """Password without uppercase letter is rejected."""
        resp = api_client.register(unique_email(), "test@12345")
        assert_validation_error(resp)

    def test_register_password_no_lowercase(self, api_client):
        """Password without lowercase letter is rejected."""
        resp = api_client.register(unique_email(), "TEST@12345")
        assert_validation_error(resp)

    def test_register_password_no_number(self, api_client):
        """Password without a number is rejected."""
        resp = api_client.register(unique_email(), "Test@abcde")
        assert_validation_error(resp)

    def test_register_password_no_special_char(self, api_client):
        """Password without a special character is rejected."""
        resp = api_client.register(unique_email(), "Test12345")
        assert_validation_error(resp)


class TestRegisterInputValidation:
    """Input validation edge cases."""

    def test_register_empty_body(self, api_client):
        """Empty request body returns 422."""
        resp = api_client.post("/api/v1/auth/register", json={})
        assert_validation_error(resp)

    def test_register_missing_email(self, api_client):
        """Missing email field returns 422."""
        resp = api_client.post("/api/v1/auth/register", json={"password": "Test@12345"})
        assert_validation_error(resp)

    def test_register_missing_password(self, api_client):
        """Missing password field returns 422."""
        resp = api_client.post("/api/v1/auth/register", json={"email": unique_email()})
        assert_validation_error(resp)

    def test_register_invalid_email_format(self, api_client):
        """Invalid email format returns 422."""
        resp = api_client.register("not-an-email", "Test@12345")
        assert_validation_error(resp)

    def test_register_sql_injection_in_email(self, api_client):
        """SQL injection attempt in email is rejected (invalid email format)."""
        resp = api_client.register("'; DROP TABLE users; --", "Test@12345")
        assert_validation_error(resp)

    def test_register_empty_email(self, api_client):
        """Empty string email returns 422."""
        resp = api_client.register("", "Test@12345")
        assert_validation_error(resp)

    def test_register_email_too_long_returns_422(self, api_client):
        """Email exceeding RFC 5321's 254-char limit is rejected, not accepted and
        left to fail downstream at the email-send step. Regression test for a bug
        found during manual production testing: emailSchema previously had no
        max-length bound, so an oversized email passed validation, was written to
        the database, and only failed later with an opaque EmailJS 503."""
        local_part = "a" * 300
        resp = api_client.register(f"{local_part}@example.com", "Test@12345")
        assert_validation_error(resp)

    def test_register_malformed_json_returns_400(self, api_client):
        """A request body that isn't valid JSON returns 400, not 500.
        Regression test: express.json()'s SyntaxError used to fall through to the
        generic unexpected-error handler and return a raw 500."""
        resp = api_client.session.post(
            f"{api_client.base_url}/api/v1/auth/register",
            data='{"email":"bad json',
            headers={"Content-Type": "application/json"},
        )
        assert resp.status_code == 400
        body = resp.json()
        assert body["success"] is False
        assert body["error"]["code"] == "INVALID_JSON"


class TestRegisterConcurrency:
    """Race-condition handling for duplicate concurrent registrations."""

    def test_concurrent_duplicate_registrations_never_500(self, api_client):
        """10 parallel registrations with the same email must yield exactly one
        201 and the rest 409 Conflict — never a 500. Regression test for a bug
        found during manual production testing: the existence-check-then-insert
        in AuthService.register() isn't atomic, so concurrent requests race past
        the check and collide on the DB's unique constraint. The loser's raw
        Prisma P2002 error wasn't mapped to a client error and leaked as a 500."""
        email = unique_email()

        def attempt():
            return api_client.register(email, "Test@12345")

        with ThreadPoolExecutor(max_workers=10) as pool:
            responses = list(pool.map(lambda _: attempt(), range(10)))

        status_codes = [r.status_code for r in responses]
        assert status_codes.count(201) == 1, f"Expected exactly one 201, got: {status_codes}"
        assert status_codes.count(409) == 9, f"Expected nine 409s, got: {status_codes}"
        assert 500 not in status_codes, f"Got a 500 in concurrent registration: {status_codes}"
