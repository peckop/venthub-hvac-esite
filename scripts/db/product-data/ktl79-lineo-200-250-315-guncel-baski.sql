-- KTL-79 — Vortice Lineo 200 / 250 / 315 (VRT-17180, VRT-17181, VRT-17182): canlı değerler üreticinin GÜNCEL baskısına göre.
-- Kaynak: Doc_Pubblicita_Lineo_Range_193047.pdf (kod 5.170.084.504, Şubat 2026; envanterde "güncel") s.28 (teknik + ses) ve s.29 (ebat).
-- Neden: KTL-12 (10 Ekim) LINEO_QUITE_KATALOG.pdf s.28'i "güncel" sanmıştı; o dosya envanterde "eski" (2020-12 baskısı).
-- Belge: docs/audits/ktl79-lineo-200-250-315-guncel-baski-fark-2026-11-04.md (alan alan fark tablosu).
-- Alan: products.technical_specs (jsonb, `||` ile yalnız ilgili anahtarlar) + products.description_i18n (tr/en, tam 1 kez eşleşen cümle parçası).
-- Yeni alan / migration YOK. Okuyan kod değerleri genel okur (anahtar adları değişmiyor, yalnız değerler).
-- DEĞİŞMEYEN (bilerek):
--   * VRT-17181 ses: güncel baskıda "yayılan" Lp max hücresi 35,5 (min ile aynı, basım hatası; Lw 64,7'den ~44 beklenir). TAHMİNLE YAZILMAZ:
--     noise_level_db_a 43,5 ve açıklamadaki ses cümlesi OLDUĞU GİBİ kalır, üretici teyidi bekler.
--   * Ağırlık 4,9 / 5,3 / 9,5 kg güncel baskıyla zaten aynı. 17180 güç/akım/devir/debi/basınç/ses(yayılan) zaten aynı.
--   * 17181 ebat C = 322 mm: iki baskıda da aynı basılı değer, komşu modellerden (396 ve 420) küçük görünüyor; kaynağa sadık yazılır, üretici teyidi adayı.
-- pq_curve: yalnız 17181 ve 17182'de, canlıdaki iki noktalı biçimle ve yeni azami değerlerle tutarlı tutulur (eğri kaynağı KTL-9 hattı; burada yeni eğri ÜRETİLMEZ).
-- ip_rating: güncel baskı s.28 "IPX5", dipnot "Protection refered to ducted units" => "IPX5 (kanallı kurulum)" (Lineo Quiet'in canlı biçimiyle aynı).
-- CANLI YAZIM: OPS koşar, Recep "yaz" sözüyle. Her blok AYRI çalıştırılır. Sıra: 1 -> 2 -> 3 -> 5. Geri alma: 4.

-- ───────── 1) KURU KOŞU (yazmaz): 3 satır, ESKİ değerler beklenir ─────────
select sku,
       technical_specs->>'ip_rating' as ip, technical_specs->>'size_a_mm' as a, technical_specs->>'size_b_mm' as b, technical_specs->>'size_c_mm' as c,
       technical_specs->>'max_absorbed_power_w' as w, technical_specs->>'absorbed_current_a' as akim, technical_specs->>'rpm_max' as devir,
       technical_specs->>'max_delivery_m3h' as m3h, technical_specs->>'max_delivery_ls' as ls, technical_specs->>'max_static_pressure_pa' as pa,
       technical_specs->>'noise_level_db_a' as db, technical_specs->>'pq_curve' as egri
from public.products
where deleted_at is null and sku in ('VRT-17180','VRT-17181','VRT-17182')
order by sku;
-- Beklenen ESKİ: 17180 IP44 234.5/260.5/300 | 17181 IP44 300/317/385 145 W 0.63 A 2730 1440 400 364.8 43.5 | 17182 IP44 361.5/392.5/448 360 W 1.6 A 2690 2590 719.44 543.3 49

-- ───────── 2) METIN TARAMASI (yazmaz): her ürün için tam 1 satır; eski cümle parçası bulunmalı ─────────
select sku,
       (description_i18n->>'tr') like '%emiş 72 dB(A), basma 70,7 dB(A)%' as tr_17180_eski,
       (description_i18n->>'en') like '%intake 72 dB(A), supply 70.7 dB(A)%' as en_17180_eski
from public.products where deleted_at is null and sku = 'VRT-17180';
select sku,
       (description_i18n->>'tr') like '%emilen güç 145 W%' as tr_17181_eski,
       (description_i18n->>'en') like '%top speed (50 Hz): 145 W%' as en_17181_eski
from public.products where deleted_at is null and sku = 'VRT-17181';
select sku,
       (description_i18n->>'tr') like '%emiş 74,5 dB(A), basma 74,2 dB(A), yayılan 49 dB(A)%' as tr_17182_eski,
       (description_i18n->>'en') like '%intake 74.5 dB(A), supply 74.2 dB(A), radiated 49 dB(A)%' as en_17182_eski
from public.products where deleted_at is null and sku = 'VRT-17182';
-- Beklenen: hepsi true. Biri false ise YAZMA (metin değişmiş, bayatlık).

-- ───────── 3) YAZ (tek işlem; her sayaç beklenenle tutmazsa RAISE ile tamamen geri döner) ─────────
do $$
declare v_adet int;
begin
  -- 17180: ip + ebat (270 / 373 / 396); ses cümlesi emiş/basma (yayılan 46,9 zaten aynı)
  update public.products
     set technical_specs = technical_specs || '{"ip_rating":"IPX5 (kanallı kurulum)","size_a_mm":270,"size_b_mm":373,"size_c_mm":396}'::jsonb,
         description_i18n = jsonb_set(jsonb_set(description_i18n, '{tr}',
             to_jsonb(replace(description_i18n->>'tr', 'emiş 72 dB(A), basma 70,7 dB(A)', 'emiş 55,4 dB(A), basma 56,8 dB(A)'))), '{en}',
             to_jsonb(replace(description_i18n->>'en', 'intake 72 dB(A), supply 70.7 dB(A)', 'intake 55.4 dB(A), supply 56.8 dB(A)')))
   where deleted_at is null and sku = 'VRT-17180'
     and technical_specs->>'ip_rating' = 'IP44' and (technical_specs->>'size_a_mm')::numeric = 234.5
     and (description_i18n->>'tr') like '%emiş 72 dB(A), basma 70,7 dB(A)%' and (description_i18n->>'en') like '%intake 72 dB(A), supply 70.7 dB(A)%';
  get diagnostics v_adet = row_count;
  if v_adet <> 1 then raise exception 'KTL-79: VRT-17180 beklenen 1 satir, guncellenen %', v_adet; end if;

  -- 17181: ip + ebat (300 / 378 / 322) + güç/akım/debi/basınç + eğri uçları; açıklamada yalnız güç 145 -> 150 W (ses DOKUNULMAZ)
  update public.products
     set technical_specs = technical_specs || '{"ip_rating":"IPX5 (kanallı kurulum)","size_a_mm":300,"size_b_mm":378,"size_c_mm":322,
         "max_absorbed_power_w":150,"absorbed_current_a":0.65,"max_delivery_m3h":1470,"max_delivery_ls":408.3,"max_static_pressure_pa":368.7,
         "pq_curve":"[[0, 368.7], [1470, 0]]"}'::jsonb,
         description_i18n = jsonb_set(jsonb_set(description_i18n, '{tr}',
             to_jsonb(replace(description_i18n->>'tr', 'emilen güç 145 W', 'emilen güç 150 W'))), '{en}',
             to_jsonb(replace(description_i18n->>'en', 'top speed (50 Hz): 145 W', 'top speed (50 Hz): 150 W')))
   where deleted_at is null and sku = 'VRT-17181'
     and technical_specs->>'ip_rating' = 'IP44' and (technical_specs->>'max_absorbed_power_w')::numeric = 145
     and (technical_specs->>'max_delivery_m3h')::numeric = 1440
     and (description_i18n->>'tr') like '%emilen güç 145 W%' and (description_i18n->>'en') like '%top speed (50 Hz): 145 W%';
  get diagnostics v_adet = row_count;
  if v_adet <> 1 then raise exception 'KTL-79: VRT-17181 beklenen 1 satir, guncellenen %', v_adet; end if;

  -- 17182: ip + ebat (373 / 446 / 420) + akım/devir/debi/basınç/ses + eğri uçları; açıklamada ses cümlesi (62,2 / 64,9 / 51,6)
  update public.products
     set technical_specs = technical_specs || '{"ip_rating":"IPX5 (kanallı kurulum)","size_a_mm":373,"size_b_mm":446,"size_c_mm":420,
         "absorbed_current_a":1.55,"rpm_max":2710,"max_delivery_m3h":2740,"max_delivery_ls":761.1,"max_static_pressure_pa":559,
         "noise_level_db_a":51.6,"pq_curve":"[[0, 559], [2740, 0]]"}'::jsonb,
         description_i18n = jsonb_set(jsonb_set(description_i18n, '{tr}',
             to_jsonb(replace(description_i18n->>'tr', 'emiş 74,5 dB(A), basma 74,2 dB(A), yayılan 49 dB(A)', 'emiş 62,2 dB(A), basma 64,9 dB(A), yayılan 51,6 dB(A)'))), '{en}',
             to_jsonb(replace(description_i18n->>'en', 'intake 74.5 dB(A), supply 74.2 dB(A), radiated 49 dB(A)', 'intake 62.2 dB(A), supply 64.9 dB(A), radiated 51.6 dB(A)')))
   where deleted_at is null and sku = 'VRT-17182'
     and technical_specs->>'ip_rating' = 'IP44' and (technical_specs->>'rpm_max')::numeric = 2690
     and (technical_specs->>'max_delivery_m3h')::numeric = 2590
     and (description_i18n->>'tr') like '%emiş 74,5 dB(A), basma 74,2 dB(A), yayılan 49 dB(A)%'
     and (description_i18n->>'en') like '%intake 74.5 dB(A), supply 74.2 dB(A), radiated 49 dB(A)%';
  get diagnostics v_adet = row_count;
  if v_adet <> 1 then raise exception 'KTL-79: VRT-17182 beklenen 1 satir, guncellenen %', v_adet; end if;
end $$;

-- ───────── 4) GERI ALMA (eski değerler; yalnız yeni değerler yerindeyse çalışır) ─────────
do $$
declare v_adet int;
begin
  update public.products
     set technical_specs = technical_specs || '{"ip_rating":"IP44","size_a_mm":234.5,"size_b_mm":260.5,"size_c_mm":300}'::jsonb,
         description_i18n = jsonb_set(jsonb_set(description_i18n, '{tr}',
             to_jsonb(replace(description_i18n->>'tr', 'emiş 55,4 dB(A), basma 56,8 dB(A)', 'emiş 72 dB(A), basma 70,7 dB(A)'))), '{en}',
             to_jsonb(replace(description_i18n->>'en', 'intake 55.4 dB(A), supply 56.8 dB(A)', 'intake 72 dB(A), supply 70.7 dB(A)')))
   where deleted_at is null and sku = 'VRT-17180' and technical_specs->>'ip_rating' = 'IPX5 (kanallı kurulum)';
  get diagnostics v_adet = row_count;
  if v_adet <> 1 then raise exception 'KTL-79 geri alma: VRT-17180 beklenen 1, guncellenen %', v_adet; end if;

  update public.products
     set technical_specs = technical_specs || '{"ip_rating":"IP44","size_a_mm":300,"size_b_mm":317,"size_c_mm":385,
         "max_absorbed_power_w":145,"absorbed_current_a":0.63,"max_delivery_m3h":1440,"max_delivery_ls":400,"max_static_pressure_pa":364.8,
         "pq_curve":"[[0, 364.8], [1440, 0]]"}'::jsonb,
         description_i18n = jsonb_set(jsonb_set(description_i18n, '{tr}',
             to_jsonb(replace(description_i18n->>'tr', 'emilen güç 150 W', 'emilen güç 145 W'))), '{en}',
             to_jsonb(replace(description_i18n->>'en', 'top speed (50 Hz): 150 W', 'top speed (50 Hz): 145 W')))
   where deleted_at is null and sku = 'VRT-17181' and technical_specs->>'ip_rating' = 'IPX5 (kanallı kurulum)';
  get diagnostics v_adet = row_count;
  if v_adet <> 1 then raise exception 'KTL-79 geri alma: VRT-17181 beklenen 1, guncellenen %', v_adet; end if;

  update public.products
     set technical_specs = technical_specs || '{"ip_rating":"IP44","size_a_mm":361.5,"size_b_mm":392.5,"size_c_mm":448,
         "absorbed_current_a":1.6,"rpm_max":2690,"max_delivery_m3h":2590,"max_delivery_ls":719.44,"max_static_pressure_pa":543.3,
         "noise_level_db_a":49,"pq_curve":"[[0, 543.3], [2590, 0]]"}'::jsonb,
         description_i18n = jsonb_set(jsonb_set(description_i18n, '{tr}',
             to_jsonb(replace(description_i18n->>'tr', 'emiş 62,2 dB(A), basma 64,9 dB(A), yayılan 51,6 dB(A)', 'emiş 74,5 dB(A), basma 74,2 dB(A), yayılan 49 dB(A)'))), '{en}',
             to_jsonb(replace(description_i18n->>'en', 'intake 62.2 dB(A), supply 64.9 dB(A), radiated 51.6 dB(A)', 'intake 74.5 dB(A), supply 74.2 dB(A), radiated 49 dB(A)')))
   where deleted_at is null and sku = 'VRT-17182' and technical_specs->>'ip_rating' = 'IPX5 (kanallı kurulum)';
  get diagnostics v_adet = row_count;
  if v_adet <> 1 then raise exception 'KTL-79 geri alma: VRT-17182 beklenen 1, guncellenen %', v_adet; end if;
end $$;

-- ───────── 5) YAZIM SONRASI ÖLÇÜM ─────────
select sku, technical_specs->>'ip_rating' as ip, technical_specs->>'size_a_mm' as a, technical_specs->>'size_b_mm' as b, technical_specs->>'size_c_mm' as c,
       technical_specs->>'max_absorbed_power_w' as w, technical_specs->>'absorbed_current_a' as akim, technical_specs->>'rpm_max' as devir,
       technical_specs->>'max_delivery_m3h' as m3h, technical_specs->>'max_static_pressure_pa' as pa, technical_specs->>'noise_level_db_a' as db,
       description_i18n->>'tr' as aciklama_tr, description_i18n->>'en' as aciklama_en
from public.products
where deleted_at is null and sku in ('VRT-17180','VRT-17181','VRT-17182')
order by sku;
-- Beklenen YENİ: 17180 IPX5 270/373/396 | 17181 IPX5 300/378/322 150 W 0.65 A 1470 368.7 db 43.5 (dokunulmadı) | 17182 IPX5 373/446/420 360 W 1.55 A 2710 2740 559 db 51.6.
-- Sonra canlı aile sayfası (TR+EN) ve ISR tazelenmesi ölçülür; aile geneli yazar (sihirbaz noise_level_db_a okur: 17182 51,6).
