-- Ensure function search_path explicitly includes public for compatibility with Advisor expectations
ALTER FUNCTION public._normalize_rls_expr(text)
  SET search_path = public, pg_temp;
