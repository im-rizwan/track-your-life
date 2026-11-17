"""Tests for /api/v1/tracking/tasks CRUD endpoints.

Tasks support optional foreign keys: intentionId (user-owned), taskPriorityId
and taskStatusId (reference data). Title is required with min 1 / max 200 chars.
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
from utils.factories import task_payload, today_str, yesterday_str

pytestmark = pytest.mark.tracking

TASKS_URL = "/api/v1/tracking/tasks"

NONEXISTENT_ID = "clxxxxxxxxxxxxxxxxxxxxxxxxx"


# ── Helpers / fixtures ────────────────────────────────────────────────────────


@pytest.fixture
def created_task(api_client, auth_headers):
    """Create a minimal task and return its response data."""
    resp = api_client.post(
        TASKS_URL,
        json=task_payload(),
        headers=auth_headers,
    )
    assert resp.status_code == 201
    return resp.json()["data"]


@pytest.fixture
def second_user_intention(api_client, second_auth_headers):
    """Create an intention under the second user and return its ID."""
    resp = api_client.post(
        "/api/v1/customization/intentions",
        json={"name": "Second User Private Intention"},
        headers=second_auth_headers,
    )
    assert resp.status_code == 201
    return resp.json()["data"]["id"]


# ── GET /tasks (list) ────────────────────────────────────────────────────────


class TestListTasks:
    """Tests for GET /api/v1/tracking/tasks."""

    def test_list_tasks_empty(self, api_client, auth_headers):
        """A new user starts with an empty tasks list."""
        resp = api_client.get(TASKS_URL, headers=auth_headers)

        body = assert_success(resp)
        assert "items" in body["data"]
        assert "page" in body["data"]
        assert isinstance(body["data"]["items"], list)

    def test_list_tasks_shows_created_item(
        self, api_client, auth_headers, created_task
    ):
        """After creating a task, it appears in the list."""
        resp = api_client.get(TASKS_URL, headers=auth_headers)

        body = assert_success(resp)
        ids = [item["id"] for item in body["data"]["items"]]
        assert created_task["id"] in ids

    def test_list_tasks_requires_auth(self, api_client):
        """GET without auth returns 401."""
        resp = api_client.get(TASKS_URL)

        assert_unauthorized(resp)

    def test_list_tasks_does_not_show_other_users_tasks(
        self, api_client, auth_headers, second_auth_headers
    ):
        """A user does not see another user's tasks."""
        api_client.post(
            TASKS_URL,
            json=task_payload(title="User2 Secret Task"),
            headers=second_auth_headers,
        )

        resp = api_client.get(TASKS_URL, headers=auth_headers)
        body = assert_success(resp)
        titles = [item["title"] for item in body["data"]["items"]]
        assert "User2 Secret Task" not in titles

    def test_list_tasks_pagination(self, api_client, auth_headers):
        """List endpoint returns pagination metadata."""
        resp = api_client.get(
            TASKS_URL, headers=auth_headers, params={"page": 1, "limit": 5}
        )

        body = assert_success(resp)
        assert "page" in body["data"]
        pagination = body["data"]
        assert "page" in pagination
        assert "limit" in pagination


# ── POST /tasks (create) ─────────────────────────────────────────────────────


class TestCreateTask:
    """Tests for POST /api/v1/tracking/tasks."""

    def test_create_task_minimal_returns_201(self, api_client, auth_headers):
        """Creating with only required fields (title, date) returns 201."""
        resp = api_client.post(
            TASKS_URL,
            json=task_payload(),
            headers=auth_headers,
        )

        body = assert_created(resp)
        assert body["data"]["title"] == "Test task"
        assert "id" in body["data"]

    def test_create_task_with_all_optional_fks_returns_201(
        self, api_client, auth_headers, intention_id, task_priority_id, task_status_id
    ):
        """Creating with intentionId, taskPriorityId, and taskStatusId returns 201."""
        resp = api_client.post(
            TASKS_URL,
            json=task_payload(
                intentionId=intention_id,
                taskPriorityId=task_priority_id,
                taskStatusId=task_status_id,
            ),
            headers=auth_headers,
        )

        body = assert_created(resp)
        assert body["data"]["intentionId"] == intention_id
        assert body["data"]["taskPriorityId"] == task_priority_id
        assert body["data"]["taskStatusId"] == task_status_id

    def test_create_task_with_notes_returns_201(self, api_client, auth_headers):
        """Creating with optional notes returns 201."""
        resp = api_client.post(
            TASKS_URL,
            json=task_payload(notes="Remember to review this"),
            headers=auth_headers,
        )

        body = assert_created(resp)
        assert body["data"]["notes"] == "Remember to review this"

    def test_create_task_empty_title_returns_422(self, api_client, auth_headers):
        """An empty title string returns 422 validation error."""
        resp = api_client.post(
            TASKS_URL,
            json=task_payload(title=""),
            headers=auth_headers,
        )

        assert_validation_error(resp)

    def test_create_task_missing_title_returns_422(self, api_client, auth_headers):
        """Omitting the title field entirely returns 422."""
        payload = {"date": today_str()}

        resp = api_client.post(TASKS_URL, json=payload, headers=auth_headers)

        assert_validation_error(resp)

    def test_create_task_title_too_long_returns_422(self, api_client, auth_headers):
        """A title longer than 200 characters returns 422."""
        resp = api_client.post(
            TASKS_URL,
            json=task_payload(title="A" * 201),
            headers=auth_headers,
        )

        assert_validation_error(resp)

    def test_create_task_title_at_max_length_succeeds(
        self, api_client, auth_headers
    ):
        """A title exactly 200 characters long is accepted."""
        resp = api_client.post(
            TASKS_URL,
            json=task_payload(title="B" * 200),
            headers=auth_headers,
        )

        assert_created(resp)

    def test_create_task_missing_date_returns_422(self, api_client, auth_headers):
        """Omitting the date field returns 422."""
        resp = api_client.post(
            TASKS_URL,
            json={"title": "No date task"},
            headers=auth_headers,
        )

        assert_validation_error(resp)

    def test_create_task_invalid_intention_id_returns_400(
        self, api_client, auth_headers
    ):
        """An intentionId that does not exist returns 400."""
        resp = api_client.post(
            TASKS_URL,
            json=task_payload(intentionId=NONEXISTENT_ID),
            headers=auth_headers,
        )

        assert_error(resp, 400)

    def test_create_task_invalid_task_priority_id_returns_400(
        self, api_client, auth_headers
    ):
        """A taskPriorityId that does not exist returns 400."""
        resp = api_client.post(
            TASKS_URL,
            json=task_payload(taskPriorityId=NONEXISTENT_ID),
            headers=auth_headers,
        )

        assert_error(resp, 400)

    def test_create_task_invalid_task_status_id_returns_400(
        self, api_client, auth_headers
    ):
        """A taskStatusId that does not exist returns 400."""
        resp = api_client.post(
            TASKS_URL,
            json=task_payload(taskStatusId=NONEXISTENT_ID),
            headers=auth_headers,
        )

        assert_error(resp, 400)

    def test_create_task_intention_from_other_user_returns_400(
        self, api_client, auth_headers, second_user_intention
    ):
        """Using another user's intentionId returns 400."""
        resp = api_client.post(
            TASKS_URL,
            json=task_payload(intentionId=second_user_intention),
            headers=auth_headers,
        )

        body = assert_error(resp, 400)
        assert "not owned by user" in body["error"]["message"].lower() or \
               "not found" in body["error"]["message"].lower()

    def test_create_task_requires_auth(self, api_client):
        """Creating without auth returns 401."""
        resp = api_client.post(TASKS_URL, json=task_payload())

        assert_unauthorized(resp)


# ── GET /tasks/:id ───────────────────────────────────────────────────────────


class TestGetTask:
    """Tests for GET /api/v1/tracking/tasks/:id."""

    def test_get_task_returns_200(self, api_client, auth_headers, created_task):
        """Retrieving an existing task returns 200 with correct data."""
        resp = api_client.get(
            f"{TASKS_URL}/{created_task['id']}", headers=auth_headers
        )

        body = assert_success(resp)
        assert body["data"]["id"] == created_task["id"]
        assert body["data"]["title"] == created_task["title"]

    def test_get_task_not_found_returns_404(self, api_client, auth_headers):
        """Retrieving a non-existent task returns 404."""
        resp = api_client.get(
            f"{TASKS_URL}/{NONEXISTENT_ID}", headers=auth_headers
        )

        assert_not_found(resp)

    def test_get_task_other_user_returns_404(
        self, api_client, auth_headers, second_auth_headers
    ):
        """Retrieving another user's task returns 404."""
        create_resp = api_client.post(
            TASKS_URL,
            json=task_payload(title="User2 Only Task"),
            headers=second_auth_headers,
        )
        item_id = create_resp.json()["data"]["id"]

        resp = api_client.get(f"{TASKS_URL}/{item_id}", headers=auth_headers)

        assert_not_found(resp)

    def test_get_task_requires_auth(self, api_client):
        """Retrieving without auth returns 401."""
        resp = api_client.get(f"{TASKS_URL}/{NONEXISTENT_ID}")

        assert_unauthorized(resp)


# ── PUT /tasks/:id ───────────────────────────────────────────────────────────


class TestUpdateTask:
    """Tests for PUT /api/v1/tracking/tasks/:id."""

    def test_update_task_returns_200(self, api_client, auth_headers, created_task):
        """Updating a task title returns 200 with new data."""
        resp = api_client.put(
            f"{TASKS_URL}/{created_task['id']}",
            json={"title": "Updated title"},
            headers=auth_headers,
        )

        body = assert_success(resp)
        assert body["data"]["title"] == "Updated title"

    def test_update_task_notes_returns_200(
        self, api_client, auth_headers, created_task
    ):
        """Updating a task's notes returns 200."""
        resp = api_client.put(
            f"{TASKS_URL}/{created_task['id']}",
            json={"notes": "Added a note"},
            headers=auth_headers,
        )

        body = assert_success(resp)
        assert body["data"]["notes"] == "Added a note"

    def test_update_task_not_found_returns_404(self, api_client, auth_headers):
        """Updating a non-existent task returns 404."""
        resp = api_client.put(
            f"{TASKS_URL}/{NONEXISTENT_ID}",
            json={"title": "Ghost"},
            headers=auth_headers,
        )

        assert_not_found(resp)

    def test_update_task_other_user_returns_404(
        self, api_client, auth_headers, second_auth_headers
    ):
        """Updating another user's task returns 404."""
        create_resp = api_client.post(
            TASKS_URL,
            json=task_payload(title="User2 Task"),
            headers=second_auth_headers,
        )
        item_id = create_resp.json()["data"]["id"]

        resp = api_client.put(
            f"{TASKS_URL}/{item_id}",
            json={"title": "Stolen"},
            headers=auth_headers,
        )

        assert_not_found(resp)

    def test_update_task_requires_auth(self, api_client):
        """Updating without auth returns 401."""
        resp = api_client.put(
            f"{TASKS_URL}/{NONEXISTENT_ID}",
            json={"title": "No Auth"},
        )

        assert_unauthorized(resp)


# ── DELETE /tasks/:id ────────────────────────────────────────────────────────


class TestDeleteTask:
    """Tests for DELETE /api/v1/tracking/tasks/:id."""

    def test_delete_task_returns_204(self, api_client, auth_headers):
        """Deleting an owned task returns 204."""
        create_resp = api_client.post(
            TASKS_URL,
            json=task_payload(title="Deletable Task"),
            headers=auth_headers,
        )
        item_id = create_resp.json()["data"]["id"]

        resp = api_client.delete(f"{TASKS_URL}/{item_id}", headers=auth_headers)
        assert resp.status_code == 204

    def test_delete_task_not_found_returns_404(self, api_client, auth_headers):
        """Deleting a non-existent task returns 404."""
        resp = api_client.delete(
            f"{TASKS_URL}/{NONEXISTENT_ID}", headers=auth_headers
        )

        assert_not_found(resp)

    def test_delete_task_other_user_returns_404(
        self, api_client, auth_headers, second_auth_headers
    ):
        """Deleting another user's task returns 404."""
        create_resp = api_client.post(
            TASKS_URL,
            json=task_payload(title="User2 Undeletable Task"),
            headers=second_auth_headers,
        )
        item_id = create_resp.json()["data"]["id"]

        resp = api_client.delete(f"{TASKS_URL}/{item_id}", headers=auth_headers)

        assert_not_found(resp)

    def test_delete_task_requires_auth(self, api_client):
        """Deleting without auth returns 401."""
        resp = api_client.delete(f"{TASKS_URL}/{NONEXISTENT_ID}")

        assert_unauthorized(resp)

    def test_deleted_task_not_in_list(self, api_client, auth_headers):
        """After deletion, the task no longer appears in the list."""
        create_resp = api_client.post(
            TASKS_URL,
            json=task_payload(title="Vanishing Task"),
            headers=auth_headers,
        )
        item_id = create_resp.json()["data"]["id"]
        api_client.delete(f"{TASKS_URL}/{item_id}", headers=auth_headers)

        resp = api_client.get(TASKS_URL, headers=auth_headers)
        body = assert_success(resp)
        ids = [item["id"] for item in body["data"]["items"]]
        assert item_id not in ids

    def test_get_deleted_task_returns_404(self, api_client, auth_headers):
        """Getting a deleted task by ID returns 404."""
        create_resp = api_client.post(
            TASKS_URL,
            json=task_payload(title="Soon Deleted"),
            headers=auth_headers,
        )
        item_id = create_resp.json()["data"]["id"]
        api_client.delete(f"{TASKS_URL}/{item_id}", headers=auth_headers)

        resp = api_client.get(f"{TASKS_URL}/{item_id}", headers=auth_headers)

        assert_not_found(resp)
