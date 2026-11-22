-- ALT-123 AŞAMA B GERİ ALMA — authenticated'a products tablo düzeyi SELECT geri verilir,
-- maliyet_yenile(jsonb) kilit öncesi tanıma (okuma products'tan) döner.
-- OTOMATİK UYGULANMAZ (supabase/migrations dışında). Elle, Recep sözüyle koşulur.
--
-- Ne zaman: kilitten sonra oturumlu bir istek products'ta 42501 (permission denied) veriyorsa ve hızlı onarım
-- `grant select (<kolon>) on public.products to authenticated` ile yapılamıyorsa. Bu betik 8 maliyet/tedarik kolonunu
-- giriş yapmış HER üyeye YENİDEN AÇAR (ALT-123 zararı geri gelir) — geçici olmalı; önce hedefli kolon grant'i denenir.
-- Sıra: önce bu betik, sonra (gerekirse) okuyucuları geri alan kod PR'ı. maliyet_yenile eski gövdeyle products'tan okur,
-- yani tablo düzeyi SELECT geri gelmeden eski gövde çalışmaz: iki adım AYNI işlemdedir.

begin;

set lock_timeout = '5s';
set statement_timeout = '30s';

-- (1) Tablo düzeyi SELECT geri (kolon düzeyi grant'ler zaten tablo yetkisinin alt kümesidir; çakışma zararsız).
grant select on public.products to authenticated;

-- (2) maliyet_yenile: kilit öncesi gövde (20260929143000_maliyet_yenileme_gunlugu.sql) — okuma products'tan.
create or replace function public.maliyet_yenile(p_satirlar jsonb)
returns integer
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_tavan     constant int := 5000;
  v_gelen     int;
  v_beklenen  int;
  v_say       int;
begin
  if not public.is_admin_claim() then
    raise exception 'maliyet_yenile: yalniz yonetici (JWT claim)' using errcode = '42501';
  end if;

  if p_satirlar is null or jsonb_typeof(p_satirlar) <> 'array' then
    raise exception 'maliyet_yenile: p_satirlar bir JSON dizisi olmali' using errcode = '22023';
  end if;

  v_gelen := jsonb_array_length(p_satirlar);
  if v_gelen > v_tavan then
    raise exception 'maliyet_yenile: parti siniri asildi (% > %); yarim yenileme yapilmaz', v_gelen, v_tavan
      using errcode = '54000';
  end if;

  if exists (
    select 1
      from jsonb_to_recordset(p_satirlar)
             as s(id uuid, cost_in_base numeric, purchase_rate_to_base numeric, purchase_price numeric, purchase_currency text)
     where s.id is null
        or s.cost_in_base is null or s.cost_in_base < 0
        or s.cost_in_base = 'NaN'::numeric or s.cost_in_base = 'Infinity'::numeric
        or s.purchase_rate_to_base is null or s.purchase_rate_to_base <= 0
        or s.purchase_rate_to_base = 'NaN'::numeric or s.purchase_rate_to_base = 'Infinity'::numeric
        or s.purchase_price is null or s.purchase_currency is null
  ) then
    raise exception 'maliyet_yenile: eksik/gecersiz eleman (id, cost_in_base>=0, purchase_rate_to_base>0, purchase_price, purchase_currency zorunlu; NaN/Infinity yasak)'
      using errcode = '22023';
  end if;

  if (select count(distinct s.id)
        from jsonb_to_recordset(p_satirlar) as s(id uuid)) <> v_gelen then
    raise exception 'maliyet_yenile: ayni urun id birden fazla kez gonderildi (tum parti reddedildi)'
      using errcode = '22023';
  end if;

  if exists (
    select 1
      from jsonb_to_recordset(p_satirlar) as s(id uuid)
     where not exists (
       select 1 from public.products p where p.id = s.id and p.tenant_id = public.jwt_tenant_id()
     )
  ) then
    raise exception 'maliyet_yenile: tenant disi ya da olmayan urun id (tum parti reddedildi)'
      using errcode = '22023';
  end if;

  select count(*) into v_beklenen
    from jsonb_to_recordset(p_satirlar)
           as s(id uuid, cost_in_base numeric, purchase_rate_to_base numeric, purchase_price numeric, purchase_currency text)
    join public.products p on p.id = s.id and p.tenant_id = public.jwt_tenant_id()
   where p.cost_in_base is distinct from round(s.cost_in_base, 4)
      or p.purchase_rate_to_base is distinct from round(s.purchase_rate_to_base, 6);

  update public.products p
     set cost_in_base = round(s.cost_in_base, 4),
         purchase_rate_to_base = round(s.purchase_rate_to_base, 6)
    from jsonb_to_recordset(p_satirlar)
           as s(id uuid, cost_in_base numeric, purchase_rate_to_base numeric, purchase_price numeric, purchase_currency text)
   where p.id = s.id
     and p.tenant_id = public.jwt_tenant_id()
     and p.purchase_price = s.purchase_price
     and p.purchase_currency::text = s.purchase_currency
     and (p.cost_in_base is distinct from round(s.cost_in_base, 4)
          or p.purchase_rate_to_base is distinct from round(s.purchase_rate_to_base, 6));
  get diagnostics v_say = row_count;

  if v_say <> v_beklenen then
    raise exception 'maliyet_yenile: % satirdan % tanesi yazilabildi (yetki degisti ya da okumadan sonra urun fiyati degisti); tum parti geri alindi',
      v_beklenen, v_say using errcode = '40001';
  end if;

  return v_say;
end;
$$;

-- (3) Sınama: authenticated rolü maliyet kolonunu yeniden okuyabiliyor mu (geri alma gerçekten oldu mu).
do $sinama$
begin
  if not has_column_privilege('authenticated', 'public.products', 'purchase_price', 'select') then
    raise exception 'GERİ ALMA BAŞARISIZ: authenticated hâlâ purchase_price okuyamıyor';
  end if;
end
$sinama$;

notify pgrst, 'reload schema';

commit;
