<p align="center">
  <img src="assets/HeroImage-PromptArchive.png" alt="Prompt Archive Hero Image" width="100%"/>
</p>

<div align="center">

# 🗂️ Prompt Archive

**A local-first desktop application for managing, organizing, and archiving AI image generation prompts.**

![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-16.1-000000?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-Local-003B57?style=for-the-badge&logo=sqlite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

</div>

---

## 📖 About

Prompt Archive is a **fully offline, privacy-focused** desktop tool designed for AI artists and creators who work with image generation models like Nano Banana, Stable Diffusion, ComfyUI, InvokeAI, and others.

It lets you **save, organize, search, and revisit** your prompts alongside reference images — all stored locally on your machine with zero cloud dependencies.

### ✨ Key Features

- **Structured & JSON prompts** — Store classic positive/negative prompts or full ComfyUI/InvokeAI JSON workflows
- **Multi-slot positive prompts** — Split prompts into up to 3 logical sections
- **Prompt variants** — Branch off existing prompts to track iterations
- **Image attachments** — Attach up to 4 reference/result images per prompt
- **Folder organization** — Group prompts into folders for project-based workflows
- **Categories & tags** — High-level categories and fine-grained keyword tags
- **NSFW library** — PIN-protected separate library for sensitive content
- **Full-text search** — Quickly find prompts by title, content, or tags
- **Dark mode** — Full dark theme with smooth transitions
- **Responsive UI** — Works on desktop and mobile browsers
- **One-click launch** — Start both servers with a single `.bat` script

---

## 🏗️ Architecture

Prompt Archive uses a **decoupled client-server architecture** running entirely on localhost:

| Layer | Technology | Port |
|-------|-----------|------|
| **Frontend** | Next.js 16.1 + React 19 + Tailwind CSS 4 | `3000` |
| **Backend** | FastAPI + SQLAlchemy + SQLite | `8000` |
| **Database** | SQLite (file-based, in `data/`) | — |
| **Images** | Local filesystem (`data/images/`) | — |

---

## 📁 Project Structure

```
PromptArchive/
├── assets/                  # Project assets (cover image, etc.)
├── backend/                 # FastAPI REST API server
│   ├── routers/             # API route handlers
│   │   ├── prompts.py       # CRUD for prompts, images, variants
│   │   ├── folders.py       # Folder management
│   │   ├── categories.py    # Category operations
│   │   └── settings.py      # App settings (PIN, etc.)
│   ├── main.py              # App entry point, middleware, mounts
│   ├── models.py            # SQLAlchemy ORM models
│   ├── schemas.py           # Pydantic request/response schemas
│   ├── crud.py              # Database query functions
│   ├── database.py          # Engine & session configuration
│   ├── migrations.py        # Auto-migration logic
│   ├── seed.py              # Default category seeding
│   └── deps.py              # Shared dependencies & paths
├── frontend/                # Next.js web client
│   ├── app/                 # App Router pages
│   ├── components/          # React components (30+)
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # API client, types, utilities
│   └── public/              # Static assets
├── data/                    # Runtime data (auto-created)
│   ├── database.sqlite      # SQLite database file
│   └── images/              # Uploaded images by prompt ID
├── start_app.bat            # One-click launcher (Windows)
└── test_backend.py          # Backend integration tests
```

---

## 🚀 Quick Start

### Prerequisites

- **Python 3.10+** with `pip`
- **Node.js 18+** with `npm`

### 1. Clone & Setup

```bash
git clone https://github.com/your-username/PromptArchive.git
cd PromptArchive
```

### 2. Backend Setup

```bash
# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Install dependencies
pip install -r backend/requirements.txt
```

### 3. Frontend Setup

```bash
cd frontend
npm install
cd ..
```

### 4. Launch

**Option A — One-click (Windows):**

```bash
start_app.bat
```

**Option B — Manual:**

```bash
# Terminal 1: Backend
venv\Scripts\activate
uvicorn backend.main:app --reload --port 8000

# Terminal 2: Frontend
cd frontend
npm run dev
```

### 5. Open

Navigate to **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🖥️ Usage

| Action | How |
|--------|-----|
| **Browse prompts** | Home page (`/`) shows all standard prompts |
| **Create a prompt** | Click **+ New Prompt** in the sidebar or navigate to `/create` |
| **Create a variant** | From any prompt detail page, click **New Variant** |
| **NSFW library** | Sidebar → NSFW (requires PIN setup in Settings) |
| **Organize** | Create folders, assign categories, add comma-separated tags |
| **Search** | Use the search bar on any library page |
| **Manage categories** | Navigate to `/categories` |

---

## 📚 Use Cases

Prompt Archive is a versatile tool designed to cater to the needs of AI artists, creators, and enthusiasts working with image generation models. Here are some of the key use cases where Prompt Archive proves invaluable:

### 1. **Organizing Prompts and Associated Images**
AI image generation often involves experimenting with multiple prompts and their variations. Prompt Archive allows users to:
- Store prompts alongside their generated images for easy reference.
- Attach up to 4 reference or result images per prompt, ensuring that every iteration is documented.
- Group prompts into folders for project-based workflows, making it easier to manage large-scale projects.

### 2. **Iterative Prompt Development**
Creating the perfect AI-generated image often requires multiple iterations. With Prompt Archive, users can:
- Create prompt variants to track changes and improvements over time.
- Split prompts into logical sections (e.g., positive/negative prompts) for better control.
- Save JSON workflows for advanced models like ComfyUI and InvokeAI.

### 3. **Efficient Search and Retrieval**
Finding the right prompt or image quickly is crucial for productivity. Prompt Archive offers:
- Full-text search capabilities to locate prompts by title, content, or tags.
- High-level categories and fine-grained keyword tags for better organization.
- A responsive and intuitive UI that works seamlessly on both desktop and mobile browsers.

### 4. **Privacy-Focused Content Management**
For creators working with sensitive or NSFW content, Prompt Archive provides:
- A PIN-protected NSFW library to keep sensitive prompts and images secure.
- Local-first architecture with zero cloud dependencies, ensuring complete privacy.

### 5. **Project-Based Workflows**
Whether you’re working on a single artwork or a large-scale project, Prompt Archive supports:
- Folder-based organization to group related prompts and images.
- Category management to classify prompts by themes or styles.
- Tagging for quick filtering and retrieval.

### 6. **Offline Accessibility**
Prompt Archive is designed to work entirely offline, making it ideal for:
- Artists who prefer not to rely on cloud services.
- Environments with limited or no internet connectivity.
- Ensuring data security by keeping everything local.

### 7. **Enhanced User Experience**
With features like dark mode, smooth transitions, and one-click launch, Prompt Archive ensures:
- A comfortable and visually appealing workspace.
- Quick setup and easy access to both frontend and backend servers.
- A streamlined workflow for managing AI-generated content.

Whether you’re an AI artist looking to organize your creative process, a researcher experimenting with image generation models, or a hobbyist exploring the possibilities of AI art, Prompt Archive is the perfect tool to enhance your workflow and keep your prompts and images organized.

---

## ️ Tech Stack

### Frontend

| Package | Purpose |
|---------|---------|
| Next.js 16.1 | React framework with App Router |
| React 19 | UI library |
| Tailwind CSS 4 | Utility-first styling |
| TanStack React Query 5 | Server state & caching |
| React Hook Form 7 | Form state management |
| Axios | HTTP client |
| Lucide React | Icon library |
| Sonner | Toast notifications |

### Backend

| Package | Purpose |
|---------|---------|
| FastAPI | Async REST framework |
| Uvicorn | ASGI server |
| SQLAlchemy | ORM & database toolkit |
| Pydantic | Data validation & schemas |
| Pillow | Image processing |
| python-multipart | File upload handling |

---

## 📄 License

This project is licensed under the **MIT License**. See [LICENSE](LICENSE) for details.

---

<div align="center">

**Made with ❤️ for the AI art community by FaberOs**

</div>
