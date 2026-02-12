-- ============================================================
-- EXPROOF FAN KATEGORİ GÜNCELLEMESİ VE ÜRÜN EKLEME - 2026-02-12
-- ============================================================

BEGIN;

-- 1. Kategori İsim Güncellemesi
-- "Endüstriyel Fanlar" kategorisini "Exproof Fanlar" olarak güncelle
UPDATE categories 
SET name = 'Exproof Fanlar' 
WHERE slug = 'endustriyel-fanlar';

-- 2. Vortice C ATEX Ürün Ekleme (Eğer yoksa)
-- Not: Kategori ID'sini slug üzerinden dinamik alıyoruz
DO $$
DECLARE
    exproof_cat_id UUID;
    vortice_exists BOOLEAN;
BEGIN
    SELECT id INTO exproof_cat_id FROM categories WHERE slug = 'endustriyel-fanlar' LIMIT 1;
    
    SELECT EXISTS (SELECT 1 FROM products WHERE slug = 'vortice-c-atex-exproof-fan') INTO vortice_exists;

    IF exproof_cat_id IS NOT NULL AND NOT vortice_exists THEN
        INSERT INTO products (
            category_id,
            name,
            slug,
            description,
            price,
            active,
            images,
            technical_specs,
            metadata
        ) VALUES (
            exproof_cat_id,
            'Vortice C ATEX Exproof Fan',
            'vortice-c-atex-exproof-fan',
            'Patlayıcı atmosferlerde kullanım için tasarlanmış, kıvılcım çıkarmaz (Ex-proof) santrifüj fan. Vortice kalitesiyle güvenli havalandırma.',
            0, -- Quote based
            true,
            ARRAY['/images/products/vortice-exproof-1.webp'],
            jsonb_build_object(
                'Tipi', 'Santrifüj / Salyangoz',
                'Sertifika', 'ATEX II 2G/D h T4',
                'Malzeme', 'Antistatik Polimer gövde / Bakır giriş halkası',
                'Kullanım Alanı', 'Kimya tesisleri, laboratuvarlar, boyahaneler'
            ),
            jsonb_build_object(
                'brand', 'Vortice',
                'origin', 'Italy'
            )
        );
        RAISE NOTICE 'Vortice C ATEX ürünü başarıyla eklendi.';
    ELSIF vortice_exists THEN
        RAISE NOTICE 'Vortice C ATEX ürünü zaten mevcut, atlanıyor.';
    ELSE
        RAISE WARNING 'Exproof Fanlar kategorisi bulunamadı!';
    END IF;
END $$;

COMMIT;
