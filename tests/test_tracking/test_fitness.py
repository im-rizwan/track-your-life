"""Integration tests for fitness tracking endpoints.

Tests CRUD operations on /api/v1/tracking/fitness, including validation
of required fields (fitnessActivityId, quantity, date), optional fields
(fitnessIntensityId, quantityUnit, notes), FK integrity, and user isolation.
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
from utils.factories import fitness_log_payload

pytestmark = pytest.mark.tracking

NONEXISTENT_ID = "clxxxxxxxxxxxxxxxxxxxxxxxxx"
URL = "/api/v1/tracking/fitness"


def _url(log_id=None):
    if log_id:
        return f"{URL}/{log_id}"
    return URL


def _create_log(api_client, auth_headers, fitness_activity_id, **overrides):
    """Helper to create a fitness log and return its response data."""
    payload = fitness_log_payload(fitness_activity_id, **overrides)
    resp = api_client.post(URL, json=payload, headers=auth_headers)
    assert resp.status_code == 201, f"Setup create failed: {resp.text}"
    return resp.json()["data"]


# ── LIST ──────────────────────────────────────────────────────────────────────


class TestListFitnessLogs:
    """Tests for GET /api/v1/tracking/fitness."""

    def test_list_returns_200_with_paginated_structure(
        self, api_client, auth_headers, fitness_activity_id
    ):
        """Authenticated GET returns 200 with paginated data structure."""
        _create_log(api_client, auth_headers, fitness_activity_id)

        resp = api_client.get(URL, headers=auth_headers)

        body = assert_success(resp)
        assert "items" in body["data"]
        assert "page" in body["data"]
        assert isinstance(body["data"]["items"], list)

    def test_list_includes_created_log(
        self, api_client, auth_headers, fitness_activity_id
    ):
        """A newly created fitness log appears in the list."""
        created = _create_log(api_client, auth_headers, fitness_activity_id)

        resp = api_client.get(URL, headers=auth_headers)
        body = assert_success(resp)
        ids = [item["id"] for item in body["data"]["items"]]
        assert created["id"] in ids

    def test_list_requires_auth(self, api_client):
        """GET without auth returns 401."""
        resp = api_client.get(URL)

        assert_unauthorized(resp)

    def test_list_does_not_show_other_users_logs(
        self, api_client, auth_headers, second_auth_headers, fitness_activity_id
    ):
        """Logs created by another user are not visible."""
        created = _create_log(api_client, second_auth_headers, fitness_activity_id)

        resp = api_client.get(URL, headers=auth_headers)
        body = assert_success(resp)
        ids = [item["id"] for item in body["data"]["items"]]
        assert created["id"] not in ids


# ── CREATE ────────────────────────────────────────────────────────────────────


class TestCreateFitnessLog:
    """Tests for POST /api/v1/tracking/fitness."""

    def test_create_valid_returns_201(
        self, api_client, auth_headers, fitness_activity_id
    ):
        """Creating with valid required fields returns 201."""
        payload = fitness_log_payload(fitness_activity_id)

        resp = api_client.post(URL, json=payload, headers=auth_headers)

        body = assert_created(resp)
        assert body["data"]["fitnessActivityId"] == fitness_activity_id
        assert body["data"]["quantity"] == payload["quantity"]

    def test_create_with_all_optional_fields_returns_201(
        self, api_client, auth_headers, fitness_activity_id, fitness_intensity_id
    ):
        """Creating with all optional fields populated returns 201."""
        payload = fitness_log_payload(
            fitness_activity_id,
            fitnessIntensityId=fitness_intensity_id,
            quantityUnit="minutes",
            notes="Morning workout session",
        )

        resp = api_client.post(URL, json=payload, headers=auth_headers)

        body = assert_created(resp)
        assert body["data"]["fitnessIntensityId"] == fitness_intensity_id
        assert body["data"]["quantityUnit"] == "minutes"
        assert body["data"]["notes"] == "Morning workout session"

    def test_create_missing_fitness_activity_id_returns_422(
        self, api_client, auth_headers
    ):
        """Omitting fitnessActivityId returns 422."""
        payload = {"quantity": 30, "date": "2026-01-15"}

        resp = api_client.post(URL, json=payload, headers=auth_headers)

        assert_validation_error(resp)

    def test_create_missing_quantity_returns_422(
        self, api_client, auth_headers, fitness_activity_id
    ):
        """Omitting quantity returns 422."""
        payload = fitness_log_payload(fitness_activity_id)
        del payload["quantity"]

        resp = api_client.post(URL, json=payload, headers=auth_headers)

        assert_validation_error(resp)

    def test_create_missing_date_returns_422(
        self, api_client, auth_headers, fitness_activity_id
    ):
        """Omitting date returns 422."""
        payload = fitness_log_payload(fitness_activity_id)
        del payload["date"]

        resp = api_client.post(URL, json=payload, headers=auth_headers)

        assert_validation_error(resp)

    def test_create_quantity_less_than_1_returns_422(
        self, api_client, auth_headers, fitness_activity_id
    ):
        """Quantity < 1 returns 422."""
        payload = fitness_log_payload(fitness_activity_id, quantity=0)

        resp = api_client.post(URL, json=payload, headers=auth_headers)

        assert_validation_error(resp)

    def test_create_invalid_fitness_activity_id_returns_400(
        self, api_client, auth_headers
    ):
        """An invalid (non-existent) fitnessActivityId returns 400."""
        payload = fitness_log_payload(NONEXISTENT_ID)

        resp = api_client.post(URL, json=payload, headers=auth_headers)

        assert_error(resp, 400)

    def test_create_invalid_fitness_intensity_id_returns_400(
        self, api_client, auth_headers, fitness_activity_id
    ):
        """An invalid (non-existent) fitnessIntensityId returns 400."""
        payload = fitness_log_payload(
            fitness_activity_id, fitnessIntensityId=NONEXISTENT_ID
        )

        resp = api_client.post(URL, json=payload, headers=auth_headers)

        assert_error(resp, 400)

    def test_create_requires_auth(self, api_client, fitness_activity_id):
        """Creating without auth returns 401."""
        payload = fitness_log_payload(fitness_activity_id)

        resp = api_client.post(URL, json=payload)

        assert_unauthorized(resp)


# ── GET BY ID ─────────────────────────────────────────────────────────────────


class TestGetFitnessLog:
    """Tests for GET /api/v1/tracking/fitness/:id."""

    def test_get_by_id_returns_200(
        self, api_client, auth_headers, fitness_activity_id
    ):
        """Fetching an existing log by ID returns 200."""
        created = _create_log(api_client, auth_headers, fitness_activity_id)

        resp = api_client.get(_url(created["id"]), headers=auth_headers)

        body = assert_success(resp)
        assert body["data"]["id"] == created["id"]

    def test_get_nonexistent_returns_404(self, api_client, auth_headers):
        """Fetching a non-existent log returns 404."""
        resp = api_client.get(_url(NONEXISTENT_ID), headers=auth_headers)

        assert_not_found(resp)

    def test_get_other_users_log_returns_404(
        self, api_client, auth_headers, second_auth_headers, fitness_activity_id
    ):
        """Fetching another user's log returns 404."""
        created = _create_log(api_client, second_auth_headers, fitness_activity_id)

        resp = api_client.get(_url(created["id"]), headers=auth_headers)

        assert_not_found(resp)

    def test_get_requires_auth(self, api_client):
        """Fetching without auth returns 401."""
        resp = api_client.get(_url(NONEXISTENT_ID))

        assert_unauthorized(resp)


# ── UPDATE ────────────────────────────────────────────────────────────────────


class TestUpdateFitnessLog:
    """Tests for PUT /api/v1/tracking/fitness/:id."""

    def test_update_valid_returns_200(
        self, api_client, auth_headers, fitness_activity_id
    ):
        """Updating an existing log with valid data returns 200."""
        created = _create_log(api_client, auth_headers, fitness_activity_id)

        resp = api_client.put(
            _url(created["id"]),
            json={"quantity": 60},
            headers=auth_headers,
        )

        body = assert_success(resp)
        assert body["data"]["quantity"] == 60

    def test_update_notes_returns_200(
        self, api_client, auth_headers, fitness_activity_id
    ):
        """Updating notes on an existing log returns 200."""
        created = _create_log(api_client, auth_headers, fitness_activity_id)

        resp = api_client.put(
            _url(created["id"]),
            json={"notes": "Updated notes"},
            headers=auth_headers,
        )

        body = assert_success(resp)
        assert body["data"]["notes"] == "Updated notes"

    def test_update_nonexistent_returns_404(self, api_client, auth_headers):
        """Updating a non-existent log returns 404."""
        resp = api_client.put(
            _url(NONEXISTENT_ID),
            json={"quantity": 10},
            headers=auth_headers,
        )

        assert_not_found(resp)

    def test_update_other_users_log_returns_404(
        self, api_client, auth_headers, second_auth_headers, fitness_activity_id
    ):
        """Updating another user's log returns 404."""
        created = _create_log(api_client, second_auth_headers, fitness_activity_id)

        resp = api_client.put(
            _url(created["id"]),
            json={"quantity": 99},
            headers=auth_headers,
        )

        assert_not_found(resp)

    def test_update_requires_auth(self, api_client):
        """Updating without auth returns 401."""
        resp = api_client.put(
            _url(NONEXISTENT_ID), json={"quantity": 10}
        )

        assert_unauthorized(resp)


# ── DELETE ────────────────────────────────────────────────────────────────────


class TestDeleteFitnessLog:
    """Tests for DELETE /api/v1/tracking/fitness/:id."""

    def test_delete_valid_returns_204(
        self, api_client, auth_headers, fitness_activity_id
    ):
        """Deleting an existing log returns 204."""
        created = _create_log(api_client, auth_headers, fitness_activity_id)

        resp = api_client.delete(_url(created["id"]), headers=auth_headers)

        assert resp.status_code == 204

    def test_deleted_log_not_in_list(
        self, api_client, auth_headers, fitness_activity_id
    ):
        """After deletion, the log no longer appears in the list."""
        created = _create_log(api_client, auth_headers, fitness_activity_id)
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
        self, api_client, auth_headers, second_auth_headers, fitness_activity_id
    ):
        """Deleting another user's log returns 404."""
        created = _create_log(api_client, second_auth_headers, fitness_activity_id)

        resp = api_client.delete(_url(created["id"]), headers=auth_headers)

        assert_not_found(resp)

    def test_delete_requires_auth(self, api_client):
        """Deleting without auth returns 401."""
        resp = api_client.delete(_url(NONEXISTENT_ID))

        assert_unauthorized(resp)
