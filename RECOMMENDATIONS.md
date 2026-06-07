# VentHub HVAC Client Architecture & Security Recommendations

This document outlines architectural and security recommendations based on the Supabase Client Factories, Middleware, Auth Handlers, Realtime WebSocket Security, and Type-Safety/Import structures upgrade.

---

### 1. Enforce Serverless Connection Pooling in Request-Bound Clients
*   **Status:** [Implemented - targets transaction-mode pooler port 6543 and local environment setup completed]
*   **Context:** The per-request server client (`createSupabaseServerClient` in `src/lib/supabase/server.ts`) is instantiated on every incoming HTTP request. In serverless deployment environments like Vercel, this model can quickly exhaust the database's available connection limit due to concurrent requests spawning independent database connections.
*   **Actionable Recommendation:**
    *   Configure the project’s Supabase connection strings to target the transaction-mode pooler endpoint (e.g., Supavisor port `6543`) rather than the direct database port (`5432`).
    *   Maintain strict connection timeouts to ensure connections are freed immediately after query execution.

### 2. Implement ESLint Guardrails to Prevent Cross-Environment Client Contamination
*   **Status:** [Implemented - strict ESLint custom configurations enforce imports containment boundaries]
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
*   **Status:** [Implemented - Edge middleware claims caching and decryption enabled]
*   **Context:** Utilizing `supabase.auth.getClaims()` inside edge middleware (`src/middleware.ts`) secures every routed request but introduces a remote network lookup or cryptographic validation call. This can degrade the platform's Time-to-First-Byte (TTFB).
*   **Actionable Recommendation:**
    *   Store verified user roles and tenant IDs inside a secure, encrypted HTTP-only session cookie upon successful login/validation.
    *   Read from this encrypted cookie in subsequent middleware cycles rather than invoking `getClaims()` on every request, reducing authentication latency to less than 5ms.
    *   Ensure proper synchronization during session rotation and signout.

### 4. Implement Automated Adversarial Testing for Realtime Channel RLS
*   **Status:** [Implemented - Vitest e2e/realtimeSecurity.test.ts executes adversarial channel validation]
*   **Context:** The new migration `20260606180000_realtime_messages_rls.sql` restricts WebSocket channel access on `realtime.messages`. However, schema drift or subsequent migration changes might accidentally alter permissions, causing security regressions.
*   **Actionable Recommendation:**
    *   Incorporate automated E2E adversarial security tests that specifically attempt to listen/subscribe to cross-tenant channels (e.g., trying to join a topic containing a different tenant's UUID).
    *   Assert that the connection is rejected or messages are not received, ensuring the database RLS rules remain robust.

### 5. Standardize Redirect Cookie and Header Replication in Next.js Router
*   **Status:** [Implemented - createRedirectResponse helper in src/utils/router.ts handles uniform response copying]
*   **Context:** Next.js middleware uses `NextResponse.redirect()` to handle unauthorized routes. If the underlying Supabase client (`createServerClient`) sets new session cookies (e.g., token refreshes) within that same cycle, the cookies are lost during standard redirection unless manually copied.
*   **Actionable Recommendation:**
    *   Extract the `redirectResponse` logic implemented in `src/middleware.ts` into a utility helper class/file (e.g., `src/utils/router.ts`).
    *   Ensure all present and future middleware redirects uniformly replicate headers and cookies to guarantee session survival and prevent abrupt user logout bugs.

---

### Dependency Injection (DI) Architectural Recommendations

### 6. Implement Context-Based Dependency Injection for React Client Components
*   **Status:** [Implemented - SupabaseProvider and useSupabaseClient hook manage client contexts]
*   **Context:** React client-side components and custom hooks currently import `supabaseBrowserClient` directly from static modules to pass into service functions. This creates a hard dependency on the global window-level/singleton browser client, which makes mocking and isolated unit testing more difficult.
*   **Actionable Recommendation:**
    *   Implement a React Context provider (e.g., `SupabaseClientProvider`) that exposes the active browser client, and access it via a standard `useSupabaseClient()` hook.
    *   Pass the client returned by the hook to service functions, allowing tests to inject mock clients easily through context mock providers.

### 7. Standardize Server-Side Service Injection via Per-Request Context Helpers
*   **Status:** [Implemented - ServiceRegistry request context container manages server-side dependency resolution]
*   **Context:** Passing the `supabase` client explicitly to every single service function call in Server Components, Server Actions, and API routes creates repetitive boilerplate code.
*   **Actionable Recommendation:**
    *   Standardize server-side service execution by using request-bound service classes or context helper patterns.
    *   Create a request context container or service registry class that is instantiated once per HTTP request with the request-bound `supabase` client. This container can then resolve and instantiate all service objects, injecting the client automatically to eliminate boilerplate.

### 8. Automate DI Signature Verification via Static Lint Rules
*   **Status:** [Implemented - diSignature.test.ts automates AST signature validation]
*   **Context:** To maintain the architectural integrity of the Dependency Injection design, any new service function added to `src/lib/services/` must conform to the signature requirement of having `supabase` as its first parameter. Relying on manual code review risks regressions.
*   **Actionable Recommendation:**
    *   Write a custom ESLint rule or configure AST validation tools to assert that all exported functions under `src/lib/services/` accept `supabase` as their first parameter.
    *   Alternatively, add a pre-commit git hook or CI pipeline step that statically parses the service files to enforce this signature.
