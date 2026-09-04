# Architecture — Collaborative Document Editor

## Overview

This is a full-stack web application built with the Next.js App Router. It combines server-side API routes, a SQLite database (via Prisma ORM), and a client-side rich text editor (Tiptap) into a cohesive product. The architecture deliberately prioritises simplicity and zero-config local execution over distributed/enterprise patterns.

---

## Stack Choices & Rationale

| Layer | Technology | Why |
|---|---|---|
| **Framework** | Next.js 14 (App Router) | Collocates API routes and React components in one repo; no separate backend service needed |
| **Language** | TypeScript | End-to-end type safety across API contracts, Prisma models, and UI components |
| **Database** | SQLite (via Prisma) | Zero-config, single-file database perfect for local review. Schema is identical to Postgres — swap the provider string to migrate |
| **ORM** | Prisma v5 | Auto-generates typed client from schema; handles migrations in one command |
| **Editor** | Tiptap (headless) | Modular, React-first, ships no default UI — full design control. Built on ProseMirror |
| **Styling** | Tailwind CSS | Utility-first; enables rapid iteration without leaving JSX |
| **Icons** | Lucide React | Lightweight, consistent SVG icon set |
| **Testing** | Jest + React Testing Library | Industry-standard component testing; tests run in jsdom without a browser |

---

## Data Model

```
User
  id          cuid (PK)
  name        string
  email       string (unique)

Document
  id          cuid (PK)
  title       string
  content     string (HTML from Tiptap)
  ownerId     string (FK → User.id)
  createdAt   DateTime
  updatedAt   DateTime

DocumentShare
  id          cuid (PK)
  documentId  string (FK → Document.id, cascade delete)
  userId      string (FK → User.id, cascade delete)
  UNIQUE(documentId, userId)
```

**Key relationships:**
- A `User` owns many `Documents`
- A `DocumentShare` row grants a second `User` read/write access to a `Document`
- The dashboard query returns `owned` and `shared` separately from a single API call

---

## API Routes

```
GET  /api/users                     → All seeded users (for share modal)
GET  /api/documents                 → Owned + shared docs for current user
POST /api/documents                 → Create a new document (or import)
GET  /api/documents/[id]            → Fetch one doc (403 if no access)
PUT  /api/documents/[id]            → Update title/content (auto-save target)
DELETE /api/documents/[id]          → Delete (owner only)
POST /api/documents/[id]/share      → Create DocumentShare (owner only)
```

All routes read the current user from the **`x-user-id` request header**, which is set on every fetch call from the client using the AuthContext value stored in `localStorage`. This is a **prototype-grade mocked auth** suitable for review; a production system would replace this with NextAuth.js or a similar session-based strategy.

---

## Auth Model (Mocked)

The app uses a `localStorage`-backed user switcher rather than real authentication:

1. On first load, `AuthContext` fetches `/api/users`
2. It sets the first user as the active session, persisted in `localStorage`
3. The Header dropdown lets reviewers switch between users to demo the sharing flow
4. Every API call sends `x-user-id: <selectedUserId>` as a header

---

## Auto-Save Architecture

```
User types in Tiptap
  → onUpdate callback fires
    → debounce timer resets (1 second)
      → timer fires → PUT /api/documents/[id]
        → Prisma updates Document.content + updatedAt
```

The same debounce applies to the title field. A status badge shows `Saving…`, `✓ Saved`, or `Save failed` in real time.

---

## PDF Export

Clicking the **PDF** button in the editor toolbar calls `window.print()`. A `@media print` rule in `globals.css` hides all `.no-print` elements (header, toolbar, modals) and leaves only the editor content visible, producing a clean PDF through the browser's native print-to-PDF dialog.

---

## File Import Flow

```
User selects .txt or .md file
  → FileReader.text() reads content
    → Content split on \n, each line wrapped in <p> tags
      → POST /api/documents with title = filename
        → User redirected to /docs/[newId]
```

The conversion is intentionally lightweight. Markdown is not parsed into rich HTML — it is treated as plain text. A production version could use a library like `marked` or `remark` for proper Markdown rendering.

---

## Sharing Flow

```
Owner clicks Share
  → ShareModal renders with user list (minus owner)
    → Owner selects a user → POST /api/documents/[id]/share
      → Prisma upserts DocumentShare (idempotent)
        → Collaborator sees document in "Shared with Me" on dashboard
```

---

## Deliberate Scope Cuts

| Cut | Reason |
|---|---|
| Real auth (NextAuth, JWT) | Out of scope for prototype; mocked auth is sufficient to demonstrate the full sharing model |
| Real-time collaboration (Yjs, CRDTs) | Complex infrastructure; auto-save is the pragmatic alternative |
| Markdown rendering on import | `marked` would be 3–5 lines but adds a dependency; left as plain-text for scope control |
| Role-based permissions | Beyond "owner vs collaborator" — stretch goal in the spec |

---

## Future Enhancements

- Swap SQLite → Postgres (one line in `schema.prisma`)
- Add NextAuth.js for real session management
- Add Yjs + WebSocket for real-time collaboration
- Add document version history (store content snapshots)
- Parse Markdown properly on import using `remark`
