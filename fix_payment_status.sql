-- payment_status kolonunu paid yap (status değil!)
UPDATE public.venthub_orders 
SET payment_status = 'paid', payment_debug = '{"manual_update": true}' 
WHERE id = '7d307ff3-fce6-4336-ab18-9339e238d3cf';
