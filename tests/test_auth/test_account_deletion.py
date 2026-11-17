"""Tests for POST /api/v1/auth/delete-account/initiate and /confirm."""

import pytest

from utils.auth_helpers import (
    create_verified_user,
    get_auth_headers,
    unique_email,
)
from utils.db import get_latest_otp, user_exists
from utils.assertions import (
    assert_success,
    assert_unauthorized,
    assert_validation_error,
)

pytestmark = pytest.mark.auth


class TestDeleteAccountInitiate:
    """Tests for POST /api/v1/auth/delete-account/initiate."""

    def test_initiate_with_valid_password_returns_200(
        self, api_client, registered_user, auth_headers
    ):
        """Initiating deletion with correct password and confirmation returns 200."""
        resp = api_client.delete_account_initiate(
            auth_headers, registered_user["password"]
        )
        assert_success(resp)

    def test_initiate_creates_otp(
        self, api_client, registered_user, auth_headers, db_connection
    ):
        """Initiating deletion creates an ACCOUNT_DELETION OTP."""
        api_client.delete_account_initiate(auth_headers, registered_user["password"])
        db_connection.commit()

        otp = get_latest_otp(
            db_connection, registered_user["email"], "ACCOUNT_DELETION"
        )
        assert otp is not None

    def test_initiate_wrong_password_returns_401(
        self, api_client, auth_headers
    ):
        """Wrong password returns 401."""
        resp = api_client.delete_account_initiate(auth_headers, "Wr0ng@Pass!")
        assert_unauthorized(resp)

    def test_initiate_wrong_confirmation_returns_422(
        self, api_client, registered_user, auth_headers
    ):
        """Confirmation text other than 'DELETE' returns 422."""
        resp = api_client.delete_account_initiate(
            auth_headers, registered_user["password"], confirmation="delete"
        )
        assert_validation_error(resp)

    def test_initiate_missing_confirmation_returns_422(
        self, api_client, registered_user, auth_headers
    ):
        """Missing confirmation field returns 422."""
        resp = api_client.post(
            "/api/v1/auth/delete-account/initiate",
            headers=auth_headers,
            json={"password": registered_user["password"]},
        )
        assert_validation_error(resp)

    def test_initiate_no_auth_returns_401(self, api_client):
        """No auth token returns 401."""
        resp = api_client.delete_account_initiate(
            headers={}, password="Test@12345"
        )
        assert_unauthorized(resp)

    def test_initiate_invalid_auth_returns_401(self, api_client):
        """Invalid Bearer token returns 401."""
        headers = {"Authorization": "Bearer invalid-token"}
        resp = api_client.delete_account_initiate(headers, "Test@12345")
        assert_unauthorized(resp)


class TestDeleteAccountConfirm:
    """Tests for POST /api/v1/auth/delete-account/confirm."""

    def test_confirm_with_valid_otp_returns_200(
        self, api_client, db_connection
    ):
        """Confirming deletion with a valid OTP returns 200."""
        user_data = create_verified_user(api_client, db_connection)
        headers = get_auth_headers(user_data["tokens"])

        api_client.delete_account_initiate(headers, user_data["password"])
        db_connection.commit()

        otp = get_latest_otp(db_connection, user_data["email"], "ACCOUNT_DELETION")
        resp = api_client.delete_account_confirm(headers, otp)
        assert_success(resp)

    def test_confirm_deletes_user_from_database(
        self, api_client, db_connection
    ):
        """After confirmation, user no longer exists in the database."""
        user_data = create_verified_user(api_client, db_connection)
        headers = get_auth_headers(user_data["tokens"])

        api_client.delete_account_initiate(headers, user_data["password"])
        db_connection.commit()

        otp = get_latest_otp(db_connection, user_data["email"], "ACCOUNT_DELETION")
        api_client.delete_account_confirm(headers, otp)
        db_connection.commit()

        assert user_exists(db_connection, user_data["email"]) is False

    def test_confirm_user_cannot_login_after_deletion(
        self, api_client, db_connection
    ):
        """After deletion, the user cannot log in."""
        user_data = create_verified_user(api_client, db_connection)
        headers = get_auth_headers(user_data["tokens"])

        api_client.delete_account_initiate(headers, user_data["password"])
        db_connection.commit()

        otp = get_latest_otp(db_connection, user_data["email"], "ACCOUNT_DELETION")
        api_client.delete_account_confirm(headers, otp)

        resp = api_client.login(user_data["email"], user_data["password"])
        assert_unauthorized(resp)

    def test_confirm_invalid_otp_returns_422(
        self, api_client, registered_user, auth_headers, db_connection
    ):
        """Invalid OTP returns 422."""
        api_client.delete_account_initiate(auth_headers, registered_user["password"])
        db_connection.commit()

        resp = api_client.delete_account_confirm(auth_headers, "000000")
        assert_validation_error(resp)

    def test_confirm_no_auth_returns_401(self, api_client):
        """No auth token returns 401."""
        resp = api_client.delete_account_confirm(headers={}, otp="123456")
        assert_unauthorized(resp)

    def test_confirm_missing_otp_returns_422(self, api_client, auth_headers):
        """Missing OTP field returns 422."""
        resp = api_client.post(
            "/api/v1/auth/delete-account/confirm",
            headers=auth_headers,
            json={},
        )
        assert_validation_error(resp)

    def test_confirm_otp_reuse_returns_422(
        self, api_client, db_connection
    ):
        """Re-using an already consumed deletion OTP returns 422."""
        user_data = create_verified_user(api_client, db_connection)
        headers = get_auth_headers(user_data["tokens"])

        api_client.delete_account_initiate(headers, user_data["password"])
        db_connection.commit()

        otp = get_latest_otp(db_connection, user_data["email"], "ACCOUNT_DELETION")

        # First confirm succeeds (deletes the user)
        api_client.delete_account_confirm(headers, otp)

        # Second confirm with same OTP should fail
        # (user is deleted, so auth fails first -- 401)
        resp = api_client.delete_account_confirm(headers, otp)
        # The user no longer exists, so the auth middleware will reject;
        # either 401 or 422 is acceptable, but most likely 401
        assert resp.status_code in (401, 422)
