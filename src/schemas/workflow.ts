import { z } from 'zod'

/**
 * Workflow-related schemas
 */

/**
 * Workflow status enum
 */
export const workflowStatusSchema = z.enum([
  'ACTIVE',
  'INACTIVE',
  'DRAFT',
  'ARCHIVED'
])

/**
 * Schema for creating a new workflow
 */
export const createWorkflowSchema = z.object({
  name: z.string().min(1, 'Workflow name is required'),
  description: z.string().optional(),
  organizationId: z.string().min(1, 'Organization ID is required'),
  departmentId: z.string().optional(),
  nodeCount: z.number().int().min(0).default(0),
  timeSavedPerExecution: z.number().int().positive().optional(),
  moneySavedPerExecution: z.number().positive().optional(),
  isActive: z.boolean().default(true),
})

/**
 * Schema for updating a workflow
 */
export const updateWorkflowSchema = z.object({
  id: z.string().min(1, 'Workflow ID is required'),
  name: z.string().min(1, 'Workflow name is required').optional(),
  description: z.string().optional(),
  departmentId: z.string().nullish(),
  nodeCount: z.number().int().min(0).optional(),
  timeSavedPerExecution: z.number().int().positive().nullish(),
  moneySavedPerExecution: z.number().positive().nullish(),
  isActive: z.boolean().optional(),
})

/**
 * Schema for workflow list filtering
 */
export const workflowListFilterSchema = z.object({
  organizationId: z.string().optional(),
  departmentId: z.string().optional(),
  isActive: z.boolean().optional(),
  search: z.string().optional(),
  hasExecutions: z.boolean().optional(),
  minNodeCount: z.number().int().min(0).optional(),
  maxNodeCount: z.number().int().min(0).optional(),
})

/**
 * Schema for updating workflow performance metrics
 */
export const updateWorkflowMetricsSchema = z.object({
  id: z.string().min(1, 'Workflow ID is required'),
  timeSavedPerExecution: z.number().int().positive().nullish(),
  moneySavedPerExecution: z.number().positive().nullish(),
})

/**
 * Schema for toggling workflow status
 */
export const toggleWorkflowStatusSchema = z.object({
  id: z.string().min(1, 'Workflow ID is required'),
  isActive: z.boolean(),
})

/**
 * Schema for workflow execution statistics
 */
export const workflowStatsFilterSchema = z.object({
  workflowId: z.string().optional(),
  organizationId: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
})

/**
 * Schema for batch workflow operations
 */
export const batchWorkflowOperationSchema = z.object({
  workflowIds: z.array(z.string()).min(1, 'At least one workflow ID is required'),
  operation: z.enum(['activate', 'deactivate', 'delete', 'archive']),
})

// Export TypeScript types
export type WorkflowStatus = z.infer<typeof workflowStatusSchema>
export type CreateWorkflowInput = z.infer<typeof createWorkflowSchema>
export type UpdateWorkflowInput = z.infer<typeof updateWorkflowSchema>
export type WorkflowListFilter = z.infer<typeof workflowListFilterSchema>
export type UpdateWorkflowMetricsInput = z.infer<typeof updateWorkflowMetricsSchema>
export type ToggleWorkflowStatusInput = z.infer<typeof toggleWorkflowStatusSchema>
export type WorkflowStatsFilter = z.infer<typeof workflowStatsFilterSchema>
export type BatchWorkflowOperationInput = z.infer<typeof batchWorkflowOperationSchema>