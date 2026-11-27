"""Tests for user profile endpoints (GET/PUT /api/v1/users/profile)."""

import pytest
from concurrent.futures import ThreadPoolExecutor

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

    def test_update_profile_latitude_without_longitude_returns_422(
        self, api_client, auth_headers
    ):
        """Submitting latitude alone (no longitude) is rejected. Regression test:
        both were independently optional with no cross-field constraint, so a
        client could update one and leave the other stale/mismatched — timezone
        is only recalculated when both are present together."""
        resp = api_client.put(
            PROFILE_URL,
            json={"latitude": 25.2048},
            headers=auth_headers,
        )
        assert_validation_error(resp)

    def test_update_profile_longitude_without_latitude_returns_422(
        self, api_client, auth_headers
    ):
        """Submitting longitude alone (no latitude) is rejected."""
        resp = api_client.put(
            PROFILE_URL,
            json={"longitude": 55.2708},
            headers=auth_headers,
        )
        assert_validation_error(resp)

    def test_update_profile_latitude_and_longitude_together_succeeds(
        self, api_client, auth_headers
    ):
        """Submitting both together succeeds and derives a timezone."""
        resp = api_client.put(
            PROFILE_URL,
            json={"latitude": 25.2048, "longitude": 55.2708},
            headers=auth_headers,
        )
        body = assert_success(resp)
        assert body["data"]["latitude"] == 25.2048
        assert body["data"]["longitude"] == 55.2708
        assert body["data"]["timezone"]

    def test_update_profile_latitude_out_of_range_returns_422(
        self, api_client, auth_headers
    ):
        """Latitude outside [-90, 90] is rejected."""
        resp = api_client.put(
            PROFILE_URL,
            json={"latitude": 91, "longitude": 0},
            headers=auth_headers,
        )
        assert_validation_error(resp)

    def test_update_profile_longitude_out_of_range_returns_422(
        self, api_client, auth_headers
    ):
        """Longitude outside [-180, 180] is rejected."""
        resp = api_client.put(
            PROFILE_URL,
            json={"latitude": 0, "longitude": 181},
            headers=auth_headers,
        )
        assert_validation_error(resp)

    def test_update_profile_sql_injection_in_city_returns_422_or_sanitized(
        self, api_client, auth_headers
    ):
        """A SQL-injection-shaped city value is either rejected or stored as a
        harmless literal string (parameterized queries via Prisma prevent
        injection regardless; this just confirms no crash/500)."""
        resp = api_client.put(
            PROFILE_URL,
            json={"city": "'; DROP TABLE users; --"},
            headers=auth_headers,
        )
        assert resp.status_code in (200, 422), f"Unexpected status: {resp.status_code}"

    def test_update_profile_malformed_json_returns_400(self, api_client, auth_headers):
        """A request body that isn't valid JSON returns 400, not 500."""
        resp = api_client.session.put(
            f"{api_client.base_url}{PROFILE_URL}",
            data='{"displayName":"bad',
            headers={**auth_headers, "Content-Type": "application/json"},
        )
        assert resp.status_code == 400
        assert resp.json()["error"]["code"] == "INVALID_JSON"

    def test_concurrent_profile_updates_never_500(self, api_client, auth_headers):
        """10 parallel profile updates for the same user must never 500."""

        def attempt(i):
            return api_client.put(
                PROFILE_URL, json={"age": 20 + i}, headers=auth_headers
            )

        with ThreadPoolExecutor(max_workers=10) as pool:
            responses = list(pool.map(attempt, range(10)))

        status_codes = [r.status_code for r in responses]
        assert 500 not in status_codes, f"Got a 500 in concurrent update: {status_codes}"
        assert all(c == 200 for c in status_codes), f"Expected all 200s, got: {status_codes}"
