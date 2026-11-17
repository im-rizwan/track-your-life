"""Tests for /api/v1/customization/prayer-locations CRUD endpoints."""

import pytest

from utils.assertions import (
    assert_success,
    assert_created,
    assert_unauthorized,
    assert_not_found,
    assert_validation_error,
)

pytestmark = pytest.mark.customization

BASE_URL = "/api/v1/customization/prayer-locations"

# A valid CUID that will never exist in the database
NONEXISTENT_ID = "clxxxxxxxxxxxxxxxxxxxxxxxxx"


# ── GET /prayer-locations ─────────────────────────────────────────────────────


class TestListPrayerLocations:
    """Tests for GET /api/v1/customization/prayer-locations."""

    def test_list_returns_200_with_data(self, api_client, auth_headers):
        """Authenticated request returns 200 with a list."""
        resp = api_client.get(BASE_URL, headers=auth_headers)

        body = assert_success(resp)
        assert isinstance(body["data"], list)

    def test_list_includes_system_defaults(self, api_client, auth_headers):
        """Response includes at least one system default item."""
        resp = api_client.get(BASE_URL, headers=auth_headers)

        body = assert_success(resp)
        defaults = [item for item in body["data"] if item["isDefault"] is True]
        assert len(defaults) > 0, "Expected at least one system default"

    def test_list_includes_user_custom_items(
        self, api_client, auth_headers, custom_prayer_location
    ):
        """After creating a custom item, it appears in the list."""
        resp = api_client.get(BASE_URL, headers=auth_headers)

        body = assert_success(resp)
        ids = [item["id"] for item in body["data"]]
        assert custom_prayer_location["id"] in ids

    def test_list_does_not_show_other_users_items(
        self, api_client, auth_headers, second_auth_headers
    ):
        """A custom item created by one user does not appear for another user."""
        # User 2 creates a custom item
        api_client.post(
            BASE_URL,
            json={"name": "Second User Location"},
            headers=second_auth_headers,
        )

        # User 1 lists — should not see user 2's custom item
        resp = api_client.get(BASE_URL, headers=auth_headers)
        body = assert_success(resp)
        names = [item["name"] for item in body["data"] if not item["isDefault"]]
        assert "Second User Location" not in names

    def test_list_requires_auth(self, api_client):
        """Request without auth token returns 401."""
        resp = api_client.get(BASE_URL)

        assert_unauthorized(resp)


# ── POST /prayer-locations ────────────────────────────────────────────────────


class TestCreatePrayerLocation:
    """Tests for POST /api/v1/customization/prayer-locations."""

    def test_create_valid_name_returns_201(self, api_client, auth_headers):
        """Creating with a valid name returns 201 and the created item."""
        resp = api_client.post(
            BASE_URL, json={"name": "University Musalla"}, headers=auth_headers
        )

        body = assert_created(resp)
        assert body["data"]["name"] == "University Musalla"

    def test_created_item_is_not_default(self, api_client, auth_headers):
        """A user-created item has isDefault=false."""
        resp = api_client.post(
            BASE_URL, json={"name": "Office Prayer Room"}, headers=auth_headers
        )

        body = assert_created(resp)
        assert body["data"]["isDefault"] is False

    def test_created_item_has_id(self, api_client, auth_headers):
        """The created item includes an id field."""
        resp = api_client.post(
            BASE_URL, json={"name": "Garden Spot"}, headers=auth_headers
        )

        body = assert_created(resp)
        assert "id" in body["data"]

    def test_create_duplicate_name_returns_409(self, api_client, auth_headers):
        """Creating an item with a duplicate name for the same user returns 409.

        The API catches Prisma unique constraint violations for
        customization entities and returns a ConflictError (409).
        """
        name = "Duplicate Location Test"
        api_client.post(BASE_URL, json={"name": name}, headers=auth_headers)

        resp = api_client.post(BASE_URL, json={"name": name}, headers=auth_headers)
        assert resp.status_code == 409, (
            f"Expected 409 for duplicate name, got {resp.status_code}: {resp.text}"
        )

    def test_create_missing_name_returns_422(self, api_client, auth_headers):
        """Omitting the name field returns 422."""
        resp = api_client.post(BASE_URL, json={}, headers=auth_headers)

        assert_validation_error(resp)

    def test_create_name_too_short_returns_422(self, api_client, auth_headers):
        """A name shorter than 2 characters returns 422."""
        resp = api_client.post(BASE_URL, json={"name": "X"}, headers=auth_headers)

        assert_validation_error(resp)

    def test_create_name_too_long_returns_422(self, api_client, auth_headers):
        """A name longer than 100 characters returns 422."""
        resp = api_client.post(
            BASE_URL, json={"name": "A" * 101}, headers=auth_headers
        )

        assert_validation_error(resp)

    def test_create_requires_auth(self, api_client):
        """Creating without auth returns 401."""
        resp = api_client.post(BASE_URL, json={"name": "No Auth Location"})

        assert_unauthorized(resp)


# ── PUT /prayer-locations/:id ─────────────────────────────────────────────────


class TestUpdatePrayerLocation:
    """Tests for PUT /api/v1/customization/prayer-locations/:id."""

    def test_update_valid_returns_200(
        self, api_client, auth_headers, custom_prayer_location
    ):
        """Updating a user-owned item with a valid name returns 200."""
        item_id = custom_prayer_location["id"]
        resp = api_client.put(
            f"{BASE_URL}/{item_id}",
            json={"name": "Updated Location Name"},
            headers=auth_headers,
        )

        body = assert_success(resp)
        assert body["data"]["name"] == "Updated Location Name"

    def test_update_system_default_returns_404(
        self, api_client, auth_headers, default_prayer_location_id
    ):
        """Updating a system default item returns 404.

        System defaults have no userId, so the ownership-scoped query returns
        'not found' rather than 'forbidden'.
        """
        resp = api_client.put(
            f"{BASE_URL}/{default_prayer_location_id}",
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

    def test_update_other_users_item_returns_404(
        self, api_client, auth_headers, second_auth_headers
    ):
        """Updating another user's item returns 404 (not visible)."""
        # User 2 creates an item
        create_resp = api_client.post(
            BASE_URL,
            json={"name": "User2 Exclusive Location"},
            headers=second_auth_headers,
        )
        item_id = create_resp.json()["data"]["id"]

        # User 1 tries to update it
        resp = api_client.put(
            f"{BASE_URL}/{item_id}",
            json={"name": "Stolen"},
            headers=auth_headers,
        )

        assert_not_found(resp)

    def test_update_invalid_name_returns_422(
        self, api_client, auth_headers, custom_prayer_location
    ):
        """Updating with an invalid (too short) name returns 422."""
        item_id = custom_prayer_location["id"]
        resp = api_client.put(
            f"{BASE_URL}/{item_id}", json={"name": "X"}, headers=auth_headers
        )

        assert_validation_error(resp)

    def test_update_requires_auth(self, api_client, custom_prayer_location):
        """Updating without auth returns 401."""
        item_id = custom_prayer_location["id"]
        resp = api_client.put(
            f"{BASE_URL}/{item_id}", json={"name": "No Auth Update"}
        )

        assert_unauthorized(resp)


# ── DELETE /prayer-locations/:id ──────────────────────────────────────────────


class TestDeletePrayerLocation:
    """Tests for DELETE /api/v1/customization/prayer-locations/:id."""

    def test_delete_valid_returns_204(self, api_client, auth_headers):
        """Deleting a user-owned item returns 204 No Content."""
        # Create an item to delete
        create_resp = api_client.post(
            BASE_URL, json={"name": "Deletable Location"}, headers=auth_headers
        )
        item_id = create_resp.json()["data"]["id"]

        resp = api_client.delete(f"{BASE_URL}/{item_id}", headers=auth_headers)
        assert resp.status_code == 204

    def test_deleted_item_not_in_list(self, api_client, auth_headers):
        """After deletion, the item no longer appears in the list."""
        # Create and delete
        create_resp = api_client.post(
            BASE_URL, json={"name": "Vanishing Location"}, headers=auth_headers
        )
        item_id = create_resp.json()["data"]["id"]
        api_client.delete(f"{BASE_URL}/{item_id}", headers=auth_headers)

        # Verify it's gone
        list_resp = api_client.get(BASE_URL, headers=auth_headers)
        body = assert_success(list_resp)
        ids = [item["id"] for item in body["data"]]
        assert item_id not in ids

    def test_delete_system_default_returns_404(
        self, api_client, auth_headers, default_prayer_location_id
    ):
        """Deleting a system default item returns 404.

        System defaults have no userId, so the ownership-scoped query returns
        'not found' rather than 'forbidden'.
        """
        resp = api_client.delete(
            f"{BASE_URL}/{default_prayer_location_id}", headers=auth_headers
        )

        assert_not_found(resp)

    def test_delete_not_found_returns_404(self, api_client, auth_headers):
        """Deleting a non-existent item returns 404."""
        resp = api_client.delete(
            f"{BASE_URL}/{NONEXISTENT_ID}", headers=auth_headers
        )

        assert_not_found(resp)

    def test_delete_other_users_item_returns_404(
        self, api_client, auth_headers, second_auth_headers
    ):
        """Deleting another user's item returns 404 (not visible)."""
        create_resp = api_client.post(
            BASE_URL,
            json={"name": "User2 Undeletable"},
            headers=second_auth_headers,
        )
        item_id = create_resp.json()["data"]["id"]

        resp = api_client.delete(f"{BASE_URL}/{item_id}", headers=auth_headers)

        assert_not_found(resp)

    def test_delete_requires_auth(self, api_client):
        """Deleting without auth returns 401."""
        resp = api_client.delete(f"{BASE_URL}/{NONEXISTENT_ID}")

        assert_unauthorized(resp)
