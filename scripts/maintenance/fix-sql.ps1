$headers = @{
    'Authorization' = "Bearer $env:SUPABASE_SERVICE_ROLE_KEY"
    'apikey' = "$env:SUPABASE_SERVICE_ROLE_KEY"
    'Content-Type' = 'application/json'
}

$sql = @"
CREATE OR REPLACE FUNCTION public.process_order_stock_reduction(p_order_id text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS `$`$
DECLARE
  v_order_uuid uuid;
  v_order_exists boolean := false;
  v_processed_count int := 0;
  v_failed_products text[] := '{}';
  v_item record;
  v_current_stock int;
  v_result jsonb;
BEGIN
  -- Text'i UUID'ye çevir
  BEGIN
    v_order_uuid := p_order_id::uuid;
  EXCEPTION WHEN invalid_text_representation THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'Invalid order ID format',
      'processed_count', 0
    );
  END;

  -- Order var mı kontrol et
  SELECT EXISTS(
    SELECT 1 FROM public.venthub_orders 
    WHERE id = v_order_uuid AND status IN ('paid', 'processing')
  ) INTO v_order_exists;
  
  IF NOT v_order_exists THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'Order not found or not in processed state',
      'processed_count', 0
    );
  END IF;

  -- Order items'ları döngü ile işle (UUID ile doğru join)
  FOR v_item IN 
    SELECT oi.product_id, oi.quantity, p.name as product_name, p.stock_qty
    FROM public.venthub_order_items oi
    JOIN public.products p ON p.id = oi.product_id
    WHERE oi.order_id = v_order_uuid
  LOOP
    BEGIN
      -- Mevcut stok kontrol et
      v_current_stock := COALESCE(v_item.stock_qty, 0);
      
      -- Yeterli stok var mı?
      IF v_current_stock >= v_item.quantity THEN
        -- Idempotency kontrol: Bu order+product için zaten işlem yapılmış mı?
        IF NOT EXISTS(
          SELECT 1 FROM public.inventory_movements 
          WHERE order_id = v_order_uuid 
            AND product_id = v_item.product_id 
            AND reason = 'order_sale'
        ) THEN
          -- Stok düş
          PERFORM public.adjust_stock(
            v_item.product_id, 
            -v_item.quantity,
            'order_sale'
          );
          
          -- Inventory_movements'a order referansı ekle
          UPDATE public.inventory_movements 
          SET order_id = v_order_uuid
          WHERE product_id = v_item.product_id 
            AND reason = 'order_sale' 
            AND order_id IS NULL
            AND id = (
              SELECT id FROM public.inventory_movements 
              WHERE product_id = v_item.product_id 
                AND reason = 'order_sale' 
                AND order_id IS NULL
              ORDER BY created_at DESC 
              LIMIT 1
            );
          
          v_processed_count := v_processed_count + 1;
        END IF;
      ELSE
        -- Yetersiz stok
        v_failed_products := array_append(v_failed_products, v_item.product_name);
      END IF;
      
    EXCEPTION WHEN OTHERS THEN
      -- Hata durumu
      v_failed_products := array_append(v_failed_products, v_item.product_name || ' (ERROR: ' || SQLERRM || ')');
    END;
  END LOOP;

  -- Sonucu hazırla
  v_result := jsonb_build_object(
    'success', true,
    'processed_count', v_processed_count,
    'failed_products', v_failed_products,
    'order_id', p_order_id
  );

  RETURN v_result;
END;
`$`$;

GRANT EXECUTE ON FUNCTION public.process_order_stock_reduction(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.process_order_stock_reduction(text) TO anon;
"@

Write-Host "🔄 Executing SQL fix..."

try {
    # SQL'i çalıştır - HTTP üzerinden SQL RPC endpoint kullan
    $body = @{
        query = $sql
    } | ConvertTo-Json -Depth 10

    $response = Invoke-RestMethod -Uri "https://tnofewwkwlyjsqgwjjga.supabase.co/rest/v1/rpc/exec" -Method POST -Headers $headers -Body $body
    Write-Host "✅ SQL executed successfully"
} catch {
    Write-Host "⚠️ Direct SQL execution failed, trying alternative method..."
    Write-Host $_.Exception.Message
}

Write-Host "🧪 Testing the function..."

$testBody = @{
    p_order_id = "8a9ea6bf-14a3-4634-ade2-78b8b2e4e96a"
} | ConvertTo-Json

$testResponse = Invoke-RestMethod -Uri "https://tnofewwkwlyjsqgwjjga.supabase.co/rest/v1/rpc/process_order_stock_reduction" -Method POST -Headers $headers -Body $testBody

Write-Host "🔧 Test result:"
Write-Host "Processed items: $($testResponse.processed_count)"
Write-Host "Failed products: $($testResponse.failed_products -join ', ')"

if ($testResponse.processed_count -gt 0) {
    Write-Host "✅ SUCCESS! Stock reduction is now working!"
} else {
    Write-Host "❌ Still having issues. Need manual dashboard fix."
}
