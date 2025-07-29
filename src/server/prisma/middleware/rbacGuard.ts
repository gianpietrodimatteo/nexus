import { Prisma } from '@prisma/client'

/**
 * Creates a Prisma Client Extension that enforces Role-Based Access Control (RBAC)
 * by automatically filtering queries based on a user's allowed organization IDs.
 *
 * @param allowedOrgIds An array of organization IDs the user is permitted to access.
 *                      If `undefined`, the user is considered an admin with unrestricted access.
 * @returns A Prisma Client Extension.
 */
export const rbacGuard = (allowedOrgIds: string[] | undefined) => {
  return Prisma.defineExtension({
    name: 'rbacGuard',
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          // If the user is an admin (allowedOrgIds is undefined), bypass the guard.
          if (allowedOrgIds === undefined) {
            return query(args)
          }

          // List of operations that support a `where` clause for filtering.
          const operationsWithWhere = [
            'findUnique',
            'findUniqueOrThrow', 
            'findFirst',
            'findFirstOrThrow',
            'findMany',
            'update',
            'updateMany',
            'delete',
            'deleteMany',
            'count',
            'aggregate',
            'groupBy',
          ]

          // Check if the model has an organizationId field
          const modelMeta = Prisma.dmmf.datamodel.models.find(m => m.name === model)
          const hasOrgIdField = modelMeta?.fields.some(field => field.name === 'organizationId')

          if (hasOrgIdField && operationsWithWhere.includes(operation)) {
            // Inject organizationId filter into the where clause
            const newArgs = args as any
            newArgs.where = {
              AND: [
                newArgs.where || {},
                { organizationId: { in: allowedOrgIds } },
              ],
            }
            return query(newArgs)
          }

          return query(args)
        },
      },
    },
  })
} 