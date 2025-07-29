import { getServerSession } from 'next-auth'
import { authOptions, type AuthSession } from '@/server/auth'
import { createRbacPrisma } from '@/server/prisma/client'
import { getAllowedOrgIds } from '@/server/auth/getAllowedOrgs'

/**
 * Creates the context for an incoming tRPC request.
 *
 * This function is responsible for:
 * 1. Fetching the user's session.
 * 2. Determining the user's allowed organization IDs for RBAC.
 * 3. Creating a request-scoped, RBAC-aware Prisma client instance.
 *
 * The resulting context, including the secure Prisma client, is made available
 * to all tRPC procedures.
 */
export async function createContext() {
  const session = (await getServerSession(authOptions)) as AuthSession | null

  // Compute organization access rights for the current user.
  const allowedOrgIds = await getAllowedOrgIds(session)

  return {
    session,
    // Create a Prisma client instance extended with the RBAC guard for this specific request.
    prisma: createRbacPrisma(allowedOrgIds),
  }
}

export type Context = Awaited<ReturnType<typeof createContext>> 