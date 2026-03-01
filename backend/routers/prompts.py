import logging
import os
import shutil
import uuid

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from .. import crud, schemas
from ..deps import get_db, IMAGES_DIR

logger = logging.getLogger(__name__)

# Magic bytes for allowed image formats
ALLOWED_SIGNATURES: dict[str, list[bytes]] = {
    "JPEG": [b"\xff\xd8\xff"],
    "PNG":  [b"\x89PNG\r\n\x1a\n"],
    "GIF":  [b"GIF87a", b"GIF89a"],
    "WEBP": [b"RIFF"],  # RIFF header (WEBP uses RIFF container)
    "BMP":  [b"BM"],
}

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp"}


def _validate_image_file(file: UploadFile) -> None:
    """Validate that the uploaded file is a genuine image by checking magic bytes and extension."""
    # 1. Validate extension
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"File extension '{ext}' is not allowed. Accepted: {', '.join(sorted(ALLOWED_EXTENSIONS))}",
        )

    # 2. Read the first 16 bytes to check magic bytes
    header = file.file.read(16)
    file.file.seek(0)  # Reset for later consumption

    if not header:
        raise HTTPException(status_code=400, detail="Empty file")

    for fmt, signatures in ALLOWED_SIGNATURES.items():
        for sig in signatures:
            if header.startswith(sig):
                return  # Valid image

    raise HTTPException(
        status_code=400,
        detail="File content does not match a supported image format. Accepted: JPEG, PNG, GIF, WEBP, BMP.",
    )

router = APIRouter(tags=["Prompts"])


@router.post("/prompts/", response_model=schemas.PromptRead)
def create_prompt(prompt: schemas.PromptCreate, db: Session = Depends(get_db)):
    # Validate: prevent creating a variant of a variant (only one level deep)
    if prompt.parent_id is not None:
        parent = crud.get_prompt(db, prompt.parent_id)
        if parent is None:
            raise HTTPException(status_code=404, detail="Parent prompt not found")
        if parent.parent_id is not None:
            raise HTTPException(
                status_code=400,
                detail="Cannot create a variant of a variant. Variants are only one level deep."
            )
    return crud.create_prompt(db=db, prompt=prompt)


@router.get("/prompts/", response_model=schemas.PaginatedPrompts)
def read_prompts(
    skip: int = 0,
    limit: int = 20,
    search: Optional[str] = None,
    nsfw: bool = False,
    folder_id: Optional[int] = None,
    categories: Optional[List[str]] = Query(None),
    show_hidden: bool = False,
    db: Session = Depends(get_db),
):
    prompts, total = crud.get_prompts(
        db, skip=skip, limit=limit, search=search,
        is_nsfw=nsfw, folder_id=folder_id, categories=categories,
        show_hidden=show_hidden,
    )
    crud.inject_image_urls_many(prompts)
    crud.inject_variant_count_many(prompts)
    return {"items": prompts, "total": total}


@router.get("/prompts/{prompt_id}", response_model=schemas.PromptRead)
def read_prompt(prompt_id: int, db: Session = Depends(get_db)):
    db_prompt = crud.get_prompt(db, prompt_id=prompt_id)
    if db_prompt is None:
        raise HTTPException(status_code=404, detail="Prompt not found")
    crud.inject_image_urls(db_prompt)
    crud.inject_variant_count(db_prompt)
    return db_prompt


@router.get("/prompts/{prompt_id}/variants", response_model=List[schemas.PromptRead])
def read_prompt_variants(prompt_id: int, db: Session = Depends(get_db)):
    variants = crud.get_prompt_variants(db, prompt_id=prompt_id)
    crud.inject_image_urls_many(variants)
    crud.inject_variant_count_many(variants)
    return variants


@router.put("/prompts/{prompt_id}", response_model=schemas.PromptRead)
def update_prompt(prompt_id: int, prompt: schemas.PromptUpdate, db: Session = Depends(get_db)):
    updated_prompt = crud.update_prompt(db, prompt_id, prompt)
    if updated_prompt is None:
        raise HTTPException(status_code=404, detail="Prompt not found")
    crud.inject_image_urls(updated_prompt)
    crud.inject_variant_count(updated_prompt)
    return updated_prompt


@router.delete("/prompts/{prompt_id}")
def delete_prompt(prompt_id: int, db: Session = Depends(get_db)):
    # Also delete files
    prompt_dir = os.path.join(IMAGES_DIR, str(prompt_id))
    if os.path.exists(prompt_dir):
        shutil.rmtree(prompt_dir)

    success = crud.delete_prompt(db, prompt_id)
    if not success:
        raise HTTPException(status_code=404, detail="Prompt not found")
    return {"ok": True}


@router.post("/prompts/{prompt_id}/images", response_model=schemas.ImageRead)
def upload_image(
    prompt_id: int,
    file: UploadFile = File(...),
    note: Optional[str] = Form(None),
    db: Session = Depends(get_db),
):
    db_prompt = crud.get_prompt(db, prompt_id)
    if not db_prompt:
        raise HTTPException(status_code=404, detail="Prompt not found")

    if len(db_prompt.images) >= 4:
        raise HTTPException(status_code=400, detail="Max 4 images per prompt")

    # Validate file is a real image
    _validate_image_file(file)

    # Create directory
    prompt_dir = os.path.join(IMAGES_DIR, str(prompt_id))
    try:
        os.makedirs(prompt_dir, exist_ok=True)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Filesystem error: {e}")

    # Secure filename (keep extension)
    ext = os.path.splitext(file.filename)[1]
    safe_filename = f"{uuid.uuid4()}{ext}"
    file_path = os.path.join(prompt_dir, safe_filename)

    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail="File write error")

    db_image = crud.add_image_to_prompt(db, prompt_id, safe_filename, note)
    db_image.url = f"/static/{prompt_id}/{safe_filename}"
    return db_image


@router.delete("/prompts/{prompt_id}/images/{image_id}")
def delete_image(prompt_id: int, image_id: int, db: Session = Depends(get_db)):
    # 1. Get Image Info to find file
    db_image = crud.get_image(db, image_id)
    if not db_image or db_image.prompt_id != prompt_id:
        raise HTTPException(status_code=404, detail="Image not found")

    # 2. Delete File
    file_path = os.path.join(IMAGES_DIR, str(prompt_id), db_image.filename)
    if os.path.exists(file_path):
        try:
            os.remove(file_path)
        except Exception as e:
            logger.error("Error deleting file %s: %s", file_path, e)

    # 3. Delete DB Record
    crud.delete_image(db, image_id)
    return {"ok": True}


# --- Bulk Operations ---

@router.post("/bulk/hide")
def bulk_hide(req: schemas.BulkHideRequest, db: Session = Depends(get_db)):
    count = crud.bulk_set_hidden(db, req.prompt_ids, req.folder_ids, req.hidden)
    return {"ok": True, "affected": count}


@router.post("/bulk/delete")
def bulk_delete(req: schemas.BulkDeleteRequest, db: Session = Depends(get_db)):
    deleted_prompt_ids, deleted_folder_ids = crud.bulk_delete(db, req.prompt_ids, req.folder_ids)
    # Cleanup image directories
    for pid in deleted_prompt_ids:
        prompt_dir = os.path.join(IMAGES_DIR, str(pid))
        if os.path.exists(prompt_dir):
            shutil.rmtree(prompt_dir)
    return {"ok": True, "deleted_prompts": len(deleted_prompt_ids), "deleted_folders": len(deleted_folder_ids)}


@router.post("/bulk/move")
def bulk_move(req: schemas.BulkMoveRequest, db: Session = Depends(get_db)):
    count = crud.bulk_move(db, req.prompt_ids, req.folder_id)
    return {"ok": True, "moved": count}
