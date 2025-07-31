import { TRPCError } from '@trpc/server'
import { router } from '../../index'
import { isAdmin } from '../_helpers'
import {
  createUserSchema,
  updateUserSchema,
  getUserByIdSchema,
  userListFilterSchema,
  deleteUserSchema,
} from '@/schemas/user'
import bcrypt from 'bcryptjs'

/**
 * Admin users procedures for managing ADMIN and SE users.
 * All procedures require ADMIN role.
 */
export const adminUsersRouter = router({
  /**
   * List users with optional filtering by role, organization, and search
   */
  list: isAdmin
    .input(userListFilterSchema)
    .query(async ({ input, ctx }) => {
      const { role, organizationId, search } = input

      const where: any = {}
      
      // Filter by role if specified
      if (role) {
        where.role = role
      }
      
      // Filter by organization if specified
      if (organizationId) {
        where.organizationId = organizationId
      }
      
      // Search by name or email if specified
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ]
      }

      const users = await ctx.prisma.user.findMany({
        where,
        include: {
          organization: {
            select: {
              id: true,
              name: true,
            },
          },
          assignedOrganizations: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: [
          { role: 'asc' },
          { name: 'asc' },
        ],
      })

      // Remove password from response
      return users.map(({ password, ...user }) => user)
    }),

  /**
   * Get a single user by ID
   */
  get: isAdmin
    .input(getUserByIdSchema)
    .query(async ({ input, ctx }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: input.id },
        include: {
          organization: {
            select: {
              id: true,
              name: true,
            },
          },
          assignedOrganizations: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        })
      }

      // Remove password from response
      const { password, ...userWithoutPassword } = user
      return userWithoutPassword
    }),

  /**
   * Create a new user (ADMIN or SE)
   */
  create: isAdmin
    .input(createUserSchema)
    .mutation(async ({ input, ctx }) => {
      const {
        password,
        assignedOrganizationIds,
        ...userData
      } = input

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
        role: userData.role,
        password: hashedPassword,
      }

      // Add optional fields only if they are defined
      if (userData.phone !== undefined) {
        createData.phone = userData.phone
      }
      if (userData.organizationId) {
        // Convert empty string to null for Prisma (foreign keys can't be empty strings)
        createData.organizationId = userData.organizationId || null
      }
      if (userData.hourlyRateCost !== undefined) {
        createData.hourlyRateCost = userData.hourlyRateCost
      }
      if (userData.hourlyRateBillable !== undefined) {
        createData.hourlyRateBillable = userData.hourlyRateBillable
      }

      // Add organization assignments for SE users
      if (input.role === 'SE' && assignedOrganizationIds && assignedOrganizationIds.length > 0) {
        createData.assignedOrganizations = {
          connect: assignedOrganizationIds.map(id => ({ id }))
        }
      }

      // Create user
      const user = await ctx.prisma.user.create({
        data: createData,
        include: {
          organization: {
            select: {
              id: true,
              name: true,
            },
          },
          assignedOrganizations: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user
      return userWithoutPassword
    }),

  /**
   * Update an existing user
   */
  update: isAdmin
    .input(updateUserSchema)
    .mutation(async ({ input, ctx }) => {
      const {
        id,
        assignedOrganizationIds,
        ...updateData
      } = input

      // Check if user exists
      const existingUser = await ctx.prisma.user.findUnique({
        where: { id },
        include: {
          assignedOrganizations: true,
        },
      })

      if (!existingUser) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
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
      if (updateData.organizationId !== undefined) {
        // Convert empty string to null for Prisma (foreign keys can't be empty strings)
        updateDataForPrisma.organizationId = updateData.organizationId || null
      }
      if (updateData.hourlyRateCost !== undefined) {
        updateDataForPrisma.hourlyRateCost = updateData.hourlyRateCost
      }
      if (updateData.hourlyRateBillable !== undefined) {
        updateDataForPrisma.hourlyRateBillable = updateData.hourlyRateBillable
      }

      // Handle organization assignments for SE users
      if (assignedOrganizationIds !== undefined) {
        updateDataForPrisma.assignedOrganizations = {
          set: assignedOrganizationIds.map(id => ({ id })),
        }
      }

      const updatedUser = await ctx.prisma.user.update({
        where: { id },
        data: updateDataForPrisma,
        include: {
          organization: {
            select: {
              id: true,
              name: true,
            },
          },
          assignedOrganizations: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })

      // Remove password from response
      const { password, ...userWithoutPassword } = updatedUser
      return userWithoutPassword
    }),

  /**
   * Delete a user
   */
  delete: isAdmin
    .input(deleteUserSchema)
    .mutation(async ({ input, ctx }) => {
      const { id } = input

      // Check if user exists
      const existingUser = await ctx.prisma.user.findUnique({
        where: { id },
      })

      if (!existingUser) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        })
      }

      // Prevent deletion of the current admin user
      if (id === ctx.session.user.id) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot delete your own account',
        })
      }

      await ctx.prisma.user.delete({
        where: { id },
      })

      return { success: true }
    }),
})
