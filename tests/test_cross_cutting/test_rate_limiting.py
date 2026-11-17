"""Tests for rate limiting configuration."""

import pytest
from uuid import uuid4

pytestmark = [pytest.mark.cross_cutting, pytest.mark.serial]


class TestRateLimiting:
    """Verify rate limiting behavior on API endpoints.

    NOTE: These tests are marked @serial because they can consume rate limit
    quota and affect other tests if run concurrently. The auth rate limit test
    uses a unique email to avoid side-effects on shared fixtures.
    """

    def test_general_rate_limit_allows_normal_traffic(self, api_client):
        """Normal traffic volume is allowed under the general rate limit.

        The test environment allows 1000 requests per 15-minute window.
        Sending a small batch should all succeed.
        """
        for _ in range(5):
            resp = api_client.get("/api/v1/health")
            assert resp.status_code == 200

    def test_health_endpoint_not_rate_limited(self, api_client):
        """The root /health endpoint is explicitly excluded from rate limiting.

        It should remain accessible even under heavy request volume.
        """
        # Send a burst of requests to the root health endpoint
        for _ in range(20):
            resp = api_client.get("/health")
            assert resp.status_code == 200

    @pytest.mark.skip(
        reason="Auth rate limit is set to 10000 requests in test mode to avoid "
        "interfering with other tests. This test cannot trigger 429 within a "
        "reasonable number of requests."
    )
    def test_auth_rate_limit_blocks_after_5_requests(self, api_client):
        """Auth endpoints enforce a stricter rate limit of 5 requests per 15 minutes.

        After 5 requests to /api/v1/auth/login, the 6th should receive 429.

        Uses a dedicated requests.Session so the rate limit counter is isolated
        by the X-Forwarded-For header to avoid polluting other tests.
        """
        import requests as req

        session = req.Session()
        # Use a unique fake IP so this test's rate limit counter is isolated
        unique_ip = f"10.99.{uuid4().int % 256}.{uuid4().int % 256}"
        headers = {"X-Forwarded-For": unique_ip}

        url = f"{api_client.base_url}/api/v1/auth/login"
        payload = {
            "email": f"ratelimit_{uuid4().hex[:8]}@test.com",
            "password": "WrongPassword1!",
        }

        # Exhaust the 5-request quota
        for i in range(5):
            resp = session.post(url, json=payload, headers=headers)
            # These will be 401 (bad credentials) but NOT 429 yet
            assert resp.status_code != 429, f"Rate limited too early on request {i + 1}"

        # The 6th request should be rate-limited
        resp = session.post(url, json=payload, headers=headers)
        assert resp.status_code == 429, (
            f"Expected 429 on 6th request, got {resp.status_code}: {resp.text}"
        )
