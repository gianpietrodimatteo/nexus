import { TRPCError } from '@trpc/server'
import { router } from '../index'
import { isAdmin } from './_helpers'
import {
  createClientUserSchema,
  updateClientUserSchema,
  getClientUserByIdSchema,
  clientUserListFilterSchema,
  deleteClientUserSchema,
} from '@/schemas/client-user'
import bcrypt from 'bcryptjs'

/**
 * Admin client users procedures for managing CLIENT role users.
 * All procedures require ADMIN role.
 */
export const adminClientUsersRouter = router({
  /**
   * List client users with optional filtering by organization and search
   */
  list: isAdmin
    .input(clientUserListFilterSchema)
    .query(async ({ input, ctx }) => {
      const { organizationId, search, billingAccess, adminAccess } = input

      const where: any = {
        role: 'CLIENT', // Only get CLIENT role users
      }
      
      // Filter by organization if specified
      if (organizationId) {
        where.organizationId = organizationId
      }
      
      // Filter by billing access if specified
      if (billingAccess !== undefined) {
        where.billingAccess = billingAccess
      }
      
      // Filter by admin access if specified
      if (adminAccess !== undefined) {
        where.adminAccess = adminAccess
      }
      
      // Search by name or email if specified
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ]
      }

      const clientUsers = await ctx.prisma.user.findMany({
        where,
        include: {
          organization: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: [
          { name: 'asc' },
        ],
      })

      // Remove password from response
      return clientUsers.map(({ password, ...user }) => user)
    }),

  /**
   * Get a single client user by ID
   */
  get: isAdmin
    .input(getClientUserByIdSchema)
    .query(async ({ input, ctx }) => {
      const clientUser = await ctx.prisma.user.findUnique({
        where: { 
          id: input.id,
          role: 'CLIENT', // Ensure we only get CLIENT users
        },
        include: {
          organization: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })

      if (!clientUser) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Client user not found',
        })
      }

      // Remove password from response
      const { password, ...userWithoutPassword } = clientUser
      return userWithoutPassword
    }),

  /**
   * Create a new client user
   */
  create: isAdmin
    .input(createClientUserSchema)
    .mutation(async ({ input, ctx }) => {
      const { password, ...userData } = input

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 12)

      // Check if email already exists
      const existingUser = await ctx.prisma.user.findUnique({
        where: { email: input.email },
      })

      if (existingUser) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'User with this email already exists',
        })
      }

      // Prepare user data for creation
      const createData: any = {
        name: userData.name,
        email: userData.email,
        role: 'CLIENT', // Always set role to CLIENT
        password: hashedPassword,
        organizationId: userData.organizationId,
        billingAccess: userData.billingAccess,
        adminAccess: userData.adminAccess,
      }

      // Add optional fields only if they are defined
      if (userData.phone !== undefined) {
        createData.phone = userData.phone
      }
      if (userData.notificationPreferences !== undefined) {
        createData.notificationPreferences = userData.notificationPreferences
      }

      // Create client user
      const clientUser = await ctx.prisma.user.create({
        data: createData,
        include: {
          organization: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })

      // Remove password from response
      const { password: _, ...userWithoutPassword } = clientUser
      return userWithoutPassword
    }),

  /**
   * Update an existing client user
   */
  update: isAdmin
    .input(updateClientUserSchema)
    .mutation(async ({ input, ctx }) => {
      const { id, ...updateData } = input

      // Check if client user exists
      const existingUser = await ctx.prisma.user.findUnique({
        where: { 
          id,
          role: 'CLIENT', // Ensure we only update CLIENT users
        },
      })

      if (!existingUser) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Client user not found',
        })
      }

      // Check for email conflicts if email is being updated
      if (updateData.email && updateData.email !== existingUser.email) {
        const emailConflict = await ctx.prisma.user.findUnique({
          where: { email: updateData.email },
        })

        if (emailConflict) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'User with this email already exists',
          })
        }
      }

      // Prepare update data
      const updateDataForPrisma: any = {}

      // Add only defined fields to avoid undefined issues
      if (updateData.name !== undefined) {
        updateDataForPrisma.name = updateData.name
      }
      if (updateData.email !== undefined) {
        updateDataForPrisma.email = updateData.email
      }
      if (updateData.phone !== undefined) {
        updateDataForPrisma.phone = updateData.phone
      }
      if (updateData.billingAccess !== undefined) {
        updateDataForPrisma.billingAccess = updateData.billingAccess
      }
      if (updateData.adminAccess !== undefined) {
        updateDataForPrisma.adminAccess = updateData.adminAccess
      }
      if (updateData.notificationPreferences !== undefined) {
        updateDataForPrisma.notificationPreferences = updateData.notificationPreferences
      }
      if (updateData.organizationId !== undefined) {
        updateDataForPrisma.organizationId = updateData.organizationId
      }

      const updatedClientUser = await ctx.prisma.user.update({
        where: { id },
        data: updateDataForPrisma,
        include: {
          organization: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })

      // Remove password from response
      const { password, ...userWithoutPassword } = updatedClientUser
      return userWithoutPassword
    }),

  /**
   * Delete a client user
   */
  delete: isAdmin
    .input(deleteClientUserSchema)
    .mutation(async ({ input, ctx }) => {
      const { id } = input

      // Check if client user exists
      const existingUser = await ctx.prisma.user.findUnique({
        where: { 
          id,
          role: 'CLIENT', // Ensure we only delete CLIENT users
        },
      })

      if (!existingUser) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Client user not found',
        })
      }

      await ctx.prisma.user.delete({
        where: { id },
      })

      return { success: true }
    }),
})