import { z } from 'zod'
import { createTRPCRouter } from '../index'
import { isAdmin, isSE, isClient } from './_helpers'
import {
  createExceptionSchema,
  updateExceptionStatusSchema,
  listExceptionsSchema,
  sendExceptionNotificationSchema,
  ExceptionStatusSchema,
} from '@/schemas/exception'

export const exceptionsRouter = createTRPCRouter({
  /**
   * List exceptions with filters and pagination
   * Admin: Can see all exceptions across all organizations
   * SE: Can see exceptions for their assigned organizations  
   * Client: Can only see exceptions for their organization
   */
  list: isClient
    .input(listExceptionsSchema)
    .query(async ({ ctx, input }) => {
      const { page, pageSize, sortBy, sortOrder, filters } = input
      const skip = (page - 1) * pageSize

      // Build where clause based on user role
      let whereClause: any = {}

      if (ctx.user.role === 'ADMIN') {
        // Admin can filter by any organization
        if (filters?.organizationId) {
          whereClause.organizationId = filters.organizationId
        }
      } else if (ctx.user.role === 'SE') {
        // SE can only see exceptions for assigned organizations
        const assignedOrgIds = ctx.user.assignedOrganizations?.map(org => org.id) || []
        whereClause.organizationId = { in: assignedOrgIds }
        
        // If filtering by specific org, ensure SE has access to it
        if (filters?.organizationId && assignedOrgIds.includes(filters.organizationId)) {
          whereClause.organizationId = filters.organizationId
        }
      } else {
        // Client can only see their organization's exceptions
        whereClause.organizationId = ctx.user.organizationId
      }

      // Apply additional filters
      if (filters?.type) {
        whereClause.type = filters.type
      }
      if (filters?.severity) {
        whereClause.severity = filters.severity
      }
      if (filters?.status) {
        whereClause.status = filters.status
      }
      if (filters?.dateFrom || filters?.dateTo) {
        whereClause.reportedAt = {}
        if (filters.dateFrom) {
          whereClause.reportedAt.gte = filters.dateFrom
        }
        if (filters.dateTo) {
          whereClause.reportedAt.lte = filters.dateTo
        }
      }

      // Get total count for pagination
      const totalCount = await ctx.prisma.exception.count({ where: whereClause })

      // Get exceptions with relationships
      const exceptions = await ctx.prisma.exception.findMany({
        where: whereClause,
        include: {
          workflow: {
            select: {
              id: true,
              name: true,
            },
          },
          organization: {
            select: {
              id: true,
              name: true,
            },
          },
          department: {
            select: {
              id: true,
              name: true,
            },
          },
          notifications: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
            orderBy: {
              sentAt: 'desc',
            },
          },
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip,
        take: pageSize,
      })

      return {
        exceptions,
        pagination: {
          page,
          pageSize,
          totalCount,
          totalPages: Math.ceil(totalCount / pageSize),
        },
      }
    }),

  /**
   * Get single exception by ID with full details
   */
  getById: isClient
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const exception = await ctx.prisma.exception.findFirst({
        where: {
          id: input.id,
          // Apply same access control as list
          ...(ctx.user.role === 'ADMIN' 
            ? {} 
            : ctx.user.role === 'SE'
            ? { organizationId: { in: ctx.user.assignedOrganizations?.map(org => org.id) || [] } }
            : { organizationId: ctx.user.organizationId }
          ),
        },
        include: {
          workflow: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
          organization: {
            select: {
              id: true,
              name: true,
            },
          },
          department: {
            select: {
              id: true,
              name: true,
            },
          },
          notifications: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phone: true,
                },
              },
            },
            orderBy: {
              sentAt: 'desc',
            },
          },
        },
      })

      if (!exception) {
        throw new Error('Exception not found')
      }

      return exception
    }),

  /**
   * Update exception status (Admin and SE only)
   */
  updateStatus: isSE
    .input(updateExceptionStatusSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, status, remedy } = input

      // Check access permissions
      const existingException = await ctx.prisma.exception.findFirst({
        where: {
          id,
          ...(ctx.user.role === 'ADMIN' 
            ? {} 
            : { organizationId: { in: ctx.user.assignedOrganizations?.map(org => org.id) || [] } }
          ),
        },
      })

      if (!existingException) {
        throw new Error('Exception not found or access denied')
      }

      const updateData: any = { status }
      
      if (remedy !== undefined) {
        updateData.remedy = remedy
      }

      // Set resolvedAt if status is RESOLVED
      if (status === 'RESOLVED') {
        updateData.resolvedAt = new Date()
      } else if (existingException.resolvedAt && status !== 'RESOLVED') {
        // Clear resolvedAt if changing from resolved to another status
        updateData.resolvedAt = null
      }

      const updatedException = await ctx.prisma.exception.update({
        where: { id },
        data: updateData,
        include: {
          workflow: {
            select: {
              id: true,
              name: true,
            },
          },
          organization: {
            select: {
              id: true,
              name: true,
            },
          },
          department: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })

      return updatedException
    }),

  /**
   * Create a new exception (typically from workflow execution)
   */
  create: isAdmin
    .input(createExceptionSchema)
    .mutation(async ({ ctx, input }) => {
      const exception = await ctx.prisma.exception.create({
        data: {
          ...input,
          // Admin can create for any organization via organizationId in workflow
          // Get organizationId from workflow
        },
        include: {
          workflow: {
            select: {
              id: true,
              name: true,
              organizationId: true,
            },
          },
          organization: {
            select: {
              id: true,
              name: true,
            },
          },
          department: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })

      return exception
    }),

  /**
   * Send notifications for an exception (Admin and SE only)
   */
  sendNotifications: isSE
    .input(sendExceptionNotificationSchema)
    .mutation(async ({ ctx, input }) => {
      const { exceptionId, userIds, methods, message } = input

      // Verify access to exception
      const exception = await ctx.prisma.exception.findFirst({
        where: {
          id: exceptionId,
          ...(ctx.user.role === 'ADMIN' 
            ? {} 
            : { organizationId: { in: ctx.user.assignedOrganizations?.map(org => org.id) || [] } }
          ),
        },
        include: {
          workflow: { select: { name: true } },
          organization: { select: { name: true } },
        },
      })

      if (!exception) {
        throw new Error('Exception not found or access denied')
      }

      // Get users to notify
      const users = await ctx.prisma.user.findMany({
        where: {
          id: { in: userIds },
          // Ensure users belong to the exception's organization or are SEs/Admins
          OR: [
            { organizationId: exception.organizationId },
            { role: { in: ['ADMIN', 'SE'] } },
          ],
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          notificationPreferences: true,
        },
      })

      // Create notification records
      const notifications = []
      for (const user of users) {
        for (const method of methods) {
          let recipient = ''
          let success = true
          let error = null

          // Determine recipient based on method
          if (method === 'EMAIL') {
            recipient = user.email
          } else if (method === 'SMS') {
            recipient = user.phone || ''
            if (!user.phone) {
              success = false
              error = 'User has no phone number'
            }
          } else if (method === 'SLACK') {
            // TODO: Implement Slack notification logic
            recipient = user.email // Use email as identifier for now
          }

          if (recipient) {
            // TODO: Implement actual notification sending logic here
            // For now, just create the record
            
            const notification = await ctx.prisma.exceptionNotification.create({
              data: {
                method,
                recipient,
                success,
                error,
                exceptionId,
                userId: user.id,
              },
            })

            notifications.push(notification)
          }
        }
      }

      return { notifications, sentCount: notifications.filter(n => n.success).length }
    }),

  /**
   * Get exception statistics (for dashboard widgets)
   */
  getStats: isSE
    .input(z.object({
      organizationId: z.string().cuid().optional(),
      dateFrom: z.date().optional(),
      dateTo: z.date().optional(),
    }))
    .query(async ({ ctx, input }) => {
      // Build where clause based on user role and input
      let whereClause: any = {}

      if (ctx.user.role === 'ADMIN') {
        if (input.organizationId) {
          whereClause.organizationId = input.organizationId
        }
      } else if (ctx.user.role === 'SE') {
        const assignedOrgIds = ctx.user.assignedOrganizations?.map(org => org.id) || []
        whereClause.organizationId = input.organizationId && assignedOrgIds.includes(input.organizationId)
          ? input.organizationId
          : { in: assignedOrgIds }
      } else {
        whereClause.organizationId = ctx.user.organizationId
      }

      // Apply date filters
      if (input.dateFrom || input.dateTo) {
        whereClause.reportedAt = {}
        if (input.dateFrom) {
          whereClause.reportedAt.gte = input.dateFrom
        }
        if (input.dateTo) {
          whereClause.reportedAt.lte = input.dateTo
        }
      }

      // Get counts by severity
      const severityCounts = await ctx.prisma.exception.groupBy({
        by: ['severity'],
        where: whereClause,
        _count: { severity: true },
      })

      // Get counts by status
      const statusCounts = await ctx.prisma.exception.groupBy({
        by: ['status'],
        where: whereClause,
        _count: { status: true },
      })

      // Get counts by type
      const typeCounts = await ctx.prisma.exception.groupBy({
        by: ['type'],
        where: whereClause,
        _count: { type: true },
      })

      // Get total count
      const totalCount = await ctx.prisma.exception.count({ where: whereClause })

      return {
        totalCount,
        severityCounts: severityCounts.reduce((acc, item) => {
          acc[item.severity] = item._count.severity
          return acc
        }, {} as Record<string, number>),
        statusCounts: statusCounts.reduce((acc, item) => {
          acc[item.status] = item._count.status
          return acc
        }, {} as Record<string, number>),
        typeCounts: typeCounts.reduce((acc, item) => {
          acc[item.type] = item._count.type
          return acc
        }, {} as Record<string, number>),
      }
    }),
})