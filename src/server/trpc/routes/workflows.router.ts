import { router } from '../index'
import { isAdmin } from './_helpers'
import { createWorkflowSchema, updateWorkflowMetricsSchema, toggleWorkflowStatusSchema } from '@/schemas/workflow'
import { organizationIdSchema } from '@/schemas/common'

/**
 * Workflows procedures for managing workflows.
 * All procedures require ADMIN role.
 */
export const workflowsRouter = router({
  /**
   * Create a new workflow
   */
  create: isAdmin
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
   */
  updateMetrics: isAdmin
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
   */
  toggleStatus: isAdmin
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