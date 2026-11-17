"""Reusable HTTP client wrapper for Muhasabah API testing."""

import requests


class MuhasabahClient:
    """HTTP client with convenience methods for the Muhasabah API."""

    def __init__(self, base_url: str):
        self.base_url = base_url
        self.session = requests.Session()

    def _url(self, path: str) -> str:
        return f"{self.base_url}{path}"

    # ── Generic HTTP methods ──────────────────────────────────────────────

    def get(self, path, params=None, headers=None, **kwargs):
        return self.session.get(self._url(path), params=params, headers=headers, **kwargs)

    def post(self, path, json=None, headers=None, **kwargs):
        return self.session.post(self._url(path), json=json, headers=headers, **kwargs)

    def put(self, path, json=None, headers=None, **kwargs):
        return self.session.put(self._url(path), json=json, headers=headers, **kwargs)

    def patch(self, path, json=None, headers=None, **kwargs):
        return self.session.patch(self._url(path), json=json, headers=headers, **kwargs)

    def delete(self, path, headers=None, **kwargs):
        return self.session.delete(self._url(path), headers=headers, **kwargs)

    # ── Auth convenience methods ──────────────────────────────────────────

    def register(self, email, password="Test@12345"):
        return self.post("/api/v1/auth/register", json={"email": email, "password": password})

    def verify_email(self, email, otp):
        return self.post("/api/v1/auth/verify-email", json={"email": email, "otp": otp})

    def login(self, email, password="Test@12345"):
        return self.post("/api/v1/auth/login", json={"email": email, "password": password})

    def refresh(self, refresh_token):
        return self.post("/api/v1/auth/refresh", json={"refreshToken": refresh_token})

    def logout(self, refresh_token):
        return self.post("/api/v1/auth/logout", json={"refreshToken": refresh_token})

    def logout_all(self, headers):
        return self.post("/api/v1/auth/logout-all", headers=headers)

    def forgot_password(self, email):
        return self.post("/api/v1/auth/forgot-password", json={"email": email})

    def resend_verification(self, email):
        return self.post("/api/v1/auth/resend-verification", json={"email": email})

    def resend_reset_otp(self, email):
        return self.post("/api/v1/auth/resend-reset-otp", json={"email": email})

    def reset_password(self, email, otp, new_password):
        return self.post("/api/v1/auth/reset-password", json={
            "email": email, "otp": otp, "newPassword": new_password
        })

    def get_session(self, headers):
        return self.get("/api/v1/auth/session", headers=headers)

    def delete_account_initiate(self, headers, password, confirmation="DELETE"):
        return self.post("/api/v1/auth/delete-account/initiate", headers=headers, json={
            "password": password, "confirmation": confirmation
        })

    def delete_account_confirm(self, headers, otp):
        return self.post("/api/v1/auth/delete-account/confirm", headers=headers, json={"otp": otp})

    # ── Helper ────────────────────────────────────────────────────────────

    @staticmethod
    def auth_headers(access_token):
        return {"Authorization": f"Bearer {access_token}"}
