# TRPC Routers & Zod Schema Organization

This document defines how we structure backend API contracts (tRPC) and validation schemas (Zod) in the Nexus monorepo.

## 1. Folder Overview

```
src/
├─ schemas/                     # shared, multi-use Zod shapes
│   ├─ user.ts                 # User management schemas
│   ├─ client-user.ts          # Client user schemas
│   ├─ workflow.ts             # Workflow schemas (example)
│   └─ index.ts                # barrel re-export

src/server/trpc/
├─ index.ts                    # context + initTRPC
├─ routes/                     # domain-based modular routers
│   ├─ _helpers.ts             # role middlewares (isAdmin, isSE, isClient)
│   ├─ auth.router.ts          # Authentication & session management
│   ├─ users.router.ts         # User management (Admin/SE users)
│   ├─ clients.router.ts       # Client organization management
│   ├─ client-users.router.ts  # Client user management
│   ├─ organizations.router.ts # Organization management
│   ├─ workflows.router.ts     # Workflow management (example)
│   ├─ dashboard.router.ts     # Dashboard data aggregation
│   └─ billing.router.ts       # Billing & invoicing
├─ appRouter.ts                # merges all domain routers
└─ context.ts                  # tRPC context with RBAC-aware Prisma
```

## 2. Zod Schema Rules

* **Shared contracts** (used in ≥ 2 places) live in `src/schemas`.
* **Page-specific schemas** can be co-located in page component folders if only used once.
* Schemas are pure validation & typing – **no React, Next, or Prisma imports**.
* Derive TypeScript types with `z.infer<typeof schema>` on both server & client.

### Example

```ts
// src/schemas/user.ts
import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  role: z.enum(['ADMIN', 'SE', 'CLIENT']),
  organizationId: z.string().uuid().optional()
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
```

```ts
// src/server/trpc/routes/users.router.ts
import { router, protectedProcedure } from '../index';
import { isAdmin, isSE } from './_helpers';
import { createUserSchema } from '@/schemas/user';

export const usersRouter = router({
  create: isAdmin.or(isSE)
    .input(createUserSchema)
    .mutation(async ({ ctx, input }) => {
      // implementation with automatic RBAC filtering
    })
});
```

## 3. TRPC Router Guidelines

1. **One router per domain** (file). Keep files under 300 LOC.
2. **Domain-based organization**: Organize by business domain (users, clients, workflows) rather than user role.
3. Expose procedures with verb-based names: `list`, `get`, `create`, `update`, `delete`.
4. Use shared middlewares from `_helpers.ts` for role gating (e.g., `isAdmin`, `isSE`, `isClient`).
5. The central `appRouter.ts` combines domain routers at the top level:

```ts
export const appRouter = router({
  auth: authRouter,
  users: usersRouter,              // User management (Admin/SE users)
  clients: clientsRouter,          // Client organization management  
  clientUsers: clientUsersRouter,  // Client user management
  organizations: organizationsRouter,
  workflows: workflowsRouter,      // Example domain router
  dashboard: dashboardRouter,      // Dashboard data aggregation
  billing: billingRouter,
});
```

`AppRouter` is the single export used by React-Query hooks and server handlers. Each domain router handles its own RBAC through middleware composition.

## 4. API Handler

`src/app/api/trpc/[trpc]/route.ts` exposes the API once via `fetchRequestHandler` with the `appRouter` and `createContext`.

---

Follow this structure to keep contracts discoverable, type-safe, and DRY.
