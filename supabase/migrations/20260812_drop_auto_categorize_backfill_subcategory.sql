-- 20260812 — Legacy auto-categorize tetikleyicisi kaldırılıyor + alt-kategori backfill
-- SORUN: tr_product_auto_category (INSERT tetikleyicisi) isim desenine göre NEW.subcategory_id'yi
-- EZİYORDU; desen eşleşmeyince NULL yazdı. Kademe-2 loader'ının gönderdiği doğru alt-kategoriler
-- böylece 374 ürünün 362'sinde silindi (banyo fanları sayfasında 27 yerine 4 ürün görünmesinin kökü).
-- Kademe-2 modelinde kategori/alt-kategori otoritesi AİLE'dir (product_families); tahmin motoru gereksiz.

begin;

-- 1) Tetikleyici ve fonksiyonu kaldır (category_mapping_rules tablosu veri olarak kalır, zararsız)
drop trigger if exists tr_product_auto_category on public.products;
drop function if exists public.tr_auto_categorize_trigger();
drop function if exists public.fn_auto_categorize_products();  -- aynı motorun toplu RPC'si, çağıranı yok

-- 2) Backfill: her ürünün kategori/alt-kategorisi ailesinden kopyalanır (aile = otorite)
update public.products p
   set category_id    = f.category_id,
       subcategory_id = f.subcategory_id
  from public.product_families f
 where p.family_id = f.id
   and (p.category_id    is distinct from f.category_id
     or p.subcategory_id is distinct from f.subcategory_id);

-- 3) Doğrulama guard'ları
do $$
declare
  v_trigger int;
  v_mismatch int;
  v_subcat int;
begin
  select count(*) into v_trigger
    from pg_trigger t join pg_class c on c.oid = t.tgrelid
   where c.relname = 'products' and t.tgname = 'tr_product_auto_category';
  if v_trigger <> 0 then
    raise exception 'Tetikleyici hala duruyor';
  end if;

  select count(*) into v_mismatch
    from public.products p
    join public.product_families f on f.id = p.family_id
   where p.category_id is distinct from f.category_id
      or p.subcategory_id is distinct from f.subcategory_id;
  if v_mismatch <> 0 then
    raise exception 'Backfill eksik: % urun ailesiyle uyumsuz', v_mismatch;
  end if;

  -- Aileleri alt-kategorili olan ürünlerin alt-kategorisi artık dolu olmalı (beklenen ~326)
  select count(*) into v_subcat
    from public.products p
    join public.product_families f on f.id = p.family_id
   where f.subcategory_id is not null and p.subcategory_id is null;
  if v_subcat <> 0 then
    raise exception 'Alt-kategori backfill eksik: % urun hala null', v_subcat;
  end if;
end $$;

commit;
