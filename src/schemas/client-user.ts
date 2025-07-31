import { z } from 'zod'

/**
 * Base client user fields
 */
const baseClientUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.email('Invalid email address'),
  phone: z.string().optional(),
  billingAccess: z.boolean().default(false),
  adminAccess: z.boolean().default(false),
  notificationPreferences: z.any().optional(), // JSON field in Prisma
})

/**
 * Schema for creating a new client user
 */
export const createClientUserSchema = z.object({
  ...baseClientUserSchema.shape,
  password: z.string().min(8, 'Password must be at least 8 characters'),
  organizationId: z.string().min(1, 'Organization is required'),
})

/**
 * Schema for updating an existing client user
 */
export const updateClientUserSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Name is required').optional(),
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().optional(),
  billingAccess: z.boolean().optional(),
  adminAccess: z.boolean().optional(),
  notificationPreferences: z.any().optional(),
  organizationId: z.string().optional(),
})

/**
 * Schema for getting a client user by ID
 */
export const getClientUserByIdSchema = z.object({
  id: z.string(),
})

/**
 * Schema for client user list filtering
 */
export const clientUserListFilterSchema = z.object({
  organizationId: z.string().optional(),
  search: z.string().optional(),
  billingAccess: z.boolean().optional(),
  adminAccess: z.boolean().optional(),
})

/**
 * Schema for deleting a client user
 */
export const deleteClientUserSchema = z.object({
  id: z.string(),
})

// Export TypeScript types
export type CreateClientUserInput = z.infer<typeof createClientUserSchema>
export type UpdateClientUserInput = z.infer<typeof updateClientUserSchema>
export type ClientUserListFilter = z.infer<typeof clientUserListFilterSchema>
export type GetClientUserByIdInput = z.infer<typeof getClientUserByIdSchema>
export type DeleteClientUserInput = z.infer<typeof deleteClientUserSchema>