-- REC-397 — 10 urunu vitrinden GECICI indir (status='archived'); silinmez, geri alinir.
-- Karar: Recep 31 Ekim (OPS penceresinde), secenek B + A. Mekanizma: products.status = 'archived'
-- (emsal: SEA-61102010, 19 Ekim). Yeni alan / migration YOK.
-- CANLI YAZIM: OPS koşar. Her blok AYRI calistirilir. Once 1 (kuru kosu), sonra 2 (yaz), sonra 4 (olc).
-- Geri alma: 3.

-- ───────── 1) KURU KOSU (yazmaz): 10 satir beklenir, hepsi active ─────────
select sku, status as eski_deger, 'archived' as yeni_deger, updated_at
from public.products
where deleted_at is null
  and sku in ('VRT-16107','VRT-16108','VRT-16109','VRT-16153','VRT-16155','VRT-16156','VRT-16157',
              'VRT-40903','VRT-41219','VRT-41459')
order by sku;

-- ───────── 2) YAZ (tek islem; 10 satir degilse RAISE ile geri doner) ─────────
do $$
declare v_adet int;
begin
  update public.products
     set status = 'archived'
   where deleted_at is null
     and status = 'active'
     and sku in ('VRT-16107','VRT-16108','VRT-16109','VRT-16153','VRT-16155','VRT-16156','VRT-16157',
                 'VRT-40903','VRT-41219','VRT-41459');
  get diagnostics v_adet = row_count;
  if v_adet <> 10 then
    raise exception 'REC-397: beklenen 10 satir, guncellenen %', v_adet;
  end if;
end $$;

-- ───────── 3) GERI ALMA (arsivlenenleri yeniden yayina al; yalniz bu 10 SKU) ─────────
do $$
declare v_adet int;
begin
  update public.products
     set status = 'active'
   where deleted_at is null
     and status = 'archived'
     and sku in ('VRT-16107','VRT-16108','VRT-16109','VRT-16153','VRT-16155','VRT-16156','VRT-16157',
                 'VRT-40903','VRT-41219','VRT-41459');
  get diagnostics v_adet = row_count;
  if v_adet <> 10 then
    raise exception 'REC-397 geri alma: beklenen 10 satir, guncellenen %', v_adet;
  end if;
end $$;

-- ───────── 4) YAZIM SONRASI OLCUM ─────────
select f.slug,
       count(*) filter (where p.status = 'active')   as aktif,
       count(*) filter (where p.status = 'archived') as arsiv
from public.product_families f
join public.products p on p.family_id = f.id and p.deleted_at is null
where f.slug in ('vortice-vort-commercial-in-line-yuvarlak-kanal-fanlari','vortice-aksiyel-endustriyel-fanlar')
group by f.slug;
-- Beklenen: yuvarlak-kanal-fanlari aktif 0 / arsiv 7; aksiyel-endustriyel aktif 13 / arsiv 3.
