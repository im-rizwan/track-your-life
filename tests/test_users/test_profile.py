"""Tests for user profile endpoints (GET/PUT /api/v1/users/profile)."""

import pytest

from utils.assertions import (
    assert_success,
    assert_unauthorized,
    assert_validation_error,
)

pytestmark = pytest.mark.users

PROFILE_URL = "/api/v1/users/profile"


class TestGetProfile:
    """Tests for GET /api/v1/users/profile."""

    def test_get_profile_returns_200(self, api_client, auth_headers, registered_user):
        """Authenticated user can retrieve their profile successfully."""
        resp = api_client.get(PROFILE_URL, headers=auth_headers)

        body = assert_success(resp)
        data = body["data"]
        assert data["email"] == registered_user["email"]
        assert "id" in data

    def test_get_profile_excludes_password(self, api_client, auth_headers):
        """Profile response must never contain the password field."""
        resp = api_client.get(PROFILE_URL, headers=auth_headers)

        body = assert_success(resp)
        data = body["data"]
        assert "password" not in data

    def test_get_profile_no_auth_returns_401(self, api_client):
        """Accessing profile without an Authorization header returns 401."""
        resp = api_client.get(PROFILE_URL)

        assert_unauthorized(resp)


class TestUpdateProfile:
    """Tests for PUT /api/v1/users/profile."""

    def test_update_profile_valid_data_returns_200(self, api_client, auth_headers):
        """Updating profile with all valid fields returns 200 and updated data."""
        payload = {
            "displayName": "Updated Name",
            "age": 30,
            "city": "London",
            "country": "United Kingdom",
        }
        resp = api_client.put(PROFILE_URL, json=payload, headers=auth_headers)

        body = assert_success(resp)
        data = body["data"]
        assert data["displayName"] == "Updated Name"
        assert data["age"] == 30
        assert data["city"] == "London"
        assert data["country"] == "United Kingdom"

    def test_update_profile_partial_update(self, api_client, auth_headers):
        """Updating only a subset of fields succeeds without affecting others."""
        # First set a known state
        api_client.put(
            PROFILE_URL,
            json={"displayName": "Original Name", "age": 25},
            headers=auth_headers,
        )

        # Now update only the age
        resp = api_client.put(
            PROFILE_URL,
            json={"age": 35},
            headers=auth_headers,
        )

        body = assert_success(resp)
        data = body["data"]
        assert data["age"] == 35
        # displayName should remain unchanged
        assert data["displayName"] == "Original Name"

    def test_update_profile_display_name_too_short_returns_422(
        self, api_client, auth_headers
    ):
        """Display name shorter than 2 characters is rejected with 422."""
        resp = api_client.put(
            PROFILE_URL,
            json={"displayName": "A"},
            headers=auth_headers,
        )

        assert_validation_error(resp)

    def test_update_profile_display_name_too_long_returns_422(
        self, api_client, auth_headers
    ):
        """Display name longer than 50 characters is rejected with 422."""
        resp = api_client.put(
            PROFILE_URL,
            json={"displayName": "A" * 51},
            headers=auth_headers,
        )

        assert_validation_error(resp)

    def test_update_profile_age_below_6_returns_422(self, api_client, auth_headers):
        """Age below the minimum of 6 is rejected with 422."""
        resp = api_client.put(
            PROFILE_URL,
            json={"age": 5},
            headers=auth_headers,
        )

        assert_validation_error(resp)

    def test_update_profile_age_above_120_returns_422(self, api_client, auth_headers):
        """Age above the maximum of 120 is rejected with 422."""
        resp = api_client.put(
            PROFILE_URL,
            json={"age": 121},
            headers=auth_headers,
        )

        assert_validation_error(resp)

    def test_update_profile_no_auth_returns_401(self, api_client):
        """Updating profile without authentication returns 401."""
        resp = api_client.put(
            PROFILE_URL,
            json={"displayName": "No Auth"},
        )

        assert_unauthorized(resp)
