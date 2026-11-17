"""Tests for /api/v1/customization/other-prayer-types CRUD endpoints.

Other prayer types follow the same pattern as simple entities but include
an additional `requiresRakahCount` boolean field.
"""

import pytest

from utils.assertions import (
    assert_success,
    assert_created,
    assert_unauthorized,
    assert_not_found,
    assert_validation_error,
)

pytestmark = pytest.mark.customization

BASE_URL = "/api/v1/customization/other-prayer-types"

NONEXISTENT_ID = "clxxxxxxxxxxxxxxxxxxxxxxxxx"


# ── Helpers / fixtures ────────────────────────────────────────────────────────


@pytest.fixture
def default_other_prayer_type_id(api_client, auth_headers):
    """Return the ID of the first system-default other prayer type."""
    resp = api_client.get(BASE_URL, headers=auth_headers)
    assert resp.status_code == 200
    defaults = [item for item in resp.json()["data"] if item["isDefault"] is True]
    assert len(defaults) > 0, "No system-default other prayer types found"
    return defaults[0]["id"]


@pytest.fixture
def custom_other_prayer_type(api_client, auth_headers):
    """Create and return a custom other prayer type."""
    resp = api_client.post(
        BASE_URL,
        json={"name": "Custom Salah Type", "requiresRakahCount": True},
        headers=auth_headers,
    )
    assert resp.status_code == 201
    return resp.json()["data"]


# ── GET /other-prayer-types ───────────────────────────────────────────────────


class TestListOtherPrayerTypes:
    """Tests for GET /api/v1/customization/other-prayer-types."""

    def test_list_returns_200_with_data(self, api_client, auth_headers):
        """Authenticated request returns 200 with a list."""
        resp = api_client.get(BASE_URL, headers=auth_headers)

        body = assert_success(resp)
        assert isinstance(body["data"], list)

    def test_list_includes_system_defaults(self, api_client, auth_headers):
        """Response contains system default items."""
        resp = api_client.get(BASE_URL, headers=auth_headers)

        body = assert_success(resp)
        defaults = [item for item in body["data"] if item["isDefault"] is True]
        assert len(defaults) > 0

    def test_list_requires_auth(self, api_client):
        """Request without auth returns 401."""
        resp = api_client.get(BASE_URL)

        assert_unauthorized(resp)

    def test_get_includes_requires_rakah_count(self, api_client, auth_headers):
        """Each item in the list includes the requiresRakahCount field."""
        resp = api_client.get(BASE_URL, headers=auth_headers)

        body = assert_success(resp)
        for item in body["data"]:
            assert "requiresRakahCount" in item, (
                f"Item {item['name']} missing requiresRakahCount"
            )
            assert isinstance(item["requiresRakahCount"], bool)


# ── POST /other-prayer-types ─────────────────────────────────────────────────


class TestCreateOtherPrayerType:
    """Tests for POST /api/v1/customization/other-prayer-types."""

    def test_create_valid_returns_201(self, api_client, auth_headers):
        """Creating with valid name and requiresRakahCount returns 201."""
        resp = api_client.post(
            BASE_URL,
            json={"name": "Istikhara Prayer", "requiresRakahCount": True},
            headers=auth_headers,
        )

        body = assert_created(resp)
        assert body["data"]["name"] == "Istikhara Prayer"
        assert body["data"]["isDefault"] is False

    def test_create_with_requires_rakah_count_true(self, api_client, auth_headers):
        """Created item preserves requiresRakahCount=true."""
        resp = api_client.post(
            BASE_URL,
            json={"name": "Tahiyyatul Masjid", "requiresRakahCount": True},
            headers=auth_headers,
        )

        body = assert_created(resp)
        assert body["data"]["requiresRakahCount"] is True

    def test_create_with_requires_rakah_count_false(self, api_client, auth_headers):
        """Created item preserves requiresRakahCount=false."""
        resp = api_client.post(
            BASE_URL,
            json={"name": "Janazah", "requiresRakahCount": False},
            headers=auth_headers,
        )

        body = assert_created(resp)
        assert body["data"]["requiresRakahCount"] is False

    def test_create_requires_rakah_count_field(self, api_client, auth_headers):
        """Omitting the requiresRakahCount field returns 422."""
        resp = api_client.post(
            BASE_URL,
            json={"name": "No Rakah Field"},
            headers=auth_headers,
        )

        assert_validation_error(resp)

    def test_create_duplicate_name_returns_409(self, api_client, auth_headers):
        """Duplicate name for the same user returns 409.

        The API catches Prisma unique constraint violations for
        customization entities and returns a ConflictError (409).
        """
        name = "Duplicate Prayer Type"
        api_client.post(
            BASE_URL,
            json={"name": name, "requiresRakahCount": True},
            headers=auth_headers,
        )

        resp = api_client.post(
            BASE_URL,
            json={"name": name, "requiresRakahCount": False},
            headers=auth_headers,
        )
        assert resp.status_code == 409, (
            f"Expected 409 for duplicate name, got {resp.status_code}: {resp.text}"
        )

    def test_create_missing_name_returns_422(self, api_client, auth_headers):
        """Omitting the name field returns 422."""
        resp = api_client.post(
            BASE_URL,
            json={"requiresRakahCount": True},
            headers=auth_headers,
        )

        assert_validation_error(resp)

    def test_create_requires_auth(self, api_client):
        """Creating without auth returns 401."""
        resp = api_client.post(
            BASE_URL,
            json={"name": "No Auth Type", "requiresRakahCount": False},
        )

        assert_unauthorized(resp)


# ── PUT /other-prayer-types/:id ──────────────────────────────────────────────


class TestUpdateOtherPrayerType:
    """Tests for PUT /api/v1/customization/other-prayer-types/:id."""

    def test_update_name_returns_200(
        self, api_client, auth_headers, custom_other_prayer_type
    ):
        """Updating the name of a user-owned item returns 200."""
        item_id = custom_other_prayer_type["id"]
        resp = api_client.put(
            f"{BASE_URL}/{item_id}",
            json={"name": "Renamed Prayer Type"},
            headers=auth_headers,
        )

        body = assert_success(resp)
        assert body["data"]["name"] == "Renamed Prayer Type"

    def test_update_toggle_requires_rakah_count(
        self, api_client, auth_headers, custom_other_prayer_type
    ):
        """Toggling requiresRakahCount via update returns 200 with updated value."""
        item_id = custom_other_prayer_type["id"]
        original = custom_other_prayer_type["requiresRakahCount"]
        toggled = not original

        resp = api_client.put(
            f"{BASE_URL}/{item_id}",
            json={"requiresRakahCount": toggled},
            headers=auth_headers,
        )

        body = assert_success(resp)
        assert body["data"]["requiresRakahCount"] is toggled

    def test_update_system_default_returns_404(
        self, api_client, auth_headers, default_other_prayer_type_id
    ):
        """Updating a system default returns 404.

        System defaults have no userId, so the ownership-scoped query returns
        'not found' rather than 'forbidden'.
        """
        resp = api_client.put(
            f"{BASE_URL}/{default_other_prayer_type_id}",
            json={"name": "Hacked Default"},
            headers=auth_headers,
        )

        assert_not_found(resp)

    def test_update_not_found_returns_404(self, api_client, auth_headers):
        """Updating a non-existent item returns 404."""
        resp = api_client.put(
            f"{BASE_URL}/{NONEXISTENT_ID}",
            json={"name": "Ghost"},
            headers=auth_headers,
        )

        assert_not_found(resp)

    def test_update_requires_auth(self, api_client):
        """Updating without auth returns 401."""
        resp = api_client.put(
            f"{BASE_URL}/{NONEXISTENT_ID}", json={"name": "No Auth"}
        )

        assert_unauthorized(resp)


# ── DELETE /other-prayer-types/:id ───────────────────────────────────────────


class TestDeleteOtherPrayerType:
    """Tests for DELETE /api/v1/customization/other-prayer-types/:id."""

    def test_delete_valid_returns_204(self, api_client, auth_headers):
        """Deleting a user-owned item returns 204."""
        create_resp = api_client.post(
            BASE_URL,
            json={"name": "Deletable Type", "requiresRakahCount": False},
            headers=auth_headers,
        )
        item_id = create_resp.json()["data"]["id"]

        resp = api_client.delete(f"{BASE_URL}/{item_id}", headers=auth_headers)
        assert resp.status_code == 204

    def test_delete_system_default_returns_404(
        self, api_client, auth_headers, default_other_prayer_type_id
    ):
        """Deleting a system default returns 404.

        System defaults have no userId, so the ownership-scoped query returns
        'not found' rather than 'forbidden'.
        """
        resp = api_client.delete(
            f"{BASE_URL}/{default_other_prayer_type_id}", headers=auth_headers
        )

        assert_not_found(resp)

    def test_delete_not_found_returns_404(self, api_client, auth_headers):
        """Deleting a non-existent item returns 404."""
        resp = api_client.delete(
            f"{BASE_URL}/{NONEXISTENT_ID}", headers=auth_headers
        )

        assert_not_found(resp)

    def test_delete_requires_auth(self, api_client):
        """Deleting without auth returns 401."""
        resp = api_client.delete(f"{BASE_URL}/{NONEXISTENT_ID}")

        assert_unauthorized(resp)
