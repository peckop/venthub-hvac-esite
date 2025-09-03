-- Cart items tablosunu düzelt (cart_id kolonu eksik)
-- Bu SQL'i Supabase Dashboard SQL Editor'da çalıştır

-- 1. Önce mevcut tablo yapısını kontrol et
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'cart_items' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Mevcut veriler varsa yedekle (opsiyonel)
-- SELECT * FROM cart_items LIMIT 10;

-- 3. Tabloyu sil ve yeniden oluştur (en güvenli yol)
DROP TABLE IF EXISTS public.cart_items CASCADE;

-- 4. Cart items tablosunu doğru şekilde oluştur
CREATE TABLE public.cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id UUID NOT NULL REFERENCES public.shopping_carts(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price DECIMAL(10,2),
    price_list_id UUID REFERENCES public.price_lists(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint: bir sepette aynı ürün sadece bir kez
    CONSTRAINT cart_items_cart_product_unique UNIQUE (cart_id, product_id)
);

-- 5. Updated at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Updated at trigger'ı cart_items'a ekle
DROP TRIGGER IF EXISTS cart_items_updated_at ON public.cart_items;
CREATE TRIGGER cart_items_updated_at
    BEFORE UPDATE ON public.cart_items
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 6. RLS (Row Level Security) ayarları
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- Kullanıcılar sadece kendi sepetlerindeki ürünleri görebilir/düzenleyebilir
DROP POLICY IF EXISTS "Users can manage their own cart items" ON public.cart_items;
CREATE POLICY "Users can manage their own cart items" ON public.cart_items
FOR ALL USING (
    cart_id IN (
        SELECT id FROM public.shopping_carts 
        WHERE user_id = auth.uid()
    )
);

-- 7. İndeksler (performans için)
CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON public.cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON public.cart_items(product_id);

-- 8. Son kontrol - tablo yapısını görüntüle
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'cart_items' 
  AND table_schema = 'public'
ORDER BY ordinal_position;
