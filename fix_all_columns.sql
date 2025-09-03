-- Tüm eksik kolonları ekle
ALTER TABLE public.venthub_orders 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS conversation_id TEXT,
ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS subtotal_snapshot DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS shipping_address JSONB,
ADD COLUMN IF NOT EXISTS billing_address JSONB,
ADD COLUMN IF NOT EXISTS customer_email TEXT,
ADD COLUMN IF NOT EXISTS customer_name TEXT,
ADD COLUMN IF NOT EXISTS customer_phone TEXT,
ADD COLUMN IF NOT EXISTS payment_method TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS invoice_type TEXT,
ADD COLUMN IF NOT EXISTS invoice_info JSONB,
ADD COLUMN IF NOT EXISTS legal_consents JSONB,
ADD COLUMN IF NOT EXISTS shipping_method TEXT DEFAULT 'standard';
