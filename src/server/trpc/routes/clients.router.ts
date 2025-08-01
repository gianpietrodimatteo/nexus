import { router } from '../index'
import { isAdmin, isAdminOrSE } from './_helpers'
import { organizationIdSchema } from '@/schemas/common'

/**
 * Client organization procedures for managing client organizations and their data.
 * ADMIN: Full access to all client organizations
 * SE: Access to their assigned client organizations (automatically filtered by RBAC guard)
 */
export const clientsRouter = router({
  /**
   * Get organization details with assigned support engineers
   * ADMIN: Can get any organization
   * SE: Can get their assigned organizations (automatically filtered by RBAC guard)
   */
  getOrganization: isAdminOrSE
    .input(organizationIdSchema)
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
   * ADMIN: Can get document links for any organization
   * SE: Can get document links for their assigned organizations (automatically filtered by RBAC guard)
   */
  getDocumentLinks: isAdminOrSE
    .input(organizationIdSchema)
    .query(async ({ input, ctx }) => {
      const documentLinks = await ctx.prisma.documentLink.findMany({
        where: { organizationId: input.organizationId },
        orderBy: { type: 'asc' },
      })

      return documentLinks
    }),

  /**
   * Get pipeline progress for an organization
   * ADMIN: Can get pipeline progress for any organization
   * SE: Can get pipeline progress for their assigned organizations (automatically filtered by RBAC guard)
   */
  getPipelineProgress: isAdminOrSE
    .input(organizationIdSchema)
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
   * ADMIN: Can get workflows for any organization
   * SE: Can get workflows for their assigned organizations (automatically filtered by RBAC guard)
   */
  getWorkflows: isAdminOrSE
    .input(organizationIdSchema)
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
   * ADMIN: Can get client users for any organization
   * SE: Can get client users for their assigned organizations (automatically filtered by RBAC guard)
   */
  getClientUsers: isAdminOrSE
    .input(organizationIdSchema)
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
