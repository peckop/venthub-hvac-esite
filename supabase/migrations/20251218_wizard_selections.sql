-- Wizard Selections - Kullanıcı Seçim Kayıt Sistemi
-- Amaç: Hukuki koruma için wizard seçimlerinin kaydedilmesi
-- Tarih: 2024-12-18

-- =====================================================
-- wizard_selections tablosu
-- Kullanıcının wizard'da yaptığı tüm seçimleri saklar
-- =====================================================

CREATE TABLE IF NOT EXISTS public.wizard_selections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Kullanıcı bilgileri
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    session_id TEXT NOT NULL,
    
    -- Kapı boyutları (giriş)
    door_width_cm INT NOT NULL,
    door_height_cm INT NOT NULL,
    
    -- Kullanım ve sektör
    usage_location TEXT, -- 'entrance', 'cold-storage', 'industrial', 'retail'
    sector TEXT,
    
    -- Çevresel koşullar
    wind_condition TEXT, -- 'none', 'light', 'moderate', 'strong'
    traffic_intensity TEXT, -- 'low', 'medium', 'high'
    
    -- Isıtma
    heating_needed TEXT, -- 'yes', 'no', 'unsure'
    climate_zone TEXT, -- 'cold', 'moderate', 'warm'
    
    -- Hesaplama sonuçları
    calculated_airflow_m3h INT,
    calculated_nozzle_velocity DECIMAL(5,2),
    calculated_power_w INT,
    
    -- Önerilen ve seçilen ürünler
    recommended_series TEXT, -- 'elektrikli-isitici', 'ortam-havali'
    recommended_product_ids UUID[],
    selected_product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    
    -- Meta
    created_at TIMESTAMPTZ DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    
    -- Sipariş ile eşleştirme
    order_id UUID REFERENCES public.venthub_orders(id) ON DELETE SET NULL
);

-- =====================================================
-- İndeksler
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_wizard_selections_user_id ON public.wizard_selections(user_id);
CREATE INDEX IF NOT EXISTS idx_wizard_selections_session_id ON public.wizard_selections(session_id);
CREATE INDEX IF NOT EXISTS idx_wizard_selections_created_at ON public.wizard_selections(created_at);
CREATE INDEX IF NOT EXISTS idx_wizard_selections_order_id ON public.wizard_selections(order_id);

-- =====================================================
-- RLS Politikaları
-- =====================================================

ALTER TABLE public.wizard_selections ENABLE ROW LEVEL SECURITY;

-- Kullanıcılar kendi kayıtlarını görebilir
CREATE POLICY "Users can view own selections"
    ON public.wizard_selections
    FOR SELECT
    TO authenticated
    USING (
        user_id = (SELECT auth.uid())
        OR session_id = current_setting('app.session_id', true)
    );

-- Anonim kullanıcılar dahil herkes kayıt oluşturabilir
CREATE POLICY "Anyone can insert selections"
    ON public.wizard_selections
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Admin tüm kayıtları görebilir
CREATE POLICY "Admin can view all selections"
    ON public.wizard_selections
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE admin_users.user_id = (SELECT auth.uid())
        )
    );

-- Admin sipariş eşleştirmesi yapabilir
CREATE POLICY "Admin can update selections"
    ON public.wizard_selections
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE admin_users.user_id = (SELECT auth.uid())
        )
    );

-- =====================================================
-- Yorum
-- =====================================================

COMMENT ON TABLE public.wizard_selections IS 'Hava perdesi seçim wizard kaydları - hukuki koruma amaçlı';
COMMENT ON COLUMN public.wizard_selections.session_id IS 'Anonim kullanıcılar için oturum tanımlayıcı';
COMMENT ON COLUMN public.wizard_selections.calculated_airflow_m3h IS 'Formül ile hesaplanan gerekli debi (m³/h)';
COMMENT ON COLUMN public.wizard_selections.order_id IS 'Bu seçimle ilişkilendirilen sipariş (varsa)';
