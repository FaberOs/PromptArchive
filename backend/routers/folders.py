from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from .. import crud, schemas
from ..auth import optional_private_session
from ..deps import get_db

router = APIRouter(tags=["Folders"])


@router.post("/folders/", response_model=schemas.FolderRead)
def create_folder(
    folder: schemas.FolderCreate,
    db: Session = Depends(get_db),
    session: Optional[str] = Depends(optional_private_session),
):
    if folder.is_nsfw and session is None:
        raise HTTPException(status_code=401, detail="Private library authentication required")
    return crud.create_folder(db=db, folder=folder)


@router.get("/folders/", response_model=List[schemas.FolderRead])
def read_folders(
    is_nsfw: bool = False,
    show_hidden: bool = False,
    db: Session = Depends(get_db),
    session: Optional[str] = Depends(optional_private_session),
):
    if (is_nsfw or show_hidden) and session is None:
        raise HTTPException(status_code=401, detail="Private library authentication required")
    return crud.get_folders(db, is_nsfw=is_nsfw, show_hidden=show_hidden)


@router.put("/folders/{folder_id}", response_model=schemas.FolderRead)
def update_folder(
    folder_id: int,
    folder: schemas.FolderUpdate,
    db: Session = Depends(get_db),
    session: Optional[str] = Depends(optional_private_session),
):
    current = crud.get_folder(db, folder_id)
    if current is None:
        raise HTTPException(status_code=404, detail="Folder not found")
    if (current.is_nsfw or current.is_hidden or folder.is_nsfw) and session is None:
        raise HTTPException(status_code=401, detail="Private library authentication required")
    db_folder = crud.update_folder(db, folder_id, folder)
    if db_folder is None:
        raise HTTPException(status_code=404, detail="Folder not found")
    return db_folder


@router.delete("/folders/{folder_id}")
def delete_folder(
    folder_id: int,
    db: Session = Depends(get_db),
    session: Optional[str] = Depends(optional_private_session),
):
    current = crud.get_folder(db, folder_id)
    if current is None:
        raise HTTPException(status_code=404, detail="Folder not found")
    if (current.is_nsfw or current.is_hidden) and session is None:
        raise HTTPException(status_code=401, detail="Private library authentication required")
    success = crud.delete_folder(db, folder_id)
    if not success:
        raise HTTPException(status_code=404, detail="Folder not found")
    return {"ok": True}
