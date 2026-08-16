-- W5 — Fiyat kilidi (dondurma) politika katmani (T001-VH)
-- Cetvel: docs/standards/pricing-standard.md §8.2 (fiyat kilidi) + §8.3 (politika katmani)
--
-- NIYE. "Kur oynasa da fiyat sabit kalsin" Recep'in BIRINCI SINIF gereksinimi (2026-08-14),
-- gosterim numarasi degil. Bugun boyle bir katman YOK: TCMB kuru her degistiginde
-- `refreshCostInBase` tum aktif urunlerin `cost_in_base`'ini tazeliyor, materialize de
-- fiyatlari yeniden hesapliyor. Yani hicbir fiyat sabit kalamiyor.
--
-- KURAL != POLITIKA (cetvel §8.3). `pricing_rule` fiyatin NASIL HESAPLANACAGINI tasir.
-- "Bu marka kur degisiminden etkilenmesin" bir hesap yontemi degil, bir AYARDIR. Ayni
-- tabloya tikistirmak kural motorunun anlamini bozardi; bu yuzden ayni ozgulluk
-- merdivenini kullanan IKINCI bir katman.
--
-- MERDIVEN AYNIDIR, YENIDEN ICAT EDILMEZ (cetvel §8.3): scope 0 varyant · 1 urun ·
-- 2 marka · 3 kategori · 4 global; en ozel kazanir. Kolon adlari `pricing_rule` ile
-- birebir ayni tutuldu ki cozucu ayni eslestirme fonksiyonunu KULLANABILSIN — ikinci bir
-- oncelik mantigi yazmak, iki mantigin bir gun ayrisacagi anlamina gelir.
--
-- KAPSAM KARARI — bilerek DAR. Cetvel §8.3 tabloyu
-- `pricing_policy(scope, target_id, display_currency, fx_lock, min_margin_pct, ...)`
-- diye tarif ediyor. Bu migration YALNIZCA `fx_lock`'u aciyor, cunku onu OKUYAN kod bu
-- PR'da yaziliyor. `display_currency` ve `min_margin_pct` kolonlari BILEREK YOK: onlari
-- dolduran/okuyan tuketici henuz yok ve bu depoda tam olarak o hata tekrarliyor —
-- `venthub_order_items` snapshot kolonlari bir yil bos durdu (W2b-2), cunku kolon
-- eklemek ile sozlesme kurmak ayni sey sanildi. Kolonlar tuketicileriyle birlikte gelir.

begin;

create table if not exists public.pricing_policy (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null default public.jwt_tenant_id() references public.tenants(id) on delete restrict,
  scope smallint not null check (scope between 0 and 4),
  product_id uuid null references public.products(id) on delete cascade,
  brand_id uuid null references public.brands(id) on delete cascade,
  category_id uuid null references public.categories(id) on delete cascade,

  -- Kilidin kendisi.
  fx_lock boolean not null default false,

  -- Kilit kunyesi (cetvel §8.2: "kimin, ne zaman, hangi kurdan"). Kilit bir KARARDIR;
  -- kararin sahibi ve dayandigi kur kaydedilmezse "bu fiyat neden guncellenmedi"
  -- sorusunun cevabi kalmaz.
  fx_frozen_rate numeric null,
  frozen_at timestamptz not null default now(),
  frozen_by uuid null,
  note text null,

  is_active boolean not null default true,
  priority int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid null,

  -- scope ↔ hedef tutarliligi: `pricing_rule_scope_target` ile BIREBIR AYNI.
  constraint pricing_policy_scope_target check (
    (scope in (0, 1) and product_id is not null and brand_id is null and category_id is null) or
    (scope = 2 and brand_id is not null and product_id is null and category_id is null) or
    (scope = 3 and category_id is not null and product_id is null and brand_id is null) or
    (scope = 4 and product_id is null and brand_id is null and category_id is null)
  ),

  -- Kilit kunyesiz olamaz. Bu CHECK olmadan "fx_lock=true ama hangi kurdan donduruldugu
  -- belirsiz" bir satir mumkun olurdu ve kilidin denetlenebilirligi kaybolurdu.
  constraint pricing_policy_lock_provenance check (
    fx_lock = false or fx_frozen_rate is not null
  )
);

comment on table public.pricing_policy is
  'Fiyat politikasi katmani (pricing-standard §8.3). Kural DEGIL ayar: "bu kapsam kur degisiminden etkilenmesin". Merdiven pricing_rule ile birebir ayni (scope ASC, priority DESC; en ozel kazanir). v1: yalniz fx_lock; display_currency/min_margin_pct tuketicileriyle birlikte eklenir.';

create index if not exists pricing_policy_tenant_scope_idx
  on public.pricing_policy (tenant_id, scope, priority desc);
create index if not exists pricing_policy_product_idx on public.pricing_policy (product_id) where product_id is not null;
create index if not exists pricing_policy_brand_idx on public.pricing_policy (brand_id) where brand_id is not null;
create index if not exists pricing_policy_category_idx on public.pricing_policy (category_id) where category_id is not null;

alter table public.pricing_policy enable row level security;

-- RLS `pricing_rule` deseninin AYNISI: marj/kar bilgisi hassas, okuma-yazma yalniz admin.
-- Motor/materialize sunucu tarafinda service_role ile calisir (RLS-bypass). Vitrin bu
-- tabloyu GORMEZ — yalnizca turetilmis product_prices cache'ini okur.

drop policy if exists pricing_policy_admin_select on public.pricing_policy;
create policy pricing_policy_admin_select
  on public.pricing_policy
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

drop policy if exists pricing_policy_admin_insert on public.pricing_policy;
create policy pricing_policy_admin_insert
  on public.pricing_policy
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

drop policy if exists pricing_policy_admin_update on public.pricing_policy;
create policy pricing_policy_admin_update
  on public.pricing_policy
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

drop policy if exists pricing_policy_admin_delete on public.pricing_policy;
create policy pricing_policy_admin_delete
  on public.pricing_policy
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

commit;
