"""Direct database access helpers for test support (OTP retrieval only)."""

import psycopg2


def get_db_connection(dsn: str):
    """Create a psycopg2 connection from a DATABASE_URL."""
    return psycopg2.connect(dsn)


def get_latest_otp(db_conn, user_email: str, purpose: str) -> str | None:
    """Read the latest unused OTP from the OtpToken table for a given user+purpose."""
    cursor = db_conn.cursor()
    cursor.execute("""
        SELECT ot.token FROM "OtpToken" ot
        JOIN "User" u ON ot."userId" = u.id
        WHERE u.email = %s AND ot.purpose = %s AND ot."isUsed" = false
          AND ot."expiresAt" > NOW()
        ORDER BY ot."createdAt" DESC LIMIT 1
    """, (user_email, purpose))
    row = cursor.fetchone()
    cursor.close()
    return row[0] if row else None


def get_user_id(db_conn, email: str) -> str | None:
    """Get user ID by email."""
    cursor = db_conn.cursor()
    cursor.execute('SELECT id FROM "User" WHERE email = %s', (email,))
    row = cursor.fetchone()
    cursor.close()
    return row[0] if row else None


def get_user_field(db_conn, email: str, field: str):
    """Get a single field from User by email."""
    cursor = db_conn.cursor()
    cursor.execute(f'SELECT "{field}" FROM "User" WHERE email = %s', (email,))
    row = cursor.fetchone()
    cursor.close()
    return row[0] if row else None


def user_exists(db_conn, email: str) -> bool:
    """Check if a user exists."""
    cursor = db_conn.cursor()
    cursor.execute('SELECT COUNT(*) FROM "User" WHERE email = %s', (email,))
    count = cursor.fetchone()[0]
    cursor.close()
    return count > 0
