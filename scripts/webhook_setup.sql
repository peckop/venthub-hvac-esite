-- Webhook Setup Script
-- Note: Replace the placeholder 'REPLACE_WITH_ENV_SECRET' with the actual environment secret before deploying.
-- 1. Enable pg_net extension
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2. Create the webhook function
CREATE OR REPLACE FUNCTION public.handle_supabase_webhook()
RETURNS TRIGGER AS $$
DECLARE
  payload jsonb;
  webhook_url text := 'https://venthub-hvac-esite.vercel.app/api/webhook/supabase';
  webhook_secret text := 'REPLACE_WITH_ENV_SECRET';
  req_id bigint;
BEGIN
  -- Construct the payload matching Route Handler expectations
  payload := jsonb_build_object(
    'type', TG_OP,
    'table', TG_TABLE_NAME,
    'schema', TG_TABLE_SCHEMA,
    'record', CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE to_jsonb(NEW) END,
    'old_record', CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE to_jsonb(OLD) END
  );

  -- Perform asynchronous HTTP POST request using pg_net
  SELECT net.http_post(
    url := webhook_url,
    body := payload::text,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-webhook-secret', webhook_secret
    ),
    timeout_milliseconds := 5000
  ) INTO req_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Attach triggers to public.products
DROP TRIGGER IF EXISTS on_products_change ON public.products;
CREATE TRIGGER on_products_change
AFTER INSERT OR UPDATE OR DELETE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.handle_supabase_webhook();

-- 4. Attach triggers to public.categories
DROP TRIGGER IF EXISTS on_categories_change ON public.categories;
CREATE TRIGGER on_categories_change
AFTER INSERT OR UPDATE OR DELETE ON public.categories
FOR EACH ROW EXECUTE FUNCTION public.handle_supabase_webhook();

-- 5. Attach triggers to public.inventory_movements
DROP TRIGGER IF EXISTS on_inventory_movements_change ON public.inventory_movements;
CREATE TRIGGER on_inventory_movements_change
AFTER INSERT OR UPDATE OR DELETE ON public.inventory_movements
FOR EACH ROW EXECUTE FUNCTION public.handle_supabase_webhook();

-- 6. Attach triggers to public.product_families
DROP TRIGGER IF EXISTS on_product_families_change ON public.product_families;
CREATE TRIGGER on_product_families_change
AFTER INSERT OR UPDATE OR DELETE ON public.product_families
FOR EACH ROW EXECUTE FUNCTION public.handle_supabase_webhook();

-- 7. Attach triggers to public.product_prices
--    UPDATE ayri ve KOSULLU: fiyat materialize her satiri yeniden yazar; kosulsuz bir tetik
--    fiyat DEGISMESE bile ~1044 webhook atesler (2026-08-15 olculdu). WHEN yalniz UPDATE'te
--    kurulabilir (INSERT'te OLD, DELETE'te NEW yoktur), o yuzden ekleme/silme ayri tetikte kalir.
DROP TRIGGER IF EXISTS on_product_prices_change ON public.product_prices;
DROP TRIGGER IF EXISTS on_product_prices_ins_del ON public.product_prices;
DROP TRIGGER IF EXISTS on_product_prices_upd ON public.product_prices;

CREATE TRIGGER on_product_prices_ins_del
AFTER INSERT OR DELETE ON public.product_prices
FOR EACH ROW EXECUTE FUNCTION public.handle_supabase_webhook();

CREATE TRIGGER on_product_prices_upd
AFTER UPDATE ON public.product_prices
FOR EACH ROW
WHEN (
  OLD.net_price IS DISTINCT FROM NEW.net_price
  OR OLD.gross_price IS DISTINCT FROM NEW.gross_price
  OR OLD.is_active IS DISTINCT FROM NEW.is_active
  OR OLD.currency IS DISTINCT FROM NEW.currency
)
EXECUTE FUNCTION public.handle_supabase_webhook();
