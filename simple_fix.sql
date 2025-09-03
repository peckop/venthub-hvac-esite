-- Basit düzeltme: Sadece shipping_method kolonunu ekle
ALTER TABLE public.venthub_orders 
ADD COLUMN IF NOT EXISTS shipping_method TEXT DEFAULT 'standard';

-- Diğer kritik kolonları da ekle
ALTER TABLE public.venthub_orders 
ADD COLUMN IF NOT EXISTS subtotal_snapshot DECIMAL(10,2);

ALTER TABLE public.venthub_orders 
ADD COLUMN IF NOT EXISTS conversation_id TEXT;

ALTER TABLE public.venthub_orders 
ADD COLUMN IF NOT EXISTS invoice_type TEXT;

ALTER TABLE public.venthub_orders 
ADD COLUMN IF NOT EXISTS invoice_info JSONB;

ALTER TABLE public.venthub_orders 
ADD COLUMN IF NOT EXISTS legal_consents JSONB;

-- Sonucu kontrol et
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'venthub_orders' AND table_schema = 'public' 
ORDER BY ordinal_position;
