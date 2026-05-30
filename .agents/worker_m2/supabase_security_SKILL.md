# Supabase Security Skill Reference
Taken from `c:\Users\alize\venthub-hvac\.agent\skills\supabase-security\SKILL.md`

## Key Policies & Triggers Guidelines:
- Wrap `auth.uid()` as `(SELECT auth.uid())` inside RLS policies for initplan optimization.
- Set `search_path = pg_catalog, public` (or `public, pg_catalog`) on `SECURITY DEFINER` functions to prevent hijack.
- Write idempotent migrations using `IF NOT EXISTS` / `DROP IF EXISTS`.
- Never use user_metadata claims in JWT authorization decisions (use `app_metadata` or raw_app_meta_data).
- Triggers on auth schema or tables should be configured with `SECURITY DEFINER` and proper schema search paths.
