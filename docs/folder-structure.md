# Nexus Monorepo – Folder Structure Guide

This document is the single source of truth for **where files live and why**.
Everything you drop into the repo should fit one of the buckets below.

```
repo‑root/
├─ src/                         # All TypeScript/React source
│  ├─ app/                      # Next.js App Router
│  │  ├─ (dashboard)/           # Invisible route group – shared sidebar/topbar shell
│  │  │  ├─ layout.tsx         # <DashboardShell>
│  │  │  ├─ admin/             # /admin … Admin app
│  │  │  │  ├─ layout.tsx      # Admin‑specific nav / guard (optional)
│  │  │  │  ├─ page.tsx        # /admin  overview cards
│  │  │  │  ├─ users/          # /admin/users
│  │  │  │  └─ clients/        # /admin/clients (+ deep routes)
│  │  │  └─ client/            # /client … Client app
│  │  └─ (auth)/login/         # Auth pages kept out of dashboard chrome
│  │
│  ├─ components/              # Re‑usable dumb UI (Button, Card, TimelineStep)
│  ├─ features/                # Smart slices: UI + hooks + tRPC queries per domain
│  │  ├─ clients/
│  │  └─ users/
│  │
│  ├─ server/                  # Code that never ships to the browser
│  │  ├─ trpc/                 # Routers & procedure helpers
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

## High‑Level Flow

1. **Routes** in `src/app/**` call **tRPC** procedures (`src/server/trpc`)
2. Procedures use **Prisma Client** (`src/server/prisma`) to hit Postgres
3. React UI re‑uses presentation components from `src/components` and smart slices from `src/features`

Keep new files within these boundaries and the project stays coherent, testable, and easy to navigate.
