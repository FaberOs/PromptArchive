import os
from . import database


def _default_data_dir() -> str:
    return os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")


# PROMPT_ARCHIVE_DATA_DIR overrides the data location when provided.
DATA_DIR = os.environ.get("PROMPT_ARCHIVE_DATA_DIR") or _default_data_dir()
IMAGES_DIR = os.path.join(DATA_DIR, "images")
os.makedirs(IMAGES_DIR, exist_ok=True)


def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()
