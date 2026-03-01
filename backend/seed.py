"""
Seed the database with default categories on first run.
"""

import logging
from .database import SessionLocal
from . import models

logger = logging.getLogger(__name__)


DEFAULT_CATEGORIES = [
    # General Art Styles
    {"name": "Anime", "description": "Japanese animation style, manga, cel shading, vtubers."},
    {"name": "3D Render", "description": "CGI, Blender, Unreal Engine, Octane Render, Redshift."},
    {"name": "Illustration", "description": "Digital art, vector, flat design, artistic styles."},
    {"name": "Concept Art", "description": "Game assets, character design, futuristic environments."},
    {"name": "Oil Painting", "description": "Traditional media style, textured brushwork, impasto."},
    {"name": "Sketch", "description": "Pencil, charcoal, rough drafts, storyboards."},
    {"name": "Pixel Art", "description": "Retro game style, 8-bit, 16-bit, sprite art."},
    {"name": "Cyberpunk", "description": "High tech, low life, neon, futuristic cityscapes."},
    {"name": "Fantasy", "description": "Magic, dragons, medieval, ethereal, D&D."},
    # Photographic Styles
    {"name": "Cinematic", "description": "Movie-like lighting, widescreen aspect ratio, dramatic composition."},
    {"name": "Portrait", "description": "Focus on faces, skin texture, studio lighting, headshots."},
    {"name": "Landscape", "description": "Nature, mountains, forests, vast vistas, outdoor scenery."},
    {"name": "Macro", "description": "Extreme close-ups, insects, flowers, small details."},
    {"name": "Architectural", "description": "Buildings, interiors, urban structures, geometric lines."},
    {"name": "Street Photography", "description": "Candid moments, urban life, documentary style."},
    {"name": "Fashion", "description": "High fashion, clothing details, runway, model poses."},
    {"name": "Product", "description": "Commercial photography, clean backgrounds, item focus."},
    {"name": "Wildlife", "description": "Animals in nature, telephoto shots, fast action."},
    {"name": "Night Photography", "description": "Low light, city lights, stars, long exposure."},
    {"name": "Aerial", "description": "Drone shots, bird's eye view, maps, satellite imagery."},
    {"name": "Underwater", "description": "Submerged scenes, marine life, light refraction."},
    {"name": "Black and White", "description": "Monochrome, high contrast, noir, artistic b&w."},
    {"name": "Vintage/Retro", "description": "Film grain, faded colors, 70s/80s/90s aesthetic, polaroid."},
    {"name": "Bokeh", "description": "Shallow depth of field, blurred background, light circles."},
    {"name": "Tilt-Shift", "description": "Miniature effect, selective focus, toy-like appearance."},
]


def seed_categories() -> None:
    try:
        db = SessionLocal()
        count = db.query(models.Category).count()
        if count == 0:
            logger.info("Seeding default categories...")
            for c in DEFAULT_CATEGORIES:
                db_cat = models.Category(name=c["name"], description=c["description"])
                db.add(db_cat)
            db.commit()
            logger.info("Categories seeded.")
        db.close()
    except Exception as e:
        logger.error("Seeding failed: %s", e)
