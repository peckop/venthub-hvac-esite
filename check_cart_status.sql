-- Sepet durumunu kontrol et
-- Bu SQL'i Supabase Dashboard SQL Editor'da çalıştır

-- 1. Kullanıcının sepeti var mı?
SELECT 
    sc.id as cart_id,
    sc.user_id,
    sc.created_at,
    COUNT(ci.id) as item_count
FROM public.shopping_carts sc
LEFT JOIN public.cart_items ci ON sc.id = ci.cart_id
WHERE sc.user_id = '357f4f40-2334-4a99-a156-013603df3914'  -- Güncel user ID
GROUP BY sc.id, sc.user_id, sc.created_at;

-- 2. Sepet ürünleri detayı
SELECT 
    ci.*,
    p.name as product_name,
    p.price as product_price
FROM public.cart_items ci
JOIN public.products p ON ci.product_id = p.id
JOIN public.shopping_carts sc ON ci.cart_id = sc.id
WHERE sc.user_id = '357f4f40-2334-4a99-a156-013603df3914'
ORDER BY ci.created_at DESC;

-- 3. Organizations tablosu var mı kontrol et
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'organizations';
