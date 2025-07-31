import { router } from './index'
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server'

// Domain-based routers
import { authRouter } from './routes/auth.router'
import { billingRouter } from './routes/billing.router'
import { adminDashboardRouter } from './routes/dashboard.router'
import { adminClientsRouter } from './routes/clients.router'
import { usersRouter } from './routes/users.router'
import { adminOrganizationsRouter } from './routes/organizations.router'

/**
 * Main application router that composes all domain routers.
 * This is the single entry point for all tRPC procedures.
 * Organized by business domain rather than user role.
 */
export const appRouter = router({
  auth: authRouter,
  users: usersRouter,
  clients: adminClientsRouter,
  organizations: adminOrganizationsRouter,
  dashboard: adminDashboardRouter,
  billing: billingRouter,
})

export type AppRouter = typeof appRouter
export type RouterInputs = inferRouterInputs<AppRouter>
export type RouterOutputs = inferRouterOutputs<AppRouter>
