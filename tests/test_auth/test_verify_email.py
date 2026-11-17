"""Tests for POST /api/v1/auth/verify-email."""

import pytest

from utils.auth_helpers import unique_email
from utils.db import get_latest_otp, get_user_field
from utils.assertions import (
    assert_success,
    assert_conflict,
    assert_validation_error,
)

pytestmark = pytest.mark.auth


class TestVerifyEmailSuccess:
    """Successful email verification scenarios."""

    def test_verify_email_with_valid_otp_returns_200(self, api_client, db_connection):
        """Verifying with a valid OTP returns 200."""
        email = unique_email()
        api_client.register(email, "Test@12345")
        db_connection.commit()

        otp = get_latest_otp(db_connection, email, "EMAIL_VERIFICATION")
        resp = api_client.verify_email(email, otp)
        assert_success(resp)

    def test_verify_email_returns_user_and_tokens(self, api_client, db_connection):
        """Successful verification returns user object and tokens."""
        email = unique_email()
        api_client.register(email, "Test@12345")
        db_connection.commit()

        otp = get_latest_otp(db_connection, email, "EMAIL_VERIFICATION")
        resp = api_client.verify_email(email, otp)
        body = assert_success(resp)

        data = body["data"]
        assert "user" in data
        assert "tokens" in data
        assert "accessToken" in data["tokens"]
        assert "refreshToken" in data["tokens"]

    def test_verify_email_user_has_correct_email(self, api_client, db_connection):
        """Returned user object has the correct email."""
        email = unique_email()
        api_client.register(email, "Test@12345")
        db_connection.commit()

        otp = get_latest_otp(db_connection, email, "EMAIL_VERIFICATION")
        resp = api_client.verify_email(email, otp)
        body = assert_success(resp)

        assert body["data"]["user"]["email"] == email

    def test_verify_email_sets_email_verified_flag(self, api_client, db_connection):
        """After verification, isEmailVerified is set to true in the database."""
        email = unique_email()
        api_client.register(email, "Test@12345")
        db_connection.commit()

        otp = get_latest_otp(db_connection, email, "EMAIL_VERIFICATION")
        api_client.verify_email(email, otp)
        db_connection.commit()

        is_verified = get_user_field(db_connection, email, "isEmailVerified")
        assert is_verified is True

    def test_verify_email_user_excludes_password(self, api_client, db_connection):
        """Returned user object does not contain the password field."""
        email = unique_email()
        api_client.register(email, "Test@12345")
        db_connection.commit()

        otp = get_latest_otp(db_connection, email, "EMAIL_VERIFICATION")
        resp = api_client.verify_email(email, otp)
        body = assert_success(resp)

        assert "password" not in body["data"]["user"]


class TestVerifyEmailFailure:
    """Failed email verification scenarios."""

    def test_verify_email_invalid_otp_returns_422(self, api_client, db_connection):
        """Invalid OTP returns 422."""
        email = unique_email()
        api_client.register(email, "Test@12345")
        db_connection.commit()

        resp = api_client.verify_email(email, "000000")
        assert_validation_error(resp)

    def test_verify_email_already_verified_returns_409(self, api_client, db_connection):
        """Verifying an already-verified email returns 409 Conflict."""
        email = unique_email()
        api_client.register(email, "Test@12345")
        db_connection.commit()

        otp = get_latest_otp(db_connection, email, "EMAIL_VERIFICATION")
        api_client.verify_email(email, otp)

        # Re-register is not possible; try verifying again with a new OTP attempt
        resp = api_client.verify_email(email, otp)
        assert_conflict(resp)

    def test_verify_email_wrong_email_returns_422(self, api_client, db_connection):
        """OTP for a non-existent email returns 422."""
        resp = api_client.verify_email("nonexistent@test.com", "123456")
        assert_validation_error(resp)

    def test_verify_email_used_otp_returns_422(self, api_client, db_connection):
        """Re-using an already-consumed OTP returns 422 (after resend creates a new one)."""
        email = unique_email()
        api_client.register(email, "Test@12345")
        db_connection.commit()

        first_otp = get_latest_otp(db_connection, email, "EMAIL_VERIFICATION")

        # Resend to invalidate the first OTP
        api_client.resend_verification(email)
        db_connection.commit()

        # Try to use the old (now invalidated) OTP
        resp = api_client.verify_email(email, first_otp)
        assert_validation_error(resp)


class TestVerifyEmailValidation:
    """Input validation for verify-email endpoint."""

    def test_verify_email_missing_email(self, api_client):
        """Missing email field returns 422."""
        resp = api_client.post("/api/v1/auth/verify-email", json={"otp": "123456"})
        assert_validation_error(resp)

    def test_verify_email_missing_otp(self, api_client):
        """Missing OTP field returns 422."""
        resp = api_client.post("/api/v1/auth/verify-email", json={"email": unique_email()})
        assert_validation_error(resp)

    def test_verify_email_wrong_format_otp(self, api_client):
        """Non-6-digit OTP returns 422."""
        resp = api_client.verify_email(unique_email(), "12345")  # 5 digits
        assert_validation_error(resp)

    def test_verify_email_non_numeric_otp(self, api_client):
        """Non-numeric OTP returns 422."""
        resp = api_client.verify_email(unique_email(), "abcdef")
        assert_validation_error(resp)
