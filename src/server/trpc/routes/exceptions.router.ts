import { TRPCError } from '@trpc/server'
import { router } from '../index'
import { isAdmin } from './_helpers'
import {
  exceptionListFilterSchema,
  updateExceptionStatusSchema,
} from '@/schemas/exception'

/**
 * Exceptions procedures for managing exception tracking and resolution.
 * All procedures require ADMIN role.
 */
export const exceptionsRouter = router({
  /**
   * List exceptions with filtering, searching, and pagination
   */
  list: isAdmin
    .input(exceptionListFilterSchema)
    .query(async ({ input, ctx }) => {
      const {
        organizationId,
        type,
        severity,
        status,
        departmentId,
        workflowId,
        reportedAfter,
        reportedBefore,
        search,
        limit,
        offset,
        sortBy,
        sortOrder
      } = input

      // Build where clause
      const where: any = {}

      if (organizationId) {
        where.organizationId = organizationId
      }

      if (type) {
        where.type = type
      }

      if (severity) {
        where.severity = severity
      }

      if (status) {
        where.status = status
      }

      if (departmentId) {
        where.departmentId = departmentId
      }

      if (workflowId) {
        where.workflowId = workflowId
      }

      // Date range filtering
      if (reportedAfter || reportedBefore) {
        where.reportedAt = {}
        if (reportedAfter) {
          where.reportedAt.gte = reportedAfter
        }
        if (reportedBefore) {
          where.reportedAt.lte = reportedBefore
        }
      }

      // Search functionality (across workflow name, organization name, remedy)
      if (search) {
        where.OR = [
          {
            workflow: {
              name: {
                contains: search,
                mode: 'insensitive'
              }
            }
          },
          {
            organization: {
              name: {
                contains: search,
                mode: 'insensitive'
              }
            }
          },
          {
            remedy: {
              contains: search,
              mode: 'insensitive'
            }
          }
        ]
      }

      // Build orderBy clause
      let orderBy: any
      switch (sortBy) {
        case 'organizationName':
          orderBy = { organization: { name: sortOrder } }
          break
        case 'workflowName':
          orderBy = { workflow: { name: sortOrder } }
          break
        case 'severity':
          // Sort by enum order (CRITICAL, HIGH, MEDIUM, LOW)
          orderBy = { severity: sortOrder }
          break
        case 'status':
          orderBy = { status: sortOrder }
          break
        case 'reportedAt':
        default:
          orderBy = { reportedAt: sortOrder }
          break
      }

      // Execute query with includes for related data
      const [exceptions, totalCount] = await Promise.all([
        ctx.prisma.exception.findMany({
          where,
          include: {
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
            workflow: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy,
          skip: offset,
          take: limit,
        }),
        ctx.prisma.exception.count({ where })
      ])

      return {
        exceptions,
        totalCount,
        hasMore: offset + limit < totalCount,
      }
    }),

  /**
   * Update exception status and remedy
   */
  updateStatus: isAdmin
    .input(updateExceptionStatusSchema)
    .mutation(async ({ input, ctx }) => {
      const { id, status, remedy } = input

      // Check if exception exists
      const existingException = await ctx.prisma.exception.findUnique({
        where: { id },
        include: {
          organization: {
            select: {
              name: true,
            },
          },
          workflow: {
            select: {
              name: true,
            },
          },
        },
      })

      if (!existingException) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Exception not found',
        })
      }

      // Prepare update data
      const updateData: any = {
        status,
      }

      // Add remedy if provided
      if (remedy !== undefined) {
        updateData.remedy = remedy
      }

      // Set resolvedAt timestamp if status is RESOLVED
      if (status === 'RESOLVED') {
        updateData.resolvedAt = new Date()
      } else if (status !== 'RESOLVED' && existingException.resolvedAt) {
        // Clear resolvedAt if status is changed from RESOLVED to something else
        updateData.resolvedAt = null
      }

      // Update the exception
      const updatedException = await ctx.prisma.exception.update({
        where: { id },
        data: updateData,
        include: {
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
          workflow: {
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
   * Get exception statistics/summary
   */
  stats: isAdmin.query(async ({ ctx }) => {
    const [
      totalCount,
      newCount,
      inProgressCount,
      criticalCount,
      highCount,
      resolvedThisMonth,
    ] = await Promise.all([
      ctx.prisma.exception.count(),
      ctx.prisma.exception.count({ where: { status: 'NEW' } }),
      ctx.prisma.exception.count({ where: { status: 'IN_PROGRESS' } }),
      ctx.prisma.exception.count({ where: { severity: 'CRITICAL' } }),
      ctx.prisma.exception.count({ where: { severity: 'HIGH' } }),
      ctx.prisma.exception.count({
        where: {
          status: 'RESOLVED',
          resolvedAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
    ])

    return {
      totalCount,
      newCount,
      inProgressCount,
      criticalCount,
      highCount,
      resolvedThisMonth,
    }
  }),
})