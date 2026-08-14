from pydantic import BaseModel, ConfigDict, Field
from typing import List, Optional, Any, Dict
from datetime import datetime
from enum import Enum


class PromptType(str, Enum):
    STRUCTURED = "structured"
    JSON = "json"


# --- Shared ---
class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(CategoryBase):
    pass

class CategoryRead(CategoryBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    prompt_count: int = 0
    model_config = ConfigDict(from_attributes=True)

class TagBase(BaseModel):
    name: str

class TagRead(TagBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

# --- Folders ---
class FolderBase(BaseModel):
    name: str
    color: str = "#3b82f6"
    is_nsfw: bool = False

class FolderCreate(FolderBase):
    pass

class FolderUpdate(FolderBase):
    pass

class FolderRead(FolderBase):
    id: int
    created_at: datetime
    is_hidden: bool = False
    preview_images: List[str] = Field(default_factory=list)
    prompt_count: int = 0
    model_config = ConfigDict(from_attributes=True)

# --- Images ---
class ImageBase(BaseModel):
    note: Optional[str] = None

class ImageRead(ImageBase):
    id: int
    filename: str
    created_at: datetime
    url: Optional[str] = None # Computed field for frontend
    model_config = ConfigDict(from_attributes=True)

# --- Prompts ---
class PositivePromptBase(BaseModel):
    content: str
    order_index: int = 0

class PositivePromptRead(PositivePromptBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class PromptBase(BaseModel):

    title: str

    description: Optional[str] = None

    negative_prompt: Optional[str] = "" # Make optional for JSON mode

    meta_json: Optional[Dict[str, Any]] = None

    is_nsfw: bool = False

    prompt_type: PromptType = PromptType.STRUCTURED



class PromptCreate(PromptBase):

    is_hidden: bool = False

    positive_prompts: List[str] = Field(default_factory=list)  # List of strings for simplicity in creation

    categories: List[str] = Field(default_factory=list)        # List of category names

    tags: List[str] = Field(default_factory=list)              # List of tag names
    
    parent_id: Optional[int] = None
    
    folder_id: Optional[int] = None



class PromptUpdate(PromptBase):

    is_hidden: Optional[bool] = None

    positive_prompts: List[str] = Field(default_factory=list)

    categories: List[str] = Field(default_factory=list)

    tags: List[str] = Field(default_factory=list)
    
    folder_id: Optional[int] = None

class PromptRead(PromptBase):

    id: int

    created_at: datetime

    updated_at: Optional[datetime] = None
    
    parent_id: Optional[int] = None
    
    folder_id: Optional[int] = None
    folder: Optional[FolderRead] = None

    is_hidden: bool = False

    positive_prompts: List[PositivePromptRead] = Field(default_factory=list)

    categories: List[CategoryRead] = Field(default_factory=list)

    tags: List[TagRead] = Field(default_factory=list)

    images: List[ImageRead] = Field(default_factory=list)

    variant_count: int = 0


    model_config = ConfigDict(from_attributes=True)


class PaginatedPrompts(BaseModel):
    items: List[PromptRead]
    total: int = 0


# --- Bulk Actions ---
class BulkHideRequest(BaseModel):
    prompt_ids: List[int] = Field(default_factory=list)
    folder_ids: List[int] = Field(default_factory=list)
    hidden: bool = True

class BulkDeleteRequest(BaseModel):
    prompt_ids: List[int] = Field(default_factory=list)
    folder_ids: List[int] = Field(default_factory=list)

class BulkMoveRequest(BaseModel):
    prompt_ids: List[int] = []
    folder_id: Optional[int] = None  # None or 0 = root


# --- Config ---

class PinRequest(BaseModel):

    pin: str
