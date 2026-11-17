"""Tests for POST /api/v1/auth/register."""

import pytest

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
