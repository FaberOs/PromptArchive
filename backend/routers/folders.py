from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from .. import crud, schemas
from ..deps import get_db

router = APIRouter(tags=["Folders"])


@router.post("/folders/", response_model=schemas.FolderRead)
def create_folder(folder: schemas.FolderCreate, db: Session = Depends(get_db)):
    return crud.create_folder(db=db, folder=folder)


@router.get("/folders/", response_model=List[schemas.FolderRead])
def read_folders(is_nsfw: bool = False, show_hidden: bool = False, db: Session = Depends(get_db)):
    return crud.get_folders(db, is_nsfw=is_nsfw, show_hidden=show_hidden)


@router.put("/folders/{folder_id}", response_model=schemas.FolderRead)
def update_folder(folder_id: int, folder: schemas.FolderUpdate, db: Session = Depends(get_db)):
    db_folder = crud.update_folder(db, folder_id, folder)
    if db_folder is None:
        raise HTTPException(status_code=404, detail="Folder not found")
    return db_folder


@router.delete("/folders/{folder_id}")
def delete_folder(folder_id: int, db: Session = Depends(get_db)):
    success = crud.delete_folder(db, folder_id)
    if not success:
        raise HTTPException(status_code=404, detail="Folder not found")
    return {"ok": True}
