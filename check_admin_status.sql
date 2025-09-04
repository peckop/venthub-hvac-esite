-- Mevcut kullanıcının admin durumunu kontrol et
SELECT id, email, role, organization_id, created_at 
FROM user_profiles 
WHERE email = 'recep.varlik@gmail.com';

-- Eğer kayıt yoksa, oluştur
INSERT INTO user_profiles (id, email, role, organization_id)
SELECT 
  auth.uid(),
  auth.jwt() ->> 'email',
  'admin',
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM user_profiles 
  WHERE email = 'recep.varlik@gmail.com'
)
AND auth.jwt() ->> 'email' = 'recep.varlik@gmail.com';

-- Son durumu kontrol et
SELECT id, email, role, organization_id, created_at 
FROM user_profiles 
WHERE email = 'recep.varlik@gmail.com';
