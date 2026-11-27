"""Tests for email change endpoints (POST /api/v1/users/email/request and .../confirm)."""

import pytest
from concurrent.futures import ThreadPoolExecutor

from utils.assertions import (
    assert_success,
    assert_conflict,
    assert_unauthorized,
    assert_validation_error,
)
from utils.auth_helpers import (
    create_verified_user,
    get_auth_headers,
    login_user,
    unique_email,
)
from utils.db import get_latest_otp, expire_otp

pytestmark = pytest.mark.users

EMAIL_REQUEST_URL = "/api/v1/users/email/request"
EMAIL_CONFIRM_URL = "/api/v1/users/email/confirm"


class TestEmailChangeRequest:
    """Tests for POST /api/v1/users/email/request."""

    def test_email_change_request_valid_email_returns_200(
        self, api_client, auth_headers
    ):
        """Requesting an email change with a valid, unused email returns 200."""
        new_email = unique_email()
        resp = api_client.post(
            EMAIL_REQUEST_URL,
            json={"newEmail": new_email},
            headers=auth_headers,
        )

        body = assert_success(resp)
        assert "message" in body["data"]

    def test_email_change_request_taken_email_returns_409(
        self, api_client, auth_headers, second_user
    ):
        """Requesting a change to an email that belongs to another user returns 409."""
        resp = api_client.post(
            EMAIL_REQUEST_URL,
            json={"newEmail": second_user["email"]},
            headers=auth_headers,
        )

        assert_conflict(resp)

    def test_email_change_request_creates_otp(
        self, api_client, registered_user, db_connection
    ):
        """A successful email change request creates an EMAIL_CHANGE OTP in the database."""
        headers = get_auth_headers(registered_user["tokens"])
        new_email = unique_email()

        resp = api_client.post(
            EMAIL_REQUEST_URL,
            json={"newEmail": new_email},
            headers=headers,
        )
        assert_success(resp)

        db_connection.commit()
        otp = get_latest_otp(db_connection, registered_user["email"], "EMAIL_CHANGE")
        assert otp is not None
        assert len(otp) == 6
        assert otp.isdigit()

    def test_email_change_request_invalid_email_returns_422(
        self, api_client, auth_headers
    ):
        """Requesting a change with a malformed email returns 422."""
        resp = api_client.post(
            EMAIL_REQUEST_URL,
            json={"newEmail": "not-an-email"},
            headers=auth_headers,
        )

        assert_validation_error(resp)

    def test_email_change_request_requires_auth(self, api_client):
        """Email change request without authentication returns 401."""
        resp = api_client.post(
            EMAIL_REQUEST_URL,
            json={"newEmail": unique_email()},
        )

        assert_unauthorized(resp)

    def test_email_change_request_missing_email_returns_422(
        self, api_client, auth_headers
    ):
        """Omitting the newEmail field returns 422."""
        resp = api_client.post(
            EMAIL_REQUEST_URL,
            json={},
            headers=auth_headers,
        )

        assert_validation_error(resp)

    def test_email_change_request_to_own_current_email_returns_409(
        self, api_client, registered_user
    ):
        """Requesting a change to your own current email is rejected (it already
        "exists" — belongs to you), not accepted as a no-op."""
        headers = get_auth_headers(registered_user["tokens"])
        resp = api_client.post(
            EMAIL_REQUEST_URL,
            json={"newEmail": registered_user["email"]},
            headers=headers,
        )
        assert_conflict(resp)

    def test_email_change_request_sql_injection_returns_422(self, api_client, auth_headers):
        """SQL injection attempt in newEmail is rejected as an invalid email."""
        resp = api_client.post(
            EMAIL_REQUEST_URL,
            json={"newEmail": "'; DROP TABLE users; --"},
            headers=auth_headers,
        )
        assert_validation_error(resp)

    def test_email_change_request_malformed_json_returns_400(self, api_client, auth_headers):
        """A request body that isn't valid JSON returns 400, not 500."""
        resp = api_client.session.post(
            f"{api_client.base_url}{EMAIL_REQUEST_URL}",
            data='{"newEmail":"bad',
            headers={**auth_headers, "Content-Type": "application/json"},
        )
        assert resp.status_code == 400
        assert resp.json()["error"]["code"] == "INVALID_JSON"


class TestEmailChangeConfirm:
    """Tests for POST /api/v1/users/email/confirm."""

    def _request_email_change(self, api_client, headers, db_connection, email):
        """Helper: request an email change and return the OTP from the database."""
        new_email = unique_email()
        resp = api_client.post(
            EMAIL_REQUEST_URL,
            json={"newEmail": new_email},
            headers=headers,
        )
        assert resp.status_code == 200, f"Email change request failed: {resp.text}"

        db_connection.commit()
        otp = get_latest_otp(db_connection, email, "EMAIL_CHANGE")
        assert otp is not None, "No EMAIL_CHANGE OTP found in database"
        return new_email, otp

    def test_email_change_confirm_valid_otp_updates_email(
        self, api_client, registered_user, db_connection
    ):
        """Confirming with a valid OTP updates the user's email address."""
        headers = get_auth_headers(registered_user["tokens"])
        new_email, otp = self._request_email_change(
            api_client, headers, db_connection, registered_user["email"]
        )

        resp = api_client.post(
            EMAIL_CONFIRM_URL,
            json={"otp": otp},
            headers=headers,
        )

        body = assert_success(resp)
        assert "message" in body["data"]

        # Verify the profile now shows the new email
        profile_resp = api_client.get("/api/v1/users/profile", headers=headers)
        profile_body = assert_success(profile_resp)
        assert profile_body["data"]["email"] == new_email

    def test_email_change_confirm_can_login_with_new_email(
        self, api_client, db_connection
    ):
        """After confirming email change, the user can log in with the new email."""
        user_data = create_verified_user(api_client, db_connection)
        headers = get_auth_headers(user_data["tokens"])
        new_email, otp = self._request_email_change(
            api_client, headers, db_connection, user_data["email"]
        )

        # Confirm the email change
        resp = api_client.post(
            EMAIL_CONFIRM_URL,
            json={"otp": otp},
            headers=headers,
        )
        assert_success(resp)

        # Login with the new email should succeed
        login_data = login_user(api_client, new_email, user_data["password"])
        assert login_data["tokens"]["accessToken"] is not None

    def test_email_change_confirm_invalid_otp_returns_422(
        self, api_client, auth_headers
    ):
        """Confirming with an incorrect OTP returns 422."""
        resp = api_client.post(
            EMAIL_CONFIRM_URL,
            json={"otp": "000000"},
            headers=auth_headers,
        )

        assert_validation_error(resp)

    def test_email_change_confirm_missing_otp_returns_422(
        self, api_client, auth_headers
    ):
        """Omitting the otp field returns 422."""
        resp = api_client.post(
            EMAIL_CONFIRM_URL,
            json={},
            headers=auth_headers,
        )

        assert_validation_error(resp)

    def test_email_change_confirm_requires_auth(self, api_client):
        """Email change confirm without authentication returns 401."""
        resp = api_client.post(
            EMAIL_CONFIRM_URL,
            json={"otp": "123456"},
        )

        assert_unauthorized(resp)

    def test_email_change_confirm_otp_reuse_fails(
        self, api_client, db_connection
    ):
        """A used OTP cannot be reused for a second confirmation."""
        user_data = create_verified_user(api_client, db_connection)
        headers = get_auth_headers(user_data["tokens"])
        _new_email, otp = self._request_email_change(
            api_client, headers, db_connection, user_data["email"]
        )

        # First confirmation succeeds
        resp = api_client.post(
            EMAIL_CONFIRM_URL,
            json={"otp": otp},
            headers=headers,
        )
        assert_success(resp)

        # Second confirmation with the same OTP must fail
        resp = api_client.post(
            EMAIL_CONFIRM_URL,
            json={"otp": otp},
            headers=headers,
        )

        assert_validation_error(resp)

    def test_email_change_confirm_expired_otp_returns_422(self, api_client, db_connection):
        """An OTP past its expiresAt is rejected, even with the correct value."""
        user_data = create_verified_user(api_client, db_connection)
        headers = get_auth_headers(user_data["tokens"])
        _new_email, otp = self._request_email_change(
            api_client, headers, db_connection, user_data["email"]
        )

        expire_otp(db_connection, user_data["email"], "EMAIL_CHANGE")
        db_connection.commit()

        resp = api_client.post(EMAIL_CONFIRM_URL, json={"otp": otp}, headers=headers)
        assert_validation_error(resp)

    def test_email_change_confirm_malformed_json_returns_400(self, api_client, auth_headers):
        """A request body that isn't valid JSON returns 400, not 500."""
        resp = api_client.session.post(
            f"{api_client.base_url}{EMAIL_CONFIRM_URL}",
            data='{"otp":"bad',
            headers={**auth_headers, "Content-Type": "application/json"},
        )
        assert resp.status_code == 400
        assert resp.json()["error"]["code"] == "INVALID_JSON"

    def test_concurrent_email_confirm_same_otp_never_500(self, api_client, db_connection):
        """10 parallel confirm calls with the same valid OTP must yield exactly
        one success and never a 500 — protected by the same atomic claimOtp()
        fix verified on verify-email and reset-password."""
        user_data = create_verified_user(api_client, db_connection)
        headers = get_auth_headers(user_data["tokens"])
        _new_email, otp = self._request_email_change(
            api_client, headers, db_connection, user_data["email"]
        )

        def attempt():
            return api_client.post(EMAIL_CONFIRM_URL, json={"otp": otp}, headers=headers)

        with ThreadPoolExecutor(max_workers=10) as pool:
            responses = list(pool.map(lambda _: attempt(), range(10)))

        status_codes = [r.status_code for r in responses]
        assert status_codes.count(200) == 1, f"Expected exactly one 200, got: {status_codes}"
        assert 500 not in status_codes, f"Got a 500 in concurrent confirm: {status_codes}"
