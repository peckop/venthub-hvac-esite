-- KTL-63 · KARAR 409 (MODEL B) — "ELEKTRİK AKSESUARLARI" AYRI ANA KATEGORİ; "AKSESUARLAR" GENEL GRUP OLARAK KALIR
--
-- NİÇİN: Recep kararı 409 (2026-10-25) ve aynı gün OPS penceresinde verdiği ek karar: "Elektrik Aksesuarları yeni açılır;
-- mevcut Aksesuarlar genel mekanik aksesuar grubu olarak durur." BVU-LS kurşun seperatör elektrik parçası değildir
-- (Recep, Menü penceresi): Aksesuarlar'da kalır. "Sensörler ve Koruma" yalnız SEAT PTC'dir. Menü'nün 10-25 görünen ad
-- kararları (Recep) aynı pakette. Ölçüm ve karşılaştırma: docs/audits/ktl63-kontrol-kategori-olcumu-ve-tasima-onerisi-2026-10-25.md,
-- docs/audits/ktl63-kategori-envanteri-menu-karsilastirma-2026-10-25.md (canlı SELECT 2026-10-25). Cetvel:
-- docs/standards/category-taxonomy-standard.md §6.1 ve §9, docs/standards/migration-safety-standard.md.
--
-- NE YAPAR (kategori KİMLİKLERİ korunur; yeni satır YOK, silme YOK, pasifleştirme YOK):
--   1. `control-systems` (kök) "Elektrik Aksesuarları" olur: ad + menü etiketi, TR slug kontrol-ve-suruculer → elektrik-aksesuarlari,
--      açıklama/SEO metni (TR+EN: motor koruma sensörü cümlesi eklenir). `translation_key` aynı kalır (sözlük anahtarı
--      `control-systems`; sözlükteki ad kodda değişir). EN kanonik slug DEĞİŞMEZ (bu migration'da; EN slug kararı Recep'te).
--   2. `spare-parts-sensors` "Sensörler ve Koruma" olur ve "Aksesuarlar"dan "Elektrik Aksesuarları"nın altına geçer: TR slug
--      yedek-parcalar-ve-sensorler → sensorler-ve-koruma; metni BVU-LS'siz yeniden yazılır. Alt kategori adresi tek segmentli
--      (SEO-35 B-1), üst değişimi adresini değiştirmez.
--   3. `frequency-converters` görünen adı "Frekans Konvertörleri (İnvertör)"; TR slug parantezsiz, aynı kalır.
--   4. SEAT PTC ailesi (1 aile / 1 ürün) `category_id` accessories → control-systems (alt kategori aynı).
--      BVU-LS ailesi (1 aile / 2 ürün) alt kategoriden ayrılır: `subcategory_id` boş, `category_id` accessories (kökün
--      doğrudan ailesi; canlıda emsali var: avens-bvu-siginak-havalandirma-uniteleri, kök shelter-ventilation, alt boş).
--   5. `accessories`: alt kategorisi kalmadığı için açıklama/SEO metninden "yedek parçalar ve sensörler alt kategoride" cümlesi çıkar.
--   6. Menü 10-25 görünen ad kararları (Recep 10-25), yalnız `name` ve `menu_label` (adres DEĞİŞMEZ): heat-recovery-vmc
--      "Isı Geri Kazanım", ducted-central-hrv "Kanallı Isı Geri Kazanım Cihazları", single-room-hrv "Oda Tipi Isı Geri
--      Kazanım Cihazları", water-coil-duct-heaters "Sulu Bataryalı Kanal Isıtıcıları"; bu dört kategoride SEO başlığı ve
--      açıklama metninde geçen ESKİ AD de yeni adla değişir (adım 6b; OPS 25 Ekim, cümle yapısı aynı). Sığınak (shelter-ventilation) bu
--      migration'da YOK: iki kademeli yapı kararı Recep'te.
--
-- ESKİ ADRES: `url_takma_ad_kategori` tetiği (20260923083021) TR slug değişince eski adı `url_takma_adlari`'na yazar
-- (kontrol-ve-suruculer, yedek-parcalar-ve-sensorler). Canlı kipte (ADRES_SEMASI_K3B kapalı) sayfa katmanı eski adresi
-- `eskiKategoriHedefi` ile tek 308'e çevirir (ÖLÇÜM: aksesuarlar ve yedek-parcalar-ve-sensorler emsali). Bu migration
-- iki takma ad satırının DOĞRU kategoriye işaret ettiğini apply anında SAYAR (guard 5c). Satırlar PASİFLEŞTİRİLMEZ:
-- bağımsız okuma (25 Ekim) canlı kipte pasif kategorinin 200+noindex çizildiğini ölçtü; yeniden adlandırma bu sorunu taşımaz.
--
-- KOD TARAFI (aynı PR): sözlük adları (tr/en), marka yönlendirmesi kök adı, uyum testleri.
-- İDEMPOTENT: ağaç zaten yeni durumdaysa NOTICE ile çıkar; kısmî/beklenmeyen durumda DURUR (kör yazım yok).
-- GERİ ALMA (tek işlem, elle): scripts/db/geri-alma/20261025220000_kontrol_urunleri_elektrik_aksesuarlari_karar409.geri-al.sql
-- TİP DOSYASI: şema değişmez. ŞEMA TABANI: birleşme sonrası aynı gün `sema-tabani-uret.yml` (INV-TABAN-TAZE-1).
-- ATOMİKLİK: dosyada BEGIN/COMMIT YOK; çalıştırıcı `psql --single-transaction` ile sarar (INV-MIGRATION-1, biçim b).

set lock_timeout = '5s';
set statement_timeout = '60s';

do $migration$
declare
  k_acc  uuid; k_ctl uuid; k_fc uuid; k_hiz uuid; k_sens uuid;
  f_ptc  uuid; f_bvu uuid;
  v_adet integer;
  v_aile integer;
  v_urun integer;
  v_takma integer;
  v_zaten boolean;
  v_anahtar_once integer;
  v_anahtar_sonra integer;
  r record;
begin
  -- GUARD 1: dokunulan dokuz kategori TAM BİR tane (slug küresel benzersiz; yoksa kör yazılmaz).
  select count(*) into v_adet from public.categories
   where slug in ('accessories','control-systems','frequency-converters','speed-controllers','spare-parts-sensors',
                  'heat-recovery-vmc','ducted-central-hrv','single-room-hrv','water-coil-duct-heaters');
  if v_adet <> 9 then
    raise exception 'KTL-63 guard 1: dokuz kategoriden % tanesi var (beklenen 9); hiçbir şey yazılmadı', v_adet;
  end if;
  select id into k_acc  from public.categories where slug = 'accessories';
  select id into k_ctl  from public.categories where slug = 'control-systems';
  select id into k_fc   from public.categories where slug = 'frequency-converters';
  select id into k_hiz  from public.categories where slug = 'speed-controllers';
  select id into k_sens from public.categories where slug = 'spare-parts-sensors';
  select id into f_ptc  from public.product_families where slug = 'seat-atex-ptc-sensoru';
  select id into f_bvu  from public.product_families where slug = 'avens-bvu-ls-kursun-seperator';
  if f_ptc is null or f_bvu is null then
    raise exception 'KTL-63 guard 1b: SEAT PTC ya da BVU-LS ailesi yok; hiçbir şey yazılmadı';
  end if;

  -- İDEMPOTANS: yeni durumun işaretleri hep birlikte tutuyorsa çık.
  select (c.name = 'Elektrik Aksesuarları' and s.name = 'Sensörler ve Koruma' and s.parent_id = k_ctl)
    into v_zaten
    from public.categories c, public.categories s
   where c.id = k_ctl and s.id = k_sens;
  if v_zaten then
    raise notice 'KTL-63: ağaç zaten yeni durumda; hiçbir şey yazılmadı';
    return;
  end if;

  -- GUARD 2: BUGÜNKÜ durum tam ölçülen durum (başka bir şey görürsek DURUR).
  if not exists (select 1 from public.categories where id = k_acc  and parent_id is null and is_active and name = 'Aksesuarlar')
     or not exists (select 1 from public.categories where id = k_ctl  and parent_id is null and is_active and name = 'Kontrol Sistemleri'
                      and metadata -> 'slug' ->> 'tr' = 'kontrol-ve-suruculer')
     or not exists (select 1 from public.categories where id = k_fc   and parent_id = k_ctl and is_active and name = 'Frekans Konvertörleri')
     or not exists (select 1 from public.categories where id = k_hiz  and parent_id = k_ctl and is_active)
     or not exists (select 1 from public.categories where id = k_sens and parent_id = k_acc and is_active and name = 'Yedek Parça ve Sensörler'
                      and metadata -> 'slug' ->> 'tr' = 'yedek-parcalar-ve-sensorler')
     or not exists (select 1 from public.categories where slug = 'heat-recovery-vmc'         and name = 'Isı Geri Kazanım (VMC)')
     or not exists (select 1 from public.categories where slug = 'ducted-central-hrv'        and name = 'Kanallı Merkezi Üniteler')
     or not exists (select 1 from public.categories where slug = 'single-room-hrv'          and name = 'Tekil Oda Üniteleri')
     or not exists (select 1 from public.categories where slug = 'water-coil-duct-heaters'   and name = 'Sulu Batarya Kanal Tipi') then
    raise exception 'KTL-63 guard 2: kategori ağacı ölçülen durumda değil; hiçbir şey yazılmadı';
  end if;

  -- GUARD 3: yeni TR adres adları başka bir kategoride kullanılmıyor.
  select count(*) into v_adet from public.categories c
   where c.id not in (k_ctl, k_sens)
     and (lower(c.slug) in ('elektrik-aksesuarlari','sensorler-ve-koruma')
          or lower(coalesce(c.metadata -> 'slug' ->> 'tr', '')) in ('elektrik-aksesuarlari','sensorler-ve-koruma')
          or lower(coalesce(c.metadata -> 'slug' ->> 'en', '')) in ('elektrik-aksesuarlari','sensorler-ve-koruma'));
  if v_adet > 0 then
    raise exception 'KTL-63 guard 3: yeni TR adres adı başka kategoride kullanılıyor; hiçbir şey yazılmadı';
  end if;

  -- GUARD 4: taşınacak aileler tam ölçülen küme: spare-parts-sensors'ta TAM bu iki aile (PTC 1 ürün, BVU-LS 2 ürün).
  select count(*) into v_aile from public.product_families
   where category_id = k_acc and subcategory_id = k_sens and id in (f_ptc, f_bvu);
  select count(*) into v_adet from public.product_families where subcategory_id = k_sens or category_id = k_sens;
  select count(*) into v_urun from public.products
   where (family_id = f_ptc and category_id = k_acc and subcategory_id = k_sens)
      or (family_id = f_bvu and category_id = k_acc and subcategory_id = k_sens);
  if v_aile <> 2 or v_adet <> 2 or v_urun <> 3 then
    raise exception 'KTL-63 guard 4: sensör kategorisinde aile % (eşleşen %), ürün % (beklenen 2, 2, 3); hiçbir şey yazılmadı',
      v_adet, v_aile, v_urun;
  end if;

  -- METADATA KORUMA SAYACI (10 Ekim dersi: metadata nesnesi baştan yazılmaz). Aşağıdaki yazımların hepsi `jsonb_set` ile
  -- YOL BAZLIDIR (kardeş anahtarlar ve `slug.en` korunur); sonda dokunulan kategorilerin metadata ÜST anahtar sayısı
  -- aynı çıkmazsa işlem geri alınır.
  select count(*) into v_anahtar_once
    from public.categories c cross join lateral jsonb_object_keys(c.metadata) as k
   where c.slug in ('accessories','control-systems','spare-parts-sensors','heat-recovery-vmc','ducted-central-hrv',
                    'single-room-hrv','water-coil-duct-heaters');

  -- ADIM 1: Elektrik Aksesuarları (eski control-systems). Açıklama/SEO metni mevcut metnin DEVAMIdır (yeni iddia yok).
  update public.categories c
     set name = 'Elektrik Aksesuarları',
         menu_label = 'Elektrik Aksesuarları',
         seo_title = 'Elektrik Aksesuarları: Hız Anahtarı, Konvertör ve Sensör',
         seo_desc = 'Fanı çalıştırmak yetmez; ne zaman ve hangi hızda çalışacağına karar veren katman burada: hız anahtarları, frekans konvertörleri ve motor koruma sensörleri.',
         metadata = jsonb_set(jsonb_set(jsonb_set(jsonb_set(jsonb_set(c.metadata,
           '{slug,tr}', to_jsonb('elektrik-aksesuarlari'::text), true),
           '{description_i18n,tr}', to_jsonb((c.metadata #>> '{description_i18n,tr}') || ' Motor koruma sensörleri de bu kategoridedir.'), true),
           '{description_i18n,en}', to_jsonb((c.metadata #>> '{description_i18n,en}') || ' Motor protection sensors are also in this category.'), true),
           '{seo_title_en}', to_jsonb('Electrical Accessories: Speed Controllers, Converters and Sensors'::text), true),
           '{seo_desc_en}', to_jsonb('Running a fan is not enough; the layer that decides when and at what speed it runs is here: speed controllers, frequency converters and motor protection sensors.'::text), true)
   where c.id = k_ctl;

  -- ADIM 2: Sensörler ve Koruma (eski spare-parts-sensors): yeni üst, ad, TR slug, BVU-LS'siz metin.
  update public.categories c
     set parent_id = k_ctl,
         name = 'Sensörler ve Koruma',
         seo_title = 'Sensörler ve Koruma: Motor Koruma Sensörleri',
         seo_desc = 'Cihazın kendisi değil, onu koruyan parçalar: motor koruma sensörleri.',
         metadata = jsonb_set(jsonb_set(jsonb_set(jsonb_set(jsonb_set(c.metadata,
           '{slug,tr}', to_jsonb('sensorler-ve-koruma'::text), true),
           '{description_i18n,tr}', to_jsonb('Cihazın kendisi değil, onu koruyan parçalar. Motor koruma sensörleri bu başlık altındadır.'::text), true),
           '{description_i18n,en}', to_jsonb('Not the device itself, but parts that protect it. Motor protection sensors fall under this heading.'::text), true),
           '{seo_title_en}', to_jsonb('Sensors and Protection: Motor Protection Sensors'::text), true),
           '{seo_desc_en}', to_jsonb('Not the device itself, but parts that protect it: motor protection sensors.'::text), true)
   where c.id = k_sens;

  -- ADIM 3: frekans konvertörleri görünen adı (TR slug aynı).
  update public.categories set name = 'Frekans Konvertörleri (İnvertör)' where id = k_fc;

  -- ADIM 4: aileler ve ürünler.
  update public.product_families set category_id = k_ctl, updated_at = now()
   where id = f_ptc and category_id = k_acc and subcategory_id = k_sens;
  get diagnostics v_aile = row_count;
  update public.products set category_id = k_ctl, updated_at = now()
   where family_id = f_ptc and category_id = k_acc and subcategory_id = k_sens;
  get diagnostics v_urun = row_count;
  if v_aile <> 1 or v_urun <> 1 then
    raise exception 'KTL-63 adım 4a (SEAT PTC): % aile, % ürün (beklenen 1, 1); işlem geri alınır', v_aile, v_urun;
  end if;
  update public.product_families set subcategory_id = null, updated_at = now()
   where id = f_bvu and category_id = k_acc and subcategory_id = k_sens;
  get diagnostics v_aile = row_count;
  update public.products set subcategory_id = null, updated_at = now()
   where family_id = f_bvu and category_id = k_acc and subcategory_id = k_sens;
  get diagnostics v_urun = row_count;
  if v_aile <> 1 or v_urun <> 2 then
    raise exception 'KTL-63 adım 4b (BVU-LS): % aile, % ürün (beklenen 1, 2); işlem geri alınır', v_aile, v_urun;
  end if;

  -- ADIM 5: Aksesuarlar kökü artık alt kategorisiz; metinden alt kategori cümlesi çıkar.
  update public.categories c
     set seo_desc = 'Ana cihazın kendisi değil, onu tamamlayan parçalar ve ekipman.',
         metadata = jsonb_set(jsonb_set(jsonb_set(c.metadata,
           '{description_i18n,tr}', to_jsonb('Ana cihazın kendisi değil, onu tamamlayan parçalar bu kategoridedir.'::text), true),
           '{description_i18n,en}', to_jsonb('These are not the main units themselves but the parts that complement them.'::text), true),
           '{seo_desc_en}', to_jsonb('These are not the main units themselves but the parts and equipment that complement them.'::text), true)
   where c.id = k_acc;

  -- ADIM 6: Menü 10-25 görünen ad kararları (adres DEĞİŞMEZ).
  for r in
    select * from (values
      ('heat-recovery-vmc',       'Isı Geri Kazanım (VMC)',   'Isı Geri Kazanım'),
      ('ducted-central-hrv',      'Kanallı Merkezi Üniteler', 'Kanallı Isı Geri Kazanım Cihazları'),
      ('single-room-hrv',         'Tekil Oda Üniteleri',      'Oda Tipi Isı Geri Kazanım Cihazları'),
      ('water-coil-duct-heaters', 'Sulu Batarya Kanal Tipi',  'Sulu Bataryalı Kanal Isıtıcıları')
    ) as t(en_slug, eski_ad, yeni_ad)
  loop
    update public.categories
       set name = r.yeni_ad,
           menu_label = case when menu_label = r.eski_ad then r.yeni_ad else menu_label end
     where slug = r.en_slug and name = r.eski_ad;
    get diagnostics v_adet = row_count;
    if v_adet <> 1 then
      raise exception 'KTL-63 adım 6: % için % satır güncellendi (beklenen 1); işlem geri alınır', r.en_slug, v_adet;
    end if;
  end loop;

  -- ADIM 6b: SEO başlığı ve açıklama metninde ESKİ AD geçen yerler yeni adla değişir (OPS 25 Ekim: tutarlılık onarımı;
  -- cümle yapısı aynı kalır, yalnız ad değişir). Tam dizeler: önce/sonra listesi docs/audits/ktl63-...-onerisi-2026-10-25.md §7.
  -- ducted-central-hrv: yeni ad "Isı Geri Kazanım" sözcüklerini zaten taşıdığı için ": Isı Geri Kazanım" soneki çıkar (OPS 25 Ekim).
  update public.categories set seo_title = 'Kanallı Isı Geri Kazanım Cihazları'
   where slug = 'ducted-central-hrv' and seo_title = 'Kanallı Merkezi Üniteler: Isı Geri Kazanım';
  get diagnostics v_adet = row_count;
  if v_adet <> 1 then
    raise exception 'KTL-63 adım 6b (ducted-central-hrv başlığı): % satır güncellendi (beklenen 1); işlem geri alınır', v_adet;
  end if;
  update public.categories set seo_title = replace(seo_title, 'Sulu Batarya Kanal Tipi', 'Sulu Bataryalı Kanal Isıtıcıları')
   where slug = 'water-coil-duct-heaters';
  update public.categories c
     set seo_title = replace(c.seo_title, 'Isı Geri Kazanım (VMC)', 'Isı Geri Kazanım'),
         seo_desc = replace(replace(c.seo_desc,
           'Tekil oda üniteleri', 'Oda tipi ısı geri kazanım cihazları'),
           'kanallı merkezi üniteler', 'kanallı ısı geri kazanım cihazları'),
         metadata = jsonb_set(c.metadata, '{description_i18n,tr}', to_jsonb(replace(replace(c.metadata #>> '{description_i18n,tr}',
           'Tekil oda üniteleri', 'Oda tipi ısı geri kazanım cihazları'),
           'Kanallı merkezi üniteler', 'Kanallı ısı geri kazanım cihazları')), true)
   where c.slug = 'heat-recovery-vmc';
  if exists (select 1 from public.categories c
              where c.slug in ('heat-recovery-vmc','ducted-central-hrv','single-room-hrv','water-coil-duct-heaters')
                and (coalesce(c.seo_title,'') || ' ' || coalesce(c.seo_desc,'') || ' ' || coalesce(c.metadata #>> '{description_i18n,tr}',''))
                    ~* '(Isı Geri Kazanım \(VMC\)|Kanallı Merkezi Üniteler|Tekil Oda Üniteleri|Sulu Batarya Kanal Tipi|Tekil oda üniteleri|kanallı merkezi üniteler)') then
    raise exception 'KTL-63 adım 6b: SEO/açıklamada eski ad kaldı; işlem geri alınır';
  end if;

  -- GUARD 4b: metadata üst anahtarları korundu.
  select count(*) into v_anahtar_sonra
    from public.categories c cross join lateral jsonb_object_keys(c.metadata) as k
   where c.slug in ('accessories','control-systems','spare-parts-sensors','heat-recovery-vmc','ducted-central-hrv',
                    'single-room-hrv','water-coil-duct-heaters');
  if v_anahtar_once is distinct from v_anahtar_sonra then
    raise exception 'KTL-63 guard 4b: metadata üst anahtar sayısı % → % değişti; işlem geri alınır', v_anahtar_once, v_anahtar_sonra;
  end if;

  -- GUARD 5: sonuç sayımı.
  select count(*) into v_aile from public.product_families where category_id = k_ctl;
  select count(*) into v_urun from public.products where category_id = k_ctl;
  if v_aile <> 5 or v_urun <> 38 then
    raise exception 'KTL-63 guard 5a: Elektrik Aksesuarları altında % aile, % ürün (beklenen 5, 38); işlem geri alınır', v_aile, v_urun;
  end if;
  select count(*) into v_aile from public.product_families where category_id = k_acc;
  select count(*) into v_urun from public.products where category_id = k_acc;
  if v_aile <> 1 or v_urun <> 2 or exists (select 1 from public.product_families where id = f_bvu and subcategory_id is not null) then
    raise exception 'KTL-63 guard 5b: Aksesuarlar altında % aile, % ürün (beklenen 1 aile BVU-LS, 2 ürün, alt kategorisiz); işlem geri alınır', v_aile, v_urun;
  end if;
  for r in
    select * from (values
      ('kontrol-ve-suruculer',         k_ctl),
      ('yedek-parcalar-ve-sensorler',  k_sens)
    ) as t(eski_tr, hedef)
  loop
    select count(*) into v_takma from public.url_takma_adlari t
     where t.tur = 'kategori' and t.dil = 'tr' and t.eski_slug = r.eski_tr and t.hedef_id = r.hedef;
    if v_takma <> 1 then
      raise exception 'KTL-63 guard 5c: eski ad % takma ad tablosunda % satırla duruyor (beklenen 1); işlem geri alınır', r.eski_tr, v_takma;
    end if;
  end loop;
end
$migration$;
