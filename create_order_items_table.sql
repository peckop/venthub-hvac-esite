-- venthub_order_items tablosunu oluştur
CREATE TABLE IF NOT EXISTS public.venthub_order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES public.venthub_orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id),
    product_name TEXT,
    quantity INTEGER NOT NULL,
    price_at_time DECIMAL(10,2) NOT NULL,
    product_image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS'i aktif et
ALTER TABLE public.venthub_order_items ENABLE ROW LEVEL SECURITY;

-- RLS politikası ekle
CREATE POLICY IF NOT EXISTS "Users can view their own order items" 
ON public.venthub_order_items FOR SELECT 
USING (order_id IN (SELECT id FROM public.venthub_orders WHERE user_id = auth.uid()));

-- Index ekle
CREATE INDEX IF NOT EXISTS idx_venthub_order_items_order_id ON public.venthub_order_items(order_id);
