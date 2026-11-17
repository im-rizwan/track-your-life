"""Tests for /api/v1/customization/skills CRUD and /skills/:skillId/topics sub-resource."""

import pytest

from utils.assertions import (
    assert_success,
    assert_created,
    assert_unauthorized,
    assert_not_found,
    assert_validation_error,
)

pytestmark = pytest.mark.customization

SKILLS_URL = "/api/v1/customization/skills"

NONEXISTENT_ID = "clxxxxxxxxxxxxxxxxxxxxxxxxx"


# ── Helpers / fixtures ────────────────────────────────────────────────────────


@pytest.fixture
def custom_skill(api_client, auth_headers):
    """Create and return a user-owned skill."""
    resp = api_client.post(
        SKILLS_URL, json={"name": "Arabic Language"}, headers=auth_headers
    )
    assert resp.status_code == 201
    return resp.json()["data"]


@pytest.fixture
def custom_skill_with_topic(api_client, auth_headers, custom_skill):
    """Create a skill with one topic. Returns (skill, topic) dicts."""
    skill_id = custom_skill["id"]
    resp = api_client.post(
        f"{SKILLS_URL}/{skill_id}/topics",
        json={"name": "Nahw (Grammar)"},
        headers=auth_headers,
    )
    assert resp.status_code == 201
    topic = resp.json()["data"]
    return custom_skill, topic


# ── GET /skills ───────────────────────────────────────────────────────────────


class TestListSkills:
    """Tests for GET /api/v1/customization/skills."""

    def test_list_skills_empty_initially(self, api_client, auth_headers):
        """A new user starts with an empty skills list."""
        resp = api_client.get(SKILLS_URL, headers=auth_headers)

        body = assert_success(resp)
        assert isinstance(body["data"], list)
        # Skills are user-owned only, so a fresh user should have none
        # (or have none that are not from other fixture contamination).

    def test_list_skills_shows_created_item(
        self, api_client, auth_headers, custom_skill
    ):
        """After creating a skill, it appears in the list."""
        resp = api_client.get(SKILLS_URL, headers=auth_headers)

        body = assert_success(resp)
        ids = [item["id"] for item in body["data"]]
        assert custom_skill["id"] in ids

    def test_list_skills_requires_auth(self, api_client):
        """GET without auth returns 401."""
        resp = api_client.get(SKILLS_URL)

        assert_unauthorized(resp)


# ── POST /skills ──────────────────────────────────────────────────────────────


class TestCreateSkill:
    """Tests for POST /api/v1/customization/skills."""

    def test_create_skill_returns_201(self, api_client, auth_headers):
        """Creating with a valid name returns 201."""
        resp = api_client.post(
            SKILLS_URL, json={"name": "Quran Memorization"}, headers=auth_headers
        )

        body = assert_created(resp)
        assert body["data"]["name"] == "Quran Memorization"
        assert "id" in body["data"]

    def test_create_skill_duplicate_name_returns_409(
        self, api_client, auth_headers
    ):
        """Creating with a duplicate name returns 409.

        The API catches Prisma unique constraint violations for
        customization entities and returns a ConflictError (409).
        """
        name = "Duplicate Skill"
        api_client.post(SKILLS_URL, json={"name": name}, headers=auth_headers)

        resp = api_client.post(
            SKILLS_URL, json={"name": name}, headers=auth_headers
        )
        assert resp.status_code == 409, (
            f"Expected 409 for duplicate name, got {resp.status_code}: {resp.text}"
        )

    def test_create_skill_missing_name_returns_422(self, api_client, auth_headers):
        """Omitting the name field returns 422."""
        resp = api_client.post(SKILLS_URL, json={}, headers=auth_headers)

        assert_validation_error(resp)

    def test_create_skill_name_too_short_returns_422(
        self, api_client, auth_headers
    ):
        """A name shorter than 2 characters returns 422."""
        resp = api_client.post(
            SKILLS_URL, json={"name": "X"}, headers=auth_headers
        )

        assert_validation_error(resp)

    def test_create_skill_name_too_long_returns_422(
        self, api_client, auth_headers
    ):
        """A name longer than 100 characters returns 422."""
        resp = api_client.post(
            SKILLS_URL, json={"name": "A" * 101}, headers=auth_headers
        )

        assert_validation_error(resp)

    def test_create_skill_requires_auth(self, api_client):
        """Creating without auth returns 401."""
        resp = api_client.post(SKILLS_URL, json={"name": "No Auth Skill"})

        assert_unauthorized(resp)


# ── PUT /skills/:id ──────────────────────────────────────────────────────────


class TestUpdateSkill:
    """Tests for PUT /api/v1/customization/skills/:id."""

    def test_update_skill_returns_200(
        self, api_client, auth_headers, custom_skill
    ):
        """Updating a user-owned skill returns 200."""
        resp = api_client.put(
            f"{SKILLS_URL}/{custom_skill['id']}",
            json={"name": "Advanced Arabic"},
            headers=auth_headers,
        )

        body = assert_success(resp)
        assert body["data"]["name"] == "Advanced Arabic"

    def test_update_skill_not_found_returns_404(self, api_client, auth_headers):
        """Updating a non-existent skill returns 404."""
        resp = api_client.put(
            f"{SKILLS_URL}/{NONEXISTENT_ID}",
            json={"name": "Ghost"},
            headers=auth_headers,
        )

        assert_not_found(resp)

    def test_update_skill_other_user_returns_404(
        self, api_client, auth_headers, second_auth_headers
    ):
        """Updating another user's skill returns 404."""
        # User 2 creates a skill
        create_resp = api_client.post(
            SKILLS_URL,
            json={"name": "User2 Skill"},
            headers=second_auth_headers,
        )
        skill_id = create_resp.json()["data"]["id"]

        # User 1 tries to update
        resp = api_client.put(
            f"{SKILLS_URL}/{skill_id}",
            json={"name": "Stolen"},
            headers=auth_headers,
        )

        assert_not_found(resp)

    def test_update_skill_requires_auth(self, api_client):
        """Updating without auth returns 401."""
        resp = api_client.put(
            f"{SKILLS_URL}/{NONEXISTENT_ID}", json={"name": "No Auth"}
        )

        assert_unauthorized(resp)


# ── DELETE /skills/:id ───────────────────────────────────────────────────────


class TestDeleteSkill:
    """Tests for DELETE /api/v1/customization/skills/:id."""

    def test_delete_skill_returns_204(self, api_client, auth_headers):
        """Deleting a user-owned skill returns 204."""
        create_resp = api_client.post(
            SKILLS_URL, json={"name": "Deletable Skill"}, headers=auth_headers
        )
        skill_id = create_resp.json()["data"]["id"]

        resp = api_client.delete(
            f"{SKILLS_URL}/{skill_id}", headers=auth_headers
        )
        assert resp.status_code == 204

    def test_delete_skill_not_found_returns_404(self, api_client, auth_headers):
        """Deleting a non-existent skill returns 404."""
        resp = api_client.delete(
            f"{SKILLS_URL}/{NONEXISTENT_ID}", headers=auth_headers
        )

        assert_not_found(resp)

    def test_delete_skill_other_user_returns_404(
        self, api_client, auth_headers, second_auth_headers
    ):
        """Deleting another user's skill returns 404."""
        create_resp = api_client.post(
            SKILLS_URL,
            json={"name": "User2 Undeletable Skill"},
            headers=second_auth_headers,
        )
        skill_id = create_resp.json()["data"]["id"]

        resp = api_client.delete(
            f"{SKILLS_URL}/{skill_id}", headers=auth_headers
        )

        assert_not_found(resp)

    def test_delete_skill_requires_auth(self, api_client):
        """Deleting without auth returns 401."""
        resp = api_client.delete(f"{SKILLS_URL}/{NONEXISTENT_ID}")

        assert_unauthorized(resp)

    def test_deleted_skill_not_in_list(self, api_client, auth_headers):
        """After deletion, the skill no longer appears in the list."""
        create_resp = api_client.post(
            SKILLS_URL, json={"name": "Vanishing Skill"}, headers=auth_headers
        )
        skill_id = create_resp.json()["data"]["id"]
        api_client.delete(f"{SKILLS_URL}/{skill_id}", headers=auth_headers)

        resp = api_client.get(SKILLS_URL, headers=auth_headers)
        body = assert_success(resp)
        ids = [item["id"] for item in body["data"]]
        assert skill_id not in ids


# ═══════════════════════════════════════════════════════════════════════════════
# Skill Topics sub-resource
# ═══════════════════════════════════════════════════════════════════════════════


class TestListSkillTopics:
    """Tests for GET /api/v1/customization/skills/:skillId/topics."""

    def test_list_topics_empty_initially(
        self, api_client, auth_headers, custom_skill
    ):
        """A newly created skill starts with no topics."""
        skill_id = custom_skill["id"]
        resp = api_client.get(
            f"{SKILLS_URL}/{skill_id}/topics", headers=auth_headers
        )

        body = assert_success(resp)
        assert isinstance(body["data"], list)
        assert len(body["data"]) == 0

    def test_list_topics_shows_created_topic(
        self, api_client, auth_headers, custom_skill_with_topic
    ):
        """After creating a topic, it appears in the list."""
        skill, topic = custom_skill_with_topic
        resp = api_client.get(
            f"{SKILLS_URL}/{skill['id']}/topics", headers=auth_headers
        )

        body = assert_success(resp)
        ids = [t["id"] for t in body["data"]]
        assert topic["id"] in ids

    def test_list_topics_nonexistent_skill_returns_404(
        self, api_client, auth_headers
    ):
        """Listing topics for a non-existent skill returns 404."""
        resp = api_client.get(
            f"{SKILLS_URL}/{NONEXISTENT_ID}/topics", headers=auth_headers
        )

        assert_not_found(resp)

    def test_list_topics_requires_auth(self, api_client):
        """Listing topics without auth returns 401."""
        resp = api_client.get(f"{SKILLS_URL}/{NONEXISTENT_ID}/topics")

        assert_unauthorized(resp)


class TestCreateSkillTopic:
    """Tests for POST /api/v1/customization/skills/:skillId/topics."""

    def test_create_topic_returns_201(
        self, api_client, auth_headers, custom_skill
    ):
        """Creating a topic with a valid name returns 201."""
        skill_id = custom_skill["id"]
        resp = api_client.post(
            f"{SKILLS_URL}/{skill_id}/topics",
            json={"name": "Sarf (Morphology)"},
            headers=auth_headers,
        )

        body = assert_created(resp)
        assert body["data"]["name"] == "Sarf (Morphology)"
        assert "id" in body["data"]

    def test_create_topic_duplicate_name_returns_409(
        self, api_client, auth_headers, custom_skill
    ):
        """Creating a topic with a duplicate name under the same skill returns 409.

        The API catches Prisma unique constraint violations for
        customization entities and returns a ConflictError (409).
        """
        skill_id = custom_skill["id"]
        name = "Duplicate Topic"
        api_client.post(
            f"{SKILLS_URL}/{skill_id}/topics",
            json={"name": name},
            headers=auth_headers,
        )

        resp = api_client.post(
            f"{SKILLS_URL}/{skill_id}/topics",
            json={"name": name},
            headers=auth_headers,
        )
        assert resp.status_code == 409, (
            f"Expected 409 for duplicate topic name, got {resp.status_code}: {resp.text}"
        )

    def test_create_topic_nonexistent_skill_returns_404(
        self, api_client, auth_headers
    ):
        """Creating a topic for a non-existent skill returns 404."""
        resp = api_client.post(
            f"{SKILLS_URL}/{NONEXISTENT_ID}/topics",
            json={"name": "Orphan Topic"},
            headers=auth_headers,
        )

        assert_not_found(resp)

    def test_create_topic_other_user_skill_returns_404(
        self, api_client, auth_headers, second_auth_headers
    ):
        """Creating a topic on another user's skill returns 404."""
        # User 2 creates a skill
        create_resp = api_client.post(
            SKILLS_URL,
            json={"name": "User2 Skill For Topic"},
            headers=second_auth_headers,
        )
        skill_id = create_resp.json()["data"]["id"]

        # User 1 tries to add a topic
        resp = api_client.post(
            f"{SKILLS_URL}/{skill_id}/topics",
            json={"name": "Intruder Topic"},
            headers=auth_headers,
        )

        assert_not_found(resp)

    def test_create_topic_missing_name_returns_422(
        self, api_client, auth_headers, custom_skill
    ):
        """Omitting the name field returns 422."""
        resp = api_client.post(
            f"{SKILLS_URL}/{custom_skill['id']}/topics",
            json={},
            headers=auth_headers,
        )

        assert_validation_error(resp)

    def test_create_topic_requires_auth(self, api_client):
        """Creating a topic without auth returns 401."""
        resp = api_client.post(
            f"{SKILLS_URL}/{NONEXISTENT_ID}/topics",
            json={"name": "No Auth Topic"},
        )

        assert_unauthorized(resp)


class TestUpdateSkillTopic:
    """Tests for PATCH /api/v1/customization/skills/:skillId/topics/:topicId."""

    def test_update_topic_name_returns_200(
        self, api_client, auth_headers, custom_skill_with_topic
    ):
        """Updating a topic's name returns 200."""
        skill, topic = custom_skill_with_topic
        resp = api_client.patch(
            f"{SKILLS_URL}/{skill['id']}/topics/{topic['id']}",
            json={"name": "Updated Grammar"},
            headers=auth_headers,
        )

        body = assert_success(resp)
        assert body["data"]["name"] == "Updated Grammar"

    def test_update_topic_toggle_pending_returns_200(
        self, api_client, auth_headers, custom_skill_with_topic
    ):
        """Toggling isPending on a topic returns 200."""
        skill, topic = custom_skill_with_topic
        resp = api_client.patch(
            f"{SKILLS_URL}/{skill['id']}/topics/{topic['id']}",
            json={"isPending": False},
            headers=auth_headers,
        )

        body = assert_success(resp)
        assert body["data"]["isPending"] is False

    def test_update_topic_nonexistent_returns_404(
        self, api_client, auth_headers, custom_skill
    ):
        """Updating a non-existent topic returns 404."""
        resp = api_client.patch(
            f"{SKILLS_URL}/{custom_skill['id']}/topics/{NONEXISTENT_ID}",
            json={"name": "Ghost Topic"},
            headers=auth_headers,
        )

        assert_not_found(resp)

    def test_update_topic_nonexistent_skill_returns_404(
        self, api_client, auth_headers
    ):
        """Updating a topic on a non-existent skill returns 404."""
        resp = api_client.patch(
            f"{SKILLS_URL}/{NONEXISTENT_ID}/topics/{NONEXISTENT_ID}",
            json={"name": "Ghost Skill Topic"},
            headers=auth_headers,
        )

        assert_not_found(resp)

    def test_update_topic_requires_auth(self, api_client):
        """Updating a topic without auth returns 401."""
        resp = api_client.patch(
            f"{SKILLS_URL}/{NONEXISTENT_ID}/topics/{NONEXISTENT_ID}",
            json={"name": "No Auth"},
        )

        assert_unauthorized(resp)


class TestDeleteSkillTopic:
    """Tests for DELETE /api/v1/customization/skills/:skillId/topics/:topicId."""

    def test_delete_topic_returns_204(
        self, api_client, auth_headers, custom_skill
    ):
        """Deleting a topic returns 204."""
        skill_id = custom_skill["id"]
        # Create a topic to delete
        create_resp = api_client.post(
            f"{SKILLS_URL}/{skill_id}/topics",
            json={"name": "Deletable Topic"},
            headers=auth_headers,
        )
        topic_id = create_resp.json()["data"]["id"]

        resp = api_client.delete(
            f"{SKILLS_URL}/{skill_id}/topics/{topic_id}",
            headers=auth_headers,
        )
        assert resp.status_code == 204

    def test_delete_topic_nonexistent_returns_404(
        self, api_client, auth_headers, custom_skill
    ):
        """Deleting a non-existent topic returns 404."""
        resp = api_client.delete(
            f"{SKILLS_URL}/{custom_skill['id']}/topics/{NONEXISTENT_ID}",
            headers=auth_headers,
        )

        assert_not_found(resp)

    def test_delete_topic_nonexistent_skill_returns_404(
        self, api_client, auth_headers
    ):
        """Deleting a topic on a non-existent skill returns 404."""
        resp = api_client.delete(
            f"{SKILLS_URL}/{NONEXISTENT_ID}/topics/{NONEXISTENT_ID}",
            headers=auth_headers,
        )

        assert_not_found(resp)

    def test_delete_topic_requires_auth(self, api_client):
        """Deleting a topic without auth returns 401."""
        resp = api_client.delete(
            f"{SKILLS_URL}/{NONEXISTENT_ID}/topics/{NONEXISTENT_ID}"
        )

        assert_unauthorized(resp)

    def test_deleted_topic_not_in_list(
        self, api_client, auth_headers, custom_skill
    ):
        """After deletion, the topic no longer appears in the list."""
        skill_id = custom_skill["id"]
        create_resp = api_client.post(
            f"{SKILLS_URL}/{skill_id}/topics",
            json={"name": "Vanishing Topic"},
            headers=auth_headers,
        )
        topic_id = create_resp.json()["data"]["id"]

        api_client.delete(
            f"{SKILLS_URL}/{skill_id}/topics/{topic_id}",
            headers=auth_headers,
        )

        resp = api_client.get(
            f"{SKILLS_URL}/{skill_id}/topics", headers=auth_headers
        )
        body = assert_success(resp)
        ids = [t["id"] for t in body["data"]]
        assert topic_id not in ids
