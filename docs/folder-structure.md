# Nexus Monorepo – Folder Structure Guide

This document is the single source of truth for **where files live and why**.
Everything you drop into the repo should fit one of the buckets below.

```
repo‑root/
├─ src/                         # All TypeScript/React source
│  ├─ app/                      # Next.js App Router
│  │  ├─ (dashboard)/           # Invisible route group – shared shell architecture
│  │  │  ├─ admin/             # /admin … Admin SPA with nested layouts
│  │  │  │  ├─ layout.tsx      # Admin shell (sidebar + header) – stays mounted
│  │  │  │  ├─ page.tsx        # /admin  overview dashboard
│  │  │  │  ├─ users/          # /admin/users
│  │  │  │  │  ├─ page.tsx     # User management page
│  │  │  │  │  └─ loading.tsx  # Loading skeleton for users
│  │  │  │  └─ clients/        # /admin/clients (+ deep routes)
│  │  │  │     ├─ page.tsx     # Client management page  
│  │  │  │     └─ loading.tsx  # Loading skeleton for clients
│  │  │  └─ client/            # /client … Client SPA with separate shell
│  │  │     ├─ layout.tsx      # Client shell (different nav) – stays mounted
│  │  │     ├─ page.tsx        # /client dashboard
│  │  │     └─ workflows/      # /client/workflows
│  │  │        ├─ page.tsx     # Workflow management
│  │  │        └─ loading.tsx  # Loading skeleton
│  │  └─ login/                # Auth pages kept out of dashboard chrome
│  │
│  ├─ components/              # Re‑usable dumb UI (Button, Card, TimelineStep)
│  │  └─ ui/                  # shadcn/ui components (skeleton.tsx includes variants)
│  ├─ features/                # Smart slices: UI + hooks + tRPC queries per domain
│  │  ├─ clients/
│  │  └─ users/
│  │
│  ├─ server/                  # Code that never ships to the browser
│  │  ├─ trpc/
│  │  │  │   ├─ index.ts          # context + initTRPC
│  │  │  │   ├─ routes/           # modular routers
│  │  │  │   │   ├─ _helpers.ts   # role middlewares
│  │  │  │   │   ├─ admin/…       # admin routers
│  │  │  │   │   └─ client/…      # client routers
│  │  │  │   └─ appRouter.ts      # merges all routers
│  │  ├─ prisma/               # Prisma singleton + DB helpers
│  │  └─ auth/                 # next‑auth config, RBAC utilities
│  │
│  ├─ lib/                     # Small, framework‑agnostic helpers (formatDate, slugify)
│  ├─ hooks/                   # Shared React hooks (useDebounce, useRole)
│  ├─ styles/                  # Global CSS, tailwind.css, shadcn theme tweaks
│  └─ types/                   # Hand‑written TypeScript types/enums
│
├─ prisma/                     # Data‑layer source of truth
│  ├─ schema.prisma            # Models & relations
│  ├─ migrations/              # Timestamped SQL folders (generated)
│  └─ seed.ts                  # Demo data script
│
├─ public/                     # Static assets served as‑is (logos, og.png)
├─ .github/                    # CI workflows, PR templates
├─ docker/                     # Optional compose files (postgres, pgAdmin)
├─ .cursorrules                # Coding style & repository conventions
└─ README.md                   # Project overview & setup
```

## Directory Responsibilities

| Folder           | Owns                                                                               | Never puts here                                                              |
| ---------------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| **`src/app`**    | Route handlers, layouts, pages, metadata.                                          | Business logic that isn't route‑specific (goes in `features/` or `server/`). |
| **`components`** | Pure presentational React components.                                              | Data‑fetching, Prisma calls, tRPC hooks.                                     |
| **`features`**   | End‑to‑end feature bundles: smart components, hooks, queries that belong together. | Cross‑cutting utilities (they live in `lib/`).                               |
| **`server`**     | Backend‑only code: tRPC routers, auth, Prisma client.                              | React UI (never imported by the browser).                                    |
| **`lib`**        | Tiny utility functions with *zero* React/Next.js dependencies.                     | Anything that touches the database or DOM.                                   |
| **`hooks`**      | Generic React hooks consumable by any feature.                                     | Feature‑specific hooks (keep those co‑located in `features/*`).              |
| **`styles`**     | Global Tailwind entry + any non‑component CSS.                                     | Component‑scoped styles (inline in component).                               |
| **`types`**      | Manual TypeScript types/enums shared across layers.                                | Generated types (Prisma Client lives in `node_modules/@prisma`).             |
| **`prisma`**     | Schema & migrations – **never edit SQL by hand**.                                  | Application logic.                                                           |

## Import Alias Cheatsheet

```typescript
import { Card } from '@/components/card';
import { ClientsTable } from '@/features/clients/clients-table';
import { auth } from '@/server/auth';
import { formatCurrency } from '@/lib/formatCurrency';
```

## Single-Page Application Architecture

We implement **nested layouts** to create seamless single-page experiences for both Admin and Client portals:

### Admin SPA (`/admin/*`)
- **Shell**: `admin/layout.tsx` provides persistent sidebar + header
- **Routes**: `/admin`, `/admin/users`, `/admin/clients` share the same shell
- **Navigation**: Smooth client-side routing with active state highlighting
- **Loading**: Per-route `loading.tsx` files for instant feedback

### Client SPA (`/client/*`)  
- **Shell**: `client/layout.tsx` provides separate navigation for clients
- **Routes**: `/client`, `/client/workflows` share the client shell
- **Isolation**: Completely separate experience from admin portal

### Key Benefits
- **Persistent Shell**: Sidebar/header stay mounted during navigation
- **Smooth UX**: Only page content re-renders, not the entire layout
- **Code Splitting**: Each page loads its own data and components
- **Active States**: Navigation automatically highlights current page
- **Reusable Loading**: Skeleton components provide consistent loading experiences

## High‑Level Flow

1. **Routes** in `src/app/**` call **tRPC** procedures (`src/server/trpc`)
2. Procedures use **Prisma Client** (`src/server/prisma`) to hit Postgres  
3. React UI re‑uses presentation components from `src/components` and smart slices from `src/features`
4. **Layouts** provide persistent shells for seamless SPA experiences

Keep new files within these boundaries and the project stays coherent, testable, and easy to navigate.
