-- KTL-63 geri alma — 20261026090000_kontrol_urunleri_elektrik_aksesuarlari_karar409.sql. ELLE, tek işlem.
-- Eski değerler 2026-10-26 canlı SELECT'inden (docs/audits/ktl63-kontrol-kategori-olcumu-ve-tasima-onerisi-2026-10-26.md §DÖKÜM).
-- Not: tetik TR slug'ı geri çevirmeyi de url_takma_adlari'na yazar (elektrik-aksesuarlari, sensorler-ve-koruma → eski kategoriler);
-- kanonik adres farklı olduğu için döngü oluşmaz. Geri aldıktan sonra kod tarafı (sözlük, markaYonlendirmeleri) ayrıca geri alınmalı.
--
-- SAYI DOĞRULAMASI: 4 aile ve 37 ürün güncellenmezse işlem geri alınır (durum dışı satır sessizce atlanmaz).
-- Ürünler yalnız bu 4 ailenin satırlarıdır (aile kimliği ile süzülür); başka kimsenin kategorisine dokunulmaz.
begin;
set local lock_timeout = '5s';
set local statement_timeout = '60s';

do $geri_al$
declare
  k_acc  constant uuid := '6d3749d5-13fa-4cb0-9467-d99586a39f89';
  k_ctl  constant uuid := '9dcf8e58-32bf-4828-8422-b1e2e1499abe';
  k_fc   constant uuid := '194adcb5-df15-45b2-adc1-d5502012e4c1';
  k_hiz  constant uuid := '7c673ad2-ed6a-48b4-9aba-6930e9815636';
  k_sens constant uuid := '1a87e18b-6195-48f4-8c75-2f5f5feb137f';
  v_aile integer;
  v_urun integer;
begin
  -- Eski kök önce geri açılır (üst: kök) — alt kategoriler ona dönecek.
  update public.categories set is_active = true, parent_id = null where id = k_ctl;

  update public.categories set parent_id = k_ctl, name = 'Frekans Konvertörleri' where id = k_fc;
  update public.categories set parent_id = k_ctl where id = k_hiz;

  update public.product_families
     set category_id = k_ctl, updated_at = now()
   where category_id = k_acc and subcategory_id in (k_fc, k_hiz);
  get diagnostics v_aile = row_count;
  update public.products
     set category_id = k_ctl, updated_at = now()
   where category_id = k_acc and subcategory_id in (k_fc, k_hiz);
  get diagnostics v_urun = row_count;
  if v_aile <> 4 or v_urun <> 37 then
    raise exception 'KTL-63 geri alma: % aile, % ürün güncellendi (beklenen 4, 37); işlem geri alınır, hiçbir şey yazılmadı', v_aile, v_urun;
  end if;

  update public.categories c
     set name = 'Aksesuarlar',
         menu_label = 'Aksesuarlar',
         seo_title = 'Aksesuarlar: Tamamlayıcı Parçalar ve Ekipman',
         seo_desc = 'Ana cihazın kendisi değil, onu tamamlayan parçalar ve ekipman; yedek parçalar ve sensörler alt kategoride yer alır.',
         metadata = jsonb_set(jsonb_set(jsonb_set(jsonb_set(jsonb_set(c.metadata,
           '{slug,tr}', to_jsonb('aksesuarlar'::text), true),
           '{description_i18n,tr}', to_jsonb('Ana cihazın kendisi değil, onu tamamlayan parçalar bu kategoridedir. Yedek parçalar ve sensörler alt kategoride yer alır.'::text), true),
           '{description_i18n,en}', to_jsonb('These are not the main units themselves but the parts that complement them. Spare parts and sensors are in the subcategory.'::text), true),
           '{seo_title_en}', to_jsonb('Accessories: Complementary Parts and Equipment'::text), true),
           '{seo_desc_en}', to_jsonb('These are not the main units themselves but the parts and equipment that complement them; spare parts and sensors are in the subcategory.'::text), true)
   where c.id = k_acc;

  update public.categories c
     set name = 'Yedek Parça ve Sensörler',
         seo_title = 'Yedek Parça ve Sensörler: Motor Koruma Sensörleri',
         metadata = jsonb_set(jsonb_set(c.metadata,
           '{slug,tr}', to_jsonb('yedek-parcalar-ve-sensorler'::text), true),
           '{seo_title_en}', to_jsonb('Spare Parts and Sensors: Motor Protection Sensors'::text), true)
   where c.id = k_sens;
end
$geri_al$;

commit;
