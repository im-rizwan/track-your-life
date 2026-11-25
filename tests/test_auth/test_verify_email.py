"""Tests for POST /api/v1/auth/verify-email."""

import pytest
from concurrent.futures import ThreadPoolExecutor

from utils.auth_helpers import unique_email
from utils.db import get_latest_otp, get_user_field, expire_otp
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

    def test_verify_email_expired_otp_returns_422(self, api_client, db_connection):
        """An OTP past its expiresAt is rejected, even if the value is correct."""
        email = unique_email()
        api_client.register(email, "Test@12345")
        db_connection.commit()

        otp = get_latest_otp(db_connection, email, "EMAIL_VERIFICATION")
        expire_otp(db_connection, email, "EMAIL_VERIFICATION")
        db_connection.commit()

        resp = api_client.verify_email(email, otp)
        assert_validation_error(resp)

    def test_verify_email_rejects_otp_from_different_purpose(self, api_client, db_connection):
        """A valid PASSWORD_RESET OTP must not verify an email — purposes are isolated."""
        email = unique_email()
        api_client.register(email, "Test@12345")
        db_connection.commit()

        api_client.forgot_password(email)
        db_connection.commit()
        reset_otp = get_latest_otp(db_connection, email, "PASSWORD_RESET")

        resp = api_client.verify_email(email, reset_otp)
        assert_validation_error(resp)

    def test_verify_email_rejects_otp_from_different_user(self, api_client, db_connection):
        """User A's OTP must not verify user B's email."""
        email_a = unique_email()
        email_b = unique_email()
        api_client.register(email_a, "Test@12345")
        api_client.register(email_b, "Test@12345")
        db_connection.commit()

        otp_a = get_latest_otp(db_connection, email_a, "EMAIL_VERIFICATION")

        resp = api_client.verify_email(email_b, otp_a)
        assert_validation_error(resp)

    def test_verify_email_case_insensitive_email_match(self, api_client, db_connection):
        """Verifying with an uppercased version of the registered email still works."""
        email = unique_email()
        api_client.register(email, "Test@12345")
        db_connection.commit()

        otp = get_latest_otp(db_connection, email, "EMAIL_VERIFICATION")
        resp = api_client.verify_email(email.upper(), otp)
        assert_success(resp)

    def test_verify_email_malformed_json_returns_400(self, api_client):
        """A request body that isn't valid JSON returns 400, not 500."""
        resp = api_client.session.post(
            f"{api_client.base_url}/api/v1/auth/verify-email",
            data='{"email":"bad',
            headers={"Content-Type": "application/json"},
        )
        assert resp.status_code == 400
        assert resp.json()["error"]["code"] == "INVALID_JSON"


class TestVerifyEmailConcurrency:
    """Race-condition handling for concurrent verification of the same OTP."""

    def test_concurrent_verify_same_otp_never_500(self, api_client, db_connection):
        """10 parallel verify-email calls with the same valid OTP must yield exactly
        one 200 and never a 500. The losers land on either 409 (lost the race on the
        isEmailVerified check) or 422 (lost the race on claiming the OTP) depending on
        timing — both are correct outcomes, since AuthService checks isEmailVerified
        before atomically claiming the OTP, so which guard a given loser trips on is
        timing-dependent. What must never happen is two winners (which would mean two
        valid token pairs issued for a single OTP) or a raw 500."""
        email = unique_email()
        api_client.register(email, "Test@12345")
        db_connection.commit()
        otp = get_latest_otp(db_connection, email, "EMAIL_VERIFICATION")

        def attempt():
            return api_client.verify_email(email, otp)

        with ThreadPoolExecutor(max_workers=10) as pool:
            responses = list(pool.map(lambda _: attempt(), range(10)))

        status_codes = [r.status_code for r in responses]
        assert status_codes.count(200) == 1, f"Expected exactly one 200, got: {status_codes}"
        assert status_codes.count(409) + status_codes.count(422) == 9, (
            f"Expected the other nine to be 409 or 422, got: {status_codes}"
        )
        assert 500 not in status_codes, f"Got a 500 in concurrent verification: {status_codes}"


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

    def test_verify_email_otp_too_short(self, api_client):
        """5-digit OTP returns 422."""
        resp = api_client.verify_email(unique_email(), "12345")
        assert_validation_error(resp)

    def test_verify_email_otp_too_long(self, api_client):
        """7-digit OTP returns 422."""
        resp = api_client.verify_email(unique_email(), "1234567")
        assert_validation_error(resp)

    def test_verify_email_non_numeric_otp(self, api_client):
        """Non-numeric OTP returns 422."""
        resp = api_client.verify_email(unique_email(), "abcdef")
        assert_validation_error(resp)

    def test_verify_email_otp_with_whitespace_rejected(self, api_client):
        """An OTP padded with whitespace is rejected, not silently trimmed."""
        resp = api_client.verify_email(unique_email(), " 123456 ")
        assert_validation_error(resp)
