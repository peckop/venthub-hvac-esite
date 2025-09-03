-- payment_debug kolonunu ekle
ALTER TABLE public.venthub_orders 
ADD COLUMN IF NOT EXISTS payment_debug JSONB;
