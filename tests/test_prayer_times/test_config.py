"""Tests for prayer times configuration endpoints.

Covers GET /config, PUT /config for create/update, and validation.
"""

import pytest

from utils.assertions import (
    assert_success,
    assert_unauthorized,
    assert_not_found,
    assert_validation_error,
)

pytestmark = pytest.mark.prayer_times

CONFIG_ENDPOINT = "/api/v1/prayer-times/config"


# ============================================================================
# GET /api/v1/prayer-times/config
# ============================================================================


class TestGetConfig:
    """Tests for GET /api/v1/prayer-times/config."""

    def test_get_config_no_config_returns_404(self, api_client, auth_headers):
        """A fresh user with no prayer config gets a 404."""
        resp = api_client.get(CONFIG_ENDPOINT, headers=auth_headers)
        assert_not_found(resp)

    def test_get_config_after_creation_returns_200(self, api_client, manual_prayer_config):
        """After creating a config, GET returns 200."""
        headers = manual_prayer_config["headers"]
        resp = api_client.get(CONFIG_ENDPOINT, headers=headers)
        assert_success(resp)

    def test_get_config_returns_correct_mode(self, api_client, manual_prayer_config):
        """Config returns the calculation mode that was set."""
        headers = manual_prayer_config["headers"]
        resp = api_client.get(CONFIG_ENDPOINT, headers=headers)
        body = assert_success(resp)

        assert body["data"]["calculationMode"] == "MANUAL"

    def test_get_config_returns_manual_times(self, api_client, manual_prayer_config):
        """For MANUAL mode, the stored manual times are returned in the config."""
        headers = manual_prayer_config["headers"]
        manual_times = manual_prayer_config["manualTimes"]

        resp = api_client.get(CONFIG_ENDPOINT, headers=headers)
        body = assert_success(resp)

        data = body["data"]
        assert data["manualFajr"] == manual_times["fajr"]
        assert data["manualZuhr"] == manual_times["zuhr"]
        assert data["manualAsr"] == manual_times["asr"]
        assert data["manualMaghrib"] == manual_times["maghrib"]
        assert data["manualIsha"] == manual_times["isha"]

    def test_get_config_requires_auth(self, api_client):
        """Returns 401 without an auth token."""
        resp = api_client.get(CONFIG_ENDPOINT)
        assert_unauthorized(resp)


# ============================================================================
# PUT /api/v1/prayer-times/config
# ============================================================================


class TestUpdateConfig:
    """Tests for PUT /api/v1/prayer-times/config (create and update)."""

    def test_create_config_manual_mode_returns_200(self, api_client, auth_headers):
        """Creating a new MANUAL config via PUT returns 200."""
        resp = api_client.put(
            CONFIG_ENDPOINT,
            json={
                "calculationMode": "MANUAL",
                "manualTimes": {
                    "fajr": "05:00",
                    "zuhr": "12:00",
                    "asr": "15:30",
                    "maghrib": "18:15",
                    "isha": "19:45",
                },
            },
            headers=auth_headers,
        )
        body = assert_success(resp)
        assert body["data"]["calculationMode"] == "MANUAL"

    def test_create_config_manual_with_all_times(self, api_client, auth_headers):
        """All five manual prayer times are stored correctly after creation."""
        times = {
            "fajr": "04:45",
            "zuhr": "12:30",
            "asr": "16:00",
            "maghrib": "18:45",
            "isha": "20:15",
        }
        resp = api_client.put(
            CONFIG_ENDPOINT,
            json={"calculationMode": "MANUAL", "manualTimes": times},
            headers=auth_headers,
        )
        body = assert_success(resp)

        data = body["data"]
        assert data["manualFajr"] == times["fajr"]
        assert data["manualZuhr"] == times["zuhr"]
        assert data["manualAsr"] == times["asr"]
        assert data["manualMaghrib"] == times["maghrib"]
        assert data["manualIsha"] == times["isha"]

    def test_update_config_switch_to_manual(self, api_client, manual_prayer_config):
        """Updating an existing config with new manual times succeeds."""
        headers = manual_prayer_config["headers"]

        new_times = {
            "fajr": "05:15",
            "zuhr": "12:45",
            "asr": "15:30",
            "maghrib": "18:00",
            "isha": "19:30",
        }
        resp = api_client.put(
            CONFIG_ENDPOINT,
            json={"calculationMode": "MANUAL", "manualTimes": new_times},
            headers=headers,
        )
        body = assert_success(resp)

        data = body["data"]
        assert data["calculationMode"] == "MANUAL"
        assert data["manualFajr"] == new_times["fajr"]

    def test_update_config_invalid_mode_returns_422(self, api_client, auth_headers):
        """An invalid calculationMode value returns 422."""
        resp = api_client.put(
            CONFIG_ENDPOINT,
            json={"calculationMode": "INVALID_MODE"},
            headers=auth_headers,
        )
        assert_validation_error(resp)

    def test_update_config_requires_auth(self, api_client):
        """Returns 401 without an auth token."""
        resp = api_client.put(
            CONFIG_ENDPOINT,
            json={
                "calculationMode": "MANUAL",
                "manualTimes": {
                    "fajr": "05:00",
                    "zuhr": "12:00",
                    "asr": "15:30",
                    "maghrib": "18:15",
                    "isha": "19:45",
                },
            },
        )
        assert_unauthorized(resp)

    def test_update_config_manual_times_format_invalid(self, api_client, auth_headers):
        """Invalid time format (not HH:MM) returns 422."""
        resp = api_client.put(
            CONFIG_ENDPOINT,
            json={
                "calculationMode": "MANUAL",
                "manualTimes": {
                    "fajr": "5:30",   # Missing leading zero
                    "zuhr": "12:00",
                    "asr": "15:30",
                    "maghrib": "18:15",
                    "isha": "19:45",
                },
            },
            headers=auth_headers,
        )
        assert_validation_error(resp)

    def test_update_config_manual_mode_missing_times_returns_422(self, api_client, auth_headers):
        """MANUAL mode without manualTimes object returns 422."""
        resp = api_client.put(
            CONFIG_ENDPOINT,
            json={"calculationMode": "MANUAL"},
            headers=auth_headers,
        )
        assert_validation_error(resp)

    def test_update_config_manual_times_out_of_range(self, api_client, auth_headers):
        """Time values outside 00:00-23:59 are rejected with 422."""
        resp = api_client.put(
            CONFIG_ENDPOINT,
            json={
                "calculationMode": "MANUAL",
                "manualTimes": {
                    "fajr": "25:00",   # Invalid hour
                    "zuhr": "12:00",
                    "asr": "15:30",
                    "maghrib": "18:15",
                    "isha": "19:45",
                },
            },
            headers=auth_headers,
        )
        assert_validation_error(resp)

    def test_update_config_automatic_without_location_returns_400(
        self, api_client, auth_headers
    ):
        """AUTOMATIC mode for a user without lat/lng stored returns 400."""
        resp = api_client.put(
            CONFIG_ENDPOINT,
            json={
                "calculationMode": "AUTOMATIC",
                "apiMethod": "MWL",
            },
            headers=auth_headers,
        )
        # The service throws BadRequestError when location is not set
        assert resp.status_code == 400, f"Expected 400, got {resp.status_code}: {resp.text}"
        body = resp.json()
        assert body["success"] is False
