-- KTL-67 — Isi geri kazanim: canli technical_specs'i resmi foye esitle (YALNIZ "kesin" satirlar).
-- Kaynak/belge: docs/audits/ktl67-isi-geri-kazanim-fark-tablosu-2026-10-31.md (PR #2141)
-- Alan: products.technical_specs (jsonb). Yeni alan / migration YOK. Yalnizca ilgili anahtar `||` ile birlestirilir
-- (nesne degistirilmez; 10 Ekim dersi). Canli yazim: OPS koşar, Recep "yaz" sozuyle. Her blok AYRI calistirilir.
-- Sira: 1 (kuru kosu) -> 2 (description_i18n taramasi, bos donmeli) -> 3 (yaz) -> 5 (olc). Geri alma: 4.
--
-- Degisenler (eski -> yeni):
--   A) Vort Mono 8 urun (12431,12432,12434,12435,12436,12437,12443,12444): filter_classes 'G4' -> 'G3'
--      Kaynak: Mono foyu 189860 s.8, s.10, s.14 ("Washable ISO Coarse >80% (G3)")
--   B) VRT-12101 noise_level_db_a 57 -> 47.2 ; VRT-10930 noise_level_db_a 57.2 -> 53   (HR ailesi LwA kullaniyor)
--      Kaynak: MEV IoT 188510 s.54 (12101 LwA 47,2), s.34 (10930 LwA 53)
--   C) VRT-10911 ve VRT-12106 electrical_protection_class 'Class II' -> 'Class I'
--      Kaynak: MEV IoT 188510 s.49 ("Electrical insulation class: I (earthing required)")
-- DEGISMEYENLER (kartta bekleyen): AVenS 1000 baglanti 275/250, AVenS 2000 olcu (uretici teyidi).

-- ───────── 1) KURU KOSU (yazmaz): 12 satir beklenir; eski_deger kolonu yukaridaki eski degerlerle ayni olmali ─────────
select sku,
       technical_specs->>'filter_classes'              as filtre,
       technical_specs->>'noise_level_db_a'            as ses_dba,
       technical_specs->>'electrical_protection_class' as koruma
from public.products
where deleted_at is null
  and sku in ('VRT-12431','VRT-12432','VRT-12434','VRT-12435','VRT-12436','VRT-12437','VRT-12443','VRT-12444',
              'VRT-12101','VRT-10930','VRT-10911','VRT-12106')
order by sku;
-- Beklenen: Mono 8 satir filtre G4; 12101 ses 57; 10930 ses 57.2; 10911 ve 12106 koruma 'Class II'.

-- ───────── 2) description_i18n / name_i18n TARAMASI (yazmaz): bos donmeli; satir donerse once o metin duzeltilir ─────────
select sku, 'description' as yer, description as metin
from public.products
where deleted_at is null
  and sku in ('VRT-12431','VRT-12432','VRT-12434','VRT-12435','VRT-12436','VRT-12437','VRT-12443','VRT-12444',
              'VRT-12101','VRT-10930','VRT-10911','VRT-12106')
  and description ~* '(\mG[34]\m|\m57[.,]?2?\m|class i|dB)'
union all
select sku, 'description_i18n', description_i18n::text
from public.products
where deleted_at is null
  and sku in ('VRT-12431','VRT-12432','VRT-12434','VRT-12435','VRT-12436','VRT-12437','VRT-12443','VRT-12444',
              'VRT-12101','VRT-10930','VRT-10911','VRT-12106')
  and description_i18n::text ~* '(\mG[34]\m|\m57[.,]?2?\m|class i|dB)';

-- ───────── 3) YAZ (tek islem; satir sayisi tutmazsa RAISE ile tamamen geri doner) ─────────
do $$
declare v_a int; v_b1 int; v_b2 int; v_c int;
begin
  update public.products
     set technical_specs = technical_specs || '{"filter_classes":"G3"}'::jsonb
   where deleted_at is null
     and technical_specs->>'filter_classes' = 'G4'
     and sku in ('VRT-12431','VRT-12432','VRT-12434','VRT-12435','VRT-12436','VRT-12437','VRT-12443','VRT-12444');
  get diagnostics v_a = row_count;

  update public.products
     set technical_specs = technical_specs || '{"noise_level_db_a":47.2}'::jsonb
   where deleted_at is null and sku = 'VRT-12101' and (technical_specs->>'noise_level_db_a')::numeric = 57;
  get diagnostics v_b1 = row_count;

  update public.products
     set technical_specs = technical_specs || '{"noise_level_db_a":53}'::jsonb
   where deleted_at is null and sku = 'VRT-10930' and (technical_specs->>'noise_level_db_a')::numeric = 57.2;
  get diagnostics v_b2 = row_count;

  update public.products
     set technical_specs = technical_specs || '{"electrical_protection_class":"Class I"}'::jsonb
   where deleted_at is null
     and technical_specs->>'electrical_protection_class' = 'Class II'
     and sku in ('VRT-10911','VRT-12106');
  get diagnostics v_c = row_count;

  if v_a <> 8 or v_b1 <> 1 or v_b2 <> 1 or v_c <> 2 then
    raise exception 'KTL-67: beklenen 8/1/1/2, guncellenen %/%/%/%', v_a, v_b1, v_b2, v_c;
  end if;
end $$;

-- ───────── 4) GERI ALMA (eski degerler; ayni sayac kapisi) ─────────
do $$
declare v_a int; v_b1 int; v_b2 int; v_c int;
begin
  update public.products
     set technical_specs = technical_specs || '{"filter_classes":"G4"}'::jsonb
   where deleted_at is null
     and technical_specs->>'filter_classes' = 'G3'
     and sku in ('VRT-12431','VRT-12432','VRT-12434','VRT-12435','VRT-12436','VRT-12437','VRT-12443','VRT-12444');
  get diagnostics v_a = row_count;

  update public.products
     set technical_specs = technical_specs || '{"noise_level_db_a":57}'::jsonb
   where deleted_at is null and sku = 'VRT-12101' and (technical_specs->>'noise_level_db_a')::numeric = 47.2;
  get diagnostics v_b1 = row_count;

  update public.products
     set technical_specs = technical_specs || '{"noise_level_db_a":57.2}'::jsonb
   where deleted_at is null and sku = 'VRT-10930' and (technical_specs->>'noise_level_db_a')::numeric = 53;
  get diagnostics v_b2 = row_count;

  update public.products
     set technical_specs = technical_specs || '{"electrical_protection_class":"Class II"}'::jsonb
   where deleted_at is null
     and technical_specs->>'electrical_protection_class' = 'Class I'
     and sku in ('VRT-10911','VRT-12106');
  get diagnostics v_c = row_count;

  if v_a <> 8 or v_b1 <> 1 or v_b2 <> 1 or v_c <> 2 then
    raise exception 'KTL-67 geri alma: beklenen 8/1/1/2, guncellenen %/%/%/%', v_a, v_b1, v_b2, v_c;
  end if;
end $$;

-- ───────── 5) YAZIM SONRASI OLCUM ─────────
select sku,
       technical_specs->>'filter_classes'              as filtre,
       technical_specs->>'noise_level_db_a'            as ses_dba,
       technical_specs->>'electrical_protection_class' as koruma
from public.products
where deleted_at is null
  and sku in ('VRT-12431','VRT-12432','VRT-12434','VRT-12435','VRT-12436','VRT-12437','VRT-12443','VRT-12444',
              'VRT-12101','VRT-10930','VRT-10911','VRT-12106')
order by sku;
-- Beklenen: Mono 8 satir G3; 12101 47.2; 10930 53; 10911/12106 'Class I'. Sonra canli sayfalar (TR+EN) ve
-- ISR tazelenmesi olculur (rendering-cache-standard.md): technical_specs degisimi vitrine yansimali.
