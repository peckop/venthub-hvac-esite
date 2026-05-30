# Supabase Skill Reference
Taken from `c:\Users\alize\venthub-hvac\.agent\skills\supabase\SKILL.md`

## Core Principles
1. **Never use `user_metadata` claims in JWT-based authorization decisions.**
   Store authorization data in `raw_app_meta_data` / `app_metadata` instead.
2. **`SECURITY DEFINER` functions bypass RLS.**
   They run with their creator's privileges. When `SECURITY DEFINER` is genuinely needed, keep the function in a non-exposed schema (or set its search path safely), always include an `auth.uid()` check if needed, and run with appropriate security settings.
3. **Set search paths properly on triggers/functions.**
   Always include `SET search_path = public, pg_catalog` (or other appropriate schema) on SECURITY DEFINER functions to prevent search path hijacking.
