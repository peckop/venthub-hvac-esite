# Project: VentHub Multi-Tenant SaaS Foundation (Phase 1)

## Architecture
- **Tenant Resolution**: Handled in Middleware (`src/middleware.ts`) via Edge-safe resolver (`src/lib/tenantResolver.ts`) using domain/subdomain parsing. Direct DB querying inside middleware is strictly prohibited. Fallback static map is used in development.
- **Tenant Context Propagation**: Propagated downstream via request header `x-tenant-id` and a cookie.
- **Database Multi-Tenancy**: Shared database schema with tenant isolation using row-level security (RLS). Every tenant-aware table has a `tenant_id` column referencing the `tenants` table.
- **Auth Integration**: Supabase Auth JWT claims (`app_metadata.tenant_id`) populated on login/signup, linked via `user_profiles.tenant_id`.
- **Cache Isolation**: All Next.js cache entries (`unstable_cache`) use key schema `[key, lang, tenantId]`.
- **Hybrid Feature Flags**: Async server-side `getTenantConfig()` + client-side `useTenant()` React context.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Database & Schema Setup | `tenants` table, `tenant_id` columns, FK indexes, `jwt_tenant_id()` helper, RLS updates, Default Tenant migration | None | DONE |
| M2 | Middleware & Auth | `tenantResolver.ts` implementation, `middleware.ts` header injection, JWT claim setup, `user_profiles` link | M1 | DONE |
| M3 | Cache & Feature Flags | `getTenantConfig()`, `useTenant()`, Cache key isolation, Realtime channel isolation | M2 | DONE |
| M4 | Webhooks & Edge Functions | DB INSERT/UPDATE Edge Functions audit, Webhook isolation (shipping & iyzico), Storage Bucket RLS | M2, M3 | DONE |
| M5 | final_e2e_pass | Pass 100% of generated E2E tests, execute Tier 5 Adversarial Coverage Hardening | M1, M2, M3, M4 | DONE |

> ℹ️ **Milestone 5 Validation Note**: All 89 E2E tests are successfully passing, and the global forensic audit has issued a certified CLEAN verdict.

## Interface Contracts
### Middleware ↔ Downstream App
- Header name: `x-tenant-id` (UUID format or 'default')
- Cookie name: `tenant_id`
- Server utility: `getTenantConfig(): Promise<TenantConfig>` returns features, styles, configuration.
- Client utility: `useTenant(): TenantContext` provides runtime state of active tenant.

### JWT Claims ↔ RLS Policies
- `jwt_tenant_id()` RPC returns active tenant UUID from `app_metadata.tenant_id`.
- RLS Policy Condition: `tenant_id = jwt_tenant_id()` for authenticated writes and reads.

## Code Layout
- `src/lib/tenantResolver.ts` - Edge-safe tenant resolver.
- `src/middleware.ts` - Next.js Middleware injecting tenant headers.
- `src/hooks/useTenant.ts` - Client hook for React component feature flags & styling.
- `src/utils/tenantServer.ts` - Server-side tenant helper `getTenantConfig()`.
- `supabase/migrations/` - Atomic PostgreSQL database migrations.
