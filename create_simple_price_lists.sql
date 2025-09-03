-- Price lists tablosunu basit şekilde oluştur
-- Bu SQL'i Supabase Dashboard SQL Editor'da çalıştır

-- 1. Price lists tablosunu oluştur
CREATE TABLE IF NOT EXISTS public.price_lists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    user_type VARCHAR(50) DEFAULT 'individual',
    is_active BOOLEAN DEFAULT true,
    effective_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    effective_to TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Updated at trigger (eğer set_updated_at fonksiyonu mevcutsa)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'set_updated_at') THEN
        DROP TRIGGER IF EXISTS price_lists_updated_at ON public.price_lists;
        CREATE TRIGGER price_lists_updated_at
            BEFORE UPDATE ON public.price_lists
            FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
    END IF;
END $$;

-- 3. RLS ayarları
ALTER TABLE public.price_lists ENABLE ROW LEVEL SECURITY;

-- Herkes price list'leri okuyabilir (fiyat hesaplama için gerekli)
DROP POLICY IF EXISTS "Anyone can view price lists" ON public.price_lists;
CREATE POLICY "Anyone can view price lists" ON public.price_lists
FOR SELECT USING (true);

-- 4. Varsayılan fiyat listelerini ekle
INSERT INTO public.price_lists (name, description, user_type, is_active) VALUES
('Standart Fiyat Listesi', 'Genel kullanıcılar için standart fiyat listesi', 'individual', true),
('Bayi Fiyat Listesi', 'Bayiler için özel fiyat listesi', 'dealer', true),
('Kurumsal Fiyat Listesi', 'Kurumsal müşteriler için özel fiyat listesi', 'corporate', true)
ON CONFLICT (id) DO NOTHING;

-- 5. Kontrol et
SELECT 
    id, 
    name, 
    user_type, 
    is_active, 
    effective_from, 
    effective_to
FROM public.price_lists 
ORDER BY created_at;
