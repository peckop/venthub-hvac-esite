# BRIEFING — 2026-05-30T22:16:04+03:00

## Mission
Implement Milestone 2: Middleware & Auth Integration inside the venthub-hvac workspace, ensuring edge-safe tenant resolution, middleware tenant injection, Supabase auth claims triggers, and client-side signup integration.

## 🔒 My Identity
- Archetype: implementer, qa, specialist
- Roles: implementer, qa, specialist
- Working directory: c:\Users\alize\venthub-hvac\.agents\worker_m2
- Original parent: c61ebd5e-14be-426b-a262-9dc3f90f4762
- Milestone: Milestone 2: Middleware & Auth Integration

## 🔒 Key Constraints
- CODE_ONLY network mode: No external internet access or curl/wget of external resources.
- Minimal change principle: Only modify what is necessary, preserving unrelated comments/styles.
- Edge-Safe: No database queries in `src/middleware.ts` for tenant resolution.
- Verify using `pnpm run type-check`.

## Current Parent
- Conversation ID: c61ebd5e-14be-426b-a262-9dc3f90f4762
- Updated: not yet

## Task Summary
- **What to build**:
  1. Edge-safe Tenant Resolver (`src/lib/tenantResolver.ts`).
  2. Middleware Tenant Injection in `src/middleware.ts`.
  3. Supabase Auth Claims Integration Migration (`supabase/migrations/20260530221000_tenant_auth_integration.sql`).
  4. Client-side signup modification in `src/contexts/AuthContext.tsx`.
- **Success criteria**:
  - Compiles successfully via `pnpm run type-check`.
  - Headers and cookies injected in middleware correctly.
  - Supabase triggers properly configured with security definer and search paths.
- **Interface contracts**: `src/lib/tenantResolver.ts`, `src/middleware.ts`, `src/contexts/AuthContext.tsx`, `supabase/migrations/20260530221000_tenant_auth_integration.sql`
- **Code layout**: Source in `src/`, database migrations in `supabase/migrations/`.

## Key Decisions Made
- [TBD]

## Change Tracker
- **Files modified**:
  - `src/lib/tenantResolver.ts`: Created TenantResolver with default/subdomain mapping.
  - `src/middleware.ts`: Integrated tenant resolution and cookie propagation.
  - `supabase/migrations/20260530221000_tenant_auth_integration.sql`: Created SQL triggers for tenant app_metadata injection and profile sync.
  - `src/contexts/AuthContext.tsx`: Appended tenant_id cookie value to signUp options.data.
- **Build status**: Pending type-check.
- **Pending issues**: None.

## Quality Status
- **Build/test result**: Unknown.
- **Lint status**: Unknown.
- **Tests added/modified**: None.

## Loaded Skills
- **Source**: c:\Users\alize\venthub-hvac\.agent\skills\supabase\SKILL.md
- **Local copy**: c:\Users\alize\venthub-hvac\.agents\worker_m2\supabase_SKILL.md
- **Core methodology**: Supabase database, triggers, auth, and client integrations.
- **Source**: c:\Users\alize\venthub-hvac\.agent\skills\supabase-security\SKILL.md
- **Local copy**: c:\Users\alize\venthub-hvac\.agents\worker_m2\supabase_security_SKILL.md
- **Core methodology**: RLS policies, migrations, security definer triggers and search path requirements.

## Artifact Index
- c:\Users\alize\venthub-hvac\.agents\worker_m2\original_prompt.md — Copy of the dispatch user request.
