from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Table, JSON, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from .database import Base


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


# Association Tables
prompt_category_association = Table(
    "prompt_category",
    Base.metadata,
    Column("prompt_id", Integer, ForeignKey("prompts.id"), primary_key=True),
    Column("category_id", Integer, ForeignKey("categories.id"), primary_key=True),
)

prompt_tag_association = Table(
    "prompt_tag",
    Base.metadata,
    Column("prompt_id", Integer, ForeignKey("prompts.id"), primary_key=True),
    Column("tag_id", Integer, ForeignKey("tags.id"), primary_key=True),
)

class Prompt(Base):
    __tablename__ = "prompts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text, nullable=True)
    negative_prompt = Column(Text, nullable=False)
    created_at = Column(DateTime, default=_utcnow)
    updated_at = Column(DateTime, default=_utcnow, onupdate=_utcnow)
    meta_json = Column(JSON, nullable=True)
    is_nsfw = Column(Boolean, default=False)
    prompt_type = Column(String, default="structured") # 'structured' or 'json'
    is_hidden = Column(Boolean, default=False)
    parent_id = Column(Integer, ForeignKey("prompts.id"), nullable=True)
    folder_id = Column("space_id", Integer, ForeignKey("spaces.id"), nullable=True)

    # Relationships
    variants = relationship("Prompt", back_populates="parent", cascade="all, delete-orphan")
    parent = relationship("Prompt", back_populates="variants", remote_side=[id])
    folder = relationship("Folder", back_populates="prompts")
    positive_prompts = relationship("PositivePrompt", back_populates="prompt", cascade="all, delete-orphan")
    images = relationship("Image", back_populates="prompt", cascade="all, delete-orphan")
    categories = relationship("Category", secondary=prompt_category_association, back_populates="prompts")
    tags = relationship("Tag", secondary=prompt_tag_association, back_populates="prompts")

class AppConfig(Base):
    __tablename__ = "app_config"
    
    key = Column(String, primary_key=True, index=True)
    value = Column(String, nullable=False)

class PositivePrompt(Base):
    __tablename__ = "positive_prompts"

    id = Column(Integer, primary_key=True, index=True)
    prompt_id = Column(Integer, ForeignKey("prompts.id"))
    content = Column(Text, nullable=False)
    order_index = Column(Integer, default=0)

    prompt = relationship("Prompt", back_populates="positive_prompts")

class Image(Base):
    __tablename__ = "images"

    id = Column(Integer, primary_key=True, index=True)
    prompt_id = Column(Integer, ForeignKey("prompts.id"))
    filename = Column(String, nullable=False)
    note = Column(Text, nullable=True)
    created_at = Column(DateTime, default=_utcnow)

    prompt = relationship("Prompt", back_populates="images")

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=_utcnow)
    updated_at = Column(DateTime, default=_utcnow, onupdate=_utcnow)

    prompts = relationship("Prompt", secondary=prompt_category_association, back_populates="categories")

class Tag(Base):
    __tablename__ = "tags"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)

    prompts = relationship("Prompt", secondary=prompt_tag_association, back_populates="tags")

class Folder(Base):
    __tablename__ = "spaces"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    color = Column(String, default="#3b82f6") # Default blue
    is_nsfw = Column(Boolean, default=False)
    is_hidden = Column(Boolean, default=False)
    created_at = Column(DateTime, default=_utcnow)

    prompts = relationship("Prompt", back_populates="folder")
