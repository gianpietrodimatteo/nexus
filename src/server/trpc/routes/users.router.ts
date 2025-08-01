import { TRPCError } from '@trpc/server'
import { router } from '../index'
import { isAdmin, isAdminOrSE } from './_helpers'
import {
  createUserSchema,
  updateUserSchema,
  getUserByIdSchema,
  userListFilterSchema,
  deleteUserSchema,
} from '@/schemas/user'
import bcrypt from 'bcryptjs'

/**
 * Users procedures for managing all user types (ADMIN, SE, CLIENT).
 * ADMIN: Full access to all users across all organizations
 * SE: Access to users within their assigned organizations (automatically filtered by RBAC guard)
 */
export const usersRouter = router({
  /**
   * List users with optional filtering by role, organization, and search
   * ADMIN: Can see all users across all organizations
   * SE: Can see users in their assigned organizations (automatically filtered by RBAC guard)
   */
  list: isAdminOrSE
    .input(userListFilterSchema)
    .query(async ({ input, ctx }) => {
      const { role, organizationId, search, billingAccess, adminAccess } = input

      const where: any = {}
      
      // Filter by role if specified
      if (role) {
        where.role = role
      }
      
      // Filter by organization if specified
      if (organizationId) {
        where.organizationId = organizationId
      }
      
      // Filter by CLIENT-specific fields if specified
      if (billingAccess !== undefined) {
        where.billingAccess = billingAccess
      }
      
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
   * ADMIN: Can get any user
   * SE: Can get users in their assigned organizations (automatically filtered by RBAC guard)
   */
  get: isAdminOrSE
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
   * Create a new user (ADMIN, SE, or CLIENT)
   * ADMIN: Can create any user type in any organization
   * SE: Can only create CLIENT users in their assigned organizations
   */
  create: isAdminOrSE
    .input(createUserSchema)
    .mutation(async ({ input, ctx }) => {
      // SE business rule validation: SEs can only create CLIENT users in assigned organizations
      if (ctx.session.user.role === 'SE') {
        if (input.role !== 'CLIENT') {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Solutions Engineers can only create CLIENT users',
          })
        }
        
        if (input.organizationId) {
          // Verify the organizationId is in SE's assigned organizations
          const isAssigned = await ctx.prisma.organization.findFirst({
            where: {
              id: input.organizationId,
              assignedSEs: { some: { id: ctx.session.user.id } }
            }
          })
          
          if (!isAssigned) {
            throw new TRPCError({
              code: 'FORBIDDEN',
              message: 'You can only create users in organizations assigned to you',
            })
          }
        }
      }
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
      
      // SE-specific fields
      if (userData.hourlyRateCost !== undefined) {
        createData.hourlyRateCost = userData.hourlyRateCost
      }
      if (userData.hourlyRateBillable !== undefined) {
        createData.hourlyRateBillable = userData.hourlyRateBillable
      }
      
      // CLIENT-specific fields
      if (userData.billingAccess !== undefined) {
        createData.billingAccess = userData.billingAccess
      }
      if (userData.adminAccess !== undefined) {
        createData.adminAccess = userData.adminAccess
      }
      if (userData.notificationPreferences !== undefined) {
        createData.notificationPreferences = userData.notificationPreferences
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
   * ADMIN: Can update any user
   * SE: Can update CLIENT users in their assigned organizations (cannot change role)
   */
  update: isAdminOrSE
    .input(updateUserSchema)
    .mutation(async ({ input, ctx }) => {
      // SE business rule validation: SEs can only update CLIENT users and cannot change roles
      if (ctx.session.user.role === 'SE') {
        // Check if the user being updated exists and is accessible to this SE
        const existingUser = await ctx.prisma.user.findFirst({
          where: {
            id: input.id,
            organization: {
              assignedSEs: { some: { id: ctx.session.user.id } }
            }
          }
        })
        
        if (!existingUser) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'User not found or not accessible',
          })
        }
        
        if (existingUser.role !== 'CLIENT') {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Solutions Engineers can only update CLIENT users',
          })
        }
        
        // Prevent role changes by SEs
        if (input.role && input.role !== existingUser.role) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Solutions Engineers cannot change user roles',
          })
        }
        
        // Prevent SE-specific field changes
        if (input.hourlyRateCost !== undefined || input.hourlyRateBillable !== undefined) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Solutions Engineers cannot modify SE-specific fields',
          })
        }
      }
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
      
      // SE-specific fields
      if (updateData.hourlyRateCost !== undefined) {
        updateDataForPrisma.hourlyRateCost = updateData.hourlyRateCost
      }
      if (updateData.hourlyRateBillable !== undefined) {
        updateDataForPrisma.hourlyRateBillable = updateData.hourlyRateBillable
      }
      
      // CLIENT-specific fields
      if (updateData.billingAccess !== undefined) {
        updateDataForPrisma.billingAccess = updateData.billingAccess
      }
      if (updateData.adminAccess !== undefined) {
        updateDataForPrisma.adminAccess = updateData.adminAccess
      }
      if (updateData.notificationPreferences !== undefined) {
        updateDataForPrisma.notificationPreferences = updateData.notificationPreferences
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
   * ADMIN: Can delete any user (except themselves)
   * SE: Can delete CLIENT users in their assigned organizations
   */
  delete: isAdminOrSE
    .input(deleteUserSchema)
    .mutation(async ({ input, ctx }) => {
      const { id } = input

      // Check if user exists
      const existingUser = await ctx.prisma.user.findUnique({
        where: { id },
        include: {
          organization: true,
        },
      })

      if (!existingUser) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        })
      }

      // SE business rule validation: SEs can only delete CLIENT users in assigned organizations
      if (ctx.session.user.role === 'SE') {
        if (existingUser.role !== 'CLIENT') {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Solutions Engineers can only delete CLIENT users',
          })
        }
        
        if (existingUser.organizationId) {
          // Verify the user's organization is assigned to this SE
          const isAssigned = await ctx.prisma.organization.findFirst({
            where: {
              id: existingUser.organizationId,
              assignedSEs: { some: { id: ctx.session.user.id } }
            }
          })
          
          if (!isAssigned) {
            throw new TRPCError({
              code: 'FORBIDDEN',
              message: 'You can only delete users in organizations assigned to you',
            })
          }
        }
      }

      // Prevent deletion of the current user
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
