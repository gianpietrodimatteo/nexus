import { z } from 'zod'
import { router } from '../index'
import { isAdmin } from './_helpers'

/**
 * Admin clients procedures for managing client organizations and their data.
 * All procedures require ADMIN role.
 */
export const adminClientsRouter = router({
  /**
   * Get organization details with assigned support engineers
   */
  getOrganization: isAdmin
    .input(z.object({ organizationId: z.string() }))
    .query(async ({ input, ctx }) => {
      const organization = await ctx.prisma.organization.findUniqueOrThrow({
        where: { id: input.organizationId },
        include: {
          assignedSEs: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          subscriptionPlan: {
            select: {
              name: true,
              pricingModel: true,
            },
          },
        },
      })

      return organization
    }),

  /**
   * Get document links for an organization
   */
  getDocumentLinks: isAdmin
    .input(z.object({ organizationId: z.string() }))
    .query(async ({ input, ctx }) => {
      const documentLinks = await ctx.prisma.documentLink.findMany({
        where: { organizationId: input.organizationId },
        orderBy: { type: 'asc' },
      })

      return documentLinks
    }),

  /**
   * Get pipeline progress for an organization
   */
  getPipelineProgress: isAdmin
    .input(z.object({ organizationId: z.string() }))
    .query(async ({ input, ctx }) => {
      const organization = await ctx.prisma.organization.findUniqueOrThrow({
        where: { id: input.organizationId },
        select: {
          pipelinePhase: true,
        },
      })

      const pipelinePhases = await ctx.prisma.pipelinePhaseLog.findMany({
        where: { organizationId: input.organizationId },
        orderBy: { createdAt: 'asc' },
      })

      return {
        currentPhase: organization.pipelinePhase,
        completedPhases: pipelinePhases,
      }
    }),

  /**
   * Get workflows for an organization
   */
  getWorkflows: isAdmin
    .input(z.object({ organizationId: z.string() }))
    .query(async ({ input, ctx }) => {
      const workflows = await ctx.prisma.workflow.findMany({
        where: { organizationId: input.organizationId },
        include: {
          department: {
            select: {
              name: true,
            },
          },
          _count: {
            select: {
              executions: true,
              exceptions: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      })

      return workflows
    }),

  /**
   * Get client users for an organization
   */
  getClientUsers: isAdmin
    .input(z.object({ organizationId: z.string() }))
    .query(async ({ input, ctx }) => {
      const users = await ctx.prisma.user.findMany({
        where: {
          organizationId: input.organizationId,
          role: 'CLIENT',
        },
        include: {
          organization: {
            select: {
              id: true,
              name: true,
            },
          },
          department: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { name: 'asc' },
      })

      // Remove password from response
      return users.map(({ password, ...user }) => user)
    }),
})
