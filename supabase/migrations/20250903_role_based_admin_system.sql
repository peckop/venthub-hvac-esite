-- Database tabanlı admin role sistemi
-- user_profiles tablosunu güçlendirip role yönetimi ekleyelim

-- user_profiles tablosunun mevcut durumunu kontrol et ve güçlendir
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    full_name TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Role kolonu için check constraint ekle
DO $$
BEGIN
    -- Eğer constraint yoksa ekle
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'user_profiles_role_check' 
        AND table_name = 'user_profiles'
    ) THEN
        ALTER TABLE public.user_profiles 
        ADD CONSTRAINT user_profiles_role_check 
        CHECK (role IN ('user', 'admin', 'moderator'));
    END IF;
END $$;

-- Role kolonu yoksa ekle, varsa güncelle
DO $$
BEGIN
    -- Role kolonu yoksa ekle
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'role'
    ) THEN
        ALTER TABLE public.user_profiles ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'user';
    END IF;
    
    -- full_name kolonu yoksa ekle
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'full_name'
    ) THEN
        ALTER TABLE public.user_profiles ADD COLUMN full_name TEXT;
    END IF;
    
    -- phone kolonu yoksa ekle
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'phone'
    ) THEN
        ALTER TABLE public.user_profiles ADD COLUMN phone TEXT;
    END IF;
    
    -- created_at kolonu yoksa ekle
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'created_at'
    ) THEN
        ALTER TABLE public.user_profiles ADD COLUMN created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
    END IF;
    
    -- updated_at kolonu yoksa ekle
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.user_profiles ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
    END IF;
END $$;

-- Index'ler
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_created_at ON public.user_profiles(created_at);

-- Updated at trigger
CREATE OR REPLACE FUNCTION public.update_user_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger'ı oluştur/güncelle
DROP TRIGGER IF EXISTS trg_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER trg_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_user_profiles_updated_at();

-- RLS etkinleştir
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Politikaları güncelle
-- Kullanıcılar kendi profillerini görebilir
DROP POLICY IF EXISTS user_profiles_select_own ON public.user_profiles;
CREATE POLICY user_profiles_select_own
    ON public.user_profiles FOR SELECT
    USING (id = auth.uid());

-- Admin'ler tüm profilleri görebilir
DROP POLICY IF EXISTS user_profiles_select_admin ON public.user_profiles;
CREATE POLICY user_profiles_select_admin
    ON public.user_profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles up 
            WHERE up.id = auth.uid() AND up.role = 'admin'
        )
    );

-- Kullanıcılar kendi profillerini güncelleyebilir (role hariç)
DROP POLICY IF EXISTS user_profiles_update_own ON public.user_profiles;
CREATE POLICY user_profiles_update_own
    ON public.user_profiles FOR UPDATE
    USING (id = auth.uid())
    WITH CHECK (
        id = auth.uid() AND 
        -- Role değişikliği yapılamaz (sadece admin yapabilir)
        (role IS NULL OR role = (SELECT role FROM public.user_profiles WHERE id = auth.uid()))
    );

-- Admin'ler tüm profilleri güncelleyebilir (role dahil)
DROP POLICY IF EXISTS user_profiles_update_admin ON public.user_profiles;
CREATE POLICY user_profiles_update_admin
    ON public.user_profiles FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles up 
            WHERE up.id = auth.uid() AND up.role = 'admin'
        )
    );

-- Kullanıcılar kendi profillerini oluşturabilir
DROP POLICY IF EXISTS user_profiles_insert_own ON public.user_profiles;
CREATE POLICY user_profiles_insert_own
    ON public.user_profiles FOR INSERT
    WITH CHECK (
        id = auth.uid() AND 
        role = 'user' -- Yeni kullanıcılar sadece 'user' rolü alabilir
    );

-- Admin profil oluşturma (service_role için)
DROP POLICY IF EXISTS user_profiles_insert_service ON public.user_profiles;
CREATE POLICY user_profiles_insert_service
    ON public.user_profiles FOR INSERT
    WITH CHECK (auth.role() = 'service_role');

-- Admin helper fonksiyonları
CREATE OR REPLACE FUNCTION public.is_user_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_profiles 
        WHERE id = user_id AND role = 'admin'
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role 
    FROM public.user_profiles 
    WHERE id = user_id;
    
    RETURN COALESCE(user_role, 'user');
END;
$$;

-- Admin kullanıcı atama fonksiyonu (sadece service_role için)
CREATE OR REPLACE FUNCTION public.set_user_admin_role(user_id UUID, new_role TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Sadece geçerli roller
    IF new_role NOT IN ('user', 'admin', 'moderator') THEN
        RAISE EXCEPTION 'Invalid role: %', new_role;
    END IF;
    
    -- Kullanıcının profile'ı var mı kontrol et
    IF NOT EXISTS (SELECT 1 FROM public.user_profiles WHERE id = user_id) THEN
        -- Profile oluştur
        INSERT INTO public.user_profiles (id, role) VALUES (user_id, new_role)
        ON CONFLICT (id) DO UPDATE SET role = new_role, updated_at = NOW();
    ELSE
        -- Role güncelle
        UPDATE public.user_profiles SET role = new_role, updated_at = NOW() WHERE id = user_id;
    END IF;
    
    RETURN TRUE;
END;
$$;

-- İlk admin kullanıcı ataması (eğer hiç admin yoksa)
DO $$
DECLARE
    admin_count INTEGER;
    first_user_id UUID;
BEGIN
    -- Kaç admin var kontrol et
    SELECT COUNT(*) INTO admin_count 
    FROM public.user_profiles 
    WHERE role = 'admin';
    
    IF admin_count = 0 THEN
        -- Hiç admin yoksa, ilk kullanıcıyı admin yap
        SELECT id INTO first_user_id 
        FROM auth.users 
        ORDER BY created_at ASC 
        LIMIT 1;
        
        IF first_user_id IS NOT NULL THEN
            -- Profile oluştur/güncelle
            INSERT INTO public.user_profiles (id, role, created_at, updated_at)
            VALUES (first_user_id, 'admin', NOW(), NOW())
            ON CONFLICT (id) 
            DO UPDATE SET 
                role = 'admin', 
                updated_at = NOW();
                
            RAISE NOTICE 'First user (%) has been assigned admin role', first_user_id;
        END IF;
    END IF;
END $$;

-- Admin kullanıcı listesi görüntüleme view'ı
CREATE OR REPLACE VIEW public.admin_users AS
SELECT 
    u.id,
    u.email,
    up.full_name,
    up.phone,
    up.role,
    up.created_at,
    up.updated_at
FROM auth.users u
LEFT JOIN public.user_profiles up ON u.id = up.id
WHERE up.role IN ('admin', 'moderator')
ORDER BY up.created_at DESC;

-- View için RLS 
ALTER VIEW public.admin_users SET (security_invoker = on);

COMMENT ON TABLE public.user_profiles IS 'Kullanıcı profilleri ve rolleri';
COMMENT ON COLUMN public.user_profiles.role IS 'Kullanıcı rolü: user, admin, moderator';
COMMENT ON FUNCTION public.is_user_admin IS 'Kullanıcının admin olup olmadığını kontrol eder';
COMMENT ON FUNCTION public.get_user_role IS 'Kullanıcının rolünü getirir';
COMMENT ON FUNCTION public.set_user_admin_role IS 'Kullanıcıya admin rolü atar (sadece service_role)';
COMMENT ON VIEW public.admin_users IS 'Admin ve moderatör kullanıcıları listesi';
