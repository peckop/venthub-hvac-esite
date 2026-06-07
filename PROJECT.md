# Project: VentHub HVAC Database Service Layer DI & Security Upgrades

## Architecture
- **Dependency Injection (DI)**: Strict injection of `supabase: SupabaseClient<Database>` as the first argument in all database service files under `src/lib/services/`.
- **Client-Side DI**: `SupabaseProvider` React Context and `useSupabaseClient()` hook in `src/providers/SupabaseProvider.tsx` to handle client components, providers, and hooks.
- **Server-Side DI Registry**: A request-bound `ServiceRegistry` in `src/lib/services/registry.ts` to instantiate services dynamically per-request.
- **Connection Pooling**: Targeting transaction-mode pooler endpoint (port `6543`) in `.env.local` to prevent serverless database connection exhaustion.
- **Edge Claims Cache & Cookie Replay**: Secure Edge-safe claims encryption (AES-GCM) written to `sb-claims-cache` cookie and a standardized redirect cookie helper in `src/utils/router.ts`.
- **Static Guards & AST Tests**: ESLint `no-restricted-imports` and AST tests (`src/lib/__tests__/diSignature.test.ts`) enforcing DI signature boundaries.
- **WebSocket RLS Validation**: Realtime security testing (`tests/e2e/realtimeSecurity.test.ts`) validating cross-tenant isolation.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|---|---|---|---|
| M1 | DB Pooler & Env Config | Update `.env.local` connection port to `6543`, define `JWT_CLAIMS_COOKIE_SECRET` | None | DONE |
| M2 | Edge Middleware & Router | Create `src/utils/router.ts` for cookie replication, add secure claims caching (AES-GCM) in `src/middleware.ts` | M1 | DONE |
| M3 | Client-Side DI Setup | Create `SupabaseProvider.tsx`, refactor browser providers, hooks, and client components | M1 | DONE |
| M4 | Server-Side DI Registry | Create request-bound `ServiceRegistry` in `src/lib/services/registry.ts`, update RSC/Actions/APIs | M3 | DONE |
| M5 | Guards & Signature Check | Configure ESLint `no-restricted-imports`, implement AST test `diSignature.test.ts` | M4 | DONE |
| M6 | Security & Integration E2E | Implement realtime security adversarial test `realtimeSecurity.test.ts`, run all test tiers | M5 | DONE |
| M7 | Documentation & Status | Update `RECOMMENDATIONS.md`, `README.md`, and `CHANGELOG.md` | M6 | DONE |

## Interface Contracts
### Service Registry (`src/lib/services/registry.ts`)
```typescript
class ServiceRegistry {
  constructor(private supabase: SupabaseClient<Database>);
  getProductService(): ProductService;
  getCartService(): CartService;
  // ...other services
}
```
### Client Context Hook
```typescript
const { supabase } = useSupabaseClient();
```
### Redirect Replicator (`src/utils/router.ts`)
```typescript
export function createRedirectResponse(request: NextRequest, targetUrl: string, responseToCopyFrom: NextResponse): NextResponse;
```

## Code Layout
- `src/providers/SupabaseProvider.tsx` - Client context provider & hook
- `src/lib/services/registry.ts` - Request-bound service registry
- `src/utils/router.ts` - Cookie and header replication helper
- `src/middleware.ts` - Edge authentication, claims cache, and routing
- `src/lib/__tests__/diSignature.test.ts` - AST signature verification test
- `tests/e2e/realtimeSecurity.test.ts` - Realtime RLS adversarial test
- `RECOMMENDATIONS.md` - Status updates of verified recommendations
