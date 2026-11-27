"""Tests for /api/v1/tracking/quran CRUD endpoints."""

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
from utils.factories import quran_log_payload

pytestmark = pytest.mark.tracking

BASE_URL = "/api/v1/tracking/quran"

# A valid CUID that will never exist in the database
NONEXISTENT_ID = "clxxxxxxxxxxxxxxxxxxxxxxxxx"


# ── GET /quran ──────────────────────────────────────────────────────────────


class TestListQuranLogs:
    """Tests for GET /api/v1/tracking/quran."""

    def test_list_returns_paginated_response(
        self, api_client, auth_headers, quran_activity_type_id
    ):
        """List endpoint returns a paginated structure with data array."""
        payload = quran_log_payload(quran_activity_type_id)
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
        # Get a quran activity type ID for user 2
        ref_resp = api_client.get(
            "/api/v1/reference/quran-activity-types",
            headers=second_auth_headers,
        )
        u2_type_id = ref_resp.json()["data"][0]["id"]

        payload = quran_log_payload(
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


# ── POST /quran ─────────────────────────────────────────────────────────────


class TestCreateQuranLog:
    """Tests for POST /api/v1/tracking/quran."""

    def test_create_valid_returns_201(
        self, api_client, auth_headers, quran_activity_type_id
    ):
        """Creating with required fields returns 201."""
        payload = quran_log_payload(quran_activity_type_id)
        resp = api_client.post(BASE_URL, json=payload, headers=auth_headers)

        body = assert_created(resp)
        assert "id" in body["data"]
        assert body["data"]["surahName"] == "Al-Fatiha"
        assert body["data"]["surahNumber"] == 1

    def test_create_with_all_fields(
        self, api_client, auth_headers, quran_activity_type_id
    ):
        """Creating with all optional fields returns 201."""
        payload = quran_log_payload(
            quran_activity_type_id,
            surahName="Al-Baqarah",
            surahNumber=2,
            versesCount=20,
            juzzNumber=1,
            notes="Memorization session",
        )
        resp = api_client.post(BASE_URL, json=payload, headers=auth_headers)

        body = assert_created(resp)
        assert body["data"]["surahName"] == "Al-Baqarah"
        assert body["data"]["surahNumber"] == 2
        assert body["data"]["juzzNumber"] == 1
        assert body["data"]["notes"] == "Memorization session"

    def test_create_missing_surah_name_returns_422(
        self, api_client, auth_headers, quran_activity_type_id
    ):
        """Omitting surahName returns 422."""
        payload = quran_log_payload(quran_activity_type_id)
        del payload["surahName"]

        resp = api_client.post(BASE_URL, json=payload, headers=auth_headers)

        assert_validation_error(resp)

    def test_create_missing_surah_number_returns_422(
        self, api_client, auth_headers, quran_activity_type_id
    ):
        """Omitting surahNumber returns 422."""
        payload = quran_log_payload(quran_activity_type_id)
        del payload["surahNumber"]

        resp = api_client.post(BASE_URL, json=payload, headers=auth_headers)

        assert_validation_error(resp)

    def test_create_surah_number_above_114_returns_422(
        self, api_client, auth_headers, quran_activity_type_id
    ):
        """surahNumber above 114 returns 422."""
        payload = quran_log_payload(quran_activity_type_id, surahNumber=115)

        resp = api_client.post(BASE_URL, json=payload, headers=auth_headers)

        assert_validation_error(resp)

    def test_create_surah_number_below_1_returns_422(
        self, api_client, auth_headers, quran_activity_type_id
    ):
        """surahNumber below 1 returns 422."""
        payload = quran_log_payload(quran_activity_type_id, surahNumber=0)

        resp = api_client.post(BASE_URL, json=payload, headers=auth_headers)

        assert_validation_error(resp)

    def test_create_juzz_number_above_30_returns_422(
        self, api_client, auth_headers, quran_activity_type_id
    ):
        """juzzNumber above 30 returns 422."""
        payload = quran_log_payload(quran_activity_type_id, juzzNumber=31)

        resp = api_client.post(BASE_URL, json=payload, headers=auth_headers)

        assert_validation_error(resp)

    def test_create_verses_count_below_1_returns_422(
        self, api_client, auth_headers, quran_activity_type_id
    ):
        """versesCount below 1 returns 422."""
        payload = quran_log_payload(quran_activity_type_id, versesCount=0)

        resp = api_client.post(BASE_URL, json=payload, headers=auth_headers)

        assert_validation_error(resp)

    def test_create_invalid_quran_activity_type_id_returns_400(
        self, api_client, auth_headers
    ):
        """Using a non-existent quranActivityTypeId returns 400."""
        payload = quran_log_payload(NONEXISTENT_ID)

        resp = api_client.post(BASE_URL, json=payload, headers=auth_headers)

        assert_error(resp, 400)

    def test_create_requires_auth(self, api_client, quran_activity_type_id):
        """Creating without auth returns 401."""
        payload = quran_log_payload(quran_activity_type_id)

        resp = api_client.post(BASE_URL, json=payload)

        assert_unauthorized(resp)

    def test_create_malformed_json_returns_400(self, api_client, auth_headers):
        """A request body that isn't valid JSON returns 400, not 500. Spot
        check confirming the global malformed-JSON fix (error-handler.ts)
        reaches the tracking module too, not just auth/users/customization."""
        resp = api_client.session.post(
            f"{api_client.base_url}{BASE_URL}",
            data='{"surahName":"bad',
            headers={**auth_headers, "Content-Type": "application/json"},
        )
        assert resp.status_code == 400
        assert resp.json()["error"]["code"] == "INVALID_JSON"


# ── GET /quran/:id ──────────────────────────────────────────────────────────


class TestGetQuranLog:
    """Tests for GET /api/v1/tracking/quran/:id."""

    def test_get_valid_returns_200(
        self, api_client, auth_headers, quran_activity_type_id
    ):
        """Fetching an existing log by ID returns 200."""
        payload = quran_log_payload(quran_activity_type_id)
        create_resp = api_client.post(BASE_URL, json=payload, headers=auth_headers)
        item_id = create_resp.json()["data"]["id"]

        resp = api_client.get(f"{BASE_URL}/{item_id}", headers=auth_headers)

        body = assert_success(resp)
        assert body["data"]["id"] == item_id
        assert body["data"]["surahName"] == "Al-Fatiha"

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
            "/api/v1/reference/quran-activity-types",
            headers=second_auth_headers,
        )
        u2_type_id = ref_resp.json()["data"][0]["id"]

        payload = quran_log_payload(u2_type_id)
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


# ── PUT /quran/:id ──────────────────────────────────────────────────────────


class TestUpdateQuranLog:
    """Tests for PUT /api/v1/tracking/quran/:id."""

    def test_update_valid_returns_200(
        self, api_client, auth_headers, quran_activity_type_id
    ):
        """Updating an existing log with valid data returns 200."""
        payload = quran_log_payload(quran_activity_type_id)
        create_resp = api_client.post(BASE_URL, json=payload, headers=auth_headers)
        item_id = create_resp.json()["data"]["id"]

        resp = api_client.put(
            f"{BASE_URL}/{item_id}",
            json={
                "surahName": "An-Nas",
                "surahNumber": 114,
                "versesCount": 6,
                "notes": "Updated review",
            },
            headers=auth_headers,
        )

        body = assert_success(resp)
        assert body["data"]["surahName"] == "An-Nas"
        assert body["data"]["surahNumber"] == 114
        assert body["data"]["versesCount"] == 6

    def test_update_not_found_returns_404(self, api_client, auth_headers):
        """Updating a non-existent log returns 404."""
        resp = api_client.put(
            f"{BASE_URL}/{NONEXISTENT_ID}",
            json={"surahName": "Ghost"},
            headers=auth_headers,
        )

        assert_not_found(resp)

    def test_update_other_users_log_returns_404(
        self, api_client, auth_headers, second_auth_headers
    ):
        """Updating another user's log returns 404."""
        ref_resp = api_client.get(
            "/api/v1/reference/quran-activity-types",
            headers=second_auth_headers,
        )
        u2_type_id = ref_resp.json()["data"][0]["id"]

        payload = quran_log_payload(u2_type_id)
        create_resp = api_client.post(
            BASE_URL, json=payload, headers=second_auth_headers
        )
        item_id = create_resp.json()["data"]["id"]

        resp = api_client.put(
            f"{BASE_URL}/{item_id}",
            json={"surahName": "Stolen"},
            headers=auth_headers,
        )

        assert_not_found(resp)

    def test_update_invalid_fk_returns_400(
        self, api_client, auth_headers, quran_activity_type_id
    ):
        """Updating with a non-existent FK ID returns 400."""
        payload = quran_log_payload(quran_activity_type_id)
        create_resp = api_client.post(BASE_URL, json=payload, headers=auth_headers)
        item_id = create_resp.json()["data"]["id"]

        resp = api_client.put(
            f"{BASE_URL}/{item_id}",
            json={"quranActivityTypeId": NONEXISTENT_ID},
            headers=auth_headers,
        )

        assert_error(resp, 400)

    def test_update_requires_auth(self, api_client):
        """Updating without auth returns 401."""
        resp = api_client.put(
            f"{BASE_URL}/{NONEXISTENT_ID}", json={"surahName": "No Auth"}
        )

        assert_unauthorized(resp)


# ── DELETE /quran/:id ───────────────────────────────────────────────────────


class TestDeleteQuranLog:
    """Tests for DELETE /api/v1/tracking/quran/:id."""

    def test_delete_valid_returns_204(
        self, api_client, auth_headers, quran_activity_type_id
    ):
        """Deleting an existing log returns 204."""
        payload = quran_log_payload(quran_activity_type_id)
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
            "/api/v1/reference/quran-activity-types",
            headers=second_auth_headers,
        )
        u2_type_id = ref_resp.json()["data"][0]["id"]

        payload = quran_log_payload(u2_type_id)
        create_resp = api_client.post(
            BASE_URL, json=payload, headers=second_auth_headers
        )
        item_id = create_resp.json()["data"]["id"]

        resp = api_client.delete(f"{BASE_URL}/{item_id}", headers=auth_headers)

        assert_not_found(resp)

    def test_deleted_log_not_in_list(
        self, api_client, auth_headers, quran_activity_type_id
    ):
        """After deletion, the log no longer appears in the list."""
        payload = quran_log_payload(quran_activity_type_id)
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
