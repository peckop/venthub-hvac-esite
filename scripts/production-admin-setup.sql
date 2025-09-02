-- Production admin rol atama
-- Bu SQL'leri Supabase Dashboard > SQL Editor'da çalıştırın

-- 1. ÖNCE: Mevcut user'ları listeleyin
SELECT 
  u.id, 
  u.email, 
  u.created_at,
  COALESCE(up.role, 'no-role') as current_role
FROM auth.users u
LEFT JOIN public.user_profiles up ON u.id = up.id
ORDER BY u.created_at DESC
LIMIT 10;

-- 2. Size ait email adresini yukarıdaki listede bulun ve user ID'sini not edin

-- 3. SONRA: Admin rolü atayın (USER_ID_HERE kısmını değiştirin)
-- FIXME: Aşağıdaki 'YOUR_USER_ID_HERE' yerine gerçek user ID'nizi yazın
DO $$
DECLARE
    target_user_id uuid := 'YOUR_USER_ID_HERE'; -- Bu kısmı değiştirin!
BEGIN
    -- User profile oluştur veya güncelle
    INSERT INTO public.user_profiles (id, role, created_at, updated_at)
    VALUES (target_user_id, 'admin', now(), now())
    ON CONFLICT (id) 
    DO UPDATE SET 
        role = 'admin',
        updated_at = now();
        
    RAISE NOTICE 'Admin role assigned successfully!';
END $$;

-- 4. KONTROLİ: Rolün atandığını doğrulayın  
SELECT 
  u.email,
  up.role,
  up.updated_at
FROM auth.users u
LEFT JOIN public.user_profiles up ON u.id = up.id
WHERE u.email = 'YOUR_EMAIL_HERE'; -- Email adresinizi yazın
