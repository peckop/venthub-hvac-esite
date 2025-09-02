-- Admin user setup - Production için otomatik admin rol atama
-- Migration olarak çalışacak, sizin için admin rolü otomatik atanacak

begin;

-- Admin user'ını otomatik tespit et ve rol ata
DO $$
DECLARE
    admin_user_id uuid;
    admin_email text;
BEGIN
    -- En son kayıt olan user'ı admin yap (genellikle site sahibi)
    SELECT u.id, u.email INTO admin_user_id, admin_email
    FROM auth.users u
    ORDER BY u.created_at DESC
    LIMIT 1;
    
    IF admin_user_id IS NOT NULL THEN
        -- User profile oluştur veya güncelle
        INSERT INTO public.user_profiles (id, role, created_at, updated_at)
        VALUES (admin_user_id, 'admin', now(), now())
        ON CONFLICT (id) 
        DO UPDATE SET 
            role = 'admin',
            updated_at = now();
            
        RAISE NOTICE 'Admin role assigned to user: %', admin_email;
    ELSE
        RAISE NOTICE 'No users found in auth.users table';
    END IF;
    
    -- Ek güvenlik: Eğer birden fazla user varsa, ilk user'ı da admin yap
    SELECT u.id INTO admin_user_id
    FROM auth.users u
    ORDER BY u.created_at ASC
    LIMIT 1;
    
    IF admin_user_id IS NOT NULL THEN
        INSERT INTO public.user_profiles (id, role, created_at, updated_at)
        VALUES (admin_user_id, 'admin', now(), now())
        ON CONFLICT (id) 
        DO UPDATE SET 
            role = 'admin',
            updated_at = now();
    END IF;
    
END $$;

-- Sonuç kontrolü
SELECT 
    u.email,
    COALESCE(up.role, 'no-role') as role,
    up.updated_at
FROM auth.users u
LEFT JOIN public.user_profiles up ON u.id = up.id
ORDER BY u.created_at;

commit;
