# TRPC Routers & Zod Schema Organization

This document defines how we structure backend API contracts (tRPC) and validation schemas (Zod) in the Nexus monorepo.

## 1. Folder Overview

```
src/
├─ schemas/                # shared, multi-use Zod shapes
│   ├─ auth.ts             # loginCredentialsSchema, sessionSchema
│   ├─ pagination.ts       # cursorPaginationSchema
│   ├─ billing.ts          # invoiceInputSchema
│   └─ index.ts            # barrel re-export
└─ features/
    └─ clients/
        ├─ clientSchema.ts # createClientSchema (feature-specific)
        └─ clients-table.tsx

src/server/trpc/
├─ index.ts          # context + initTRPC
├─ routes/           # modular routers
│   ├─ _helpers.ts   # role middlewares (isAdmin, isSE …)
│   ├─ auth.router.ts
│   ├─ admin/
│   │   ├─ dashboard.router.ts
│   │   ├─ clients.router.ts
│   │   └─ users.router.ts
│   ├─ client/
│   │   ├─ dashboard.router.ts
│   │   └─ workflows.router.ts
│   └─ billing.router.ts
└─ appRouter.ts      # merges everything + exports types
```

## 2. Zod Schema Rules

* **Shared contracts** (used in ≥ 2 places) live in `src/schemas`.
* **Feature-specific schemas** stay next to the feature under `src/features/*`.
* Schemas are pure validation & typing – **no React, Next, or Prisma imports**.
* Derive TypeScript types with `z.infer<typeof schema>` on both server & client.

### Example

```ts
// src/schemas/auth.ts
import { z } from 'zod';

export const loginCredentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export type LoginCredentials = z.infer<typeof loginCredentialsSchema>;
```

```ts
// src/server/trpc/routes/auth.router.ts
import { router, publicProcedure } from '../index';
import { loginCredentialsSchema } from '@/schemas/auth';

export const authRouter = router({
  login: publicProcedure
    .input(loginCredentialsSchema)
    .mutation(async ({ input }) => {
      // implementation…
    })
});
```

## 3. TRPC Router Guidelines

1. **One router per domain** (file). Keep files under 300 LOC.
2. Group routers under `admin/`, `client/`, or top-level according to route grouping.
3. Expose procedures with verb-based names: `list`, `get`, `create`, `update`, `delete`.
4. Use shared middlewares from `_helpers.ts` for role gating (e.g., `isAdmin`).
5. The central `appRouter.ts` nests sub-routers to mirror public API surface:

```ts
export const appRouter = router({
  auth: authRouter,
  admin: router({
    dashboard: adminDashboardRouter,
    clients: adminClientsRouter,
    users: adminUsersRouter
  }),
  client: router({
    dashboard: clientDashboardRouter,
    workflows: clientWorkflowsRouter
  })
});
```

`AppRouter` is the single export used by React-Query hooks and server handlers.

## 4. API Handler

`src/app/api/trpc/[trpc]/route.ts` exposes the API once via `fetchRequestHandler` with the `appRouter` and `createContext`.

---

Follow this structure to keep contracts discoverable, type-safe, and DRY.
