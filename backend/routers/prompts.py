import logging
import os
import shutil
import uuid

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from PIL import Image, UnidentifiedImageError
from sqlalchemy.orm import Session
from typing import List, Optional

from .. import crud, models, schemas
from ..auth import optional_private_session
from ..deps import get_db, IMAGES_DIR

logger = logging.getLogger(__name__)

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp"}
MAX_IMAGE_BYTES = 10 * 1024 * 1024
EXTENSION_FORMATS = {
    ".jpg": ("JPEG", "image/jpeg"),
    ".jpeg": ("JPEG", "image/jpeg"),
    ".png": ("PNG", "image/png"),
    ".gif": ("GIF", "image/gif"),
    ".webp": ("WEBP", "image/webp"),
    ".bmp": ("BMP", "image/bmp"),
}


def _upload_size(file: UploadFile) -> int:
    current_position = file.file.tell()
    file.file.seek(0, os.SEEK_END)
    size = file.file.tell()
    file.file.seek(current_position)
    return size


def _validate_image_file(file: UploadFile) -> tuple[str, str]:
    """Validate extension, declared MIME, size, and actual decoded content."""

    filename = file.filename or ""
    ext = os.path.splitext(filename)[1].lower()
    expected = EXTENSION_FORMATS.get(ext)
    if expected is None:
        raise HTTPException(
            status_code=400,
            detail=(
                f"File extension '{ext}' is not allowed. Accepted: "
                f"{', '.join(sorted(ALLOWED_EXTENSIONS))}"
            ),
        )

    if _upload_size(file) > MAX_IMAGE_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"Images must be {MAX_IMAGE_BYTES // (1024 * 1024)} MB or smaller",
        )

    declared_mime = (file.content_type or "").lower()
    if declared_mime and declared_mime != expected[1]:
        raise HTTPException(status_code=400, detail="File MIME type does not match its extension")

    try:
        file.file.seek(0)
        with Image.open(file.file) as image:
            actual_format = image.format
            image.verify()
    except (UnidentifiedImageError, OSError, ValueError) as exc:
        raise HTTPException(
            status_code=400,
            detail="File content is not a valid supported image",
        ) from exc
    finally:
        file.file.seek(0)

    if actual_format != expected[0]:
        raise HTTPException(
            status_code=400,
            detail="File content does not match its extension",
        )

    return ext, expected[1]


def _copy_upload(file: UploadFile, destination: str) -> None:
    file.file.seek(0)
    written = 0
    with open(destination, "wb") as output:
        while chunk := file.file.read(1024 * 1024):
            written += len(chunk)
            if written > MAX_IMAGE_BYTES:
                raise HTTPException(
                    status_code=413,
                    detail=f"Images must be {MAX_IMAGE_BYTES // (1024 * 1024)} MB or smaller",
                )
            output.write(chunk)


def _is_private_prompt(prompt: Optional[models.Prompt]) -> bool:
    return prompt is not None and crud.prompt_is_private(prompt)


def _ensure_private_access(
    prompt: Optional[models.Prompt],
    session: Optional[str],
) -> None:
    if _is_private_prompt(prompt) and session is None:
        # Do not reveal that a private record exists to a public caller.
        raise HTTPException(status_code=404, detail="Prompt not found")


def _require_private_for_payload(
    is_nsfw: bool,
    is_hidden: Optional[bool],
    session: Optional[str],
) -> None:
    if (is_nsfw or is_hidden is True) and session is None:
        raise HTTPException(status_code=401, detail="Private library authentication required")


def _stage_directory(directory: str) -> Optional[str]:
    if not os.path.isdir(directory):
        return None
    staged = f"{directory}.delete-{uuid.uuid4().hex}"
    os.replace(directory, staged)
    return staged


def _restore_directory(staged: Optional[str], original: str) -> None:
    if staged and os.path.exists(staged) and not os.path.exists(original):
        os.replace(staged, original)


router = APIRouter(tags=["Prompts"])


@router.post("/prompts/", response_model=schemas.PromptRead)
def create_prompt(
    prompt: schemas.PromptCreate,
    db: Session = Depends(get_db),
    session: Optional[str] = Depends(optional_private_session),
):
    _require_private_for_payload(prompt.is_nsfw, prompt.is_hidden, session)

    if prompt.folder_id is not None:
        folder = crud.get_folder(db, prompt.folder_id)
        if folder is None:
            raise HTTPException(status_code=404, detail="Folder not found")
        if folder.is_nsfw != prompt.is_nsfw:
            raise HTTPException(status_code=400, detail="Folder visibility does not match prompt visibility")
        if folder.is_hidden and session is None:
            raise HTTPException(status_code=401, detail="Private library authentication required")

    # Validate: prevent creating a variant of a variant (only one level deep)
    if prompt.parent_id is not None:
        parent = crud.get_prompt(db, prompt.parent_id)
        if parent is None:
            raise HTTPException(status_code=404, detail="Parent prompt not found")
        _ensure_private_access(parent, session)
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
    only_hidden: bool = False,
    prompt_type: Optional[str] = Query(None, pattern="^(structured|json)$"),
    tag: Optional[str] = None,
    sort: str = Query("newest", pattern="^(newest|oldest|title_asc|title_desc)$"),
    db: Session = Depends(get_db),
    session: Optional[str] = Depends(optional_private_session),
):
    if (nsfw or show_hidden or only_hidden) and session is None:
        raise HTTPException(status_code=401, detail="Private library authentication required")
    prompts, total = crud.get_prompts(
        db, skip=skip, limit=limit, search=search,
        is_nsfw=nsfw, folder_id=folder_id, categories=categories,
        show_hidden=show_hidden, only_hidden=only_hidden,
        prompt_type=prompt_type, tag=tag, sort=sort,
    )
    crud.inject_image_urls_many(prompts)
    crud.inject_variant_count_many(prompts)
    return {"items": prompts, "total": total}


@router.get("/prompts/{prompt_id}", response_model=schemas.PromptRead)
def read_prompt(
    prompt_id: int,
    show_hidden: bool = False,
    db: Session = Depends(get_db),
    session: Optional[str] = Depends(optional_private_session),
):
    if show_hidden and session is None:
        raise HTTPException(status_code=401, detail="Private library authentication required")
    db_prompt = crud.get_prompt(
        db,
        prompt_id=prompt_id,
        include_hidden=show_hidden,
    )
    if db_prompt is None:
        raise HTTPException(status_code=404, detail="Prompt not found")
    _ensure_private_access(db_prompt, session)
    crud.inject_image_urls(db_prompt)
    crud.inject_variant_count(db_prompt)
    return db_prompt


@router.get("/prompts/{prompt_id}/variants", response_model=List[schemas.PromptRead])
def read_prompt_variants(
    prompt_id: int,
    show_hidden: bool = False,
    db: Session = Depends(get_db),
    session: Optional[str] = Depends(optional_private_session),
):
    if show_hidden and session is None:
        raise HTTPException(status_code=401, detail="Private library authentication required")
    parent = crud.get_prompt(db, prompt_id, include_hidden=True)
    if parent is None:
        raise HTTPException(status_code=404, detail="Prompt not found")
    _ensure_private_access(parent, session)
    variants = crud.get_prompt_variants(
        db,
        prompt_id=prompt_id,
        include_hidden=show_hidden or session is not None,
        include_nsfw=session is not None,
    )
    crud.inject_image_urls_many(variants)
    crud.inject_variant_count_many(variants)
    return variants


@router.put("/prompts/{prompt_id}", response_model=schemas.PromptRead)
def update_prompt(
    prompt_id: int,
    prompt: schemas.PromptUpdate,
    db: Session = Depends(get_db),
    session: Optional[str] = Depends(optional_private_session),
):
    current = crud.get_prompt(db, prompt_id, include_hidden=True)
    if current is None:
        raise HTTPException(status_code=404, detail="Prompt not found")
    _ensure_private_access(current, session)

    fields = prompt.model_fields_set
    target_is_nsfw = prompt.is_nsfw if "is_nsfw" in fields else current.is_nsfw
    target_is_hidden = prompt.is_hidden if "is_hidden" in fields else current.is_hidden
    _require_private_for_payload(target_is_nsfw, target_is_hidden, session)

    if "folder_id" not in fields:
        if current.folder is not None and current.folder.is_nsfw != target_is_nsfw:
            raise HTTPException(status_code=400, detail="Folder visibility does not match prompt visibility")
        if current.folder is not None and current.folder.is_hidden and session is None:
            raise HTTPException(status_code=401, detail="Private library authentication required")
    elif prompt.folder_id not in (None, 0):
        folder = crud.get_folder(db, prompt.folder_id)
        if folder is None:
            raise HTTPException(status_code=404, detail="Folder not found")
        if folder.is_nsfw != target_is_nsfw:
            raise HTTPException(status_code=400, detail="Folder visibility does not match prompt visibility")
        if folder.is_hidden and session is None:
            raise HTTPException(status_code=401, detail="Private library authentication required")
    updated_prompt = crud.update_prompt(db, prompt_id, prompt)
    if updated_prompt is None:
        raise HTTPException(status_code=404, detail="Prompt not found")
    crud.inject_image_urls(updated_prompt)
    crud.inject_variant_count(updated_prompt)
    return updated_prompt


@router.delete("/prompts/{prompt_id}")
def delete_prompt(
    prompt_id: int,
    db: Session = Depends(get_db),
    session: Optional[str] = Depends(optional_private_session),
):
    current = crud.get_prompt(db, prompt_id, include_hidden=True)
    if current is None:
        raise HTTPException(status_code=404, detail="Prompt not found")
    _ensure_private_access(current, session)

    prompt_dir = os.path.join(IMAGES_DIR, str(prompt_id))
    staged_dir = _stage_directory(prompt_dir)

    try:
        success = crud.delete_prompt(db, prompt_id)
    except Exception as exc:
        _restore_directory(staged_dir, prompt_dir)
        raise HTTPException(status_code=500, detail="Could not delete prompt") from exc
    if not success:
        _restore_directory(staged_dir, prompt_dir)
        raise HTTPException(status_code=404, detail="Prompt not found")
    if staged_dir:
        try:
            shutil.rmtree(staged_dir)
        except OSError:
            logger.exception("Prompt files could not be removed after database deletion")
    return {"ok": True}


@router.post("/prompts/{prompt_id}/images", response_model=schemas.ImageRead)
def upload_image(
    prompt_id: int,
    file: UploadFile = File(...),
    note: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    session: Optional[str] = Depends(optional_private_session),
):
    db_prompt = crud.get_prompt(db, prompt_id, include_hidden=True)
    if not db_prompt:
        raise HTTPException(status_code=404, detail="Prompt not found")
    _ensure_private_access(db_prompt, session)

    if len(db_prompt.images) >= 4:
        raise HTTPException(status_code=400, detail="Max 4 images per prompt")

    # Validate file is a real image
    ext, _mime_type = _validate_image_file(file)

    # Create directory
    prompt_dir = os.path.join(IMAGES_DIR, str(prompt_id))
    try:
        os.makedirs(prompt_dir, exist_ok=True)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Filesystem error: {e}")

    safe_filename = f"{uuid.uuid4()}{ext}"
    file_path = os.path.join(prompt_dir, safe_filename)
    temporary_path = f"{file_path}.upload-{uuid.uuid4().hex}"

    try:
        _copy_upload(file, temporary_path)
        os.replace(temporary_path, file_path)
    except HTTPException:
        if os.path.exists(temporary_path):
            os.remove(temporary_path)
        raise
    except OSError as exc:
        if os.path.exists(temporary_path):
            os.remove(temporary_path)
        raise HTTPException(status_code=500, detail="File write error") from exc

    try:
        db_image = crud.add_image_to_prompt(db, prompt_id, safe_filename, note)
    except Exception as exc:
        db.rollback()
        try:
            os.remove(file_path)
        except OSError:
            logger.exception("Uploaded file could not be rolled back: %s", file_path)
        raise HTTPException(status_code=500, detail="Image metadata could not be saved") from exc
    db_image.url = f"/static/{prompt_id}/{safe_filename}"
    return db_image


@router.delete("/prompts/{prompt_id}/images/{image_id}")
def delete_image(
    prompt_id: int,
    image_id: int,
    db: Session = Depends(get_db),
    session: Optional[str] = Depends(optional_private_session),
):
    # 1. Get Image Info to find file
    db_image = crud.get_image(db, image_id)
    if not db_image or db_image.prompt_id != prompt_id:
        raise HTTPException(status_code=404, detail="Image not found")
    _ensure_private_access(db_image.prompt, session)

    # Stage the file so a failed DB transaction can restore it.
    if os.path.basename(db_image.filename) != db_image.filename:
        raise HTTPException(status_code=500, detail="Stored image filename is invalid")
    file_path = os.path.join(IMAGES_DIR, str(prompt_id), db_image.filename)
    staged_path = None
    if os.path.isfile(file_path):
        staged_path = f"{file_path}.delete-{uuid.uuid4().hex}"
        os.replace(file_path, staged_path)

    try:
        deleted = crud.delete_image(db, image_id)
    except Exception as exc:
        db.rollback()
        if staged_path and os.path.exists(staged_path):
            os.replace(staged_path, file_path)
        raise HTTPException(status_code=500, detail="Image metadata could not be deleted") from exc
    if not deleted:
        if staged_path and os.path.exists(staged_path):
            os.replace(staged_path, file_path)
        raise HTTPException(status_code=404, detail="Image not found")
    if staged_path:
        try:
            os.remove(staged_path)
        except OSError:
            logger.exception("Image file could not be removed after database deletion")
    return {"ok": True}


# --- Bulk Operations ---

@router.post("/bulk/hide")
def bulk_hide(
    req: schemas.BulkHideRequest,
    db: Session = Depends(get_db),
    session: Optional[str] = Depends(optional_private_session),
):
    if crud.bulk_selection_is_private(db, req.prompt_ids, req.folder_ids) and session is None:
        raise HTTPException(status_code=401, detail="Private library authentication required")
    count = crud.bulk_set_hidden(db, req.prompt_ids, req.folder_ids, req.hidden)
    return {"ok": True, "affected": count}


@router.post("/bulk/delete")
def bulk_delete(
    req: schemas.BulkDeleteRequest,
    db: Session = Depends(get_db),
    session: Optional[str] = Depends(optional_private_session),
):
    if crud.bulk_selection_is_private(db, req.prompt_ids, req.folder_ids) and session is None:
        raise HTTPException(status_code=401, detail="Private library authentication required")
    missing_folders = [fid for fid in req.folder_ids if crud.get_folder(db, fid) is None]
    if missing_folders:
        raise HTTPException(status_code=404, detail="Folder not found")
    deleted_prompt_ids, deleted_folder_ids = crud.bulk_delete(db, req.prompt_ids, req.folder_ids)
    # Cleanup image directories
    for pid in deleted_prompt_ids:
        prompt_dir = os.path.join(IMAGES_DIR, str(pid))
        if os.path.exists(prompt_dir):
            shutil.rmtree(prompt_dir)
    return {"ok": True, "deleted_prompts": len(deleted_prompt_ids), "deleted_folders": len(deleted_folder_ids)}


@router.post("/bulk/move")
def bulk_move(
    req: schemas.BulkMoveRequest,
    db: Session = Depends(get_db),
    session: Optional[str] = Depends(optional_private_session),
):
    target_folder = None
    if req.folder_id not in (None, 0):
        target_folder = crud.get_folder(db, req.folder_id)
        if target_folder is None:
            raise HTTPException(status_code=404, detail="Folder not found")
        selected_prompts = (
            db.query(models.Prompt)
            .filter(models.Prompt.id.in_(req.prompt_ids))
            .all()
            if req.prompt_ids
            else []
        )
        if any(prompt.is_nsfw != target_folder.is_nsfw for prompt in selected_prompts):
            raise HTTPException(
                status_code=400,
                detail="Folder visibility does not match prompt visibility",
            )
    if (
        crud.bulk_selection_is_private(db, req.prompt_ids, [])
        or (target_folder is not None and (target_folder.is_nsfw or target_folder.is_hidden))
    ) and session is None:
        raise HTTPException(status_code=401, detail="Private library authentication required")
    count = crud.bulk_move(db, req.prompt_ids, req.folder_id)
    return {"ok": True, "moved": count}
