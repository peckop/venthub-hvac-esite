# Scope: Cache & Feature Flags (Milestone 3)

## Architecture
- **Server Tenant Config**: Implement `getTenantConfig()` helper in server context (reads `x-tenant-id` header), allowing Next.js 15 Server Components to safely access tenant-specific features and configuration.
- **Client Tenant Context**: Implement a React Context Provider and a `useTenant()` custom hook for Client Components to easily check tenant styles, feature flags, and settings.
- **Feature Flags System**: Use the `tenants.features` JSONB schema to conditionally render UI parts (e.g. 3D viewer, engineering calculators, PDF exports). Enforce that all features are open by default on the default tenant.
- **Cache Isolation**: Audit and update all Next.js server-side caching (`unstable_cache`, `next/cache`) to include the resolved `tenantId` in their cache key array (preventing cross-tenant data leaks).
- **Realtime Isolation**: Scope all Supabase Realtime WebSocket channels to be tenant-specific (e.g., `admin-orders-realtime-${tenantId}`).

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Feature Flags Setup | Design `getTenantConfig()` and React client Context Provider `useTenant()` | None | DONE |
| 2 | Cache Key Isolation | Audit cache helpers, inject `tenantId` in all `unstable_cache` keys and tag revalidations | M1 | DONE |
| 3 | Realtime Scoping | Update real-time admin WebSocket notifications to be tenant-scoped | M2 | DONE |
| 4 | Verification & Forensic Audit | Type check, verify layout constraints, and pass Forensic Integrity Audit | M3 | DONE |

## Interface Contracts
- Server helper: `src/utils/tenantServer.ts` -> `getTenantConfig()`
- Client Context Provider & Hook: `src/hooks/useTenant.tsx` -> `useTenant()`
- Realtime Channel Schema: `admin-orders-realtime-${tenantId}`
