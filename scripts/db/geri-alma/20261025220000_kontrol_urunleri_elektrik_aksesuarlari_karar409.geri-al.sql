-- KTL-63 geri alma — 20261025220000_kontrol_urunleri_elektrik_aksesuarlari_karar409.sql. ELLE, tek işlem.
-- Eski değerler 2026-10-25 canlı SELECT'inden (docs/audits/ktl63-kontrol-kategori-olcumu-ve-tasima-onerisi-2026-10-25.md §DÖKÜM).
-- Not: tetik TR slug'ı geri çevirmeyi de url_takma_adlari'na yazar (elektrik-aksesuarlari, sensorler-ve-koruma → eski
-- kategoriler); kanonik adres farklı olduğu için döngü oluşmaz. Kod tarafı (sözlük adları, marka yönlendirmesi) ayrıca geri alınmalıdır.
--
-- SAYI DOĞRULAMASI: SEAT PTC 1 aile / 1 ürün ve BVU-LS 1 aile / 2 ürün güncellenmezse işlem geri alınır.
-- Aileler kimlikle seçilir (slug); başka kimsenin kategorisine dokunulmaz.
begin;
set local lock_timeout = '5s';
set local statement_timeout = '60s';

do $geri_al$
declare
  k_acc  constant uuid := '6d3749d5-13fa-4cb0-9467-d99586a39f89';
  k_ctl  constant uuid := '9dcf8e58-32bf-4828-8422-b1e2e1499abe';
  k_fc   constant uuid := '194adcb5-df15-45b2-adc1-d5502012e4c1';
  k_sens constant uuid := '1a87e18b-6195-48f4-8c75-2f5f5feb137f';
  f_ptc  constant uuid := '55937a21-b3f4-4aea-b0c3-4a19f54d9006';
  f_bvu  constant uuid := '61a657c1-1e4e-48c9-838f-7a43c7492dd6';
  v_aile integer;
  v_urun integer;
  v_adet integer;
  r record;
begin
  -- Aileler önce (kategoriler geri dönmeden hiçbir kimlik kaybolmaz; yalnız atama döner).
  update public.product_families set category_id = k_acc, updated_at = now()
   where id = f_ptc and category_id = k_ctl and subcategory_id = k_sens;
  get diagnostics v_aile = row_count;
  update public.products set category_id = k_acc, updated_at = now()
   where family_id = f_ptc and category_id = k_ctl and subcategory_id = k_sens;
  get diagnostics v_urun = row_count;
  if v_aile <> 1 or v_urun <> 1 then
    raise exception 'KTL-63 geri alma (SEAT PTC): % aile, % ürün (beklenen 1, 1); işlem geri alınır', v_aile, v_urun;
  end if;
  update public.product_families set subcategory_id = k_sens, updated_at = now()
   where id = f_bvu and category_id = k_acc and subcategory_id is null;
  get diagnostics v_aile = row_count;
  update public.products set subcategory_id = k_sens, updated_at = now()
   where family_id = f_bvu and category_id = k_acc and subcategory_id is null;
  get diagnostics v_urun = row_count;
  if v_aile <> 1 or v_urun <> 2 then
    raise exception 'KTL-63 geri alma (BVU-LS): % aile, % ürün (beklenen 1, 2); işlem geri alınır', v_aile, v_urun;
  end if;

  -- Elektrik Aksesuarları → Kontrol Sistemleri (metin sonekleri çıkarılır, kalan eski metin aynen).
  update public.categories c
     set name = 'Kontrol Sistemleri',
         menu_label = 'Kontrol Sistemleri',
         seo_title = 'Kontrol Sistemleri: Hız Anahtarı ve Konvertör',
         seo_desc = 'Fanı çalıştırmak yetmez; ne zaman ve hangi hızda çalışacağına karar veren katman burada: hız anahtarları ve frekans konvertörleri.',
         metadata = jsonb_set(jsonb_set(jsonb_set(jsonb_set(jsonb_set(c.metadata,
           '{slug,tr}', to_jsonb('kontrol-ve-suruculer'::text), true),
           '{description_i18n,tr}', to_jsonb(replace(c.metadata #>> '{description_i18n,tr}', ' Motor koruma sensörleri de bu kategoridedir.', '')), true),
           '{description_i18n,en}', to_jsonb(replace(c.metadata #>> '{description_i18n,en}', ' Motor protection sensors are also in this category.', '')), true),
           '{seo_title_en}', to_jsonb('Control Systems: Speed Controllers and Converters'::text), true),
           '{seo_desc_en}', to_jsonb('Running a fan is not enough; the layer that decides when and at what speed it runs is here: speed controllers and frequency converters.'::text), true)
   where c.id = k_ctl;

  -- Sensörler ve Koruma → Yedek Parça ve Sensörler (üst: Aksesuarlar).
  update public.categories c
     set parent_id = k_acc,
         name = 'Yedek Parça ve Sensörler',
         seo_title = 'Yedek Parça ve Sensörler: Motor Koruma Sensörleri',
         seo_desc = 'Cihazın kendisi değil, onu tamamlayan ya da koruyan parçalar: motor koruma sensörleri ve sığınak havalandırma sistemlerinin tamamlayıcı ekipmanı.',
         metadata = jsonb_set(jsonb_set(jsonb_set(jsonb_set(jsonb_set(c.metadata,
           '{slug,tr}', to_jsonb('yedek-parcalar-ve-sensorler'::text), true),
           '{description_i18n,tr}', to_jsonb('Cihazın kendisi değil, onu tamamlayan ya da koruyan parçalar. Motor koruma sensörleri ve sığınak havalandırma sistemlerinin tamamlayıcı ekipmanı bu başlık altındadır.'::text), true),
           '{description_i18n,en}', to_jsonb('Not the device itself, but parts that complement or protect it. Motor protection sensors and the complementary equipment for shelter ventilation systems fall under this heading.'::text), true),
           '{seo_title_en}', to_jsonb('Spare Parts and Sensors: Motor Protection Sensors'::text), true),
           '{seo_desc_en}', to_jsonb('Not the device itself, but parts that complement or protect it: motor protection sensors and complementary equipment for shelter ventilation systems.'::text), true)
   where c.id = k_sens;

  update public.categories set name = 'Frekans Konvertörleri' where id = k_fc;

  -- Aksesuarlar metni (alt kategori cümlesi geri).
  update public.categories c
     set seo_desc = 'Ana cihazın kendisi değil, onu tamamlayan parçalar ve ekipman; yedek parçalar ve sensörler alt kategoride yer alır.',
         metadata = jsonb_set(jsonb_set(jsonb_set(c.metadata,
           '{description_i18n,tr}', to_jsonb('Ana cihazın kendisi değil, onu tamamlayan parçalar bu kategoridedir. Yedek parçalar ve sensörler alt kategoride yer alır.'::text), true),
           '{description_i18n,en}', to_jsonb('These are not the main units themselves but the parts that complement them. Spare parts and sensors are in the subcategory.'::text), true),
           '{seo_desc_en}', to_jsonb('These are not the main units themselves but the parts and equipment that complement them; spare parts and sensors are in the subcategory.'::text), true)
   where c.id = k_acc;

  -- Menü 10-25 görünen adları geri.
  for r in
    select * from (values
      ('heat-recovery-vmc',       'Isı Geri Kazanım (VMC)',   'Isı Geri Kazanım'),
      ('ducted-central-hrv',      'Kanallı Merkezi Üniteler', 'Kanallı Isı Geri Kazanım Cihazları'),
      ('single-room-hrv',         'Tekil Oda Üniteleri',      'Oda Tipi Isı Geri Kazanım Cihazları'),
      ('water-coil-duct-heaters', 'Sulu Batarya Kanal Tipi',  'Sulu Bataryalı Kanal Isıtıcıları')
    ) as t(en_slug, eski_ad, yeni_ad)
  loop
    update public.categories
       set name = r.eski_ad,
           menu_label = case when menu_label = r.yeni_ad then r.eski_ad else menu_label end
     where slug = r.en_slug and name = r.yeni_ad;
    get diagnostics v_adet = row_count;
    if v_adet <> 1 then
      raise exception 'KTL-63 geri alma (ad): % için % satır (beklenen 1); işlem geri alınır', r.en_slug, v_adet;
    end if;
  end loop;
end
$geri_al$;

commit;
