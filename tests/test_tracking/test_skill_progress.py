"""Tests for /api/v1/tracking/skills CRUD endpoints (skill progress logs)."""

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
from utils.factories import skill_progress_log_payload

pytestmark = pytest.mark.tracking

NONEXISTENT_ID = "clxxxxxxxxxxxxxxxxxxxxxxxxx"
BASE_URL = "/api/v1/tracking/skills"


# ── Helpers ────────────────────────────────────────────────────────────────────


def _create_log(api_client, auth_headers, skill_id, **overrides):
    """Create a skill progress log and return its response data."""
    payload = skill_progress_log_payload(skill_id, **overrides)
    resp = api_client.post(BASE_URL, json=payload, headers=auth_headers)
    assert resp.status_code == 201, f"Setup: failed to create skill progress log: {resp.text}"
    return resp.json()["data"]


# ── POST /tracking/skills ─────────────────────────────────────────────────────


class TestCreateSkillProgressLog:
    """Tests for POST /api/v1/tracking/skills."""

    def test_create_valid_returns_201(self, api_client, auth_headers, skill_id):
        """Creating with valid data returns 201."""
        payload = skill_progress_log_payload(skill_id)
        resp = api_client.post(BASE_URL, json=payload, headers=auth_headers)

        body = assert_created(resp)
        assert "id" in body["data"]
        assert body["data"]["progress"] == 50

    def test_create_with_notes_returns_201(self, api_client, auth_headers, skill_id):
        """Creating with optional notes returns 201."""
        payload = skill_progress_log_payload(skill_id, notes="Made great progress today")
        resp = api_client.post(BASE_URL, json=payload, headers=auth_headers)

        body = assert_created(resp)
        assert body["data"]["notes"] == "Made great progress today"

    def test_create_with_skill_topic_returns_201(
        self, api_client, auth_headers, skill_id, skill_topic_id
    ):
        """Creating with a valid skillTopicId that belongs to the skill returns 201."""
        payload = skill_progress_log_payload(skill_id, skillTopicId=skill_topic_id)
        resp = api_client.post(BASE_URL, json=payload, headers=auth_headers)

        body = assert_created(resp)
        assert "id" in body["data"]

    def test_create_with_progress_zero_returns_201(self, api_client, auth_headers, skill_id):
        """Creating with progress=0 returns 201 (minimum valid value)."""
        payload = skill_progress_log_payload(skill_id, progress=0)
        resp = api_client.post(BASE_URL, json=payload, headers=auth_headers)

        body = assert_created(resp)
        assert body["data"]["progress"] == 0

    def test_create_with_progress_100_returns_201(self, api_client, auth_headers, skill_id):
        """Creating with progress=100 returns 201 (maximum valid value)."""
        payload = skill_progress_log_payload(skill_id, progress=100)
        resp = api_client.post(BASE_URL, json=payload, headers=auth_headers)

        body = assert_created(resp)
        assert body["data"]["progress"] == 100

    def test_create_with_yesterday_date(self, api_client, auth_headers, skill_id):
        """Creating with yesterday's date returns 201."""
        yesterday = (date.today() - timedelta(days=1)).isoformat()
        payload = skill_progress_log_payload(skill_id, date=yesterday)
        resp = api_client.post(BASE_URL, json=payload, headers=auth_headers)

        assert_created(resp)

    def test_create_missing_skill_id_returns_422(self, api_client, auth_headers):
        """Omitting skillId returns 422."""
        payload = {"progress": 50, "date": date.today().isoformat()}
        resp = api_client.post(BASE_URL, json=payload, headers=auth_headers)

        assert_validation_error(resp)

    def test_create_missing_progress_returns_422(self, api_client, auth_headers, skill_id):
        """Omitting progress returns 422."""
        payload = {"skillId": skill_id, "date": date.today().isoformat()}
        resp = api_client.post(BASE_URL, json=payload, headers=auth_headers)

        assert_validation_error(resp)

    def test_create_missing_date_returns_422(self, api_client, auth_headers, skill_id):
        """Omitting date returns 422."""
        payload = {"skillId": skill_id, "progress": 50}
        resp = api_client.post(BASE_URL, json=payload, headers=auth_headers)

        assert_validation_error(resp)

    def test_create_progress_below_zero_returns_422(self, api_client, auth_headers, skill_id):
        """progress less than 0 returns 422."""
        payload = skill_progress_log_payload(skill_id, progress=-1)
        resp = api_client.post(BASE_URL, json=payload, headers=auth_headers)

        assert_validation_error(resp)

    def test_create_progress_above_100_returns_422(self, api_client, auth_headers, skill_id):
        """progress greater than 100 returns 422."""
        payload = skill_progress_log_payload(skill_id, progress=101)
        resp = api_client.post(BASE_URL, json=payload, headers=auth_headers)

        assert_validation_error(resp)

    def test_create_invalid_skill_id_returns_400(self, api_client, auth_headers):
        """Providing a nonexistent skillId returns 400 with ownership error."""
        payload = skill_progress_log_payload(NONEXISTENT_ID)
        resp = api_client.post(BASE_URL, json=payload, headers=auth_headers)

        body = assert_error(resp, 400)
        assert "Skill not found or not owned by user" in body["error"]["message"]

    def test_create_invalid_skill_topic_id_returns_400(
        self, api_client, auth_headers, skill_id
    ):
        """Providing a skillTopicId that does not belong to the skill returns 400."""
        payload = skill_progress_log_payload(skill_id, skillTopicId=NONEXISTENT_ID)
        resp = api_client.post(BASE_URL, json=payload, headers=auth_headers)

        body = assert_error(resp, 400)
        assert "Skill topic does not belong to the specified skill" in body["error"]["message"]

    def test_create_notes_too_long_returns_422(self, api_client, auth_headers, skill_id):
        """Notes exceeding 500 characters returns 422."""
        payload = skill_progress_log_payload(skill_id, notes="A" * 501)
        resp = api_client.post(BASE_URL, json=payload, headers=auth_headers)

        assert_validation_error(resp)

    def test_create_requires_auth(self, api_client, skill_id):
        """Creating without auth returns 401."""
        payload = skill_progress_log_payload(skill_id)
        resp = api_client.post(BASE_URL, json=payload)

        assert_unauthorized(resp)


# ── GET /tracking/skills ───────────────────────────────────────────────────────


class TestListSkillProgressLogs:
    """Tests for GET /api/v1/tracking/skills."""

    def test_list_returns_200_with_paginated_data(
        self, api_client, auth_headers, skill_id
    ):
        """Listing skill progress logs returns 200 with paginated structure."""
        _create_log(api_client, auth_headers, skill_id)

        resp = api_client.get(BASE_URL, headers=auth_headers)

        body = assert_success(resp)
        assert "items" in body["data"]
        assert "page" in body["data"]
        assert isinstance(body["data"]["items"], list)

    def test_list_contains_created_log(self, api_client, auth_headers, skill_id):
        """A newly created log appears in the list."""
        created = _create_log(api_client, auth_headers, skill_id)

        resp = api_client.get(BASE_URL, headers=auth_headers)
        body = assert_success(resp)
        ids = [item["id"] for item in body["data"]["items"]]
        assert created["id"] in ids

    def test_list_requires_auth(self, api_client):
        """Listing without auth returns 401."""
        resp = api_client.get(BASE_URL)

        assert_unauthorized(resp)


# ── GET /tracking/skills/:id ──────────────────────────────────────────────────


class TestGetSkillProgressLog:
    """Tests for GET /api/v1/tracking/skills/:id."""

    def test_get_returns_200(self, api_client, auth_headers, skill_id):
        """Getting an existing log returns 200."""
        created = _create_log(api_client, auth_headers, skill_id)

        resp = api_client.get(f"{BASE_URL}/{created['id']}", headers=auth_headers)

        body = assert_success(resp)
        assert body["data"]["id"] == created["id"]

    def test_get_not_found_returns_404(self, api_client, auth_headers):
        """Getting a nonexistent log returns 404."""
        resp = api_client.get(f"{BASE_URL}/{NONEXISTENT_ID}", headers=auth_headers)

        assert_not_found(resp)

    def test_get_other_users_log_returns_404(
        self, api_client, auth_headers, second_auth_headers
    ):
        """Getting another user's log returns 404."""
        # Second user creates their own skill and log
        skill_resp = api_client.post(
            "/api/v1/customization/skills",
            json={"name": "User2 Skill GetTest"},
            headers=second_auth_headers,
        )
        assert skill_resp.status_code == 201
        u2_skill_id = skill_resp.json()["data"]["id"]

        created = _create_log(api_client, second_auth_headers, u2_skill_id)

        resp = api_client.get(f"{BASE_URL}/{created['id']}", headers=auth_headers)

        assert_not_found(resp)

    def test_get_requires_auth(self, api_client):
        """Getting without auth returns 401."""
        resp = api_client.get(f"{BASE_URL}/{NONEXISTENT_ID}")

        assert_unauthorized(resp)


# ── PUT /tracking/skills/:id ──────────────────────────────────────────────────


class TestUpdateSkillProgressLog:
    """Tests for PUT /api/v1/tracking/skills/:id."""

    def test_update_notes_returns_200(self, api_client, auth_headers, skill_id):
        """Updating notes returns 200."""
        created = _create_log(api_client, auth_headers, skill_id)

        resp = api_client.put(
            f"{BASE_URL}/{created['id']}",
            json={"notes": "Updated skill note"},
            headers=auth_headers,
        )

        body = assert_success(resp)
        assert body["data"]["notes"] == "Updated skill note"

    def test_update_progress_returns_200(self, api_client, auth_headers, skill_id):
        """Updating progress returns 200."""
        created = _create_log(api_client, auth_headers, skill_id, progress=25)

        resp = api_client.put(
            f"{BASE_URL}/{created['id']}",
            json={"progress": 75},
            headers=auth_headers,
        )

        body = assert_success(resp)
        assert body["data"]["progress"] == 75

    def test_update_not_found_returns_404(self, api_client, auth_headers):
        """Updating a nonexistent log returns 404."""
        resp = api_client.put(
            f"{BASE_URL}/{NONEXISTENT_ID}",
            json={"notes": "Ghost"},
            headers=auth_headers,
        )

        assert_not_found(resp)

    def test_update_other_users_log_returns_404(
        self, api_client, auth_headers, second_auth_headers
    ):
        """Updating another user's log returns 404."""
        # Second user creates their own skill and log
        skill_resp = api_client.post(
            "/api/v1/customization/skills",
            json={"name": "User2 Skill UpdateTest"},
            headers=second_auth_headers,
        )
        assert skill_resp.status_code == 201
        u2_skill_id = skill_resp.json()["data"]["id"]

        created = _create_log(api_client, second_auth_headers, u2_skill_id)

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


# ── DELETE /tracking/skills/:id ───────────────────────────────────────────────


class TestDeleteSkillProgressLog:
    """Tests for DELETE /api/v1/tracking/skills/:id."""

    def test_delete_returns_204(self, api_client, auth_headers, skill_id):
        """Deleting an existing log returns 204."""
        created = _create_log(api_client, auth_headers, skill_id)

        resp = api_client.delete(f"{BASE_URL}/{created['id']}", headers=auth_headers)
        assert resp.status_code == 204

    def test_delete_not_found_returns_404(self, api_client, auth_headers):
        """Deleting a nonexistent log returns 404."""
        resp = api_client.delete(f"{BASE_URL}/{NONEXISTENT_ID}", headers=auth_headers)

        assert_not_found(resp)

    def test_delete_other_users_log_returns_404(
        self, api_client, auth_headers, second_auth_headers
    ):
        """Deleting another user's log returns 404."""
        # Second user creates their own skill and log
        skill_resp = api_client.post(
            "/api/v1/customization/skills",
            json={"name": "User2 Skill DeleteTest"},
            headers=second_auth_headers,
        )
        assert skill_resp.status_code == 201
        u2_skill_id = skill_resp.json()["data"]["id"]

        created = _create_log(api_client, second_auth_headers, u2_skill_id)

        resp = api_client.delete(f"{BASE_URL}/{created['id']}", headers=auth_headers)

        assert_not_found(resp)

    def test_delete_requires_auth(self, api_client):
        """Deleting without auth returns 401."""
        resp = api_client.delete(f"{BASE_URL}/{NONEXISTENT_ID}")

        assert_unauthorized(resp)

    def test_deleted_log_not_in_list(self, api_client, auth_headers, skill_id):
        """After deletion, the log no longer appears in the list."""
        created = _create_log(api_client, auth_headers, skill_id)
        api_client.delete(f"{BASE_URL}/{created['id']}", headers=auth_headers)

        resp = api_client.get(BASE_URL, headers=auth_headers)
        body = assert_success(resp)
        ids = [item["id"] for item in body["data"]["items"]]
        assert created["id"] not in ids
