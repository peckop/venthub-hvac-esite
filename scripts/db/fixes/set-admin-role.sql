-- Admin rol atama scripti
-- Bu scripti Supabase SQL Editor'da çalıştırın

-- Önce mevcut user'ları listeleyin (email ile kontrol)
SELECT u.id, u.email, up.role 
FROM auth.users u
LEFT JOIN public.user_profiles up ON u.id = up.id
ORDER BY u.created_at DESC;

-- Size ait user_id'yi bulup aşağıdaki query'yi düzenleyin:
-- FIXME: 'YOUR_USER_ID_HERE' kısmını gerçek user ID'niz ile değiştirin

-- User profile oluştur (eğer yoksa)
INSERT INTO public.user_profiles (id, role) 
VALUES ('YOUR_USER_ID_HERE', 'admin')
ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- Kontrolü için tekrar query
SELECT u.email, up.role 
FROM auth.users u
LEFT JOIN public.user_profiles up ON u.id = up.id
WHERE u.id = 'YOUR_USER_ID_HERE';
