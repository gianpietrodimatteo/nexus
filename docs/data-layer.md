# Data Layer Architecture

## Overview

The Nexus platform data layer supports a multi-tenant SaaS architecture with role-based access control across Admin and Client applications. Built on PostgreSQL with Prisma ORM, the data model enforces strict isolation between client organizations while enabling granular access control for different user roles.

## Core Entities

### User Management

```
User
├── id (UUID, primary key)
├── email (unique)
├── name
├── phone
├── role (ADMIN | SE | CLIENT)
├── organizationId (foreign key to Organization)
├── createdAt
└── updatedAt

Role-specific extensions:
- SE: hourlyRateCost, hourlyRateBillable
- Client: departmentId, billingAccess, adminAccess, notificationPreferences
```

### Organization Structure

```
Organization (Client)
├── id (UUID, primary key)
├── name
├── url
├── contractStartDate
├── contractEndDate
├── assignedSEs[] (many-to-many with User)
├── subscriptionPlanId (foreign key)
├── pipelinePhase (enum)
├── createdAt
└── updatedAt

Department
├── id (UUID, primary key)
├── name
├── organizationId (foreign key)
├── createdAt
└── updatedAt
```

### Workflow System

```
Workflow
├── id (UUID, primary key)
├── name
├── description
├── organizationId (foreign key)
├── departmentId (foreign key)
├── isActive (boolean)
├── nodeCount
├── timeSavedPerExecution (minutes)
├── moneySavedPerExecution (decimal)
├── createdAt
└── updatedAt

Execution
├── id (UUID, primary key)
├── workflowId (foreign key)
├── status (SUCCESS | FAILED | IN_PROGRESS)
├── executionDetails (JSON)
├── startedAt
├── completedAt
└── createdAt

Exception
├── id (UUID, primary key)
├── workflowId (foreign key)
├── organizationId (foreign key)
├── departmentId (foreign key)
├── type (AUTHENTICATION | DATA_PROCESS | INTEGRATION | WORKFLOW_LOGIC | BROWSER_AUTOMATION)
├── severity (CRITICAL | HIGH | MEDIUM | LOW)
├── status (NEW | IN_PROGRESS | RESOLVED | IGNORED)
├── remedy (text)
├── reportedAt
└── resolvedAt
```

### Billing System

```
SubscriptionPlan
├── id (UUID, primary key)
├── name
├── pricingModel (CONSUMPTION)
├── contractLength (MONTH | QUARTER | YEAR)
├── billingCadence (MONTHLY | QUARTERLY)
├── setupFee (decimal)
├── prepaymentPercentage (decimal)
├── capAmount (decimal)
├── overageCost (decimal)
├── creditsPerPeriod (integer)
├── pricePerCredit (decimal)
├── productUsageAPI (AIR_DIRECT | NEXUS_BASE)
├── createdAt
└── updatedAt

Invoice
├── id (UUID, primary key)
├── organizationId (foreign key)
├── invoiceDate
├── dueDate
├── amount (decimal)
├── paymentMethod (STRIPE | ERP)
├── status (PENDING | PAID | OVERDUE)
├── stripeInvoiceId (nullable)
├── createdAt
└── updatedAt

Credit
├── id (UUID, primary key)
├── organizationId (foreign key)
├── amount (decimal)
├── reason (text)
├── appliedBy (foreign key to User)
├── appliedAt
└── createdAt
```

### Credentials & Integration

```
Credential
├── id (UUID, primary key)
├── organizationId (foreign key)
├── serviceName
├── encryptedData (JSON, encrypted at rest)
├── status (CONNECTED | DISCONNECTED)
├── createdAt
└── updatedAt
```

### Document Management

```
DocumentLink
├── id (UUID, primary key)
├── organizationId (foreign key)
├── type (SURVEY_QUESTIONS | SURVEY_RESULTS | PROCESS_DOC | ADA_PROPOSAL | CONTRACT | FACTORY_MARKDOWN | TEST_PLAN)
├── url (text)
├── createdAt
└── updatedAt
```

### Pipeline Tracking

```
PipelinePhase
├── id (UUID, primary key)
├── organizationId (foreign key)
├── phase (enum: DISCOVERY_SURVEY | DISCOVERY_DEEP_DIVE | ADA_PROPOSAL_SENT | ADA_PROPOSAL_REVIEW | ADA_CONTRACT_SENT | ADA_CONTRACT_SIGNED | CREDENTIALS_COLLECTED | FACTORY_BUILD | TEST_PLAN_GENERATED | TESTING_STARTED | PRODUCTION_DEPLOY)
├── completedAt (nullable)
├── createdAt
└── updatedAt
```

## Access Control Patterns

### Role-Based Data Access

**Admin (Braintrust Employee)**
- Full access to all organizations, users, and system data
- Can manage subscription plans and billing
- Read/write access to all exceptions and logs
- User management across all roles

**Solutions Engineer (SE)**
- Access limited to assigned organizations via `assignedSEs` relationship
- Read/write access to assigned client data, workflows, and exceptions
- Cannot manage other Admins or SEs
- Can manage client users within assigned organizations

**Client User**
- Access strictly limited to own organization via `organizationId`
- Department-level filtering based on user's `departmentId`
- Read-only access to billing (unless `billingAccess = true`)
- User management limited to own organization (if `adminAccess = true`)

### Data Isolation Strategy

```typescript
// Basic Prisma query patterns for role-based access

// SE access pattern - limited to assigned organizations
const clientWorkflows = await prisma.workflow.findMany({
  where: {
    organization: {
      assignedSEs: {
        some: { id: currentUser.id }
      }
    }
  }
});

// Client access pattern - organization scoped
const organizationData = await prisma.organization.findUnique({
  where: { 
    id: currentUser.organizationId
  },
  include: {
    departments: true,
    workflows: {
      where: currentUser.departmentId ? { departmentId: currentUser.departmentId } : {}
    }
  }
});

// Admin access pattern - unrestricted
const allOrganizations = await prisma.organization.findMany({
  include: {
    users: true,
    workflows: true,
    assignedSEs: true
  }
});
```

### Planned RBAC Architecture

**Context Helper Pattern**
```typescript
// src/server/auth/getAllowedOrgs.ts
const allowedOrgIds = session.role === 'ADMIN' 
  ? undefined // no restriction
  : session.role === 'SE' 
    ? await prisma.organization.findMany({
        where: { assignedSEs: { some: { id: session.user.id } } },
        select: { id: true }
      }).then(list => list.map(o => o.id))
    : [session.user.organizationId];
```

**Prisma Middleware Safety Net**
```typescript
// src/server/prisma/middleware/rbacGuard.ts
prisma.$use(async (params, next) => {
  if (!ctx.allowedOrgIds) return next(params); // ADMIN bypass
  if ('where' in params.args) {
    params.args.where = {
      AND: [
        params.args.where,
        { organizationId: { in: ctx.allowedOrgIds } }
      ]
    };
  }
  return next(params);
});
```

**Planned Folder Structure**
```
src/server/
├── auth/
│   ├── withRole.ts          # Route guard helpers
│   └── getAllowedOrgs.ts    # Organization access computation
└── prisma/
    └── middleware/
        └── rbacGuard.ts     # Automatic organization scoping
```

## Implementation Guidelines

### Authentication System
- **Basic email/password authentication** using next-auth
- **Session management** with JWT tokens
- **No OAuth integration** required for test project
- **No 2FA/passkey** complexity needed

### Application Architecture
- **Shared database** between Admin and Client applications
- **Route-based separation**: `/admin/*` and `/client/*` under `src/app/(dashboard)/`
- **Desktop web only** - no mobile responsive design required
- **Shared components** and utilities in common directories

### Simplified Features
- **No SMS notifications** - email-only exception alerts
- **No data retention policies** - keep all logs, exceptions, and execution history indefinitely
- **No accessibility requirements** - focus on functionality and design quality
- **Missing design states** - implement reasonable loading, error, and empty states where Figma designs are incomplete

### Development Priorities
1. **Functionality** - complete feature implementation that works
2. **Code quality** - clean, maintainable TypeScript with proper error handling
3. **Design accuracy** - match Figma designs where available, create production-quality UI for missing elements

### Data Security (Simplified)
- **Basic encryption** for sensitive credential data
- **Role-based middleware** for route protection
- **Organization-scoped queries** to prevent cross-tenant data access
- **Input validation** and sanitization for all user inputs
