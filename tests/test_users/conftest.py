"""Module-level fixtures for Users tests."""

import pytest

from utils.auth_helpers import create_verified_user, get_auth_headers
from utils.factories import onboarding_payload


@pytest.fixture
def onboarded_user(api_client, db_connection):
    """A user who has completed the full onboarding flow (register + verify + onboard).

    Returns dict with: email, password, tokens, user.
    """
    user_data = create_verified_user(api_client, db_connection)
    headers = get_auth_headers(user_data["tokens"])

    resp = api_client.post(
        "/api/v1/users/onboarding",
        json=onboarding_payload(),
        headers=headers,
    )
    assert resp.status_code == 200, f"Onboarding failed: {resp.text}"

    body = resp.json()
    return {
        "email": user_data["email"],
        "password": user_data["password"],
        "tokens": user_data["tokens"],
        "user": body["data"],
    }
