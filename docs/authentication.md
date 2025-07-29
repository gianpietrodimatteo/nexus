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

## Security Considerations

- **Never log passwords** or session tokens
- **Use HTTPS** in production
- **Rotate JWT secrets** periodically
- **Monitor failed login attempts**
- **Implement rate limiting** for auth endpoints
- **Regular security audits** of user permissions