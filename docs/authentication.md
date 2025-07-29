# Authentication System

## Overview

The Nexus platform uses **NextAuth.js v4** with email/password credentials authentication. The system supports role-based access control with three user types: `ADMIN`, `SE` (Solutions Engineer), and `CLIENT`.

## Architecture

### File Structure

```
src/server/auth/
├── types.ts      # Type definitions and interfaces
├── config.ts     # NextAuth configuration
└── index.ts      # Public exports
```

### Design Principles

1. **No Module Augmentation** - All type extensions are explicit interfaces
2. **Prisma Integration** - Direct use of Prisma types for consistency
3. **Explicit Type Composition** - Intersection types over inheritance
4. **Server-Side Separation** - Auth logic isolated in `src/server/`

## Type System

### Core Types

```typescript
// AuthUser - What the authorize function returns
interface AuthUser {
  id: string
  email: string
  name: string
  role: UserRole           // From Prisma schema
  organizationId: string | null
  organization: Organization | null
}

// AuthSession - Enhanced session with custom user data
interface AuthSession extends DefaultSession {
  user: AuthUser & DefaultSession['user']
}

// AuthJWT - JWT token with custom properties
type AuthJWT = JWT & AuthTokenData
```

### Type Safety Approach

- **Intersection Types**: `JWT & AuthTokenData` provides safe composition
- **Explicit Casting**: Clear, intentional type assertions where needed
- **Runtime Safety**: `Object.assign()` ensures properties exist on tokens

## Authentication Flow

### 1. User Login

```typescript
// User submits credentials via sign-in form
POST /api/auth/signin
{
  email: "admin@usebraintrust.com",
  password: "password123"
}
```

### 2. Credential Verification

```typescript
// CredentialsProvider.authorize() flow:
1. Validate input (email + password present)
2. Query user from database (including organization data)
3. Compare password hash using bcrypt
4. Return AuthUser object or null
```

### 3. JWT Token Creation

```typescript
// jwt() callback enhances token:
{
  ...baseJWT,
  role: "ADMIN",
  organizationId: null,
  organization: null
}
```

### 4. Session Creation

```typescript
// session() callback creates AuthSession:
{
  user: {
    id: "admin-user-1",
    email: "admin@usebraintrust.com", 
    name: "Admin User",
    role: "ADMIN",
    organizationId: null,
    organization: null
  }
}
```

## Usage

### Basic Authentication Check

```typescript
import { getServerSession } from 'next-auth'
import { authOptions, type AuthSession } from '@/server/auth'

export async function getServerSideProps(context) {
  const session = await getServerSession(context.req, context.res, authOptions) as AuthSession
  
  if (!session) {
    return { redirect: { destination: '/auth/signin' } }
  }
  
  return { props: { session } }
}
```

### Role-Based Access Control

```typescript
import { useSession } from 'next-auth/react'
import { AuthSession } from '@/server/auth'

export function AdminPanel() {
  const { data: session } = useSession() as { data: AuthSession }
  
  if (session?.user.role !== 'ADMIN') {
    return <div>Access denied</div>
  }
  
  return <div>Admin content</div>
}
```

### Organization-Scoped Queries

```typescript
// Automatic organization filtering for CLIENT users
export async function getClientWorkflows(session: AuthSession) {
  if (session.user.role === 'CLIENT' && !session.user.organizationId) {
    throw new Error('Client user must have organization')
  }
  
  return prisma.workflow.findMany({
    where: {
      organizationId: session.user.organizationId
    }
  })
}
```

## User Roles & Permissions

| Role | Access | Organization | Restrictions |
|------|---------|--------------|--------------|
| **ADMIN** | Platform-wide | `null` | Can manage all orgs, users, system settings |
| **SE** | Multi-org | `null` | Assigned to specific orgs, billing rates |
| **CLIENT** | Single org | Required | Limited to own organization data |

### Role-Specific Fields

```typescript
// SE-specific fields
hourlyRateCost: Decimal      // Internal cost rate
hourlyRateBillable: Decimal  // Client billing rate

// CLIENT-specific fields  
departmentId: string         // Department within organization
billingAccess: boolean       // Can view/manage billing
adminAccess: boolean         // Can manage other users in org
```

## Security Features

### Password Security
- **bcrypt hashing** with cost factor 12
- **Secure comparison** using `bcrypt.compare()`
- **No plaintext storage** in database or logs

### Session Security
- **JWT strategy** with secure token storage
- **Server-side validation** on every request
- **Automatic expiration** managed by NextAuth

### Database Security
- **Organization scoping** prevents cross-org data access
- **Role-based queries** enforced at data layer
- **Audit logging** for user actions

## Development Workflow

### Test Credentials

```bash
# Available after running: pnpm db:seed

Admin:    admin@usebraintrust.com  / password123
SE:       se@usebraintrust.com     / password123  
Client:   client@acme.com          / password123
```

### Adding New Users

```typescript
// In prisma/seed.ts or admin interface
const hashedPassword = await bcrypt.hash('newpassword', 12)

await prisma.user.create({
  data: {
    email: 'newuser@example.com',
    password: hashedPassword,
    name: 'New User',
    role: 'CLIENT',
    organizationId: 'org-id',
    // ... other fields
  }
})
```

### Custom Pages

Configure sign-in and error pages in `src/server/auth/config.ts`:

```typescript
pages: {
  signIn: '/auth/signin',    // Custom sign-in page
  error: '/auth/error'       // Custom error page
}
```

## Troubleshooting

### Common Issues

**TypeScript Errors**
- Ensure `@/server/auth` imports are used correctly
- Check that `AuthSession` type is imported when needed
- Verify Prisma types are generated: `pnpm prisma generate`

**Authentication Failures**
- Verify database connection and user exists
- Check password hash comparison
- Confirm NextAuth environment variables

**Session Issues**
- Clear browser cookies/localStorage
- Restart development server
- Check JWT token expiration

### Environment Variables

Required variables in `.env.development`:

```bash
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/nexus
```

## Migration Notes

When adding authentication to existing users:

1. **Add password field**: Schema migration required
2. **Hash existing passwords**: Run migration script  
3. **Update seed data**: Include password hashes
4. **Test role transitions**: Verify permission changes

## RBAC Guard Implementation

### RBAC Guard Overview

The Nexus platform implements automatic Role-Based Access Control (RBAC) enforcement at the database level using Prisma Client Extensions. This ensures that all database queries are automatically scoped to the user's allowed organizations, preventing accidental cross-tenant data exposure.

### Architecture

```
src/server/
├── auth/
│   └── getAllowedOrgs.ts    # Computes user's allowed organization IDs
├── prisma/
│   ├── client.ts            # Prisma singleton + RBAC client factory
│   └── middleware/
│       └── rbacGuard.ts     # Prisma extension for automatic filtering
└── trpc/
    ├── context.ts           # Request context with RBAC-aware Prisma client
    ├── client.ts            # tRPC initialization with auth procedures
    └── router.ts            # Main app router
```

### Components

#### 1. Organization Access Computation

```typescript
// src/server/auth/getAllowedOrgs.ts
export async function getAllowedOrgIds(
  session: AuthSession | null,
): Promise<string[] | undefined> {
  switch (session?.user?.role) {
    case 'ADMIN':
      return undefined          // Unrestricted access
    case 'SE':
      // Query assigned organizations
      const orgs = await prisma.organization.findMany({
        where: { assignedSEs: { some: { id: session.user.id } } },
        select: { id: true }
      })
      return orgs.map(o => o.id)
    case 'CLIENT':
      return [session.user.organizationId]  // Single org access
    default:
      return []                // Deny access
  }
}
```

#### 2. Automatic Query Filtering

```typescript
// src/server/prisma/middleware/rbacGuard.ts
export const rbacGuard = (allowedOrgIds: string[] | undefined) => {
  return Prisma.defineExtension({
    name: 'rbacGuard',
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          // Skip filtering for admin users
          if (allowedOrgIds === undefined) return query(args)
          
          // Auto-inject organizationId filter for models that have it
          if (hasOrganizationIdField(model) && supportsWhereClause(operation)) {
            args.where = {
              AND: [
                args.where || {},
                { organizationId: { in: allowedOrgIds } }
              ]
            }
          }
          
          return query(args)
        }
      }
    }
  })
}
```

#### 3. Request-Scoped RBAC Client

```typescript
// src/server/trpc/context.ts
export async function createContext() {
  const session = await getServerSession(authOptions) as AuthSession | null
  const allowedOrgIds = await getAllowedOrgIds(session)
  
  return {
    session,
    prisma: createRbacPrisma(allowedOrgIds)  // RBAC-aware client
  }
}
```

### Usage Patterns

#### Automatic Protection in tRPC Procedures

```typescript
// Any tRPC procedure automatically gets organization-scoped queries
export const getWorkflows = protectedProcedure
  .query(async ({ ctx }) => {
    // This query is automatically filtered by user's allowed organizations
    return ctx.prisma.workflow.findMany({
      where: { isActive: true },
      include: { department: true }
    })
  })
```

#### Manual RBAC Client Creation

```typescript
// For use outside tRPC (e.g., in API routes)
import { getServerSession } from 'next-auth'
import { authOptions, getAllowedOrgIds } from '@/server/auth'
import { createRbacPrisma } from '@/server/prisma/client'

export async function GET() {
  const session = await getServerSession(authOptions)
  const allowedOrgIds = await getAllowedOrgIds(session)
  const prisma = createRbacPrisma(allowedOrgIds)
  
  // All queries automatically scoped
  const workflows = await prisma.workflow.findMany()
  return Response.json(workflows)
}
```

### Security Benefits

| Feature | Benefit |
|---------|---------|
| **Automatic Enforcement** | Impossible to forget organization filtering |
| **Zero Boilerplate** | No manual `organizationId` filters needed |
| **Type Safety** | Full TypeScript support with proper context |
| **Performance** | Single request, no additional DB queries |
| **Defense in Depth** | Works alongside route-level guards |

### Models Protected

The RBAC guard automatically applies to these models with `organizationId` fields:

- `Organization` (filtered by ID directly)
- `Department` (via `organizationId`)
- `Workflow` (via `organizationId`)
- `Exception` (via `organizationId`)
- `Credential` (via `organizationId`)
- `DocumentLink` (via `organizationId`)
- `PipelinePhaseLog` (via `organizationId`)
- `Invoice` (via `organizationId`)
- `Credit` (via `organizationId`)
- `AuditLog` (via `organizationId`)

### Bypass for System Operations

```typescript
// For system-level operations that need unrestricted access
import { prisma } from '@/server/prisma/client'  // Base client

// Direct access without RBAC filtering (use carefully)
const allOrganizations = await prisma.organization.findMany()
```

## Security Considerations

- **Never log passwords** or session tokens
- **Use HTTPS** in production
- **Rotate JWT secrets** periodically
- **Monitor failed login attempts**
- **Implement rate limiting** for auth endpoints
- **Regular security audits** of user permissions
- **RBAC bypass logging** - Monitor direct prisma client usage
- **Extension validation** - Ensure RBAC guard is properly attached