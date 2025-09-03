-- Price lists tablosunu oluştur (cart_items foreign key için gerekli)
-- Bu SQL'i Supabase Dashboard SQL Editor'da çalıştır

-- 1. Price lists tablosunu kontrol et
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'price_lists';

-- 2. Eğer yoksa oluştur
CREATE TABLE IF NOT EXISTS public.price_lists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    user_type VARCHAR(50), -- 'individual', 'dealer', 'corporate'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Updated at trigger
DROP TRIGGER IF EXISTS price_lists_updated_at ON public.price_lists;
CREATE TRIGGER price_lists_updated_at
    BEFORE UPDATE ON public.price_lists
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 4. RLS ayarları
ALTER TABLE public.price_lists ENABLE ROW LEVEL SECURITY;

-- Herkes price list'leri görebilir (fiyat hesaplama için gerekli)
DROP POLICY IF EXISTS "Anyone can view price lists" ON public.price_lists;
CREATE POLICY "Anyone can view price lists" ON public.price_lists
FOR SELECT USING (true);

-- Sadece admin price list oluşturabilir/düzenleyebilir
DROP POLICY IF EXISTS "Only admins can manage price lists" ON public.price_lists;
CREATE POLICY "Only admins can manage price lists" ON public.price_lists
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- 5. Varsayılan price list'leri ekle
INSERT INTO public.price_lists (name, description, user_type, is_active) VALUES
('Bireysel Fiyat Listesi', 'Bireysel kullanıcılar için standart fiyat listesi', 'individual', true),
('Bayi Fiyat Listesi', 'Bayiler için indirimli fiyat listesi', 'dealer', true),
('Kurumsal Fiyat Listesi', 'Kurumsal müşteriler için özel fiyat listesi', 'corporate', true)
ON CONFLICT DO NOTHING;

-- 6. Kontrol et
SELECT * FROM public.price_lists;
