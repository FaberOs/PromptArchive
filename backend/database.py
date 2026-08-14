from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, declarative_base
import os


def _default_data_dir() -> str:
    return os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")


# PROMPT_ARCHIVE_DATA_DIR overrides the data location when provided.
DATA_DIR = os.environ.get("PROMPT_ARCHIVE_DATA_DIR") or _default_data_dir()
os.makedirs(DATA_DIR, exist_ok=True)

SQLALCHEMY_DATABASE_URL = f"sqlite:///{os.path.join(DATA_DIR, 'database.sqlite')}"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False, "timeout": 30},
)


@event.listens_for(engine, "connect")
def enable_sqlite_integrity(dbapi_connection, _connection_record):
    """Enforce foreign keys for every SQLite connection, including pooled ones."""

    cursor = dbapi_connection.cursor()
    try:
        cursor.execute("PRAGMA foreign_keys=ON")
    finally:
        cursor.close()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()
