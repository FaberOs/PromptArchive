"""
Database migrations for SQLite.
Uses PRAGMA table_info to check for missing columns and adds them.
"""

import logging
from sqlalchemy import text
from .database import engine

logger = logging.getLogger(__name__)


def check_and_migrate_db() -> None:
    try:
        with engine.connect() as conn:
            # --- prompts table ---
            result = conn.execute(text("PRAGMA table_info(prompts)")).fetchall()
            columns = [row[1] for row in result]

            if "is_nsfw" not in columns:
                logger.info("Migration: Adding is_nsfw column to prompts")
                conn.execute(text("ALTER TABLE prompts ADD COLUMN is_nsfw BOOLEAN DEFAULT 0"))
                conn.commit()

            if "prompt_type" not in columns:
                logger.info("Migration: Adding prompt_type column to prompts")
                conn.execute(text("ALTER TABLE prompts ADD COLUMN prompt_type VARCHAR DEFAULT 'structured'"))
                conn.commit()

            if "parent_id" not in columns:
                logger.info("Migration: Adding parent_id column to prompts")
                conn.execute(text("ALTER TABLE prompts ADD COLUMN parent_id INTEGER REFERENCES prompts(id)"))
                conn.commit()

            if "space_id" not in columns:
                logger.info("Migration: Adding space_id column to prompts")
                conn.execute(text("ALTER TABLE prompts ADD COLUMN space_id INTEGER REFERENCES spaces(id)"))
                conn.commit()

            if "updated_at" not in columns:
                logger.info("Migration: Adding updated_at column to prompts")
                conn.execute(text("ALTER TABLE prompts ADD COLUMN updated_at DATETIME"))
                conn.execute(text("UPDATE prompts SET updated_at = created_at WHERE updated_at IS NULL"))
                conn.commit()

            if "is_hidden" not in columns:
                logger.info("Migration: Adding is_hidden column to prompts")
                conn.execute(text("ALTER TABLE prompts ADD COLUMN is_hidden BOOLEAN DEFAULT 0"))
                conn.commit()

            # --- spaces (folders) table ---
            spaces_result = conn.execute(text("PRAGMA table_info(spaces)")).fetchall()
            spaces_columns = [row[1] for row in spaces_result]

            if "is_hidden" not in spaces_columns:
                logger.info("Migration: Adding is_hidden column to spaces")
                conn.execute(text("ALTER TABLE spaces ADD COLUMN is_hidden BOOLEAN DEFAULT 0"))
                conn.commit()

            # --- categories table ---
            cat_result = conn.execute(text("PRAGMA table_info(categories)")).fetchall()
            cat_columns = [row[1] for row in cat_result]

            if "description" not in cat_columns:
                logger.info("Migration: Adding description column to categories")
                conn.execute(text("ALTER TABLE categories ADD COLUMN description TEXT"))
                conn.commit()

            if "created_at" not in cat_columns:
                logger.info("Migration: Adding created_at column to categories")
                conn.execute(text("ALTER TABLE categories ADD COLUMN created_at DATETIME"))
                conn.execute(text("UPDATE categories SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL"))
                conn.commit()

            if "updated_at" not in cat_columns:
                logger.info("Migration: Adding updated_at column to categories")
                conn.execute(text("ALTER TABLE categories ADD COLUMN updated_at DATETIME"))
                conn.execute(text("UPDATE categories SET updated_at = created_at WHERE updated_at IS NULL"))
                conn.commit()

    except Exception as e:
        logger.warning("Migration check failed (might be first run): %s", e)
