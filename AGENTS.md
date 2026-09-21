# Enterprise Fullstack Engineering Standards

This document establishes foundational architectural guidelines, design principles, and coding standards for developing and maintaining modern fullstack enterprise applications using **Next.js 16 (App Router)**, **React 19**, **TypeScript 5**, **Tailwind CSS v4**, **Shadcn / Radix UI**, **Supabase SSR**, **Bun**, and **Docker**.

Agents and developers working on this codebase MUST follow these standards to ensure long-term maintainability, consistency, performance, and security.

---

## 1. High-Level Technology Architecture

| Layer / Responsibility | Technology Stack |
| :--- | :--- |
| **Runtime & Package Manager** | Bun (`bun@1.3+`) for local dependency resolution & builds; Node.js 22 LTS for production container runtime |
| **Framework & Router** | Next.js 16 App Router (`app/(platform)/...`, Server & Client Components) |
| **Language & Typing** | TypeScript 5 (Strict Mode, zero `any` allowance) |
| **Styling & Design System** | Tailwind CSS v4 with `@theme inline` semantic variables, OKLCH color palettes, full `.dark` mode contrast parity |
| **Component Library** | Radix UI primitives, Shadcn UI (`components/ui/`), Lucide React icons, Sonner toast notifications |
| **Micro-Animations** | Framer Motion for purposeful page and state transitions |
| **State & Data Fetching** | TanStack Query v5 (React Query) for server-state caching, synchronization, and optimistic mutations |
| **Forms & Validation** | React Hook Form paired with Zod schemas |
| **Backend & Database** | Supabase (PostgreSQL with Row Level Security, Auth, Storage) via `@supabase/ssr` |
| **DevOps & Containerization** | Multi-stage Docker build (`oven/bun:1-alpine` build + `node:22-alpine` non-root runner), Docker Compose, Next.js Standalone build |

---

## 2. Universal Golden Rules

1. **Feature-Driven Encapsulation**:
   - Application business logic, domain services, domain types, and domain-specific UI must live within `features/<feature-name>/`.
   - Never import internal files of one feature into another directly (`@/features/feature-a/components/internal-card`). Always consume exported symbols through the public barrel export (`@/features/feature-a`).

2. **Strict Separation of Concerns**:
   - **UI Components** (`components/`) are presentation-only. They receive props, trigger callbacks, and delegate logic to hooks or services.
   - **Data Access & Business Logic** (`services/`) encapsulate database queries, external API calls, and data mapping. UI components must never construct raw SQL or call ad-hoc database queries directly.
   - **Form Logic** is separated into explicit Zod schemas (`schemas/`), validated before mutation.

3. **Absolute Dark Mode Parity**:
   - The user interface must support seamless Light and Dark modes.
   - Never use raw Tailwind utilities that break in dark mode (e.g., `text-gray-900` or `bg-white` without dark mode tokens or semantic CSS variables like `text-foreground`, `bg-card`, `bg-background`).
   - All form inputs, selects, and textareas must maintain high-contrast readability in dark mode.

4. **Zero Untyped Code**:
   - `any` is strictly prohibited. Use explicit TypeScript interfaces, generics, or `unknown` with type narrowing.
   - Database row types must be cleanly mapped to Domain Entities via dedicated mapper functions before passing data to UI components.

5. **Security by Default**:
   - Never authenticate or authorize solely using `supabase.auth.getSession()` on the server; always use `await supabase.auth.getUser()`.
   - All API endpoints and Server Actions must validate incoming payloads against Zod schemas.
   - Sensitive environment variables and service keys must never have the `NEXT_PUBLIC_` prefix.

6. **Bun & Next.js Script Execution**:
   - Use `bun install` for package installations.
   - Use `bun run dev` for local development and `bun run build` for compiling.

---

## 3. Directory Structure

```text
├── app/                      # Next.js App Router (Routing, Layouts, Route Handlers)
│   ├── (platform)/           # Authenticated application route group
│   │   ├── layout.tsx        # Platform shell (Sidebar, Header, Breadcrumbs)
│   │   └── <feature>/page.tsx# Feature entry page consuming feature modules
│   ├── api/                  # Backend Route Handlers (REST endpoints)
│   ├── auth/                 # Authentication route group (Login, Reset, etc.)
│   ├── layout.tsx            # Root layout (Providers, Fonts, Theme)
│   └── page.tsx              # Public or landing page
├── components/               # Global shared reusable components
│   ├── animation/            # Framer Motion transitions (fade-in, stagger)
│   ├── layout/               # Global layout blocks (AppSidebar, PageHeader, Nav)
│   └── ui/                   # Primitive design system components (Button, Dialog, etc.)
├── features/                 # Modular Domain-Driven Feature Modules
│   └── <feature-name>/       # Self-contained feature module
│       ├── components/       # Feature-specific components
│       ├── context/          # Optional feature-specific context
│       ├── hooks/            # Feature-specific hooks & queries
│       ├── schemas/          # Zod validation schemas
│       ├── services/         # Repositories, API callers, entity mappers
│       ├── types/            # Domain interfaces and DB row schemas
│       ├── utils/            # Domain calculation and formatting utilities
│       └── index.ts          # Public API barrel export
├── hooks/                    # Global utility React hooks
├── lib/                      # Cross-cutting libraries and utilities
│   ├── supabase/             # Supabase clients (client, server, middleware)
│   ├── api-client.ts         # Unified resilient fetch client
│   └── utils.ts              # Global style utilities (cn, clsx, twMerge)
├── providers/                # Global React context providers (QueryClient, Theme)
├── public/                   # Static assets (images, icons, fonts)
├── styles/                   # Global styles & Tailwind v4 `@theme` tokens
├── types/                    # Global ambient TypeScript definitions
└── .agents/                  # Workspace Agent Customization (Skills & Rules)
    ├── rules/                # Coding guidelines and quality rules
    └── skills/               # Task-specific agent execution runbooks
```

---

## 4. Specialized Skills Index

When working on specific domains or workflows, activate the corresponding skill:

- **[UI/UX & Design System](file:///.agents/skills/ui-ux-design-system/SKILL.md)**: Styling with Tailwind CSS v4, dark mode contrast rules, Radix primitives, micro-animations.
- **[Feature-Driven Architecture](file:///.agents/skills/feature-driven-architecture/SKILL.md)**: Encapsulation boundaries, barrel exports, subfolder roles, route integration.
- **[Refactoring & Clean Code](file:///.agents/skills/refactoring-clean-code/SKILL.md)**: Repository pattern, database-to-domain mapping, defensive parsing, eliminating debt.
- **[Backend & Supabase Architecture](file:///.agents/skills/backend-supabase-api/SKILL.md)**: SSR authentication, server/client Supabase instances, route handlers, error handling.
- **[Application Security](file:///.agents/skills/application-security/SKILL.md)**: Safe session validation, RLS, Zod payload validation, secret isolation, container hardening.
- **[DevOps & Docker Deployment](file:///.agents/skills/devops-docker-deployment/SKILL.md)**: Multi-stage Docker builds, Bun caching, standalone Next.js bundling, healthchecks.
- **[Forms & State Management](file:///.agents/skills/forms-state-management/SKILL.md)**: React Hook Form + Zod, TanStack Query cache invalidation, feedback toasts.
