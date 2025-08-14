# Nexus Platform

Next.js 14 SPA hosting both Admin and Client dashboards for the Nexus platform. Built with React 19, TypeScript, Tailwind + shadcn‑ui, tRPC, Prisma, and PostgreSQL.

## Quick Start

1. Install dependencies:

```bash
pnpm install
```

2. Start the development database (PostgreSQL via Docker):

```bash
pnpm db:up
```

3. Set up the database:

```bash
pnpm db:migrate  # Run migrations
pnpm db:seed    # Seed test data
```

4. Start the development server:

```bash
pnpm dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

### Test Credentials

```
Admin:  admin@usebraintrust.com / password123
SE:     se@usebraintrust.com / password123
Client: client@acme.com / password123
```

## Development Commands

- `pnpm db:fresh` - Reset database container and regenerate Prisma client
- `pnpm db:studio` - Open Prisma Studio to browse data
- `pnpm db:reset` - Reset database to clean state (drops all tables)
- `pnpm lint` - Run ESLint
- `pnpm format` - Run Prettier

## Icons

This project uses an automated SVG sprite. Place raw SVGs in `src/assets/icons/` and generate `public/sprite.svg` with your chosen tooling (e.g., svg-sprite-cli). Use the universal component `src/components/Icon.tsx`:

```tsx
import { Icon } from "@/components/Icon"

<Icon name="dashboard" className="size-4 text-foreground" />
```
