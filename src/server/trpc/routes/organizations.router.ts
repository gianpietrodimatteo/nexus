import { router } from '../index'
import { isAdmin, isAdminOrSE } from './_helpers'

/**
 * Organizations procedures for managing organizations.
 * ADMIN: Can list all organizations
 * SE: Can list their assigned organizations (automatically filtered by RBAC guard)
 */
export const organizationsRouter = router({
  /**
   * List organizations for dropdowns and selection
   * ADMIN: Can list all organizations
   * SE: Can list their assigned organizations (automatically filtered by RBAC guard)
   */
  list: isAdminOrSE.query(async ({ ctx }) => {
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