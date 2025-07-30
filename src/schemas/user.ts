import { z } from 'zod'

/**
 * Base user fields shared across all user types
 */
const baseUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.email('Invalid email address'),
  phone: z.string().optional(),
})

/**
 * User role filter schema
 */
export const userRoleFilterSchema = z.enum(['ADMIN', 'SE', 'CLIENT']).optional()

/**
 * Schema for creating a new user
 */
export const createUserSchema = z.object({
  ...baseUserSchema.shape,
  role: z.enum(['ADMIN', 'SE', 'CLIENT']),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  
  // SE-specific fields (conditional)
  hourlyRateCost: z.number().positive().optional(),
  hourlyRateBillable: z.number().positive().optional(),
  assignedOrganizationIds: z.array(z.string()).optional(),
  
  // Organization assignment (optional for admins)
  organizationId: z.string().optional(),
}).refine((data) => {
  // SE users must have hourly rates
  if (data.role === 'SE') {
    return data.hourlyRateCost && data.hourlyRateBillable
  }
  return true
}, {
  message: 'SE users must have both cost and billable hourly rates',
  path: ['hourlyRateCost']
})

/**
 * Schema for updating an existing user
 */
export const updateUserSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Name is required').optional(),
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().optional(),
  
  // SE-specific fields (conditional)
  hourlyRateCost: z.number().positive().optional(),
  hourlyRateBillable: z.number().positive().optional(),
  assignedOrganizationIds: z.array(z.string()).optional(),
  
  // Organization assignment
  organizationId: z.string().optional(),
}).refine((data) => {
  // If updating hourly rates for SE, both should be provided
  if (data.hourlyRateCost || data.hourlyRateBillable) {
    return data.hourlyRateCost && data.hourlyRateBillable
  }
  return true
}, {
  message: 'Both cost and billable hourly rates must be provided',
  path: ['hourlyRateCost']
})

/**
 * Schema for getting a user by ID
 */
export const getUserByIdSchema = z.object({
  id: z.string(),
})

/**
 * Schema for user list filtering
 */
export const userListFilterSchema = z.object({
  role: userRoleFilterSchema,
  organizationId: z.string().optional(),
  search: z.string().optional(),
})

/**
 * Schema for deleting a user
 */
export const deleteUserSchema = z.object({
  id: z.string(),
})

// Export TypeScript types
export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type UserListFilter = z.infer<typeof userListFilterSchema>
export type GetUserByIdInput = z.infer<typeof getUserByIdSchema>
export type DeleteUserInput = z.infer<typeof deleteUserSchema>