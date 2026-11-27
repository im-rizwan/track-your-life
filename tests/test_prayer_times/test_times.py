"""Tests for prayer times retrieval, adjustments, and refresh endpoints.

Covers GET /today, PATCH /adjustments, and POST /refresh.
"""

from datetime import datetime
from zoneinfo import ZoneInfo

import pytest

from utils.assertions import (
    assert_success,
    assert_unauthorized,
    assert_not_found,
    assert_validation_error,
    assert_error,
)

pytestmark = pytest.mark.prayer_times

TODAY_ENDPOINT = "/api/v1/prayer-times/today"
ADJUSTMENTS_ENDPOINT = "/api/v1/prayer-times/adjustments"
REFRESH_ENDPOINT = "/api/v1/prayer-times/refresh"
CONFIG_ENDPOINT = "/api/v1/prayer-times/config"

PRAYER_FIELDS = ["fajr", "zuhr", "asr", "maghrib", "isha"]


# ============================================================================
# GET /api/v1/prayer-times/today
# ============================================================================


class TestGetTodaysPrayerTimes:
    """Tests for GET /api/v1/prayer-times/today."""

    def test_get_times_no_config_returns_404(self, api_client, auth_headers):
        """A fresh user with no prayer config gets a 404."""
        resp = api_client.get(TODAY_ENDPOINT, headers=auth_headers)
        assert_not_found(resp)

    def test_get_times_manual_mode_returns_200(self, api_client, manual_prayer_config):
        """With a MANUAL config in place, GET /today returns 200."""
        headers = manual_prayer_config["headers"]
        resp = api_client.get(TODAY_ENDPOINT, headers=headers)
        assert_success(resp)

    def test_get_times_returns_5_prayer_times(self, api_client, manual_prayer_config):
        """Response contains all 5 daily prayer time fields."""
        headers = manual_prayer_config["headers"]
        resp = api_client.get(TODAY_ENDPOINT, headers=headers)
        body = assert_success(resp)

        data = body["data"]
        for field in PRAYER_FIELDS:
            assert field in data, f"Missing prayer time field: {field}"

    def test_get_times_manual_values_match(self, api_client, manual_prayer_config):
        """In MANUAL mode the returned prayer times match the configured values."""
        headers = manual_prayer_config["headers"]
        manual_times = manual_prayer_config["manualTimes"]

        resp = api_client.get(TODAY_ENDPOINT, headers=headers)
        body = assert_success(resp)

        data = body["data"]
        for field in PRAYER_FIELDS:
            assert data[field] == manual_times[field], (
                f"Prayer time {field}: expected {manual_times[field]}, got {data[field]}"
            )

    def test_get_times_includes_source(self, api_client, manual_prayer_config):
        """Response includes a source field indicating MANUAL."""
        headers = manual_prayer_config["headers"]
        resp = api_client.get(TODAY_ENDPOINT, headers=headers)
        body = assert_success(resp)

        assert body["data"]["source"] == "MANUAL"

    def test_get_times_includes_date(self, api_client, manual_prayer_config):
        """Response includes a date field in YYYY-MM-DD format."""
        headers = manual_prayer_config["headers"]
        resp = api_client.get(TODAY_ENDPOINT, headers=headers)
        body = assert_success(resp)

        date_str = body["data"]["date"]
        assert isinstance(date_str, str)
        # Rough format check: YYYY-MM-DD
        parts = date_str.split("-")
        assert len(parts) == 3
        assert len(parts[0]) == 4  # year
        assert len(parts[1]) == 2  # month
        assert len(parts[2]) == 2  # day

    def test_get_times_requires_auth(self, api_client):
        """Returns 401 without an auth token."""
        resp = api_client.get(TODAY_ENDPOINT)
        assert_unauthorized(resp)


class TestGetTodaysPrayerTimesAutomaticMode:
    """Tests exercising the AUTOMATIC path (real Aladhan API call), which is
    where the date-computation bug lived — the MANUAL-mode tests above never
    touch this code path at all."""

    def test_automatic_mode_returns_200(self, api_client, automatic_prayer_config):
        """With an AUTOMATIC config and location set, GET /today succeeds."""
        headers = automatic_prayer_config["headers"]
        resp = api_client.get(TODAY_ENDPOINT, headers=headers)
        assert_success(resp)

    def test_automatic_mode_date_matches_users_local_timezone_not_server(
        self, api_client, automatic_prayer_config
    ):
        """The returned date must be "today" in the user's own timezone
        (America/Los_Angeles, from the fixture's coordinates), not the
        server's local/UTC date. Regression test: getTodaysPrayerTimes()
        used `new Date(); setHours(0,0,0,0)` — the server's own clock —
        completely ignoring the user's stored timezone, which for part of
        every day produces prayer times fetched, cached, and served for the
        wrong calendar day entirely."""
        headers = automatic_prayer_config["headers"]
        resp = api_client.get(TODAY_ENDPOINT, headers=headers)
        body = assert_success(resp)

        expected_date = datetime.now(ZoneInfo("America/Los_Angeles")).strftime("%Y-%m-%d")
        assert body["data"]["date"] == expected_date, (
            f"Expected date in user's timezone (America/Los_Angeles): {expected_date}, "
            f"got {body['data']['date']} — looks like server-local date is being used instead"
        )

    def test_automatic_mode_source_is_api(self, api_client, automatic_prayer_config):
        """AUTOMATIC mode's response reports source=API."""
        headers = automatic_prayer_config["headers"]
        resp = api_client.get(TODAY_ENDPOINT, headers=headers)
        body = assert_success(resp)
        assert body["data"]["source"] == "API"

    def test_refresh_date_matches_users_local_timezone(
        self, api_client, automatic_prayer_config
    ):
        """POST /refresh (force API re-fetch) also uses the user's local date,
        not the server's — same underlying fix, different call site."""
        headers = automatic_prayer_config["headers"]
        resp = api_client.post(REFRESH_ENDPOINT, headers=headers)
        body = assert_success(resp)

        expected_date = datetime.now(ZoneInfo("America/Los_Angeles")).strftime("%Y-%m-%d")
        assert body["data"]["date"] == expected_date


# ============================================================================
# PATCH /api/v1/prayer-times/adjustments
# ============================================================================


class TestUpdateAdjustments:
    """Tests for PATCH /api/v1/prayer-times/adjustments."""

    def test_update_adjustments_no_config_returns_404(self, api_client, auth_headers):
        """Adjustments fail with 404 when no config exists."""
        resp = api_client.patch(
            ADJUSTMENTS_ENDPOINT,
            json={"fajrAdjustment": 5},
            headers=auth_headers,
        )
        assert_not_found(resp)

    def test_update_adjustments_manual_mode_returns_400(self, api_client, manual_prayer_config):
        """Adjustments are rejected with 400 when config is in MANUAL mode."""
        headers = manual_prayer_config["headers"]
        resp = api_client.patch(
            ADJUSTMENTS_ENDPOINT,
            json={"fajrAdjustment": 5},
            headers=headers,
        )
        assert_error(resp, 400)

    def test_update_adjustments_out_of_range_returns_422(self, api_client, auth_headers):
        """Adjustment value outside -15..+15 returns 422."""
        resp = api_client.patch(
            ADJUSTMENTS_ENDPOINT,
            json={"fajrAdjustment": 20},
            headers=auth_headers,
        )
        assert_validation_error(resp)

    def test_update_adjustments_negative_out_of_range_returns_422(self, api_client, auth_headers):
        """Negative adjustment value beyond -15 returns 422."""
        resp = api_client.patch(
            ADJUSTMENTS_ENDPOINT,
            json={"ishaAdjustment": -20},
            headers=auth_headers,
        )
        assert_validation_error(resp)

    def test_update_adjustments_requires_auth(self, api_client):
        """Returns 401 without an auth token."""
        resp = api_client.patch(
            ADJUSTMENTS_ENDPOINT,
            json={"fajrAdjustment": 5},
        )
        assert_unauthorized(resp)


# ============================================================================
# POST /api/v1/prayer-times/refresh
# ============================================================================


class TestRefreshPrayerTimes:
    """Tests for POST /api/v1/prayer-times/refresh."""

    def test_refresh_requires_auth(self, api_client):
        """Returns 401 without an auth token."""
        resp = api_client.post(REFRESH_ENDPOINT)
        assert_unauthorized(resp)

    def test_refresh_no_config_returns_404(self, api_client, auth_headers):
        """Refresh fails with 404 when no config exists."""
        resp = api_client.post(REFRESH_ENDPOINT, headers=auth_headers)
        assert_not_found(resp)

    def test_refresh_manual_mode_returns_400(self, api_client, manual_prayer_config):
        """Refresh is rejected with 400 when config is in MANUAL mode."""
        headers = manual_prayer_config["headers"]
        resp = api_client.post(REFRESH_ENDPOINT, headers=headers)
        assert_error(resp, 400)
