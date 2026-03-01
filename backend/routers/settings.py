from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import hashlib

from .. import crud, schemas
from ..deps import get_db

router = APIRouter(prefix="/settings", tags=["Settings"])


@router.get("/pin-status")
def check_pin_status(db: Session = Depends(get_db)):
    config = crud.get_config(db, "nsfw_pin")
    return {"is_set": config is not None}


@router.post("/pin-set")
def set_pin(req: schemas.PinRequest, db: Session = Depends(get_db)):
    if len(req.pin) != 4 or not req.pin.isdigit():
        raise HTTPException(status_code=400, detail="PIN must be 4 digits")
    hashed = hashlib.sha256(req.pin.encode()).hexdigest()
    crud.set_config(db, "nsfw_pin", hashed)
    return {"ok": True}


@router.post("/pin-verify")
def verify_pin(req: schemas.PinRequest, db: Session = Depends(get_db)):
    config = crud.get_config(db, "nsfw_pin")
    if not config:
        raise HTTPException(status_code=400, detail="PIN not set")

    hashed = hashlib.sha256(req.pin.encode()).hexdigest()
    if config.value == hashed:
        return {"ok": True}
    else:
        raise HTTPException(status_code=401, detail="Invalid PIN")


@router.delete("/pin-reset")
def reset_pin(db: Session = Depends(get_db)):
    config = crud.get_config(db, "nsfw_pin")
    if not config:
        raise HTTPException(status_code=400, detail="PIN not set")
    db.delete(config)
    db.commit()
    return {"ok": True}
