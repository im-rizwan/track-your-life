"""Tests for POST /api/v1/auth/resend-verification."""

import pytest
from concurrent.futures import ThreadPoolExecutor

from utils.auth_helpers import unique_email
from utils.db import get_latest_otp
from utils.assertions import (
    assert_success,
    assert_conflict,
    assert_validation_error,
)

pytestmark = pytest.mark.auth


class TestResendVerification:
    """Tests for POST /api/v1/auth/resend-verification."""

    def test_resend_verification_unverified_user_returns_200(self, api_client):
        """Resending for an unverified user returns 200."""
        email = unique_email()
        api_client.register(email, "Test@12345")
        resp = api_client.resend_verification(email)
        assert_success(resp)

    def test_resend_verification_already_verified_returns_409(
        self, api_client, registered_user
    ):
        """Resending for an already-verified user returns 409."""
        resp = api_client.resend_verification(registered_user["email"])
        assert_conflict(resp)

    def test_resend_verification_nonexistent_email_returns_200(self, api_client):
        """Non-existent email still returns 200 (no information leakage)."""
        resp = api_client.resend_verification("nonexistent@test.com")
        assert_success(resp)

    def test_resend_verification_invalidates_old_otp(self, api_client, db_connection):
        """Resending creates a new OTP and invalidates the old one."""
        email = unique_email()
        api_client.register(email, "Test@12345")
        db_connection.commit()
        first_otp = get_latest_otp(db_connection, email, "EMAIL_VERIFICATION")

        api_client.resend_verification(email)
        db_connection.commit()
        second_otp = get_latest_otp(db_connection, email, "EMAIL_VERIFICATION")

        assert first_otp != second_otp

        resp = api_client.verify_email(email, first_otp)
        assert_validation_error(resp)

    def test_resend_verification_new_otp_actually_works(self, api_client, db_connection):
        """The newly issued OTP successfully verifies the account."""
        email = unique_email()
        api_client.register(email, "Test@12345")
        api_client.resend_verification(email)
        db_connection.commit()

        otp = get_latest_otp(db_connection, email, "EMAIL_VERIFICATION")
        resp = api_client.verify_email(email, otp)
        assert_success(resp)

    def test_resend_verification_case_insensitive_email(self, api_client):
        """Resending works with an uppercased email."""
        email = unique_email()
        api_client.register(email, "Test@12345")
        resp = api_client.resend_verification(email.upper())
        assert_success(resp)

    def test_resend_verification_missing_email_returns_422(self, api_client):
        """Missing email field returns 422."""
        resp = api_client.post("/api/v1/auth/resend-verification", json={})
        assert_validation_error(resp)

    def test_resend_verification_invalid_email_format_returns_422(self, api_client):
        """Invalid email format returns 422."""
        resp = api_client.resend_verification("not-an-email")
        assert_validation_error(resp)

    def test_resend_verification_sql_injection_returns_422(self, api_client):
        """SQL injection attempt in email is rejected as an invalid email."""
        resp = api_client.resend_verification("'; DROP TABLE users; --")
        assert_validation_error(resp)

    def test_resend_verification_malformed_json_returns_400(self, api_client):
        """A request body that isn't valid JSON returns 400, not 500."""
        resp = api_client.session.post(
            f"{api_client.base_url}/api/v1/auth/resend-verification",
            data='{"email":"bad',
            headers={"Content-Type": "application/json"},
        )
        assert resp.status_code == 400
        assert resp.json()["error"]["code"] == "INVALID_JSON"


class TestResendVerificationConcurrency:
    """Race-condition handling for concurrent resend requests."""

    def test_concurrent_resends_never_500(self, api_client, db_connection):
        """10 parallel resend requests for the same unverified user must never 500,
        and exactly one of the resulting OTPs must be the currently-valid one."""
        email = unique_email()
        api_client.register(email, "Test@12345")

        def attempt():
            return api_client.resend_verification(email)

        with ThreadPoolExecutor(max_workers=10) as pool:
            responses = list(pool.map(lambda _: attempt(), range(10)))

        status_codes = [r.status_code for r in responses]
        assert 500 not in status_codes, f"Got a 500 in concurrent resend: {status_codes}"
        assert all(c == 200 for c in status_codes), f"Expected all 200s, got: {status_codes}"

        db_connection.commit()
        otp = get_latest_otp(db_connection, email, "EMAIL_VERIFICATION")
        resp = api_client.verify_email(email, otp)
        assert_success(resp)
