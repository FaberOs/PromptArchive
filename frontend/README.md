<div align="center">

# 🖥️ Prompt Archive — Frontend

**Next.js web client for Prompt Archive**

![Next.js](https://img.shields.io/badge/Next.js-16.1-000000?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![React Query](https://img.shields.io/badge/React_Query-5-FF4154?style=for-the-badge&logo=reactquery&logoColor=white)

</div>

---

## 📖 Description

The frontend is a **server-side rendered React application** built with Next.js 16 App Router. It provides a responsive, dark-mode-ready UI for browsing, creating, and managing AI image generation prompts.

All data is fetched from the FastAPI backend running on `localhost:8000` via Axios, with TanStack React Query handling caching, refetching, and optimistic updates.

---

## ⚡ Quick Start

### Prerequisites

- **Node.js 18+** with `npm`
- Backend server running on port `8000` (see [backend README](../backend/README.md))

### Install & Run

```bash
# Install dependencies
npm install

# Development server (port 3000)
npm run dev

# Production build
npm run build
npm start
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 📁 Project Structure

```
frontend/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout (sidebar, providers, theme)
│   ├── page.tsx                  # Home — Standard library
│   ├── globals.css               # Global styles & Tailwind directives
│   ├── create/
│   │   └── page.tsx              # Prompt creation form
│   ├── categories/
│   │   └── page.tsx              # Category management (browse + manage)
│   ├── nsfw/
│   │   └── page.tsx              # NSFW library (PIN-protected)
│   └── prompts/
│       └── [id]/
│           └── page.tsx          # Prompt detail view
│
├── components/                   # React components
│   ├── ui/                       # Primitives & design system
│   │   ├── Badge.tsx             # Status/count badges
│   │   ├── Button.tsx            # Button with loading state
│   │   ├── CopyButton.tsx        # Copy-to-clipboard button
│   │   ├── FieldLabel.tsx        # Form label with tooltip
│   │   ├── InfoTip.tsx           # Hover tooltip component
│   │   ├── Input.tsx             # Styled text input
│   │   ├── Modal.tsx             # Dialog overlay
│   │   ├── Skeleton.tsx          # Loading placeholder
│   │   └── Textarea.tsx          # Auto-sizing textarea
│   │
│   ├── library/                  # Shared library page components
│   │   ├── EmptyState.tsx        # No-results placeholder
│   │   ├── PageHeader.tsx        # Page title + actions bar
│   │   ├── PromptGrid.tsx        # Responsive prompt card grid
│   │   └── SearchInput.tsx       # Debounced search field
│   │
│   ├── create/                   # Create form sections
│   │   ├── PromptContentSection.tsx  # Prompt text / JSON editor
│   │   ├── ImagesSection.tsx     # Image upload grid
│   │   └── OrganizationSection.tsx   # Folders, categories, tags
│   │
│   ├── prompt-detail/            # Prompt detail view sections
│   │   ├── PromptBreadcrumbs.tsx # Navigation breadcrumbs
│   │   ├── PromptGallery.tsx     # Image gallery with lightbox
│   │   ├── PromptMeta.tsx        # Metadata sidebar
│   │   ├── PromptTextContent.tsx # Prompt text display
│   │   └── PromptThread.tsx      # Variant thread view
│   │
│   ├── categories/               # Category page tabs
│   │   ├── BrowseTab.tsx         # Browse categories grid
│   │   └── ManageTab.tsx         # CRUD category management
│   │
│   ├── skeletons/                # Loading skeletons
│   │   ├── FolderGridSkeleton.tsx
│   │   ├── PromptCardSkeleton.tsx
│   │   └── PromptDetailSkeleton.tsx
│   │
│   ├── Sidebar.tsx               # Navigation sidebar
│   ├── PromptCard.tsx            # Prompt preview card
│   ├── FolderGrid.tsx            # Folder grid view
│   ├── ImageViewer.tsx           # Full-screen image viewer
│   ├── JsonViewer.tsx            # JSON syntax viewer
│   ├── CategoryModal.tsx         # Category create/edit modal
│   ├── CategorySelector.tsx      # Multi-select category picker
│   ├── PinModal.tsx              # PIN entry dialog
│   ├── SecurityProvider.tsx      # PIN auth context
│   ├── ThemeProvider.tsx         # Dark/light mode context
│   └── QueryProvider.tsx         # React Query provider
│
├── hooks/                        # Custom React hooks
│   ├── useLibrary.ts             # Shared library logic (search, folders, prompts)
│   ├── useCreatePrompt.ts        # Create form state & submission
│   ├── useCategories.ts          # Category CRUD operations
│   ├── usePromptDetail.ts        # Prompt detail data fetching
│   └── useDebounce.ts            # Debounce utility hook
│
├── lib/                          # Shared utilities
│   ├── api.ts                    # Axios instance & API functions
│   ├── types.ts                  # TypeScript type definitions
│   ├── constants.ts              # App-wide constants
│   └── utils.ts                  # Helper functions (cn, formatDate, etc.)
│
├── public/                       # Static files
├── package.json                  # Dependencies & scripts
├── tsconfig.json                 # TypeScript configuration
├── next.config.ts                # Next.js configuration
├── postcss.config.mjs            # PostCSS (Tailwind) config
└── eslint.config.mjs             # ESLint configuration
```

---

## 🧩 Key Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `next` | 16.1.0 | React framework with App Router & SSR |
| `react` | 19.2.3 | UI library |
| `@tanstack/react-query` | 5.x | Server state, caching, refetch |
| `react-hook-form` | 7.x | Performant form state management |
| `axios` | 1.x | HTTP client for API calls |
| `tailwindcss` | 4.x | Utility-first CSS framework |
| `lucide-react` | 0.5x | Beautiful & consistent icon set |
| `sonner` | 2.x | Toast notification system |
| `clsx` + `tailwind-merge` | — | Conditional class merging |
| `@radix-ui/react-popover` | 1.x | Accessible popover primitives |

---

## 🎨 Pages & Routes

| Route | Page | Description |
|-------|------|-------------|
| `/` | Home | Standard prompt library with search & folders |
| `/create` | Create | Two-column form for creating prompts |
| `/create?parent_id=X` | Variant | Pre-filled form branching from prompt X |
| `/prompts/[id]` | Detail | Full prompt view with gallery, metadata, variants |
| `/categories` | Categories | Browse & manage prompt categories |
| `/nsfw` | NSFW Library | PIN-protected NSFW prompt library |

---

## 🛠️ Available Scripts

```bash
npm run dev       # Start development server with hot reload
npm run build     # Create optimized production build
npm start         # Start production server
npm run lint      # Run ESLint checks
```

---

## 📄 License

MIT — See the root [LICENSE](../LICENSE) for details.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
