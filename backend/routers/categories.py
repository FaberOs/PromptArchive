from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from .. import crud, schemas
from ..deps import get_db

router = APIRouter(tags=["Categories & Tags"])


@router.get("/categories/", response_model=List[schemas.CategoryRead])
def read_categories(search: Optional[str] = None, db: Session = Depends(get_db)):
    return crud.get_categories(db, search=search)


@router.post("/categories/", response_model=schemas.CategoryRead)
def create_category(category: schemas.CategoryCreate, db: Session = Depends(get_db)):
    existing = crud.get_category_by_name(db, category.name)
    if existing:
        raise HTTPException(status_code=400, detail="Category already exists")
    return crud.create_category(db, category)


@router.put("/categories/{category_id}", response_model=schemas.CategoryRead)
def update_category(category_id: int, category: schemas.CategoryUpdate, db: Session = Depends(get_db)):
    updated = crud.update_category(db, category_id, category)
    if not updated:
        raise HTTPException(status_code=404, detail="Category not found")
    return updated


@router.delete("/categories/{category_id}")
def delete_category(category_id: int, db: Session = Depends(get_db)):
    success = crud.delete_category(db, category_id)
    if not success:
        raise HTTPException(status_code=404, detail="Category not found")
    return {"ok": True}


@router.get("/tags/", response_model=List[schemas.TagRead])
def read_tags(db: Session = Depends(get_db)):
    return crud.get_tags(db)
