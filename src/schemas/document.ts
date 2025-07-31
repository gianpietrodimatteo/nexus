import { z } from 'zod'

/**
 * Document and document link related schemas
 */

/**
 * Document link type enum (based on the component we created)
 */
export const documentLinkTypeSchema = z.enum([
  'SURVEY_QUESTIONS',
  'SURVEY_RESULTS',
  'PROCESS_DOCUMENTATION', 
  'ADA_PROPOSAL',
  'CONTRACT',
  'FACTORY_MARKDOWN',
  'TEST_PLAN',
  'OTHER'
])

/**
 * Document access level enum
 */
export const documentAccessLevelSchema = z.enum([
  'PUBLIC',
  'ORGANIZATION_ONLY',
  'ADMIN_ONLY',
  'SE_ONLY'
])

/**
 * Schema for creating a document link
 */
export const createDocumentLinkSchema = z.object({
  organizationId: z.string().min(1, 'Organization ID is required'),
  type: documentLinkTypeSchema,
  url: z.string().url('Invalid URL format'),
  title: z.string().min(1, 'Title is required').optional(),
  description: z.string().optional(),
  accessLevel: documentAccessLevelSchema.default('ORGANIZATION_ONLY'),
  isRequired: z.boolean().default(false),
})

/**
 * Schema for updating a document link
 */
export const updateDocumentLinkSchema = z.object({
  id: z.string().min(1, 'Document link ID is required'),
  type: documentLinkTypeSchema.optional(),
  url: z.string().url('Invalid URL format').optional(),
  title: z.string().min(1, 'Title is required').optional(),
  description: z.string().optional(),
  accessLevel: documentAccessLevelSchema.optional(),
  isRequired: z.boolean().optional(),
})

/**
 * Schema for bulk updating document links for an organization
 */
export const bulkUpdateDocumentLinksSchema = z.object({
  organizationId: z.string().min(1, 'Organization ID is required'),
  documentLinks: z.array(z.object({
    type: documentLinkTypeSchema,
    url: z.string().url('Invalid URL format'),
    title: z.string().optional(),
    description: z.string().optional(),
  })).min(1, 'At least one document link is required'),
})

/**
 * Schema for document link list filtering
 */
export const documentLinkListFilterSchema = z.object({
  organizationId: z.string().optional(),
  type: documentLinkTypeSchema.optional(),
  accessLevel: documentAccessLevelSchema.optional(),
  isRequired: z.boolean().optional(),
  search: z.string().optional(),
})

/**
 * Schema for deleting a document link
 */
export const deleteDocumentLinkSchema = z.object({
  id: z.string().min(1, 'Document link ID is required'),
})

/**
 * Schema for reordering document links
 */
export const reorderDocumentLinksSchema = z.object({
  organizationId: z.string().min(1, 'Organization ID is required'),
  orderedIds: z.array(z.string()).min(1, 'At least one document ID is required'),
})

// Export TypeScript types
export type DocumentLinkType = z.infer<typeof documentLinkTypeSchema>
export type DocumentAccessLevel = z.infer<typeof documentAccessLevelSchema>
export type CreateDocumentLinkInput = z.infer<typeof createDocumentLinkSchema>
export type UpdateDocumentLinkInput = z.infer<typeof updateDocumentLinkSchema>
export type BulkUpdateDocumentLinksInput = z.infer<typeof bulkUpdateDocumentLinksSchema>
export type DocumentLinkListFilter = z.infer<typeof documentLinkListFilterSchema>
export type DeleteDocumentLinkInput = z.infer<typeof deleteDocumentLinkSchema>
export type ReorderDocumentLinksInput = z.infer<typeof reorderDocumentLinksSchema>