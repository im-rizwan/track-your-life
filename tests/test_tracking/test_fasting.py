"""Tests for /api/v1/tracking/fasting CRUD endpoints."""

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
from utils.factories import fasting_log_payload

pytestmark = pytest.mark.tracking

NONEXISTENT_ID = "clxxxxxxxxxxxxxxxxxxxxxxxxx"
BASE_URL = "/api/v1/tracking/fasting"


# ── Helpers ────────────────────────────────────────────────────────────────────


def _create_log(api_client, auth_headers, fasting_type_id, **overrides):
    """Create a fasting log and return its response data."""
    payload = fasting_log_payload(fasting_type_id, **overrides)
    resp = api_client.post(BASE_URL, json=payload, headers=auth_headers)
    assert resp.status_code == 201, f"Setup: failed to create fasting log: {resp.text}"
    return resp.json()["data"]


# ── POST /tracking/fasting ─────────────────────────────────────────────────────


class TestCreateFastingLog:
    """Tests for POST /api/v1/tracking/fasting."""

    def test_create_valid_returns_201(self, api_client, auth_headers, fasting_type_id):
        """Creating with valid data returns 201."""
        payload = fasting_log_payload(fasting_type_id)
        resp = api_client.post(BASE_URL, json=payload, headers=auth_headers)

        body = assert_created(resp)
        assert "id" in body["data"]
        assert body["data"]["date"] is not None

    def test_create_with_notes_returns_201(self, api_client, auth_headers, fasting_type_id):
        """Creating with optional notes returns 201."""
        payload = fasting_log_payload(fasting_type_id, notes="Fasted the whole day")
        resp = api_client.post(BASE_URL, json=payload, headers=auth_headers)

        body = assert_created(resp)
        assert body["data"]["notes"] == "Fasted the whole day"

    def test_create_with_yesterday_date(self, api_client, auth_headers, fasting_type_id):
        """Creating with yesterday's date returns 201."""
        yesterday = (date.today() - timedelta(days=1)).isoformat()
        payload = fasting_log_payload(fasting_type_id, date=yesterday)
        resp = api_client.post(BASE_URL, json=payload, headers=auth_headers)

        assert_created(resp)

    def test_create_missing_fasting_type_id_returns_422(self, api_client, auth_headers):
        """Omitting fastingTypeId returns 422."""
        payload = {"date": date.today().isoformat()}
        resp = api_client.post(BASE_URL, json=payload, headers=auth_headers)

        assert_validation_error(resp)

    def test_create_missing_date_returns_422(self, api_client, auth_headers, fasting_type_id):
        """Omitting date returns 422."""
        payload = {"fastingTypeId": fasting_type_id}
        resp = api_client.post(BASE_URL, json=payload, headers=auth_headers)

        assert_validation_error(resp)

    def test_create_invalid_fasting_type_id_returns_400(self, api_client, auth_headers):
        """Providing a nonexistent fastingTypeId returns 400."""
        payload = fasting_log_payload(NONEXISTENT_ID)
        resp = api_client.post(BASE_URL, json=payload, headers=auth_headers)

        assert_error(resp, 400)

    def test_create_notes_too_long_returns_422(self, api_client, auth_headers, fasting_type_id):
        """Notes exceeding 500 characters returns 422."""
        payload = fasting_log_payload(fasting_type_id, notes="A" * 501)
        resp = api_client.post(BASE_URL, json=payload, headers=auth_headers)

        assert_validation_error(resp)

    def test_create_requires_auth(self, api_client, fasting_type_id):
        """Creating without auth returns 401."""
        payload = fasting_log_payload(fasting_type_id)
        resp = api_client.post(BASE_URL, json=payload)

        assert_unauthorized(resp)


# ── GET /tracking/fasting ──────────────────────────────────────────────────────


class TestListFastingLogs:
    """Tests for GET /api/v1/tracking/fasting."""

    def test_list_returns_200_with_paginated_data(self, api_client, auth_headers, fasting_type_id):
        """Listing fasting logs returns 200 with paginated structure."""
        _create_log(api_client, auth_headers, fasting_type_id)

        resp = api_client.get(BASE_URL, headers=auth_headers)

        body = assert_success(resp)
        assert "items" in body["data"]
        assert "page" in body["data"]
        assert isinstance(body["data"]["items"], list)

    def test_list_contains_created_log(self, api_client, auth_headers, fasting_type_id):
        """A newly created log appears in the list."""
        created = _create_log(api_client, auth_headers, fasting_type_id)

        resp = api_client.get(BASE_URL, headers=auth_headers)
        body = assert_success(resp)
        ids = [item["id"] for item in body["data"]["items"]]
        assert created["id"] in ids

    def test_list_requires_auth(self, api_client):
        """Listing without auth returns 401."""
        resp = api_client.get(BASE_URL)

        assert_unauthorized(resp)


# ── GET /tracking/fasting/:id ─────────────────────────────────────────────────


class TestGetFastingLog:
    """Tests for GET /api/v1/tracking/fasting/:id."""

    def test_get_returns_200(self, api_client, auth_headers, fasting_type_id):
        """Getting an existing log returns 200."""
        created = _create_log(api_client, auth_headers, fasting_type_id)

        resp = api_client.get(f"{BASE_URL}/{created['id']}", headers=auth_headers)

        body = assert_success(resp)
        assert body["data"]["id"] == created["id"]

    def test_get_not_found_returns_404(self, api_client, auth_headers):
        """Getting a nonexistent log returns 404."""
        resp = api_client.get(f"{BASE_URL}/{NONEXISTENT_ID}", headers=auth_headers)

        assert_not_found(resp)

    def test_get_other_users_log_returns_404(
        self, api_client, auth_headers, second_auth_headers, fasting_type_id
    ):
        """Getting another user's log returns 404."""
        created = _create_log(api_client, second_auth_headers, fasting_type_id)

        resp = api_client.get(f"{BASE_URL}/{created['id']}", headers=auth_headers)

        assert_not_found(resp)

    def test_get_requires_auth(self, api_client):
        """Getting without auth returns 401."""
        resp = api_client.get(f"{BASE_URL}/{NONEXISTENT_ID}")

        assert_unauthorized(resp)


# ── PUT /tracking/fasting/:id ─────────────────────────────────────────────────


class TestUpdateFastingLog:
    """Tests for PUT /api/v1/tracking/fasting/:id."""

    def test_update_notes_returns_200(self, api_client, auth_headers, fasting_type_id):
        """Updating notes returns 200."""
        created = _create_log(api_client, auth_headers, fasting_type_id)

        resp = api_client.put(
            f"{BASE_URL}/{created['id']}",
            json={"notes": "Updated note"},
            headers=auth_headers,
        )

        body = assert_success(resp)
        assert body["data"]["notes"] == "Updated note"

    def test_update_not_found_returns_404(self, api_client, auth_headers):
        """Updating a nonexistent log returns 404."""
        resp = api_client.put(
            f"{BASE_URL}/{NONEXISTENT_ID}",
            json={"notes": "Ghost"},
            headers=auth_headers,
        )

        assert_not_found(resp)

    def test_update_other_users_log_returns_404(
        self, api_client, auth_headers, second_auth_headers, fasting_type_id
    ):
        """Updating another user's log returns 404."""
        created = _create_log(api_client, second_auth_headers, fasting_type_id)

        resp = api_client.put(
            f"{BASE_URL}/{created['id']}",
            json={"notes": "Stolen"},
            headers=auth_headers,
        )

        assert_not_found(resp)

    def test_update_requires_auth(self, api_client):
        """Updating without auth returns 401."""
        resp = api_client.put(
            f"{BASE_URL}/{NONEXISTENT_ID}", json={"notes": "No Auth"}
        )

        assert_unauthorized(resp)


# ── DELETE /tracking/fasting/:id ──────────────────────────────────────────────


class TestDeleteFastingLog:
    """Tests for DELETE /api/v1/tracking/fasting/:id."""

    def test_delete_returns_204(self, api_client, auth_headers, fasting_type_id):
        """Deleting an existing log returns 204."""
        created = _create_log(api_client, auth_headers, fasting_type_id)

        resp = api_client.delete(f"{BASE_URL}/{created['id']}", headers=auth_headers)
        assert resp.status_code == 204

    def test_delete_not_found_returns_404(self, api_client, auth_headers):
        """Deleting a nonexistent log returns 404."""
        resp = api_client.delete(f"{BASE_URL}/{NONEXISTENT_ID}", headers=auth_headers)

        assert_not_found(resp)

    def test_delete_other_users_log_returns_404(
        self, api_client, auth_headers, second_auth_headers, fasting_type_id
    ):
        """Deleting another user's log returns 404."""
        created = _create_log(api_client, second_auth_headers, fasting_type_id)

        resp = api_client.delete(f"{BASE_URL}/{created['id']}", headers=auth_headers)

        assert_not_found(resp)

    def test_delete_requires_auth(self, api_client):
        """Deleting without auth returns 401."""
        resp = api_client.delete(f"{BASE_URL}/{NONEXISTENT_ID}")

        assert_unauthorized(resp)

    def test_deleted_log_not_in_list(self, api_client, auth_headers, fasting_type_id):
        """After deletion, the log no longer appears in the list."""
        created = _create_log(api_client, auth_headers, fasting_type_id)
        api_client.delete(f"{BASE_URL}/{created['id']}", headers=auth_headers)

        resp = api_client.get(BASE_URL, headers=auth_headers)
        body = assert_success(resp)
        ids = [item["id"] for item in body["data"]["items"]]
        assert created["id"] not in ids
