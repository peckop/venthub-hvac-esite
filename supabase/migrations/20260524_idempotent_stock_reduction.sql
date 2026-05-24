-- Migration: Add idempotency and row-level locking to process_order_stock_reduction
-- Objective: Eliminate race conditions during concurrent webhook requests and enforce transaction isolation.

CREATE OR REPLACE FUNCTION public.process_order_stock_reduction(p_order_id text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'pg_catalog, public'
AS $$
DECLARE
  v_order_uuid uuid;
  v_order_exists boolean := false;
  v_processed_count int := 0;
  v_failed_products text[] := '{}';
  v_item record;
  v_current_stock int;
  v_result jsonb;
BEGIN
  -- Convert order ID from text to UUID safely
  BEGIN
    v_order_uuid := p_order_id::uuid;
  EXCEPTION WHEN invalid_text_representation THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'Invalid order ID format',
      'processed_count', 0
    );
  END;

  -- 1. Row-level Lock (FOR UPDATE): Prevent concurrent executions on the same order.
  -- This forces any second webhook trigger to wait until this transaction completes.
  SELECT EXISTS(
    SELECT 1 FROM public.venthub_orders 
    WHERE id = v_order_uuid AND status IN ('paid', 'processing')
    FOR UPDATE
  ) INTO v_order_exists;
  
  IF NOT v_order_exists THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'Order not found or not in processed state',
      'processed_count', 0
    );
  END IF;

  -- 2. Idempotency Check: Check if stock reduction has already been run for this order.
  -- Look for inventory movements with the same order_id or batch_id and reason = 'order_sale'.
  IF EXISTS(
    SELECT 1 FROM public.inventory_movements 
    WHERE (order_id = v_order_uuid OR batch_id = v_order_uuid)
      AND reason = 'order_sale'
  ) THEN
    RETURN jsonb_build_object(
      'success', true,
      'message', 'Stock already reduced for this order',
      'processed_count', 0,
      'order_id', p_order_id
    );
  END IF;

  -- Loop through order items and reduce stock
  FOR v_item IN 
    SELECT oi.product_id, oi.quantity, p.name as product_name, p.stock_qty
    FROM public.venthub_order_items oi
    JOIN public.products p ON p.id = oi.product_id
    WHERE oi.order_id = v_order_uuid
  LOOP
    BEGIN
      -- Check current stock
      v_current_stock := COALESCE(v_item.stock_qty, 0);
      
      -- Is there enough stock?
      IF v_current_stock >= v_item.quantity THEN
        -- Adjust stock using standard adjust_stock function with batch_id = v_order_uuid
        PERFORM public.adjust_stock(
          v_item.product_id, 
          -v_item.quantity,  -- negative (stock reduction)
          'order_sale',
          v_order_uuid       -- batch_id
        );
        
        -- Update the inserted movement's order_id atomically via batch_id matching
        UPDATE public.inventory_movements 
        SET order_id = v_order_uuid
        WHERE batch_id = v_order_uuid 
          AND product_id = v_item.product_id
          AND order_id IS NULL;
        
        v_processed_count := v_processed_count + 1;
      ELSE
        -- Insufficient stock
        v_failed_products := array_append(v_failed_products, v_item.product_name);
      END IF;
      
    EXCEPTION WHEN OTHERS THEN
      -- Record failure detail if an error occurs
      v_failed_products := array_append(v_failed_products, v_item.product_name || ' (ERROR: ' || SQLERRM || ')');
    END;
  END LOOP;

  -- Prepare success result
  v_result := jsonb_build_object(
    'success', true,
    'processed_count', v_processed_count,
    'failed_products', v_failed_products,
    'order_id', p_order_id
  );

  RETURN v_result;
END;
$$;

