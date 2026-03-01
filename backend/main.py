import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from . import models, database
from .migrations import check_and_migrate_db
from .seed import seed_categories
from .deps import IMAGES_DIR
from .routers import prompts, folders, categories, settings

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)

# Create DB Tables
models.Base.metadata.create_all(bind=database.engine)

# Run migrations and seed data
check_and_migrate_db()
seed_categories()

app = FastAPI(title="Prompt Archive API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Static Images
app.mount("/static", StaticFiles(directory=IMAGES_DIR), name="static")

# Routers
app.include_router(prompts.router)
app.include_router(folders.router)
app.include_router(categories.router)
app.include_router(settings.router)
