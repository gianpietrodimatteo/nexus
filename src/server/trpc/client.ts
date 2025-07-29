import { initTRPC, TRPCError } from '@trpc/server'
import { type Context } from './context'

const t = initTRPC.context<Context>().create()

export const router = t.router
export const publicProcedure = t.procedure

/**
 * Protected procedure that requires authentication.
 * Throws an error if the user is not authenticated.
 */
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  return next({
    ctx: {
      ...ctx,
      // Ensure session is non-null in protected procedures
      session: ctx.session,
    },
  })
}) 