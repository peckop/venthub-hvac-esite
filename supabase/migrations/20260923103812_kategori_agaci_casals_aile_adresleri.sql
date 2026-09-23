-- REC-300 Faz 1-B — KATEGORİ AĞACI (K17) + CASALS MARKASI + 40 AİLE ADRESİ (karar 86)
--
-- ═════════════════════════════════════════════════════════════════════════════
-- NİÇİN (plan: docs/plans/rec-adres-agac-tek-yayin-2026-09-07.md §5 Faz 1-B — v5)
-- ═════════════════════════════════════════════════════════════════════════════
-- Adres yayını (K3-b) "tek yayın" ilkesiyle gider; ağaç ve aile adresleri yayından ÖNCE, BUGÜNKÜ
-- rotalarda (/tr/products/<aile>, /tr/category/<dal>) oturur. Eski aile ve kategori slug'larını
-- Faz 1-A tetiği (20260923083021) aynı anda `url_takma_adlari`'na yazar; sayfa katmanı (#1346)
-- eski adrese 308 verir → bu migration canlıda KIRIK ADRES ÜRETMEZ (ölçüm: §8 kabul).
--
-- Kararlar: K17 (ağaç, R1 kapandı: bugünkü 18 + 4 dal) · 78b (iki perde dalı pazar kelimesi:
-- `isiticisiz-hava-perdeleri`, `elektrikli-isiticili-hava-perdeleri`) · 84 (korozyon dalı) · 86 (39
-- aile slug'ı; istisna Casals 4 aile K17 kısa biçim — OPS hükmü 2026-09-23, Kararlar belgesi 86
-- metni — ve 2 perde ailesi 78b kelimesi) · Recep 11-09: ENKELFAN/KENTALFAN/NIMAX/NIMUS Casals'tır,
-- HF/S ve HF/FW AVenS kalır.
--
-- ÖLÇÜM (canlı SELECT, 2026-09-23 ~10:30Z):
--   · Fanlar altındaki TÜM dallar `level = 1`, `sort_order = 0`. 09-11 Design taslağı `level 2`,
--     `sort_order 60/70` yazıyordu — YANLIŞ; komşudan ölçülen değer kullanıldı.
--   · Taşınan 6 aile / 44 ürün (plug 14+9, hücreli 7+6, perde 4+4); Casals 4 aile = 53 ürün
--     (KENTALFAN 14 · ENKELFAN 9 · NIMAX 15 · NIMUS 15); `brands`'ta casals YOK.
--   · Aile slug değişimi 40 (39 + avens-plug-fanlar; plan §6'daki "43" çift sayımdı).
--   · Kategori adı sözlükten gelir (`common.categoryList.<translation_key>`, getCategoryDisplayName):
--     adı değişen/yeni dallar YENİ anahtarlara bağlanır (PR #1349 bu migration'dan ÖNCE merge edilir).
--
-- SAPMA (plan §5 Faz 1-B m.6 "`products.slug_i18n` + get_family_detail aynı PR"): bu migration'da
-- YOK. O alan Faz 2 model slug'larının ön şartıdır, Faz 1-B'nin değil; RPC dönüş tipini değiştirmek
-- (DROP+CREATE) ayrı risk sınıfıdır ve bu veri migration'ına gömülmez. Faz 2 migration'ına taşındı.
--
-- GERİ ALMA: veri migration'ı; eski değerler aşağıdaki VALUES listelerinde ve §1 dökümünde. Ters
-- yön aynı listeyle (yeni → eski) yazılır; takma adlar Faz 1-A tetiğiyle kendiliğinden ters döner
-- (A→B→A: canlı slug önceliklidir). Yeni 4 dal ve Casals markası ürünler geri taşındıktan sonra
-- silinir (FK RESTRICT sırayı zorlar).
--
-- YAN ETKİ (bilerek): `products`/`product_families`/`categories` üzerindeki `on_*_change` webhook
-- tetikleri her satır için bir tazeleme isteği atar (~100 satır). Emsal: karar 45 migration'ı 17
-- aile satırıyla aynı yoldan geçti, sorun ölçülmedi.
--
-- Cetvel: docs/standards/migration-safety-standard.md · category-taxonomy-standard.md §8 (her
-- taşımada İKİ tablo: products VE product_families) · CLAUDE.md kural 12 (tek kiracı kapısı), 13.

set lock_timeout = '5s';
set statement_timeout = '60s';

BEGIN;

-- Kilitler başta, sabit sırada, tek seferde (Faz 1-A güvenlik incelemesi bulgu 1 kalıbı).
lock table public.brands, public.categories, public.product_families, public.products
  in share row exclusive mode;

DO $$
DECLARE
  v_t constant uuid := 'd3b07384-d113-495f-a558-8c38634e0000';
  -- mevcut satırlar
  k_fanlar   constant uuid := 'c2f5d352-3bfb-40b2-af54-cfa95ad5c3e4';
  k_perde    constant uuid := 'f4ef8c4b-132d-4a96-b0d7-3409a05771ea';
  k_radyal   constant uuid := '51c2c050-34ff-4deb-ae0b-f667ca7bf1d9';
  k_korozyon constant uuid := '98a6f650-74eb-4279-94cb-0edb0339b2e8';
  k_yedek    constant uuid := '1a87e18b-6195-48f4-8c75-2f5f5feb137f';
  a_kentalfan constant uuid := 'b4ad9135-206a-40bb-b133-a550b7838db2';
  a_enkelfan  constant uuid := '4b81f44f-bb67-4ac7-8bac-b7f3f6e9e733';
  a_nimax     constant uuid := '25dfd5ad-4378-47f7-8e3e-974a9819294c';
  a_nimus     constant uuid := 'ced432da-9b30-4407-a224-6b2ff9306ad7';
  a_hfs       constant uuid := '196d7854-5b06-4870-96ed-55ec742c880b';
  a_hffw      constant uuid := '362cd0ae-9352-4626-a8fc-978dafd3052b';
  a_ad        constant uuid := 'b5c120f1-6416-49a2-9de2-dee732204680';
  a_had       constant uuid := '08e5834b-7935-4ff0-970e-3c2ba8149284';
  m_avens     constant uuid := 'f99a5254-21f8-4b14-933a-722270d5da93';
  -- yeni satırlar (sabit kimlik → ikinci koşum aynı satırı bulur)
  m_casals    constant uuid := '1aefd0f0-22b4-4bab-bef6-d1618b89ea62';
  k_plug      constant uuid := 'd3f4096d-ea2e-4cb2-8569-280c33f5531e';
  k_hucreli   constant uuid := 'fe1dcb4e-d67d-4462-a4a8-dc12e5d695bf';
  k_isiticisiz constant uuid := 'a260bbbf-e576-4cea-98dc-d7d9c1692cdd';
  k_elektrikli constant uuid := '341cd0df-545e-4355-ad38-9c1d90c1bc0d';
  n int;
  r record;
BEGIN
  -- ── KAPI 0: YALNIZ gerçekten boş veritabanı (gölge tabanı) atlanır ───────────────────────
  -- Güvenlik incelemesi: tek bir aileye bakan atlama, prod'da o aile silinmişse bütün
  -- migration'ı NOTICE ile "başarılı" geçirip hiçbir şey yazmazdı (defter uygulandı sayar).
  IF NOT EXISTS (SELECT 1 FROM public.product_families WHERE tenant_id = v_t) THEN
    RAISE NOTICE 'Faz 1-B: kiracıda hiç aile yok (boş taban) — veri adımı ATLANDI';
    RETURN;
  END IF;
  SELECT count(*) INTO n FROM public.product_families
   WHERE id IN (a_kentalfan, a_enkelfan, a_nimax, a_nimus, a_hfs, a_hffw, a_ad, a_had)
     AND deleted_at IS NULL;
  IF n <> 8 THEN RAISE EXCEPTION 'KAPI 0: 8 hedef aile bekleniyordu, % var — veri değişmiş, incele', n; END IF;

  -- ── KAPI 1: kiracı (kural 12) — dokunulan her satır tek kiracıda ─────────────────────────
  SELECT count(*) INTO n FROM public.product_families
   WHERE id IN (a_kentalfan, a_enkelfan, a_nimax, a_nimus, a_hfs, a_hffw, a_ad, a_had)
     AND tenant_id <> v_t;
  IF n > 0 THEN RAISE EXCEPTION 'KAPI 1: % aile başka kiracıda', n; END IF;
  SELECT count(*) INTO n FROM public.categories
   WHERE id IN (k_fanlar, k_perde, k_radyal, k_korozyon, k_yedek) AND tenant_id <> v_t;
  IF n > 0 THEN RAISE EXCEPTION 'KAPI 1: % kategori başka kiracıda', n; END IF;
  SELECT count(*) INTO n FROM public.products
   WHERE family_id IN (a_kentalfan, a_enkelfan, a_nimax, a_nimus, a_hfs, a_hffw, a_ad, a_had)
     AND tenant_id <> v_t;
  IF n > 0 THEN RAISE EXCEPTION 'KAPI 1: % ürün aile kiracısından farklı kiracıda', n; END IF;
  -- Yeni dal adresleri boş mu (EN slug tekil kısıtlı; TR slug metadata'da, kısıt YOK → elle ölçülür).
  SELECT count(*) INTO n FROM public.categories
   WHERE id NOT IN (k_plug, k_hucreli, k_isiticisiz, k_elektrikli, k_korozyon)  -- kendileri: ikinci koşum
     AND (slug IN ('plug-fans','cabinet-fans','unheated-air-curtains','electric-heated-air-curtains')
          OR metadata->'slug'->>'tr' IN ('plug-fanlar','hucreli-aspiratorler','isiticisiz-hava-perdeleri',
                                         'elektrikli-isiticili-hava-perdeleri','korozyon-dayanimli-fanlar'));
  IF n > 0 THEN RAISE EXCEPTION 'KAPI 1: % kategori yeni dal adreslerinden birini zaten kullanıyor', n; END IF;

  -- ── 1) CASALS MARKASI ────────────────────────────────────────────────────────────────────
  INSERT INTO public.brands (id, tenant_id, name, slug)
  VALUES (m_casals, v_t, 'Casals', 'casals')
  ON CONFLICT (tenant_id, slug) DO NOTHING;
  IF NOT EXISTS (SELECT 1 FROM public.brands WHERE id = m_casals AND slug = 'casals' AND tenant_id = v_t) THEN
    RAISE EXCEPTION '1: casals markası başka kimlikle var — elle incele';
  END IF;

  -- ── 2) DÖRT YENİ DAL (komşu ölçümü: level 1, sort_order 0, hide_price true) ──────────────
  INSERT INTO public.categories (id, tenant_id, name, slug, parent_id, level, sort_order,
                                 is_active, is_featured, display_mode, translation_key, metadata)
  VALUES
    (k_plug, v_t, 'Plug Fanlar', 'plug-fans', k_fanlar, 1, 0, true, false, 'series',
     'sub.plug-fans', '{"slug":{"tr":"plug-fanlar","en":"plug-fans"},"hide_price":true}'),
    (k_hucreli, v_t, 'Hücreli Aspiratörler', 'cabinet-fans', k_fanlar, 1, 0, true, false, 'series',
     'sub.cabinet-fans', '{"slug":{"tr":"hucreli-aspiratorler","en":"cabinet-fans"},"hide_price":true}'),
    (k_isiticisiz, v_t, 'Isıtıcısız Hava Perdeleri', 'unheated-air-curtains', k_perde, 1, 0, true, false,
     'series', 'sub.unheated-curtain',
     '{"slug":{"tr":"isiticisiz-hava-perdeleri","en":"unheated-air-curtains"},"hide_price":true}'),
    (k_elektrikli, v_t, 'Elektrikli Isıtıcılı Hava Perdeleri', 'electric-heated-air-curtains', k_perde, 1, 0,
     true, false, 'series', 'sub.electric-curtain',
     '{"slug":{"tr":"elektrikli-isiticili-hava-perdeleri","en":"electric-heated-air-curtains"},"hide_price":true}')
  ON CONFLICT (id) DO NOTHING;
  -- Satırın VARLIĞI yetmez, DEĞERLERİ ölçülür: aynı kimlikle elle değiştirilmiş bir satır
  -- (başka üst dal, başka adres) ON CONFLICT DO NOTHING'den geçerdi.
  SELECT count(*) INTO n FROM public.categories
   WHERE tenant_id = v_t AND level = 1 AND (id, parent_id, slug) IN (
     (k_plug, k_fanlar, 'plug-fans'), (k_hucreli, k_fanlar, 'cabinet-fans'),
     (k_isiticisiz, k_perde, 'unheated-air-curtains'), (k_elektrikli, k_perde, 'electric-heated-air-curtains'));
  IF n <> 4 THEN RAISE EXCEPTION '2: 4 yeni dal beklenen değerlerde değil (% eşleşti) — elle incele', n; END IF;

  -- ── 3) KOROZYON DALI (karar 84) — ad + TR slug + yeni sözlük anahtarı; kanonik EN slug SABİT ──
  UPDATE public.categories
     SET name = 'Korozyon Dayanımlı Fanlar',
         translation_key = 'sub.corrosion-fans',
         metadata = jsonb_set(metadata, '{slug,tr}', '"korozyon-dayanimli-fanlar"'),
         updated_at = now()
   WHERE id = k_korozyon AND metadata->'slug'->>'tr' = 'asit-dayanikli-fanlar'
     AND translation_key = 'sub.acid-fans';
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n = 0 AND NOT EXISTS (SELECT 1 FROM public.categories WHERE id = k_korozyon
       AND metadata->'slug'->>'tr' = 'korozyon-dayanimli-fanlar' AND translation_key = 'sub.corrosion-fans') THEN
    RAISE EXCEPTION '3: korozyon dalı ne eski ne yeni durumda — elle değişmiş, incele';
  END IF;

  -- ── 4) YEDEK PARÇA — boş translation_key (ham ad render ediliyordu) ──────────────────────
  UPDATE public.categories SET translation_key = 'sub.spare-parts', updated_at = now()
   WHERE id = k_yedek AND translation_key IS NULL;

  -- ── 5) CASALS AİLELERİ: marka + ad (+ KENTALFAN seri kodu); ürünlerin marka metni ─────────
  UPDATE public.product_families SET brand_id = m_casals, name = 'Casals KENTALFAN Plug Fanlar',
         series_code = 'KENTALFAN', updated_at = now()
   WHERE id = a_kentalfan AND brand_id = m_avens;
  UPDATE public.product_families SET brand_id = m_casals, name = 'Casals ENKELFAN EC Motorlu Plug Fanlar',
         updated_at = now()
   WHERE id = a_enkelfan AND brand_id = m_avens;
  UPDATE public.product_families SET brand_id = m_casals, name = 'Casals NIMAX Santrifüj Fanlar',
         updated_at = now()
   WHERE id = a_nimax AND brand_id = m_avens;
  UPDATE public.product_families SET brand_id = m_casals, name = 'Casals NIMUS Santrifüj Fanlar',
         updated_at = now()
   WHERE id = a_nimus AND brand_id = m_avens;
  SELECT count(*) INTO n FROM public.product_families
   WHERE id IN (a_kentalfan, a_enkelfan, a_nimax, a_nimus) AND brand_id = m_casals;
  IF n <> 4 THEN RAISE EXCEPTION '5: 4 Casals ailesi bekleniyordu, %', n; END IF;

  UPDATE public.products SET brand = 'Casals', updated_at = now()
   WHERE family_id IN (a_kentalfan, a_enkelfan, a_nimax, a_nimus) AND tenant_id = v_t AND brand = 'AVenS';
  SELECT count(*) INTO n FROM public.products
   WHERE family_id IN (a_kentalfan, a_enkelfan, a_nimax, a_nimus) AND tenant_id = v_t
     AND deleted_at IS NULL AND brand = 'Casals';
  IF n <> 53 THEN RAISE EXCEPTION '5: 53 Casals ürünü bekleniyordu, %', n; END IF;

  -- ── 6) TAŞIMA — İKİ TABLO BİRLİKTE (taksonomi cetveli §8) ──────────────────────────────
  FOR r IN SELECT * FROM (VALUES
      (a_kentalfan, k_fanlar, k_radyal, k_plug),
      (a_enkelfan,  k_fanlar, k_radyal, k_plug),
      (a_hfs,       k_fanlar, k_radyal, k_hucreli),
      (a_hffw,      k_fanlar, k_radyal, k_hucreli),
      (a_ad,        k_perde,  NULL::uuid, k_isiticisiz),
      (a_had,       k_perde,  NULL::uuid, k_elektrikli)
    ) AS t(aile, kok, eski_dal, yeni_dal)
  LOOP
    UPDATE public.product_families SET subcategory_id = r.yeni_dal, updated_at = now()
     WHERE id = r.aile AND category_id = r.kok AND subcategory_id IS NOT DISTINCT FROM r.eski_dal;
    UPDATE public.products SET subcategory_id = r.yeni_dal, updated_at = now()
     WHERE family_id = r.aile AND tenant_id = v_t AND category_id = r.kok
       AND subcategory_id IS NOT DISTINCT FROM r.eski_dal;
    -- Kök de ölçülür (güvenlik incelemesi): başka kökteki bir ürün yeni dala taşınsaydı dal ile
    -- kök birbirini tutmazdı ve sayım kapısı bunu göremezdi. Ölçüm 2026-09-23: 44/44 doğru kökte.
    IF EXISTS (SELECT 1 FROM public.product_families WHERE id = r.aile
                 AND (subcategory_id IS DISTINCT FROM r.yeni_dal OR category_id IS DISTINCT FROM r.kok))
       OR EXISTS (SELECT 1 FROM public.products WHERE family_id = r.aile AND deleted_at IS NULL
                 AND (subcategory_id IS DISTINCT FROM r.yeni_dal OR category_id IS DISTINCT FROM r.kok)) THEN
      RAISE EXCEPTION '6: aile % taşınamadı (dal ya da kök beklenen değerde değil)', r.aile;
    END IF;
  END LOOP;
  SELECT count(*) INTO n FROM public.products
   WHERE subcategory_id IN (k_plug, k_hucreli, k_isiticisiz, k_elektrikli) AND deleted_at IS NULL
     AND tenant_id = v_t;
  IF n <> 44 THEN RAISE EXCEPTION '6: yeni dallarda 44 ürün bekleniyordu, %', n; END IF;

  -- ── 7) 40 AİLE SLUG'I (karar 86 + istisnalar) — eski → yeni; takma adı Faz 1-A tetiği yazar ──
  CREATE TEMP TABLE faz1b_aile (eski text PRIMARY KEY, yeni text UNIQUE NOT NULL) ON COMMIT DROP;
  INSERT INTO faz1b_aile VALUES
    ('avens-bvu-ls', 'avens-bvu-ls-kursun-seperator'),
    ('avens-dikdortgen-kanal-radyal', 'avens-dikdortgen-kanal-tipi-radyal-fanlar'),
    ('avens-elektrikli-isiticilar', 'avens-elektrikli-kanal-isiticilari'),
    ('avens-enkelfan-ec-plug', 'casals-enkelfan-ec-plug'),
    ('avens-hucreli-aspiratorler', 'avens-hucreli-aspiratorler-hf-fw'),
    ('avens-hucreli-hf-s', 'avens-hucreli-aspiratorler-hf-s'),
    ('avens-isi-geri-kazanim', 'avens-isi-geri-kazanim-cihazlari'),
    ('avens-nimax', 'casals-nimax'),
    ('avens-nimus', 'casals-nimus'),
    ('avens-plug-fanlar', 'casals-kentalfan-plug'),
    ('avens-qe-b-kasa', 'avens-qe-b-kasa-serisi'),
    ('avens-siginak-havalandirma-uniteleri', 'avens-bvu-siginak-havalandirma-uniteleri'),
    ('avens-sulu-batarya', 'avens-sulu-batarya-kanal-tipi'),
    ('danfoss-fc101', 'danfoss-vlt-hvac-basic-drive-fc-101'),
    ('danfoss-fc102', 'danfoss-vlt-hvac-drive-fc-102'),
    ('danfoss-fc51', 'danfoss-vlt-micro-drive-fc-51'),
    ('nicotra-gebhardt-adh', 'nicotra-gebhardt-adh-sik-kanatli-radyal-fanlar'),
    ('nicotra-gebhardt-at', 'nicotra-gebhardt-at-cift-emisli-radyal-fanlar'),
    ('nicotra-gebhardt-dd', 'nicotra-gebhardt-dd-direkt-akuple-radyal-fanlar'),
    ('nicotra-gebhardt-rdh', 'nicotra-gebhardt-rdh-seyrek-kanatli-radyal-fanlar'),
    ('seat-atex-ptc-sensor', 'seat-atex-ptc-sensoru'),
    ('vortice-deumido-range', 'vortice-deumido-nem-alma-cihazlari'),
    ('vortice-h-ad-elektrikli', 'vortice-h-ad-elektrikli-isiticili-hava-perdeleri'),
    ('vortice-hava-perdesi', 'vortice-ad-isiticisiz-hava-perdeleri'),
    ('vortice-isi-geri-kazanim', 'vortice-vort-hr-isi-geri-kazanim'),
    ('vortice-lineo', 'vortice-lineo-kanal-fanlari'),
    ('vortice-lineo-quiet', 'vortice-lineo-quiet-sessiz-kanal-fanlari'),
    ('vortice-punto-evo-flexo', 'vortice-punto-evo-flexo-banyo-fanlari'),
    ('vortice-radon-range-circular', 'vortice-radon-serisi-kanal-fanlari'),
    ('vortice-radon-range-roof', 'vortice-radon-serisi-cati-fanlari'),
    ('vortice-vort-commercial-in-line-circular', 'vortice-vort-commercial-in-line-yuvarlak-kanal-fanlari'),
    ('vortice-vort-commercial-in-line-rectangular', 'vortice-vort-commercial-in-line-dikdortgen-kanal-fanlari'),
    ('vortice-vort-e-atex', 'vortice-vort-e-atex-fanlar'),
    ('vortice-vort-heatmaster-slimroof-roof', 'vortice-slimroof-cati-fanlari'),
    ('vortice-vort-heatmaster-slimroof-smoke', 'vortice-heatmaster-duman-egzoz-fanlari'),
    ('vortice-vort-industrial-ventilation-axial', 'vortice-aksiyel-endustriyel-fanlar'),
    ('vortice-vort-industrial-ventilation-roof', 'vortice-tiracamino-somine-ve-baca-fanlari'),
    ('vortice-vort-nordik-hvls', 'vortice-nordik-hvls-hyperblade'),
    ('vortice-vortice-bravo-s', 'vortice-bravo-s'),
    ('vortice-vorticent-cms-atex', 'vortice-vorticent-cms-atex-santrifuj-fanlar');

  SELECT count(*) INTO n FROM faz1b_aile;
  IF n <> 40 THEN RAISE EXCEPTION '7: plan bütünlüğü — 40 satır bekleniyordu, %', n; END IF;

  -- Her satır ya ESKİ ya YENİ durumda TAM BİR ailede olmalı. Bu tek kapı üç kusuru birden yakalar:
  -- slug elle değişmiş (0 eşleşme), yeni slug başka bir ailede zaten var (2 eşleşme: çakışma),
  -- ikinci koşum (1 eşleşme, yeni durumda → UPDATE no-op).
  SELECT count(*) INTO n FROM faz1b_aile p
   WHERE (SELECT count(*) FROM public.product_families f
           WHERE f.tenant_id = v_t AND f.deleted_at IS NULL AND f.slug IN (p.eski, p.yeni)) <> 1;
  IF n > 0 THEN RAISE EXCEPTION '7: % satır ne tek eski ne tek yeni durumda (elle değişmiş ya da çakışma) — elle incele', n; END IF;

  UPDATE public.product_families f SET slug = p.yeni, updated_at = now()
    FROM faz1b_aile p
   WHERE f.slug = p.eski AND f.tenant_id = v_t AND f.deleted_at IS NULL;

  SELECT count(*) INTO n FROM faz1b_aile p JOIN public.product_families f
      ON f.slug = p.yeni AND f.tenant_id = v_t AND f.deleted_at IS NULL;
  IF n <> 40 THEN RAISE EXCEPTION '7: 40 yeni slug bekleniyordu, %', n; END IF;

  -- ── 8) GUARD — Faz 1-A tetiği eski adları yazdı mı (adres kırılmaz kanıtı) ───────────────
  -- Takma adın VARLIĞI yetmez, DOĞRU aileyi göstermesi ölçülür (güvenlik incelemesi).
  SELECT count(*) INTO n FROM faz1b_aile p
    JOIN public.product_families f ON f.slug = p.yeni AND f.tenant_id = v_t AND f.deleted_at IS NULL
    JOIN public.url_takma_adlari t
      ON t.tur = 'aile' AND t.eski_slug = p.eski AND t.tenant_id = v_t AND t.hedef_id = f.id;
  IF n <> 40 THEN RAISE EXCEPTION '8: 40 aile takma adı bekleniyordu, % — eski adresler 404 olurdu', n; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.url_takma_adlari
                  WHERE tur = 'kategori' AND dil = 'tr' AND eski_slug = 'asit-dayanikli-fanlar'
                    AND tenant_id = v_t AND hedef_id = k_korozyon) THEN
    RAISE EXCEPTION '8: korozyon dalının eski TR adresi takma ada yazılmadı';
  END IF;

  RAISE NOTICE 'Faz 1-B tamam: 4 dal, Casals (4 aile / 53 ürün), 44 ürün taşındı, 40 aile slug''ı';
END $$;

COMMIT;
