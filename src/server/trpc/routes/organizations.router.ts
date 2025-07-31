import { router } from '../index'
import { isAdmin } from './_helpers'

/**
 * Admin organizations procedures for managing organizations.
 * All procedures require ADMIN role.
 */
export const adminOrganizationsRouter = router({
  /**
   * List all organizations for dropdowns and selection
   */
  list: isAdmin.query(async ({ ctx }) => {
    const organizations = await ctx.prisma.organization.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    })

    return organizations
  }),
})