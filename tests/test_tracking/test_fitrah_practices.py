"""Integration tests for fitrah practice tracking endpoints.

Tests CRUD operations on /api/v1/tracking/fitrah-practices, including
validation of required fields (practices array, date), optional fields (notes),
many-to-many practice array behavior, FK integrity, and user isolation.
"""

import pytest

from utils.assertions import (
    assert_success,
    assert_created,
    assert_error,
    assert_unauthorized,
    assert_not_found,
    assert_validation_error,
)
from utils.factories import fitrah_practice_log_payload

pytestmark = pytest.mark.tracking

NONEXISTENT_ID = "clxxxxxxxxxxxxxxxxxxxxxxxxx"
URL = "/api/v1/tracking/fitrah-practices"


def _url(log_id=None):
    if log_id:
        return f"{URL}/{log_id}"
    return URL


def _create_log(api_client, auth_headers, practice_ids, **overrides):
    """Helper to create a fitrah practice log and return its response data."""
    payload = fitrah_practice_log_payload(practice_ids, **overrides)
    resp = api_client.post(URL, json=payload, headers=auth_headers)
    assert resp.status_code == 201, f"Setup create failed: {resp.text}"
    return resp.json()["data"]


# ── LIST ──────────────────────────────────────────────────────────────────────


class TestListFitrahPracticeLogs:
    """Tests for GET /api/v1/tracking/fitrah-practices."""

    def test_list_returns_200_with_paginated_structure(
        self, api_client, auth_headers, fitrah_practice_ids
    ):
        """Authenticated GET returns 200 with paginated data structure."""
        _create_log(api_client, auth_headers, fitrah_practice_ids[:1])

        resp = api_client.get(URL, headers=auth_headers)

        body = assert_success(resp)
        assert "items" in body["data"]
        assert "page" in body["data"]
        assert isinstance(body["data"]["items"], list)

    def test_list_includes_created_log(
        self, api_client, auth_headers, fitrah_practice_ids
    ):
        """A newly created fitrah practice log appears in the list."""
        created = _create_log(api_client, auth_headers, fitrah_practice_ids[:1])

        resp = api_client.get(URL, headers=auth_headers)
        body = assert_success(resp)
        ids = [item["id"] for item in body["data"]["items"]]
        assert created["id"] in ids

    def test_list_requires_auth(self, api_client):
        """GET without auth returns 401."""
        resp = api_client.get(URL)

        assert_unauthorized(resp)

    def test_list_does_not_show_other_users_logs(
        self, api_client, auth_headers, second_auth_headers, fitrah_practice_ids
    ):
        """Logs created by another user are not visible."""
        created = _create_log(
            api_client, second_auth_headers, fitrah_practice_ids[:1]
        )

        resp = api_client.get(URL, headers=auth_headers)
        body = assert_success(resp)
        ids = [item["id"] for item in body["data"]["items"]]
        assert created["id"] not in ids


# ── CREATE ────────────────────────────────────────────────────────────────────


class TestCreateFitrahPracticeLog:
    """Tests for POST /api/v1/tracking/fitrah-practices."""

    def test_create_valid_single_practice_returns_201(
        self, api_client, auth_headers, fitrah_practice_ids
    ):
        """Creating with a single practice ID returns 201."""
        payload = fitrah_practice_log_payload(fitrah_practice_ids[:1])

        resp = api_client.post(URL, json=payload, headers=auth_headers)

        body = assert_created(resp)
        assert "id" in body["data"]

    def test_create_with_multiple_practices_returns_201(
        self, api_client, auth_headers, fitrah_practice_ids
    ):
        """Creating with multiple practice IDs returns 201."""
        if len(fitrah_practice_ids) < 2:
            pytest.skip("Need at least 2 fitrah practices for this test")

        payload = fitrah_practice_log_payload(fitrah_practice_ids)

        resp = api_client.post(URL, json=payload, headers=auth_headers)

        body = assert_created(resp)
        assert "id" in body["data"]

    def test_create_with_all_optional_fields_returns_201(
        self, api_client, auth_headers, fitrah_practice_ids
    ):
        """Creating with notes populated returns 201."""
        payload = fitrah_practice_log_payload(
            fitrah_practice_ids[:1],
            notes="Morning fitrah practices completed",
        )

        resp = api_client.post(URL, json=payload, headers=auth_headers)

        body = assert_created(resp)
        assert body["data"]["notes"] == "Morning fitrah practices completed"

    def test_create_missing_practices_returns_422(
        self, api_client, auth_headers
    ):
        """Omitting practices field returns 422."""
        payload = {"date": "2026-01-15"}

        resp = api_client.post(URL, json=payload, headers=auth_headers)

        assert_validation_error(resp)

    def test_create_empty_practices_array_returns_422(
        self, api_client, auth_headers
    ):
        """An empty practices array returns 422."""
        payload = fitrah_practice_log_payload([])
        payload["practices"] = []

        resp = api_client.post(URL, json=payload, headers=auth_headers)

        assert_validation_error(resp)

    def test_create_missing_date_returns_422(
        self, api_client, auth_headers, fitrah_practice_ids
    ):
        """Omitting date returns 422."""
        payload = fitrah_practice_log_payload(fitrah_practice_ids[:1])
        del payload["date"]

        resp = api_client.post(URL, json=payload, headers=auth_headers)

        assert_validation_error(resp)

    def test_create_invalid_practice_id_in_array_returns_400(
        self, api_client, auth_headers
    ):
        """An invalid (non-existent) practice ID in the array returns 400."""
        payload = fitrah_practice_log_payload([NONEXISTENT_ID])

        resp = api_client.post(URL, json=payload, headers=auth_headers)

        assert_error(resp, 400)

    def test_create_requires_auth(self, api_client, fitrah_practice_ids):
        """Creating without auth returns 401."""
        payload = fitrah_practice_log_payload(fitrah_practice_ids[:1])

        resp = api_client.post(URL, json=payload)

        assert_unauthorized(resp)

    def test_create_duplicate_practice_id_returns_422(
        self, api_client, auth_headers, fitrah_practice_ids
    ):
        """A duplicate practice ID within the array is rejected with a clear
        422, not a confusing 409. Regression test: fitrahPracticeOnLog
        .createMany() has no skipDuplicates, so a duplicate ID previously
        threw a Prisma P2002 mid-transaction (rolling back the whole log),
        surfacing as a misleading "already exists" 409 for what is actually
        a client input mistake, not a real conflict."""
        practice_id = fitrah_practice_ids[0]
        payload = fitrah_practice_log_payload([practice_id, practice_id])

        resp = api_client.post(URL, json=payload, headers=auth_headers)

        assert_validation_error(resp)

    def test_create_malformed_json_returns_400(self, api_client, auth_headers):
        """A request body that isn't valid JSON returns 400, not 500."""
        resp = api_client.session.post(
            f"{api_client.base_url}{URL}",
            data='{"practices":"bad',
            headers={**auth_headers, "Content-Type": "application/json"},
        )
        assert resp.status_code == 400
        assert resp.json()["error"]["code"] == "INVALID_JSON"


# ── GET BY ID ─────────────────────────────────────────────────────────────────


class TestGetFitrahPracticeLog:
    """Tests for GET /api/v1/tracking/fitrah-practices/:id."""

    def test_get_by_id_returns_200(
        self, api_client, auth_headers, fitrah_practice_ids
    ):
        """Fetching an existing log by ID returns 200."""
        created = _create_log(api_client, auth_headers, fitrah_practice_ids[:1])

        resp = api_client.get(_url(created["id"]), headers=auth_headers)

        body = assert_success(resp)
        assert body["data"]["id"] == created["id"]

    def test_get_nonexistent_returns_404(self, api_client, auth_headers):
        """Fetching a non-existent log returns 404."""
        resp = api_client.get(_url(NONEXISTENT_ID), headers=auth_headers)

        assert_not_found(resp)

    def test_get_other_users_log_returns_404(
        self, api_client, auth_headers, second_auth_headers, fitrah_practice_ids
    ):
        """Fetching another user's log returns 404."""
        created = _create_log(
            api_client, second_auth_headers, fitrah_practice_ids[:1]
        )

        resp = api_client.get(_url(created["id"]), headers=auth_headers)

        assert_not_found(resp)

    def test_get_requires_auth(self, api_client):
        """Fetching without auth returns 401."""
        resp = api_client.get(_url(NONEXISTENT_ID))

        assert_unauthorized(resp)


# ── UPDATE ────────────────────────────────────────────────────────────────────


class TestUpdateFitrahPracticeLog:
    """Tests for PUT /api/v1/tracking/fitrah-practices/:id."""

    def test_update_notes_returns_200(
        self, api_client, auth_headers, fitrah_practice_ids
    ):
        """Updating notes on an existing log returns 200."""
        created = _create_log(api_client, auth_headers, fitrah_practice_ids[:1])

        resp = api_client.put(
            _url(created["id"]),
            json={"notes": "Updated fitrah notes"},
            headers=auth_headers,
        )

        body = assert_success(resp)
        assert body["data"]["notes"] == "Updated fitrah notes"

    def test_update_replaces_practices_array(
        self, api_client, auth_headers, fitrah_practice_ids
    ):
        """Updating practices replaces the entire array."""
        if len(fitrah_practice_ids) < 2:
            pytest.skip("Need at least 2 fitrah practices for this test")

        created = _create_log(
            api_client, auth_headers, fitrah_practice_ids[:1]
        )

        resp = api_client.put(
            _url(created["id"]),
            json={"practices": fitrah_practice_ids},
            headers=auth_headers,
        )

        body = assert_success(resp)
        assert "id" in body["data"]

    def test_update_nonexistent_returns_404(self, api_client, auth_headers):
        """Updating a non-existent log returns 404."""
        resp = api_client.put(
            _url(NONEXISTENT_ID),
            json={"notes": "Ghost"},
            headers=auth_headers,
        )

        assert_not_found(resp)

    def test_update_other_users_log_returns_404(
        self, api_client, auth_headers, second_auth_headers, fitrah_practice_ids
    ):
        """Updating another user's log returns 404."""
        created = _create_log(
            api_client, second_auth_headers, fitrah_practice_ids[:1]
        )

        resp = api_client.put(
            _url(created["id"]),
            json={"notes": "Stolen"},
            headers=auth_headers,
        )

        assert_not_found(resp)

    def test_update_requires_auth(self, api_client):
        """Updating without auth returns 401."""
        resp = api_client.put(
            _url(NONEXISTENT_ID), json={"notes": "No auth"}
        )

        assert_unauthorized(resp)

    def test_update_duplicate_practice_id_returns_422(
        self, api_client, auth_headers, fitrah_practice_ids
    ):
        """A duplicate practice ID within the update array is rejected with
        a clear 422, same fix as on create."""
        created = _create_log(api_client, auth_headers, fitrah_practice_ids[:1])
        practice_id = fitrah_practice_ids[0]

        resp = api_client.put(
            _url(created["id"]),
            json={"practices": [practice_id, practice_id]},
            headers=auth_headers,
        )

        assert_validation_error(resp)


# ── DELETE ────────────────────────────────────────────────────────────────────


class TestDeleteFitrahPracticeLog:
    """Tests for DELETE /api/v1/tracking/fitrah-practices/:id."""

    def test_delete_valid_returns_204(
        self, api_client, auth_headers, fitrah_practice_ids
    ):
        """Deleting an existing log returns 204."""
        created = _create_log(api_client, auth_headers, fitrah_practice_ids[:1])

        resp = api_client.delete(_url(created["id"]), headers=auth_headers)

        assert resp.status_code == 204

    def test_deleted_log_not_in_list(
        self, api_client, auth_headers, fitrah_practice_ids
    ):
        """After deletion, the log no longer appears in the list."""
        created = _create_log(api_client, auth_headers, fitrah_practice_ids[:1])
        api_client.delete(_url(created["id"]), headers=auth_headers)

        resp = api_client.get(URL, headers=auth_headers)
        body = assert_success(resp)
        ids = [item["id"] for item in body["data"]["items"]]
        assert created["id"] not in ids

    def test_delete_nonexistent_returns_404(self, api_client, auth_headers):
        """Deleting a non-existent log returns 404."""
        resp = api_client.delete(_url(NONEXISTENT_ID), headers=auth_headers)

        assert_not_found(resp)

    def test_delete_other_users_log_returns_404(
        self, api_client, auth_headers, second_auth_headers, fitrah_practice_ids
    ):
        """Deleting another user's log returns 404."""
        created = _create_log(
            api_client, second_auth_headers, fitrah_practice_ids[:1]
        )

        resp = api_client.delete(_url(created["id"]), headers=auth_headers)

        assert_not_found(resp)

    def test_delete_requires_auth(self, api_client):
        """Deleting without auth returns 401."""
        resp = api_client.delete(_url(NONEXISTENT_ID))

        assert_unauthorized(resp)
