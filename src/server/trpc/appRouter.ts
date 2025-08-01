import { router } from './index'
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server'

// Domain-based routers
import { authRouter } from './routes/auth.router'
import { billingRouter } from './routes/billing.router'
import { dashboardRouter } from './routes/dashboard.router'
import { clientsRouter } from './routes/clients.router'
import { usersRouter } from './routes/users.router'
import { organizationsRouter } from './routes/organizations.router'
import { workflowsRouter } from './routes/workflows.router'
import { departmentsRouter } from './routes/departments.router'
import { exceptionsRouter } from './routes/exceptions.router'

/**
 * Main application router that composes all domain routers.
 * This is the single entry point for all tRPC procedures.
 * Organized by business domain rather than user role.
 */
export const appRouter = router({
  auth: authRouter,
  users: usersRouter,
  clients: clientsRouter,
  organizations: organizationsRouter,
  workflows: workflowsRouter,
  departments: departmentsRouter,
  dashboard: dashboardRouter,
  billing: billingRouter,
  exceptions: exceptionsRouter,
})

export type AppRouter = typeof appRouter
export type RouterInputs = inferRouterInputs<AppRouter>
export type RouterOutputs = inferRouterOutputs<AppRouter>
