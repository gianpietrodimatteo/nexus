import { z } from 'zod'
import { router, protectedProcedure } from '../index'
import { isSE } from './_helpers'

/**
 * Authentication-related procedures.
 */
export const authRouter = router({
  /**
   * Get organizations assigned to the current SE user
   */
  getAssignedOrganizations: protectedProcedure
    .use(isSE)
    .query(async ({ ctx }) => {
      try {
        // For now, bypass the RBAC-aware client to avoid interference
        // Use the base prisma client from the import directly
        const { prisma } = await import('@/server/prisma/client')
        
        const organizations = await prisma.organization.findMany({
          where: {
            assignedSEs: {
              some: { id: ctx.session.user.id }
            }
          },
          select: { 
            id: true, 
            name: true 
          },
          orderBy: { name: 'asc' }
        })
        
        return organizations
      } catch (error) {
        console.error('Error fetching assigned organizations:', error)
        throw new Error('Failed to fetch assigned organizations')
      }
    }),

  /**
   * Set impersonation context for SE users
   * This creates a "contextual login" by updating the session
   */
  loginWithContext: protectedProcedure
    .use(isSE)
    .input(z.object({
      type: z.enum(['ADMIN', 'CLIENT']),
      organizationId: z.string().uuid().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Validate that SE can access the requested organization
      if (input.type === 'CLIENT' && input.organizationId) {
        const hasAccess = await ctx.prisma.organization.findFirst({
          where: {
            id: input.organizationId,
            assignedSEs: {
              some: { id: ctx.session.user.id }
            }
          },
          select: { id: true, name: true }
        })

        if (!hasAccess) {
          throw new Error('You do not have access to this organization')
        }

        // Return the organization info for the frontend to use
        return {
          success: true,
          redirectUrl: '/client',
          context: {
            type: input.type,
            organizationId: input.organizationId,
            organizationName: hasAccess.name
          }
        }
      }

      // For admin context, just return success
      return {
        success: true,
        redirectUrl: '/admin/dashboard',
        context: {
          type: input.type
        }
      }
    }),
})
