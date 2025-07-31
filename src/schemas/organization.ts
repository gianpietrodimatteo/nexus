import { z } from 'zod'

/**
 * Organization-related schemas
 */

/**
 * Pipeline phases enum
 */
export const pipelinePhaseSchema = z.enum([
  'DISCOVERY_INITIAL_SURVEY',
  'DISCOVERY_PROCESS_DEEP_DIVE', 
  'ADA_PROPOSAL_SENT',
  'ADA_PROPOSAL_REVIEW_DONE',
  'ADA_CONTRACT_SENT',
  'ADA_CONTRACT_SIGNED',
  'CREDENTIALS_COLLECTED',
  'FACTORY_BUILD_INITIATED',
  'TEST_PLAN_GENERATED',
  'TESTING_STARTED',
  'PRODUCTION_DEPLOY'
])

/**
 * Organization status enum
 */
export const organizationStatusSchema = z.enum([
  'ACTIVE',
  'INACTIVE',
  'SUSPENDED',
  'PENDING_SETUP'
])

/**
 * Schema for creating a new organization
 */
export const createOrganizationSchema = z.object({
  name: z.string().min(1, 'Organization name is required'),
  domain: z.string().optional(),
  industry: z.string().optional(),
  size: z.number().int().positive().optional(),
  status: organizationStatusSchema.default('PENDING_SETUP'),
  pipelinePhase: pipelinePhaseSchema.default('DISCOVERY_INITIAL_SURVEY'),
  subscriptionPlanId: z.string().optional(),
  billingEmail: z.string().email().optional(),
  notes: z.string().optional(),
})

/**
 * Schema for updating an organization
 */
export const updateOrganizationSchema = z.object({
  id: z.string().min(1, 'Organization ID is required'),
  name: z.string().min(1, 'Organization name is required').optional(),
  domain: z.string().optional(),
  industry: z.string().optional(),
  size: z.number().int().positive().optional(),
  status: organizationStatusSchema.optional(),
  pipelinePhase: pipelinePhaseSchema.optional(),
  subscriptionPlanId: z.string().nullish(),
  billingEmail: z.string().email().optional(),
  notes: z.string().optional(),
})

/**
 * Schema for organization list filtering
 */
export const organizationListFilterSchema = z.object({
  status: organizationStatusSchema.optional(),
  pipelinePhase: pipelinePhaseSchema.optional(),
  search: z.string().optional(),
  subscriptionPlanId: z.string().optional(),
  hasActiveUsers: z.boolean().optional(),
})

/**
 * Schema for updating pipeline phase
 */
export const updatePipelinePhaseSchema = z.object({
  organizationId: z.string().min(1, 'Organization ID is required'),
  phase: pipelinePhaseSchema,
  notes: z.string().optional(),
})

/**
 * Schema for assigning support engineers
 */
export const assignSupportEngineersSchema = z.object({
  organizationId: z.string().min(1, 'Organization ID is required'),
  supportEngineerIds: z.array(z.string()).min(1, 'At least one support engineer must be assigned'),
})

// Export TypeScript types
export type PipelinePhase = z.infer<typeof pipelinePhaseSchema>
export type OrganizationStatus = z.infer<typeof organizationStatusSchema>
export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>
export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>
export type OrganizationListFilter = z.infer<typeof organizationListFilterSchema>
export type UpdatePipelinePhaseInput = z.infer<typeof updatePipelinePhaseSchema>
export type AssignSupportEngineersInput = z.infer<typeof assignSupportEngineersSchema>