"""Tests for /api/v1/tracking/prayers/daily CRUD endpoints."""

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
from utils.factories import daily_prayer_payload

pytestmark = pytest.mark.tracking

BASE_URL = "/api/v1/tracking/prayers/daily"

# A valid CUID that will never exist in the database
NONEXISTENT_ID = "clxxxxxxxxxxxxxxxxxxxxxxxxx"


# ── GET /prayers/daily ──────────────────────────────────────────────────────


class TestListDailyPrayers:
    """Tests for GET /api/v1/tracking/prayers/daily."""

    def test_list_returns_paginated_response(
        self, api_client, auth_headers, prayer_status_id
    ):
        """List endpoint returns a paginated structure with data array."""
        # Seed one record so the list is non-empty
        payload = daily_prayer_payload(prayer_status_id)
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

    def test_list_custom_page_and_limit(
        self, api_client, auth_headers, prayer_status_id
    ):
        """Specifying page and limit query params controls pagination."""
        resp = api_client.get(
            BASE_URL, params={"page": 1, "limit": 5}, headers=auth_headers
        )

        body = assert_success(resp)
        pagination = body["data"]
        assert pagination["page"] == 1
        assert pagination["limit"] == 5

    def test_list_does_not_show_other_users_logs(
        self, api_client, auth_headers, second_auth_headers, prayer_status_id
    ):
        """Logs created by user 2 are not visible to user 1."""
        # Fetch a prayer status ID for user 2
        ref_resp = api_client.get(
            "/api/v1/reference/prayer-statuses", headers=second_auth_headers
        )
        u2_status_id = ref_resp.json()["data"][0]["id"]

        payload = daily_prayer_payload(
            u2_status_id,
            prayer_name="ISHA",
            date=(date.today() - timedelta(days=10)).isoformat(),
        )
        create_resp = api_client.post(
            BASE_URL, json=payload, headers=second_auth_headers
        )
        created_id = create_resp.json()["data"]["id"]

        # User 1 lists — should not contain user 2's record
        resp = api_client.get(BASE_URL, headers=auth_headers)
        body = assert_success(resp)
        ids = [item["id"] for item in body["data"]["items"]]
        assert created_id not in ids


# ── POST /prayers/daily ─────────────────────────────────────────────────────


class TestCreateDailyPrayer:
    """Tests for POST /api/v1/tracking/prayers/daily."""

    def test_create_valid_returns_201(
        self, api_client, auth_headers, prayer_status_id
    ):
        """Creating with required fields returns 201."""
        payload = daily_prayer_payload(prayer_status_id)
        resp = api_client.post(BASE_URL, json=payload, headers=auth_headers)

        body = assert_created(resp)
        assert "id" in body["data"]
        assert body["data"]["prayerName"] == "FAJR"

    def test_create_with_all_fields(
        self, api_client, auth_headers, prayer_status_id, prayer_location_id
    ):
        """Creating with all optional fields returns 201."""
        payload = daily_prayer_payload(
            prayer_status_id,
            prayer_name="ZUHR",
            prayerLocationId=prayer_location_id,
            khushuRating=4,
            notes="Focused prayer",
        )
        resp = api_client.post(BASE_URL, json=payload, headers=auth_headers)

        body = assert_created(resp)
        assert body["data"]["prayerName"] == "ZUHR"
        assert body["data"]["khushuRating"] == 4
        assert body["data"]["notes"] == "Focused prayer"

    def test_create_missing_prayer_name_returns_422(
        self, api_client, auth_headers, prayer_status_id
    ):
        """Omitting prayerName returns 422."""
        payload = daily_prayer_payload(prayer_status_id)
        del payload["prayerName"]

        resp = api_client.post(BASE_URL, json=payload, headers=auth_headers)

        assert_validation_error(resp)

    def test_create_invalid_prayer_name_returns_422(
        self, api_client, auth_headers, prayer_status_id
    ):
        """Using an invalid prayer name enum value returns 422."""
        payload = daily_prayer_payload(
            prayer_status_id, prayer_name="INVALID_PRAYER"
        )

        resp = api_client.post(BASE_URL, json=payload, headers=auth_headers)

        assert_validation_error(resp)

    def test_create_invalid_status_id_returns_400(
        self, api_client, auth_headers
    ):
        """Using a non-existent prayerStatusId returns 400."""
        payload = daily_prayer_payload(NONEXISTENT_ID)

        resp = api_client.post(BASE_URL, json=payload, headers=auth_headers)

        assert_error(resp, 400)

    def test_create_invalid_location_id_returns_400(
        self, api_client, auth_headers, prayer_status_id
    ):
        """Using a non-existent prayerLocationId returns 400."""
        payload = daily_prayer_payload(
            prayer_status_id, prayerLocationId=NONEXISTENT_ID
        )

        resp = api_client.post(BASE_URL, json=payload, headers=auth_headers)

        assert_error(resp, 400)

    def test_create_khushu_below_1_returns_422(
        self, api_client, auth_headers, prayer_status_id
    ):
        """khushuRating below 1 returns 422."""
        payload = daily_prayer_payload(prayer_status_id, khushuRating=0)

        resp = api_client.post(BASE_URL, json=payload, headers=auth_headers)

        assert_validation_error(resp)

    def test_create_khushu_above_5_returns_422(
        self, api_client, auth_headers, prayer_status_id
    ):
        """khushuRating above 5 returns 422."""
        payload = daily_prayer_payload(prayer_status_id, khushuRating=6)

        resp = api_client.post(BASE_URL, json=payload, headers=auth_headers)

        assert_validation_error(resp)

    def test_create_requires_auth(self, api_client, prayer_status_id):
        """Creating without auth returns 401."""
        payload = daily_prayer_payload(prayer_status_id)

        resp = api_client.post(BASE_URL, json=payload)

        assert_unauthorized(resp)


# ── GET /prayers/daily/:id ──────────────────────────────────────────────────


class TestGetDailyPrayer:
    """Tests for GET /api/v1/tracking/prayers/daily/:id."""

    def test_get_valid_returns_200(
        self, api_client, auth_headers, prayer_status_id
    ):
        """Fetching an existing log by ID returns 200."""
        payload = daily_prayer_payload(prayer_status_id, prayer_name="ASR")
        create_resp = api_client.post(BASE_URL, json=payload, headers=auth_headers)
        item_id = create_resp.json()["data"]["id"]

        resp = api_client.get(f"{BASE_URL}/{item_id}", headers=auth_headers)

        body = assert_success(resp)
        assert body["data"]["id"] == item_id
        assert body["data"]["prayerName"] == "ASR"

    def test_get_not_found_returns_404(self, api_client, auth_headers):
        """Fetching a non-existent ID returns 404."""
        resp = api_client.get(
            f"{BASE_URL}/{NONEXISTENT_ID}", headers=auth_headers
        )

        assert_not_found(resp)

    def test_get_other_users_log_returns_404(
        self, api_client, auth_headers, second_auth_headers, prayer_status_id
    ):
        """Fetching another user's log returns 404."""
        # Fetch a prayer status ID for user 2
        ref_resp = api_client.get(
            "/api/v1/reference/prayer-statuses", headers=second_auth_headers
        )
        u2_status_id = ref_resp.json()["data"][0]["id"]

        payload = daily_prayer_payload(u2_status_id)
        create_resp = api_client.post(
            BASE_URL, json=payload, headers=second_auth_headers
        )
        item_id = create_resp.json()["data"]["id"]

        # User 1 tries to fetch it
        resp = api_client.get(f"{BASE_URL}/{item_id}", headers=auth_headers)

        assert_not_found(resp)

    def test_get_requires_auth(self, api_client):
        """Fetching without auth returns 401."""
        resp = api_client.get(f"{BASE_URL}/{NONEXISTENT_ID}")

        assert_unauthorized(resp)


# ── PUT /prayers/daily/:id ──────────────────────────────────────────────────


class TestUpdateDailyPrayer:
    """Tests for PUT /api/v1/tracking/prayers/daily/:id."""

    def test_update_valid_returns_200(
        self, api_client, auth_headers, prayer_status_id
    ):
        """Updating an existing log with valid data returns 200."""
        payload = daily_prayer_payload(prayer_status_id, prayer_name="FAJR")
        create_resp = api_client.post(BASE_URL, json=payload, headers=auth_headers)
        item_id = create_resp.json()["data"]["id"]

        resp = api_client.put(
            f"{BASE_URL}/{item_id}",
            json={"prayerName": "MAGHRIB", "khushuRating": 5},
            headers=auth_headers,
        )

        body = assert_success(resp)
        assert body["data"]["prayerName"] == "MAGHRIB"
        assert body["data"]["khushuRating"] == 5

    def test_update_not_found_returns_404(self, api_client, auth_headers):
        """Updating a non-existent log returns 404."""
        resp = api_client.put(
            f"{BASE_URL}/{NONEXISTENT_ID}",
            json={"prayerName": "ZUHR"},
            headers=auth_headers,
        )

        assert_not_found(resp)

    def test_update_other_users_log_returns_404(
        self, api_client, auth_headers, second_auth_headers, prayer_status_id
    ):
        """Updating another user's log returns 404."""
        ref_resp = api_client.get(
            "/api/v1/reference/prayer-statuses", headers=second_auth_headers
        )
        u2_status_id = ref_resp.json()["data"][0]["id"]

        payload = daily_prayer_payload(u2_status_id)
        create_resp = api_client.post(
            BASE_URL, json=payload, headers=second_auth_headers
        )
        item_id = create_resp.json()["data"]["id"]

        resp = api_client.put(
            f"{BASE_URL}/{item_id}",
            json={"prayerName": "ASR"},
            headers=auth_headers,
        )

        assert_not_found(resp)

    def test_update_invalid_fk_returns_400(
        self, api_client, auth_headers, prayer_status_id
    ):
        """Updating with a non-existent FK ID returns 400."""
        payload = daily_prayer_payload(prayer_status_id)
        create_resp = api_client.post(BASE_URL, json=payload, headers=auth_headers)
        item_id = create_resp.json()["data"]["id"]

        resp = api_client.put(
            f"{BASE_URL}/{item_id}",
            json={"prayerStatusId": NONEXISTENT_ID},
            headers=auth_headers,
        )

        assert_error(resp, 400)

    def test_update_requires_auth(self, api_client):
        """Updating without auth returns 401."""
        resp = api_client.put(
            f"{BASE_URL}/{NONEXISTENT_ID}", json={"prayerName": "ASR"}
        )

        assert_unauthorized(resp)


# ── DELETE /prayers/daily/:id ───────────────────────────────────────────────


class TestDeleteDailyPrayer:
    """Tests for DELETE /api/v1/tracking/prayers/daily/:id."""

    def test_delete_valid_returns_204(
        self, api_client, auth_headers, prayer_status_id
    ):
        """Deleting an existing log returns 204."""
        payload = daily_prayer_payload(prayer_status_id)
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
        self, api_client, auth_headers, second_auth_headers, prayer_status_id
    ):
        """Deleting another user's log returns 404."""
        ref_resp = api_client.get(
            "/api/v1/reference/prayer-statuses", headers=second_auth_headers
        )
        u2_status_id = ref_resp.json()["data"][0]["id"]

        payload = daily_prayer_payload(u2_status_id)
        create_resp = api_client.post(
            BASE_URL, json=payload, headers=second_auth_headers
        )
        item_id = create_resp.json()["data"]["id"]

        resp = api_client.delete(f"{BASE_URL}/{item_id}", headers=auth_headers)

        assert_not_found(resp)

    def test_deleted_log_not_in_list(
        self, api_client, auth_headers, prayer_status_id
    ):
        """After deletion, the log no longer appears in the list."""
        payload = daily_prayer_payload(prayer_status_id, prayer_name="ISHA")
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
