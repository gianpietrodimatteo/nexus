import { router } from '../index'
import { isAdmin } from './_helpers'
import { organizationIdSchema } from '@/schemas/common'

/**
 * Departments procedures for managing departments.
 * All procedures require ADMIN role.
 */
export const departmentsRouter = router({
  /**
   * List departments for an organization
   */
  list: isAdmin
    .input(organizationIdSchema)
    .query(async ({ input, ctx }) => {
      const departments = await ctx.prisma.department.findMany({
        where: { organizationId: input.organizationId },
        select: {
          id: true,
          name: true,
        },
        orderBy: {
          name: 'asc',
        },
      })

      return departments
    }),
})