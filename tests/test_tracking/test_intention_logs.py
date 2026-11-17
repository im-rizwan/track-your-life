"""Tests for /api/v1/tracking/intentions CRUD endpoints.

Intention logs track when a user acts on an intention. The intentionId must
belong to the authenticated user. Optional startDate/endDate fields support
date-range tracking, with endDate required to be >= startDate.
"""

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
from utils.factories import intention_log_payload, today_str

pytestmark = pytest.mark.tracking

INTENTIONS_LOG_URL = "/api/v1/tracking/intentions"

NONEXISTENT_ID = "clxxxxxxxxxxxxxxxxxxxxxxxxx"


# ── Helpers / fixtures ────────────────────────────────────────────────────────


@pytest.fixture
def created_intention_log(api_client, auth_headers, intention_id):
    """Create a minimal intention log and return its response data."""
    resp = api_client.post(
        INTENTIONS_LOG_URL,
        json=intention_log_payload(intention_id),
        headers=auth_headers,
    )
    assert resp.status_code == 201
    return resp.json()["data"]


@pytest.fixture
def second_user_intention_id(api_client, second_auth_headers):
    """Create an intention under the second user and return its ID."""
    resp = api_client.post(
        "/api/v1/customization/intentions",
        json={"name": "Second User Intention for Log Tests"},
        headers=second_auth_headers,
    )
    assert resp.status_code == 201
    return resp.json()["data"]["id"]


# ── GET /intentions (list) ───────────────────────────────────────────────────


class TestListIntentionLogs:
    """Tests for GET /api/v1/tracking/intentions."""

    def test_list_intention_logs_empty(self, api_client, auth_headers):
        """A new user starts with an empty intention logs list."""
        resp = api_client.get(INTENTIONS_LOG_URL, headers=auth_headers)

        body = assert_success(resp)
        assert "items" in body["data"]
        assert "page" in body["data"]
        assert isinstance(body["data"]["items"], list)

    def test_list_intention_logs_shows_created_item(
        self, api_client, auth_headers, created_intention_log
    ):
        """After creating an intention log, it appears in the list."""
        resp = api_client.get(INTENTIONS_LOG_URL, headers=auth_headers)

        body = assert_success(resp)
        ids = [item["id"] for item in body["data"]["items"]]
        assert created_intention_log["id"] in ids

    def test_list_intention_logs_requires_auth(self, api_client):
        """GET without auth returns 401."""
        resp = api_client.get(INTENTIONS_LOG_URL)

        assert_unauthorized(resp)

    def test_list_intention_logs_does_not_show_other_users_logs(
        self, api_client, auth_headers, second_auth_headers
    ):
        """A user does not see another user's intention logs."""
        # Create an intention for the second user first
        intent_resp = api_client.post(
            "/api/v1/customization/intentions",
            json={"name": "User2 Intention for Cross-Check"},
            headers=second_auth_headers,
        )
        second_intention_id = intent_resp.json()["data"]["id"]

        api_client.post(
            INTENTIONS_LOG_URL,
            json=intention_log_payload(second_intention_id),
            headers=second_auth_headers,
        )

        resp = api_client.get(INTENTIONS_LOG_URL, headers=auth_headers)
        body = assert_success(resp)
        # The list should not contain any log with that intention
        intention_ids = [
            item.get("intentionId") for item in body["data"]["items"]
        ]
        assert second_intention_id not in intention_ids

    def test_list_intention_logs_pagination(self, api_client, auth_headers):
        """List endpoint returns pagination metadata."""
        resp = api_client.get(
            INTENTIONS_LOG_URL,
            headers=auth_headers,
            params={"page": 1, "limit": 5},
        )

        body = assert_success(resp)
        assert "page" in body["data"]
        pagination = body["data"]
        assert "page" in pagination
        assert "limit" in pagination


# ── POST /intentions (create) ────────────────────────────────────────────────


class TestCreateIntentionLog:
    """Tests for POST /api/v1/tracking/intentions."""

    def test_create_intention_log_minimal_returns_201(
        self, api_client, auth_headers, intention_id
    ):
        """Creating with only required fields returns 201."""
        resp = api_client.post(
            INTENTIONS_LOG_URL,
            json=intention_log_payload(intention_id),
            headers=auth_headers,
        )

        body = assert_created(resp)
        assert body["data"]["intentionId"] == intention_id
        assert "id" in body["data"]

    def test_create_intention_log_with_start_and_end_date_returns_201(
        self, api_client, auth_headers, intention_id
    ):
        """Creating with both startDate and endDate returns 201."""
        start = date.today().isoformat()
        end = (date.today() + timedelta(days=7)).isoformat()

        resp = api_client.post(
            INTENTIONS_LOG_URL,
            json=intention_log_payload(
                intention_id, startDate=start, endDate=end
            ),
            headers=auth_headers,
        )

        body = assert_created(resp)
        assert body["data"]["startDate"] is not None
        assert body["data"]["endDate"] is not None

    def test_create_intention_log_with_same_start_and_end_date_returns_201(
        self, api_client, auth_headers, intention_id
    ):
        """When startDate equals endDate, the request succeeds."""
        same_day = date.today().isoformat()

        resp = api_client.post(
            INTENTIONS_LOG_URL,
            json=intention_log_payload(
                intention_id, startDate=same_day, endDate=same_day
            ),
            headers=auth_headers,
        )

        assert_created(resp)

    def test_create_intention_log_end_before_start_returns_400(
        self, api_client, auth_headers, intention_id
    ):
        """endDate before startDate returns 400."""
        start = date.today().isoformat()
        end = (date.today() - timedelta(days=1)).isoformat()

        resp = api_client.post(
            INTENTIONS_LOG_URL,
            json=intention_log_payload(
                intention_id, startDate=start, endDate=end
            ),
            headers=auth_headers,
        )

        body = assert_error(resp, 400)
        assert "enddate must be on or after startdate" in body["error"]["message"].lower()

    def test_create_intention_log_with_notes_returns_201(
        self, api_client, auth_headers, intention_id
    ):
        """Creating with optional notes returns 201."""
        resp = api_client.post(
            INTENTIONS_LOG_URL,
            json=intention_log_payload(intention_id, notes="Alhamdulillah"),
            headers=auth_headers,
        )

        body = assert_created(resp)
        assert body["data"]["notes"] == "Alhamdulillah"

    def test_create_intention_log_invalid_intention_id_returns_400(
        self, api_client, auth_headers
    ):
        """An intentionId that does not exist returns 400."""
        resp = api_client.post(
            INTENTIONS_LOG_URL,
            json=intention_log_payload(NONEXISTENT_ID),
            headers=auth_headers,
        )

        assert_error(resp, 400)

    def test_create_intention_log_other_users_intention_returns_400(
        self, api_client, auth_headers, second_user_intention_id
    ):
        """Using another user's intentionId returns 400."""
        resp = api_client.post(
            INTENTIONS_LOG_URL,
            json=intention_log_payload(second_user_intention_id),
            headers=auth_headers,
        )

        body = assert_error(resp, 400)
        assert "not owned by user" in body["error"]["message"].lower() or \
               "not found" in body["error"]["message"].lower()

    def test_create_intention_log_missing_intention_id_returns_422(
        self, api_client, auth_headers
    ):
        """Omitting intentionId returns 422."""
        resp = api_client.post(
            INTENTIONS_LOG_URL,
            json={"date": today_str()},
            headers=auth_headers,
        )

        assert_validation_error(resp)

    def test_create_intention_log_missing_date_returns_422(
        self, api_client, auth_headers, intention_id
    ):
        """Omitting date returns 422."""
        resp = api_client.post(
            INTENTIONS_LOG_URL,
            json={"intentionId": intention_id},
            headers=auth_headers,
        )

        assert_validation_error(resp)

    def test_create_intention_log_requires_auth(self, api_client, intention_id):
        """Creating without auth returns 401."""
        resp = api_client.post(
            INTENTIONS_LOG_URL,
            json=intention_log_payload(intention_id),
        )

        assert_unauthorized(resp)


# ── GET /intentions/:id ──────────────────────────────────────────────────────


class TestGetIntentionLog:
    """Tests for GET /api/v1/tracking/intentions/:id."""

    def test_get_intention_log_returns_200(
        self, api_client, auth_headers, created_intention_log
    ):
        """Retrieving an existing intention log returns 200 with correct data."""
        resp = api_client.get(
            f"{INTENTIONS_LOG_URL}/{created_intention_log['id']}",
            headers=auth_headers,
        )

        body = assert_success(resp)
        assert body["data"]["id"] == created_intention_log["id"]

    def test_get_intention_log_not_found_returns_404(
        self, api_client, auth_headers
    ):
        """Retrieving a non-existent intention log returns 404."""
        resp = api_client.get(
            f"{INTENTIONS_LOG_URL}/{NONEXISTENT_ID}", headers=auth_headers
        )

        assert_not_found(resp)

    def test_get_intention_log_other_user_returns_404(
        self, api_client, auth_headers, second_auth_headers
    ):
        """Retrieving another user's intention log returns 404."""
        # Create intention + log under second user
        intent_resp = api_client.post(
            "/api/v1/customization/intentions",
            json={"name": "User2 Log Fetch Intention"},
            headers=second_auth_headers,
        )
        second_intention_id = intent_resp.json()["data"]["id"]

        create_resp = api_client.post(
            INTENTIONS_LOG_URL,
            json=intention_log_payload(second_intention_id),
            headers=second_auth_headers,
        )
        log_id = create_resp.json()["data"]["id"]

        resp = api_client.get(
            f"{INTENTIONS_LOG_URL}/{log_id}", headers=auth_headers
        )

        assert_not_found(resp)

    def test_get_intention_log_requires_auth(self, api_client):
        """Retrieving without auth returns 401."""
        resp = api_client.get(f"{INTENTIONS_LOG_URL}/{NONEXISTENT_ID}")

        assert_unauthorized(resp)


# ── PUT /intentions/:id ──────────────────────────────────────────────────────


class TestUpdateIntentionLog:
    """Tests for PUT /api/v1/tracking/intentions/:id."""

    def test_update_intention_log_notes_returns_200(
        self, api_client, auth_headers, created_intention_log
    ):
        """Updating an intention log's notes returns 200."""
        resp = api_client.put(
            f"{INTENTIONS_LOG_URL}/{created_intention_log['id']}",
            json={"notes": "Updated notes"},
            headers=auth_headers,
        )

        body = assert_success(resp)
        assert body["data"]["notes"] == "Updated notes"

    def test_update_intention_log_not_found_returns_404(
        self, api_client, auth_headers
    ):
        """Updating a non-existent intention log returns 404."""
        resp = api_client.put(
            f"{INTENTIONS_LOG_URL}/{NONEXISTENT_ID}",
            json={"notes": "Ghost"},
            headers=auth_headers,
        )

        assert_not_found(resp)

    def test_update_intention_log_other_user_returns_404(
        self, api_client, auth_headers, second_auth_headers
    ):
        """Updating another user's intention log returns 404."""
        intent_resp = api_client.post(
            "/api/v1/customization/intentions",
            json={"name": "User2 Update Intention"},
            headers=second_auth_headers,
        )
        second_intention_id = intent_resp.json()["data"]["id"]

        create_resp = api_client.post(
            INTENTIONS_LOG_URL,
            json=intention_log_payload(second_intention_id),
            headers=second_auth_headers,
        )
        log_id = create_resp.json()["data"]["id"]

        resp = api_client.put(
            f"{INTENTIONS_LOG_URL}/{log_id}",
            json={"notes": "Stolen"},
            headers=auth_headers,
        )

        assert_not_found(resp)

    def test_update_intention_log_requires_auth(self, api_client):
        """Updating without auth returns 401."""
        resp = api_client.put(
            f"{INTENTIONS_LOG_URL}/{NONEXISTENT_ID}",
            json={"notes": "No Auth"},
        )

        assert_unauthorized(resp)


# ── DELETE /intentions/:id ───────────────────────────────────────────────────


class TestDeleteIntentionLog:
    """Tests for DELETE /api/v1/tracking/intentions/:id."""

    def test_delete_intention_log_returns_204(
        self, api_client, auth_headers, intention_id
    ):
        """Deleting an owned intention log returns 204."""
        create_resp = api_client.post(
            INTENTIONS_LOG_URL,
            json=intention_log_payload(intention_id),
            headers=auth_headers,
        )
        log_id = create_resp.json()["data"]["id"]

        resp = api_client.delete(
            f"{INTENTIONS_LOG_URL}/{log_id}", headers=auth_headers
        )
        assert resp.status_code == 204

    def test_delete_intention_log_not_found_returns_404(
        self, api_client, auth_headers
    ):
        """Deleting a non-existent intention log returns 404."""
        resp = api_client.delete(
            f"{INTENTIONS_LOG_URL}/{NONEXISTENT_ID}", headers=auth_headers
        )

        assert_not_found(resp)

    def test_delete_intention_log_other_user_returns_404(
        self, api_client, auth_headers, second_auth_headers
    ):
        """Deleting another user's intention log returns 404."""
        intent_resp = api_client.post(
            "/api/v1/customization/intentions",
            json={"name": "User2 Undeletable Intention Log"},
            headers=second_auth_headers,
        )
        second_intention_id = intent_resp.json()["data"]["id"]

        create_resp = api_client.post(
            INTENTIONS_LOG_URL,
            json=intention_log_payload(second_intention_id),
            headers=second_auth_headers,
        )
        log_id = create_resp.json()["data"]["id"]

        resp = api_client.delete(
            f"{INTENTIONS_LOG_URL}/{log_id}", headers=auth_headers
        )

        assert_not_found(resp)

    def test_delete_intention_log_requires_auth(self, api_client):
        """Deleting without auth returns 401."""
        resp = api_client.delete(f"{INTENTIONS_LOG_URL}/{NONEXISTENT_ID}")

        assert_unauthorized(resp)

    def test_deleted_intention_log_not_in_list(
        self, api_client, auth_headers, intention_id
    ):
        """After deletion, the intention log no longer appears in the list."""
        create_resp = api_client.post(
            INTENTIONS_LOG_URL,
            json=intention_log_payload(intention_id),
            headers=auth_headers,
        )
        log_id = create_resp.json()["data"]["id"]
        api_client.delete(
            f"{INTENTIONS_LOG_URL}/{log_id}", headers=auth_headers
        )

        resp = api_client.get(INTENTIONS_LOG_URL, headers=auth_headers)
        body = assert_success(resp)
        ids = [item["id"] for item in body["data"]["items"]]
        assert log_id not in ids

    def test_get_deleted_intention_log_returns_404(
        self, api_client, auth_headers, intention_id
    ):
        """Getting a deleted intention log by ID returns 404."""
        create_resp = api_client.post(
            INTENTIONS_LOG_URL,
            json=intention_log_payload(intention_id),
            headers=auth_headers,
        )
        log_id = create_resp.json()["data"]["id"]
        api_client.delete(
            f"{INTENTIONS_LOG_URL}/{log_id}", headers=auth_headers
        )

        resp = api_client.get(
            f"{INTENTIONS_LOG_URL}/{log_id}", headers=auth_headers
        )

        assert_not_found(resp)
