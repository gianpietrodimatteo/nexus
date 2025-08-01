import { z } from 'zod'

/**
 * Enums matching Prisma schema
 */
export const ExceptionTypeSchema = z.enum([
  'AUTHENTICATION',
  'DATA_PROCESS', 
  'INTEGRATION',
  'WORKFLOW_LOGIC',
  'BROWSER_AUTOMATION'
])

export const ExceptionSeveritySchema = z.enum([
  'CRITICAL',
  'HIGH', 
  'MEDIUM',
  'LOW'
])

export const ExceptionStatusSchema = z.enum([
  'NEW',
  'IN_PROGRESS',
  'RESOLVED', 
  'IGNORED'
])

export const NotificationMethodSchema = z.enum([
  'EMAIL',
  'SMS',
  'SLACK'
])

/**
 * Base exception schema
 */
export const exceptionSchema = z.object({
  id: z.string().cuid(),
  type: ExceptionTypeSchema,
  severity: ExceptionSeveritySchema,
  status: ExceptionStatusSchema,
  remedy: z.string().nullable(),
  workflowId: z.string().cuid(),
  organizationId: z.string().cuid(),
  departmentId: z.string().cuid().nullable(),
  reportedAt: z.date(),
  resolvedAt: z.date().nullable(),
})

/**
 * Exception notification schema
 */
export const exceptionNotificationSchema = z.object({
  id: z.string().cuid(),
  method: NotificationMethodSchema,
  recipient: z.string(),
  sentAt: z.date(),
  success: z.boolean(),
  error: z.string().nullable(),
  exceptionId: z.string().cuid(),
  userId: z.string().cuid().nullable(),
})

/**
 * Schema for creating an exception
 */
export const createExceptionSchema = z.object({
  type: ExceptionTypeSchema,
  severity: ExceptionSeveritySchema,
  remedy: z.string().optional(),
  workflowId: z.string().cuid(),
  departmentId: z.string().cuid().optional(),
})

/**
 * Schema for updating exception status
 */
export const updateExceptionStatusSchema = z.object({
  id: z.string().cuid(),
  status: ExceptionStatusSchema,
  remedy: z.string().optional(),
})

/**
 * Schema for exception filters
 */
export const exceptionFiltersSchema = z.object({
  organizationId: z.string().cuid().optional(), // Admin can filter by client
  type: ExceptionTypeSchema.optional(),
  severity: ExceptionSeveritySchema.optional(),
  status: ExceptionStatusSchema.optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
})

/**
 * Schema for exception list with pagination
 */
export const listExceptionsSchema = z.object({
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(20),
  sortBy: z.enum(['reportedAt', 'severity', 'status', 'type']).default('reportedAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  filters: exceptionFiltersSchema.optional(),
})

/**
 * Schema for sending exception notification
 */
export const sendExceptionNotificationSchema = z.object({
  exceptionId: z.string().cuid(),
  userIds: z.array(z.string().cuid()).min(1),
  methods: z.array(NotificationMethodSchema).min(1),
  message: z.string().optional(),
})

/**
 * Type exports
 */
export type Exception = z.infer<typeof exceptionSchema>
export type ExceptionNotification = z.infer<typeof exceptionNotificationSchema>
export type CreateExceptionInput = z.infer<typeof createExceptionSchema>
export type UpdateExceptionStatusInput = z.infer<typeof updateExceptionStatusSchema>
export type ExceptionFilters = z.infer<typeof exceptionFiltersSchema>
export type ListExceptionsInput = z.infer<typeof listExceptionsSchema>
export type SendExceptionNotificationInput = z.infer<typeof sendExceptionNotificationSchema>
export type ExceptionType = z.infer<typeof ExceptionTypeSchema>
export type ExceptionSeverity = z.infer<typeof ExceptionSeveritySchema>
export type ExceptionStatus = z.infer<typeof ExceptionStatusSchema>
export type NotificationMethod = z.infer<typeof NotificationMethodSchema>