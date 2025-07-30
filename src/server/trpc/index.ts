import { initTRPC, TRPCError } from '@trpc/server'
import { type Context } from './context'

/**
 * Initialize tRPC with project-wide context.
 * Exports: router, publicProcedure, protectedProcedure.
 */
const t = initTRPC.context<Context>().create()

export const router = t.router
export const publicProcedure = t.procedure

/**
 * Protected procedure that requires a valid user session.
 * Throws UNAUTHORIZED if `ctx.session` is null.
 */
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  return next({
    ctx: {
      ...ctx,
      // assert non-null session downstream
      session: ctx.session,
    },
  })
})
