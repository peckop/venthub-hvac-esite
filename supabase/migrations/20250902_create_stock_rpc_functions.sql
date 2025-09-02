-- Stok yönetimi RPC fonksiyonlarını oluştur
-- Admin stock sayfası için gerekli adjust_stock ve set_stock fonksiyonları

begin;

-- Önce inventory_movements tablosu olduğunu kontrol et
CREATE TABLE IF NOT EXISTS public.inventory_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  order_id uuid NULL REFERENCES public.venthub_orders(id) ON DELETE SET NULL,
  delta integer NOT NULL,
  reason text NOT NULL CHECK (char_length(reason) BETWEEN 3 AND 32),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS aktif et
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;

-- Admin için select policy
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' 
      AND tablename='inventory_movements' 
      AND policyname='inventory_movements_select_admin'
  ) THEN
    CREATE POLICY inventory_movements_select_admin ON public.inventory_movements
      FOR SELECT USING ( 
        (SELECT coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb ->> 'role') = 'admin' 
      );
  END IF;
END$$;

-- adjust_stock fonksiyonu - stok miktarını artır/azalt
CREATE OR REPLACE FUNCTION public.adjust_stock(p_product_id uuid, p_delta int, p_reason text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Stok güncelle
  UPDATE public.products 
  SET stock_qty = GREATEST(0, COALESCE(stock_qty, 0) + p_delta)
  WHERE id = p_product_id;
  
  -- Hareket kaydı oluştur
  INSERT INTO public.inventory_movements (product_id, delta, reason) 
  VALUES (p_product_id, p_delta, COALESCE(p_reason, 'adjust'));
END;
$$;

-- set_stock fonksiyonu - stok miktarını belirli değere ayarla
CREATE OR REPLACE FUNCTION public.set_stock(p_product_id uuid, p_new_qty int, p_reason text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current int;
  v_delta int;
BEGIN
  -- Mevcut stok miktarını al
  SELECT COALESCE(stock_qty, 0) INTO v_current 
  FROM public.products 
  WHERE id = p_product_id;
  
  -- Delta hesapla
  v_delta := p_new_qty - v_current;
  
  -- Eğer değişiklik yoksa işlem yapma
  IF v_delta = 0 THEN
    RETURN;
  END IF;
  
  -- Stok güncelle
  UPDATE public.products 
  SET stock_qty = GREATEST(0, p_new_qty)
  WHERE id = p_product_id;
  
  -- Hareket kaydı oluştur
  INSERT INTO public.inventory_movements (product_id, delta, reason) 
  VALUES (p_product_id, v_delta, COALESCE(p_reason, 'set'));
END;
$$;

-- Permissions ver
GRANT EXECUTE ON FUNCTION public.adjust_stock(uuid, int, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_stock(uuid, int, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.adjust_stock(uuid, int, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.set_stock(uuid, int, text) TO service_role;

-- Test: Fonksiyonların varlığını kontrol et
SELECT 
  proname as function_name,
  pronargs as arg_count,
  prorettype::regtype as return_type
FROM pg_proc 
WHERE proname IN ('adjust_stock', 'set_stock')
  AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

commit;
