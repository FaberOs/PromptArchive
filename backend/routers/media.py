import mimetypes
import os
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from .. import crud
from ..auth import optional_private_session
from ..deps import IMAGES_DIR, get_db


router = APIRouter(tags=["Media"])


@router.get("/static/{prompt_id}/{filename:path}")
def serve_prompt_image(
    prompt_id: int,
    filename: str,
    db: Session = Depends(get_db),
    session: Optional[str] = Depends(optional_private_session),
):
    """Serve an image only after checking its owning prompt's visibility."""

    safe_filename = os.path.basename(filename)
    if safe_filename != filename:
        raise HTTPException(status_code=404, detail="Image not found")

    image = crud.get_image_for_prompt(db, prompt_id, safe_filename)
    if image is None or crud.prompt_is_private(image.prompt) and session is None:
        raise HTTPException(status_code=404, detail="Image not found")

    file_path = os.path.join(IMAGES_DIR, str(prompt_id), safe_filename)
    if not os.path.isfile(file_path) or image.filename != safe_filename:
        raise HTTPException(status_code=404, detail="Image not found")

    media_type = mimetypes.guess_type(safe_filename)[0] or "application/octet-stream"
    return FileResponse(
        file_path,
        media_type=media_type,
        headers={"Cache-Control": "private, no-store"},
    )
