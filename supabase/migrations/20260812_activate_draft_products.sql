-- 20260812 — Taslak ürünlerin aktivasyonu (Kademe-2 sonrası karar, Recep onayı 2026-08-12)
-- Gerekçe: confidence=missing (çoğunlukla fiyat eksikliği) taslağa eşlenmişti; "Teklif Alın"
-- modeli fiyatsız ürünü karşıladığı için taslakta tutmanın gerekçesi kalmadı.
-- Kapsam: yalnız Kademe-2 yüklemesinin draft satırları (deleted_at IS NULL guard'lı).

begin;

update public.products
   set status = 'active'
 where status = 'draft'
   and deleted_at is null;

-- Doğrulama guard'ı: draft kalmamalı, aktif sayısı 374 olmalı.
do $$
declare
  v_draft int;
  v_active int;
begin
  select count(*) into v_draft from public.products where status = 'draft';
  select count(*) into v_active from public.products where status = 'active' and deleted_at is null;
  if v_draft <> 0 then
    raise exception 'Aktivasyon eksik: % draft kaldi', v_draft;
  end if;
  if v_active < 374 then
    raise exception 'Beklenmedik aktif sayisi: % (>=374 bekleniyordu)', v_active;
  end if;
end $$;

commit;
