"""Integration tests for sleep tracking endpoints.

Tests CRUD operations on /api/v1/tracking/sleep, including validation
of required fields (bedtime, wakeupTime, date), optional fields
(sleepQuality, notes), bedtime/wakeup ordering, and user isolation.
"""

import pytest
from datetime import datetime, timedelta

from utils.assertions import (
    assert_success,
    assert_created,
    assert_error,
    assert_unauthorized,
    assert_not_found,
    assert_validation_error,
)
from utils.factories import sleep_log_payload

pytestmark = pytest.mark.tracking

NONEXISTENT_ID = "clxxxxxxxxxxxxxxxxxxxxxxxxx"
URL = "/api/v1/tracking/sleep"


def _url(log_id=None):
    if log_id:
        return f"{URL}/{log_id}"
    return URL


def _create_log(api_client, auth_headers, **overrides):
    """Helper to create a sleep log and return its response data."""
    payload = sleep_log_payload(**overrides)
    resp = api_client.post(URL, json=payload, headers=auth_headers)
    assert resp.status_code == 201, f"Setup create failed: {resp.text}"
    return resp.json()["data"]


# ── LIST ──────────────────────────────────────────────────────────────────────


class TestListSleepLogs:
    """Tests for GET /api/v1/tracking/sleep."""

    def test_list_returns_200_with_paginated_structure(
        self, api_client, auth_headers
    ):
        """Authenticated GET returns 200 with paginated data structure."""
        _create_log(api_client, auth_headers)

        resp = api_client.get(URL, headers=auth_headers)

        body = assert_success(resp)
        assert "items" in body["data"]
        assert "page" in body["data"]
        assert isinstance(body["data"]["items"], list)

    def test_list_includes_created_log(self, api_client, auth_headers):
        """A newly created sleep log appears in the list."""
        created = _create_log(api_client, auth_headers)

        resp = api_client.get(URL, headers=auth_headers)
        body = assert_success(resp)
        ids = [item["id"] for item in body["data"]["items"]]
        assert created["id"] in ids

    def test_list_requires_auth(self, api_client):
        """GET without auth returns 401."""
        resp = api_client.get(URL)

        assert_unauthorized(resp)

    def test_list_does_not_show_other_users_logs(
        self, api_client, auth_headers, second_auth_headers
    ):
        """Logs created by another user are not visible."""
        created = _create_log(api_client, second_auth_headers)

        resp = api_client.get(URL, headers=auth_headers)
        body = assert_success(resp)
        ids = [item["id"] for item in body["data"]["items"]]
        assert created["id"] not in ids


# ── CREATE ────────────────────────────────────────────────────────────────────


class TestCreateSleepLog:
    """Tests for POST /api/v1/tracking/sleep."""

    def test_create_valid_returns_201(self, api_client, auth_headers):
        """Creating with valid required fields returns 201."""
        payload = sleep_log_payload()

        resp = api_client.post(URL, json=payload, headers=auth_headers)

        body = assert_created(resp)
        assert "bedtime" in body["data"]
        assert "wakeupTime" in body["data"]

    def test_create_with_all_optional_fields_returns_201(
        self, api_client, auth_headers
    ):
        """Creating with all optional fields populated returns 201."""
        payload = sleep_log_payload(
            sleepQuality=4,
            notes="Slept well, felt refreshed",
        )

        resp = api_client.post(URL, json=payload, headers=auth_headers)

        body = assert_created(resp)
        assert body["data"]["sleepQuality"] == 4
        assert body["data"]["notes"] == "Slept well, felt refreshed"

    def test_create_missing_bedtime_returns_422(self, api_client, auth_headers):
        """Omitting bedtime returns 422."""
        now = datetime.utcnow()
        payload = {
            "wakeupTime": now.isoformat() + "Z",
            "date": "2026-01-15",
        }

        resp = api_client.post(URL, json=payload, headers=auth_headers)

        assert_validation_error(resp)

    def test_create_missing_wakeup_time_returns_422(self, api_client, auth_headers):
        """Omitting wakeupTime returns 422."""
        now = datetime.utcnow()
        payload = {
            "bedtime": (now - timedelta(hours=8)).isoformat() + "Z",
            "date": "2026-01-15",
        }

        resp = api_client.post(URL, json=payload, headers=auth_headers)

        assert_validation_error(resp)

    def test_create_missing_date_returns_422(self, api_client, auth_headers):
        """Omitting date returns 422."""
        payload = sleep_log_payload()
        del payload["date"]

        resp = api_client.post(URL, json=payload, headers=auth_headers)

        assert_validation_error(resp)

    def test_create_wakeup_before_bedtime_returns_400(
        self, api_client, auth_headers
    ):
        """wakeupTime before bedtime returns 400."""
        now = datetime.utcnow()
        bedtime = now.isoformat() + "Z"
        wakeup = (now - timedelta(hours=2)).isoformat() + "Z"
        payload = sleep_log_payload(bedtime=bedtime, wakeupTime=wakeup)

        resp = api_client.post(URL, json=payload, headers=auth_headers)

        assert_error(resp, 400)

    def test_create_same_bedtime_wakeup_returns_400(
        self, api_client, auth_headers
    ):
        """wakeupTime equal to bedtime returns 400."""
        now = datetime.utcnow()
        same_time = now.isoformat() + "Z"
        payload = sleep_log_payload(bedtime=same_time, wakeupTime=same_time)

        resp = api_client.post(URL, json=payload, headers=auth_headers)

        assert_error(resp, 400)

    def test_create_sleep_quality_less_than_1_returns_422(
        self, api_client, auth_headers
    ):
        """sleepQuality < 1 returns 422."""
        payload = sleep_log_payload(sleepQuality=0)

        resp = api_client.post(URL, json=payload, headers=auth_headers)

        assert_validation_error(resp)

    def test_create_sleep_quality_greater_than_5_returns_422(
        self, api_client, auth_headers
    ):
        """sleepQuality > 5 returns 422."""
        payload = sleep_log_payload(sleepQuality=6)

        resp = api_client.post(URL, json=payload, headers=auth_headers)

        assert_validation_error(resp)

    def test_create_requires_auth(self, api_client):
        """Creating without auth returns 401."""
        payload = sleep_log_payload()

        resp = api_client.post(URL, json=payload)

        assert_unauthorized(resp)


# ── GET BY ID ─────────────────────────────────────────────────────────────────


class TestGetSleepLog:
    """Tests for GET /api/v1/tracking/sleep/:id."""

    def test_get_by_id_returns_200(self, api_client, auth_headers):
        """Fetching an existing log by ID returns 200."""
        created = _create_log(api_client, auth_headers)

        resp = api_client.get(_url(created["id"]), headers=auth_headers)

        body = assert_success(resp)
        assert body["data"]["id"] == created["id"]

    def test_get_nonexistent_returns_404(self, api_client, auth_headers):
        """Fetching a non-existent log returns 404."""
        resp = api_client.get(_url(NONEXISTENT_ID), headers=auth_headers)

        assert_not_found(resp)

    def test_get_other_users_log_returns_404(
        self, api_client, auth_headers, second_auth_headers
    ):
        """Fetching another user's log returns 404."""
        created = _create_log(api_client, second_auth_headers)

        resp = api_client.get(_url(created["id"]), headers=auth_headers)

        assert_not_found(resp)

    def test_get_requires_auth(self, api_client):
        """Fetching without auth returns 401."""
        resp = api_client.get(_url(NONEXISTENT_ID))

        assert_unauthorized(resp)


# ── UPDATE ────────────────────────────────────────────────────────────────────


class TestUpdateSleepLog:
    """Tests for PUT /api/v1/tracking/sleep/:id."""

    def test_update_valid_returns_200(self, api_client, auth_headers):
        """Updating an existing log with valid data returns 200."""
        created = _create_log(api_client, auth_headers)

        resp = api_client.put(
            _url(created["id"]),
            json={"sleepQuality": 5},
            headers=auth_headers,
        )

        body = assert_success(resp)
        assert body["data"]["sleepQuality"] == 5

    def test_update_notes_returns_200(self, api_client, auth_headers):
        """Updating notes on an existing log returns 200."""
        created = _create_log(api_client, auth_headers)

        resp = api_client.put(
            _url(created["id"]),
            json={"notes": "Updated sleep notes"},
            headers=auth_headers,
        )

        body = assert_success(resp)
        assert body["data"]["notes"] == "Updated sleep notes"

    def test_update_nonexistent_returns_404(self, api_client, auth_headers):
        """Updating a non-existent log returns 404."""
        resp = api_client.put(
            _url(NONEXISTENT_ID),
            json={"sleepQuality": 3},
            headers=auth_headers,
        )

        assert_not_found(resp)

    def test_update_other_users_log_returns_404(
        self, api_client, auth_headers, second_auth_headers
    ):
        """Updating another user's log returns 404."""
        created = _create_log(api_client, second_auth_headers)

        resp = api_client.put(
            _url(created["id"]),
            json={"sleepQuality": 1},
            headers=auth_headers,
        )

        assert_not_found(resp)

    def test_update_requires_auth(self, api_client):
        """Updating without auth returns 401."""
        resp = api_client.put(
            _url(NONEXISTENT_ID), json={"sleepQuality": 3}
        )

        assert_unauthorized(resp)


# ── DELETE ────────────────────────────────────────────────────────────────────


class TestDeleteSleepLog:
    """Tests for DELETE /api/v1/tracking/sleep/:id."""

    def test_delete_valid_returns_204(self, api_client, auth_headers):
        """Deleting an existing log returns 204."""
        created = _create_log(api_client, auth_headers)

        resp = api_client.delete(_url(created["id"]), headers=auth_headers)

        assert resp.status_code == 204

    def test_deleted_log_not_in_list(self, api_client, auth_headers):
        """After deletion, the log no longer appears in the list."""
        created = _create_log(api_client, auth_headers)
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
        self, api_client, auth_headers, second_auth_headers
    ):
        """Deleting another user's log returns 404."""
        created = _create_log(api_client, second_auth_headers)

        resp = api_client.delete(_url(created["id"]), headers=auth_headers)

        assert_not_found(resp)

    def test_delete_requires_auth(self, api_client):
        """Deleting without auth returns 401."""
        resp = api_client.delete(_url(NONEXISTENT_ID))

        assert_unauthorized(resp)
