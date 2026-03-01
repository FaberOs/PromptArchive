from pydantic import BaseModel
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
    class Config:
        from_attributes = True

class TagBase(BaseModel):
    name: str

class TagRead(TagBase):
    id: int
    class Config:
        from_attributes = True

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
    preview_images: List[str] = []
    class Config:
        from_attributes = True

# --- Images ---
class ImageBase(BaseModel):
    note: Optional[str] = None

class ImageRead(ImageBase):
    id: int
    filename: str
    created_at: datetime
    url: Optional[str] = None # Computed field for frontend
    class Config:
        from_attributes = True

# --- Prompts ---
class PositivePromptBase(BaseModel):
    content: str
    order_index: int = 0

class PositivePromptRead(PositivePromptBase):
    id: int
    class Config:
        from_attributes = True

class PromptBase(BaseModel):

    title: str

    description: Optional[str] = None

    negative_prompt: Optional[str] = "" # Make optional for JSON mode

    meta_json: Optional[Dict[str, Any]] = None

    is_nsfw: bool = False

    prompt_type: PromptType = PromptType.STRUCTURED



class PromptCreate(PromptBase):

    positive_prompts: List[str]  # List of strings for simplicity in creation

    categories: List[str]        # List of category names

    tags: List[str]              # List of tag names
    
    parent_id: Optional[int] = None
    
    folder_id: Optional[int] = None



class PromptUpdate(PromptBase):

    positive_prompts: List[str]

    categories: List[str]

    tags: List[str]
    
    folder_id: Optional[int] = None

class PromptRead(PromptBase):

    id: int

    created_at: datetime

    updated_at: Optional[datetime] = None
    
    parent_id: Optional[int] = None
    
    folder_id: Optional[int] = None
    folder: Optional[FolderRead] = None

    is_hidden: bool = False

    positive_prompts: List[PositivePromptRead]

    categories: List[CategoryRead]

    tags: List[TagRead]

    images: List[ImageRead]

    variant_count: int = 0


    class Config:

        from_attributes = True


class PaginatedPrompts(BaseModel):
    items: List[PromptRead]
    total: int = 0


# --- Bulk Actions ---
class BulkHideRequest(BaseModel):
    prompt_ids: List[int] = []
    folder_ids: List[int] = []
    hidden: bool = True

class BulkDeleteRequest(BaseModel):
    prompt_ids: List[int] = []
    folder_ids: List[int] = []

class BulkMoveRequest(BaseModel):
    prompt_ids: List[int] = []
    folder_id: Optional[int] = None  # None or 0 = root


# --- Config ---

class PinRequest(BaseModel):

    pin: str
