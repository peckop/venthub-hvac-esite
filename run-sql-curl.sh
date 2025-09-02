#!/bin/bash
# Bash script to execute SQL via curl

SUPABASE_URL="https://tnofewwkwlyjsqgwjjga.supabase.co"
# You need to get this from Supabase Dashboard -> Settings -> API -> service_role key
SERVICE_ROLE_KEY="YOUR_SERVICE_ROLE_KEY_HERE"

echo "🔄 Executing stock reduction fix..."

# Execute SQL by creating a temporary SQL file
curl -X POST "$SUPABASE_URL/rest/v1/rpc/sql" \
  -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
  -H "apikey: $SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "statements": [
      "CREATE OR REPLACE FUNCTION public.process_order_stock_reduction(p_order_id text) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$ DECLARE v_order_uuid uuid; v_order_exists boolean := false; v_processed_count int := 0; v_failed_products text[] := \"{}\"::text[]; v_item record; v_current_stock int; v_result jsonb; BEGIN BEGIN v_order_uuid := p_order_id::uuid; EXCEPTION WHEN invalid_text_representation THEN RETURN jsonb_build_object(\"success\", false, \"error\", \"Invalid order ID format\", \"processed_count\", 0); END; SELECT EXISTS(SELECT 1 FROM public.venthub_orders WHERE id = v_order_uuid AND status IN (\"paid\", \"processing\")) INTO v_order_exists; IF NOT v_order_exists THEN RETURN jsonb_build_object(\"success\", false, \"error\", \"Order not found or not in processed state\", \"processed_count\", 0); END IF; FOR v_item IN SELECT oi.product_id, oi.quantity, p.name as product_name, p.stock_qty FROM public.venthub_order_items oi JOIN public.products p ON p.id = oi.product_id WHERE oi.order_id = v_order_uuid LOOP BEGIN v_current_stock := COALESCE(v_item.stock_qty, 0); IF v_current_stock >= v_item.quantity THEN IF NOT EXISTS(SELECT 1 FROM public.inventory_movements WHERE order_id = v_order_uuid AND product_id = v_item.product_id AND reason = \"order_sale\") THEN PERFORM public.adjust_stock(v_item.product_id, -v_item.quantity, \"order_sale\"); UPDATE public.inventory_movements SET order_id = v_order_uuid WHERE product_id = v_item.product_id AND reason = \"order_sale\" AND order_id IS NULL AND id = (SELECT id FROM public.inventory_movements WHERE product_id = v_item.product_id AND reason = \"order_sale\" AND order_id IS NULL ORDER BY created_at DESC LIMIT 1); v_processed_count := v_processed_count + 1; END IF; ELSE v_failed_products := array_append(v_failed_products, v_item.product_name); END IF; EXCEPTION WHEN OTHERS THEN v_failed_products := array_append(v_failed_products, v_item.product_name || \" (ERROR: \" || SQLERRM || \")\"); END; END LOOP; v_result := jsonb_build_object(\"success\", true, \"processed_count\", v_processed_count, \"failed_products\", v_failed_products, \"order_id\", p_order_id); RETURN v_result; END; $$;",
      "GRANT EXECUTE ON FUNCTION public.process_order_stock_reduction(text) TO service_role;",
      "GRANT EXECUTE ON FUNCTION public.process_order_stock_reduction(text) TO anon;"
    ]
  }'

echo ""
echo "✅ SQL execution complete!"
echo ""
echo "🧪 Testing the fix..."

# Test the function
curl -X POST "$SUPABASE_URL/rest/v1/rpc/process_order_stock_reduction" \
  -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
  -H "apikey: $SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"p_order_id": "8a9ea6bf-14a3-4634-ade2-78b8b2e4e96a"}'
