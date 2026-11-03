-- KTL-71 — Air Door H AD üç fazlı 3 model: voltage_v 400 -> 380 (iki föy baskısı da 380 V).
-- Kaynak/belge: docs/audits/ktl71-h-ad-voltaj-isitici-fark-2026-11-02.md ; föy: Doc_Pubblicita_Air_Door_Range_189461.pdf s.6 (Mayıs 2025).
-- Alan: products.technical_specs (jsonb), `||` ile yalnız tek anahtar. Yeni alan / migration YOK.
-- DEĞİŞMEYEN: H AD 900 M ısıtıcı gücü (6000 W canlı, 9200 W güncel föy): çelişkili, üretici teyidi (belgede).
-- CANLI YAZIM: OPS koşar, Recep "yaz" sözüyle. Her blok AYRI çalıştırılır. Sıra: 1 -> 2 -> 3 -> 5. Geri alma: 4.

-- ───────── 1) KURU KOŞU (yazmaz): 3 satır beklenir, voltaj 400 ─────────
select sku, technical_specs->>'voltage_v' as eski_voltaj, '380' as yeni_voltaj, technical_specs->>'phase' as faz
from public.products
where deleted_at is null and sku in ('VRT-65156','VRT-65157','VRT-65158')
order by sku;

-- ───────── 2) METIN TARAMASI (yazmaz): bos donmeli (products metin kolonlari: name, name_i18n, description_i18n) ─────────
select sku, 'name' as yer, name as metin from public.products
where deleted_at is null and sku in ('VRT-65156','VRT-65157','VRT-65158') and name ~* '(\m400\M|\m380\M)'
union all
select sku, 'name_i18n', name_i18n::text from public.products
where deleted_at is null and sku in ('VRT-65156','VRT-65157','VRT-65158') and name_i18n::text ~* '(\m400\M|\m380\M)'
union all
select sku, 'description_i18n', description_i18n::text from public.products
where deleted_at is null and sku in ('VRT-65156','VRT-65157','VRT-65158') and description_i18n::text ~* '(\m400\M|\m380\M)';

-- ───────── 3) YAZ (tek işlem; sayaç 3 değilse RAISE ile tamamen geri döner) ─────────
do $$
declare v_adet int;
begin
  update public.products
     set technical_specs = technical_specs || '{"voltage_v":380}'::jsonb
   where deleted_at is null
     and (technical_specs->>'voltage_v')::numeric = 400
     and sku in ('VRT-65156','VRT-65157','VRT-65158');
  get diagnostics v_adet = row_count;
  if v_adet <> 3 then
    raise exception 'KTL-71: beklenen 3 satir, guncellenen %', v_adet;
  end if;
end $$;

-- ───────── 4) GERI ALMA (eski değer 400) ─────────
do $$
declare v_adet int;
begin
  update public.products
     set technical_specs = technical_specs || '{"voltage_v":400}'::jsonb
   where deleted_at is null
     and (technical_specs->>'voltage_v')::numeric = 380
     and sku in ('VRT-65156','VRT-65157','VRT-65158');
  get diagnostics v_adet = row_count;
  if v_adet <> 3 then
    raise exception 'KTL-71 geri alma: beklenen 3 satir, guncellenen %', v_adet;
  end if;
end $$;

-- ───────── 5) YAZIM SONRASI ÖLÇÜM ─────────
select sku, technical_specs->>'voltage_v' as voltaj, technical_specs->>'phase' as faz
from public.products
where deleted_at is null and sku in ('VRT-65155','VRT-65156','VRT-65157','VRT-65158')
order by sku;
-- Beklenen: 65155 230 (faz 1, dokunulmaz); 65156/57/58 380 (faz 3). Sonra canlı sayfa (TR+EN) ve ISR tazelenmesi ölçülür.
