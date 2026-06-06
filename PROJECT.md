# Project: VentHub HVAC Client Architecture Upgrade

## Architecture
- **Supabase Client Factories**: Split the singleton `src/lib/supabase.ts` into three separate factory creators:
  - **Browser Client** (`src/lib/supabase/client.ts`): Client-side singleton utilizing `createBrowserClient`.
  - **Server Client** (`src/lib/supabase/server.ts`): Per-request server client utilizing `createServerClient` and `cookies()`.
  - **Static Client** (`src/lib/supabase/static.ts`): Cookie-less `createClient` for static rendering boundaries.
- **Service Decoupling**: Remove the bulk re-exports (`export *`) from `src/lib/supabase.ts` and require consumers to import services directly.
- **Middleware & Auth Security**: Transition middleware from `getSession()` to `getClaims()` and inline JWT role enforcement. Upgrade the Auth action to utilize per-request server client and support clean cookie propagation.
- **Realtime Isolation**: Enforce private channels and tenant-based PostgreSQL subscriptions.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|---|---|---|---|
| M1 | Client Factories & Data/Type Migration | Setup client factories under `src/lib/supabase/`, move types to `src/types/`, and brands data to `src/data/brands.ts`. | None | DONE (Worker 1: 9739dbd7-b83b-4583-acf7-3b8376d0fc41) |
| M2 | Middleware & Auth Security Upgrade | Update `src/middleware.ts` (getClaims, JWT role) and `src/actions/auth.ts` (per-request client, cookie handling, signout route). | M1 | DONE |
| M3 | Realtime & SSG/SSR Boundaries | Channel hardening (private: true, tenant filter) and dynamic force-dynamic config on SSG/SSR pages. | M2 | DONE |
| M4 | Codebase Import Updates | Resolve and update import paths across 70+ consumer files. | M1, M2, M3 | DONE |
| M5 | Final Verification & Docs | Execute build, type-check, lint, test suite (>=401 pass), update README/CHANGELOG, and write RECOMMENDATIONS.md. | M4 | DONE |

> ℹ️ **Milestones Validation Note**: All milestones (M1–M5) have been successfully completed. The system compiles cleanly, lints with 0 errors, passes all 410 Vitest tests, and a global forensic audit has issued a certified CLEAN verdict.

## Interface Contracts
### Supabase Client Factories
- Browser client: `createBrowserClient<Database>(...)`
- Server client: `createServerClient<Database>(..., { cookies: { ... } })`
- Static client: `createClient<Database>(...)`

### Middleware Auth Security
- Claims-based RBAC enforcement replacing `getSession()` and `decodeJwt()`

## Code Layout
- `src/lib/supabase/client.ts` - Browser client singleton factory
- `src/lib/supabase/server.ts` - Request-bound server client factory
- `src/lib/supabase/static.ts` - Cookie-less static client factory
- `src/middleware.ts` - Edge middleware for claims verification
- `src/actions/auth.ts` - Request-bound server actions for auth
- `app/auth/signout/route.ts` - Route handler for signout
