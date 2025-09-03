-- Product prices tablosunu oluştur
-- Bu SQL'i Supabase Dashboard SQL Editor'da çalıştır

-- 1. Product prices tablosunu oluştur
CREATE TABLE IF NOT EXISTS public.product_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    price_list_id UUID NOT NULL REFERENCES public.price_lists(id) ON DELETE CASCADE,
    base_price DECIMAL(10,2) NOT NULL,
    sale_price DECIMAL(10,2),
    discount_percentage DECIMAL(5,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    valid_until TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint: bir ürün için aynı fiyat listesinde sadece bir aktif fiyat
    CONSTRAINT product_prices_unique UNIQUE (product_id, price_list_id, valid_from)
);

-- 2. Updated at trigger
DROP TRIGGER IF EXISTS product_prices_updated_at ON public.product_prices;
CREATE TRIGGER product_prices_updated_at
    BEFORE UPDATE ON public.product_prices
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3. RLS ayarları
ALTER TABLE public.product_prices ENABLE ROW LEVEL SECURITY;

-- Herkes fiyatları görebilir (fiyat hesaplama için gerekli)
DROP POLICY IF EXISTS "Anyone can view product prices" ON public.product_prices;
CREATE POLICY "Anyone can view product prices" ON public.product_prices
FOR SELECT USING (true);

-- Sadece admin fiyat oluşturabilir/düzenleyebilir
DROP POLICY IF EXISTS "Only admins can manage product prices" ON public.product_prices;
CREATE POLICY "Only admins can manage product prices" ON public.product_prices
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- 4. İndeksler (performans için)
CREATE INDEX IF NOT EXISTS idx_product_prices_product_id ON public.product_prices(product_id);
CREATE INDEX IF NOT EXISTS idx_product_prices_price_list_id ON public.product_prices(price_list_id);
CREATE INDEX IF NOT EXISTS idx_product_prices_active ON public.product_prices(is_active);

-- 5. Mevcut ürünler için varsayılan fiyatları ekle
-- Önce products tablosundaki tüm ürünleri al ve her fiyat listesi için fiyat ekle
INSERT INTO public.product_prices (product_id, price_list_id, base_price, sale_price, is_active)
SELECT 
    p.id as product_id,
    pl.id as price_list_id,
    p.price as base_price,
    p.price as sale_price,
    true as is_active
FROM public.products p
CROSS JOIN public.price_lists pl
WHERE p.price IS NOT NULL
ON CONFLICT (product_id, price_list_id, valid_from) DO NOTHING;

-- 6. Kontrol et - oluşturulan fiyatları görüntüle
SELECT 
    pp.id,
    p.name as product_name,
    pl.name as price_list_name,
    pp.base_price,
    pp.sale_price,
    pp.is_active
FROM public.product_prices pp
JOIN public.products p ON pp.product_id = p.id
JOIN public.price_lists pl ON pp.price_list_id = pl.id
ORDER BY p.name, pl.user_type
LIMIT 20;
