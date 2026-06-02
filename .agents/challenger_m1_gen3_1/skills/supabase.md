# Supabase Skill Copy
(Copied from c:\Users\alize\venthub-hvac\.agent\skills\supabase\SKILL.md)

## Core Principles
1. Supabase changes frequently — verify against changelog and current docs.
2. Verify your work with test queries.
3. Recover from errors, don't loop.
4. Exposing tables to Data API: explicit GRANT required under 2026 guidelines.
5. RLS in exposed schemas: enable RLS on every table in public schema.
6. Security checklist:
   - Never use user_metadata claims in JWT-based authorization decisions. Use app_metadata/app_metadata instead.
   - Use Custom Access Token Auth Hook for RBAC.
   - Deleting a user doesn't invalidate active tokens immediately.
   - Views bypass RLS by default: use security_invoker = true.
   - UPDATE requires SELECT policy.
   - auth.role() is deprecated; use TO authenticated/anon.
   - TO authenticated alone is BOLA/IDOR; combine with ownership check.
   - UPDATE policies require both USING and WITH CHECK.
   - SECURITY DEFINER functions bypass RLS and are executable by public by default. Use REVOKE/GRANT and search_path.
