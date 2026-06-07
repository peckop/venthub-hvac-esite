---
name: supabase
description: "Use when doing ANY task involving Supabase. Triggers: Supabase products (Database, Auth, Edge Functions, Realtime, Storage, Vectors, Cron, Queues); client libraries and SSR integrations (supabase-js, @supabase/ssr) in Next.js, React, SvelteKit, Astro, Remix; auth issues (login, logout, sessions, JWT, cookies, getSession, getUser, getClaims, RLS); Supabase CLI or MCP server; schema changes, migrations, security audits, Postgres extensions (pg_graphql, pg_cron, pg_vector)."
metadata:
  author: supabase
  version: "0.1.2"
---

# Supabase

## Core Principles

**1. Supabase changes frequently — verify against changelog and current docs before implementing.**
Do not rely on training data for Supabase features. Function signatures, config.toml settings, and API conventions change between versions.

First, fetch `https://supabase.com/changelog.md` (a lightweight summary index — not a heavy pull), scan for `breaking-change` tags relevant to your task, and follow the linked page for any that apply. Then look up the relevant topic using the documentation access methods below.

**2. Verify your work.**
After implementing any fix, run a test query to confirm the change works. A fix without verification is incomplete.

**3. Recover from errors, don't loop.**
If an approach fails after 2-3 attempts, stop and reconsider. Try a different method, check documentation, inspect the error more carefully, and review relevant logs when available. Supabase issues are not always solved by retrying the same command, and the answer is not always in the logs, but logs are often worth checking before proceeding.

**4. Exposing tables to the Data API:** Depending on the user's [Data API settings](https://supabase.com/dashboard/project/<ref>/integrations/data_api/settings), newly created tables may not be automatically exposed via the Data (REST) API. If this is the case, `anon` and `authenticated` roles will need to be explicitly granted access.

> Note that this is separate from RLS, which controls which _rows_ are visible once a table is accessible, not whether the table is accessible at all.

When a user reports a SQL-created table is unexpectedly inaccessible, check their Data API settings and whether the roles have been granted access via explicit `GRANT` SQL. When granting public (`anon`/`authenticated`) access, always enable RLS too. See [Exposing a Table to the Data API](https://supabase.com/docs/guides/api/securing-your-api.md) for the full setup workflow.

**5. RLS in exposed schemas.**
Enable RLS on every table in any exposed schema, which includes `public` by default. This is critical in Supabase because tables in exposed schemas can be reachable through the Data API when the `anon`/`authenticated` roles have access (see [Exposing a Table to the Data API](https://supabase.com/docs/guides/api/securing-your-api.md)). For private schemas, prefer RLS as defense in depth. After enabling RLS, create policies that match the actual access model rather than defaulting every table to the same `auth.uid()` pattern.

**6. Security checklist.**
When working on any Supabase task that touches auth, RLS, views, storage, or user data, run through this checklist. These are Supabase-specific security traps that silently create vulnerabilities:

- **Auth and session security**
  - **Never use `user_metadata` claims in JWT-based authorization decisions.** In Supabase, `raw_user_meta_data` is user-editable and can appear in `auth.jwt()`, so it is unsafe for RLS policies or any other authorization logic. Store authorization data in `raw_app_meta_data` / `app_metadata` instead.
  - **RBAC için resmi önerilen yol: Custom Access Token Auth Hook.** Rol bilgisini JWT'ye enjekte etmek için trigger ile `raw_app_meta_data` yazmak yerine, Supabase'in resmi Auth Hook mekanizmasını kullanın. Bu hook her token yenilemede otomatik çalışır ve her zaman güncel rol bilgisi sağlar. Detay: https://supabase.com/docs/guides/api/custom-claims-and-role-based-access-control-rbac
  - **Deleting a user does not invalidate existing access tokens.** Sign out or revoke sessions first, keep JWT expiry short for sensitive apps, and for strict guarantees validate `session_id` against `auth.sessions` on sensitive operations.
  - **If you use `app_metadata` or `auth.jwt()` for authorization, remember JWT claims are not always fresh until the user's token is refreshed.**

- **API key and client exposure**
  - **Never expose the `service_role` or secret key in public clients.** Prefer publishable keys for frontend code. Legacy `anon` keys are only for compatibility. In Next.js, any `NEXT_PUBLIC_` env var is sent to the browser.

- **RLS, views, and privileged database code**
  - **Views bypass RLS by default.** In Postgres 15 and above, use `CREATE VIEW ... WITH (security_invoker = true)`. In older versions of Postgres, protect your views by revoking access from the `anon` and `authenticated` roles, or by putting them in an unexposed schema.
  - **UPDATE requires a SELECT policy.** In Postgres RLS, an UPDATE needs to first SELECT the row. Without a SELECT policy, updates silently return 0 rows — no error, just no change.
  - **`auth.role()` is deprecated — use the `TO` clause instead.** Supabase has deprecated `auth.role()` in favour of specifying the target role directly on the policy with `TO authenticated` or `TO anon`. Beyond deprecation, `auth.role() = 'authenticated'` breaks silently when anonymous sign-ins are enabled, because anonymous users carry the `authenticated` Postgres role and pass the check regardless of whether the user is genuinely signed in.
    ```sql
    -- Deprecated (do not use)
    create policy "example" on table_name for select
    using ( auth.role() = 'authenticated' );
    ```
  - **`TO authenticated` alone is authentication without authorization (BOLA / IDOR).** Using `TO authenticated` only checks the role — it does not restrict which rows a user can access. The correct pattern combines `TO authenticated` with an ownership predicate in `USING`:
    ```sql
    create policy "example" on table_name for select
    to authenticated
    using ( (select auth.uid()) = user_id );
    ```
  - **UPDATE policies require both `USING` and `WITH CHECK`.** Without `WITH CHECK`, a user can reassign a row's `user_id` to another user:
    ```sql
    create policy "example" on table_name for update
    to authenticated
    using ( (select auth.uid()) = user_id )
    with check ( (select auth.uid()) = user_id );
    ```
  - **`SECURITY DEFINER` functions bypass RLS.** A `SECURITY DEFINER` function runs with its creator's privileges — typically a role with `bypassrls` (e.g., `postgres`). Never add `SECURITY DEFINER` to resolve a permission error; it silently removes access control without fixing the underlying cause. Prefer `SECURITY INVOKER`.
  - **`SECURITY DEFINER` functions in `public` are callable by all roles.** Postgres grants `EXECUTE` to `PUBLIC` by default for every new function, so any `SECURITY DEFINER` function in `public` is a public API endpoint callable by `anon` and `authenticated` (which inherit from `PUBLIC`) without any additional grant. When `SECURITY DEFINER` is genuinely needed (e.g., bypassing RLS on an internal lookup table), keep the function in a non-exposed schema, always include an `auth.uid()` check in the function body, and run `supabase db advisors` after making changes.

- **Storage access control**
  - **Storage upsert requires INSERT + SELECT + UPDATE.** Granting only INSERT allows new uploads but file replacement (upsert) silently fails. You need all three.

For any security concern not covered above, fetch the Supabase product security index: `https://supabase.com/docs/guides/security/product-security.md`

## Next.js 15 SSR Client Architecture & Factories

Next.js 15 App Router requires request-bound isolating factories instead of singletons to prevent memory leaks and session cross-contamination (data bleeding).

### 1. Browser Client (`src/lib/supabase/client.ts`)
Only for Client Components (`'use client'`), instantiated via `createBrowserClient`:
```typescript
import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database.types'

export const supabaseBrowserClient = createBrowserClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

### 2. Server Client (`src/lib/supabase/server.ts`)
For Server Components, Server Actions, and Route Handlers, instantiated dynamically (per-request) and awaiting `cookies()`:
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/types/database.types'

export async function createSupabaseServerClient() {
  const cookieStore = await cookies()
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Safe to ignore if called from a Server Component where cookies cannot be mutated
          }
        },
      },
    }
  )
}
```

### 3. Static Client (`src/lib/supabase/static.ts`)
For Static Site Generation (SSG), Partially Prerendered (PPR) components, or build-time data fetching where request-bound cookie headers are unavailable, configure with `persistSession: false`:
```typescript
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database.types'

export const supabaseStaticClient = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  }
)
```

### 4. RSC ORM Query Deduplication (React.cache)
Since Server Components can be rendered multiple times in a render pass, wrap database/ORM retrieval functions with `React.cache()` to avoid duplicate database queries (waterfalls):
```typescript
import { cache } from 'react'

export const getProductBySlug = cache(async (slug: string) => {
  const supabase = supabaseStaticClient // or await createSupabaseServerClient()
  const { data, error } = await supabase.from('products').select('*').eq('slug', slug).single()
  return data
})
```

### 5. SaaS Cache Isolation (unstable_cache keys)
When caching data fetching with `unstable_cache`, always include the `tenantId` and language code to prevent cross-tenant cache contamination:
```typescript
const getCachedData = (tenantId: string, lang: string) =>
  unstable_cache(
    async () => fetchTenantData(tenantId),
    ['tenant-data-key', lang, tenantId],
    { revalidate: 3600 }
  )()
```

### 6. Import Hygiene & Wildcard Ban
- **Banned**: Wildcard exports (`export *`) from service files (e.g. `src/lib/supabase.ts`) are banned. Wildcard exports create circular dependencies and bloated JS bundles.
- **Allowed**: Always direct-import services or database types from their respective files (e.g., import `{ Category }` from `@/types/database.types` or direct from `@/lib/services/category`).

## Supabase CLI

Always discover commands via `--help` — never guess. The CLI structure changes between versions.

```bash
supabase --help                    # All top-level commands
supabase <group> --help            # Subcommands (e.g., supabase db --help)
supabase <group> <command> --help  # Flags for a specific command
```

**Supabase CLI Known gotchas:**

- `supabase db query` requires **CLI v2.79.0+** → use MCP `execute_sql` or `psql` as fallback
- `supabase db advisors` requires **CLI v2.81.3+** → use MCP `get_advisors` as fallback
- When you need a new migration SQL file, **always** create it with `supabase migration new <name>` first. Never invent a migration filename or rely on memory for the expected format.

**Version check and upgrade:** Run `supabase --version` to check. For CLI changelogs and version-specific features, consult the [CLI documentation](https://supabase.com/docs/reference/cli/introduction) or [GitHub releases](https://github.com/supabase/cli/releases).

### MCP vs CLI: Advisor Kapsamı Farkı
- **CLI** (`supabase db advisors`): Sadece temel lint kurallarını çalıştırır (unused_index, extension_in_public, multiple_permissive, auth_rls_initplan, function_search_path_mutable)
- **MCP** (`get_advisors`): Supabase Management API üzerinden TAM güvenlik taraması yapar. CLI'da görünmeyen şu kategorileri de kapsar:
  - `pg_graphql_anon_table_exposed` / `pg_graphql_authenticated_table_exposed`
  - `anon_security_definer_function_executable` / `authenticated_security_definer_function_executable`
  - `public_bucket_allows_listing`
  - `auth_leaked_password_protection`
- **Kural:** Güvenlik denetimlerinde her zaman MCP `get_advisors` kullanın. CLI sonuçları eksik kalabilir.

## Supabase MCP Server

For setup instructions, server URL, and configuration, see the [MCP setup guide](https://supabase.com/docs/guides/getting-started/mcp).

**Troubleshooting connection issues** — follow these steps in order:

1. **Check if the server is reachable:**
   `curl -so /dev/null -w "%{http_code}" https://mcp.supabase.com/mcp`
   A `401` is expected (no token) and means the server is up. Timeout or "connection refused" means it may be down.

2. **Check `.mcp.json` configuration:**
   Verify the project root has a valid `.mcp.json` with the correct server URL. If missing, create one pointing to `https://mcp.supabase.com/mcp`.

3. **Authenticate the MCP server:**
   If the server is reachable and `.mcp.json` is correct but tools aren't visible, the user needs to authenticate. The Supabase MCP server uses OAuth 2.1 — tell the user to trigger the auth flow in their agent, complete it in the browser, and reload the session.

## Supabase Documentation

**CRITICAL:** Skills dosyaları güncel olmayabilir. Supabase hızla değişir. Her güvenlik kararından ÖNCE resmi kaynağı doğrulayın:
1. **MCP `search_docs` tool** (preferred)
2. **Docs pages as markdown** — URL'e `.md` ekleyin
3. **MCP `get_advisors`** — Her DDL değişikliğinden sonra çalıştırın
4. **Web search** for Supabase-specific topics when you don't know which page to look at.

## Making and Committing Schema Changes

**To make schema changes, use `execute_sql` (MCP) or `supabase db query` (CLI).** These run SQL directly on the database without creating migration history entries, so you can iterate freely and generate a clean migration when ready.

Do NOT use `apply_migration` to change a local database schema — it writes a migration history entry on every call, which means you can't iterate, and `supabase db diff` / `supabase db pull` will produce empty or conflicting diffs. If you use it, you'll be stuck with whatever SQL you passed on the first try.

**When ready to commit** your changes to a migration file:

1. **Run advisors** → `supabase db advisors` (CLI v2.81.3+) or MCP `get_advisors`. Fix any issues.
2. **Review the Security Checklist above** if your changes involve views, functions, triggers, or storage.
3. **Generate the migration** → `supabase db pull <descriptive-name> --local --yes`
4. **Verify** → `supabase migration list --local`

## Reference Guides

- **Skill Feedback** → [references/skill-feedback.md](references/skill-feedback.md)
  **MUST read when** the user reports that this skill gave incorrect guidance or is missing information.
