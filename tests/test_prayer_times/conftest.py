"""Module-scoped fixtures for prayer times tests."""

import pytest

from utils.auth_helpers import create_verified_user, get_auth_headers


MANUAL_TIMES = {
    "fajr": "05:30",
    "zuhr": "12:15",
    "asr": "15:45",
    "maghrib": "18:30",
    "isha": "20:00",
}


@pytest.fixture
def manual_prayer_config(api_client, db_connection):
    """Register a verified user and create a MANUAL prayer times config.

    Returns dict with: email, password, user, tokens, headers, manualTimes.
    """
    user_data = create_verified_user(api_client, db_connection)
    headers = get_auth_headers(user_data["tokens"])

    # Create the prayer times config in MANUAL mode via PUT
    resp = api_client.put(
        "/api/v1/prayer-times/config",
        json={
            "calculationMode": "MANUAL",
            "manualTimes": MANUAL_TIMES,
        },
        headers=headers,
    )
    assert resp.status_code == 200, f"Failed to create manual prayer config: {resp.text}"

    return {
        **user_data,
        "headers": headers,
        "manualTimes": MANUAL_TIMES,
    }
