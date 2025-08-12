import { prisma } from '@/server/prisma/client'
import type { AuthSession } from '@/server/auth'

/**
 * Computes the list of organization IDs a user in a given session is allowed to access.
 *
 * @param session The user's authentication session.
 * @returns An array of organization IDs, or `undefined` if access is unrestricted (e.g., for ADMINs).
 *          Returns an empty array for users with no valid session or role, effectively denying access.
 */
export async function getAllowedOrgIds(
  session: AuthSession | null,
): Promise<string[] | undefined> {
  if (!session?.user?.role) {
    return [] // Deny access by default if session or user role is missing
  }

  const { user } = session

  switch (user.role) {
    case 'ADMIN':
      // Admins have unrestricted access to all organizations.
      return undefined

    case 'SE':
      // Check if SE is in CLIENT impersonation mode
      if (user.impersonationContext?.type === 'CLIENT' && user.impersonationContext.organizationId) {
        // When impersonating a client, limit access to that organization only
        return [user.impersonationContext.organizationId]
      }
      
      // For ADMIN impersonation mode or no impersonation context,
      // SE gets access to all their assigned organizations (normal SE behavior)
      const orgs = await prisma.organization.findMany({
        where: { assignedSEs: { some: { id: user.id } } },
        select: { id: true },
      })
      return orgs.map((o) => o.id)

    case 'CLIENT':
      // Clients are restricted to their own organization.
      if (!user.organizationId) {
        return [] // Deny access if a client is not associated with an organization.
      }
      return [user.organizationId]

    default:
      // A safety net for any unhandled roles.
      return []
  }
} 