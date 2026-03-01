import os
from . import database


# Paths
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
IMAGES_DIR = os.path.join(DATA_DIR, "images")
os.makedirs(IMAGES_DIR, exist_ok=True)


def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()
