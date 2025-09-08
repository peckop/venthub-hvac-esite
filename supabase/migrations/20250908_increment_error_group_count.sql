-- RPC to atomically increment error group count and update last_seen
-- Created: 2025-09-08

CREATE OR REPLACE FUNCTION public.increment_error_group_count(p_group_id uuid)
RETURNS void
LANGUAGE sql
AS $$
  UPDATE public.error_groups
  SET count = count + 1,
      last_seen = now()
  WHERE id = p_group_id;
$$;

COMMENT ON FUNCTION public.increment_error_group_count(uuid)
  IS 'Atomically increments error_groups.count and updates last_seen for the given group id.';

