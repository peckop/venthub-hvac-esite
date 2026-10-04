-- OPS-51 (karar 264 + 265) — CASALS AYRI MARKA, FLEXIVA MARKA KAYDI, SIĞINAK 7. KÖK KATEGORİ
--
-- ═════════════════════════════════════════════════════════════════════════════
-- NE YAPAR (yalnız VERİ; şema değişmez, tip dosyası/şema tabanı etkilenmez)
-- ═════════════════════════════════════════════════════════════════════════════
--  A) `brands`'a 'Casals' (slug casals) eklenir. Dört ailenin `product_families.brand_id`'si AVenS'ten Casals'a geçer
--     ve bu ailelerin ürünlerinin `products.brand` METNİ 'AVenS' → 'Casals' olur:
--        avens-plug-fanlar (14) · avens-enkelfan-ec-plug (9) · avens-nimus (15) · avens-nimax (15) = 53 model.
--     Karar 264 (Recep: "marka casals, avens distribütör"). NIMUS dahil: Casals katalog kaynağında nimus/nimax aynı
--     casals.com flipbook sayfalarında; plug/enkelfan Casals plug-fans PDF'inde. AVenS'te 53 ürün kalır (106 − 53).
--     ⚠ AİLE SLUG'LARINA DOKUNULMAZ (`avens-…` kalır): slug yeniden adlandırması KATALOG işi (Faz 1-B), bu PR'ın dışı.
--  B) `brands`'a 'Flexiva' (slug flexiva) eklenir. ÜRÜN YOK (DB'de ürünü yok, kaynak dizininde 0 sayfa). Vitrinde
--     "ürünler yakında" durumu kodda (BrandDetailPage + INV-MARKA-KAYNAK-1 açık 'yakında' istisnası).
--  C) `categories` 'shelter-ventilation' (Sığınak Havalandırma Fanları) fans'ın altından alınıp 7. KÖK olur
--     (parent_id NULL; `categories_set_level` BEFORE tetiği level'i 0 yapar). Kategori kökte BOŞ AÇILMASIN diye
--     `avens-siginak-havalandirma-uniteleri` ailesinin 3 modeli ve ailenin kendisi kök kategoriye bağlanır:
--     category_id = shelter-ventilation, subcategory_id = NULL (bugün category_id = fans, subcategory_id = shelter).
--     SEAT'in 81 fanına ve `avens-bvu-ls` (2 ürün, accessories) DOKUNULMAZ.
--
-- ═════════════════════════════════════════════════════════════════════════════
-- ÖLÇÜM (canlı DB, salt okuma, 2026-10-04) — bu migration bu sayılara dayanır
-- ═════════════════════════════════════════════════════════════════════════════
--  brands: 5 satır (avens, danfoss, nicotra-gebhardt, seat, vortice), HEPSİ tek tenant (d3b07384-…0000);
--          UNIQUE (tenant_id, slug) var → ON CONFLICT hedefi. Tablo kolonları: id, tenant_id, name, slug, created_at, updated_at.
--  4 aile: toplam 53 ürün, 53'ü aktif, 53'ünün `products.brand` = 'AVenS', 4 ailenin brand_id = AVenS. AVenS toplam 106 ürün.
--  Sığınak ailesi 3 ürün: category_id = fans (c2f5d352), subcategory_id = shelter-ventilation (076c6aa8); ailenin kendisi de aynı.
--  shelter-ventilation: parent = fans, level 1, ALT KATEGORİSİ YOK, products.category_id = shelter olan ürün 0.
--  Marka kapsamlı fiyat kuralı: pricing_rule 1 satır (brand_id NULL), pricing_policy 0 satır → marka değişimi fiyat
--  çözümünü ETKİLEMEZ. category_mapping_rules.brand_filter 'avens' içeren 0 satır. venthub_order_items.product_brand
--  'AVenS' olan 0 satır (geçmiş sipariş kopyası bu yüzden de değişmez).
--  Kategori sayacı (`get_category_counts()`, YALNIZ aktif ürün): fans 360, shelter-ventilation 3 → sonra fans 357,
--  shelter-ventilation 3. (Sayım ayrımı: fans'a category_id ile bağlı silinmemiş ürün 361 = 360 aktif + 1 arşivlenmiş (status='archived');
--  3 sığınak ürünü aktif → taşıma sonrası 358 / 357 aynı farkın iki yüzü. Sayaç yalnız aktifi sayar.)
--  Sığınak bugün SAYILIYOR: 3 ürünün subcategory_id'si shelter-ventilation (sayaç `subcategory_id` kolunu da sayar);
--  category_id kolonu ise fans'ta ve 'category_id = shelter-ventilation' sayısı 0'dır. Migration category_id'yi shelter'a
--  çeker ve subcategory_id'yi NULL yapar (kök kategoride alt kategori göstergesi anlamsız/yinelenen olurdu).
--
-- ═════════════════════════════════════════════════════════════════════════════
-- TETİKLEYİCİLER — bu migration'ın ATEŞLEDİKLERİ (pg_trigger'dan okundu, 2026-10-04)
-- ═════════════════════════════════════════════════════════════════════════════
--  brands INSERT (2 satır):
--    brands_set_updated_at (yalnız UPDATE) · denetim_izi_brands → admin_audit_log · on_brands_change → handle_supabase_webhook
--    (webhook `brands` dalı: markanın ailelerinin PDP yolları + PRODUCTS_DISCOVERY/HOME_DATA etiketi; yeni markada aile yok).
--    ⚠ `arama_marka_kelimeleri()` (arama yazım düzeltmesi sözlüğü) `brands.name` kelimelerinden kurulur: 'casals' ve 'flexiva'
--    düzeltme sözlüğüne girer. 'flexiva' için ürün yok → o kelimeyle arama boş döner (beklenen); ürünler yazılınca düzelir.
--  product_families UPDATE brand_id/category_id/subcategory_id (4 + 1 satır):
--    product_families_set_updated_at · denetim_izi_product_families · on_product_families_change (webhook: HOME_DATA +
--    PRODUCTS_DISCOVERY etiketi + aile PDP yolları + seri landing zinciri).
--    url_takma_ad_aile YALNIZ `slug` değişince ateşler (WHEN old.slug IS DISTINCT FROM new.slug): slug'a dokunulmuyor →
--    ESKİ ADRES KAYDI YAZILMAZ ve gerekmez (aile adresleri değişmez). arama_aile_kuyrukla yalnız name/name_i18n → ATEŞLEMEZ.
--  products UPDATE brand (53 satır) + category_id/subcategory_id (3 satır):
--    products_set_updated_at · denetim_izi_products_upd (brand, category_id, subcategory_id izlenen kolonlar → audit satırı) ·
--    arama_urun_tazele (brand/category_id/subcategory_id izlenen kolonlar → `arama_indeksi_tazele` ürün başına, arama gövdesi
--    marka + kategori adını içerir) · on_products_change (webhook; discovery etiketi YALNIZ status/family_id/category_id/
--    subcategory_id/deleted_at değişince düşer → brand-only 50 satırda keşif etiketi düşmez, ama aile UPDATE'i zaten düşürür).
--    url_takma_ad_urun YALNIZ slug/sku değişince → ATEŞLEMEZ. trg_product_costs_senkron_upd maliyet alanları → ATEŞLEMEZ.
--  categories UPDATE parent_id (1 satır):
--    categories_set_level (BEFORE UPDATE OF parent_id → level 0) · denetim_izi_categories · on_categories_change (webhook
--    `categories` dalı: yeni + ESKİ yollar tazelenir, PRODUCTS_DISCOVERY etiketi düşer → kategori sayıları vitrinde tazelenir).
--    url_takma_ad_kategori YALNIZ slug/metadata.slug değişince ateşler → parent_id değişimi takma ad YAZMAZ. Gerek de yok:
--    kategori adresleri slug'a dayanır, slug aynı kalıyor (ADRES_SEMASI_K3B = false iken tek seviyeli /category/<slug> kanonik;
--    eski iki seviyeli /category/fans/<slug> adresi kod tarafında parent'a bakmadan slug'dan kanoniğe 308 verir).
--    arama_kategori_kuyrukla yalnız name değişince → ATEŞLEMEZ.
--  Toplam yan etki: ≈ 64 webhook isteği (pg_net, işlem commit olunca kuyruktan gider), ≈ 66 admin_audit_log satırı
--  (actor NULL = BİLİNMİYOR; session_user yorumda), 56 ürün için arama indeksi yeniden hesabı.
--
-- BU MIGRATION PROD'A OTOMATİK UYGULANIR (kural 13). Yalnız Recep onayıyla birleşir.
--
-- İDEMPOTENT: marka ekleme ON CONFLICT DO NOTHING; her UPDATE `IS DISTINCT FROM` ile yalnız farklı satıra dokunur.
-- Tekrar koşulursa 0 satır değişir ve guard'lar yine geçer.
--
-- GERİ ALMA (elle, tek işlemde; uygulandıktan sonra gerekirse):
--   update public.product_families set brand_id = (select id from public.brands where slug='avens')
--    where slug in ('avens-plug-fanlar','avens-enkelfan-ec-plug','avens-nimus','avens-nimax');
--   update public.products p set brand = 'AVenS' from public.product_families f
--    where p.family_id = f.id and f.slug in ('avens-plug-fanlar','avens-enkelfan-ec-plug','avens-nimus','avens-nimax');
--   update public.categories set parent_id = (select id from public.categories where slug='fans') where slug='shelter-ventilation';
--   update public.product_families set category_id = (select id from public.categories where slug='fans'),
--          subcategory_id = (select id from public.categories where slug='shelter-ventilation')
--    where slug = 'avens-siginak-havalandirma-uniteleri';
--   update public.products p set category_id = (select id from public.categories where slug='fans'),
--          subcategory_id = (select id from public.categories where slug='shelter-ventilation')
--     from public.product_families f where p.family_id = f.id and f.slug = 'avens-siginak-havalandirma-uniteleri';
--   delete from public.brands where slug in ('casals','flexiva') and not exists
--     (select 1 from public.product_families f where f.brand_id = brands.id);   -- yalnız hiçbir aile bağlı değilse
--   Sonra kodda: brands.ts'ten casals/flexiva çıkar, markaYonlendirmeleri.mjs'e iki slug'ı geri yaz (308).
set lock_timeout = '5s';
set statement_timeout = '60s';

begin;

do $$
declare
  c_aile_slug     constant text[] := array['avens-plug-fanlar','avens-enkelfan-ec-plug','avens-nimus','avens-nimax'];
  c_siginak_aile  constant text   := 'avens-siginak-havalandirma-uniteleri';
  v_tenant        uuid;
  v_kiraci_sayisi int;
  v_avens         uuid;
  v_casals        uuid;
  v_flexiva       uuid;
  v_fans          uuid;
  v_shelter       uuid;
  v_n             int;
  v_sig_urun      int;
  v_sig_fansta    int;
  v_fans_once     int;
  v_fans_sonra    int;
  v_shelter_sonra int;
begin
  -- ── ÖN GUARD'LAR (kural 12: tek tenant; yanlış satıra dokunmadan dur) ─────────────────────────────────────
  select count(distinct tenant_id) into v_kiraci_sayisi from public.brands;
  if v_kiraci_sayisi <> 1 then
    raise exception 'OPS-51 guard: brands tablosunda % farkli tenant var (1 bekleniyordu)', v_kiraci_sayisi;
  end if;
  select tenant_id, id into v_tenant, v_avens from public.brands where slug = 'avens';
  if v_avens is null then
    raise exception 'OPS-51 guard: avens markasi bulunamadi';
  end if;

  select count(*) into v_n from public.product_families where tenant_id = v_tenant and slug = any (c_aile_slug);
  if v_n <> 4 then
    raise exception 'OPS-51 guard: 4 Casals ailesinden % tanesi bulundu (4 bekleniyordu) — sessiz no-op olmasin', v_n;
  end if;
  select count(*) into v_n from public.product_families where tenant_id = v_tenant and slug = c_siginak_aile;
  if v_n <> 1 then
    raise exception 'OPS-51 guard: siginak ailesi bulunamadi';
  end if;

  select id into v_fans    from public.categories where tenant_id = v_tenant and slug = 'fans';
  select id into v_shelter from public.categories where tenant_id = v_tenant and slug = 'shelter-ventilation';
  if v_fans is null or v_shelter is null then
    raise exception 'OPS-51 guard: fans ya da shelter-ventilation kategorisi yok';
  end if;
  -- `categories_set_level` tetiği YALNIZ satırın kendi level'ini günceller, torunları kademeli güncellemez.
  select count(*) into v_n from public.categories where parent_id = v_shelter;
  if v_n <> 0 then
    raise exception 'OPS-51 guard: shelter-ventilation altinda % alt kategori var; level kademesi yazilmadi', v_n;
  end if;

  -- Sığınak ailesinde aile DIŞINDAN ürün de shelter kategorisine bağlıysa (bugün 0) sayacı bozmayalım.
  select count(*) into v_sig_urun
    from public.products p join public.product_families f on f.id = p.family_id
   where f.tenant_id = v_tenant and f.slug = c_siginak_aile and p.status = 'active' and p.deleted_at is null;
  select count(*) into v_sig_fansta
    from public.products p join public.product_families f on f.id = p.family_id
   where f.tenant_id = v_tenant and f.slug = c_siginak_aile and p.status = 'active' and p.deleted_at is null
     and p.category_id = v_fans;

  select product_count into v_fans_once from public.get_category_counts() where category_id = v_fans;

  -- ── A) CASALS + B) FLEXIVA: markalar (AYNI tenant_id) ──────────────────────────────────────────────────────
  insert into public.brands (tenant_id, name, slug)
  values (v_tenant, 'Casals', 'casals'), (v_tenant, 'Flexiva', 'flexiva')
  on conflict (tenant_id, slug) do nothing;

  select id into v_casals  from public.brands where tenant_id = v_tenant and slug = 'casals';
  select id into v_flexiva from public.brands where tenant_id = v_tenant and slug = 'flexiva';
  if v_casals is null or v_flexiva is null then
    raise exception 'OPS-51 guard: casals/flexiva marka satiri olusmadi';
  end if;

  -- ── A) aile → marka, ürün metni → 'Casals' (YALNIZ bu 4 aile) ────────────────────────────────────────────
  update public.product_families
     set brand_id = v_casals
   where tenant_id = v_tenant and slug = any (c_aile_slug) and brand_id is distinct from v_casals;

  update public.products p
     set brand = 'Casals'
    from public.product_families f
   where p.family_id = f.id and f.tenant_id = v_tenant and p.tenant_id = v_tenant
     and f.slug = any (c_aile_slug) and p.brand is distinct from 'Casals';

  -- ── C) Sığınak: kök + aile/ürün ataması ─────────────────────────────────────────────────────────────────
  update public.categories
     set parent_id = null
   where id = v_shelter and parent_id is not null;

  update public.product_families
     set category_id = v_shelter, subcategory_id = null
   where tenant_id = v_tenant and slug = c_siginak_aile
     and (category_id is distinct from v_shelter or subcategory_id is not null);

  update public.products p
     set category_id = v_shelter, subcategory_id = null
    from public.product_families f
   where p.family_id = f.id and f.tenant_id = v_tenant and p.tenant_id = v_tenant and f.slug = c_siginak_aile
     and (p.category_id is distinct from v_shelter or p.subcategory_id is not null);

  -- ── SON GUARD'LAR (yanlışsa işlem GERİ ALINIR) ────────────────────────────────────────────────────────────
  select count(*) into v_n
    from public.products p join public.product_families f on f.id = p.family_id
   where f.tenant_id = v_tenant and f.slug = any (c_aile_slug) and (p.brand is distinct from 'Casals' or f.brand_id is distinct from v_casals);
  if v_n <> 0 then
    raise exception 'OPS-51 son guard: 4 Casals ailesinde % urun/aile hala Casals degil', v_n;
  end if;

  select count(*) into v_n from public.products where tenant_id = v_tenant and brand = 'Casals'
     and family_id not in (select id from public.product_families where tenant_id = v_tenant and slug = any (c_aile_slug));
  if v_n <> 0 then
    raise exception 'OPS-51 son guard: 4 aile disinda % urun Casals olmus', v_n;
  end if;

  select count(*) into v_n from public.categories where id = v_shelter and parent_id is null and level = 0;
  if v_n <> 1 then
    raise exception 'OPS-51 son guard: shelter-ventilation kok (parent NULL, level 0) degil — categories_set_level calismadi mi?';
  end if;

  select product_count into v_shelter_sonra from public.get_category_counts() where category_id = v_shelter;
  select product_count into v_fans_sonra    from public.get_category_counts() where category_id = v_fans;
  if v_shelter_sonra is distinct from v_sig_urun then
    raise exception 'OPS-51 son guard: shelter-ventilation sayaci % (beklenen %) — kok BOS ya da fazla acilirdi', v_shelter_sonra, v_sig_urun;
  end if;
  if v_fans_sonra is distinct from (v_fans_once - v_sig_fansta) then
    raise exception 'OPS-51 son guard: fans sayaci % (beklenen % - % = %)', v_fans_sonra, v_fans_once, v_sig_fansta, v_fans_once - v_sig_fansta;
  end if;
end;
$$;

commit;
