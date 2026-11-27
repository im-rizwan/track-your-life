"""Tests for reference data endpoints.

All reference endpoints require authentication and return {success: true, data: [...]}.
Data is seeded at startup and read-only.
"""

import pytest

from utils.assertions import assert_success, assert_unauthorized

pytestmark = pytest.mark.reference

# ── Base path ────────────────────────────────────────────────────────────

BASE = "/api/v1/reference"


# ============================================================================
# Prayer Statuses
# ============================================================================


class TestPrayerStatuses:
    """Tests for GET /api/v1/reference/prayer-statuses."""

    ENDPOINT = f"{BASE}/prayer-statuses"

    EXPECTED_NAMES = ["PRAYED_ON_TIME", "PRAYED_LATE", "QADA", "MISSED"]

    def test_returns_200_with_array(self, api_client, auth_headers):
        """Endpoint returns 200 and data is a list."""
        resp = api_client.get(self.ENDPOINT, headers=auth_headers)
        body = assert_success(resp)
        assert isinstance(body["data"], list)

    def test_returns_correct_count(self, api_client, auth_headers):
        """There are exactly 4 prayer statuses."""
        resp = api_client.get(self.ENDPOINT, headers=auth_headers)
        body = assert_success(resp)
        assert len(body["data"]) == 4

    def test_items_have_correct_structure(self, api_client, auth_headers):
        """Each item has id, name, label, sortOrder, and isActive."""
        resp = api_client.get(self.ENDPOINT, headers=auth_headers)
        body = assert_success(resp)

        for item in body["data"]:
            assert "id" in item
            assert "name" in item
            assert "label" in item
            assert "sortOrder" in item
            assert "isActive" in item

    def test_contains_expected_names(self, api_client, auth_headers):
        """All expected prayer status names are present."""
        resp = api_client.get(self.ENDPOINT, headers=auth_headers)
        body = assert_success(resp)

        names = [item["name"] for item in body["data"]]
        for expected in self.EXPECTED_NAMES:
            assert expected in names, f"Missing prayer status: {expected}"

    def test_requires_auth(self, api_client):
        """Returns 401 without an auth token."""
        resp = api_client.get(self.ENDPOINT)
        assert_unauthorized(resp)

    def test_response_order_matches_sort_order(self, api_client, auth_headers):
        """Items are returned in ascending sortOrder, not just carrying the field."""
        resp = api_client.get(self.ENDPOINT, headers=auth_headers)
        body = assert_success(resp)

        sort_orders = [item["sortOrder"] for item in body["data"]]
        assert sort_orders == sorted(sort_orders)


# ============================================================================
# Quran Activity Types
# ============================================================================


class TestQuranActivityTypes:
    """Tests for GET /api/v1/reference/quran-activity-types."""

    ENDPOINT = f"{BASE}/quran-activity-types"

    EXPECTED_NAMES = [
        "RECITATION", "MEMORIZATION", "REVISION",
        "TAFSIR", "TRANSLATION", "LISTENING",
    ]

    def test_returns_200_with_array(self, api_client, auth_headers):
        """Endpoint returns 200 and data is a list."""
        resp = api_client.get(self.ENDPOINT, headers=auth_headers)
        body = assert_success(resp)
        assert isinstance(body["data"], list)

    def test_returns_correct_count(self, api_client, auth_headers):
        """There are exactly 6 quran activity types."""
        resp = api_client.get(self.ENDPOINT, headers=auth_headers)
        body = assert_success(resp)
        assert len(body["data"]) == 6

    def test_items_have_correct_structure(self, api_client, auth_headers):
        """Each item has id, name, label, sortOrder, and isActive."""
        resp = api_client.get(self.ENDPOINT, headers=auth_headers)
        body = assert_success(resp)

        for item in body["data"]:
            assert "id" in item
            assert "name" in item
            assert "label" in item
            assert "sortOrder" in item
            assert "isActive" in item

    def test_contains_expected_names(self, api_client, auth_headers):
        """All expected quran activity type names are present."""
        resp = api_client.get(self.ENDPOINT, headers=auth_headers)
        body = assert_success(resp)

        names = [item["name"] for item in body["data"]]
        for expected in self.EXPECTED_NAMES:
            assert expected in names, f"Missing quran activity type: {expected}"

    def test_requires_auth(self, api_client):
        """Returns 401 without an auth token."""
        resp = api_client.get(self.ENDPOINT)
        assert_unauthorized(resp)

    def test_response_order_matches_sort_order(self, api_client, auth_headers):
        """Items are returned in ascending sortOrder, not just carrying the field."""
        resp = api_client.get(self.ENDPOINT, headers=auth_headers)
        body = assert_success(resp)

        sort_orders = [item["sortOrder"] for item in body["data"]]
        assert sort_orders == sorted(sort_orders)


# ============================================================================
# Task Priorities
# ============================================================================


class TestTaskPriorities:
    """Tests for GET /api/v1/reference/task-priorities."""

    ENDPOINT = f"{BASE}/task-priorities"

    EXPECTED_NAMES = ["HIGH", "MEDIUM", "LOW"]

    def test_returns_200_with_array(self, api_client, auth_headers):
        """Endpoint returns 200 and data is a list."""
        resp = api_client.get(self.ENDPOINT, headers=auth_headers)
        body = assert_success(resp)
        assert isinstance(body["data"], list)

    def test_returns_correct_count(self, api_client, auth_headers):
        """There are exactly 3 task priorities."""
        resp = api_client.get(self.ENDPOINT, headers=auth_headers)
        body = assert_success(resp)
        assert len(body["data"]) == 3

    def test_items_have_correct_structure(self, api_client, auth_headers):
        """Each item has id, name, label, sortOrder, and isActive."""
        resp = api_client.get(self.ENDPOINT, headers=auth_headers)
        body = assert_success(resp)

        for item in body["data"]:
            assert "id" in item
            assert "name" in item
            assert "label" in item
            assert "sortOrder" in item
            assert "isActive" in item

    def test_contains_expected_names(self, api_client, auth_headers):
        """All expected task priority names are present."""
        resp = api_client.get(self.ENDPOINT, headers=auth_headers)
        body = assert_success(resp)

        names = [item["name"] for item in body["data"]]
        for expected in self.EXPECTED_NAMES:
            assert expected in names, f"Missing task priority: {expected}"

    def test_requires_auth(self, api_client):
        """Returns 401 without an auth token."""
        resp = api_client.get(self.ENDPOINT)
        assert_unauthorized(resp)

    def test_response_order_matches_sort_order(self, api_client, auth_headers):
        """Items are returned in ascending sortOrder, not just carrying the field."""
        resp = api_client.get(self.ENDPOINT, headers=auth_headers)
        body = assert_success(resp)

        sort_orders = [item["sortOrder"] for item in body["data"]]
        assert sort_orders == sorted(sort_orders)


# ============================================================================
# Task Statuses
# ============================================================================


class TestTaskStatuses:
    """Tests for GET /api/v1/reference/task-statuses."""

    ENDPOINT = f"{BASE}/task-statuses"

    EXPECTED_NAMES = ["NOT_STARTED", "IN_PROGRESS", "COMPLETED"]

    def test_returns_200_with_array(self, api_client, auth_headers):
        """Endpoint returns 200 and data is a list."""
        resp = api_client.get(self.ENDPOINT, headers=auth_headers)
        body = assert_success(resp)
        assert isinstance(body["data"], list)

    def test_returns_correct_count(self, api_client, auth_headers):
        """There are exactly 3 task statuses."""
        resp = api_client.get(self.ENDPOINT, headers=auth_headers)
        body = assert_success(resp)
        assert len(body["data"]) == 3

    def test_items_have_correct_structure(self, api_client, auth_headers):
        """Each item has id, name, label, sortOrder, and isActive."""
        resp = api_client.get(self.ENDPOINT, headers=auth_headers)
        body = assert_success(resp)

        for item in body["data"]:
            assert "id" in item
            assert "name" in item
            assert "label" in item
            assert "sortOrder" in item
            assert "isActive" in item

    def test_contains_expected_names(self, api_client, auth_headers):
        """All expected task status names are present."""
        resp = api_client.get(self.ENDPOINT, headers=auth_headers)
        body = assert_success(resp)

        names = [item["name"] for item in body["data"]]
        for expected in self.EXPECTED_NAMES:
            assert expected in names, f"Missing task status: {expected}"

    def test_requires_auth(self, api_client):
        """Returns 401 without an auth token."""
        resp = api_client.get(self.ENDPOINT)
        assert_unauthorized(resp)

    def test_response_order_matches_sort_order(self, api_client, auth_headers):
        """Items are returned in ascending sortOrder, not just carrying the field."""
        resp = api_client.get(self.ENDPOINT, headers=auth_headers)
        body = assert_success(resp)

        sort_orders = [item["sortOrder"] for item in body["data"]]
        assert sort_orders == sorted(sort_orders)


# ============================================================================
# Fitness Intensities
# ============================================================================


class TestFitnessIntensities:
    """Tests for GET /api/v1/reference/fitness-intensities."""

    ENDPOINT = f"{BASE}/fitness-intensities"

    EXPECTED_NAMES = ["LOW", "MEDIUM", "HIGH"]

    def test_returns_200_with_array(self, api_client, auth_headers):
        """Endpoint returns 200 and data is a list."""
        resp = api_client.get(self.ENDPOINT, headers=auth_headers)
        body = assert_success(resp)
        assert isinstance(body["data"], list)

    def test_returns_correct_count(self, api_client, auth_headers):
        """There are exactly 3 fitness intensities."""
        resp = api_client.get(self.ENDPOINT, headers=auth_headers)
        body = assert_success(resp)
        assert len(body["data"]) == 3

    def test_items_have_correct_structure(self, api_client, auth_headers):
        """Each item has id, name, label, sortOrder, and isActive."""
        resp = api_client.get(self.ENDPOINT, headers=auth_headers)
        body = assert_success(resp)

        for item in body["data"]:
            assert "id" in item
            assert "name" in item
            assert "label" in item
            assert "sortOrder" in item
            assert "isActive" in item

    def test_contains_expected_names(self, api_client, auth_headers):
        """All expected fitness intensity names are present."""
        resp = api_client.get(self.ENDPOINT, headers=auth_headers)
        body = assert_success(resp)

        names = [item["name"] for item in body["data"]]
        for expected in self.EXPECTED_NAMES:
            assert expected in names, f"Missing fitness intensity: {expected}"

    def test_requires_auth(self, api_client):
        """Returns 401 without an auth token."""
        resp = api_client.get(self.ENDPOINT)
        assert_unauthorized(resp)

    def test_response_order_matches_sort_order(self, api_client, auth_headers):
        """Items are returned in ascending sortOrder, not just carrying the field."""
        resp = api_client.get(self.ENDPOINT, headers=auth_headers)
        body = assert_success(resp)

        sort_orders = [item["sortOrder"] for item in body["data"]]
        assert sort_orders == sorted(sort_orders)


# ============================================================================
# Surahs
# ============================================================================


class TestSurahs:
    """Tests for GET /api/v1/reference/surahs."""

    ENDPOINT = f"{BASE}/surahs"

    def test_returns_200_with_array(self, api_client, auth_headers):
        """Endpoint returns 200 and data is a list."""
        resp = api_client.get(self.ENDPOINT, headers=auth_headers)
        body = assert_success(resp)
        assert isinstance(body["data"], list)

    def test_returns_114_surahs(self, api_client, auth_headers):
        """There are exactly 114 surahs in the Quran."""
        resp = api_client.get(self.ENDPOINT, headers=auth_headers)
        body = assert_success(resp)
        assert len(body["data"]) == 114

    def test_items_have_correct_structure(self, api_client, auth_headers):
        """Each surah has number, name, and arabicName."""
        resp = api_client.get(self.ENDPOINT, headers=auth_headers)
        body = assert_success(resp)

        for item in body["data"]:
            assert "number" in item
            assert "name" in item
            assert "arabicName" in item

    def test_first_surah_is_al_fatihah(self, api_client, auth_headers):
        """The first surah (number 1) is Al-Fatihah."""
        resp = api_client.get(self.ENDPOINT, headers=auth_headers)
        body = assert_success(resp)

        first = body["data"][0]
        assert first["number"] == 1
        assert "Fati" in first["name"], f"Expected Al-Fatihah variant, got {first['name']}"

    def test_last_surah_is_an_nas(self, api_client, auth_headers):
        """The last surah (number 114) is An-Nas."""
        resp = api_client.get(self.ENDPOINT, headers=auth_headers)
        body = assert_success(resp)

        last = body["data"][-1]
        assert last["number"] == 114
        assert "Nas" in last["name"], f"Expected An-Nas variant, got {last['name']}"

    def test_surah_numbers_are_sequential(self, api_client, auth_headers):
        """Surah numbers run from 1 to 114 without gaps."""
        resp = api_client.get(self.ENDPOINT, headers=auth_headers)
        body = assert_success(resp)

        numbers = [item["number"] for item in body["data"]]
        assert numbers == list(range(1, 115))

    def test_requires_auth(self, api_client):
        """Returns 401 without an auth token."""
        resp = api_client.get(self.ENDPOINT)
        assert_unauthorized(resp)


# ============================================================================
# Juzz
# ============================================================================


class TestJuzz:
    """Tests for GET /api/v1/reference/juzz."""

    ENDPOINT = f"{BASE}/juzz"

    def test_returns_200_with_array(self, api_client, auth_headers):
        """Endpoint returns 200 and data is a list."""
        resp = api_client.get(self.ENDPOINT, headers=auth_headers)
        body = assert_success(resp)
        assert isinstance(body["data"], list)

    def test_returns_30_juzz(self, api_client, auth_headers):
        """There are exactly 30 juzz in the Quran."""
        resp = api_client.get(self.ENDPOINT, headers=auth_headers)
        body = assert_success(resp)
        assert len(body["data"]) == 30

    def test_items_have_number_field(self, api_client, auth_headers):
        """Each juzz has a number field."""
        resp = api_client.get(self.ENDPOINT, headers=auth_headers)
        body = assert_success(resp)

        for item in body["data"]:
            assert "number" in item

    def test_juzz_numbers_range_1_to_30(self, api_client, auth_headers):
        """Juzz numbers run from 1 to 30."""
        resp = api_client.get(self.ENDPOINT, headers=auth_headers)
        body = assert_success(resp)

        numbers = [item["number"] for item in body["data"]]
        assert numbers == list(range(1, 31))

    def test_requires_auth(self, api_client):
        """Returns 401 without an auth token."""
        resp = api_client.get(self.ENDPOINT)
        assert_unauthorized(resp)


# ============================================================================
# Countries
# ============================================================================


class TestCountries:
    """Tests for GET /api/v1/reference/countries."""

    ENDPOINT = f"{BASE}/countries"

    def test_returns_200_with_array(self, api_client, auth_headers):
        """Endpoint returns 200 and data is a list."""
        resp = api_client.get(self.ENDPOINT, headers=auth_headers)
        body = assert_success(resp)
        assert isinstance(body["data"], list)

    def test_returns_non_empty_list(self, api_client, auth_headers):
        """Countries list is not empty."""
        resp = api_client.get(self.ENDPOINT, headers=auth_headers)
        body = assert_success(resp)
        assert len(body["data"]) > 0

    def test_items_have_correct_structure(self, api_client, auth_headers):
        """Each country has name and code."""
        resp = api_client.get(self.ENDPOINT, headers=auth_headers)
        body = assert_success(resp)

        for item in body["data"]:
            assert "name" in item
            assert "code" in item
            assert isinstance(item["name"], str)
            assert isinstance(item["code"], str)

    def test_countries_are_sorted_alphabetically(self, api_client, auth_headers):
        """Countries are returned sorted by name in alphabetical order."""
        resp = api_client.get(self.ENDPOINT, headers=auth_headers)
        body = assert_success(resp)

        names = [item["name"] for item in body["data"]]
        assert names == sorted(names), "Countries are not sorted alphabetically"

    def test_contains_well_known_countries(self, api_client, auth_headers):
        """Common countries like United States and Saudi Arabia are present."""
        resp = api_client.get(self.ENDPOINT, headers=auth_headers)
        body = assert_success(resp)

        names = [item["name"] for item in body["data"]]
        assert "United States" in names
        assert "Saudi Arabia" in names

    def test_requires_auth(self, api_client):
        """Returns 401 without an auth token."""
        resp = api_client.get(self.ENDPOINT)
        assert_unauthorized(resp)
