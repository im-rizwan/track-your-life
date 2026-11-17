"""Tests for /api/v1/customization/intentions CRUD endpoints.

Intentions are user-owned only (no system defaults). Max name length is 200.
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

INTENTIONS_URL = "/api/v1/customization/intentions"

NONEXISTENT_ID = "clxxxxxxxxxxxxxxxxxxxxxxxxx"


# ── Helpers / fixtures ────────────────────────────────────────────────────────


@pytest.fixture
def custom_intention(api_client, auth_headers):
    """Create and return a user-owned intention."""
    resp = api_client.post(
        INTENTIONS_URL,
        json={"name": "Seek knowledge for the sake of Allah"},
        headers=auth_headers,
    )
    assert resp.status_code == 201
    return resp.json()["data"]


# ── GET /intentions ───────────────────────────────────────────────────────────


class TestListIntentions:
    """Tests for GET /api/v1/customization/intentions."""

    def test_list_intentions_empty(self, api_client, auth_headers):
        """A new user starts with an empty intentions list."""
        resp = api_client.get(INTENTIONS_URL, headers=auth_headers)

        body = assert_success(resp)
        assert isinstance(body["data"], list)

    def test_list_intentions_shows_created_item(
        self, api_client, auth_headers, custom_intention
    ):
        """After creating an intention, it appears in the list."""
        resp = api_client.get(INTENTIONS_URL, headers=auth_headers)

        body = assert_success(resp)
        ids = [item["id"] for item in body["data"]]
        assert custom_intention["id"] in ids

    def test_list_intentions_requires_auth(self, api_client):
        """GET without auth returns 401."""
        resp = api_client.get(INTENTIONS_URL)

        assert_unauthorized(resp)

    def test_list_does_not_show_other_users_intentions(
        self, api_client, auth_headers, second_auth_headers
    ):
        """A user does not see another user's intentions."""
        api_client.post(
            INTENTIONS_URL,
            json={"name": "User2 Secret Intention"},
            headers=second_auth_headers,
        )

        resp = api_client.get(INTENTIONS_URL, headers=auth_headers)
        body = assert_success(resp)
        names = [item["name"] for item in body["data"]]
        assert "User2 Secret Intention" not in names


# ── POST /intentions ─────────────────────────────────────────────────────────


class TestCreateIntention:
    """Tests for POST /api/v1/customization/intentions."""

    def test_create_intention_returns_201(self, api_client, auth_headers):
        """Creating with a valid name returns 201."""
        resp = api_client.post(
            INTENTIONS_URL,
            json={"name": "Be patient with family"},
            headers=auth_headers,
        )

        body = assert_created(resp)
        assert body["data"]["name"] == "Be patient with family"
        assert "id" in body["data"]

    def test_create_intention_duplicate_name_returns_409(
        self, api_client, auth_headers
    ):
        """Creating with a duplicate name returns 409.

        The API catches Prisma unique constraint violations for
        customization entities and returns a ConflictError (409).
        """
        name = "Duplicate Intention"
        api_client.post(
            INTENTIONS_URL, json={"name": name}, headers=auth_headers
        )

        resp = api_client.post(
            INTENTIONS_URL, json={"name": name}, headers=auth_headers
        )
        assert resp.status_code == 409, (
            f"Expected 409 for duplicate name, got {resp.status_code}: {resp.text}"
        )

    def test_create_intention_missing_name_returns_422(
        self, api_client, auth_headers
    ):
        """Omitting the name field returns 422."""
        resp = api_client.post(INTENTIONS_URL, json={}, headers=auth_headers)

        assert_validation_error(resp)

    def test_create_intention_name_too_short_returns_422(
        self, api_client, auth_headers
    ):
        """A name shorter than 2 characters returns 422."""
        resp = api_client.post(
            INTENTIONS_URL, json={"name": "X"}, headers=auth_headers
        )

        assert_validation_error(resp)

    def test_create_intention_name_too_long_returns_422(
        self, api_client, auth_headers
    ):
        """A name longer than 200 characters returns 422."""
        resp = api_client.post(
            INTENTIONS_URL, json={"name": "A" * 201}, headers=auth_headers
        )

        assert_validation_error(resp)

    def test_create_intention_name_at_max_length_succeeds(
        self, api_client, auth_headers
    ):
        """A name exactly 200 characters long is accepted."""
        resp = api_client.post(
            INTENTIONS_URL, json={"name": "B" * 200}, headers=auth_headers
        )

        assert_created(resp)

    def test_create_intention_requires_auth(self, api_client):
        """Creating without auth returns 401."""
        resp = api_client.post(
            INTENTIONS_URL, json={"name": "No Auth Intention"}
        )

        assert_unauthorized(resp)


# ── PUT /intentions/:id ──────────────────────────────────────────────────────


class TestUpdateIntention:
    """Tests for PUT /api/v1/customization/intentions/:id."""

    def test_update_intention_returns_200(
        self, api_client, auth_headers, custom_intention
    ):
        """Updating a user-owned intention returns 200."""
        resp = api_client.put(
            f"{INTENTIONS_URL}/{custom_intention['id']}",
            json={"name": "Updated Intention"},
            headers=auth_headers,
        )

        body = assert_success(resp)
        assert body["data"]["name"] == "Updated Intention"

    def test_update_intention_not_found_returns_404(
        self, api_client, auth_headers
    ):
        """Updating a non-existent intention returns 404."""
        resp = api_client.put(
            f"{INTENTIONS_URL}/{NONEXISTENT_ID}",
            json={"name": "Ghost"},
            headers=auth_headers,
        )

        assert_not_found(resp)

    def test_update_intention_other_user_returns_404(
        self, api_client, auth_headers, second_auth_headers
    ):
        """Updating another user's intention returns 404."""
        create_resp = api_client.post(
            INTENTIONS_URL,
            json={"name": "User2 Intention"},
            headers=second_auth_headers,
        )
        item_id = create_resp.json()["data"]["id"]

        resp = api_client.put(
            f"{INTENTIONS_URL}/{item_id}",
            json={"name": "Stolen"},
            headers=auth_headers,
        )

        assert_not_found(resp)

    def test_update_intention_requires_auth(self, api_client):
        """Updating without auth returns 401."""
        resp = api_client.put(
            f"{INTENTIONS_URL}/{NONEXISTENT_ID}",
            json={"name": "No Auth"},
        )

        assert_unauthorized(resp)


# ── DELETE /intentions/:id ───────────────────────────────────────────────────


class TestDeleteIntention:
    """Tests for DELETE /api/v1/customization/intentions/:id."""

    def test_delete_intention_returns_204(self, api_client, auth_headers):
        """Deleting a user-owned intention returns 204."""
        create_resp = api_client.post(
            INTENTIONS_URL,
            json={"name": "Deletable Intention"},
            headers=auth_headers,
        )
        item_id = create_resp.json()["data"]["id"]

        resp = api_client.delete(
            f"{INTENTIONS_URL}/{item_id}", headers=auth_headers
        )
        assert resp.status_code == 204

    def test_delete_intention_not_found_returns_404(
        self, api_client, auth_headers
    ):
        """Deleting a non-existent intention returns 404."""
        resp = api_client.delete(
            f"{INTENTIONS_URL}/{NONEXISTENT_ID}", headers=auth_headers
        )

        assert_not_found(resp)

    def test_delete_intention_other_user_returns_404(
        self, api_client, auth_headers, second_auth_headers
    ):
        """Deleting another user's intention returns 404."""
        create_resp = api_client.post(
            INTENTIONS_URL,
            json={"name": "User2 Undeletable Intention"},
            headers=second_auth_headers,
        )
        item_id = create_resp.json()["data"]["id"]

        resp = api_client.delete(
            f"{INTENTIONS_URL}/{item_id}", headers=auth_headers
        )

        assert_not_found(resp)

    def test_delete_intention_requires_auth(self, api_client):
        """Deleting without auth returns 401."""
        resp = api_client.delete(f"{INTENTIONS_URL}/{NONEXISTENT_ID}")

        assert_unauthorized(resp)

    def test_deleted_intention_not_in_list(self, api_client, auth_headers):
        """After deletion, the intention no longer appears in the list."""
        create_resp = api_client.post(
            INTENTIONS_URL,
            json={"name": "Vanishing Intention"},
            headers=auth_headers,
        )
        item_id = create_resp.json()["data"]["id"]
        api_client.delete(f"{INTENTIONS_URL}/{item_id}", headers=auth_headers)

        resp = api_client.get(INTENTIONS_URL, headers=auth_headers)
        body = assert_success(resp)
        ids = [item["id"] for item in body["data"]]
        assert item_id not in ids
