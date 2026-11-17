"""Module-level fixtures for tracking tests.

Provides reference IDs and customization item IDs needed by tracking log factories.
All fixtures that create customization items are function-scoped (fresh per test).
Reference data fixtures are session-scoped (seeded once, read-only).
"""

import pytest
from datetime import datetime, timedelta


BASE_TRACKING = "/api/v1/tracking"
BASE_CUSTOMIZATION = "/api/v1/customization"
BASE_REFERENCE = "/api/v1/reference"


# ── Reference data (session-scoped, read from seed) ──────────────────────────


@pytest.fixture(scope="session")
def ref_prayer_statuses(api_client, app_process, test_env):
    """Fetch all prayer statuses from reference endpoint. Returns list of {id, name}."""
    from utils.auth_helpers import create_verified_user
    from utils.db import get_db_connection

    port = test_env.get("PORT", "3001")
    dsn = test_env["DATABASE_URL"]
    import psycopg2
    conn = psycopg2.connect(dsn)
    conn.autocommit = True
    user = create_verified_user(api_client, conn)
    conn.close()
    headers = {"Authorization": f"Bearer {user['tokens']['accessToken']}"}
    resp = api_client.get(f"{BASE_REFERENCE}/prayer-statuses", headers=headers)
    assert resp.status_code == 200, f"Failed to get prayer statuses: {resp.text}"
    return resp.json()["data"]


@pytest.fixture(scope="session")
def ref_quran_activity_types(api_client, app_process, test_env):
    """Fetch all Quran activity types."""
    from utils.auth_helpers import create_verified_user
    import psycopg2
    dsn = test_env["DATABASE_URL"]
    conn = psycopg2.connect(dsn)
    conn.autocommit = True
    user = create_verified_user(api_client, conn)
    conn.close()
    headers = {"Authorization": f"Bearer {user['tokens']['accessToken']}"}
    resp = api_client.get(f"{BASE_REFERENCE}/quran-activity-types", headers=headers)
    assert resp.status_code == 200
    return resp.json()["data"]


@pytest.fixture(scope="session")
def ref_task_priorities(api_client, app_process, test_env):
    """Fetch all task priorities."""
    from utils.auth_helpers import create_verified_user
    import psycopg2
    dsn = test_env["DATABASE_URL"]
    conn = psycopg2.connect(dsn)
    conn.autocommit = True
    user = create_verified_user(api_client, conn)
    conn.close()
    headers = {"Authorization": f"Bearer {user['tokens']['accessToken']}"}
    resp = api_client.get(f"{BASE_REFERENCE}/task-priorities", headers=headers)
    assert resp.status_code == 200
    return resp.json()["data"]


@pytest.fixture(scope="session")
def ref_task_statuses(api_client, app_process, test_env):
    """Fetch all task statuses."""
    from utils.auth_helpers import create_verified_user
    import psycopg2
    dsn = test_env["DATABASE_URL"]
    conn = psycopg2.connect(dsn)
    conn.autocommit = True
    user = create_verified_user(api_client, conn)
    conn.close()
    headers = {"Authorization": f"Bearer {user['tokens']['accessToken']}"}
    resp = api_client.get(f"{BASE_REFERENCE}/task-statuses", headers=headers)
    assert resp.status_code == 200
    return resp.json()["data"]


@pytest.fixture(scope="session")
def ref_fitness_intensities(api_client, app_process, test_env):
    """Fetch all fitness intensities."""
    from utils.auth_helpers import create_verified_user
    import psycopg2
    dsn = test_env["DATABASE_URL"]
    conn = psycopg2.connect(dsn)
    conn.autocommit = True
    user = create_verified_user(api_client, conn)
    conn.close()
    headers = {"Authorization": f"Bearer {user['tokens']['accessToken']}"}
    resp = api_client.get(f"{BASE_REFERENCE}/fitness-intensities", headers=headers)
    assert resp.status_code == 200
    return resp.json()["data"]


# ── Helpers to get first ID from reference data ──────────────────────────────


@pytest.fixture
def prayer_status_id(api_client, auth_headers):
    """Get the first prayer status ID (from reference data)."""
    resp = api_client.get(f"{BASE_REFERENCE}/prayer-statuses", headers=auth_headers)
    assert resp.status_code == 200
    items = resp.json()["data"]
    assert len(items) > 0, "No prayer statuses found in reference data"
    return items[0]["id"]


@pytest.fixture
def prayer_location_id(api_client, auth_headers):
    """Get a prayer location ID (from default customization items)."""
    resp = api_client.get(f"{BASE_CUSTOMIZATION}/prayer-locations", headers=auth_headers)
    assert resp.status_code == 200
    items = resp.json()["data"]
    assert len(items) > 0
    return items[0]["id"]


@pytest.fixture
def other_prayer_type_id(api_client, auth_headers):
    """Get the first other prayer type ID."""
    resp = api_client.get(f"{BASE_CUSTOMIZATION}/other-prayer-types", headers=auth_headers)
    assert resp.status_code == 200
    items = resp.json()["data"]
    assert len(items) > 0
    return items[0]["id"]


@pytest.fixture
def quran_activity_type_id(api_client, auth_headers):
    """Get the first Quran activity type ID."""
    resp = api_client.get(f"{BASE_REFERENCE}/quran-activity-types", headers=auth_headers)
    assert resp.status_code == 200
    items = resp.json()["data"]
    assert len(items) > 0
    return items[0]["id"]


@pytest.fixture
def dhikr_type_id(api_client, auth_headers):
    """Get the first dhikr type ID."""
    resp = api_client.get(f"{BASE_CUSTOMIZATION}/dhikr-types", headers=auth_headers)
    assert resp.status_code == 200
    items = resp.json()["data"]
    assert len(items) > 0
    return items[0]["id"]


@pytest.fixture
def fasting_type_id(api_client, auth_headers):
    """Get the first fasting type ID."""
    resp = api_client.get(f"{BASE_CUSTOMIZATION}/fasting-types", headers=auth_headers)
    assert resp.status_code == 200
    items = resp.json()["data"]
    assert len(items) > 0
    return items[0]["id"]


@pytest.fixture
def charity_type_id(api_client, auth_headers):
    """Get the first charity type ID."""
    resp = api_client.get(f"{BASE_CUSTOMIZATION}/charity-types", headers=auth_headers)
    assert resp.status_code == 200
    items = resp.json()["data"]
    assert len(items) > 0
    return items[0]["id"]


@pytest.fixture
def islamic_study_subject_id(api_client, auth_headers):
    """Get the first Islamic study subject ID."""
    resp = api_client.get(f"{BASE_CUSTOMIZATION}/islamic-study-subjects", headers=auth_headers)
    assert resp.status_code == 200
    items = resp.json()["data"]
    assert len(items) > 0
    return items[0]["id"]


@pytest.fixture
def study_mode_id(api_client, auth_headers):
    """Get the first study mode ID."""
    resp = api_client.get(f"{BASE_CUSTOMIZATION}/study-modes", headers=auth_headers)
    assert resp.status_code == 200
    items = resp.json()["data"]
    assert len(items) > 0
    return items[0]["id"]


@pytest.fixture
def fitness_activity_id(api_client, auth_headers):
    """Get the first fitness activity ID."""
    resp = api_client.get(f"{BASE_CUSTOMIZATION}/fitness-activities", headers=auth_headers)
    assert resp.status_code == 200
    items = resp.json()["data"]
    assert len(items) > 0
    return items[0]["id"]


@pytest.fixture
def fitness_intensity_id(api_client, auth_headers):
    """Get the first fitness intensity ID."""
    resp = api_client.get(f"{BASE_REFERENCE}/fitness-intensities", headers=auth_headers)
    assert resp.status_code == 200
    items = resp.json()["data"]
    assert len(items) > 0
    return items[0]["id"]


@pytest.fixture
def nutrition_food_id(api_client, auth_headers):
    """Get the first nutrition food ID."""
    resp = api_client.get(f"{BASE_CUSTOMIZATION}/nutrition-foods", headers=auth_headers)
    assert resp.status_code == 200
    items = resp.json()["data"]
    assert len(items) > 0
    return items[0]["id"]


@pytest.fixture
def fitrah_practice_ids(api_client, auth_headers):
    """Get the first two fitrah practice IDs (as a list)."""
    resp = api_client.get(f"{BASE_CUSTOMIZATION}/fitrah-practices", headers=auth_headers)
    assert resp.status_code == 200
    items = resp.json()["data"]
    assert len(items) >= 1
    return [item["id"] for item in items[:2]]


@pytest.fixture
def skill_id(api_client, auth_headers):
    """Create a custom skill and return its ID."""
    resp = api_client.post(
        f"{BASE_CUSTOMIZATION}/skills",
        json={"name": "Test Skill for Tracking"},
        headers=auth_headers,
    )
    assert resp.status_code == 201, f"Failed to create skill: {resp.text}"
    return resp.json()["data"]["id"]


@pytest.fixture
def skill_topic_id(api_client, auth_headers, skill_id):
    """Create a skill topic under the test skill and return its ID."""
    resp = api_client.post(
        f"{BASE_CUSTOMIZATION}/skills/{skill_id}/topics",
        json={"name": "Test Topic for Tracking"},
        headers=auth_headers,
    )
    assert resp.status_code == 201, f"Failed to create skill topic: {resp.text}"
    return resp.json()["data"]["id"]


@pytest.fixture
def intention_id(api_client, auth_headers):
    """Create a custom intention and return its ID."""
    resp = api_client.post(
        f"{BASE_CUSTOMIZATION}/intentions",
        json={"name": "Test Intention", "description": "For tracking tests"},
        headers=auth_headers,
    )
    assert resp.status_code == 201, f"Failed to create intention: {resp.text}"
    return resp.json()["data"]["id"]


@pytest.fixture
def task_priority_id(api_client, auth_headers):
    """Get the first task priority ID."""
    resp = api_client.get(f"{BASE_REFERENCE}/task-priorities", headers=auth_headers)
    assert resp.status_code == 200
    items = resp.json()["data"]
    assert len(items) > 0
    return items[0]["id"]


@pytest.fixture
def task_status_id(api_client, auth_headers):
    """Get the first task status ID."""
    resp = api_client.get(f"{BASE_REFERENCE}/task-statuses", headers=auth_headers)
    assert resp.status_code == 200
    items = resp.json()["data"]
    assert len(items) > 0
    return items[0]["id"]
