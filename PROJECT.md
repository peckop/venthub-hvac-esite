# Project: VentHub HVAC Database Service Layer DI Refactoring

## Architecture
- **Dependency Injection**: Inject `supabase: SupabaseClient<Database>` as the first argument to all functions in the database service layer files under `src/lib/services/`.
- **Remove Static Imports**: Eliminate import and use of static clients (`supabaseBrowserClient`, `supabaseStaticClient`, `defaultClient`) at the module scope inside the service layer files.
- **Consumer Updates**: Ensure every caller in the codebase passes the context-appropriate active Supabase client instance (browser client for client components/hooks/providers, request-bound server client for server components/actions/route handlers).
- **Documentation**: Update README.md, CHANGELOG.md, and create RECOMMENDATIONS.md at the project root to capture DI patterns, changes made, and future architectural recommendations.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|---|---|---|---|
| M1 | Exploration & Caller Audit | Audit references to all 7 services and list functions/callers | None | DONE |
| M2 | Service & Caller Refactoring | Refactor 7 service files to strict DI and update all callers | M1 | DONE |
| M3 | Test Suite Updates | Update Vitest service test files to pass the Supabase client as the first argument | M2 | DONE |
| M4 | Documentation Updates | Update README.md, CHANGELOG.md, and create RECOMMENDATIONS.md | M2, M3 | DONE |
| M5 | Final Verification & Audit | Execute build, type-check, lint, test suite, and audit integrity | M3, M4 | IN_PROGRESS |

## Interface Contracts
### Service Functions (Strict DI)
- Signature: `export async function serviceFunction(supabase: SupabaseClient<Database>, ...args: any[]): Promise<Result>`
- No default values for `supabase` parameter.

## Code Layout
- `src/lib/services/address.service.ts`
- `src/lib/services/cart.service.ts`
- `src/lib/services/category.service.ts`
- `src/lib/services/invoice.service.ts`
- `src/lib/services/pricing.service.ts`
- `src/lib/services/product.service.ts`
- `src/lib/services/project.service.ts`
