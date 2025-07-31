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
│  ├─ components/              # Re‑usable UI components
│  │  ├─ ui/                  # shadcn/ui components (basic building blocks)
│  │  ├─ app-sidebar.tsx      # Global navigation
│  │  ├─ site-header.tsx      # Global header
│  │  ├─ data-table.tsx       # Reusable table component
│  │  └─ ...                  # Other shared components
│  ├─ schemas/                # Zod validation schemas
│  │  ├─ index.ts             # Barrel exports
│  │  ├─ user.ts              # User-related schemas
│  │  └─ client-user.ts       # Client user schemas
│  │
│  ├─ server/                  # Code that never ships to the browser
│  │  ├─ trpc/
│  │  │  │   ├─ index.ts          # context + initTRPC
│  │  │  │   ├─ routes/           # domain-based modular routers
│  │  │  │   │   ├─ _helpers.ts   # role middlewares
│  │  │  │   │   ├─ auth.router.ts    # authentication
│  │  │  │   │   ├─ users.router.ts   # user management
│  │  │  │   │   ├─ clients.router.ts # client organizations
│  │  │  │   │   ├─ client-users.router.ts # client user management
│  │  │  │   │   ├─ organizations.router.ts # organization management
│  │  │  │   │   ├─ dashboard.router.ts # dashboard data
│  │  │  │   │   └─ billing.router.ts # billing & invoicing
│  │  │  │   └─ appRouter.ts      # merges all domain routers
│  │  ├─ prisma/               # Prisma singleton + DB helpers
│  │  │  ├─ client.ts          # Prisma client + RBAC factory
│  │  │  └─ middleware/        # Prisma extensions & middleware
│  │  │     └─ rbacGuard.ts    # Automatic organization filtering
│  │  └─ auth/                 # next‑auth config, RBAC utilities
│  │     ├─ config.ts          # NextAuth configuration
│  │     ├─ getAllowedOrgs.ts  # RBAC organization computation
│  │     └─ types.ts           # Authentication types
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
| **`src/app`**    | Route handlers, layouts, pages, metadata, page-specific components.                | Cross-cutting utilities (go in `lib/`) or shared components.                 |
| **`components`** | Shared/reusable UI components used across multiple pages.                          | Business logic, data‑fetching, tRPC hooks, page-specific components.        |
| **`schemas`**    | Zod validation schemas shared across frontend and backend.                         | React components, database models, API logic.                               |
| **`server`**     | Backend‑only code: tRPC routers, auth, Prisma client.                              | React UI (never imported by the browser).                                    |
| **`lib`**        | Tiny utility functions with *zero* React/Next.js dependencies.                     | Anything that touches the database or DOM.                                   |
| **`hooks`**      | Generic React hooks consumable by any component.                                   | Page-specific hooks (keep those co‑located in page folders).                |
| **`styles`**     | Global Tailwind entry + any non‑component CSS.                                     | Component‑scoped styles (inline in component).                               |
| **`types`**      | Manual TypeScript types/enums shared across layers.                                | Generated types (Prisma Client lives in `node_modules/@prisma`).             |
| **`prisma`**     | Schema & migrations – **never edit SQL by hand**.                                  | Application logic.                                                           |

## Import Alias Cheatsheet

```typescript
import { Card } from '@/components/ui/card';
import { AppSidebar } from '@/components/app-sidebar';
import { createUserSchema } from '@/schemas/user';
import { auth } from '@/server/auth';
import { formatCurrency } from '@/lib/formatCurrency';
import { trpc } from '@/lib/trpc';
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

1. **Pages** in `src/app/(dashboard)/**` contain business logic and call **tRPC** procedures
2. **tRPC routers** in `src/server/trpc/routes/` handle API logic with automatic RBAC filtering
3. **Prisma Client** with RBAC guard (`src/server/prisma`) enforces data isolation
4. **Page components** compose UI from shared components (`src/components`) and page-specific components
5. **Layouts** provide persistent shells for seamless SPA experiences
6. **Schemas** in `src/schemas/` validate data across frontend and backend

Keep new files within these boundaries and the project stays coherent, testable, and easy to navigate.
