"""Module-scoped fixtures for auth tests."""

import pytest

from utils.auth_helpers import unique_email


@pytest.fixture
def unverified_user(api_client):
    """Register a user but do NOT verify their email.

    Returns dict with: email, password.
    """
    email = unique_email()
    password = "Test@12345"

    resp = api_client.register(email, password)
    assert resp.status_code == 201, f"Register failed: {resp.text}"

    return {
        "email": email,
        "password": password,
    }
