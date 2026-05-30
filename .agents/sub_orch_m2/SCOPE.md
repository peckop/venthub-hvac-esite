# Scope: Middleware & Auth Integration (Milestone 2)

## Architecture
- **Edge-Safe Tenant Resolution**: Implement `src/lib/tenantResolver.ts` which performs host / subdomain mapping, returning the matching tenant UUID. Direct DB query inside middleware is strictly prohibited. Use static map fallback for development.
- **Middleware Integration**: Modify `src/middleware.ts` to use `tenantResolver.ts`, injecting `x-tenant-id` header and a `tenant_id` cookie. Preserve `detectLocale` and admin RBAC guard logic exactly without rewriting URLs.
- **JWT Claims Integration**: Hook `tenant_id` extraction into Supabase Auth via `app_metadata.tenant_id`. Link it with `user_profiles.tenant_id REFERENCES tenants(id)`.
- **Signup Tenant Auto-Assignment**: Automate tenant mapping during user signups, ensuring default tenant fallback.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Tenant Resolver Design | Create `src/lib/tenantResolver.ts` with Edge Config/static map fallback | None | DONE |
| 2 | Middleware Integration | Modify `src/middleware.ts` to extract domain/subdomain, run resolver, inject header/cookie, preserve locales | M1 | DONE |
| 3 | Auth & JWT Integration | Configure JWT claims and `user_profiles` relation, auto-assign tenant on signup | M2 | DONE |
| 4 | Verification & Audit | Validate with unit tests, compile-check, and run Forensic Integrity Audit to ensure zero data leaking | M3 | DONE |

## Interface Contracts
- Service helper: `src/lib/tenantResolver.ts` -> returns `{ tenantId: string, slug: string }`.
- Request Header: `x-tenant-id`.
- Request Cookie: `tenant_id`.
- Constraint: Never query the database directly inside the Edge Middleware.
