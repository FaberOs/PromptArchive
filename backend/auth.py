"""Short-lived backend sessions for Prompt Archive's private library."""

from __future__ import annotations

import secrets
import threading
import time
from typing import Optional

from fastapi import Header, HTTPException


SESSION_HEADER = "X-Prompt-Archive-Session"
SESSION_TTL_SECONDS = 12 * 60 * 60

_sessions: dict[str, float] = {}
_sessions_lock = threading.Lock()


def issue_private_session() -> str:
    token = secrets.token_urlsafe(32)
    with _sessions_lock:
        _sessions[token] = time.time() + SESSION_TTL_SECONDS
    return token


def revoke_all_private_sessions() -> None:
    with _sessions_lock:
        _sessions.clear()


def revoke_private_session(token: str) -> None:
    """Invalidate only the caller's private-library session."""

    with _sessions_lock:
        _sessions.pop(token, None)


def is_private_session_valid(token: Optional[str]) -> bool:
    if not token:
        return False

    now = time.time()
    with _sessions_lock:
        expires_at = _sessions.get(token)
        if expires_at is None:
            return False
        if expires_at <= now:
            _sessions.pop(token, None)
            return False
        return True


def optional_private_session(
    session_token: Optional[str] = Header(default=None, alias=SESSION_HEADER),
) -> Optional[str]:
    """Return a valid private session, or ``None`` for public requests."""

    return session_token if is_private_session_valid(session_token) else None


def require_private_access(
    session_token: Optional[str] = Header(default=None, alias=SESSION_HEADER),
) -> str:
    if not is_private_session_valid(session_token):
        raise HTTPException(
            status_code=401,
            detail="Private library authentication required",
        )
    return session_token  # type: ignore[return-value]
