import { router } from './client'

/**
 * Main tRPC router.
 * Add domain-specific routers here as the application grows.
 */
export const appRouter = router({
  // Example health check
  // health: publicProcedure.query(() => 'ok'),
})

export type AppRouter = typeof appRouter 