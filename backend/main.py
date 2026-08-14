import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from . import database, models
from .migrations import check_and_migrate_db
from .seed import seed_categories
from .routers import categories, folders, media, prompts, settings

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


@app.get("/health")
def health_check():
    return {"status": "ok"}


# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",      # launcher dev
        "http://localhost:3002",      # prompt-archive frontend dev
        "http://127.0.0.1:3002",      # prompt-archive frontend dev (alternate)
        "app://prompt-archive",       # Fase 4: SPA served via app:// protocol in production
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(prompts.router)
app.include_router(folders.router)
app.include_router(categories.router)
app.include_router(settings.router)
app.include_router(media.router)
