import { router } from './index'
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server'

// Sub-routers
import { authRouter } from './routes/auth.router'
import { billingRouter } from './routes/billing.router'
import { adminDashboardRouter } from './routes/admin/dashboard.router'
import { adminClientsRouter } from './routes/admin/clients.router'
import { adminUsersRouter } from './routes/admin/users.router'
import { adminClientUsersRouter } from './routes/admin/client-users.router'
import { adminOrganizationsRouter } from './routes/admin/organizations.router'
import { clientDashboardRouter } from './routes/client/dashboard.router'
import { clientWorkflowsRouter } from './routes/client/workflows.router'

/**
 * Main application router that composes all feature routers.
 * This is the single entry point for all tRPC procedures.
 */
export const appRouter = router({
  auth: authRouter,
  admin: router({
    dashboard: adminDashboardRouter,
    clients: adminClientsRouter,
    users: adminUsersRouter,
    clientUsers: adminClientUsersRouter,
    organizations: adminOrganizationsRouter,
  }),
  client: router({
    dashboard: clientDashboardRouter,
    workflows: clientWorkflowsRouter,
  }),
  billing: billingRouter,
})

export type AppRouter = typeof appRouter
export type RouterInputs = inferRouterInputs<AppRouter>
export type RouterOutputs = inferRouterOutputs<AppRouter>
