-- W2a — Fiyat motoru: product_prices cache sözleşmesi + R5 segment RLS (T001-VH)
-- Plan: docs/plans/fiyat-motoru-plan-2026-08-13.md §W2 · Cetvel: docs/standards/pricing-standard.md §10
-- (1) Cache kolonları: motorun materialize çıktısı NET kanonik + gross + para birimi + is_derived.
-- (2) R5: bugünkü select politikaları is_active olan HER satırı anon'a okutuyor → seed sonrası
--     bayi/kurumsal fiyat sızardı. Segment-aware select: anon+individual yalnız public liste satırı,
--     bayi/kurumsal kendi listesini, admin hepsini görür. Segment kaynağı = JWT app_metadata
--     (CLAUDE.md §12: asla kullanıcı-düzenleyebilir metadata / profil-rolü değil).
-- Veri yazmaz; product_prices halen boş (seed = W4, ayrı onaylı).

begin;

-- === 1. Cache kolonları (additive) ===
alter table public.product_prices
  add column if not exists currency char(3) not null default 'TRY',
  add column if not exists net_price numeric,
  add column if not exists gross_price numeric,
  add column if not exists is_derived boolean not null default true;

comment on column public.product_prices.net_price is
  'Motor çıktısı KDV-hariç fiyat (kanonik; pricing-standard §5). base/sale_price legacy alanlardır.';
comment on column public.product_prices.gross_price is 'KDV-dahil gösterim fiyatı (net × (1+KDV)).';
comment on column public.product_prices.is_derived is
  'true = pricing_rule motorundan materialize edildi (cache; elle düzenleme yerine kural değiştir).';

-- === 2. Segment yardımcı fonksiyonu (JWT app_metadata → price_lists.user_type) ===
-- Claim henüz atanmamış kullanıcı/anon → 'individual' (güvenli varsayılan: public fiyat).
-- Bayi/kurumsal ataması admin tarafından app_metadata.price_segment ile yapılır (R1/bayi fazı).
create or replace function public.jwt_price_segment()
returns text
language sql
stable
as $$
  select coalesce(
    nullif(coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb
      -> 'app_metadata' ->> 'price_segment', ''),
    'individual'
  )
$$;

-- === 3. R5 segment RLS: select politikalarını segment-aware yenile ===
drop policy if exists product_prices_select_anon on public.product_prices;
create policy product_prices_select_anon
  on public.product_prices
  for select
  to anon
  using (
    tenant_id = (select public.jwt_tenant_id())
    and is_active = true
    and (
      price_list_id is null
      or price_list_id in (select pl.id from public.price_lists pl where pl.user_type = 'individual')
    )
  );

drop policy if exists product_prices_select_authenticated on public.product_prices;
create policy product_prices_select_authenticated
  on public.product_prices
  for select
  to authenticated
  using (
    tenant_id = (select public.jwt_tenant_id())
    and (
      (select public.is_user_admin((select auth.uid())))
      or (
        is_active = true
        and (
          price_list_id is null
          or price_list_id in (
            select pl.id from public.price_lists pl
            where pl.user_type = 'individual'
               or pl.user_type = (select public.jwt_price_segment())
          )
        )
      )
    )
  );

-- === Guard ===
do $$
declare n int;
begin
  select count(*) into n from information_schema.columns
    where table_schema = 'public' and table_name = 'product_prices'
      and column_name in ('currency', 'net_price', 'gross_price', 'is_derived');
  if n <> 4 then
    raise exception 'W2 guard: product_prices cache kolonları eksik (%/4)', n;
  end if;
  if not exists (select 1 from pg_proc p join pg_namespace ns on ns.oid = p.pronamespace
                 where ns.nspname = 'public' and p.proname = 'jwt_price_segment') then
    raise exception 'W2 guard: jwt_price_segment() yok';
  end if;
  -- R5: anon select politikası artık koşulsuz is_active olamaz — price_list kısıtı içermeli
  if exists (select 1 from pg_policies
             where schemaname = 'public' and tablename = 'product_prices'
               and policyname = 'product_prices_select_anon'
               and qual not like '%price_list_id%') then
    raise exception 'W2 guard: anon select politikası segment kısıtı içermiyor (R5)';
  end if;
  if exists (select 1 from information_schema.columns
             where table_schema = 'public' and table_name = 'product_prices'
               and data_type in ('real', 'double precision')) then
    raise exception 'W2 guard: product_prices''ta float kolon var (INV-PRICE-4)';
  end if;
end $$;

commit;
