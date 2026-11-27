"""Parametrized tests for the 8 remaining simple customization entity types.

Each entity follows the same CRUD pattern with {name} payloads, system defaults,
user ownership, and standard error codes.
"""

import pytest
from concurrent.futures import ThreadPoolExecutor

from utils.assertions import (
    assert_success,
    assert_created,
    assert_unauthorized,
    assert_not_found,
    assert_validation_error,
)

pytestmark = pytest.mark.customization

NONEXISTENT_ID = "clxxxxxxxxxxxxxxxxxxxxxxxxx"

# (endpoint_slug, sample_name) for each simple entity type
SIMPLE_ENTITIES = [
    ("dhikr-types", "Test Dhikr"),
    ("fasting-types", "Test Fasting"),
    ("charity-types", "Test Charity"),
    ("islamic-study-subjects", "Test Subject"),
    ("study-modes", "Test Mode"),
    ("fitness-activities", "Test Activity"),
    ("nutrition-foods", "Test Food"),
    ("fitrah-practices", "Test Practice"),
]


def _url(slug):
    return f"/api/v1/customization/{slug}"


def _get_default_id(api_client, auth_headers, slug):
    """Fetch the first system-default item's ID for a given entity type."""
    resp = api_client.get(_url(slug), headers=auth_headers)
    assert resp.status_code == 200, f"GET {slug} failed: {resp.text}"
    defaults = [item for item in resp.json()["data"] if item.get("isDefault") is True]
    assert len(defaults) > 0, f"No system defaults found for {slug}"
    return defaults[0]["id"]


def _create_custom_item(api_client, auth_headers, slug, name):
    """Create a custom item and return its data dict."""
    resp = api_client.post(_url(slug), json={"name": name}, headers=auth_headers)
    assert resp.status_code == 201, f"POST {slug} failed: {resp.text}"
    return resp.json()["data"]


# ── GET ───────────────────────────────────────────────────────────────────────


class TestListSimpleEntities:
    """Tests for GET /api/v1/customization/<entity>."""

    @pytest.mark.parametrize("slug,sample_name", SIMPLE_ENTITIES)
    def test_list_returns_200_with_data(
        self, api_client, auth_headers, slug, sample_name
    ):
        """Authenticated GET returns 200 with a list of items."""
        resp = api_client.get(_url(slug), headers=auth_headers)

        body = assert_success(resp)
        assert isinstance(body["data"], list)

    @pytest.mark.parametrize("slug,sample_name", SIMPLE_ENTITIES)
    def test_list_includes_system_defaults(
        self, api_client, auth_headers, slug, sample_name
    ):
        """The list contains at least one system-default item."""
        resp = api_client.get(_url(slug), headers=auth_headers)

        body = assert_success(resp)
        defaults = [item for item in body["data"] if item["isDefault"] is True]
        assert len(defaults) > 0, f"No system defaults for {slug}"

    @pytest.mark.parametrize("slug,sample_name", SIMPLE_ENTITIES)
    def test_list_includes_custom_item_after_create(
        self, api_client, auth_headers, slug, sample_name
    ):
        """A newly created custom item appears in the list."""
        unique_name = f"{sample_name} List Check"
        created = _create_custom_item(api_client, auth_headers, slug, unique_name)

        resp = api_client.get(_url(slug), headers=auth_headers)
        body = assert_success(resp)
        ids = [item["id"] for item in body["data"]]
        assert created["id"] in ids

    @pytest.mark.parametrize("slug,sample_name", SIMPLE_ENTITIES)
    def test_list_requires_auth(self, api_client, slug, sample_name):
        """GET without auth returns 401."""
        resp = api_client.get(_url(slug))

        assert_unauthorized(resp)


# ── POST ──────────────────────────────────────────────────────────────────────


class TestCreateSimpleEntities:
    """Tests for POST /api/v1/customization/<entity>."""

    @pytest.mark.parametrize("slug,sample_name", SIMPLE_ENTITIES)
    def test_create_valid_returns_201(
        self, api_client, auth_headers, slug, sample_name
    ):
        """Creating with a valid name returns 201."""
        unique_name = f"{sample_name} Create"
        resp = api_client.post(
            _url(slug), json={"name": unique_name}, headers=auth_headers
        )

        body = assert_created(resp)
        assert body["data"]["name"] == unique_name
        assert body["data"]["isDefault"] is False

    @pytest.mark.parametrize("slug,sample_name", SIMPLE_ENTITIES)
    def test_create_duplicate_name_returns_409(
        self, api_client, auth_headers, slug, sample_name
    ):
        """Creating with a duplicate name for the same user returns 409.

        The API catches Prisma unique constraint violations for
        customization entities and returns a ConflictError (409).
        """
        unique_name = f"{sample_name} Dup"
        api_client.post(_url(slug), json={"name": unique_name}, headers=auth_headers)

        resp = api_client.post(
            _url(slug), json={"name": unique_name}, headers=auth_headers
        )
        assert resp.status_code == 409, (
            f"Expected 409 for duplicate name, got {resp.status_code}: {resp.text}"
        )

    @pytest.mark.parametrize("slug,sample_name", SIMPLE_ENTITIES)
    def test_create_missing_name_returns_422(
        self, api_client, auth_headers, slug, sample_name
    ):
        """Omitting the name field returns 422."""
        resp = api_client.post(_url(slug), json={}, headers=auth_headers)

        assert_validation_error(resp)

    @pytest.mark.parametrize("slug,sample_name", SIMPLE_ENTITIES)
    def test_create_name_too_short_returns_422(
        self, api_client, auth_headers, slug, sample_name
    ):
        """A name shorter than 2 characters returns 422."""
        resp = api_client.post(_url(slug), json={"name": "X"}, headers=auth_headers)

        assert_validation_error(resp)

    @pytest.mark.parametrize("slug,sample_name", SIMPLE_ENTITIES)
    def test_create_name_too_long_returns_422(
        self, api_client, auth_headers, slug, sample_name
    ):
        """A name longer than 100 characters returns 422."""
        resp = api_client.post(
            _url(slug), json={"name": "A" * 101}, headers=auth_headers
        )

        assert_validation_error(resp)

    @pytest.mark.parametrize("slug,sample_name", SIMPLE_ENTITIES)
    def test_create_requires_auth(self, api_client, slug, sample_name):
        """Creating without auth returns 401."""
        resp = api_client.post(_url(slug), json={"name": "No Auth"})

        assert_unauthorized(resp)

    @pytest.mark.parametrize("slug,sample_name", SIMPLE_ENTITIES)
    def test_create_malformed_json_returns_400(
        self, api_client, auth_headers, slug, sample_name
    ):
        """A request body that isn't valid JSON returns 400, not 500."""
        resp = api_client.session.post(
            f"{api_client.base_url}{_url(slug)}",
            data='{"name":"bad',
            headers={**auth_headers, "Content-Type": "application/json"},
        )
        assert resp.status_code == 400
        assert resp.json()["error"]["code"] == "INVALID_JSON"

    @pytest.mark.parametrize("slug,sample_name", SIMPLE_ENTITIES)
    def test_concurrent_duplicate_create_never_500(
        self, api_client, auth_headers, slug, sample_name
    ):
        """10 parallel creates with the same name for the same user must
        yield exactly one 201 and the rest 409 — never a 500. The service
        attempts the Prisma create directly and catches P2002 rather than
        check-then-insert, so this should already be race-safe; this proves
        it rather than assuming it."""
        unique_name = f"{sample_name} Race {slug}"

        def attempt():
            return api_client.post(_url(slug), json={"name": unique_name}, headers=auth_headers)

        with ThreadPoolExecutor(max_workers=10) as pool:
            responses = list(pool.map(lambda _: attempt(), range(10)))

        status_codes = [r.status_code for r in responses]
        assert status_codes.count(201) == 1, f"Expected exactly one 201, got: {status_codes}"
        assert status_codes.count(409) == 9, f"Expected nine 409s, got: {status_codes}"
        assert 500 not in status_codes, f"Got a 500 in concurrent create: {status_codes}"


# ── PUT ───────────────────────────────────────────────────────────────────────


class TestUpdateSimpleEntities:
    """Tests for PUT /api/v1/customization/<entity>/:id."""

    @pytest.mark.parametrize("slug,sample_name", SIMPLE_ENTITIES)
    def test_update_valid_returns_200(
        self, api_client, auth_headers, slug, sample_name
    ):
        """Updating a user-owned item with a valid name returns 200."""
        created = _create_custom_item(
            api_client, auth_headers, slug, f"{sample_name} Update"
        )

        resp = api_client.put(
            f"{_url(slug)}/{created['id']}",
            json={"name": f"{sample_name} Updated"},
            headers=auth_headers,
        )

        body = assert_success(resp)
        assert body["data"]["name"] == f"{sample_name} Updated"

    @pytest.mark.parametrize("slug,sample_name", SIMPLE_ENTITIES)
    def test_update_system_default_returns_404(
        self, api_client, auth_headers, slug, sample_name
    ):
        """Updating a system-default item returns 404.

        System defaults have no userId, so the ownership-scoped query returns
        'not found' rather than 'forbidden'.
        """
        default_id = _get_default_id(api_client, auth_headers, slug)

        resp = api_client.put(
            f"{_url(slug)}/{default_id}",
            json={"name": "Hacked Default"},
            headers=auth_headers,
        )

        assert_not_found(resp)

    @pytest.mark.parametrize("slug,sample_name", SIMPLE_ENTITIES)
    def test_update_not_found_returns_404(
        self, api_client, auth_headers, slug, sample_name
    ):
        """Updating a non-existent item returns 404."""
        resp = api_client.put(
            f"{_url(slug)}/{NONEXISTENT_ID}",
            json={"name": "Ghost"},
            headers=auth_headers,
        )

        assert_not_found(resp)

    @pytest.mark.parametrize("slug,sample_name", SIMPLE_ENTITIES)
    def test_update_other_users_item_returns_404(
        self, api_client, auth_headers, second_auth_headers, slug, sample_name
    ):
        """Updating another user's item returns 404."""
        created = _create_custom_item(
            api_client, second_auth_headers, slug, f"{sample_name} Other User"
        )

        resp = api_client.put(
            f"{_url(slug)}/{created['id']}",
            json={"name": "Stolen"},
            headers=auth_headers,
        )

        assert_not_found(resp)

    @pytest.mark.parametrize("slug,sample_name", SIMPLE_ENTITIES)
    def test_update_requires_auth(self, api_client, slug, sample_name):
        """Updating without auth returns 401."""
        resp = api_client.put(
            f"{_url(slug)}/{NONEXISTENT_ID}", json={"name": "No Auth"}
        )

        assert_unauthorized(resp)


# ── DELETE ────────────────────────────────────────────────────────────────────


class TestDeleteSimpleEntities:
    """Tests for DELETE /api/v1/customization/<entity>/:id."""

    @pytest.mark.parametrize("slug,sample_name", SIMPLE_ENTITIES)
    def test_delete_valid_returns_204(
        self, api_client, auth_headers, slug, sample_name
    ):
        """Deleting a user-owned item returns 204."""
        created = _create_custom_item(
            api_client, auth_headers, slug, f"{sample_name} Delete"
        )

        resp = api_client.delete(
            f"{_url(slug)}/{created['id']}", headers=auth_headers
        )
        assert resp.status_code == 204

    @pytest.mark.parametrize("slug,sample_name", SIMPLE_ENTITIES)
    def test_delete_system_default_returns_404(
        self, api_client, auth_headers, slug, sample_name
    ):
        """Deleting a system-default item returns 404.

        System defaults have no userId, so the ownership-scoped query returns
        'not found' rather than 'forbidden'.
        """
        default_id = _get_default_id(api_client, auth_headers, slug)

        resp = api_client.delete(
            f"{_url(slug)}/{default_id}", headers=auth_headers
        )

        assert_not_found(resp)

    @pytest.mark.parametrize("slug,sample_name", SIMPLE_ENTITIES)
    def test_delete_not_found_returns_404(
        self, api_client, auth_headers, slug, sample_name
    ):
        """Deleting a non-existent item returns 404."""
        resp = api_client.delete(
            f"{_url(slug)}/{NONEXISTENT_ID}", headers=auth_headers
        )

        assert_not_found(resp)

    @pytest.mark.parametrize("slug,sample_name", SIMPLE_ENTITIES)
    def test_delete_other_users_item_returns_404(
        self, api_client, auth_headers, second_auth_headers, slug, sample_name
    ):
        """Deleting another user's item returns 404."""
        created = _create_custom_item(
            api_client, second_auth_headers, slug, f"{sample_name} Other Del"
        )

        resp = api_client.delete(
            f"{_url(slug)}/{created['id']}", headers=auth_headers
        )

        assert_not_found(resp)

    @pytest.mark.parametrize("slug,sample_name", SIMPLE_ENTITIES)
    def test_delete_requires_auth(self, api_client, slug, sample_name):
        """Deleting without auth returns 401."""
        resp = api_client.delete(f"{_url(slug)}/{NONEXISTENT_ID}")

        assert_unauthorized(resp)

    @pytest.mark.parametrize("slug,sample_name", SIMPLE_ENTITIES)
    def test_deleted_item_not_in_list(
        self, api_client, auth_headers, slug, sample_name
    ):
        """After deletion, the item no longer appears in the list."""
        created = _create_custom_item(
            api_client, auth_headers, slug, f"{sample_name} Vanish"
        )
        api_client.delete(f"{_url(slug)}/{created['id']}", headers=auth_headers)

        resp = api_client.get(_url(slug), headers=auth_headers)
        body = assert_success(resp)
        ids = [item["id"] for item in body["data"]]
        assert created["id"] not in ids
