import { z } from 'zod'

/**
 * Exception type enum schema
 */
export const exceptionTypeSchema = z.enum([
  'AUTHENTICATION',
  'DATA_PROCESS', 
  'INTEGRATION',
  'WORKFLOW_LOGIC',
  'BROWSER_AUTOMATION'
])

/**
 * Exception severity enum schema
 */
export const exceptionSeveritySchema = z.enum([
  'CRITICAL',
  'HIGH',
  'MEDIUM', 
  'LOW'
])

/**
 * Exception status enum schema
 */
export const exceptionStatusSchema = z.enum([
  'NEW',
  'IN_PROGRESS',
  'RESOLVED',
  'IGNORED'
])

/**
 * Schema for filtering exceptions list
 */
export const exceptionListFilterSchema = z.object({
  organizationId: z.string().optional(),
  type: exceptionTypeSchema.optional(),
  severity: exceptionSeveritySchema.optional(),
  status: exceptionStatusSchema.optional(),
  departmentId: z.string().optional(),
  workflowId: z.string().optional(),
  // Date range filters
  reportedAfter: z.date().optional(),
  reportedBefore: z.date().optional(),
  // Search
  search: z.string().optional(),
  // Pagination
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
  // Sorting
  sortBy: z.enum(['reportedAt', 'severity', 'status', 'organizationName', 'workflowName']).default('reportedAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
})

/**
 * Schema for updating exception status
 */
export const updateExceptionStatusSchema = z.object({
  id: z.string().cuid(),
  status: exceptionStatusSchema,
  remedy: z.string().optional()
})

/**
 * Schema for exception details
 */
export const exceptionDetailSchema = z.object({
  id: z.string(),
  type: exceptionTypeSchema,
  severity: exceptionSeveritySchema,
  status: exceptionStatusSchema,
  remedy: z.string().nullable(),
  reportedAt: z.date(),
  resolvedAt: z.date().nullable(),
  workflowId: z.string(),
  organizationId: z.string(),
  departmentId: z.string().nullable(),
})

/**
 * Type exports
 */
export type ExceptionType = z.infer<typeof exceptionTypeSchema>
export type ExceptionSeverity = z.infer<typeof exceptionSeveritySchema>
export type ExceptionStatus = z.infer<typeof exceptionStatusSchema>
export type ExceptionListFilter = z.infer<typeof exceptionListFilterSchema>
export type UpdateExceptionStatus = z.infer<typeof updateExceptionStatusSchema>
export type ExceptionDetail = z.infer<typeof exceptionDetailSchema>

/**
 * Helper functions for enum labels
 */
export const EXCEPTION_TYPE_LABELS: Record<ExceptionType, string> = {
  AUTHENTICATION: 'Authentication',
  DATA_PROCESS: 'Data process',
  INTEGRATION: 'Integration',
  WORKFLOW_LOGIC: 'Workflow logic',
  BROWSER_AUTOMATION: 'Browser automation'
}

export const EXCEPTION_SEVERITY_LABELS: Record<ExceptionSeverity, string> = {
  CRITICAL: 'Critical',
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low'
}

export const EXCEPTION_STATUS_LABELS: Record<ExceptionStatus, string> = {
  NEW: 'New',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
  IGNORED: 'Ignored'
}