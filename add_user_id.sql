-- user_id kolonunu ekle
ALTER TABLE public.venthub_orders 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
