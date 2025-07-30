# Authentication & API Flow Configuration

This document explains how NextAuth, tRPC, and React Query work together to provide authenticated API access in the Nexus application.

## Overview

The system uses:
- **NextAuth** for authentication (JWT sessions)
- **tRPC** for type-safe API endpoints
- **React Query** for client-side data fetching
- **RBAC** for role-based access control

## API Endpoints Configuration

### 1. NextAuth Endpoints (`/api/auth/*`)

**File**: `src/app/api/auth/[...nextauth]/route.ts`
```typescript
import NextAuth from 'next-auth'
import { authOptions } from '@/server/auth'

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
```

**Exposes**:
- `/api/auth/signin` - Login endpoint
- `/api/auth/signout` - Logout endpoint  
- `/api/auth/session` - Get current session
- `/api/auth/callback/credentials` - Handle login response

### 2. tRPC Endpoints (`/api/trpc/*`)

**File**: `src/app/api/trpc/[trpc]/route.ts`
```typescript
import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { appRouter } from '@/server/trpc/appRouter'
import { createContext } from '@/server/trpc/context'

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext,
  })
```

**Exposes**:
- `/api/trpc/admin.users.list` - List admin/SE users
- `/api/trpc/admin.users.create` - Create user
- `/api/trpc/admin.users.update` - Update user
- `/api/trpc/admin.users.delete` - Delete user

## Frontend Configuration

### 1. tRPC Client Setup

**File**: `src/lib/trpc.ts`
```typescript
export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: `${getBaseUrl()}/api/trpc`,  // Points to tRPC API
    }),
  ],
})
```

### 2. Provider Configuration

**File**: `src/lib/providers.tsx`
```typescript
<SessionProvider>                     {/* NextAuth session context */}
  <trpc.Provider client={trpcClient}> {/* tRPC client */}
    <QueryClientProvider>             {/* React Query caching */}
      {children}
    </QueryClientProvider>
  </trpc.Provider>
</SessionProvider>
```

**File**: `src/app/layout.tsx`
```typescript
<Providers>{children}</Providers>
```

## Session & Context Flow

### 1. tRPC Context Creation

**File**: `src/server/trpc/context.ts`
```typescript
export async function createContext() {
  const session = await getServerSession(authOptions)  // Get NextAuth session
  const allowedOrgIds = await getAllowedOrgIds(session) // RBAC computation
  
  return {
    session,                              // Available in all tRPC procedures
    prisma: createRbacPrisma(allowedOrgIds) // RBAC-aware database client
  }
}
```

### 2. Protected Procedures

**File**: `src/server/trpc/routes/_helpers.ts`
```typescript
export const isAdmin = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.session.user.role !== 'ADMIN') {
    throw new TRPCError({ code: 'FORBIDDEN' })
  }
  return next({ ctx })
})
```

## Usage Examples

### 1. Login Flow

**File**: `src/app/login/page.tsx`
```typescript
// Call NextAuth
const result = await signIn('credentials', { email, password })

// Get session and redirect based on role
const session = await getSession()
if (session?.user.role === 'ADMIN') {
  router.push('/admin')
}
```

### 2. Protected Page Access

**File**: `src/app/(dashboard)/admin/users/page.tsx`
```typescript
// Get session
const { data: session } = useSession()

// Make authenticated tRPC call
const { data: users } = trpc.admin.users.list.useQuery({
  role: roleFilter,
  search: searchTerm
})
```

## Complete Request Flow

1. **Authentication**:
   - User submits credentials → `/api/auth/callback/credentials`
   - NextAuth validates → creates JWT session

2. **Page Access**:
   - User visits protected page → `useSession()` gets session
   - Page renders based on authentication state

3. **API Calls**:
   - Frontend calls `trpc.admin.users.list.useQuery()`
   - HTTP request to `/api/trpc/admin.users.list`
   - tRPC handler calls `createContext()` → extracts session from JWT
   - Protected procedure checks `ctx.session.user.role`
   - RBAC Prisma client filters data → returns response

## Environment Configuration

**Required**: `.env.development`
```bash
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-32-character-secret-key"
DATABASE_URL="postgresql://..."
```

## Type Safety

The system maintains end-to-end type safety:

```typescript
// Backend router defines types
export const adminUsersRouter = router({
  list: isAdmin.input(userListFilterSchema).query(...)
})

// Frontend automatically gets correct types
trpc.admin.users.list.useQuery({ role: 'ADMIN' }) // TypeScript knows this shape
```

## Key Benefits

- **Automatic endpoint discovery**: Frontend knows backend routes via TypeScript
- **Session management**: NextAuth handles JWT creation/validation
- **Role-based security**: RBAC automatically applied to database queries
- **Type safety**: Compile-time checks for API contracts
- **Caching**: React Query optimizes API calls and data freshness