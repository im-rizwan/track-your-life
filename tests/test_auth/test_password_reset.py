"""Tests for forgot-password, resend-reset-otp, and reset-password endpoints."""

import pytest
from concurrent.futures import ThreadPoolExecutor

from utils.auth_helpers import unique_email, create_verified_user
from utils.db import get_latest_otp, expire_otp
from utils.assertions import (
    assert_success,
    assert_unauthorized,
    assert_validation_error,
)

pytestmark = pytest.mark.auth


class TestForgotPassword:
    """Tests for POST /api/v1/auth/forgot-password."""

    def test_forgot_password_existing_user_returns_200(self, api_client, registered_user):
        """Initiating password reset for a valid user returns 200."""
        resp = api_client.forgot_password(registered_user["email"])
        assert_success(resp)

    def test_forgot_password_nonexistent_email_returns_200(self, api_client):
        """Non-existent email still returns 200 (no information leakage)."""
        resp = api_client.forgot_password("nonexistent@test.com")
        assert_success(resp)

    def test_forgot_password_creates_otp(self, api_client, registered_user, db_connection):
        """Forgot password creates a PASSWORD_RESET OTP in the database."""
        api_client.forgot_password(registered_user["email"])
        db_connection.commit()

        otp = get_latest_otp(db_connection, registered_user["email"], "PASSWORD_RESET")
        assert otp is not None

    def test_forgot_password_missing_email_returns_422(self, api_client):
        """Missing email field returns 422."""
        resp = api_client.post("/api/v1/auth/forgot-password", json={})
        assert_validation_error(resp)

    def test_forgot_password_invalid_email_returns_422(self, api_client):
        """Invalid email format returns 422."""
        resp = api_client.forgot_password("not-an-email")
        assert_validation_error(resp)

    def test_forgot_password_case_insensitive_email(self, api_client, registered_user):
        """Forgot password works with an uppercased email."""
        resp = api_client.forgot_password(registered_user["email"].upper())
        assert_success(resp)

    def test_forgot_password_malformed_json_returns_400(self, api_client):
        """A request body that isn't valid JSON returns 400, not 500."""
        resp = api_client.session.post(
            f"{api_client.base_url}/api/v1/auth/forgot-password",
            data='{"email":"bad',
            headers={"Content-Type": "application/json"},
        )
        assert resp.status_code == 400
        assert resp.json()["error"]["code"] == "INVALID_JSON"


class TestResendResetOtp:
    """Tests for POST /api/v1/auth/resend-reset-otp."""

    def test_resend_reset_otp_returns_200(self, api_client, registered_user):
        """Resending reset OTP returns 200."""
        api_client.forgot_password(registered_user["email"])
        resp = api_client.resend_reset_otp(registered_user["email"])
        assert_success(resp)

    def test_resend_reset_otp_invalidates_old_otp(
        self, api_client, registered_user, db_connection
    ):
        """Resending creates a new OTP and invalidates the old one."""
        email = registered_user["email"]

        api_client.forgot_password(email)
        db_connection.commit()
        first_otp = get_latest_otp(db_connection, email, "PASSWORD_RESET")

        api_client.resend_reset_otp(email)
        db_connection.commit()
        second_otp = get_latest_otp(db_connection, email, "PASSWORD_RESET")

        assert first_otp != second_otp

        # Old OTP should no longer work for reset
        resp = api_client.reset_password(email, first_otp, "NewP@ss123")
        assert_validation_error(resp)

    def test_resend_reset_otp_nonexistent_email_returns_200(self, api_client):
        """Non-existent email still returns 200 (no information leakage)."""
        resp = api_client.resend_reset_otp("nonexistent@test.com")
        assert_success(resp)

    def test_resend_reset_otp_missing_email_returns_422(self, api_client):
        """Missing email returns 422."""
        resp = api_client.post("/api/v1/auth/resend-reset-otp", json={})
        assert_validation_error(resp)


class TestResetPassword:
    """Tests for POST /api/v1/auth/reset-password."""

    def test_reset_password_with_valid_otp_returns_200(
        self, api_client, registered_user, db_connection
    ):
        """Resetting password with a valid OTP returns 200."""
        email = registered_user["email"]
        api_client.forgot_password(email)
        db_connection.commit()

        otp = get_latest_otp(db_connection, email, "PASSWORD_RESET")
        resp = api_client.reset_password(email, otp, "NewP@ss123")
        assert_success(resp)

    def test_reset_password_can_login_with_new_password(
        self, api_client, registered_user, db_connection
    ):
        """After reset, user can log in with the new password."""
        email = registered_user["email"]
        new_password = "NewP@ss123"

        api_client.forgot_password(email)
        db_connection.commit()

        otp = get_latest_otp(db_connection, email, "PASSWORD_RESET")
        api_client.reset_password(email, otp, new_password)

        resp = api_client.login(email, new_password)
        assert_success(resp)

    def test_reset_password_old_password_no_longer_works(
        self, api_client, registered_user, db_connection
    ):
        """After reset, the old password is rejected."""
        email = registered_user["email"]
        old_password = registered_user["password"]

        api_client.forgot_password(email)
        db_connection.commit()

        otp = get_latest_otp(db_connection, email, "PASSWORD_RESET")
        api_client.reset_password(email, otp, "NewP@ss123")

        resp = api_client.login(email, old_password)
        assert_unauthorized(resp)

    def test_reset_password_invalidates_all_refresh_tokens(
        self, api_client, registered_user, db_connection
    ):
        """Password reset invalidates all existing refresh tokens."""
        email = registered_user["email"]
        old_refresh_token = registered_user["tokens"]["refreshToken"]

        api_client.forgot_password(email)
        db_connection.commit()

        otp = get_latest_otp(db_connection, email, "PASSWORD_RESET")
        api_client.reset_password(email, otp, "NewP@ss123")

        # Old refresh token should no longer work
        resp = api_client.refresh(old_refresh_token)
        assert_unauthorized(resp)

    def test_reset_password_invalid_otp_returns_422(
        self, api_client, registered_user, db_connection
    ):
        """Invalid OTP returns 422."""
        email = registered_user["email"]
        api_client.forgot_password(email)
        db_connection.commit()

        resp = api_client.reset_password(email, "000000", "NewP@ss123")
        assert_validation_error(resp)

    def test_reset_password_otp_reuse_returns_422(
        self, api_client, registered_user, db_connection
    ):
        """Re-using an already consumed OTP returns 422."""
        email = registered_user["email"]
        api_client.forgot_password(email)
        db_connection.commit()

        otp = get_latest_otp(db_connection, email, "PASSWORD_RESET")
        api_client.reset_password(email, otp, "NewP@ss123")

        # Try to reuse the same OTP
        resp = api_client.reset_password(email, otp, "An0ther@Pass")
        assert_validation_error(resp)

    def test_reset_password_weak_new_password_returns_422(
        self, api_client, registered_user, db_connection
    ):
        """New password that does not meet complexity rules is rejected."""
        email = registered_user["email"]
        api_client.forgot_password(email)
        db_connection.commit()

        otp = get_latest_otp(db_connection, email, "PASSWORD_RESET")
        resp = api_client.reset_password(email, otp, "weak")
        assert_validation_error(resp)

    def test_reset_password_missing_email_returns_422(self, api_client):
        """Missing email field returns 422."""
        resp = api_client.post(
            "/api/v1/auth/reset-password",
            json={"otp": "123456", "newPassword": "NewP@ss123"},
        )
        assert_validation_error(resp)

    def test_reset_password_missing_otp_returns_422(self, api_client):
        """Missing OTP field returns 422."""
        resp = api_client.post(
            "/api/v1/auth/reset-password",
            json={"email": unique_email(), "newPassword": "NewP@ss123"},
        )
        assert_validation_error(resp)

    def test_reset_password_missing_new_password_returns_422(self, api_client):
        """Missing newPassword field returns 422."""
        resp = api_client.post(
            "/api/v1/auth/reset-password",
            json={"email": unique_email(), "otp": "123456"},
        )
        assert_validation_error(resp)

    def test_reset_password_nonexistent_email_returns_422(self, api_client):
        """Reset for a non-existent email returns 422."""
        resp = api_client.reset_password("nobody@nowhere.com", "123456", "NewP@ss123")
        assert_validation_error(resp)

    def test_reset_password_expired_otp_returns_422(
        self, api_client, registered_user, db_connection
    ):
        """An OTP past its expiresAt is rejected, even with the correct value."""
        email = registered_user["email"]
        api_client.forgot_password(email)
        db_connection.commit()

        otp = get_latest_otp(db_connection, email, "PASSWORD_RESET")
        expire_otp(db_connection, email, "PASSWORD_RESET")
        db_connection.commit()

        resp = api_client.reset_password(email, otp, "NewP@ss123")
        assert_validation_error(resp)

    def test_reset_password_rejects_otp_from_different_user(
        self, api_client, registered_user, second_user, db_connection
    ):
        """User A's reset OTP must not reset user B's password."""
        api_client.forgot_password(registered_user["email"])
        db_connection.commit()
        otp_a = get_latest_otp(db_connection, registered_user["email"], "PASSWORD_RESET")

        resp = api_client.reset_password(second_user["email"], otp_a, "NewP@ss123")
        assert_validation_error(resp)

    def test_reset_password_case_insensitive_email(
        self, api_client, registered_user, db_connection
    ):
        """Resetting works when the email is uppercased."""
        email = registered_user["email"]
        api_client.forgot_password(email)
        db_connection.commit()

        otp = get_latest_otp(db_connection, email, "PASSWORD_RESET")
        resp = api_client.reset_password(email.upper(), otp, "NewP@ss123")
        assert_success(resp)

    def test_reset_password_malformed_json_returns_400(self, api_client):
        """A request body that isn't valid JSON returns 400, not 500."""
        resp = api_client.session.post(
            f"{api_client.base_url}/api/v1/auth/reset-password",
            data='{"email":"bad',
            headers={"Content-Type": "application/json"},
        )
        assert resp.status_code == 400
        assert resp.json()["error"]["code"] == "INVALID_JSON"


class TestResetPasswordConcurrency:
    """Race-condition handling for concurrent password resets with the same OTP."""

    def test_concurrent_reset_same_otp_never_500(
        self, api_client, registered_user, db_connection
    ):
        """10 parallel reset-password calls with the same valid OTP must yield
        exactly one 200 and never a 500 — protected by the same atomic claimOtp()
        fix verified on verify-email."""
        email = registered_user["email"]
        api_client.forgot_password(email)
        db_connection.commit()
        otp = get_latest_otp(db_connection, email, "PASSWORD_RESET")

        def attempt():
            return api_client.reset_password(email, otp, "NewP@ss123")

        with ThreadPoolExecutor(max_workers=10) as pool:
            responses = list(pool.map(lambda _: attempt(), range(10)))

        status_codes = [r.status_code for r in responses]
        assert status_codes.count(200) == 1, f"Expected exactly one 200, got: {status_codes}"
        assert 500 not in status_codes, f"Got a 500 in concurrent reset: {status_codes}"


class TestResendResetOtpExtra:
    """Additional edge cases for resend-reset-otp."""

    def test_resend_reset_otp_case_insensitive_email(self, api_client, registered_user):
        """Resend works with an uppercased email."""
        api_client.forgot_password(registered_user["email"])
        resp = api_client.resend_reset_otp(registered_user["email"].upper())
        assert_success(resp)

    def test_resend_reset_otp_malformed_json_returns_400(self, api_client):
        """A request body that isn't valid JSON returns 400, not 500."""
        resp = api_client.session.post(
            f"{api_client.base_url}/api/v1/auth/resend-reset-otp",
            data='{"email":"bad',
            headers={"Content-Type": "application/json"},
        )
        assert resp.status_code == 400
        assert resp.json()["error"]["code"] == "INVALID_JSON"
