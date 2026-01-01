-- ============================================================================
-- Supabase Advisor Definitive Fix (2026-01-01 FINAL)
-- Uses CREATE OR REPLACE to properly set search_path for all functions
-- ============================================================================

-- ============================================================================
-- PART 1: Fix bump_rate_limit with full function body + search_path
-- ============================================================================

CREATE OR REPLACE FUNCTION public.bump_rate_limit(p_key text, p_limit int, p_window_seconds int)
RETURNS TABLE(allowed boolean, remaining int, reset_at timestamptz)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = pg_catalog, public
AS $$
DECLARE
  now_ts timestamptz := now();
  bucket_ts timestamptz := date_trunc('minute', now_ts);
  window_start timestamptz := now_ts - make_interval(secs => p_window_seconds);
  total int := 0;
  resets_at timestamptz := bucket_ts + interval '1 minute';
BEGIN
  -- upsert current bucket
  INSERT INTO public.rate_limits(key, bucket, count)
  VALUES (p_key, bucket_ts, 1)
  ON CONFLICT (key, bucket) DO UPDATE SET count = public.rate_limits.count + 1;

  -- sum counts within window
  SELECT COALESCE(sum(count), 0) INTO total
  FROM public.rate_limits
  WHERE key = p_key AND bucket >= date_trunc('minute', window_start);

  IF total <= p_limit THEN
    RETURN QUERY SELECT true AS allowed, greatest(p_limit - total, 0) AS remaining, resets_at AS reset_at;
  ELSE
    RETURN QUERY SELECT false AS allowed, 0 AS remaining, resets_at AS reset_at;
  END IF;
END $$;

-- ============================================================================
-- PART 2: Fix enforce_role_change with full function body + search_path
-- ============================================================================

CREATE OR REPLACE FUNCTION public.enforce_role_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  -- If the actor tries to change their own role and is not superadmin, block
  IF NEW.id = auth.uid() THEN
    IF NOT EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'superadmin') THEN
      RAISE EXCEPTION 'not authorized to change own role';
    END IF;
  END IF;
  -- Only allow target roles in whitelist (safety)
  IF NEW.role NOT IN ('user','moderator','admin','superadmin') THEN
    RAISE EXCEPTION 'invalid role %', NEW.role;
  END IF;
  RETURN NEW;
END;
$$;

-- ============================================================================
-- PART 3: Fix update_updated_at_column with full function body + search_path
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = pg_catalog, public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ============================================================================
-- PART 4: Fix reverse_inventory_batch with full function body + search_path
-- ============================================================================

CREATE OR REPLACE FUNCTION public.reverse_inventory_batch(p_batch_id uuid, p_max_minutes int DEFAULT 30)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
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

-- ============================================================================
-- PART 5: Drop duplicate index on cart_items
-- ============================================================================

DROP INDEX IF EXISTS public.cart_items_cart_product_unique;

-- ============================================================================
-- Done - All 4 functions now have proper search_path
-- ============================================================================
