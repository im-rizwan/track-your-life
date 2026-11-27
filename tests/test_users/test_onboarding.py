"""Tests for user onboarding endpoints (POST /api/v1/users/onboarding, GET .../status)."""

import pytest

from utils.assertions import (
    assert_success,
    assert_conflict,
    assert_unauthorized,
    assert_validation_error,
)
from utils.auth_helpers import get_auth_headers
from utils.factories import onboarding_payload

pytestmark = pytest.mark.users

ONBOARDING_URL = "/api/v1/users/onboarding"
ONBOARDING_STATUS_URL = "/api/v1/users/onboarding/status"


class TestCompleteOnboarding:
    """Tests for POST /api/v1/users/onboarding."""

    def test_onboarding_valid_data_returns_200(self, api_client, auth_headers):
        """Submitting valid onboarding data returns 200 with user profile."""
        resp = api_client.post(
            ONBOARDING_URL,
            json=onboarding_payload(),
            headers=auth_headers,
        )

        body = assert_success(resp)
        data = body["data"]
        assert data["displayName"] == "Test User"
        assert data["age"] == 25
        assert data["city"] == "Dubai"
        assert data["country"] == "United Arab Emirates"
        assert data["isOnboarded"] is True

    def test_onboarding_sets_is_onboarded_flag(
        self, api_client, registered_user, db_connection
    ):
        """After onboarding, the isOnboarded flag is set to true in the database."""
        from utils.db import get_user_field

        headers = get_auth_headers(registered_user["tokens"])

        resp = api_client.post(
            ONBOARDING_URL,
            json=onboarding_payload(),
            headers=headers,
        )
        assert_success(resp)

        db_connection.commit()
        is_onboarded = get_user_field(
            db_connection, registered_user["email"], "isOnboarded"
        )
        assert is_onboarded is True

    def test_onboarding_already_onboarded_returns_409(
        self, api_client, onboarded_user
    ):
        """A user who has already completed onboarding gets 409 Conflict."""
        headers = get_auth_headers(onboarded_user["tokens"])

        resp = api_client.post(
            ONBOARDING_URL,
            json=onboarding_payload(),
            headers=headers,
        )

        assert_conflict(resp)

    def test_onboarding_missing_display_name_returns_422(
        self, api_client, auth_headers
    ):
        """Omitting the required displayName field returns 422."""
        payload = onboarding_payload()
        del payload["displayName"]

        resp = api_client.post(ONBOARDING_URL, json=payload, headers=auth_headers)

        assert_validation_error(resp)

    def test_onboarding_display_name_too_short_returns_422(
        self, api_client, auth_headers
    ):
        """Display name shorter than 2 characters is rejected with 422."""
        resp = api_client.post(
            ONBOARDING_URL,
            json=onboarding_payload(displayName="A"),
            headers=auth_headers,
        )

        assert_validation_error(resp)

    def test_onboarding_age_below_6_returns_422(self, api_client, auth_headers):
        """Age below the minimum of 6 is rejected with 422."""
        resp = api_client.post(
            ONBOARDING_URL,
            json=onboarding_payload(age=5),
            headers=auth_headers,
        )

        assert_validation_error(resp)

    def test_onboarding_age_above_120_returns_422(self, api_client, auth_headers):
        """Age above the maximum of 120 is rejected with 422."""
        resp = api_client.post(
            ONBOARDING_URL,
            json=onboarding_payload(age=121),
            headers=auth_headers,
        )

        assert_validation_error(resp)

    def test_onboarding_missing_country_returns_422(self, api_client, auth_headers):
        """Omitting the required country field returns 422."""
        payload = onboarding_payload()
        del payload["country"]

        resp = api_client.post(ONBOARDING_URL, json=payload, headers=auth_headers)

        assert_validation_error(resp)

    def test_onboarding_requires_auth(self, api_client):
        """Onboarding endpoint without authentication returns 401."""
        resp = api_client.post(ONBOARDING_URL, json=onboarding_payload())

        assert_unauthorized(resp)

    def test_onboarding_age_exactly_6_succeeds(self, api_client, auth_headers):
        """Age at the lower boundary (6) is accepted."""
        resp = api_client.post(
            ONBOARDING_URL, json=onboarding_payload(age=6), headers=auth_headers
        )
        assert_success(resp)

    def test_onboarding_age_exactly_120_succeeds(self, api_client, auth_headers):
        """Age at the upper boundary (120) is accepted."""
        resp = api_client.post(
            ONBOARDING_URL, json=onboarding_payload(age=120), headers=auth_headers
        )
        assert_success(resp)

    def test_onboarding_latitude_without_longitude_returns_422(
        self, api_client, auth_headers
    ):
        """Submitting latitude alone (no longitude) is rejected. Regression test
        for the same lat/long pairing gap fixed on PUT /profile."""
        payload = onboarding_payload(latitude=25.2048)
        resp = api_client.post(ONBOARDING_URL, json=payload, headers=auth_headers)
        assert_validation_error(resp)

    def test_onboarding_with_location_derives_timezone(self, api_client, auth_headers):
        """Providing both latitude and longitude derives and stores a timezone."""
        payload = onboarding_payload(latitude=25.2048, longitude=55.2708)
        resp = api_client.post(ONBOARDING_URL, json=payload, headers=auth_headers)
        body = assert_success(resp)
        assert body["data"]["timezone"]

    def test_onboarding_sql_injection_in_city_no_crash(self, api_client, auth_headers):
        """A SQL-injection-shaped city value never causes a 500."""
        payload = onboarding_payload(city="'; DROP TABLE users; --")
        resp = api_client.post(ONBOARDING_URL, json=payload, headers=auth_headers)
        assert resp.status_code in (200, 422), f"Unexpected status: {resp.status_code}"

    def test_onboarding_malformed_json_returns_400(self, api_client, auth_headers):
        """A request body that isn't valid JSON returns 400, not 500."""
        resp = api_client.session.post(
            f"{api_client.base_url}{ONBOARDING_URL}",
            data='{"displayName":"bad',
            headers={**auth_headers, "Content-Type": "application/json"},
        )
        assert resp.status_code == 400
        assert resp.json()["error"]["code"] == "INVALID_JSON"


class TestOnboardingStatus:
    """Tests for GET /api/v1/users/onboarding/status."""

    def test_onboarding_status_returns_correct_value(
        self, api_client, registered_user, onboarded_user
    ):
        """Status reflects false before onboarding and true after."""
        # Fresh registered user has NOT onboarded
        fresh_headers = get_auth_headers(registered_user["tokens"])
        resp = api_client.get(ONBOARDING_STATUS_URL, headers=fresh_headers)

        body = assert_success(resp)
        assert body["data"]["isOnboarded"] is False

        # Onboarded user shows true
        onboarded_headers = get_auth_headers(onboarded_user["tokens"])
        resp = api_client.get(ONBOARDING_STATUS_URL, headers=onboarded_headers)

        body = assert_success(resp)
        assert body["data"]["isOnboarded"] is True

    def test_onboarding_status_requires_auth(self, api_client):
        """Onboarding status without authentication returns 401."""
        resp = api_client.get(ONBOARDING_STATUS_URL)
        assert_unauthorized(resp)
