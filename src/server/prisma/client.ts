import { PrismaClient } from '@prisma/client'
import { rbacGuard } from './middleware/rbacGuard'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

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