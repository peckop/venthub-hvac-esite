-- Sipariş durumunu paid yap
UPDATE public.venthub_orders 
SET status = 'paid' 
WHERE id = '7d307ff3-fce6-4336-ab18-9339e238d3cf';
