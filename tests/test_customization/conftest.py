"""Module-level fixtures for customization tests."""

import pytest


BASE_URL = "/api/v1/customization"


@pytest.fixture
def default_prayer_location_id(api_client, auth_headers):
    """Return the ID of the first system-default prayer location."""
    resp = api_client.get(f"{BASE_URL}/prayer-locations", headers=auth_headers)
    assert resp.status_code == 200, f"GET prayer-locations failed: {resp.text}"

    items = resp.json()["data"]
    defaults = [item for item in items if item.get("isDefault") is True]
    assert len(defaults) > 0, "No system-default prayer locations found"
    return defaults[0]["id"]


@pytest.fixture
def custom_prayer_location(api_client, auth_headers):
    """Create and return a custom (user-owned) prayer location."""
    resp = api_client.post(
        f"{BASE_URL}/prayer-locations",
        json={"name": "Custom Test Location"},
        headers=auth_headers,
    )
    assert resp.status_code == 201, f"POST prayer-locations failed: {resp.text}"
    return resp.json()["data"]
