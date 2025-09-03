-- Organizations tablosunu güvenli şekilde oluştur
-- Bu SQL'i Supabase Dashboard SQL Editor'da çalıştır

-- 1. Organizations tablosunu oluştur (order-validate için gerekli)
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    tier_level INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Updated at trigger
DROP TRIGGER IF EXISTS organizations_updated_at ON public.organizations;
CREATE TRIGGER organizations_updated_at
    BEFORE UPDATE ON public.organizations
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3. GÜVENLİ RLS ayarları
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Herkes organizasyonları okuyabilir (fiyat hesaplama için gerekli)
DROP POLICY IF EXISTS "Anyone can view organizations" ON public.organizations;
CREATE POLICY "Anyone can view organizations" ON public.organizations
FOR SELECT USING (true);

-- Sadece admin organizasyon oluşturabilir/düzenleyebilir (GÜVENLİK)
DROP POLICY IF EXISTS "Only admins can manage organizations" ON public.organizations;
CREATE POLICY "Only admins can manage organizations" ON public.organizations
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- 4. Varsayılan organizasyonları ekle
INSERT INTO public.organizations (name, tier_level, is_active) VALUES
('Standart Organizasyon', 1, true),
('Bayi Organizasyon', 2, true),
('Kurumsal Organizasyon', 3, true)
ON CONFLICT (id) DO NOTHING;

-- 5. Kontrol et
SELECT id, name, tier_level, is_active FROM public.organizations;
