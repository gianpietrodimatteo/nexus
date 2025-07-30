import { PrismaClient } from '@prisma/client'
import { rbacGuard } from './middleware/rbacGuard'

const prismaGlobal = globalThis as typeof globalThis & {
  prisma?: PrismaClient
}

export const prisma: PrismaClient =
  prismaGlobal.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  prismaGlobal.prisma = prisma
}

/**
 * Creates an RBAC-aware Prisma client that automatically filters queries
 * based on the user's allowed organization IDs.
 *
 * @param allowedOrgIds Array of organization IDs the user can access, or undefined for admin users
 * @returns Extended Prisma client with RBAC enforcement
 */
export const createRbacPrisma = (allowedOrgIds?: string[]) => {
  return prisma.$extends(rbacGuard(allowedOrgIds))
} 