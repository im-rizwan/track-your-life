"""Auth helper functions for tests — register + verify + login flow."""

from uuid import uuid4
from .db import get_latest_otp


def unique_email():
    """Generate a unique test email."""
    return f"test_{uuid4().hex[:8]}@test.com"


def create_verified_user(client, db_conn, email=None, password="Test@12345"):
    """Full registration + email verification flow.

    Returns dict with: email, password, user, tokens (accessToken, refreshToken)
    """
    email = email or unique_email()

    # 1. Register
    resp = client.register(email, password)
    assert resp.status_code == 201, f"Register failed: {resp.text}"

    # 2. Commit so OTP is visible
    db_conn.commit()

    # 3. Get OTP from DB
    otp = get_latest_otp(db_conn, email, "EMAIL_VERIFICATION")
    assert otp is not None, f"No OTP found for {email}"

    # 4. Verify email
    resp = client.verify_email(email, otp)
    assert resp.status_code == 200, f"Verify failed: {resp.text}"

    data = resp.json()["data"]
    return {
        "email": email,
        "password": password,
        "user": data["user"],
        "tokens": data["tokens"],
    }


def get_auth_headers(tokens):
    """Build Authorization header from tokens dict."""
    return {"Authorization": f"Bearer {tokens['accessToken']}"}


def login_user(client, email, password="Test@12345"):
    """Login and return tokens + user."""
    resp = client.login(email, password)
    assert resp.status_code == 200, f"Login failed: {resp.text}"
    data = resp.json()["data"]
    return {
        "user": data["user"],
        "tokens": data["tokens"],
    }
