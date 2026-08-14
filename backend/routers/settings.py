from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import hashlib
import hmac
from typing import Optional

from .. import crud, schemas
from ..auth import (
    issue_private_session,
    optional_private_session,
    require_private_access,
    revoke_all_private_sessions,
    revoke_private_session,
)
from ..deps import get_db

router = APIRouter(prefix="/settings", tags=["Settings"])


@router.get("/pin-status")
def check_pin_status(db: Session = Depends(get_db)):
    config = crud.get_config(db, "nsfw_pin")
    return {"is_set": config is not None}


@router.post("/pin-set")
def set_pin(
    req: schemas.PinRequest,
    db: Session = Depends(get_db),
    session: Optional[str] = Depends(optional_private_session),
):
    if len(req.pin) != 4 or not req.pin.isdigit():
        raise HTTPException(status_code=400, detail="PIN must be 4 digits")
    if crud.get_config(db, "nsfw_pin") is not None and session is None:
        raise HTTPException(
            status_code=401,
            detail="Private library authentication required",
        )
    hashed = hashlib.sha256(req.pin.encode()).hexdigest()
    revoke_all_private_sessions()
    crud.set_config(db, "nsfw_pin", hashed)
    return {"ok": True}


@router.post("/pin-verify")
def verify_pin(req: schemas.PinRequest, db: Session = Depends(get_db)):
    config = crud.get_config(db, "nsfw_pin")
    if not config:
        raise HTTPException(status_code=400, detail="PIN not set")

    hashed = hashlib.sha256(req.pin.encode()).hexdigest()
    if hmac.compare_digest(config.value, hashed):
        return {
            "ok": True,
            "session_token": issue_private_session(),
        }
    else:
        raise HTTPException(status_code=401, detail="Invalid PIN")


@router.delete("/session")
def revoke_session(session: str = Depends(require_private_access)):
    revoke_private_session(session)
    return {"ok": True}


@router.delete("/pin-reset")
def reset_pin(
    db: Session = Depends(get_db),
    _session: str = Depends(require_private_access),
):
    config = crud.get_config(db, "nsfw_pin")
    if not config:
        raise HTTPException(status_code=400, detail="PIN not set")
    db.delete(config)
    db.commit()
    revoke_all_private_sessions()
    return {"ok": True}
