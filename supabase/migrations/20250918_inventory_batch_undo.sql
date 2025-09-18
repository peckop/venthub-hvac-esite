-- Inventory batch undo support: add batch_id, extend stock RPCs, and add reverse_inventory_batch
begin;

-- 1) Schema: inventory_movements.batch_id
ALTER TABLE public.inventory_movements
  ADD COLUMN IF NOT EXISTS batch_id uuid NULL;

CREATE INDEX IF NOT EXISTS idx_inventory_movements_batch_id
  ON public.inventory_movements(batch_id);

-- 2) Replace adjust_stock with batch support (default null)
DROP FUNCTION IF EXISTS public.adjust_stock(uuid, int, text);
CREATE OR REPLACE FUNCTION public.adjust_stock(
  p_product_id uuid,
  p_delta int,
  p_reason text,
  p_batch_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update product stock
  UPDATE public.products 
  SET stock_qty = GREATEST(0, COALESCE(stock_qty, 0) + p_delta)
  WHERE id = p_product_id;

  -- Insert movement
  INSERT INTO public.inventory_movements (product_id, delta, reason, batch_id)
  VALUES (p_product_id, p_delta, COALESCE(p_reason, 'adjust'), p_batch_id);
END;
$$;

-- 3) Replace set_stock with batch support (default null)
DROP FUNCTION IF EXISTS public.set_stock(uuid, int, text);
CREATE OR REPLACE FUNCTION public.set_stock(
  p_product_id uuid,
  p_new_qty int,
  p_reason text,
  p_batch_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current int;
  v_delta int;
BEGIN
  SELECT COALESCE(stock_qty, 0) INTO v_current 
  FROM public.products 
  WHERE id = p_product_id;

  v_delta := p_new_qty - v_current;
  IF v_delta = 0 THEN
    RETURN;
  END IF;

  UPDATE public.products 
  SET stock_qty = GREATEST(0, p_new_qty)
  WHERE id = p_product_id;

  INSERT INTO public.inventory_movements (product_id, delta, reason, batch_id) 
  VALUES (p_product_id, v_delta, COALESCE(p_reason, 'set'), p_batch_id);
END;
$$;

-- 4) Add reverse_inventory_batch to create compensating movements and revert stock
CREATE OR REPLACE FUNCTION public.reverse_inventory_batch(p_batch_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  r RECORD;
  cnt int := 0;
BEGIN
  IF p_batch_id IS NULL THEN
    RETURN 0;
  END IF;

  FOR r IN SELECT product_id, delta FROM public.inventory_movements WHERE batch_id = p_batch_id LOOP
    -- revert stock
    UPDATE public.products
    SET stock_qty = GREATEST(0, COALESCE(stock_qty, 0) - r.delta)
    WHERE id = r.product_id;

    -- compensating movement
    INSERT INTO public.inventory_movements (product_id, delta, reason, batch_id)
    VALUES (r.product_id, -r.delta, 'undo:csv', p_batch_id);

    cnt := cnt + 1;
  END LOOP;

  RETURN cnt;
END;
$$;

-- 5) Grants
GRANT EXECUTE ON FUNCTION public.adjust_stock(uuid, int, text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_stock(uuid, int, text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reverse_inventory_batch(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.adjust_stock(uuid, int, text, uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.set_stock(uuid, int, text, uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.reverse_inventory_batch(uuid) TO service_role;

commit;
