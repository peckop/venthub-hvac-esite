-- Fix Advisor: function_search_path_mutable for public._normalize_rls_expr
-- Lock down function-specific search_path to avoid role-mutable search_path issues.

ALTER FUNCTION public._normalize_rls_expr(text)
  SET search_path = pg_temp;
