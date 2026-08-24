-- T151b-VH · 25 ürün ailesinin İngilizce adı yazılır (name_i18n->'en')
--
-- Recep onayı: 2026-08-23 ("tamam onaylıyorum … ana hatları ile doğru görünüyorlar").
-- Öneri listesi ve gerekçeleri: docs/audits/aile-adi-en-cevirileri-2026-08-23.md
-- ÖNKOŞUL: 20260823120000_product_families_name_i18n.sql (name_i18n kolonu + TR backfill).
--
-- KAPSAM: yalnız Türkçe olan 25 aile. Dil-nötr 13 model adının EN'i önceki migration'da
-- zaten TR ile aynı yazıldı ve buraya DAHİL DEĞİL — çevrilmeleri yanlış olurdu.
--
-- İKİ SATIR OEM'DEN ÖLÇÜLDÜ, TAHMİN DEĞİL:
--   ADH "Sık Kanatlı"    -> Forward-Curved      (üretici: "impeller with forward curved blades")
--   RDH "Seyrek Kanatlı" -> Backward-Inclined   (üretici: "11 backward inclined blades")
--   İlk taslakta RDH için "Backward-Curved" önerilmişti; ÜRETİCİ "inclined" diyor ve ikisi
--   aynı şey değil (curved = eğrisel kanat, inclined = düz ama eğik kanat). Bir satıcı sitesi
--   "curved" yazıyor; çelişkide OEM kazanır.
--
-- EŞLEŞME `name` ÜZERİNDEN, ÇÜNKÜ id'ler ortama göre değişir. Ad eşleşmezse UPDATE sessizce
-- 0 satır günceller ve migration YEŞİL döner — "veri yazıldı sanılır ama yazılmamıştır"
-- sınıfı. Bu yüzden aşağıda satır sayısı DOĞRULANIR ve tutmazsa migration PATLAR (işlem geri
-- alınır). Patlarsa sebebi: katalogda ad değişmiş → liste yeniden ölçülmeli.
-- (Bu migration yazılırken canlı prod'da 25/25 birebir eşleşiyordu, salt-okunur doğrulandı.)

do $$
declare
  guncellenen int;
begin
  with ceviri(tr_ad, en_ad) as (values
    ('AVenS Davlumbaz Fanları',                                  'AVenS Range Hood Fans'),
    ('AVenS Elektrikli Kanal Isıtıcıları',                       'AVenS Electric Duct Heaters'),
    ('AVenS Hücreli Aspiratörler',                               'AVenS Box Extract Fans'),
    ('AVenS Isı Geri Kazanım Cihazları',                         'AVenS Heat Recovery Units'),
    ('AVenS Sığınak Havalandırma Üniteleri',                     'AVenS Shelter Ventilation Units'),
    ('AVenS Plug Fanlar',                                        'AVenS Plug Fans'),
    ('Nicotra Gebhardt AT Çift Emişli Radyal Fanlar',            'Nicotra Gebhardt AT Double-Inlet Centrifugal Fans'),
    ('Nicotra Gebhardt DD Direkt Akuple Radyal Fanlar',          'Nicotra Gebhardt DD Direct-Driven Centrifugal Fans'),
    ('Nicotra Gebhardt ADH Sık Kanatlı Radyal Fanlar',           'Nicotra Gebhardt ADH Forward-Curved Centrifugal Fans'),
    ('Nicotra Gebhardt RDH Seyrek Kanatlı Radyal Fanlar',        'Nicotra Gebhardt RDH Backward-Inclined Centrifugal Fans'),
    ('SEAT Storm Jet Asit Dayanımlı Fanlar',                     'SEAT Storm Jet Acid-Resistant Fans'),
    ('Vortice Aksiyel Endüstriyel Fanlar',                       'Vortice Axial Industrial Fans'),
    ('Vortice Deumido Nem Alma Cihazları',                       'Vortice Deumido Dehumidifiers'),
    ('Vortice Endüstriyel Çatı Fanları',                         'Vortice Industrial Roof Fans'),
    ('Vortice Heatmaster Duman Egzoz Fanları',                   'Vortice Heatmaster Smoke Extract Fans'),
    ('Vortice Lineo Quiet Kanal Fanları',                        'Vortice Lineo Quiet Inline Duct Fans'),
    ('Vortice Punto Evo / Flexo Banyo Fanları',                  'Vortice Punto Evo / Flexo Bathroom Fans'),
    ('Vortice Radon Serisi Çatı Fanları',                        'Vortice Radon Series Roof Fans'),
    ('Vortice Radon Serisi Kanal Fanları',                       'Vortice Radon Series Duct Fans'),
    ('Vortice Slimroof Çatı Fanları',                            'Vortice Slimroof Roof Fans'),
    ('Vortice VORT Commercial In-Line Dikdörtgen Kanal Fanları', 'Vortice VORT Commercial In-Line Rectangular Duct Fans'),
    ('Vortice VORT Commercial In-Line Yuvarlak Kanal Fanları',   'Vortice VORT Commercial In-Line Circular Duct Fans'),
    ('Vortice VORT HR Isı Geri Kazanım',                         'Vortice VORT HR Heat Recovery'),
    ('Vortice AIR DOOR Hava Perdeleri',                          'Vortice AIR DOOR Air Curtains'),
    ('Vortice VORT-E ATEX Fanlar',                               'Vortice VORT-E ATEX Fans')
  )
  update public.product_families pf
  set name_i18n = coalesce(pf.name_i18n, jsonb_build_object('tr', pf.name))
                  || jsonb_build_object('en', c.en_ad)
  from ceviri c
  where pf.name = c.tr_ad
    and pf.deleted_at is null;

  get diagnostics guncellenen = row_count;

  if guncellenen <> 25 then
    raise exception
      'T151b DURDU: 25 satir beklenirken % satir guncellendi. Katalogda aile adi degismis '
      'olabilir; docs/audits/aile-adi-en-cevirileri-2026-08-23.md listesi YENIDEN OLCULMELI. '
      'Sessiz kismi yazim yerine islem geri alindi.', guncellenen;
  end if;
end $$;

-- İKİNCİ KAPI: iş bittiğinde Türkçe olan hiçbir ailenin EN alanı boş ya da Türkçe kalmamalı.
-- Yukarıdaki sayı kapısı "25 satır dokunuldu" der; bu kapı "SONUÇ doğru" der. İkisi ayrı soru.
do $$
declare
  eksik int;
  turkce_kalan int;
begin
  select count(*) into eksik
  from public.product_families
  where deleted_at is null and coalesce(name_i18n->>'en', '') = '';

  select count(*) into turkce_kalan
  from public.product_families
  where deleted_at is null
    and (name_i18n->>'en' ~ '[ğĞıİöÖşŞüÜçÇ]'
         or name_i18n->>'en' ~* '\m(fanları|fanlar|cihazları|üniteleri|ısıtıcıları|perdeleri)\M');

  if eksik > 0 or turkce_kalan > 0 then
    raise exception
      'T151b DURDU: EN alani bos kalan % aile, EN alaninda TURKCE kalan % aile. '
      'Ingilizce vitrinde Turkce basardi.', eksik, turkce_kalan;
  end if;
end $$;
