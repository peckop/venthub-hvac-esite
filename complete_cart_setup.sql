-- Sepet tablolarını tamamen kurmak için SQL
-- Bu SQL'i Supabase Dashboard SQL Editor'da çalıştır

-- 1. Updated at trigger fonksiyonunu oluştur
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Mevcut cart_items tablosunu sil
DROP TABLE IF EXISTS public.cart_items CASCADE;

-- 3. Cart items tablosunu doğru şekilde oluştur
CREATE TABLE public.cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id UUID NOT NULL REFERENCES public.shopping_carts(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint: bir sepette aynı ürün sadece bir kez
    CONSTRAINT cart_items_cart_product_unique UNIQUE (cart_id, product_id)
);

-- 4. Updated at trigger'ı ekle
CREATE TRIGGER cart_items_updated_at
    BEFORE UPDATE ON public.cart_items
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 5. RLS (Row Level Security) ayarları
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- Kullanıcılar sadece kendi sepetlerindeki ürünleri görebilir/düzenleyebilir
CREATE POLICY "Users can manage their own cart items" ON public.cart_items
FOR ALL USING (
    cart_id IN (
        SELECT id FROM public.shopping_carts 
        WHERE user_id = auth.uid()
    )
);

-- 6. İndeksler (performans için)
CREATE INDEX idx_cart_items_cart_id ON public.cart_items(cart_id);
CREATE INDEX idx_cart_items_product_id ON public.cart_items(product_id);

-- 7. Shopping carts tablosunun updated_at trigger'ını da ekle (eğer yoksa)
DROP TRIGGER IF EXISTS shopping_carts_updated_at ON public.shopping_carts;
CREATE TRIGGER shopping_carts_updated_at
    BEFORE UPDATE ON public.shopping_carts
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 8. Son kontrol - tablo yapısını görüntüle
SELECT 
    'cart_items' as table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'cart_items' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 9. Shopping carts tablosu yapısını da kontrol et
SELECT 
    'shopping_carts' as table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'shopping_carts' 
  AND table_schema = 'public'
ORDER BY ordinal_position;
