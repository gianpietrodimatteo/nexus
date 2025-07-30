import { TRPCError } from '@trpc/server'
import { protectedProcedure } from '../index'

/**
 * Middleware that ensures the user has ADMIN role.
 */
export const isAdmin = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.session.user.role !== 'ADMIN') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' })
  }
  return next({ ctx })
})

/**
 * Middleware that ensures the user has SE (Solutions Engineer) role.
 */
export const isSE = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.session.user.role !== 'SE') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'SE access required' })
  }
  return next({ ctx })
})

/**
 * Middleware that ensures the user has CLIENT role.
 */
export const isClient = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.session.user.role !== 'CLIENT') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Client access required' })
  }
  return next({ ctx })
})

/**
 * Middleware that allows both ADMIN and SE roles.
 */
export const isAdminOrSE = protectedProcedure.use(({ ctx, next }) => {
  if (!['ADMIN', 'SE'].includes(ctx.session.user.role)) {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin or SE access required' })
  }
  return next({ ctx })
})
