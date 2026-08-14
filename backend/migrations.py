"""Additive SQLite migrations and integrity verification for Prompt Archive."""

import logging

from sqlalchemy import Engine, text

from .database import engine


logger = logging.getLogger(__name__)


def _column_names(conn, table_name: str) -> set[str]:
    return {row[1] for row in conn.execute(text(f"PRAGMA table_info({table_name})"))}


def check_and_migrate_db(db_engine: Engine = engine) -> None:
    """Apply additive migrations and fail startup if integrity cannot be verified."""

    with db_engine.begin() as conn:
        prompts_columns = _column_names(conn, "prompts")
        prompt_migrations = (
            ("is_nsfw", "BOOLEAN DEFAULT 0", "Adding is_nsfw column to prompts"),
            ("prompt_type", "VARCHAR DEFAULT 'structured'", "Adding prompt_type column to prompts"),
            ("parent_id", "INTEGER REFERENCES prompts(id)", "Adding parent_id column to prompts"),
            ("space_id", "INTEGER REFERENCES spaces(id)", "Adding space_id column to prompts"),
            ("updated_at", "DATETIME", "Adding updated_at column to prompts"),
            ("is_hidden", "BOOLEAN DEFAULT 0", "Adding is_hidden column to prompts"),
        )
        for column_name, definition, message in prompt_migrations:
            if column_name in prompts_columns:
                continue
            logger.info("Migration: %s", message)
            conn.execute(text(f"ALTER TABLE prompts ADD COLUMN {column_name} {definition}"))
            if column_name == "updated_at":
                conn.execute(
                    text("UPDATE prompts SET updated_at = created_at WHERE updated_at IS NULL")
                )

        spaces_columns = _column_names(conn, "spaces")
        if "is_hidden" not in spaces_columns:
            logger.info("Migration: Adding is_hidden column to spaces")
            conn.execute(text("ALTER TABLE spaces ADD COLUMN is_hidden BOOLEAN DEFAULT 0"))

        category_columns = _column_names(conn, "categories")
        category_migrations = (
            ("description", "TEXT", "Adding description column to categories"),
            ("created_at", "DATETIME", "Adding created_at column to categories"),
            ("updated_at", "DATETIME", "Adding updated_at column to categories"),
        )
        for column_name, definition, message in category_migrations:
            if column_name in category_columns:
                continue
            logger.info("Migration: %s", message)
            conn.execute(text(f"ALTER TABLE categories ADD COLUMN {column_name} {definition}"))
            if column_name == "created_at":
                conn.execute(
                    text(
                        "UPDATE categories SET created_at = CURRENT_TIMESTAMP "
                        "WHERE created_at IS NULL"
                    )
                )
            if column_name == "updated_at":
                conn.execute(
                    text("UPDATE categories SET updated_at = created_at WHERE updated_at IS NULL")
                )

        violations = conn.execute(text("PRAGMA foreign_key_check")).fetchall()
        if violations:
            raise RuntimeError(
                "SQLite foreign-key integrity check failed: "
                f"{len(violations)} violation(s)"
            )
