-- Ürün kategorizasyon düzeltmesi (VERİ migration'ı) — kaynak: canlı DB + Avensair 2026 kataloğu (NotebookLM, atıflı).
-- Kategori İSKELETİNE dokunmaz (kategori ekleme/silme YOK); yalnız ürünlerin category_id/subcategory_id'sini düzeltir.
-- İdempotent: yeniden çalışsa no-op (WHERE'ler düzeltilmiş kayıtları artık yakalamaz).
--
-- A) 67 ürün: category_id bir ALT-kategoriyi gösteriyordu (model tutarsızlığı). Tek doğru model:
--    category_id = ÜST, subcategory_id = ALT. (radyal/çatı/jet → industrial-ventilation; air-curtains → commercial-ventilation)
-- B) 12 orphan (kategorisiz; hiçbir kategori altında görünmüyorlardı) → Avensair grup otoritesine göre yerleştirildi:
--    - VORT QBK SAL KC (7): Avensair "36 Davlumbaz Fanlar" (mutfak/kabin egzoz) → commercial-ventilation
--    - VORT QUADRO EVO (1): Avensair "18 Duvar ve Tavan Tipi Radyal Fanlar" (banyo/WC) → residential-ventilation / banyo-ve-tuvalet-fanlari
--    - CRC-A (2) + CASALS MBRU/MTCA (2): Avensair kataloğunda YOK; santrifüj/endüstriyel → industrial-ventilation / radyal-fanlar
--      (PROVİZYONEL: Avensair bunları satmıyor; ileride "sat / çıkar" kararına göre güncellenebilir.)

-- ── A) Normalize: category_id bir alt-kategoriyse → üst'e taşı, alt'ı subcategory_id yap ──
UPDATE public.products p
SET subcategory_id = p.category_id,
    category_id    = c.parent_id
FROM public.categories c
WHERE c.id = p.category_id
  AND c.parent_id IS NOT NULL;

-- ── B) Orphan (category_id IS NULL) yerleşimleri ──

-- VORT QBK SAL KC → commercial-ventilation
UPDATE public.products
SET category_id = (SELECT id FROM public.categories WHERE slug = 'commercial-ventilation')
WHERE category_id IS NULL AND name ILIKE '%QBK%';

-- VORT QUADRO EVO → residential-ventilation / banyo-ve-tuvalet-fanlari
UPDATE public.products
SET category_id    = (SELECT id FROM public.categories WHERE slug = 'residential-ventilation'),
    subcategory_id = (SELECT id FROM public.categories WHERE slug = 'banyo-ve-tuvalet-fanlari')
WHERE category_id IS NULL AND name ILIKE '%QUADRO%';

-- CRC-A + CASALS MBRU/MTCA → industrial-ventilation / radyal-fanlar (provizyonel)
UPDATE public.products
SET category_id    = (SELECT id FROM public.categories WHERE slug = 'industrial-ventilation'),
    subcategory_id = (SELECT id FROM public.categories WHERE slug = 'radyal-fanlar')
WHERE category_id IS NULL AND (name ILIKE '%CRC-A%' OR name ILIKE 'CASALS %');
