# Submission Checklist

## What's Included

| Item | Status |
|---|---|
| Source code (Next.js + Prisma + Tiptap) | ✅ |
| README.md with setup instructions | ✅ |
| ARCHITECTURE.md (full technical note) | ✅ |
| AI-Native Workflow Note (in README.md) | ✅ |
| SUBMISSION.md (this file) | ✅ |
| .env.example | ✅ |
| Automated tests (Jest + RTL) | ✅ 3 passing |

## What Is Working (End-to-End)

- ✅ **Landing page** at `/` with feature overview and CTA
- ✅ **Dashboard** at `/dashboard` with "My Documents" and "Shared with Me" sections
- ✅ **Document creation** — new blank document, navigate to editor
- ✅ **File import** — upload `.txt` or `.md`, converts to editable document
- ✅ **Rich text editing** — Bold, Italic, Underline, Heading 1/2, Bullet list, Ordered list
- ✅ **Auto-save** — 1-second debounce saves title + content to SQLite
- ✅ **Document sharing** — owner-only Share modal, grants collaborator access
- ✅ **Shared with Me** — collaborator dashboard section populated correctly
- ✅ **Delete document** — owner-only, with confirmation dialog
- ✅ **Export to PDF** — browser native print-to-PDF via `window.print()`
- ✅ **Mock auth switcher** — switch between Owner and Collaborator in the header

## What Is Incomplete / Intentionally Omitted

| Feature | Decision |
|---|---|
| Real authentication | Mocked with `localStorage` + `x-user-id` header. Sufficient to demo the sharing model |
| Real-time collaboration (Yjs) | Would require WebSocket infra; auto-save is the pragmatic alternative |
| Markdown parsing on import | Files are treated as plain text; proper `remark` parsing would be a next step |
| Deployment URL | Not included — the project runs locally with zero config |

## Test Users

| Name | Email |
|---|---|
| Owner | owner@example.com |
| Collaborator | collaborator@example.com |

Switch between users using the dropdown in the top navigation.

## What I Would Build Next (with 2–4 more hours)

1. **Real-time presence indicators** — who else is viewing the document
2. **Document version history** — restore a previous version of content
3. **Markdown-aware import** — parse `.md` files with `remark` for proper heading/list rendering
4. **Role-based sharing** — view-only vs edit access in DocumentShare
