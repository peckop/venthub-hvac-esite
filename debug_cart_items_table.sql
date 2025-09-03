-- Cart items tablosunun yapısını ve constraint'lerini kontrol et
-- Bu SQL'i Supabase Dashboard SQL Editor'da çalıştır

-- 1. Tablo yapısı
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'cart_items' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Constraint'leri kontrol et
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.constraint_column_usage ccu
    ON tc.constraint_name = ccu.constraint_name
WHERE tc.table_name = 'cart_items'
  AND tc.table_schema = 'public';

-- 3. Mevcut verilerden NULL product_id'leri kontrol et
SELECT 
    COUNT(*) as total_items,
    COUNT(product_id) as with_product_id,
    COUNT(*) - COUNT(product_id) as null_product_ids
FROM cart_items;

-- 4. Eğer NULL product_id'ler varsa listele (ilk 10 kayıt)
SELECT 
    id, 
    cart_id, 
    product_id, 
    quantity,
    created_at
FROM cart_items 
WHERE product_id IS NULL 
LIMIT 10;
