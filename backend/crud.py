from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional
from . import models, schemas


def inject_image_urls(prompt: models.Prompt) -> models.Prompt:
    """Inject computed URL into each image of a prompt."""
    for img in prompt.images:
        img.url = f"/static/{prompt.id}/{img.filename}"
    return prompt


def inject_image_urls_many(prompts: list[models.Prompt]) -> list[models.Prompt]:
    """Inject computed URLs into images of multiple prompts."""
    for p in prompts:
        inject_image_urls(p)
    return prompts


def inject_variant_count(prompt: models.Prompt) -> models.Prompt:
    """Inject variant_count attribute into a prompt."""
    setattr(prompt, "variant_count", len(prompt.variants) if prompt.variants else 0)
    return prompt


def inject_variant_count_many(prompts: list[models.Prompt]) -> list[models.Prompt]:
    """Inject variant_count attribute into multiple prompts."""
    for p in prompts:
        inject_variant_count(p)
    return prompts

def get_category_by_name(db: Session, name: str) -> Optional[models.Category]:
    return db.query(models.Category).filter(models.Category.name == name).first()

def get_tag_by_name(db: Session, name: str) -> Optional[models.Tag]:
    return db.query(models.Tag).filter(models.Tag.name == name).first()


def cleanup_orphan_tags(db: Session) -> int:
    """Delete tags that are no longer associated with any prompt. Returns count of deleted tags."""
    orphans = (
        db.query(models.Tag)
        .outerjoin(models.prompt_tag_association, models.Tag.id == models.prompt_tag_association.c.tag_id)
        .filter(models.prompt_tag_association.c.tag_id == None)
        .all()
    )
    count = len(orphans)
    for tag in orphans:
        db.delete(tag)
    if count:
        db.flush()
    return count

def create_prompt(db: Session, prompt: schemas.PromptCreate) -> models.Prompt:
    # 1. Create main prompt object
    db_prompt = models.Prompt(
        title=prompt.title,
        description=prompt.description,
        negative_prompt=prompt.negative_prompt or "",
        meta_json=prompt.meta_json,
        is_nsfw=prompt.is_nsfw,
        prompt_type=prompt.prompt_type,
        parent_id=prompt.parent_id,
        folder_id=prompt.folder_id
    )
    db.add(db_prompt)
    db.flush() # Get ID

    # 2. Add Positive Prompts (In JSON mode, the first one holds the JSON)
    for idx, content in enumerate(prompt.positive_prompts):
        if idx >= 3: break # Max 3 (or 1 for JSON)
        pos_prompt = models.PositivePrompt(prompt_id=db_prompt.id, content=content, order_index=idx)
        db.add(pos_prompt)

    # 3. Handle Categories
    for cat_name in prompt.categories:
        cat_name = cat_name.strip()
        if not cat_name: continue
        category = get_category_by_name(db, cat_name)
        if not category:
            category = models.Category(name=cat_name)
            db.add(category)
        db_prompt.categories.append(category)

    # 4. Handle Tags
    for tag_name in prompt.tags:
        tag_name = tag_name.strip()
        if not tag_name: continue
        tag = get_tag_by_name(db, tag_name)
        if not tag:
            tag = models.Tag(name=tag_name)
            db.add(tag)
        db_prompt.tags.append(tag)
    
    db.commit()
    db.refresh(db_prompt)
    return db_prompt

def get_prompts(db: Session, skip: int = 0, limit: int = 100, search: Optional[str] = None, is_nsfw: bool = False, folder_id: Optional[int] = None, categories: Optional[list[str]] = None, show_hidden: bool = False) -> tuple[list[models.Prompt], int]:
    # Base query: NSFW filter and Exclude Variants (parent_id is None)
    query = db.query(models.Prompt).filter(models.Prompt.is_nsfw == is_nsfw, models.Prompt.parent_id == None)
    
    # Hidden filter
    if not show_hidden:
        query = query.filter(models.Prompt.is_hidden == False)
    
    # Folder Filter
    if folder_id is not None:
        if folder_id == 0: # Convention for "Root/No Folder"
             query = query.filter(models.Prompt.folder_id == None)
        elif folder_id > 0:
             query = query.filter(models.Prompt.folder_id == folder_id)

    # Search Filter
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            or_(
                models.Prompt.title.ilike(search_filter),
                models.Prompt.description.ilike(search_filter),
                models.Prompt.tags.any(models.Tag.name.ilike(search_filter)),
                models.Prompt.categories.any(models.Category.name.ilike(search_filter))
            )
        )
    
    # Categories Filter (Intersection / AND logic)
    if categories:
        for cat_name in categories:
            query = query.filter(models.Prompt.categories.any(models.Category.name == cat_name))
    
    total = query.count()
    items = query.order_by(models.Prompt.created_at.desc()).offset(skip).limit(limit).all()
    return items, total

def get_prompt(db: Session, prompt_id: int) -> Optional[models.Prompt]:
    return db.query(models.Prompt).filter(models.Prompt.id == prompt_id).first()

def delete_prompt(db: Session, prompt_id: int) -> bool:
    prompt = get_prompt(db, prompt_id)
    if prompt:
        db.delete(prompt)
        cleanup_orphan_tags(db)
        db.commit()
        return True
    return False

def get_prompt_variants(db: Session, prompt_id: int) -> list[models.Prompt]:
    return db.query(models.Prompt).filter(models.Prompt.parent_id == prompt_id).all()

def update_prompt(db: Session, prompt_id: int, prompt_data: schemas.PromptUpdate) -> Optional[models.Prompt]:
    db_prompt = get_prompt(db, prompt_id)
    if not db_prompt:
        return None

    # 1. Update basic fields
    db_prompt.title = prompt_data.title
    db_prompt.description = prompt_data.description
    db_prompt.negative_prompt = prompt_data.negative_prompt or ""
    db_prompt.meta_json = prompt_data.meta_json
    db_prompt.is_nsfw = prompt_data.is_nsfw
    db_prompt.prompt_type = prompt_data.prompt_type
    
    # Handle folder move if provided (optional)
    if prompt_data.folder_id is not None:
        # If 0, set to None (Root)
        if prompt_data.folder_id == 0:
            db_prompt.folder_id = None
        else:
            db_prompt.folder_id = prompt_data.folder_id

    # 2. Update Positive Prompts (Delete all and re-create for simplicity)
    db.query(models.PositivePrompt).filter(models.PositivePrompt.prompt_id == prompt_id).delete()
    for idx, content in enumerate(prompt_data.positive_prompts):
        if idx >= 3: break
        if content.strip():
            pos_prompt = models.PositivePrompt(prompt_id=prompt_id, content=content, order_index=idx)
            db.add(pos_prompt)

    # 3. Update Categories
    db_prompt.categories.clear()
    for cat_name in prompt_data.categories:
        cat_name = cat_name.strip()
        if not cat_name: continue
        category = get_category_by_name(db, cat_name)
        if not category:
            category = models.Category(name=cat_name)
            db.add(category)
        db_prompt.categories.append(category)

    # 4. Update Tags
    db_prompt.tags.clear()
    for tag_name in prompt_data.tags:
        tag_name = tag_name.strip()
        if not tag_name: continue
        tag = get_tag_by_name(db, tag_name)
        if not tag:
            tag = models.Tag(name=tag_name)
            db.add(tag)
        db_prompt.tags.append(tag)

    # 5. Cleanup orphan tags
    cleanup_orphan_tags(db)

    db.commit()
    db.refresh(db_prompt)
    return db_prompt

# --- PIN / Config ---
def get_config(db: Session, key: str) -> Optional[models.AppConfig]:
    return db.query(models.AppConfig).filter(models.AppConfig.key == key).first()

def set_config(db: Session, key: str, value: str) -> models.AppConfig:
    config = get_config(db, key)
    if not config:
        config = models.AppConfig(key=key, value=value)
        db.add(config)
    else:
        config.value = value
    db.commit()
    return config

def add_image_to_prompt(db: Session, prompt_id: int, filename: str, note: Optional[str] = None) -> models.Image:
    db_image = models.Image(prompt_id=prompt_id, filename=filename, note=note)
    db.add(db_image)
    db.commit()
    db.refresh(db_image)
    return db_image

def get_image(db: Session, image_id: int) -> Optional[models.Image]:
    return db.query(models.Image).filter(models.Image.id == image_id).first()

def delete_image(db: Session, image_id: int) -> bool:
    image = get_image(db, image_id)
    if image:
        db.delete(image)
        db.commit()
        return True
    return False

def get_categories(db: Session, search: Optional[str] = None) -> list[models.Category]:
    query = db.query(models.Category)
    
    if search:
        query = query.filter(models.Category.name.ilike(f"%{search}%"))
        
    categories = query.order_by(models.Category.name).all()
    
    # Compute counts
    for cat in categories:
        count = db.query(models.prompt_category_association).filter(
            models.prompt_category_association.c.category_id == cat.id
        ).count()
        setattr(cat, "prompt_count", count)
        
    return categories

def create_category(db: Session, category: schemas.CategoryCreate) -> models.Category:
    db_cat = models.Category(name=category.name, description=category.description)
    db.add(db_cat)
    db.commit()
    db.refresh(db_cat)
    return db_cat

def update_category(db: Session, category_id: int, category_data: schemas.CategoryUpdate) -> Optional[models.Category]:
    db_cat = db.query(models.Category).filter(models.Category.id == category_id).first()
    if not db_cat:
        return None
    
    db_cat.name = category_data.name
    if category_data.description is not None:
        db_cat.description = category_data.description
        
    db.commit()
    db.refresh(db_cat)
    return db_cat

def delete_category(db: Session, category_id: int) -> bool:
    db_cat = db.query(models.Category).filter(models.Category.id == category_id).first()
    if db_cat:
        db.delete(db_cat)
        db.commit()
        return True
    return False

def get_tags(db: Session) -> list[models.Tag]:
    return db.query(models.Tag).all()

# --- Folders ---
def create_folder(db: Session, folder: schemas.FolderCreate) -> models.Folder:
    db_folder = models.Folder(
        name=folder.name,
        color=folder.color,
        is_nsfw=folder.is_nsfw
    )
    db.add(db_folder)
    db.commit()
    db.refresh(db_folder)
    return db_folder

def get_folders(db: Session, is_nsfw: bool = False, show_hidden: bool = False) -> list[models.Folder]:
    query = db.query(models.Folder).filter(models.Folder.is_nsfw == is_nsfw)
    if not show_hidden:
        query = query.filter(models.Folder.is_hidden == False)
    folders = query.order_by(models.Folder.created_at.desc()).all()
    
    for folder in folders:
        # Fetch recent prompts for preview (Roots only to ensure variety)
        recent_prompts = db.query(models.Prompt).filter(models.Prompt.folder_id == folder.id, models.Prompt.parent_id == None).order_by(models.Prompt.created_at.desc()).limit(4).all()
        previews = []
        for p in recent_prompts:
            if p.images:
                previews.append(f"/static/{p.id}/{p.images[0].filename}")
                if len(previews) >= 4: break
        
        # Attach dynamic attribute for Pydantic schema
        setattr(folder, "preview_images", previews)
        
    return folders

def get_folder(db: Session, folder_id: int) -> Optional[models.Folder]:
    return db.query(models.Folder).filter(models.Folder.id == folder_id).first()

def update_folder(db: Session, folder_id: int, folder_data: schemas.FolderUpdate) -> Optional[models.Folder]:
    db_folder = get_folder(db, folder_id)
    if not db_folder:
        return None
    
    db_folder.name = folder_data.name
    db_folder.color = folder_data.color
    # is_nsfw typically shouldn't change easily as it affects content visibility, but allowing it for now
    db_folder.is_nsfw = folder_data.is_nsfw
    
    db.commit()
    db.refresh(db_folder)
    return db_folder

def delete_folder(db: Session, folder_id: int) -> bool:
    db_folder = get_folder(db, folder_id)
    if db_folder:
        # Set prompts' folder_id to NULL (Keep prompts, remove folder)
        prompts = db.query(models.Prompt).filter(models.Prompt.folder_id == folder_id).all()
        for p in prompts:
            p.folder_id = None
        
        db.delete(db_folder)
        db.commit()
        return True
    return False


# --- Bulk Operations ---

def bulk_set_hidden(db: Session, prompt_ids: list[int], folder_ids: list[int], hidden: bool) -> int:
    """Set is_hidden on prompts and folders. For folders, also set on child prompts (and their variants)."""
    count = 0

    # Hide/unhide folders and cascade to their prompts
    if folder_ids:
        folders = db.query(models.Folder).filter(models.Folder.id.in_(folder_ids)).all()
        for f in folders:
            f.is_hidden = hidden
            count += 1
        # Cascade: prompts inside those folders
        child_prompts = db.query(models.Prompt).filter(models.Prompt.folder_id.in_(folder_ids)).all()
        for p in child_prompts:
            p.is_hidden = hidden
            count += 1
            # Also cascade to variants
            for v in p.variants:
                v.is_hidden = hidden

    # Hide/unhide individual prompts
    if prompt_ids:
        prompts = db.query(models.Prompt).filter(models.Prompt.id.in_(prompt_ids)).all()
        for p in prompts:
            p.is_hidden = hidden
            count += 1
            # Cascade to variants (children)
            for v in p.variants:
                v.is_hidden = hidden

    db.commit()
    return count


def bulk_delete(db: Session, prompt_ids: list[int], folder_ids: list[int]) -> tuple[list[int], list[int]]:
    """Delete prompts and folders. Returns (deleted_prompt_ids, deleted_folder_ids) for file cleanup."""
    deleted_prompt_ids: set[int] = set()
    deleted_folder_ids: list[int] = []

    # 1. Collect all prompt IDs that belong to selected folders
    folder_child_ids: set[int] = set()
    if folder_ids:
        child_prompts = db.query(models.Prompt).filter(models.Prompt.folder_id.in_(folder_ids)).all()
        for p in child_prompts:
            folder_child_ids.add(p.id)
            for v in p.variants:
                folder_child_ids.add(v.id)

    # 2. Collect IDs from individually selected prompts
    individual_ids: set[int] = set()
    if prompt_ids:
        prompts = db.query(models.Prompt).filter(models.Prompt.id.in_(prompt_ids)).all()
        for p in prompts:
            individual_ids.add(p.id)
            for v in p.variants:
                individual_ids.add(v.id)

    # 3. Merge all prompt IDs for file cleanup
    deleted_prompt_ids = individual_ids | folder_child_ids

    # 4. Delete individual prompts (skip those that will cascade from folder deletion)
    if prompt_ids:
        prompts_to_delete = db.query(models.Prompt).filter(
            models.Prompt.id.in_(prompt_ids),
            ~models.Prompt.folder_id.in_(folder_ids) if folder_ids else True
        ).all()
        for p in prompts_to_delete:
            db.delete(p)
        db.flush()

    # 5. Delete folders and their remaining child prompts
    if folder_ids:
        for fid in folder_ids:
            folder = get_folder(db, fid)
            if not folder:
                continue
            # Delete remaining child prompts in this folder
            remaining = db.query(models.Prompt).filter(models.Prompt.folder_id == fid).all()
            for p in remaining:
                db.delete(p)
            db.delete(folder)
            deleted_folder_ids.append(fid)
        db.flush()

    cleanup_orphan_tags(db)
    db.commit()
    return list(deleted_prompt_ids), deleted_folder_ids


def bulk_move(db: Session, prompt_ids: list[int], folder_id: int | None) -> int:
    """Move prompts to a folder (or root if folder_id is None/0)."""
    target = None if (folder_id is None or folder_id == 0) else folder_id
    prompts = db.query(models.Prompt).filter(models.Prompt.id.in_(prompt_ids)).all()
    for p in prompts:
        p.folder_id = target
    db.commit()
    return len(prompts)
