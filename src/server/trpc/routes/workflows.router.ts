import { router } from '../index'
import { isAdmin, isAdminOrSE } from './_helpers'
import { createWorkflowSchema, updateWorkflowMetricsSchema, toggleWorkflowStatusSchema } from '@/schemas/workflow'
import { organizationIdSchema } from '@/schemas/common'

/**
 * Workflows procedures for managing workflows.
 * ADMIN: Full access to workflows across all organizations
 * SE: Can manage workflows in their assigned organizations (automatically filtered by RBAC guard)
 */
export const workflowsRouter = router({
  /**
   * Create a new workflow
   * ADMIN: Can create workflows in any organization
   * SE: Can create workflows in their assigned organizations (automatically filtered by RBAC guard)
   */
  create: isAdminOrSE
    .input(createWorkflowSchema)
    .mutation(async ({ input, ctx }) => {
      const workflow = await ctx.prisma.workflow.create({
        data: {
          name: input.name,
          description: input.description,
          organizationId: input.organizationId,
          departmentId: input.departmentId || null,
          nodeCount: input.nodeCount,
          timeSavedPerExecution: input.timeSavedPerExecution || null,
          moneySavedPerExecution: input.moneySavedPerExecution || null,
          isActive: input.isActive,
        },
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
      })

      return workflow
    }),

  /**
   * Update workflow performance metrics
   * ADMIN: Can update metrics for workflows in any organization
   * SE: Can update metrics for workflows in their assigned organizations (automatically filtered by RBAC guard)
   */
  updateMetrics: isAdminOrSE
    .input(updateWorkflowMetricsSchema)
    .mutation(async ({ input, ctx }) => {
      const workflow = await ctx.prisma.workflow.update({
        where: { id: input.id },
        data: {
          timeSavedPerExecution: input.timeSavedPerExecution,
          moneySavedPerExecution: input.moneySavedPerExecution,
        },
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
      })

      return workflow
    }),

  /**
   * Toggle workflow active status
   * ADMIN: Can toggle status for workflows in any organization
   * SE: Can toggle status for workflows in their assigned organizations (automatically filtered by RBAC guard)
   */
  toggleStatus: isAdminOrSE
    .input(toggleWorkflowStatusSchema)
    .mutation(async ({ input, ctx }) => {
      const workflow = await ctx.prisma.workflow.update({
        where: { id: input.id },
        data: {
          isActive: input.isActive,
        },
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
      })

      return workflow
    }),
})