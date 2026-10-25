-- KTL-63 · KARAR 409 — KONTROL ÜRÜNLERİ TEK ANA KATEGORİDE: "Elektrik Aksesuarları / Electrical Accessories"
--
-- NİÇİN: Recep kararı 409 (2026-10-26): kontrol ürünleri tek ana kategori altında toplanır; alt kategoriler
-- "Frekans Konvertörleri (İnvertör)", "Hız Anahtarları", "Sensörler ve Koruma". "Sürücüler" adı yok. Bugün
-- Danfoss frekans konvertörleri ve AVenS hız anahtarları "Kontrol Sistemleri" altında, SEAT PTC sensörü ve AVenS
-- BVU-LS "Aksesuarlar > Yedek Parça ve Sensörler" altında. Ölçüm ve plan: docs/audits/ktl63-kontrol-kategori-olcumu-ve-tasima-onerisi-2026-10-26.md
-- (canlı SELECT, 2026-10-26). Cetvel: docs/standards/category-taxonomy-standard.md §6.1 ve §9, docs/standards/migration-safety-standard.md.
--
-- NE YAPAR (kategori kimlikleri DEĞİŞMEZ, yeni satır YOK, silme YOK):
--   1. `accessories` ana kategori olur: ad/menü etiketi "Elektrik Aksesuarları", TR slug aksesuarlar → elektrik-aksesuarlari,
--      açıklama ve SEO metni (TR+EN) yeni kapsama göre yazılır. EN kanonik slug `accessories` DEĞİŞMEZ (OPS onayı 2026-10-26;
--      emsal 20261010090000: EN slug kalır, görünen ad ve TR slug Design adına çekilir).
--   2. `frequency-converters` ve `speed-controllers` üst kategorisi control-systems → accessories. Alt kategori adresi tek
--      segmentli olduğu için (SEO-35 B-1) bu iki alt kategorinin adresi DEĞİŞMEZ. `frequency-converters` görünen adı
--      "Frekans Konvertörleri (İnvertör)" olur; TR slug parantezsiz kalır.
--   3. `spare-parts-sensors`: ad "Sensörler ve Koruma", TR slug yedek-parcalar-ve-sensorler → sensorler-ve-koruma.
--      EN kanonik slug DEĞİŞMEZ.
--   4. 4 aile (FC 51, FC 101, FC 102, AVenS Hız Anahtarları) ve 37 ürün: `category_id` control-systems → accessories
--      (`subcategory_id` aynı kalır).
--   5. `control-systems` boşalır: `is_active=false` ve `parent_id`=accessories. NİÇİN ÜST ATANIR: eski adres eşleyicisi
--      (src/lib/adres/eslestirici.ts, kategoriNesnesi) pasif kategoriyi "aktif üstüne tırmanarak" çözer; üstü olmayan pasif
--      kök "tüm ürünler"e düşerdi. Üstü accessories olunca eski kök adresleri (control-systems, kontrol-ve-suruculer,
--      kontrol-sistemleri) TEK 308 ile yeni ana kategoriye gider; kod ve takma ad satırı gerekmez. Pasif satır hiçbir
--      listede görünmez (is_active süzgeci). SİLİNMEZ: taksonomi cetveli §1 "boş diye silinmez" ve §9 (geri dönüşsüz yazım yok).
--
-- ESKİ ADRES NEDEN KIRILMAZ: `url_takma_ad_kategori` tetiği (20260923083021) TR slug değişince eski adı `url_takma_adlari`'na
-- yazar (aksesuarlar, yedek-parcalar-ve-sensorler). Bu migration iki takma ad satırının DOĞRU kategoriye işaret ettiğini
-- apply anında SAYAR (guard 5); tutmazsa işlem geri alınır. "Eski adres tek 308 ile yeni adrese gider" kanıtı birleşme
-- sonrası HTTP ölçümüyle alınır (PR gövdesi).
--
-- KOD TARAFI (aynı PR): sözlük adları (tr/en), `markaYonlendirmeleri.mjs` marka adresi hedefi, ad-sözlük-migration uyum testi.
--
-- İDEMPOTENT: tüm ağaç zaten yeni durumdaysa NOTICE ile çıkar. Kısmî/beklenmeyen durumda DURUR (kör yazım yok).
--
-- GERİ ALMA (tek işlem, elle): scripts/db/geri-alma/20261026090000_kontrol_urunleri_elektrik_aksesuarlari_karar409.geri-al.sql
--
-- TİP DOSYASI: şema değişmez (yalnız veri). ŞEMA TABANI: INV-TABAN-TAZE-1 gereği birleşme sonrası aynı gün `sema-tabani-uret.yml`.
-- ATOMİKLİK: dosyada BEGIN/COMMIT YOK; çalıştırıcı `psql --single-transaction` ile sarar (INV-MIGRATION-1, biçim b).
-- ZAMAN AŞIMI: INV-MIGRATION-3.

set lock_timeout = '5s';
set statement_timeout = '60s';

do $migration$
declare
  k_acc  uuid; k_ctl uuid; k_fc uuid; k_hiz uuid; k_sens uuid;
  v_adet integer;
  v_aile_adet integer;
  v_urun_adet integer;
  v_takma integer;
  v_zaten boolean;
  r record;
begin
  -- GUARD 1: beş kategori TAM BİR tane (slug küresel benzersiz; yoksa kör yazılmaz).
  select count(*) into v_adet from public.categories
   where slug in ('accessories','control-systems','frequency-converters','speed-controllers','spare-parts-sensors');
  if v_adet <> 5 then
    raise exception 'KTL-63 guard 1: beş kategoriden % tanesi var (beklenen 5); hiçbir şey yazılmadı', v_adet;
  end if;
  select id into k_acc  from public.categories where slug = 'accessories';
  select id into k_ctl  from public.categories where slug = 'control-systems';
  select id into k_fc   from public.categories where slug = 'frequency-converters';
  select id into k_hiz  from public.categories where slug = 'speed-controllers';
  select id into k_sens from public.categories where slug = 'spare-parts-sensors';

  -- İDEMPOTANS: yeni durumun işaretleri (ana ad, alt kategorilerin üstü, pasif eski kök) hep birlikte tutuyorsa çık.
  select (a.name = 'Elektrik Aksesuarları'
          and c.is_active = false and c.parent_id = k_acc
          and f.parent_id = k_acc and h.parent_id = k_acc and s.parent_id = k_acc
          and s.name = 'Sensörler ve Koruma')
    into v_zaten
    from public.categories a, public.categories c, public.categories f, public.categories h, public.categories s
   where a.id = k_acc and c.id = k_ctl and f.id = k_fc and h.id = k_hiz and s.id = k_sens;
  if v_zaten then
    raise notice 'KTL-63: ağaç zaten yeni durumda; hiçbir şey yazılmadı';
    return;
  end if;

  -- GUARD 2: BUGÜNKÜ durum tam ölçülen durum (başka bir şey görürsek DURUR).
  if not exists (select 1 from public.categories where id = k_acc  and parent_id is null and is_active and name = 'Aksesuarlar'
                    and metadata -> 'slug' ->> 'tr' = 'aksesuarlar')
     or not exists (select 1 from public.categories where id = k_ctl  and parent_id is null and is_active)
     or not exists (select 1 from public.categories where id = k_fc   and parent_id = k_ctl and is_active and name = 'Frekans Konvertörleri')
     or not exists (select 1 from public.categories where id = k_hiz  and parent_id = k_ctl and is_active)
     or not exists (select 1 from public.categories where id = k_sens and parent_id = k_acc and is_active and name = 'Yedek Parça ve Sensörler'
                    and metadata -> 'slug' ->> 'tr' = 'yedek-parcalar-ve-sensorler') then
    raise exception 'KTL-63 guard 2: kategori ağacı ölçülen durumda değil; hiçbir şey yazılmadı';
  end if;

  -- GUARD 3: yeni TR adres adları başka bir kategoride kullanılmıyor (iki kategori aynı adrese düşmesin).
  select count(*) into v_adet from public.categories c
   where c.id not in (k_acc, k_sens)
     and (lower(c.slug) in ('elektrik-aksesuarlari','sensorler-ve-koruma')
          or lower(coalesce(c.metadata -> 'slug' ->> 'tr', '')) in ('elektrik-aksesuarlari','sensorler-ve-koruma')
          or lower(coalesce(c.metadata -> 'slug' ->> 'en', '')) in ('elektrik-aksesuarlari','sensorler-ve-koruma'));
  if v_adet > 0 then
    raise exception 'KTL-63 guard 3: yeni TR adres adı başka kategoride kullanılıyor; hiçbir şey yazılmadı';
  end if;

  -- GUARD 4: control-systems'e bağlı aile/ürün TAM ölçülen küme: 4 aile, 37 ürün; başka bağlı kayıt yok.
  select count(*) into v_aile_adet from public.product_families
   where category_id = k_ctl or subcategory_id = k_ctl;
  select count(*) into v_adet from public.product_families
   where (category_id = k_ctl or subcategory_id in (k_fc, k_hiz))
     and slug in ('danfoss-vlt-micro-drive-fc-51','danfoss-vlt-hvac-basic-drive-fc-101','danfoss-vlt-hvac-drive-fc-102','avens-hiz-anahtarlari');
  select count(*) into v_urun_adet from public.products
   where category_id = k_ctl or subcategory_id = k_ctl;
  if v_aile_adet <> 4 or v_adet <> 4 or v_urun_adet <> 37 then
    raise exception 'KTL-63 guard 4: control-systems bağlı aile %, eşleşen aile %, ürün % (beklenen 4, 4, 37); hiçbir şey yazılmadı',
      v_aile_adet, v_adet, v_urun_adet;
  end if;

  -- ADIM 1: ana kategori (ad, menü etiketi, TR slug, açıklama, SEO). `hide_price` ve diğer metadata anahtarları korunur.
  update public.categories c
     set name = 'Elektrik Aksesuarları',
         menu_label = 'Elektrik Aksesuarları',
         seo_title = 'Elektrik Aksesuarları: Hız Kontrolü ve Motor Koruma',
         seo_desc = 'Fan hızını ayarlayan ve motoru koruyan ürünler: hız anahtarları, frekans konvertörleri ve motor koruma sensörleri.',
         metadata = jsonb_set(jsonb_set(jsonb_set(jsonb_set(jsonb_set(c.metadata,
           '{slug,tr}', to_jsonb('elektrik-aksesuarlari'::text), true),
           '{description_i18n,tr}', to_jsonb('Fan hızını ayarlayan ve motoru koruyan elektrik ürünleri bu kategoridedir. Hız anahtarları basit ve kademelidir; değişken debi, yumuşak kalkış ya da bina otomasyonuna bağlanma gerekiyorsa frekans konvertörü gerekir. Motor koruma sensörleri ile sığınak havalandırma sistemlerinin tamamlayıcı ekipmanı da bu kategoride yer alır.'::text), true),
           '{description_i18n,en}', to_jsonb('This category holds the electrical products that set fan speed and protect the motor. Speed controllers are simple and stepped; a frequency converter is needed when variable airflow, soft start or a connection to building automation is required. Motor protection sensors and the complementary equipment for shelter ventilation systems are also in this category.'::text), true),
           '{seo_title_en}', to_jsonb('Electrical Accessories: Speed Control and Motor Protection'::text), true),
           '{seo_desc_en}', to_jsonb('Products that set fan speed and protect the motor: speed controllers, frequency converters and motor protection sensors.'::text), true)
   where c.id = k_acc;

  -- ADIM 2: alt kategoriler yeni üste; frekans konvertörlerinin görünen adı (TR slug aynı kalır).
  update public.categories set parent_id = k_acc, name = 'Frekans Konvertörleri (İnvertör)' where id = k_fc;
  update public.categories set parent_id = k_acc where id = k_hiz;

  -- ADIM 3: Sensörler ve Koruma (ad, TR slug, SEO başlığı). Açıklama ve SEO açıklaması mevcut metinle uyumlu, DEĞİŞMEZ.
  update public.categories c
     set name = 'Sensörler ve Koruma',
         seo_title = 'Sensörler ve Koruma: Motor Koruma Sensörleri',
         metadata = jsonb_set(jsonb_set(c.metadata,
           '{slug,tr}', to_jsonb('sensorler-ve-koruma'::text), true),
           '{seo_title_en}', to_jsonb('Sensors and Protection: Motor Protection Sensors'::text), true)
   where c.id = k_sens;

  -- ADIM 4: 4 aile + 37 ürün (kategori kimliği; alt kategori aynı kalır). Ürün satırında aile ve kategori birlikte süzülür.
  update public.product_families
     set category_id = k_acc, updated_at = now()
   where category_id = k_ctl and subcategory_id in (k_fc, k_hiz);
  get diagnostics v_aile_adet = row_count;
  update public.products
     set category_id = k_acc, updated_at = now()
   where category_id = k_ctl and subcategory_id in (k_fc, k_hiz);
  get diagnostics v_urun_adet = row_count;
  if v_aile_adet <> 4 or v_urun_adet <> 37 then
    raise exception 'KTL-63 adım 4: % aile, % ürün güncellendi (beklenen 4, 37); işlem geri alınır', v_aile_adet, v_urun_adet;
  end if;

  -- ADIM 5: eski kök pasif ve yeni ana kategorinin altında (eski adresler aktif üste tırmanarak çözülür).
  update public.categories set is_active = false, parent_id = k_acc where id = k_ctl;

  -- GUARD 5: sonuç sayımı — kimse control-systems'e bağlı kalmadı; ana kategoride 6 aile / 40 ürün; iki takma ad doğru yerde.
  select count(*) into v_adet from (
    select 1 from public.product_families where category_id = k_ctl or subcategory_id = k_ctl
    union all select 1 from public.products where category_id = k_ctl or subcategory_id = k_ctl
    union all select 1 from public.categories where parent_id = k_ctl
  ) x;
  if v_adet <> 0 then
    raise exception 'KTL-63 guard 5a: control-systems''e % bağlı kayıt kaldı; işlem geri alınır', v_adet;
  end if;
  select count(*) into v_aile_adet from public.product_families where category_id = k_acc;
  select count(*) into v_urun_adet from public.products where category_id = k_acc;
  if v_aile_adet <> 6 or v_urun_adet <> 40 then
    raise exception 'KTL-63 guard 5b: accessories altında % aile, % ürün (beklenen 6, 40); işlem geri alınır', v_aile_adet, v_urun_adet;
  end if;
  for r in
    select * from (values
      ('aksesuarlar',                 k_acc),
      ('yedek-parcalar-ve-sensorler', k_sens)
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
