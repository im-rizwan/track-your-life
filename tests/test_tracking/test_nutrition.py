"""Integration tests for nutrition tracking endpoints.

Tests CRUD operations on /api/v1/tracking/nutrition, including validation
of required fields (nutritionFoodId, date), optional fields (quantity, notes),
FK integrity, and user isolation.
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
from utils.factories import nutrition_log_payload

pytestmark = pytest.mark.tracking

NONEXISTENT_ID = "clxxxxxxxxxxxxxxxxxxxxxxxxx"
URL = "/api/v1/tracking/nutrition"


def _url(log_id=None):
    if log_id:
        return f"{URL}/{log_id}"
    return URL


def _create_log(api_client, auth_headers, nutrition_food_id, **overrides):
    """Helper to create a nutrition log and return its response data."""
    payload = nutrition_log_payload(nutrition_food_id, **overrides)
    resp = api_client.post(URL, json=payload, headers=auth_headers)
    assert resp.status_code == 201, f"Setup create failed: {resp.text}"
    return resp.json()["data"]


# ── LIST ──────────────────────────────────────────────────────────────────────


class TestListNutritionLogs:
    """Tests for GET /api/v1/tracking/nutrition."""

    def test_list_returns_200_with_paginated_structure(
        self, api_client, auth_headers, nutrition_food_id
    ):
        """Authenticated GET returns 200 with paginated data structure."""
        _create_log(api_client, auth_headers, nutrition_food_id)

        resp = api_client.get(URL, headers=auth_headers)

        body = assert_success(resp)
        assert "items" in body["data"]
        assert "page" in body["data"]
        assert isinstance(body["data"]["items"], list)

    def test_list_includes_created_log(
        self, api_client, auth_headers, nutrition_food_id
    ):
        """A newly created nutrition log appears in the list."""
        created = _create_log(api_client, auth_headers, nutrition_food_id)

        resp = api_client.get(URL, headers=auth_headers)
        body = assert_success(resp)
        ids = [item["id"] for item in body["data"]["items"]]
        assert created["id"] in ids

    def test_list_requires_auth(self, api_client):
        """GET without auth returns 401."""
        resp = api_client.get(URL)

        assert_unauthorized(resp)

    def test_list_does_not_show_other_users_logs(
        self, api_client, auth_headers, second_auth_headers, nutrition_food_id
    ):
        """Logs created by another user are not visible."""
        created = _create_log(api_client, second_auth_headers, nutrition_food_id)

        resp = api_client.get(URL, headers=auth_headers)
        body = assert_success(resp)
        ids = [item["id"] for item in body["data"]["items"]]
        assert created["id"] not in ids


# ── CREATE ────────────────────────────────────────────────────────────────────


class TestCreateNutritionLog:
    """Tests for POST /api/v1/tracking/nutrition."""

    def test_create_valid_returns_201(
        self, api_client, auth_headers, nutrition_food_id
    ):
        """Creating with valid required fields returns 201."""
        payload = nutrition_log_payload(nutrition_food_id)

        resp = api_client.post(URL, json=payload, headers=auth_headers)

        body = assert_created(resp)
        assert body["data"]["nutritionFoodId"] == nutrition_food_id

    def test_create_with_all_optional_fields_returns_201(
        self, api_client, auth_headers, nutrition_food_id
    ):
        """Creating with all optional fields populated returns 201."""
        payload = nutrition_log_payload(
            nutrition_food_id,
            quantity="2 cups",
            notes="Post-workout meal",
        )

        resp = api_client.post(URL, json=payload, headers=auth_headers)

        body = assert_created(resp)
        assert body["data"]["quantity"] == "2 cups"
        assert body["data"]["notes"] == "Post-workout meal"

    def test_create_missing_nutrition_food_id_returns_422(
        self, api_client, auth_headers
    ):
        """Omitting nutritionFoodId returns 422."""
        payload = {"date": "2026-01-15"}

        resp = api_client.post(URL, json=payload, headers=auth_headers)

        assert_validation_error(resp)

    def test_create_missing_date_returns_422(
        self, api_client, auth_headers, nutrition_food_id
    ):
        """Omitting date returns 422."""
        payload = nutrition_log_payload(nutrition_food_id)
        del payload["date"]

        resp = api_client.post(URL, json=payload, headers=auth_headers)

        assert_validation_error(resp)

    def test_create_invalid_nutrition_food_id_returns_400(
        self, api_client, auth_headers
    ):
        """An invalid (non-existent) nutritionFoodId returns 400."""
        payload = nutrition_log_payload(NONEXISTENT_ID)

        resp = api_client.post(URL, json=payload, headers=auth_headers)

        assert_error(resp, 400)

    def test_create_requires_auth(self, api_client, nutrition_food_id):
        """Creating without auth returns 401."""
        payload = nutrition_log_payload(nutrition_food_id)

        resp = api_client.post(URL, json=payload)

        assert_unauthorized(resp)


# ── GET BY ID ─────────────────────────────────────────────────────────────────


class TestGetNutritionLog:
    """Tests for GET /api/v1/tracking/nutrition/:id."""

    def test_get_by_id_returns_200(
        self, api_client, auth_headers, nutrition_food_id
    ):
        """Fetching an existing log by ID returns 200."""
        created = _create_log(api_client, auth_headers, nutrition_food_id)

        resp = api_client.get(_url(created["id"]), headers=auth_headers)

        body = assert_success(resp)
        assert body["data"]["id"] == created["id"]

    def test_get_nonexistent_returns_404(self, api_client, auth_headers):
        """Fetching a non-existent log returns 404."""
        resp = api_client.get(_url(NONEXISTENT_ID), headers=auth_headers)

        assert_not_found(resp)

    def test_get_other_users_log_returns_404(
        self, api_client, auth_headers, second_auth_headers, nutrition_food_id
    ):
        """Fetching another user's log returns 404."""
        created = _create_log(api_client, second_auth_headers, nutrition_food_id)

        resp = api_client.get(_url(created["id"]), headers=auth_headers)

        assert_not_found(resp)

    def test_get_requires_auth(self, api_client):
        """Fetching without auth returns 401."""
        resp = api_client.get(_url(NONEXISTENT_ID))

        assert_unauthorized(resp)


# ── UPDATE ────────────────────────────────────────────────────────────────────


class TestUpdateNutritionLog:
    """Tests for PUT /api/v1/tracking/nutrition/:id."""

    def test_update_valid_returns_200(
        self, api_client, auth_headers, nutrition_food_id
    ):
        """Updating an existing log with valid data returns 200."""
        created = _create_log(api_client, auth_headers, nutrition_food_id)

        resp = api_client.put(
            _url(created["id"]),
            json={"quantity": "3 servings"},
            headers=auth_headers,
        )

        body = assert_success(resp)
        assert body["data"]["quantity"] == "3 servings"

    def test_update_notes_returns_200(
        self, api_client, auth_headers, nutrition_food_id
    ):
        """Updating notes on an existing log returns 200."""
        created = _create_log(api_client, auth_headers, nutrition_food_id)

        resp = api_client.put(
            _url(created["id"]),
            json={"notes": "Updated nutrition notes"},
            headers=auth_headers,
        )

        body = assert_success(resp)
        assert body["data"]["notes"] == "Updated nutrition notes"

    def test_update_nonexistent_returns_404(self, api_client, auth_headers):
        """Updating a non-existent log returns 404."""
        resp = api_client.put(
            _url(NONEXISTENT_ID),
            json={"quantity": "1 cup"},
            headers=auth_headers,
        )

        assert_not_found(resp)

    def test_update_other_users_log_returns_404(
        self, api_client, auth_headers, second_auth_headers, nutrition_food_id
    ):
        """Updating another user's log returns 404."""
        created = _create_log(api_client, second_auth_headers, nutrition_food_id)

        resp = api_client.put(
            _url(created["id"]),
            json={"quantity": "stolen"},
            headers=auth_headers,
        )

        assert_not_found(resp)

    def test_update_requires_auth(self, api_client):
        """Updating without auth returns 401."""
        resp = api_client.put(
            _url(NONEXISTENT_ID), json={"quantity": "1 cup"}
        )

        assert_unauthorized(resp)


# ── DELETE ────────────────────────────────────────────────────────────────────


class TestDeleteNutritionLog:
    """Tests for DELETE /api/v1/tracking/nutrition/:id."""

    def test_delete_valid_returns_204(
        self, api_client, auth_headers, nutrition_food_id
    ):
        """Deleting an existing log returns 204."""
        created = _create_log(api_client, auth_headers, nutrition_food_id)

        resp = api_client.delete(_url(created["id"]), headers=auth_headers)

        assert resp.status_code == 204

    def test_deleted_log_not_in_list(
        self, api_client, auth_headers, nutrition_food_id
    ):
        """After deletion, the log no longer appears in the list."""
        created = _create_log(api_client, auth_headers, nutrition_food_id)
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
        self, api_client, auth_headers, second_auth_headers, nutrition_food_id
    ):
        """Deleting another user's log returns 404."""
        created = _create_log(api_client, second_auth_headers, nutrition_food_id)

        resp = api_client.delete(_url(created["id"]), headers=auth_headers)

        assert_not_found(resp)

    def test_delete_requires_auth(self, api_client):
        """Deleting without auth returns 401."""
        resp = api_client.delete(_url(NONEXISTENT_ID))

        assert_unauthorized(resp)
