-- Status constraint'ini kaldır
ALTER TABLE public.venthub_orders 
DROP CONSTRAINT IF EXISTS venthub_orders_status_check;

-- Siparişi paid yap
UPDATE public.venthub_orders 
SET status = 'paid', payment_debug = '{"manual_update": true}' 
WHERE id = '7d307ff3-fce6-4336-ab18-9339e238d3cf';
