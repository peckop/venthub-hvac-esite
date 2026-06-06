# VentHub HVAC Client Architecture & Security Recommendations

This document outlines architectural and security recommendations based on the Supabase Client Factories, Middleware, Auth Handlers, Realtime WebSocket Security, and Type-Safety/Import structures upgrade.

---

### 1. Enforce Serverless Connection Pooling in Request-Bound Clients
*   **Context:** The per-request server client (`createSupabaseServerClient` in `src/lib/supabase/server.ts`) is instantiated on every incoming HTTP request. In serverless deployment environments like Vercel, this model can quickly exhaust the database's available connection limit due to concurrent requests spawning independent database connections.
*   **Actionable Recommendation:**
    *   Configure the project’s Supabase connection strings to target the transaction-mode pooler endpoint (e.g., Supavisor port `6543`) rather than the direct database port (`5432`).
    *   Maintain strict connection timeouts to ensure connections are freed immediately after query execution.

### 2. Implement ESLint Guardrails to Prevent Cross-Environment Client Contamination
*   **Context:** With separate factories for Browser, Server, and Static clients, developers might accidentally import `supabaseBrowserClient` inside Server Components or Server Actions, or `createSupabaseServerClient` inside browser-only hooks. This can cause severe runtime bugs or cross-tenant session leaks.
*   **Actionable Recommendation:**
    *   Configure custom ESLint rules (using `no-restricted-imports`) to restrict importing `@supabase/ssr` or specific client modules outside of their designated environments.
    *   *Example rule definition:*
        ```json
        {
          "rules": {
            "no-restricted-imports": [
              "error",
              {
                "paths": [
                  {
                    "name": "@/lib/supabase/client",
                    "message": "Do not import browser client in server-only files. Use createSupabaseServerClient instead."
                  }
                ]
              }
            ]
          }
        }
        ```

### 3. Encrypt & Cache JWT Claims in Middleware to Optimize Latency
*   **Context:** Utilizing `supabase.auth.getClaims()` inside edge middleware (`src/middleware.ts`) secures every routed request but introduces a remote network lookup or cryptographic validation call. This can degrade the platform's Time-to-First-Byte (TTFB).
*   **Actionable Recommendation:**
    *   Store verified user roles and tenant IDs inside a secure, encrypted HTTP-only session cookie upon successful login/validation.
    *   Read from this encrypted cookie in subsequent middleware cycles rather than invoking `getClaims()` on every request, reducing authentication latency to less than 5ms.
    *   Ensure proper synchronization during session rotation and signout.

### 4. Implement Automated Adversarial Testing for Realtime Channel RLS
*   **Context:** The new migration `20260606180000_realtime_messages_rls.sql` restricts WebSocket channel access on `realtime.messages`. However, schema drift or subsequent migration changes might accidentally alter permissions, causing security regressions.
*   **Actionable Recommendation:**
    *   Incorporate automated E2E adversarial security tests that specifically attempt to listen/subscribe to cross-tenant channels (e.g., trying to join a topic containing a different tenant's UUID).
    *   Assert that the connection is rejected or messages are not received, ensuring the database RLS rules remain robust.

### 5. Standardize Redirect Cookie and Header Replication in Next.js Router
*   **Context:** Next.js middleware uses `NextResponse.redirect()` to handle unauthorized routes. If the underlying Supabase client (`createServerClient`) sets new session cookies (e.g., token refreshes) within that same cycle, the cookies are lost during standard redirection unless manually copied.
*   **Actionable Recommendation:**
    *   Extract the `redirectResponse` logic implemented in `src/middleware.ts` into a utility helper class/file (e.g., `src/utils/router.ts`).
    *   Ensure all present and future middleware redirects uniformly replicate headers and cookies to guarantee session survival and prevent abrupt user logout bugs.
