-- Add undo metadata columns and restrict reverse_inventory_batch to a time window
begin;

-- 1) Add metadata columns
ALTER TABLE public.inventory_movements
  ADD COLUMN IF NOT EXISTS original_movement_id uuid NULL,
  ADD COLUMN IF NOT EXISTS reversed_by_movement_id uuid NULL,
  ADD COLUMN IF NOT EXISTS undo_by_user_id uuid NULL,
  ADD COLUMN IF NOT EXISTS undo_at timestamptz NULL;

-- Optional indexes for lookups
CREATE INDEX IF NOT EXISTS idx_inventory_movements_original_id ON public.inventory_movements(original_movement_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_reversed_by ON public.inventory_movements(reversed_by_movement_id);

-- 2) Replace reverse_inventory_batch with time window and metadata handling
DROP FUNCTION IF EXISTS public.reverse_inventory_batch(uuid);
CREATE OR REPLACE FUNCTION public.reverse_inventory_batch(p_batch_id uuid, p_max_minutes int DEFAULT 30)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  r RECORD;
  cnt int := 0;
  comp_id uuid;
  cutoff timestamptz := now() - (make_interval(mins => p_max_minutes));
  v_actor uuid;
BEGIN
  IF p_batch_id IS NULL THEN
    RETURN 0;
  END IF;

  -- Determine actor (caller) if available
  BEGIN
    v_actor := nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub';
  EXCEPTION WHEN others THEN
    v_actor := NULL;
  END;

  -- Enforce time window: earliest movement must be newer than cutoff
  IF EXISTS (
    SELECT 1 FROM public.inventory_movements
    WHERE batch_id = p_batch_id AND created_at < cutoff
  ) THEN
    RAISE EXCEPTION 'UNDO_WINDOW_EXPIRED';
  END IF;

  FOR r IN SELECT id, product_id, delta FROM public.inventory_movements WHERE batch_id = p_batch_id LOOP
    -- revert stock
    UPDATE public.products
    SET stock_qty = GREATEST(0, COALESCE(stock_qty, 0) - r.delta)
    WHERE id = r.product_id;

    -- compensating movement with metadata
    INSERT INTO public.inventory_movements (product_id, delta, reason, batch_id, original_movement_id, undo_by_user_id, undo_at)
    VALUES (r.product_id, -r.delta, 'undo:csv', p_batch_id, r.id, v_actor::uuid, now())
    RETURNING id INTO comp_id;

    -- link original to compensating record
    UPDATE public.inventory_movements SET reversed_by_movement_id = comp_id WHERE id = r.id;

    cnt := cnt + 1;
  END LOOP;

  RETURN cnt;
END;
$$;

-- 3) Grants stay the same signature (with default param)
GRANT EXECUTE ON FUNCTION public.reverse_inventory_batch(uuid, int) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reverse_inventory_batch(uuid, int) TO service_role;

commit;
