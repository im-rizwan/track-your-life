"""Root conftest.py — session-scoped fixtures for Docker, app process, DB, and API client."""

import os
import time
import subprocess
import signal
import pytest
import requests
import psycopg2

from utils.api_client import MuhasabahClient
from utils.auth_helpers import create_verified_user, get_auth_headers

# ── Paths ─────────────────────────────────────────────────────────────────

TESTS_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(TESTS_DIR)
ENV_TEST_FILE = os.path.join(TESTS_DIR, ".env.test")
DOCKER_COMPOSE_FILE = os.path.join(TESTS_DIR, "docker-compose.test.yml")


def _load_env_test() -> dict:
    """Load .env.test file into a dict."""
    env = {}
    with open(ENV_TEST_FILE) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, val = line.split("=", 1)
                env[key.strip()] = val.strip()
    return env


def _wait_for_health(url: str, timeout: int = 60):
    """Poll a health endpoint until it responds 200 or timeout."""
    deadline = time.time() + timeout
    while time.time() < deadline:
        try:
            resp = requests.get(url, timeout=3)
            if resp.status_code == 200:
                return
        except requests.ConnectionError:
            pass
        time.sleep(1)
    raise TimeoutError(f"App did not become healthy at {url} within {timeout}s")


# ── Session-scoped fixtures ───────────────────────────────────────────────


@pytest.fixture(scope="session")
def test_env():
    """Load .env.test variables."""
    return _load_env_test()


@pytest.fixture(scope="session")
def postgres_container():
    """Start PostgreSQL 16 container via docker-compose, tear down after session."""
    subprocess.run(
        ["docker", "compose", "-f", DOCKER_COMPOSE_FILE, "up", "-d", "--wait"],
        check=True, cwd=TESTS_DIR,
    )
    # Wait for healthy
    deadline = time.time() + 30
    dsn = "postgresql://test_user:test_password@localhost:5433/muhasabah_test"
    while time.time() < deadline:
        try:
            conn = psycopg2.connect(dsn)
            conn.close()
            break
        except psycopg2.OperationalError:
            time.sleep(1)
    else:
        raise TimeoutError("PostgreSQL container did not become ready")

    yield

    subprocess.run(
        ["docker", "compose", "-f", DOCKER_COMPOSE_FILE, "down", "-v"],
        check=True, cwd=TESTS_DIR,
    )


@pytest.fixture(scope="session")
def db_connection(postgres_container, test_env):
    """psycopg2 connection for direct DB access (OTP retrieval)."""
    dsn = test_env["DATABASE_URL"]
    conn = psycopg2.connect(dsn)
    conn.autocommit = True
    yield conn
    conn.close()


@pytest.fixture(scope="session")
def app_process(postgres_container, test_env):
    """Start the Node.js app subprocess, run migrations + seed, then yield."""
    env = {**os.environ, **test_env}

    # Run Prisma migrations
    subprocess.run(
        ["npx", "prisma", "migrate", "deploy"],
        env=env, cwd=PROJECT_ROOT, check=True,
        capture_output=True,
    )

    # Run seed
    subprocess.run(
        ["npx", "prisma", "db", "seed"],
        env=env, cwd=PROJECT_ROOT, check=True,
        capture_output=True,
    )

    # Start the app
    proc = subprocess.Popen(
        ["npx", "tsx", "src/server.ts"],
        env=env, cwd=PROJECT_ROOT,
        stdout=subprocess.PIPE, stderr=subprocess.PIPE,
    )

    port = test_env.get("PORT", "3001")
    try:
        _wait_for_health(f"http://localhost:{port}/health", timeout=60)
    except TimeoutError:
        proc.terminate()
        proc.wait(timeout=10)
        stdout = proc.stdout.read().decode() if proc.stdout else ""
        stderr = proc.stderr.read().decode() if proc.stderr else ""
        raise RuntimeError(
            f"App failed to start.\nstdout: {stdout}\nstderr: {stderr}"
        )

    yield proc

    proc.send_signal(signal.SIGTERM)
    try:
        proc.wait(timeout=10)
    except subprocess.TimeoutExpired:
        proc.kill()
        proc.wait()


@pytest.fixture(scope="session")
def api_client(app_process, test_env) -> MuhasabahClient:
    """HTTP client pointed at the running test app."""
    port = test_env.get("PORT", "3001")
    return MuhasabahClient(f"http://localhost:{port}")


# ── Reusable auth fixtures (function-scoped, fresh per test) ──────────────


@pytest.fixture
def registered_user(api_client, db_connection):
    """Register + verify a fresh user. Returns dict with email, password, user, tokens."""
    return create_verified_user(api_client, db_connection)


@pytest.fixture
def auth_headers(registered_user):
    """Authorization headers for the registered_user."""
    return get_auth_headers(registered_user["tokens"])


@pytest.fixture
def second_user(api_client, db_connection):
    """A second verified user for cross-user authorization tests."""
    return create_verified_user(api_client, db_connection)


@pytest.fixture
def second_auth_headers(second_user):
    """Authorization headers for the second user."""
    return get_auth_headers(second_user["tokens"])
