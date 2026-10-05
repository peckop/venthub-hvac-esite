-- REC-300 Faz 1-B — GERİ ALMA BETİĞİ (supabase/migrations/20261005100000_kategori_agaci_casals_aile_adresleri.sql)
--
-- ⛔ BU DOSYA `supabase/migrations/` ALTINDA DEĞİL VE OTOMATİK UYGULANMAZ. `supabase-migrate.yml` yalnız
-- migrations/ klasörünü görür; geri alma bilerek ELLE, Recep onayıyla, tek kez koşulur (CLAUDE.md kural 13).
--
-- ═════════════════════════════════════════════════════════════════════════════
-- SIRA BAĞIMLILIĞI — ÖNCE BU, SONRA #1692
-- ═════════════════════════════════════════════════════════════════════════════
-- Ters sıra zorunlu: #1352 (bu migration) #1692'nin (20261004120000, Casals/Flexiva/Sığınak) ÜSTÜNE kurulur.
--   1) ÖNCE bu betik (#1352 geri alınır),
--   2) SONRA #1692'nin kendi geri alma tarifi (Casals markası, ad, ürün marka metni onundur).
-- #1692 önce geri alınırsa bu betiğin KAPI 0'ı Casals markasını bulamaz ve DURUR.
--
-- ═════════════════════════════════════════════════════════════════════════════
-- NE YAPAR (migration'ın tersi; sıra: 7 → 6 → 5b → 4b → 4 → 3 → 2)
-- ═════════════════════════════════════════════════════════════════════════════
--   7)  40 aile slug'ı yeni → eski (Faz 1-A tetiği: eski adres yeniden canlı slug olur → eski takma adı SİLİNİR;
--       yeni adres için yeni → aile takma adı YAZILIR, yani yeni adrese gelen bağlantılar 308 ile geri döner).
--   6)  6 aile + 44 ürünün alt kategorisi eski dala (radyal ya da boş) döner (İKİ TABLO BİRLİKTE).
--   5b) KENTALFAN: name/name_i18n 'Casals Plug Fanlar' / 'Casals Plug Fans', series_code NULL (#1692'nin bıraktığı hâl).
--   4b) Radyal dalı: name ve menu_label 'Santrifüj / Radyal Fanlar'.
--   4)  Yedek parça dalı: translation_key NULL.
--   3)  Korozyon dalı: name 'Asit Dayanımlı Fanlar', menu_label NULL, translation_key 'sub.acid-fans',
--       TR slug 'asit-dayanikli-fanlar', EN (kanonik) slug 'acid-resistant-fans'.
--   2)  4 yeni dal SİLİNİR — yalnız ürün ve aileler geri taşındıktan SONRA (FK RESTRICT sırayı zorlar).
--
-- NE YAPMAZ (bilerek):
--   · Casals markası, aile adları ('AVenS' → 'Casals'), 53 ürünün marka metni: #1692'nindir.
--   · KOD ve SÖZLÜK: bu betik yalnız veritabanını döndürür. Yeni korozyon/radyal adları (`sub.corrosion-fans`,
--     `sub.radial`) sözlükte kodla gelir ve görünen ad ÖNCE sözlükten çözülür; görünen adın da eski hâle dönmesi
--     için #1352'nin kod değişikliği (PR) ayrıca geri alınır. Eski sözlük anahtarı `sub.acid-fans` sözlükte DURUR
--     (silinmesi URN-49), yani veritabanı geri alınınca korozyon dalı yeniden çözülür.
--   · Arama yeniden-indeks kuyruğu ve webhook tazelemeleri: tetikler kendiliğinden yeniden yazar (pg_cron ~5 dk).
--   · `url_takma_adlari` yeni-slug satırları KALIR (40 aile + korozyon TR + korozyon EN): yeni adrese gelen trafik 308 ile
--     eski adrese gider (istenen davranış).
--
-- DEĞİŞMEZ KURAL: her adım "eski durumda" YA DA "yeni durumda" olduğunu ölçer; üçüncü bir durum (elle değişmiş satır)
-- adıyla durdurur ve HİÇBİR ŞEY yazmaz (tek işlem). Betik TEKRAR koşulabilir: ikinci koşum no-op'tur ve aynı son durumu ölçer.
--
-- KULLANIM (yalnız Recep onayıyla, prod'a elle):
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f scripts/db/geri-alma/20261005100000_kategori_agaci_casals_aile_adresleri.geri-al.sql
--
-- KANIT: gölge koşusu (C:/tmp/vh-urun-golge-1352/ README): taban → #1692 → ÖNCÜL anlık görüntü → #1352 → bu betik → SON
-- anlık görüntü; ikisi sayılar ve slug'lar dahil BİREBİR aynı olmalı. Sonuç PR gövdesinde.
--
-- Cetvel: docs/standards/migration-safety-standard.md · CLAUDE.md kural 12 (tek kiracı kapısı), 13, 14.

set lock_timeout = '5s';
set statement_timeout = '60s';

BEGIN;

lock table public.categories, public.product_families, public.products
  in share row exclusive mode;

DO $$
DECLARE
  v_t constant uuid := 'd3b07384-d113-495f-a558-8c38634e0000';
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
  k_plug      constant uuid := 'd3f4096d-ea2e-4cb2-8569-280c33f5531e';
  k_hucreli   constant uuid := 'fe1dcb4e-d67d-4462-a4a8-dc12e5d695bf';
  k_isiticisiz constant uuid := 'a260bbbf-e576-4cea-98dc-d7d9c1692cdd';
  k_elektrikli constant uuid := '341cd0df-545e-4355-ad38-9c1d90c1bc0d';
  v_casals uuid;
  n int;
  r record;
BEGIN
  -- ── KAPI 0: boş tabanda geri alınacak bir şey yok → SESSİZ geçilmez, DURULUR ──────────────
  -- (Migration boş tabanda atlar; geri alma "uygulandı" sayılırsa yanlış güven verir.)
  IF NOT EXISTS (SELECT 1 FROM public.product_families WHERE tenant_id = v_t) THEN
    RAISE EXCEPTION 'GERİ ALMA KAPI 0: kiracıda hiç aile yok — geri alınacak durum yok, betik uygulanmadı';
  END IF;
  SELECT count(*) INTO n FROM public.product_families
   WHERE id IN (a_kentalfan, a_enkelfan, a_nimax, a_nimus, a_hfs, a_hffw, a_ad, a_had) AND deleted_at IS NULL;
  IF n <> 8 THEN RAISE EXCEPTION 'GERİ ALMA KAPI 0: 8 hedef aile bekleniyordu, % var — veri değişmiş, incele', n; END IF;

  -- #1692 ÖNCE geri alınmamış olmalı (sıra: önce #1352, sonra #1692).
  SELECT id INTO v_casals FROM public.brands WHERE tenant_id = v_t AND slug = 'casals';
  IF v_casals IS NULL THEN
    RAISE EXCEPTION 'GERİ ALMA KAPI 0: casals markası yok — #1692 zaten geri alınmış; sıra ÖNCE #1352 sonra #1692 olmalıydı';
  END IF;

  -- ── KAPI 1: kiracı (kural 12) — dokunulan her satır tek kiracıda ───────────────────────
  SELECT count(*) INTO n FROM public.product_families
   WHERE id IN (a_kentalfan, a_enkelfan, a_nimax, a_nimus, a_hfs, a_hffw, a_ad, a_had) AND tenant_id <> v_t;
  IF n > 0 THEN RAISE EXCEPTION 'GERİ ALMA KAPI 1: % aile başka kiracıda', n; END IF;
  SELECT count(*) INTO n FROM public.categories
   WHERE id IN (k_fanlar, k_perde, k_radyal, k_korozyon, k_yedek, k_plug, k_hucreli, k_isiticisiz, k_elektrikli)
     AND tenant_id <> v_t;
  IF n > 0 THEN RAISE EXCEPTION 'GERİ ALMA KAPI 1: % kategori başka kiracıda', n; END IF;
  SELECT count(*) INTO n FROM public.products
   WHERE family_id IN (a_kentalfan, a_enkelfan, a_nimax, a_nimus, a_hfs, a_hffw, a_ad, a_had) AND tenant_id <> v_t;
  IF n > 0 THEN RAISE EXCEPTION 'GERİ ALMA KAPI 1: % ürün aile kiracısından farklı kiracıda', n; END IF;

  -- ── 7) 40 AİLE SLUG'I — yeni → eski ───────────────────────────────────────────────────
  -- Çiftler migration'daki liste ile BİREBİR aynıdır (üretici betikle ondan kopyalanır; elle yazılmaz).
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
  IF n <> 40 THEN RAISE EXCEPTION 'GERİ ALMA 7: plan bütünlüğü — 40 satır bekleniyordu, %', n; END IF;

  -- Her satır ya ESKİ ya YENİ durumda TAM BİR ailede olmalı (üç kusuru birden yakalar: elle değişmiş = 0,
  -- çakışma = 2, ikinci koşum = 1 eski durumda → UPDATE no-op).
  SELECT count(*) INTO n FROM faz1b_aile p
   WHERE (SELECT count(*) FROM public.product_families f
           WHERE f.tenant_id = v_t AND f.deleted_at IS NULL AND f.slug IN (p.eski, p.yeni)) <> 1;
  IF n > 0 THEN RAISE EXCEPTION 'GERİ ALMA 7: % satır ne tek eski ne tek yeni durumda (elle değişmiş ya da çakışma) — elle incele', n; END IF;

  UPDATE public.product_families f SET slug = p.eski, updated_at = now()
    FROM faz1b_aile p
   WHERE f.slug = p.yeni AND f.tenant_id = v_t AND f.deleted_at IS NULL;

  SELECT count(*) INTO n FROM faz1b_aile p JOIN public.product_families f
      ON f.slug = p.eski AND f.tenant_id = v_t AND f.deleted_at IS NULL;
  IF n <> 40 THEN RAISE EXCEPTION 'GERİ ALMA 7: 40 eski slug bekleniyordu, %', n; END IF;

  -- Faz 1-A tetiği ters yönü kendisi çözer: yeni slug'lar için takma ad (yeni → aile) yazılmış olmalı.
  SELECT count(*) INTO n FROM faz1b_aile p
    JOIN public.product_families f ON f.slug = p.eski AND f.tenant_id = v_t AND f.deleted_at IS NULL
    JOIN public.url_takma_adlari t
      ON t.tur = 'aile' AND t.eski_slug = p.yeni AND t.tenant_id = v_t AND t.hedef_id = f.id;
  IF n <> 40 THEN RAISE EXCEPTION 'GERİ ALMA 7: 40 yeni-slug takma adı bekleniyordu, % — yeni adresler 404 olurdu', n; END IF;
  -- Eski slug'lar yeniden CANLI: kendilerini gösteren takma ad kalmamalı (canlı slug önceliği).
  SELECT count(*) INTO n FROM faz1b_aile p
    JOIN public.url_takma_adlari t
      ON t.tur = 'aile' AND t.eski_slug = p.eski AND t.tenant_id = v_t;
  IF n <> 0 THEN RAISE EXCEPTION 'GERİ ALMA 7: % eski slug hâlâ takma ad olarak duruyor (canlı slug öncelikli olmalı)', n; END IF;

  -- ── 6) TAŞIMA GERİ — İKİ TABLO BİRLİKTE (taksonomi cetveli §8) ─────────────────────────
  FOR r IN SELECT * FROM (VALUES
      (a_kentalfan, k_fanlar, k_radyal, k_plug),
      (a_enkelfan,  k_fanlar, k_radyal, k_plug),
      (a_hfs,       k_fanlar, k_radyal, k_hucreli),
      (a_hffw,      k_fanlar, k_radyal, k_hucreli),
      (a_ad,        k_perde,  NULL::uuid, k_isiticisiz),
      (a_had,       k_perde,  NULL::uuid, k_elektrikli)
    ) AS t(aile, kok, eski_dal, yeni_dal)
  LOOP
    -- Yalnız YENİ dalda duran satırlar eski dala döner; zaten eski dalda olanlara (ikinci koşum) dokunulmaz.
    UPDATE public.product_families SET subcategory_id = r.eski_dal, updated_at = now()
     WHERE id = r.aile AND category_id = r.kok AND subcategory_id IS NOT DISTINCT FROM r.yeni_dal;
    UPDATE public.products SET subcategory_id = r.eski_dal, updated_at = now()
     WHERE family_id = r.aile AND tenant_id = v_t AND category_id = r.kok
       AND subcategory_id IS NOT DISTINCT FROM r.yeni_dal;
    IF EXISTS (SELECT 1 FROM public.product_families WHERE id = r.aile
                 AND (subcategory_id IS DISTINCT FROM r.eski_dal OR category_id IS DISTINCT FROM r.kok))
       OR EXISTS (SELECT 1 FROM public.products WHERE family_id = r.aile AND deleted_at IS NULL
                 AND (subcategory_id IS DISTINCT FROM r.eski_dal OR category_id IS DISTINCT FROM r.kok)) THEN
      RAISE EXCEPTION 'GERİ ALMA 6: aile % eski dala döndürülemedi (dal ya da kök beklenen değerde değil)', r.aile;
    END IF;
  END LOOP;
  SELECT count(*) INTO n FROM public.products
   WHERE subcategory_id IN (k_plug, k_hucreli, k_isiticisiz, k_elektrikli) AND tenant_id = v_t;
  IF n <> 0 THEN RAISE EXCEPTION 'GERİ ALMA 6: yeni dallarda hâlâ % ürün var — dallar silinemez', n; END IF;
  SELECT count(*) INTO n FROM public.product_families
   WHERE subcategory_id IN (k_plug, k_hucreli, k_isiticisiz, k_elektrikli);
  IF n <> 0 THEN RAISE EXCEPTION 'GERİ ALMA 6: yeni dallarda hâlâ % aile var — dallar silinemez', n; END IF;

  -- ── 5b) KENTALFAN — ad + seri kodu #1692'nin bıraktığı hâle ──────────────────────────────
  UPDATE public.product_families
     SET name = 'Casals Plug Fanlar',
         name_i18n = coalesce(name_i18n, '{}'::jsonb) || jsonb_build_object('tr', 'Casals Plug Fanlar',
                                                                           'en', 'Casals Plug Fans'),
         series_code = NULL,
         updated_at = now()
   WHERE id = a_kentalfan AND brand_id = v_casals
     AND (name IS DISTINCT FROM 'Casals Plug Fanlar'
          OR (name_i18n->>'tr') IS DISTINCT FROM 'Casals Plug Fanlar'
          OR (name_i18n->>'en') IS DISTINCT FROM 'Casals Plug Fans'
          OR series_code IS NOT NULL);
  SELECT count(*) INTO n FROM public.product_families
   WHERE id = a_kentalfan AND name = 'Casals Plug Fanlar' AND series_code IS NULL
     AND (name_i18n->>'tr') = 'Casals Plug Fanlar' AND (name_i18n->>'en') = 'Casals Plug Fans';
  IF n <> 1 THEN RAISE EXCEPTION 'GERİ ALMA 5b: KENTALFAN ailesi beklenen ad/seri kodunda değil'; END IF;

  -- ── 4b) RADYAL DALI — görünen ad eski hâle (yalnız beklenen yeni adda yazar) ───────────────
  UPDATE public.categories
     SET name = 'Santrifüj / Radyal Fanlar',
         menu_label = 'Santrifüj / Radyal Fanlar',
         updated_at = now()
   WHERE id = k_radyal AND tenant_id = v_t
     AND name = 'Radyal (Santrifüj) Fanlar' AND menu_label = 'Radyal (Santrifüj) Fanlar';
  SELECT count(*) INTO n FROM public.categories
   WHERE id = k_radyal AND tenant_id = v_t
     AND name = 'Santrifüj / Radyal Fanlar' AND menu_label = 'Santrifüj / Radyal Fanlar'
     AND translation_key = 'sub.radial'
     AND slug = 'centrifugal-fans' AND metadata->'slug'->>'tr' = 'radyal-fanlar';
  IF n <> 1 THEN RAISE EXCEPTION 'GERİ ALMA 4b: radyal dalı ne eski ne yeni durumda (ad/menu_label/anahtar/slug) — elle değişmiş, incele'; END IF;

  -- ── 4) YEDEK PARÇA — translation_key yeniden boş ────────────────────────────────────────
  UPDATE public.categories SET translation_key = NULL, updated_at = now()
   WHERE id = k_yedek AND translation_key = 'sub.spare-parts';
  SELECT count(*) INTO n FROM public.categories WHERE id = k_yedek AND translation_key IS NULL;
  IF n <> 1 THEN RAISE EXCEPTION 'GERİ ALMA 4: yedek parça dalının translation_key değeri ne eski (NULL) ne yeni (sub.spare-parts)'; END IF;

  -- ── 3) KOROZYON DALI — ad, TR slug ve sözlük anahtarı eski hâle (tek UPDATE, tek tetik turu) ──
  UPDATE public.categories
     SET name = 'Asit Dayanımlı Fanlar',
         menu_label = NULL,
         translation_key = 'sub.acid-fans',
         slug = 'acid-resistant-fans',
         metadata = jsonb_set(jsonb_set(metadata, '{slug,tr}', '"asit-dayanikli-fanlar"'),
                              '{slug,en}', '"acid-resistant-fans"'),
         updated_at = now()
   WHERE id = k_korozyon AND tenant_id = v_t
     AND translation_key = 'sub.corrosion-fans' AND metadata->'slug'->>'tr' = 'korozyona-ve-aside-dayanimli-fanlar'
     AND slug = 'corrosion-and-acid-resistant-fans' AND metadata->'slug'->>'en' = 'corrosion-and-acid-resistant-fans';
  SELECT count(*) INTO n FROM public.categories
   WHERE id = k_korozyon AND tenant_id = v_t
     AND name = 'Asit Dayanımlı Fanlar' AND menu_label IS NULL
     AND translation_key = 'sub.acid-fans'
     AND metadata->'slug'->>'tr' = 'asit-dayanikli-fanlar'
     AND slug = 'acid-resistant-fans' AND metadata->'slug'->>'en' = 'acid-resistant-fans';
  IF n <> 1 THEN RAISE EXCEPTION 'GERİ ALMA 3: korozyon dalı ne eski ne yeni durumda (ad/anahtar/TR+EN slug) — elle değişmiş, incele'; END IF;
  -- Yeni TR adres için takma ad (308 ile eski adrese) tetikle yazılmış olmalı.
  IF NOT EXISTS (SELECT 1 FROM public.url_takma_adlari
                  WHERE tur = 'kategori' AND dil = 'tr' AND eski_slug = 'korozyona-ve-aside-dayanimli-fanlar'
                    AND tenant_id = v_t AND hedef_id = k_korozyon) THEN
    RAISE EXCEPTION 'GERİ ALMA 3: korozyon dalının yeni TR adresi takma ada yazılmadı — o adres 404 olurdu';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.url_takma_adlari
                  WHERE tur = 'kategori' AND dil = 'en' AND eski_slug = 'corrosion-and-acid-resistant-fans'
                    AND tenant_id = v_t AND hedef_id = k_korozyon) THEN
    RAISE EXCEPTION 'GERİ ALMA 3: korozyon dalının yeni EN adresi takma ada yazılmadı — o adres 404 olurdu';
  END IF;
  -- Eski adresler yeniden CANLI: kendilerini gösteren takma ad kalmamalı (canlı slug önceliği, iki dilde).
  SELECT count(*) INTO n FROM public.url_takma_adlari
   WHERE tur = 'kategori' AND tenant_id = v_t
     AND ((dil = 'tr' AND eski_slug = 'asit-dayanikli-fanlar') OR (dil = 'en' AND eski_slug = 'acid-resistant-fans'));
  IF n <> 0 THEN RAISE EXCEPTION 'GERİ ALMA 3: korozyonun % eski adresi hâlâ takma ad olarak duruyor (canlı slug öncelikli olmalı)', n; END IF;

  -- ── 2) DÖRT YENİ DAL SİLİNİR — yalnız hiçbir ürün/aile/alt dal bağlı değilse ───────────────
  SELECT count(*) INTO n FROM public.categories WHERE parent_id IN (k_plug, k_hucreli, k_isiticisiz, k_elektrikli);
  IF n <> 0 THEN RAISE EXCEPTION 'GERİ ALMA 2: yeni dalların % alt dalı var — silinemez', n; END IF;
  SELECT count(*) INTO n FROM public.product_families
   WHERE category_id IN (k_plug, k_hucreli, k_isiticisiz, k_elektrikli)
      OR subcategory_id IN (k_plug, k_hucreli, k_isiticisiz, k_elektrikli);
  IF n <> 0 THEN RAISE EXCEPTION 'GERİ ALMA 2: yeni dallara bağlı % aile var — silinemez', n; END IF;
  SELECT count(*) INTO n FROM public.products
   WHERE category_id IN (k_plug, k_hucreli, k_isiticisiz, k_elektrikli)
      OR subcategory_id IN (k_plug, k_hucreli, k_isiticisiz, k_elektrikli);
  IF n <> 0 THEN RAISE EXCEPTION 'GERİ ALMA 2: yeni dallara bağlı % ürün var — silinemez', n; END IF;

  DELETE FROM public.categories
   WHERE id IN (k_plug, k_hucreli, k_isiticisiz, k_elektrikli) AND tenant_id = v_t;
  SELECT count(*) INTO n FROM public.categories WHERE id IN (k_plug, k_hucreli, k_isiticisiz, k_elektrikli);
  IF n <> 0 THEN RAISE EXCEPTION 'GERİ ALMA 2: 4 yeni dal silinemedi (% kaldı)', n; END IF;

  RAISE NOTICE 'Faz 1-B GERİ ALINDI: 40 aile slug''ı eski, 44 ürün + 6 aile eski dalda, korozyon/radyal/yedek parça/KENTALFAN eski, 4 yeni dal silindi';
END $$;

COMMIT;
