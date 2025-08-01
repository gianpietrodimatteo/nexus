import { z } from 'zod'
import { router, protectedProcedure } from '../index'
import { isAdminOrSE } from './_helpers'
import {
  createExceptionSchema,
  updateExceptionStatusSchema,
  listExceptionsSchema,
  sendExceptionNotificationSchema,
  ExceptionStatusSchema,
} from '@/schemas/exception'

export const exceptionsRouter = router({
  /**
   * List exceptions with filters and pagination
   * ADMIN: Can see all exceptions across all organizations
   * SE: Can see exceptions for their assigned organizations (automatically filtered by RBAC guard)
   * CLIENT: Can only see exceptions for their organization (automatically filtered by RBAC guard)
   */
  list: protectedProcedure
    .input(listExceptionsSchema)
    .query(async ({ ctx, input }) => {
      const { page, pageSize, sortBy, sortOrder, filters } = input
      const skip = (page - 1) * pageSize

      // Build where clause - RBAC guard automatically handles organization filtering
      let whereClause: any = {}

      // Apply user-provided filters (organization filtering handled automatically by RBAC guard)
      if (filters?.organizationId) {
        whereClause.organizationId = filters.organizationId
      }
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
   * ADMIN: Can get any exception
   * SE: Can get exceptions for their assigned organizations (automatically filtered by RBAC guard)
   * CLIENT: Can only get exceptions for their organization (automatically filtered by RBAC guard)
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const exception = await ctx.prisma.exception.findFirst({
        where: {
          id: input.id,
          // RBAC guard automatically handles organization filtering
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
   * Update exception status
   * ADMIN: Can update any exception
   * SE: Can update exceptions for their assigned organizations (automatically filtered by RBAC guard)
   */
  updateStatus: isAdminOrSE
    .input(updateExceptionStatusSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, status, remedy } = input

      // Check if exception exists (RBAC guard automatically filters by organization)
      const existingException = await ctx.prisma.exception.findFirst({
        where: { id },
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
   * ADMIN: Can create exceptions for any organization
   * SE: Can create exceptions for workflows in their assigned organizations (automatically filtered by RBAC guard)
   */
  create: isAdminOrSE
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
   * Send notifications for an exception
   * ADMIN: Can send notifications for any exception
   * SE: Can send notifications for exceptions in their assigned organizations (automatically filtered by RBAC guard)
   */
  sendNotifications: isAdminOrSE
    .input(sendExceptionNotificationSchema)
    .mutation(async ({ ctx, input }) => {
      const { exceptionId, userIds, methods, message } = input

      // Verify exception exists (RBAC guard automatically filters by organization)
      const exception = await ctx.prisma.exception.findFirst({
        where: { id: exceptionId },
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
   * ADMIN: Can get stats for any organization or all organizations
   * SE: Can get stats for their assigned organizations (automatically filtered by RBAC guard)
   * CLIENT: Can get stats for their organization (automatically filtered by RBAC guard)
   */
  getStats: protectedProcedure
    .input(z.object({
      organizationId: z.string().cuid().optional(),
      dateFrom: z.date().optional(),
      dateTo: z.date().optional(),
    }))
    .query(async ({ ctx, input }) => {
      // Build where clause - RBAC guard automatically handles organization filtering
      let whereClause: any = {}

      // Apply user-provided organization filter (RBAC guard will ensure access)
      if (input.organizationId) {
        whereClause.organizationId = input.organizationId
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