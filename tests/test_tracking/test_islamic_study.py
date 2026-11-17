"""Tests for /api/v1/tracking/islamic-study CRUD endpoints."""

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
from utils.factories import islamic_study_log_payload

pytestmark = pytest.mark.tracking

NONEXISTENT_ID = "clxxxxxxxxxxxxxxxxxxxxxxxxx"
BASE_URL = "/api/v1/tracking/islamic-study"


# ── Helpers ────────────────────────────────────────────────────────────────────


def _create_log(api_client, auth_headers, subject_id, study_mode_id, **overrides):
    """Create an Islamic study log and return its response data."""
    payload = islamic_study_log_payload(subject_id, study_mode_id, **overrides)
    resp = api_client.post(BASE_URL, json=payload, headers=auth_headers)
    assert resp.status_code == 201, f"Setup: failed to create islamic study log: {resp.text}"
    return resp.json()["data"]


# ── POST /tracking/islamic-study ───────────────────────────────────────────────


class TestCreateIslamicStudyLog:
    """Tests for POST /api/v1/tracking/islamic-study."""

    def test_create_valid_returns_201(
        self, api_client, auth_headers, islamic_study_subject_id, study_mode_id
    ):
        """Creating with valid data returns 201."""
        payload = islamic_study_log_payload(islamic_study_subject_id, study_mode_id)
        resp = api_client.post(BASE_URL, json=payload, headers=auth_headers)

        body = assert_created(resp)
        assert "id" in body["data"]
        assert body["data"]["durationMins"] == 30

    def test_create_with_notes_returns_201(
        self, api_client, auth_headers, islamic_study_subject_id, study_mode_id
    ):
        """Creating with optional notes returns 201."""
        payload = islamic_study_log_payload(
            islamic_study_subject_id, study_mode_id, notes="Studied tafsir of Surah Al-Kahf"
        )
        resp = api_client.post(BASE_URL, json=payload, headers=auth_headers)

        body = assert_created(resp)
        assert body["data"]["notes"] == "Studied tafsir of Surah Al-Kahf"

    def test_create_with_custom_duration(
        self, api_client, auth_headers, islamic_study_subject_id, study_mode_id
    ):
        """Creating with a custom durationMins returns 201."""
        payload = islamic_study_log_payload(
            islamic_study_subject_id, study_mode_id, durationMins=90
        )
        resp = api_client.post(BASE_URL, json=payload, headers=auth_headers)

        body = assert_created(resp)
        assert body["data"]["durationMins"] == 90

    def test_create_with_yesterday_date(
        self, api_client, auth_headers, islamic_study_subject_id, study_mode_id
    ):
        """Creating with yesterday's date returns 201."""
        yesterday = (date.today() - timedelta(days=1)).isoformat()
        payload = islamic_study_log_payload(
            islamic_study_subject_id, study_mode_id, date=yesterday
        )
        resp = api_client.post(BASE_URL, json=payload, headers=auth_headers)

        assert_created(resp)

    def test_create_missing_subject_id_returns_422(
        self, api_client, auth_headers, study_mode_id
    ):
        """Omitting subjectId returns 422."""
        payload = {
            "studyModeId": study_mode_id,
            "durationMins": 30,
            "date": date.today().isoformat(),
        }
        resp = api_client.post(BASE_URL, json=payload, headers=auth_headers)

        assert_validation_error(resp)

    def test_create_missing_study_mode_id_returns_422(
        self, api_client, auth_headers, islamic_study_subject_id
    ):
        """Omitting studyModeId returns 422."""
        payload = {
            "subjectId": islamic_study_subject_id,
            "durationMins": 30,
            "date": date.today().isoformat(),
        }
        resp = api_client.post(BASE_URL, json=payload, headers=auth_headers)

        assert_validation_error(resp)

    def test_create_missing_duration_mins_returns_422(
        self, api_client, auth_headers, islamic_study_subject_id, study_mode_id
    ):
        """Omitting durationMins returns 422."""
        payload = {
            "subjectId": islamic_study_subject_id,
            "studyModeId": study_mode_id,
            "date": date.today().isoformat(),
        }
        resp = api_client.post(BASE_URL, json=payload, headers=auth_headers)

        assert_validation_error(resp)

    def test_create_missing_date_returns_422(
        self, api_client, auth_headers, islamic_study_subject_id, study_mode_id
    ):
        """Omitting date returns 422."""
        payload = {
            "subjectId": islamic_study_subject_id,
            "studyModeId": study_mode_id,
            "durationMins": 30,
        }
        resp = api_client.post(BASE_URL, json=payload, headers=auth_headers)

        assert_validation_error(resp)

    def test_create_invalid_subject_id_returns_400(
        self, api_client, auth_headers, study_mode_id
    ):
        """Providing a nonexistent subjectId returns 400."""
        payload = islamic_study_log_payload(NONEXISTENT_ID, study_mode_id)
        resp = api_client.post(BASE_URL, json=payload, headers=auth_headers)

        assert_error(resp, 400)

    def test_create_invalid_study_mode_id_returns_400(
        self, api_client, auth_headers, islamic_study_subject_id
    ):
        """Providing a nonexistent studyModeId returns 400."""
        payload = islamic_study_log_payload(islamic_study_subject_id, NONEXISTENT_ID)
        resp = api_client.post(BASE_URL, json=payload, headers=auth_headers)

        assert_error(resp, 400)

    def test_create_duration_mins_less_than_1_returns_422(
        self, api_client, auth_headers, islamic_study_subject_id, study_mode_id
    ):
        """durationMins less than 1 returns 422."""
        payload = islamic_study_log_payload(
            islamic_study_subject_id, study_mode_id, durationMins=0
        )
        resp = api_client.post(BASE_URL, json=payload, headers=auth_headers)

        assert_validation_error(resp)

    def test_create_notes_too_long_returns_422(
        self, api_client, auth_headers, islamic_study_subject_id, study_mode_id
    ):
        """Notes exceeding 500 characters returns 422."""
        payload = islamic_study_log_payload(
            islamic_study_subject_id, study_mode_id, notes="A" * 501
        )
        resp = api_client.post(BASE_URL, json=payload, headers=auth_headers)

        assert_validation_error(resp)

    def test_create_requires_auth(
        self, api_client, islamic_study_subject_id, study_mode_id
    ):
        """Creating without auth returns 401."""
        payload = islamic_study_log_payload(islamic_study_subject_id, study_mode_id)
        resp = api_client.post(BASE_URL, json=payload)

        assert_unauthorized(resp)


# ── GET /tracking/islamic-study ────────────────────────────────────────────────


class TestListIslamicStudyLogs:
    """Tests for GET /api/v1/tracking/islamic-study."""

    def test_list_returns_200_with_paginated_data(
        self, api_client, auth_headers, islamic_study_subject_id, study_mode_id
    ):
        """Listing Islamic study logs returns 200 with paginated structure."""
        _create_log(api_client, auth_headers, islamic_study_subject_id, study_mode_id)

        resp = api_client.get(BASE_URL, headers=auth_headers)

        body = assert_success(resp)
        assert "items" in body["data"]
        assert "page" in body["data"]
        assert isinstance(body["data"]["items"], list)

    def test_list_contains_created_log(
        self, api_client, auth_headers, islamic_study_subject_id, study_mode_id
    ):
        """A newly created log appears in the list."""
        created = _create_log(
            api_client, auth_headers, islamic_study_subject_id, study_mode_id
        )

        resp = api_client.get(BASE_URL, headers=auth_headers)
        body = assert_success(resp)
        ids = [item["id"] for item in body["data"]["items"]]
        assert created["id"] in ids

    def test_list_requires_auth(self, api_client):
        """Listing without auth returns 401."""
        resp = api_client.get(BASE_URL)

        assert_unauthorized(resp)


# ── GET /tracking/islamic-study/:id ───────────────────────────────────────────


class TestGetIslamicStudyLog:
    """Tests for GET /api/v1/tracking/islamic-study/:id."""

    def test_get_returns_200(
        self, api_client, auth_headers, islamic_study_subject_id, study_mode_id
    ):
        """Getting an existing log returns 200."""
        created = _create_log(
            api_client, auth_headers, islamic_study_subject_id, study_mode_id
        )

        resp = api_client.get(f"{BASE_URL}/{created['id']}", headers=auth_headers)

        body = assert_success(resp)
        assert body["data"]["id"] == created["id"]

    def test_get_not_found_returns_404(self, api_client, auth_headers):
        """Getting a nonexistent log returns 404."""
        resp = api_client.get(f"{BASE_URL}/{NONEXISTENT_ID}", headers=auth_headers)

        assert_not_found(resp)

    def test_get_other_users_log_returns_404(
        self, api_client, auth_headers, second_auth_headers,
        islamic_study_subject_id, study_mode_id,
    ):
        """Getting another user's log returns 404."""
        created = _create_log(
            api_client, second_auth_headers, islamic_study_subject_id, study_mode_id
        )

        resp = api_client.get(f"{BASE_URL}/{created['id']}", headers=auth_headers)

        assert_not_found(resp)

    def test_get_requires_auth(self, api_client):
        """Getting without auth returns 401."""
        resp = api_client.get(f"{BASE_URL}/{NONEXISTENT_ID}")

        assert_unauthorized(resp)


# ── PUT /tracking/islamic-study/:id ───────────────────────────────────────────


class TestUpdateIslamicStudyLog:
    """Tests for PUT /api/v1/tracking/islamic-study/:id."""

    def test_update_notes_returns_200(
        self, api_client, auth_headers, islamic_study_subject_id, study_mode_id
    ):
        """Updating notes returns 200."""
        created = _create_log(
            api_client, auth_headers, islamic_study_subject_id, study_mode_id
        )

        resp = api_client.put(
            f"{BASE_URL}/{created['id']}",
            json={"notes": "Updated study note"},
            headers=auth_headers,
        )

        body = assert_success(resp)
        assert body["data"]["notes"] == "Updated study note"

    def test_update_duration_returns_200(
        self, api_client, auth_headers, islamic_study_subject_id, study_mode_id
    ):
        """Updating durationMins returns 200."""
        created = _create_log(
            api_client, auth_headers, islamic_study_subject_id, study_mode_id
        )

        resp = api_client.put(
            f"{BASE_URL}/{created['id']}",
            json={"durationMins": 60},
            headers=auth_headers,
        )

        body = assert_success(resp)
        assert body["data"]["durationMins"] == 60

    def test_update_not_found_returns_404(self, api_client, auth_headers):
        """Updating a nonexistent log returns 404."""
        resp = api_client.put(
            f"{BASE_URL}/{NONEXISTENT_ID}",
            json={"notes": "Ghost"},
            headers=auth_headers,
        )

        assert_not_found(resp)

    def test_update_other_users_log_returns_404(
        self, api_client, auth_headers, second_auth_headers,
        islamic_study_subject_id, study_mode_id,
    ):
        """Updating another user's log returns 404."""
        created = _create_log(
            api_client, second_auth_headers, islamic_study_subject_id, study_mode_id
        )

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


# ── DELETE /tracking/islamic-study/:id ────────────────────────────────────────


class TestDeleteIslamicStudyLog:
    """Tests for DELETE /api/v1/tracking/islamic-study/:id."""

    def test_delete_returns_204(
        self, api_client, auth_headers, islamic_study_subject_id, study_mode_id
    ):
        """Deleting an existing log returns 204."""
        created = _create_log(
            api_client, auth_headers, islamic_study_subject_id, study_mode_id
        )

        resp = api_client.delete(f"{BASE_URL}/{created['id']}", headers=auth_headers)
        assert resp.status_code == 204

    def test_delete_not_found_returns_404(self, api_client, auth_headers):
        """Deleting a nonexistent log returns 404."""
        resp = api_client.delete(f"{BASE_URL}/{NONEXISTENT_ID}", headers=auth_headers)

        assert_not_found(resp)

    def test_delete_other_users_log_returns_404(
        self, api_client, auth_headers, second_auth_headers,
        islamic_study_subject_id, study_mode_id,
    ):
        """Deleting another user's log returns 404."""
        created = _create_log(
            api_client, second_auth_headers, islamic_study_subject_id, study_mode_id
        )

        resp = api_client.delete(f"{BASE_URL}/{created['id']}", headers=auth_headers)

        assert_not_found(resp)

    def test_delete_requires_auth(self, api_client):
        """Deleting without auth returns 401."""
        resp = api_client.delete(f"{BASE_URL}/{NONEXISTENT_ID}")

        assert_unauthorized(resp)

    def test_deleted_log_not_in_list(
        self, api_client, auth_headers, islamic_study_subject_id, study_mode_id
    ):
        """After deletion, the log no longer appears in the list."""
        created = _create_log(
            api_client, auth_headers, islamic_study_subject_id, study_mode_id
        )
        api_client.delete(f"{BASE_URL}/{created['id']}", headers=auth_headers)

        resp = api_client.get(BASE_URL, headers=auth_headers)
        body = assert_success(resp)
        ids = [item["id"] for item in body["data"]["items"]]
        assert created["id"] not in ids
