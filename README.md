# Lightweight Collaborative Document Editor

A full-stack document editor inspired by Google Docs, built with Next.js, Prisma, Tiptap, and SQLite.

**Live features:** Rich text editing · Auto-save · Document sharing · File import (.txt / .md) · PDF export · Delete documents

---

## Local Setup

```bash
# 1. Clone and install dependencies
npm install

# 2. Create the SQLite database and push the schema
npx prisma db push

# 3. Seed the database with two mock users (Owner & Collaborator)
npx prisma db seed

# 4. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll see the landing page.

Click **Get Started** to go to `/dashboard`.

> **File types supported for import:** `.txt` and `.md` only.

---

## Test Credentials

The seed script creates two users you can switch between using the dropdown in the header:

| Name | Email |
|---|---|
| **Owner** | owner@example.com |
| **Collaborator** | collaborator@example.com |

---

## Project Structure

```
doc-editor/
├── prisma/
│   ├── schema.prisma     ← Data models (User, Document, DocumentShare)
│   ├── seed.ts           ← Seeds Owner & Collaborator users
│   └── dev.db            ← SQLite database (auto-created by db push)
├── src/
│   ├── app/
│   │   ├── page.tsx              ← Landing page (/)
│   │   ├── dashboard/page.tsx    ← Dashboard (/dashboard)
│   │   ├── docs/[id]/page.tsx    ← Document editor
│   │   └── api/
│   │       ├── users/            ← GET /api/users
│   │       └── documents/        ← CRUD + share endpoints
│   ├── components/
│   │   ├── Header.tsx            ← Nav with user switcher
│   │   ├── Editor.tsx            ← Tiptap rich text editor
│   │   └── ShareModal.tsx        ← Share document modal
│   └── lib/
│       ├── prisma.ts             ← Singleton PrismaClient
│       └── AuthContext.tsx       ← Mocked auth context
├── ARCHITECTURE.md
├── SUBMISSION.md
└── README.md
```

---

## Available Scripts

```bash
npm run dev          # Start dev server at http://localhost:3000
npm run build        # Production build
npm run start        # Serve production build
npm run test         # Run Jest tests
npx prisma studio    # Open Prisma Studio (database GUI)
```

---

## Architecture Note

- **Next.js (App Router):** Collocates API routes and React components in one repo, eliminating the need for a separate backend service.
- **Prisma + SQLite:** Zero-config local database. Switching to Postgres requires only changing one line in `schema.prisma`.
- **Tiptap:** Headless rich text editor built on ProseMirror, giving full control over UI and HTML output for clean persistence.

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the full technical deep-dive.

---

## AI-Native Workflow Note

**Tools used:** Antigravity (powered by Google Gemini / Claude).

**Where AI sped up work:** Antigravity autonomously generated the entire boilerplate: Next.js project structure, Prisma schema and seed script, all API routes, the Tiptap editor wrapper with toolbar, the Share modal, CSS styles, Jest test suite, and all documentation files — in a single session.

**What was changed or rejected:** The AI initially attempted to use Prisma v8's `prisma init` (which uses a new JSON-based config format). I redirected it to install Prisma v5 for compatibility with the existing Next.js 14 setup. I also scoped it away from generating WebSocket/Yjs real-time collaboration logic, opting for a simpler debounced auto-save approach that is more appropriate for the timebox.

**How correctness was verified:** 
1. The build (`npm run build`) was run iteratively with each set of fixes applied until it passed cleanly.
2. Three Jest/React Testing Library tests were written and verified to pass (`npm run test`).
3. The Prisma schema was reviewed manually for correct 1-to-many and many-to-many relations and cascade delete behaviour.
4. The sharing flow was manually tested by switching between Owner and Collaborator using the header dropdown.
