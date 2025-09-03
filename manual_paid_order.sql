-- payment_debug kolonunu ekle
ALTER TABLE public.venthub_orders 
ADD COLUMN IF NOT EXISTS payment_debug JSONB;

-- Siparişi paid yap
UPDATE public.venthub_orders 
SET status = 'paid', payment_debug = '{"manual_update": true}' 
WHERE id = '7d307ff3-fce6-4336-ab18-9339e238d3cf';
