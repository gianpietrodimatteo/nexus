# shadcn/ui Components Architecture

This document outlines the shadcn/ui components used in the Nexus platform and our single-page application architecture.

## Overview

We use **shadcn/ui** as our component library foundation, providing consistent, accessible, and customizable UI components. All components are located in `src/components/ui/` and follow the shadcn/ui patterns with our custom theme and styling.

## Single-Page Application Architecture

### Nested Layout Pattern

We implement a **nested layout pattern** using Next.js App Router to create seamless single-page experiences:

```
src/app/(dashboard)/
├─ admin/
│  ├─ layout.tsx          # Shared Admin shell (sidebar + header)
│  ├─ page.tsx            # /admin - Overview dashboard  
│  ├─ users/
│  │  ├─ page.tsx         # /admin/users - User management
│  │  └─ loading.tsx      # Loading state for users page
│  └─ clients/
│     └─ page.tsx         # /admin/clients - Client management
└─ client/
   ├─ layout.tsx          # Shared Client shell (different sidebar/nav)
   ├─ page.tsx            # /client - Client dashboard
   └─ workflows/
      └─ page.tsx         # /client/workflows - Workflow management
```

### Key Benefits

- **Persistent Shell**: Sidebar and header remain mounted across route changes
- **Smooth Navigation**: Only page content re-renders, not the entire layout  
- **Active State Management**: Navigation highlights current page using `useSelectedLayoutSegments`
- **Code Splitting**: Each page loads its own data and components
- **Loading States**: Per-route loading.tsx files provide instant feedback

## Available shadcn/ui Components

### ✅ Core Components

| Component | Location | Usage | Notes |
|-----------|----------|--------|-------|
| **Button** | `ui/button.tsx` | Primary actions, form submissions | Multiple variants: default, destructive, outline, secondary, ghost, link |
| **Input** | `ui/input.tsx` | Form inputs, search fields | Supports all HTML input types |
| **Label** | `ui/label.tsx` | Form field labels | Accessible labeling |
| **Card** | `ui/card.tsx` | Content containers | CardHeader, CardContent, CardDescription, CardTitle |
| **Separator** | `ui/separator.tsx` | Visual dividers | Horizontal/vertical orientations |

### ✅ Layout & Navigation

| Component | Location | Usage | Notes |
|-----------|----------|--------|-------|
| **Sidebar** | `ui/sidebar.tsx` | Main navigation shell | Complex component with collapsible, responsive behavior |
| **Sheet** | `ui/sheet.tsx` | Slide-out panels | Mobile-friendly overlays |
| **Drawer** | `ui/drawer.tsx` | Bottom-up modal panels | Mobile-optimized interactions |
| **Breadcrumb** | `ui/breadcrumb.tsx` | Navigation context | Not currently used but available |

### ✅ Form Components

| Component | Location | Usage | Notes |
|-----------|----------|--------|-------|
| **Select** | `ui/select.tsx` | Dropdown selections | SelectTrigger, SelectContent, SelectItem, SelectValue |
| **Checkbox** | `ui/checkbox.tsx` | Boolean form inputs | Accessible checkbox component |
| **Toggle** | `ui/toggle.tsx` | Boolean toggle states | Alternative to checkbox |
| **Toggle Group** | `ui/toggle-group.tsx` | Multi-choice toggles | Radio group alternative |

### ✅ Data Display

| Component | Location | Usage | Notes |
|-----------|----------|--------|-------|
| **Table** | `ui/table.tsx` | Structured data display | Used with TanStack Table in data-table.tsx |
| **Badge** | `ui/badge.tsx` | Status indicators, tags | Multiple variants available |
| **Avatar** | `ui/avatar.tsx` | User profile images | Fallback support |
| **Skeleton** | `ui/skeleton.tsx` | Loading placeholders | Base skeleton + reusable skeleton variants |
| **Progress** | `ui/progress.tsx` | Progress indicators | Shows completion percentage (0-100%) |

### ✅ Interactive Components

| Component | Location | Usage | Notes |
|-----------|----------|--------|-------|
| **Dropdown Menu** | `ui/dropdown-menu.tsx` | Context menus, action lists | Rich menu system with separators, checkboxes |
| **Tooltip** | `ui/tooltip.tsx` | Contextual help | Hover/focus triggered |
| **Tabs** | `ui/tabs.tsx` | Content organization | TabsList, TabsTrigger, TabsContent |

### ✅ Specialized Components

| Component | Location | Usage | Notes |
|-----------|----------|--------|-------|
| **Chart** | `ui/chart.tsx` | Data visualization | Custom wrapper for Recharts integration |
| **Sonner** | `ui/sonner.tsx` | Toast notifications | Global notification system |

## Custom Components Built on shadcn/ui

### Application-Specific Components

| Component | Built With | Purpose |
|-----------|------------|---------|
| **AppSidebar** | Sidebar, SidebarMenu, SidebarMenuItem | Main navigation with role-based menu items |
| **SiteHeader** | Custom layout | Top navigation bar with user info |
| **NavMain** | SidebarMenu + Link | Navigation with active state highlighting |
| **NavUser** | SidebarMenuItem | User profile display in sidebar |
| **DataTable** | Table + TanStack Table | Advanced data tables with sorting, filtering |
| **LoginForm** | Card, Input, Button, Label | Authentication form |
| **SectionCards** | Card | Dashboard overview cards |

## Theme & Styling

### CSS Variables
Our theme uses CSS variables for consistent theming:
```css
:root {
  --background: hsl(0 0% 100%);
  --foreground: hsl(240 10% 3.9%);
  --primary: hsl(240 5.9% 10%);
  /* ... more variables */
}
```

### Tailwind Integration
- All components use Tailwind CSS classes
- Custom utilities in `lib/utils.ts` with `cn()` helper
- Responsive design with mobile-first approach

## Loading States Architecture

### Two Types of Loading States

#### 1. **Indeterminate Loading** (Structure Mimicking)
Use **skeleton loading** when you don't know the exact progress but want to show the structure of content being loaded:

```typescript
import { TablePageSkeleton, DashboardSkeleton } from "@/components/ui/skeleton"

// In loading.tsx files
export default function UsersLoading() {
  return <TablePageSkeleton hasFilters={true} hasAvatar={true} />
}
```

#### 2. **Determinate Loading** (Progress Tracking)
Use **Progress component** when you can track actual completion percentage:

```typescript
import { Progress } from "@/components/ui/progress"

// For file uploads, data processing, etc.
<Progress value={uploadProgress} className="w-full" />
```

### Available Skeleton Components

| Component | Use Case | Props |
|-----------|----------|--------|
| `TablePageSkeleton` | Full table pages with headers and filters | `hasFilters`, `columns`, `rows`, `hasAvatar` |
| `DashboardSkeleton` | Dashboard overview with cards and charts | None |
| `PageHeaderSkeleton` | Page headers with title and action button | None |
| `CardSkeleton` | Individual card components | None |
| `TableHeaderSkeleton` | Just table headers | `columns` |
| `TableRowSkeleton` | Just table rows | `rows`, `columns`, `hasAvatar` |

## Usage Patterns

### Import Pattern
```typescript
// shadcn/ui components
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

// Skeleton components
import { TablePageSkeleton } from "@/components/ui/skeleton"

// Custom application components  
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
```

### Layout Pattern
```typescript
// In admin/layout.tsx
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title="Admin Panel" />
        <div className="flex flex-1 flex-col">
          <Suspense fallback={<LoadingSkeleton />}>
            {children}
          </Suspense>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
```

### Active Navigation Pattern
```typescript
// Using useSelectedLayoutSegments for navigation state
const segments = useSelectedLayoutSegments()
const isActive = (url: string) => {
  if (url === "/admin" && segments.length === 0) return true
  return url.includes(`/${segments[0]}`)
}
```

## Development Guidelines

### Component Creation
1. **Use shadcn/ui first**: Check if a component exists before building custom
2. **Extend, don't replace**: Build on top of shadcn components when possible
3. **Consistent styling**: Use theme variables and Tailwind utilities
4. **Accessibility**: Leverage shadcn's built-in accessibility features

### File Organization
```
src/components/
├─ ui/                    # shadcn/ui components (managed by CLI)
│  ├─ skeleton.tsx        # Base Skeleton + reusable skeleton variants
│  ├─ progress.tsx        # Progress indicators for determinate loading
│  └─ ...                 # Other shadcn/ui components
├─ app-sidebar.tsx        # App-specific layout components
├─ site-header.tsx        # Custom header component
├─ nav-*.tsx             # Navigation components
├─ data-table.tsx        # Complex data display
└─ section-cards.tsx     # Dashboard components
```

### Best Practices

#### Component Creation
- **Composition over inheritance**: Combine simple components into complex ones
- **Consistent prop patterns**: Follow shadcn conventions for props and variants
- **TypeScript integration**: Leverage component prop types and variants

#### Loading States
- **Use appropriate loading type**: Skeleton for structure, Progress for tracked operations
- **Reuse skeleton components**: Use pre-built skeletons instead of custom ones
- **Match layout structure**: Skeleton should mirror actual content layout
- **Performance**: Use loading states and Suspense boundaries for smooth UX

#### Examples
```typescript
// ✅ Good: Use appropriate loading type
const [uploadProgress, setUploadProgress] = useState(0)
return <Progress value={uploadProgress} />

// ✅ Good: Reuse skeleton components
export default function ClientsLoading() {
  return <TablePageSkeleton hasFilters={false} columns={5} />
}

// ❌ Avoid: Custom skeleton when reusable exists
return <div className="h-4 bg-gray-200 animate-pulse" />
```

## Future Expansion

### Planned Components
As the application grows, we may add:
- **Command** - Command palette for quick actions
- **Popover** - Context-sensitive information
- **Dialog** - Modal dialogs for complex forms
- **Calendar** - Date selection components
- **Form** - Enhanced form handling with validation

### SPA Enhancement
- Add more loading.tsx files for instant feedback
- Implement optimistic updates for better perceived performance
- Add page transitions and animations
- Enhance error boundaries for better error handling