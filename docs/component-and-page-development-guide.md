# Component & Page Development Guide

This document serves as the complete guide for creating new components, pages, and features in the Nexus platform.

## Quick Start Checklist

When building a new feature, follow this checklist:

1. **📄 Page Creation**: Create page in `src/app/(dashboard)/[area]/[feature]/page.tsx`
2. **🔒 Authentication**: Add authentication checks and role guards
3. **📝 Schemas**: Create/verify Zod schemas in `src/schemas/` for data validation
4. **🌐 tRPC Routes**: Create domain-specific router in `src/server/trpc/routes/`
5. **🎨 UI Components**: Build page-specific components in page's `components/` folder
6. **⚡ Loading States**: Add `loading.tsx` for the page
7. **🧪 Test & Verify**: Ensure proper RBAC and data isolation

## Architecture Overview

### File Organization

```
src/
├── app/(dashboard)/              # All dashboard pages
│   ├── admin/                   # Admin-specific pages (/admin/*)
│   │   ├── layout.tsx          # Admin shell (persistent sidebar/header)
│   │   ├── page.tsx            # Admin dashboard
│   │   ├── users/              # User management
│   │   │   ├── page.tsx        # User list/management page
│   │   │   ├── loading.tsx     # Loading skeleton
│   │   │   └── components/     # Page-specific components
│   │   │       ├── add-user-modal.tsx
│   │   │       ├── edit-user-modal.tsx
│   │   │       └── delete-user-dialog.tsx
│   │   └── clients/            # Client management
│   │       ├── page.tsx
│   │       ├── loading.tsx
│   │       └── components/
│   └── client/                 # Client-specific pages (/client/*)
│       ├── layout.tsx          # Client shell (different navigation)
│       ├── page.tsx            # Client dashboard
│       └── workflows/          # Workflow management
├── components/                  # Shared/reusable components
│   ├── ui/                     # shadcn/ui components (basic building blocks)
│   ├── app-sidebar.tsx         # Global navigation
│   ├── site-header.tsx         # Global header
│   └── data-table.tsx          # Reusable table component
├── schemas/                    # Zod validation schemas
│   ├── index.ts               # Barrel exports
│   ├── user.ts                # User-related schemas
│   └── client-user.ts         # Client user schemas
└── server/
    ├── trpc/
    │   ├── routes/            # Domain-based tRPC routers
    │   │   ├── _helpers.ts    # Role middlewares (isAdmin, isSE, etc.)
    │   │   ├── auth.router.ts # Authentication routes
    │   │   ├── users.router.ts # User management routes
    │   │   ├── clients.router.ts # Client management routes
    │   │   ├── client-users.router.ts # Client user management
    │   │   ├── organizations.router.ts # Organization management
    │   │   ├── dashboard.router.ts # Dashboard data
    │   │   └── billing.router.ts # Billing & invoicing
    │   ├── appRouter.ts       # Main router that combines all routes
    │   ├── context.ts         # tRPC context with RBAC
    │   └── index.ts           # tRPC initialization
    ├── auth/                  # Authentication & authorization
    │   ├── getAllowedOrgs.ts  # RBAC organization access
    │   └── config.ts          # NextAuth configuration
    └── prisma/                # Database layer
        ├── client.ts          # Prisma client with RBAC
        └── middleware/
            └── rbacGuard.ts   # Automatic query filtering
```

## Page Development Process

### 1. Create the Page Component

Pages should contain **business logic**, **state management**, and **tRPC calls**, while delegating UI concerns to smaller components.

```typescript
// src/app/(dashboard)/admin/workflows/page.tsx
import { Suspense } from 'react'
import { trpc } from '@/lib/trpc'
import { WorkflowsTable } from './components/workflows-table'
import { AddWorkflowModal } from './components/add-workflow-modal'
import { PageHeader } from '@/components/page-header'

export default function WorkflowsPage() {
  // ✅ Business logic and data fetching live in the page
  const { data: workflows, isLoading } = trpc.workflows.list.useQuery()
  const createWorkflow = trpc.workflows.create.useMutation({
    onSuccess: () => {
      // Invalidate queries, show success toast, etc.
    }
  })

  // ✅ Minimal render function - delegates to components
  return (
    <div className="container py-6">
      <PageHeader 
        title="Workflows" 
        description="Manage automation workflows"
        action={<AddWorkflowModal onSubmit={createWorkflow.mutate} />}
      />
      
      <Suspense fallback={<WorkflowsTableSkeleton />}>
        <WorkflowsTable 
          workflows={workflows} 
          isLoading={isLoading}
          onEdit={(workflow) => {/* handle edit logic */}}
          onDelete={(id) => {/* handle delete logic */}}
        />
      </Suspense>
    </div>
  )
}
```

### 2. Create Page-Specific Components

Components in the page's `components/` folder should be **purely UI-focused** and receive data via props.

```typescript
// src/app/(dashboard)/admin/workflows/components/workflows-table.tsx
import { DataTable } from '@/components/data-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface WorkflowsTableProps {
  workflows: Workflow[]
  isLoading: boolean
  onEdit: (workflow: Workflow) => void
  onDelete: (id: string) => void
}

export function WorkflowsTable({ workflows, isLoading, onEdit, onDelete }: WorkflowsTableProps) {
  const columns = [
    { accessorKey: 'name', header: 'Name' },
    { 
      accessorKey: 'status', 
      header: 'Status',
      cell: ({ row }) => <Badge variant={row.original.isActive ? 'default' : 'secondary'}>
        {row.original.isActive ? 'Active' : 'Inactive'}
      </Badge>
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button size="sm" onClick={() => onEdit(row.original)}>Edit</Button>
          <Button size="sm" variant="destructive" onClick={() => onDelete(row.original.id)}>
            Delete
          </Button>
        </div>
      )
    }
  ]

  return <DataTable data={workflows} columns={columns} />
}
```

### 3. Add Loading States

Create `loading.tsx` files for instant feedback during navigation.

```typescript
// src/app/(dashboard)/admin/workflows/loading.tsx
import { TablePageSkeleton } from '@/components/ui/skeleton'

export default function WorkflowsLoading() {
  return <TablePageSkeleton hasFilters={true} columns={4} rows={8} />
}
```

### 4. Create/Verify Schemas

Check if schemas exist in `src/schemas/`. If not, create them:

```typescript
// src/schemas/workflow.ts
import { z } from 'zod'

export const createWorkflowSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  organizationId: z.string().uuid(),
  departmentId: z.string().uuid().optional(),
  isActive: z.boolean().default(true)
})

export const updateWorkflowSchema = createWorkflowSchema.partial().extend({
  id: z.string().uuid()
})

export const workflowFilterSchema = z.object({
  organizationId: z.string().uuid().optional(),
  departmentId: z.string().uuid().optional(),
  isActive: z.boolean().optional(),
  search: z.string().optional()
})

export type CreateWorkflowInput = z.infer<typeof createWorkflowSchema>
export type UpdateWorkflowInput = z.infer<typeof updateWorkflowSchema>
export type WorkflowFilterInput = z.infer<typeof workflowFilterSchema>
```

```typescript
// src/schemas/index.ts - Add export
export * from './user'
export * from './client-user'
export * from './workflow'  // Add this
```

### 5. Create tRPC Router

Create domain-specific router with proper authentication:

```typescript
// src/server/trpc/routes/workflows.router.ts
import { z } from 'zod'
import { router, protectedProcedure } from '../index'
import { isAdmin, isSE, isClient } from './_helpers'
import { 
  createWorkflowSchema, 
  updateWorkflowSchema, 
  workflowFilterSchema 
} from '@/schemas/workflow'

export const workflowsRouter = router({
  // List workflows - available to all authenticated users
  list: protectedProcedure
    .input(workflowFilterSchema)
    .query(async ({ ctx, input }) => {
      return ctx.prisma.workflow.findMany({
        where: {
          ...(input.search && {
            name: { contains: input.search, mode: 'insensitive' }
          }),
          ...(input.isActive !== undefined && { isActive: input.isActive }),
          // RBAC automatically applied via context
        },
        include: {
          organization: true,
          department: true
        },
        orderBy: { createdAt: 'desc' }
      })
    }),

  // Get single workflow
  get: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.workflow.findUniqueOrThrow({
        where: { id: input.id },
        include: {
          organization: true,
          department: true,
          executions: { take: 10, orderBy: { createdAt: 'desc' } }
        }
      })
    }),

  // Create workflow - Admin and SE only
  create: isAdmin.or(isSE)
    .input(createWorkflowSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.workflow.create({
        data: input,
        include: {
          organization: true,
          department: true
        }
      })
    }),

  // Update workflow - Admin and SE only
  update: isAdmin.or(isSE)
    .input(updateWorkflowSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input
      return ctx.prisma.workflow.update({
        where: { id },
        data,
        include: {
          organization: true,
          department: true
        }
      })
    }),

  // Delete workflow - Admin only
  delete: isAdmin
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.workflow.delete({
        where: { id: input.id }
      })
    })
})
```

### 6. Update App Router

Add your new router to the main app router:

```typescript
// src/server/trpc/appRouter.ts
import { workflowsRouter } from './routes/workflows.router'

export const appRouter = router({
  auth: authRouter,
  users: usersRouter,
  clients: clientsRouter,
  clientUsers: clientUsersRouter,
  organizations: organizationsRouter,
  workflows: workflowsRouter,  // Add this
  dashboard: dashboardRouter,
  billing: billingRouter,
})
```

## Component Architecture Guidelines

### Page Component Responsibilities
- **Business Logic**: tRPC calls, mutations, state management
- **Data Transformation**: Processing API responses for UI consumption
- **Event Handling**: Form submissions, user interactions, routing
- **Layout Structure**: High-level page organization

### UI Component Responsibilities
- **Pure Presentation**: Receiving props, rendering UI
- **Local UI State**: Form inputs, modal open/closed states
- **Event Delegation**: Calling parent functions via props
- **Accessibility**: Proper ARIA labels, keyboard navigation

### When to Create Shared Components

Only move components to `src/components/` when they are:
1. **Used by 2+ pages** in different areas
2. **Truly generic** with customizable behavior
3. **Stable API** that won't change frequently

### Shell Component Pattern

When similar components emerge across pages, extract a reusable shell:

```typescript
// src/components/entity-form-modal.tsx (shell)
interface EntityFormModalProps<T> {
  title: string
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: T) => void
  validationSchema: ZodSchema<T>
  children: (form: UseFormReturn<T>) => React.ReactNode
}

export function EntityFormModal<T>({ 
  title, 
  isOpen, 
  onClose, 
  onSubmit, 
  validationSchema, 
  children 
}: EntityFormModalProps<T>) {
  const form = useForm<T>({ resolver: zodResolver(validationSchema) })
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {children(form)}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
```

```typescript
// src/app/(dashboard)/admin/workflows/components/add-workflow-modal.tsx (usage)
export function AddWorkflowModal({ isOpen, onClose, onSubmit }: AddWorkflowModalProps) {
  return (
    <EntityFormModal
      title="Add Workflow"
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={onSubmit}
      validationSchema={createWorkflowSchema}
    >
      {(form) => (
        <>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Workflow Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Additional workflow-specific fields */}
        </>
      )}
    </EntityFormModal>
  )
}
```

## Authentication & Authorization

### Route Protection

All pages in `(dashboard)` are automatically protected by layout-level authentication. Additional role checks happen in individual components:

```typescript
// In page components
import { useSession } from 'next-auth/react'
import { AuthSession } from '@/server/auth'

export default function AdminUsersPage() {
  const { data: session } = useSession() as { data: AuthSession }
  
  if (session?.user.role !== 'ADMIN') {
    return <div>Access denied</div>
  }
  
  // Rest of component...
}
```

### tRPC Route Protection

Use role-based middlewares in tRPC routes:

```typescript
// Available middlewares in _helpers.ts
import { isAdmin, isSE, isClient, protectedProcedure } from './_helpers'

// Admin only
const adminOnlyProcedure = isAdmin.input(schema).mutation(...)

// Admin or SE
const adminOrSEProcedure = isAdmin.or(isSE).input(schema).mutation(...)

// Any authenticated user
const anyUserProcedure = protectedProcedure.input(schema).query(...)
```

### Automatic Data Filtering

RBAC is automatically enforced at the database level via the RBAC guard. No manual `organizationId` filtering needed:

```typescript
// This query is automatically scoped to user's allowed organizations
const workflows = await ctx.prisma.workflow.findMany({
  where: { isActive: true }  // No need to add organizationId filter
})
```

## Available shadcn/ui Components

### Core Components
- **Button**: Multiple variants (default, destructive, outline, secondary, ghost, link)
- **Input**: Form inputs with full HTML input type support
- **Label**: Accessible form field labels
- **Card**: Content containers with Header/Content/Description/Title
- **Separator**: Visual dividers (horizontal/vertical)

### Layout & Navigation
- **Sidebar**: Complex navigation with collapsible, responsive behavior
- **Sheet**: Slide-out panels for mobile-friendly overlays
- **Drawer**: Bottom-up modal panels for mobile interactions
- **Breadcrumb**: Navigation context (available but not actively used)

### Form Components
- **Select**: Dropdown selections with Trigger/Content/Item/Value components
- **Checkbox**: Accessible boolean inputs
- **Toggle**: Boolean toggle states (alternative to checkbox)
- **Toggle Group**: Multi-choice toggle selections
- **Form**: react-hook-form integration with validation

### Data Display
- **Table**: Used with TanStack Table for advanced data tables
- **Badge**: Status indicators and tags with multiple variants
- **Avatar**: User profile images with fallback support
- **Skeleton**: Loading placeholders with reusable variants
- **Progress**: Progress indicators (0-100%)

### Interactive Components
- **Dropdown Menu**: Context menus with separators, checkboxes
- **Tooltip**: Hover/focus triggered contextual help
- **Tabs**: Content organization with List/Trigger/Content
- **Dialog**: Modal dialogs for forms and confirmations

### Specialized Components
- **Chart**: Data visualization wrapper for Recharts
- **Sonner**: Global toast notification system

## Loading States

### Skeleton Loading (Indeterminate)
Use for structure mimicking when you don't know exact progress:

```typescript
import { TablePageSkeleton } from "@/components/ui/skeleton"

export default function WorkflowsLoading() {
  return <TablePageSkeleton hasFilters={true} columns={4} rows={8} />
}
```

Available skeleton components:
- `TablePageSkeleton`: Full table pages with headers and filters
- `DashboardSkeleton`: Dashboard overview with cards and charts
- `PageHeaderSkeleton`: Page headers with title and action button
- `CardSkeleton`: Individual card components

### Progress Loading (Determinate)
Use for tracked operations with known completion percentage:

```typescript
import { Progress } from "@/components/ui/progress"

const [uploadProgress, setUploadProgress] = useState(0)
return <Progress value={uploadProgress} className="w-full" />
```

## Development Workflow

### 1. Planning Phase
- Identify the feature domain (users, workflows, billing, etc.)
- Determine required roles/permissions
- Plan the data flow and API contracts

### 2. Schema First
- Create or verify Zod schemas in `src/schemas/`
- Export from `src/schemas/index.ts`
- Define TypeScript types with `z.infer<>`

### 3. Backend Development
- Create/extend tRPC router in `src/server/trpc/routes/`
- Add proper authentication middlewares
- Add router to `appRouter.ts`

### 4. Frontend Development
- Create page component with business logic
- Build page-specific UI components
- Add loading states and error boundaries

### 5. Testing & Refinement
- Test RBAC and data isolation
- Verify loading states and error handling
- Ensure proper navigation and UX

## Best Practices

### Do's ✅
- Keep business logic in page components
- Use page-specific component folders
- Leverage automatic RBAC filtering
- Create domain-based tRPC routers
- Use TypeScript strictly
- Implement loading states for all pages
- Follow shadcn/ui patterns and conventions

### Don'ts ❌
- Don't put business logic in UI components
- Don't create shared components prematurely
- Don't bypass RBAC guards
- Don't organize tRPC routes by user role
- Don't forget authentication checks
- Don't skip loading states
- Don't use relative imports (use `@/` aliases)

This guide provides everything you need to build consistent, secure, and maintainable features in the Nexus platform.