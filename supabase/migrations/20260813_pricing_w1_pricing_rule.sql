-- W1 — Fiyat motoru: marj kuralı motoru tablosu (T001-VH)
-- Plan: docs/plans/fiyat-motoru-plan-2026-08-13.md §W1 · Cetvel: docs/standards/pricing-standard.md §10-§11
-- pricing_rule = "en-özel-kazanır" merdiveni (scope: 0 varyant · 1 ürün · 2 MARKA · 3 kategori · 4 global)
-- + SAP stop-at-first-hit (is_exclusive). Fiyat TÜRETİLİR: kurallar SSOT, product_prices sadece cache.
-- Panel yüzde/katsayı/sabit girer; kanonik saklama TEK biçim: margin_pct (katsayı k → (k−1)×100).

begin;

create table if not exists public.pricing_rule (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null default public.jwt_tenant_id() references public.tenants(id) on delete restrict,
  price_book_id uuid null references public.price_lists(id) on delete cascade, -- NULL = base kitap
  scope smallint not null check (scope between 0 and 4),
  product_id uuid null references public.products(id) on delete cascade,
  brand_id uuid null references public.brands(id) on delete cascade,
  category_id uuid null references public.categories(id) on delete cascade,
  method text not null check (method in ('cost_plus', 'fixed', 'percent_off_list')),
  base text not null default 'cost' check (base in ('cost', 'list_price', 'parent_book')),
  margin_pct numeric,
  surcharge numeric not null default 0,
  fixed_price numeric,
  vat_rate_pct numeric not null default 20,
  price_is_vat_inclusive boolean not null default false,
  min_margin_abs numeric null,
  max_margin_abs numeric null,
  round_to numeric null,
  charm_ending numeric null,
  min_quantity numeric not null default 1 check (min_quantity >= 0),
  priority int not null default 0,
  is_exclusive boolean not null default true,
  currency char(3) null, -- NULL = tüm para birimleri
  valid_from date null,
  valid_to date null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid null,
  -- method ↔ zorunlu alan tutarlılığı
  constraint pricing_rule_method_fields check (
    (method <> 'cost_plus' or margin_pct is not null) and
    (method <> 'fixed' or fixed_price is not null)
  ),
  -- scope ↔ hedef tutarlılığı (0 varyant/1 ürün → product_id; 2 marka → brand_id; 3 kategori → category_id; 4 global → hepsi NULL)
  constraint pricing_rule_scope_target check (
    (scope in (0, 1) and product_id is not null and brand_id is null and category_id is null) or
    (scope = 2 and brand_id is not null and product_id is null and category_id is null) or
    (scope = 3 and category_id is not null and product_id is null and brand_id is null) or
    (scope = 4 and product_id is null and brand_id is null and category_id is null)
  )
);

comment on table public.pricing_rule is
  'Marj kural motoru (pricing-standard §10). Çözüm sırası: scope ASC, kitap-özgüllüğü, min_quantity DESC, priority DESC (§11); ilk exclusive eşleşme kazanır. Panel yüzde/katsayı/sabit girer; kanonik = margin_pct.';

create index if not exists pricing_rule_tenant_scope_idx
  on public.pricing_rule (tenant_id, scope, priority desc);
create index if not exists pricing_rule_product_idx on public.pricing_rule (product_id) where product_id is not null;
create index if not exists pricing_rule_brand_idx on public.pricing_rule (brand_id) where brand_id is not null;
create index if not exists pricing_rule_category_idx on public.pricing_rule (category_id) where category_id is not null;

alter table public.pricing_rule enable row level security;

-- Marj/kâr bilgisi HASSAS: okuma-yazma yalnız admin (site_settings kanıtlı deseni);
-- motor/materialize sunucu tarafında service_role ile çalışır (RLS-bypass).
-- Storefront kuralları GÖRMEZ — yalnız türetilmiş product_prices cache'ini okur.

drop policy if exists pricing_rule_admin_select on public.pricing_rule;
create policy pricing_rule_admin_select
  on public.pricing_rule
  for select
  to authenticated
  using (
    tenant_id = (select public.jwt_tenant_id())
    and exists (
      select 1 from public.user_profiles up
      where up.id = (select auth.uid())
        and up.role::text = any (array['admin', 'superadmin', 'moderator'])
    )
  );

drop policy if exists pricing_rule_admin_insert on public.pricing_rule;
create policy pricing_rule_admin_insert
  on public.pricing_rule
  for insert
  to authenticated
  with check (
    tenant_id = (select public.jwt_tenant_id())
    and exists (
      select 1 from public.user_profiles up
      where up.id = (select auth.uid())
        and up.role::text = any (array['admin', 'superadmin', 'moderator'])
    )
  );

drop policy if exists pricing_rule_admin_update on public.pricing_rule;
create policy pricing_rule_admin_update
  on public.pricing_rule
  for update
  to authenticated
  using (
    tenant_id = (select public.jwt_tenant_id())
    and exists (
      select 1 from public.user_profiles up
      where up.id = (select auth.uid())
        and up.role::text = any (array['admin', 'superadmin', 'moderator'])
    )
  )
  with check (
    tenant_id = (select public.jwt_tenant_id())
    and exists (
      select 1 from public.user_profiles up
      where up.id = (select auth.uid())
        and up.role::text = any (array['admin', 'superadmin', 'moderator'])
    )
  );

drop policy if exists pricing_rule_admin_delete on public.pricing_rule;
create policy pricing_rule_admin_delete
  on public.pricing_rule
  for delete
  to authenticated
  using (
    tenant_id = (select public.jwt_tenant_id())
    and exists (
      select 1 from public.user_profiles up
      where up.id = (select auth.uid())
        and up.role::text = any (array['admin', 'superadmin', 'moderator'])
    )
  );

-- === Guard ===
do $$
begin
  if not exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'pricing_rule') then
    raise exception 'W1 guard: pricing_rule tablosu yok';
  end if;
  if (select count(*) from pg_policies where schemaname = 'public' and tablename = 'pricing_rule') <> 4 then
    raise exception 'W1 guard: pricing_rule policy sayısı 4 değil';
  end if;
  if exists (select 1 from information_schema.columns
             where table_schema = 'public' and table_name = 'pricing_rule'
               and data_type in ('real', 'double precision')) then
    raise exception 'W1 guard: pricing_rule''da float kolon var (INV-PRICE-4)';
  end if;
end $$;

commit;
