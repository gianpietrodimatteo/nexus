import { z } from 'zod'

/**
 * Common schemas shared across multiple domains
 */

/**
 * Schema for organization ID input (used frequently across routes)
 */
export const organizationIdSchema = z.object({
  organizationId: z.string().min(1, 'Organization ID is required'),
})

/**
 * Schema for generic ID input
 */
export const idSchema = z.object({
  id: z.string().min(1, 'ID is required'),
})

/**
 * Schema for pagination
 */
export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
})

/**
 * Schema for search/filter inputs
 */
export const searchSchema = z.object({
  search: z.string().optional(),
})

/**
 * Schema for date range filtering
 */
export const dateRangeSchema = z.object({
  startDate: z.date().optional(),
  endDate: z.date().optional(),
})

// Export TypeScript types
export type OrganizationIdInput = z.infer<typeof organizationIdSchema>
export type IdInput = z.infer<typeof idSchema>
export type PaginationInput = z.infer<typeof paginationSchema>
export type SearchInput = z.infer<typeof searchSchema>
export type DateRangeInput = z.infer<typeof dateRangeSchema>