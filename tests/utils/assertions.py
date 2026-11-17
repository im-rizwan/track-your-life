"""Common assertion helpers for API response validation."""


def assert_success(resp, status_code=200):
    """Assert a successful response with expected status code."""
    assert resp.status_code == status_code, (
        f"Expected {status_code}, got {resp.status_code}: {resp.text}"
    )
    body = resp.json()
    assert body["success"] is True
    return body


def assert_created(resp):
    """Assert 201 Created response."""
    return assert_success(resp, 201)


def assert_error(resp, status_code, code=None):
    """Assert an error response with expected status code and optional error code."""
    assert resp.status_code == status_code, (
        f"Expected {status_code}, got {resp.status_code}: {resp.text}"
    )
    body = resp.json()
    assert body["success"] is False
    if code:
        assert body["error"]["code"] == code
    return body


def assert_paginated(resp):
    """Assert a successful paginated response structure."""
    body = assert_success(resp)
    data = body["data"]
    assert "items" in data, "Expected 'items' key in paginated response"
    assert isinstance(data["items"], list)
    return body


def assert_validation_error(resp):
    """Assert a 422 validation error response."""
    return assert_error(resp, 422)


def assert_unauthorized(resp):
    """Assert a 401 unauthorized error response."""
    return assert_error(resp, 401)


def assert_not_found(resp):
    """Assert a 404 not found error response."""
    return assert_error(resp, 404)


def assert_conflict(resp):
    """Assert a 409 conflict error response."""
    return assert_error(resp, 409)


def assert_forbidden(resp):
    """Assert a 403 forbidden error response."""
    return assert_error(resp, 403)
