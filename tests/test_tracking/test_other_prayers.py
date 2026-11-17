"""Tests for /api/v1/tracking/prayers/other CRUD endpoints."""

import pytest
from datetime import date, timedelta

from utils.assertions import (
    assert_success,
    assert_created,
    assert_error,
    assert_unauthorized,
    assert_not_found,
    assert_validation_error,
)
from utils.factories import other_prayer_payload

pytestmark = pytest.mark.tracking

BASE_URL = "/api/v1/tracking/prayers/other"

# A valid CUID that will never exist in the database
NONEXISTENT_ID = "clxxxxxxxxxxxxxxxxxxxxxxxxx"


# ── GET /prayers/other ──────────────────────────────────────────────────────


class TestListOtherPrayers:
    """Tests for GET /api/v1/tracking/prayers/other."""

    def test_list_returns_paginated_response(
        self, api_client, auth_headers, other_prayer_type_id
    ):
        """List endpoint returns a paginated structure with data array."""
        payload = other_prayer_payload(other_prayer_type_id)
        api_client.post(BASE_URL, json=payload, headers=auth_headers)

        resp = api_client.get(BASE_URL, headers=auth_headers)

        body = assert_success(resp)
        assert "items" in body["data"]
        assert "page" in body["data"]
        assert isinstance(body["data"]["items"], list)

    def test_list_requires_auth(self, api_client):
        """Request without auth token returns 401."""
        resp = api_client.get(BASE_URL)

        assert_unauthorized(resp)

    def test_list_default_pagination(self, api_client, auth_headers):
        """Default pagination uses page=1 with a reasonable limit."""
        resp = api_client.get(BASE_URL, headers=auth_headers)

        body = assert_success(resp)
        pagination = body["data"]
        assert pagination["page"] == 1
        assert "limit" in pagination

    def test_list_custom_page_and_limit(self, api_client, auth_headers):
        """Specifying page and limit query params controls pagination."""
        resp = api_client.get(
            BASE_URL, params={"page": 1, "limit": 5}, headers=auth_headers
        )

        body = assert_success(resp)
        pagination = body["data"]
        assert pagination["page"] == 1
        assert pagination["limit"] == 5

    def test_list_does_not_show_other_users_logs(
        self, api_client, auth_headers, second_auth_headers
    ):
        """Logs created by user 2 are not visible to user 1."""
        # Get an other prayer type ID for user 2
        ref_resp = api_client.get(
            "/api/v1/customization/other-prayer-types",
            headers=second_auth_headers,
        )
        u2_type_id = ref_resp.json()["data"][0]["id"]

        payload = other_prayer_payload(
            u2_type_id,
            date=(date.today() - timedelta(days=10)).isoformat(),
        )
        create_resp = api_client.post(
            BASE_URL, json=payload, headers=second_auth_headers
        )
        created_id = create_resp.json()["data"]["id"]

        resp = api_client.get(BASE_URL, headers=auth_headers)
        body = assert_success(resp)
        ids = [item["id"] for item in body["data"]["items"]]
        assert created_id not in ids


# ── POST /prayers/other ─────────────────────────────────────────────────────


class TestCreateOtherPrayer:
    """Tests for POST /api/v1/tracking/prayers/other."""

    def test_create_valid_returns_201(
        self, api_client, auth_headers, other_prayer_type_id
    ):
        """Creating with required fields returns 201."""
        payload = other_prayer_payload(other_prayer_type_id)
        resp = api_client.post(BASE_URL, json=payload, headers=auth_headers)

        body = assert_created(resp)
        assert "id" in body["data"]

    def test_create_with_all_fields(
        self, api_client, auth_headers, other_prayer_type_id
    ):
        """Creating with all optional fields returns 201."""
        payload = other_prayer_payload(
            other_prayer_type_id,
            rakahs=4,
            notes="Tahajjud prayer",
        )
        resp = api_client.post(BASE_URL, json=payload, headers=auth_headers)

        body = assert_created(resp)
        assert body["data"]["rakahs"] == 4
        assert body["data"]["notes"] == "Tahajjud prayer"

    def test_create_missing_other_prayer_type_id_returns_422(
        self, api_client, auth_headers
    ):
        """Omitting otherPrayerTypeId returns 422."""
        payload = {"date": date.today().isoformat()}

        resp = api_client.post(BASE_URL, json=payload, headers=auth_headers)

        assert_validation_error(resp)

    def test_create_invalid_other_prayer_type_id_returns_400(
        self, api_client, auth_headers
    ):
        """Using a non-existent otherPrayerTypeId returns 400."""
        payload = other_prayer_payload(NONEXISTENT_ID)

        resp = api_client.post(BASE_URL, json=payload, headers=auth_headers)

        assert_error(resp, 400)

    def test_create_rakahs_below_2_returns_422(
        self, api_client, auth_headers, other_prayer_type_id
    ):
        """rakahs below 2 returns 422."""
        payload = other_prayer_payload(other_prayer_type_id, rakahs=1)

        resp = api_client.post(BASE_URL, json=payload, headers=auth_headers)

        assert_validation_error(resp)

    def test_create_rakahs_above_12_returns_422(
        self, api_client, auth_headers, other_prayer_type_id
    ):
        """rakahs above 12 returns 422."""
        payload = other_prayer_payload(other_prayer_type_id, rakahs=13)

        resp = api_client.post(BASE_URL, json=payload, headers=auth_headers)

        assert_validation_error(resp)

    def test_create_requires_auth(self, api_client, other_prayer_type_id):
        """Creating without auth returns 401."""
        payload = other_prayer_payload(other_prayer_type_id)

        resp = api_client.post(BASE_URL, json=payload)

        assert_unauthorized(resp)


# ── GET /prayers/other/:id ──────────────────────────────────────────────────


class TestGetOtherPrayer:
    """Tests for GET /api/v1/tracking/prayers/other/:id."""

    def test_get_valid_returns_200(
        self, api_client, auth_headers, other_prayer_type_id
    ):
        """Fetching an existing log by ID returns 200."""
        payload = other_prayer_payload(other_prayer_type_id)
        create_resp = api_client.post(BASE_URL, json=payload, headers=auth_headers)
        item_id = create_resp.json()["data"]["id"]

        resp = api_client.get(f"{BASE_URL}/{item_id}", headers=auth_headers)

        body = assert_success(resp)
        assert body["data"]["id"] == item_id

    def test_get_not_found_returns_404(self, api_client, auth_headers):
        """Fetching a non-existent ID returns 404."""
        resp = api_client.get(
            f"{BASE_URL}/{NONEXISTENT_ID}", headers=auth_headers
        )

        assert_not_found(resp)

    def test_get_other_users_log_returns_404(
        self, api_client, auth_headers, second_auth_headers
    ):
        """Fetching another user's log returns 404."""
        ref_resp = api_client.get(
            "/api/v1/customization/other-prayer-types",
            headers=second_auth_headers,
        )
        u2_type_id = ref_resp.json()["data"][0]["id"]

        payload = other_prayer_payload(u2_type_id)
        create_resp = api_client.post(
            BASE_URL, json=payload, headers=second_auth_headers
        )
        item_id = create_resp.json()["data"]["id"]

        resp = api_client.get(f"{BASE_URL}/{item_id}", headers=auth_headers)

        assert_not_found(resp)

    def test_get_requires_auth(self, api_client):
        """Fetching without auth returns 401."""
        resp = api_client.get(f"{BASE_URL}/{NONEXISTENT_ID}")

        assert_unauthorized(resp)


# ── PUT /prayers/other/:id ──────────────────────────────────────────────────


class TestUpdateOtherPrayer:
    """Tests for PUT /api/v1/tracking/prayers/other/:id."""

    def test_update_valid_returns_200(
        self, api_client, auth_headers, other_prayer_type_id
    ):
        """Updating an existing log with valid data returns 200."""
        payload = other_prayer_payload(other_prayer_type_id)
        create_resp = api_client.post(BASE_URL, json=payload, headers=auth_headers)
        item_id = create_resp.json()["data"]["id"]

        resp = api_client.put(
            f"{BASE_URL}/{item_id}",
            json={"rakahs": 6, "notes": "Updated notes"},
            headers=auth_headers,
        )

        body = assert_success(resp)
        assert body["data"]["rakahs"] == 6
        assert body["data"]["notes"] == "Updated notes"

    def test_update_not_found_returns_404(self, api_client, auth_headers):
        """Updating a non-existent log returns 404."""
        resp = api_client.put(
            f"{BASE_URL}/{NONEXISTENT_ID}",
            json={"rakahs": 4},
            headers=auth_headers,
        )

        assert_not_found(resp)

    def test_update_other_users_log_returns_404(
        self, api_client, auth_headers, second_auth_headers
    ):
        """Updating another user's log returns 404."""
        ref_resp = api_client.get(
            "/api/v1/customization/other-prayer-types",
            headers=second_auth_headers,
        )
        u2_type_id = ref_resp.json()["data"][0]["id"]

        payload = other_prayer_payload(u2_type_id)
        create_resp = api_client.post(
            BASE_URL, json=payload, headers=second_auth_headers
        )
        item_id = create_resp.json()["data"]["id"]

        resp = api_client.put(
            f"{BASE_URL}/{item_id}",
            json={"rakahs": 8},
            headers=auth_headers,
        )

        assert_not_found(resp)

    def test_update_invalid_fk_returns_400(
        self, api_client, auth_headers, other_prayer_type_id
    ):
        """Updating with a non-existent FK ID returns 400."""
        payload = other_prayer_payload(other_prayer_type_id)
        create_resp = api_client.post(BASE_URL, json=payload, headers=auth_headers)
        item_id = create_resp.json()["data"]["id"]

        resp = api_client.put(
            f"{BASE_URL}/{item_id}",
            json={"otherPrayerTypeId": NONEXISTENT_ID},
            headers=auth_headers,
        )

        assert_error(resp, 400)

    def test_update_requires_auth(self, api_client):
        """Updating without auth returns 401."""
        resp = api_client.put(
            f"{BASE_URL}/{NONEXISTENT_ID}", json={"rakahs": 4}
        )

        assert_unauthorized(resp)


# ── DELETE /prayers/other/:id ───────────────────────────────────────────────


class TestDeleteOtherPrayer:
    """Tests for DELETE /api/v1/tracking/prayers/other/:id."""

    def test_delete_valid_returns_204(
        self, api_client, auth_headers, other_prayer_type_id
    ):
        """Deleting an existing log returns 204."""
        payload = other_prayer_payload(other_prayer_type_id)
        create_resp = api_client.post(BASE_URL, json=payload, headers=auth_headers)
        item_id = create_resp.json()["data"]["id"]

        resp = api_client.delete(f"{BASE_URL}/{item_id}", headers=auth_headers)

        assert resp.status_code == 204

    def test_delete_not_found_returns_404(self, api_client, auth_headers):
        """Deleting a non-existent log returns 404."""
        resp = api_client.delete(
            f"{BASE_URL}/{NONEXISTENT_ID}", headers=auth_headers
        )

        assert_not_found(resp)

    def test_delete_other_users_log_returns_404(
        self, api_client, auth_headers, second_auth_headers
    ):
        """Deleting another user's log returns 404."""
        ref_resp = api_client.get(
            "/api/v1/customization/other-prayer-types",
            headers=second_auth_headers,
        )
        u2_type_id = ref_resp.json()["data"][0]["id"]

        payload = other_prayer_payload(u2_type_id)
        create_resp = api_client.post(
            BASE_URL, json=payload, headers=second_auth_headers
        )
        item_id = create_resp.json()["data"]["id"]

        resp = api_client.delete(f"{BASE_URL}/{item_id}", headers=auth_headers)

        assert_not_found(resp)

    def test_deleted_log_not_in_list(
        self, api_client, auth_headers, other_prayer_type_id
    ):
        """After deletion, the log no longer appears in the list."""
        payload = other_prayer_payload(other_prayer_type_id)
        create_resp = api_client.post(BASE_URL, json=payload, headers=auth_headers)
        item_id = create_resp.json()["data"]["id"]

        api_client.delete(f"{BASE_URL}/{item_id}", headers=auth_headers)

        list_resp = api_client.get(BASE_URL, headers=auth_headers)
        body = assert_success(list_resp)
        ids = [item["id"] for item in body["data"]["items"]]
        assert item_id not in ids

    def test_delete_requires_auth(self, api_client):
        """Deleting without auth returns 401."""
        resp = api_client.delete(f"{BASE_URL}/{NONEXISTENT_ID}")

        assert_unauthorized(resp)
