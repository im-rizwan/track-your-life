"""Full user journey smoke test.

Exercises the complete lifecycle: register, verify, login, onboard, fetch
reference/customization data, create custom items, log tracking entries,
list/update/delete tracking entries -- all within a single test function.
"""

import pytest
from datetime import date, datetime, timedelta

from utils.assertions import assert_success, assert_created
from utils.auth_helpers import create_verified_user, get_auth_headers
from utils.factories import (
    daily_prayer_payload,
    quran_log_payload,
    dhikr_log_payload,
    sleep_log_payload,
    task_payload,
)

pytestmark = pytest.mark.slow


def test_full_user_journey(api_client, db_connection):
    """End-to-end smoke test covering registration through tracking CRUD."""

    # ── Step 1: Register, verify email, and obtain auth tokens ────────────

    user = create_verified_user(api_client, db_connection)
    headers = get_auth_headers(user["tokens"])

    # Sanity check: session endpoint works
    session_resp = api_client.get("/api/v1/auth/session", headers=headers)
    assert session_resp.status_code == 200

    # ── Step 2: Complete onboarding ───────────────────────────────────────

    onboarding_resp = api_client.post(
        "/api/v1/users/onboarding",
        json={
            "displayName": "Smoke Tester",
            "age": 30,
            "city": "Kuala Lumpur",
            "country": "Malaysia",
        },
        headers=headers,
    )
    body = assert_success(onboarding_resp)
    assert body["data"]["isOnboarded"] is True

    # ── Step 3: Fetch reference data ─────────────────────────────────────

    # Prayer statuses
    prayer_statuses_resp = api_client.get(
        "/api/v1/reference/prayer-statuses", headers=headers
    )
    prayer_statuses = assert_success(prayer_statuses_resp)["data"]
    assert len(prayer_statuses) > 0, "Expected seeded prayer statuses"
    prayer_status_id = prayer_statuses[0]["id"]

    # Quran activity types
    quran_types_resp = api_client.get(
        "/api/v1/reference/quran-activity-types", headers=headers
    )
    quran_types = assert_success(quran_types_resp)["data"]
    assert len(quran_types) > 0, "Expected seeded Quran activity types"
    quran_activity_type_id = quran_types[0]["id"]

    # Task priorities
    task_priorities_resp = api_client.get(
        "/api/v1/reference/task-priorities", headers=headers
    )
    task_priorities = assert_success(task_priorities_resp)["data"]
    assert len(task_priorities) > 0

    # Task statuses
    task_statuses_resp = api_client.get(
        "/api/v1/reference/task-statuses", headers=headers
    )
    task_statuses = assert_success(task_statuses_resp)["data"]
    assert len(task_statuses) > 0

    # ── Step 4: Fetch default customization items ─────────────────────────

    # Dhikr types
    dhikr_resp = api_client.get(
        "/api/v1/customization/dhikr-types", headers=headers
    )
    dhikr_types = assert_success(dhikr_resp)["data"]
    assert len(dhikr_types) > 0, "Expected seeded dhikr types"
    dhikr_type_id = dhikr_types[0]["id"]

    # Fasting types
    fasting_resp = api_client.get(
        "/api/v1/customization/fasting-types", headers=headers
    )
    fasting_types = assert_success(fasting_resp)["data"]
    assert len(fasting_types) > 0, "Expected seeded fasting types"

    # Prayer locations
    prayer_locations_resp = api_client.get(
        "/api/v1/customization/prayer-locations", headers=headers
    )
    prayer_locations = assert_success(prayer_locations_resp)["data"]
    assert len(prayer_locations) > 0, "Expected seeded prayer locations"

    # ── Step 5: Create custom items ──────────────────────────────────────

    # Custom prayer location
    custom_loc_resp = api_client.post(
        "/api/v1/customization/prayer-locations",
        json={"name": "Smoke Test Musalla"},
        headers=headers,
    )
    custom_loc = assert_created(custom_loc_resp)["data"]
    assert custom_loc["name"] == "Smoke Test Musalla"

    # Custom skill
    skill_resp = api_client.post(
        "/api/v1/customization/skills",
        json={"name": "Arabic Language"},
        headers=headers,
    )
    skill = assert_created(skill_resp)["data"]
    skill_id = skill["id"]

    # Skill topic under the skill
    topic_resp = api_client.post(
        f"/api/v1/customization/skills/{skill_id}/topics",
        json={"name": "Nahw (Grammar)"},
        headers=headers,
    )
    topic = assert_created(topic_resp)["data"]
    assert topic["name"] == "Nahw (Grammar)"

    # Custom intention
    intention_resp = api_client.post(
        "/api/v1/customization/intentions",
        json={"name": "Improve daily prayers"},
        headers=headers,
    )
    intention = assert_created(intention_resp)["data"]
    intention_id = intention["id"]

    # ── Step 6: Log tracking entries ─────────────────────────────────────

    today = date.today().isoformat()

    # 6a. Daily prayer
    daily_prayer_resp = api_client.post(
        "/api/v1/tracking/prayers/daily",
        json=daily_prayer_payload(prayer_status_id, prayer_name="FAJR"),
        headers=headers,
    )
    daily_prayer = assert_created(daily_prayer_resp)["data"]
    daily_prayer_id = daily_prayer["id"]

    # 6b. Quran log
    quran_resp = api_client.post(
        "/api/v1/tracking/quran",
        json=quran_log_payload(quran_activity_type_id),
        headers=headers,
    )
    quran_log = assert_created(quran_resp)["data"]
    quran_log_id = quran_log["id"]

    # 6c. Dhikr log
    dhikr_resp = api_client.post(
        "/api/v1/tracking/dhikr",
        json=dhikr_log_payload(dhikr_type_id),
        headers=headers,
    )
    dhikr_log = assert_created(dhikr_resp)["data"]

    # 6d. Sleep log
    sleep_resp = api_client.post(
        "/api/v1/tracking/sleep",
        json=sleep_log_payload(),
        headers=headers,
    )
    sleep_log = assert_created(sleep_resp)["data"]

    # 6e. Task with intention
    task_resp = api_client.post(
        "/api/v1/tracking/tasks",
        json=task_payload(
            title="Review Fajr quality",
            intentionId=intention_id,
            taskPriorityId=task_priorities[0]["id"],
            taskStatusId=task_statuses[0]["id"],
        ),
        headers=headers,
    )
    task = assert_created(task_resp)["data"]
    task_id = task["id"]
    assert task["intentionId"] == intention_id

    # ── Step 7: List tracking entries (verify they appear) ────────────────

    # Daily prayers list
    list_prayers_resp = api_client.get(
        "/api/v1/tracking/prayers/daily", headers=headers
    )
    list_prayers_body = assert_success(list_prayers_resp)
    prayer_ids = [p["id"] for p in list_prayers_body["data"]["items"]]
    assert daily_prayer_id in prayer_ids

    # Quran logs list
    list_quran_resp = api_client.get(
        "/api/v1/tracking/quran", headers=headers
    )
    list_quran_body = assert_success(list_quran_resp)
    quran_ids = [q["id"] for q in list_quran_body["data"]["items"]]
    assert quran_log_id in quran_ids

    # Tasks list
    list_tasks_resp = api_client.get(
        "/api/v1/tracking/tasks", headers=headers
    )
    list_tasks_body = assert_success(list_tasks_resp)
    task_ids = [t["id"] for t in list_tasks_body["data"]["items"]]
    assert task_id in task_ids

    # ── Step 8: Update a tracking entry ──────────────────────────────────

    update_task_resp = api_client.put(
        f"/api/v1/tracking/tasks/{task_id}",
        json={"title": "Reviewed Fajr quality", "notes": "Feeling better today"},
        headers=headers,
    )
    updated_task = assert_success(update_task_resp)["data"]
    assert updated_task["title"] == "Reviewed Fajr quality"
    assert updated_task["notes"] == "Feeling better today"

    # ── Step 9: Delete a tracking entry (verify it is gone) ──────────────

    delete_quran_resp = api_client.delete(
        f"/api/v1/tracking/quran/{quran_log_id}", headers=headers
    )
    assert delete_quran_resp.status_code == 204

    # Verify deleted entry returns 404
    get_deleted_resp = api_client.get(
        f"/api/v1/tracking/quran/{quran_log_id}", headers=headers
    )
    assert get_deleted_resp.status_code == 404

    # Verify it no longer appears in the list
    list_quran_after_resp = api_client.get(
        "/api/v1/tracking/quran", headers=headers
    )
    list_quran_after_body = assert_success(list_quran_after_resp)
    quran_ids_after = [q["id"] for q in list_quran_after_body["data"]["items"]]
    assert quran_log_id not in quran_ids_after
