<div align="center">

# ⚙️ Prompt Archive — Backend

**FastAPI REST API server for Prompt Archive**

![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.x-D71F00?style=for-the-badge&logo=sqlalchemy&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-Local-003B57?style=for-the-badge&logo=sqlite&logoColor=white)
![Pydantic](https://img.shields.io/badge/Pydantic-2.x-E92063?style=for-the-badge&logo=pydantic&logoColor=white)

</div>

---

## 📖 Description

The backend is a **lightweight REST API** built with FastAPI that handles all data persistence for Prompt Archive. It uses SQLite as the database (zero configuration, no external server needed) and stores uploaded images on the local filesystem.

The API provides full CRUD operations for prompts, folders, categories, tags, and images, plus app-level settings like PIN management for NSFW content.

---

## ⚡ Quick Start

### Prerequisites

- **Python 3.10+** with `pip`

### Install & Run

```bash
# From the project root (PromptArchive/)

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (macOS/Linux)
source venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt

# Start development server
uvicorn backend.main:app --reload --port 8000
```

The API is now available at **[http://localhost:8000](http://localhost:8000)**.

Interactive docs at **[http://localhost:8000/docs](http://localhost:8000/docs)** (Swagger UI).

---

## 📁 Project Structure

```
backend/
├── main.py              # Application entry point
│                        #   - FastAPI app creation
│                        #   - CORS middleware configuration
│                        #   - Static file mounting (images)
│                        #   - Router registration
│
├── models.py            # SQLAlchemy ORM models
│                        #   - Prompt (title, description, type, variants)
│                        #   - PositivePrompt (multi-slot content)
│                        #   - Image (file references)
│                        #   - Folder (grouping)
│                        #   - Category & Tag (many-to-many)
│                        #   - AppConfig (key-value settings)
│
├── schemas.py           # Pydantic request/response schemas
│                        #   - Validation & serialization
│                        #   - Nested response models
│
├── crud.py              # Database query functions
│                        #   - All read/write operations
│                        #   - Search & filtering logic
│
├── database.py          # Database engine configuration
│                        #   - SQLite connection setup
│                        #   - Session factory
│
├── deps.py              # Shared dependencies
│                        #   - DB session dependency
│                        #   - Image directory paths
│
├── migrations.py        # Auto-migration logic
│                        #   - Schema version checks
│                        #   - Column additions for upgrades
│
├── seed.py              # Default data seeding
│                        #   - Pre-built category set
│
├── routers/             # API route handlers
│   ├── __init__.py
│   ├── prompts.py       # /api/prompts — CRUD, search, images, variants
│   ├── folders.py       # /api/folders — Folder management
│   ├── categories.py    # /api/categories — Category CRUD
│   └── settings.py      # /api/settings — PIN & app config
│
└── requirements.txt     # Python dependencies
```

---

## 🔌 API Endpoints

### Prompts

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/prompts/` | List prompts (with search, folder, NSFW filters) |
| `POST` | `/prompts/` | Create a new prompt |
| `GET` | `/prompts/{id}` | Get prompt by ID (with relations) |
| `PUT` | `/prompts/{id}` | Update a prompt |
| `DELETE` | `/prompts/{id}` | Delete a prompt and its images |
| `POST` | `/prompts/{id}/images` | Upload an image to a prompt |
| `DELETE` | `/prompts/{id}/images/{image_id}` | Delete a specific image |

### Folders

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/folders/` | List all folders (filterable by NSFW) |
| `POST` | `/folders/` | Create a new folder |
| `PUT` | `/folders/{id}` | Rename a folder |
| `DELETE` | `/folders/{id}` | Delete a folder |

### Categories

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/categories/` | List all categories with prompt count |
| `POST` | `/categories/` | Create a new category |
| `PUT` | `/categories/{id}` | Update a category |
| `DELETE` | `/categories/{id}` | Delete a category |

### Settings

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/settings/pin/status` | Check if PIN is configured |
| `POST` | `/settings/pin/verify` | Verify a PIN |
| `POST` | `/settings/pin` | Set or update the PIN |
| `POST` | `/settings/pin/reset` | Reset the PIN |

### Static Files

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/static/{prompt_id}/{filename}` | Serve uploaded images |

---

## 🗄️ Database Schema

```
prompts
├── id, title, description, negative_prompt
├── prompt_type (structured | json)
├── is_nsfw, meta_json
├── parent_id → prompts.id (variants)
├── folder_id → folders.id
├── created_at, updated_at
│
├──< positive_prompts (1:N)
│   └── id, content, position, prompt_id
│
├──< images (1:N)
│   └── id, filename, prompt_id
│
├──<> categories (M:N via prompt_category)
│   └── id, name
│
└──<> tags (M:N via prompt_tag)
    └── id, name

folders
└── id, name, is_nsfw

app_config
└── id, key, value
```

---

## 🧩 Dependencies

| Package | Purpose |
|---------|---------|
| `fastapi` | Async REST framework with auto-docs |
| `uvicorn` | High-performance ASGI server |
| `sqlalchemy` | ORM & database toolkit |
| `pydantic` | Request/response validation |
| `python-multipart` | Multipart form data (file uploads) |
| `Pillow` | Image processing & validation |

---

## 🗃️ Data Storage

All runtime data is stored in the `data/` directory at the project root:

```
data/
├── database.sqlite       # SQLite database file
└── images/               # Uploaded images
    ├── 1/                # Images for prompt ID 1
    │   ├── photo1.png
    │   └── photo2.jpg
    ├── 2/
    └── ...
```

The `data/` directory is auto-created on first run. No external database server is required.

---

## 🧪 Testing

```bash
# From the project root
python test_backend.py
```

---

## 📄 License

MIT — See the root [LICENSE](../LICENSE) for details.
