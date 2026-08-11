-- F2 — Split-Model şema (plan: docs/plans/kademe2-clean-rebuild-2026-08-11.md, PS Wave 2)
-- ADDITIVE dalga: canlı vitrini kırmamak için mevcut kolonlar DÜŞÜRÜLMEZ (fosil kolon DROP'ları
-- F5 kod dalgasıyla aynı merge'e gider). Veri boş olduğundan taşıma adımı yok.
-- Kapsam: brands + product_families (tenant-hazır) · products varyant kolonları ·
-- CASCADE→RESTRICT (PS-005/037) · updated_at trigger tekilleştirme (PS-002/025) ·
-- kategori level onarımı + otomatik level guard'ı (PS-036) · 4 yeni kategori (karanlık, PS §6.1).

begin;

-- === 1. Ortak updated_at trigger fonksiyonu ===
create or replace function public.tg_set_updated_at()
returns trigger
language plpgsql
set search_path to 'pg_catalog', 'public'
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- === 2. brands (PS-030: marka serbest metin yasak) ===
create table if not exists public.brands (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null default public.jwt_tenant_id() references public.tenants(id) on delete restrict,
  name text not null,
  slug text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, slug)
);
create index if not exists brands_tenant_id_idx on public.brands (tenant_id);
alter table public.brands enable row level security;

drop policy if exists brands_tenant_select on public.brands;
create policy brands_tenant_select on public.brands
  for select using (tenant_id = (select public.jwt_tenant_id()));

drop policy if exists brands_admin_write on public.brands;
create policy brands_admin_write on public.brands
  for all to authenticated
  using (exists (
    select 1 from public.user_profiles up
    where up.id = (select auth.uid()) and up.role in ('admin', 'super_admin')
  ))
  with check (exists (
    select 1 from public.user_profiles up
    where up.id = (select auth.uid()) and up.role in ('admin', 'super_admin')
  ));

drop trigger if exists brands_set_updated_at on public.brands;
create trigger brands_set_updated_at before update on public.brands
  for each row execute function public.tg_set_updated_at();

-- === 3. product_families (parent — Aksiyom 1 Split-Model) ===
create table if not exists public.product_families (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null default public.jwt_tenant_id() references public.tenants(id) on delete restrict,
  name text not null,
  slug text not null,
  brand_id uuid not null references public.brands(id) on delete restrict,
  -- i18n: {"tr": "...", "en": "..."} (Aksiyom 4 — ilişkisel çeviri tablosu yasak)
  description jsonb not null default '{}'::jsonb,
  is_description_manual boolean not null default false,  -- PS-006 elle-kilit
  category_id uuid references public.categories(id) on delete restrict,
  subcategory_id uuid references public.categories(id) on delete restrict,
  meta_title jsonb,
  meta_description jsonb,
  series_code text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (tenant_id, slug)
);
create index if not exists product_families_tenant_id_idx on public.product_families (tenant_id);
create index if not exists product_families_brand_id_idx on public.product_families (brand_id);
create index if not exists product_families_category_idx on public.product_families (category_id, subcategory_id);
alter table public.product_families enable row level security;

drop policy if exists product_families_tenant_select on public.product_families;
create policy product_families_tenant_select on public.product_families
  for select using (tenant_id = (select public.jwt_tenant_id()) and deleted_at is null);

drop policy if exists product_families_admin_write on public.product_families;
create policy product_families_admin_write on public.product_families
  for all to authenticated
  using (exists (
    select 1 from public.user_profiles up
    where up.id = (select auth.uid()) and up.role in ('admin', 'super_admin')
  ))
  with check (exists (
    select 1 from public.user_profiles up
    where up.id = (select auth.uid()) and up.role in ('admin', 'super_admin')
  ));

drop trigger if exists product_families_set_updated_at on public.product_families;
create trigger product_families_set_updated_at before update on public.product_families
  for each row execute function public.tg_set_updated_at();

-- === 4. products → varyant kolonları (additive; tablo boş) ===
alter table public.products
  add column if not exists family_id uuid references public.product_families(id) on delete restrict,
  add column if not exists tenant_id uuid not null default public.jwt_tenant_id() references public.tenants(id) on delete restrict,
  add column if not exists purchase_currency varchar(3) not null default 'TRY',  -- PS-010
  add column if not exists barcode text,
  add column if not exists tax_rate numeric(5,2) not null default 20.00,
  add column if not exists is_taxable boolean not null default true,
  add column if not exists weight_kg numeric(10,3),
  add column if not exists width_mm numeric(10,1),
  add column if not exists height_mm numeric(10,1),
  add column if not exists depth_mm numeric(10,1),
  add column if not exists deleted_at timestamptz,  -- PS-012 soft delete
  -- Varyant-düzeyi i18n açıklama: CSV'lerde açıklamalar model-başına farklı (punto-evo: 27 satır
  -- 27 distinct). family.description = seri fallback'i; PDP varyant metnini öncelikler (Aksiyom 4).
  add column if not exists description_i18n jsonb;

-- PS-011: cost hassasiyeti — NOT: type numeric(12,4)'e daraltma bir view bağımlılığı yüzünden
-- ("cannot alter type of a column used by a view") uygulanmaz; sınırsız numeric 12,4 değerleri
-- tam saklar, davranışsal fark yok. Negatif maliyet CHECK ile yasak (PS-008 sınıfı).
alter table public.products
  alter column purchase_price set default 0,
  alter column purchase_price set not null;
alter table public.products drop constraint if exists products_purchase_price_nonneg;
alter table public.products add constraint products_purchase_price_nonneg
  check (purchase_price >= 0);

-- PS-017: modern status seti (tablo boş — güvenli değişim)
alter table public.products drop constraint if exists products_status_check;
alter table public.products add constraint products_status_check
  check (status = any (array['active'::text, 'draft'::text, 'archived'::text]));
alter table public.products alter column status set default 'draft';

-- PS-035: standart SKU formatı
alter table public.products drop constraint if exists products_sku_format_check;
alter table public.products add constraint products_sku_format_check
  check (sku ~ '^[A-Z0-9-]+$');

create index if not exists products_family_id_idx on public.products (family_id);
create index if not exists products_tenant_id_idx on public.products (tenant_id);
create index if not exists products_technical_specs_gin on public.products using gin (technical_specs jsonb_path_ops);

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at before update on public.products
  for each row execute function public.tg_set_updated_at();

-- === 5. CASCADE → RESTRICT (PS-005 denetim izi, PS-037 katalog güvenliği) ===
alter table public.inventory_movements drop constraint inventory_movements_product_id_fkey;
alter table public.inventory_movements add constraint inventory_movements_product_id_fkey
  foreign key (product_id) references public.products(id) on delete restrict;

alter table public.categories drop constraint categories_parent_id_fkey;
alter table public.categories add constraint categories_parent_id_fkey
  foreign key (parent_id) references public.categories(id) on delete restrict;

-- === 6. Mükerrer updated_at trigger tekilleştirme (PS-025) ===
drop trigger if exists venthub_orders_updated_at on public.venthub_orders;
drop trigger if exists venthub_order_items_updated_at on public.venthub_order_items;

-- === 7. Kategori level onarımı + otomatik guard (PS-036) ===
update public.categories set level = 1
where slug in ('ex-proof-atex-fans', 'shelter-ventilation') and parent_id is not null;

create or replace function public.tg_categories_set_level()
returns trigger
language plpgsql
set search_path to 'pg_catalog', 'public'
as $$
begin
  if new.parent_id is null then
    new.level := 0;
  else
    select c.level + 1 into new.level from public.categories c where c.id = new.parent_id;
    if new.level is null then
      raise exception 'categories level guard: parent % bulunamadı', new.parent_id;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists categories_set_level on public.categories;
create trigger categories_set_level before insert or update of parent_id on public.categories
  for each row execute function public.tg_categories_set_level();

-- === 8. Yeni kategoriler (taksonomi cetveli §6.1) — KARANLIK açılır (is_active=false):
--     sözlük anahtarları + vitrin F5 kod dalgasıyla gelince aktifleştirilecek. ===
insert into public.categories (name, slug, parent_id, is_active, translation_key, metadata)
select v.name, v.slug, p.id, false, v.tkey,
       jsonb_build_object('slug', jsonb_build_object('tr', v.tr_slug, 'en', v.slug))
from (values
  ('Asit Dayanımlı Fanlar',        'acid-resistant-fans',   'industrial-ventilation', 'sub.acid-fans',       'asit-dayanikli-fanlar'),
  ('Frekans Konvertörleri',        'frequency-converters',  'accessories-components', 'sub.freq-converters', 'frekans-konvertorleri'),
  ('Elektrikli Kanal Isıtıcıları', 'electric-duct-heaters', 'electric-heating',       'sub.duct-heaters',    'elektrikli-kanal-isiticilari')
) as v(name, slug, parent_slug, tkey, tr_slug)
join public.categories p on p.slug = v.parent_slug and p.parent_id is null
where not exists (select 1 from public.categories c where c.slug = v.slug);

-- Üst-seviye 12. dal: parking-jet-fan (görünen TR slug, mevcut commercial-ventilation/jet-fans
-- alt dalının 'otopark-jet-fanlari' TR slug'ıyla ÇAKIŞMAMASI için 'otopark-jet-fan' seçildi;
-- jet-fans → parking-jet-fan birleştirmesi ileri tarihli ayrı taksonomi işi).
insert into public.categories (name, slug, parent_id, is_active, translation_key, metadata)
select 'Otopark Jet Fanları', 'parking-jet-fan', null, false, 'parking-jet',
       jsonb_build_object('slug', jsonb_build_object('tr', 'otopark-jet-fan', 'en', 'parking-jet-fan'))
where not exists (select 1 from public.categories c where c.slug = 'parking-jet-fan');

-- === Doğrulama guard'ları ===
do $$
declare n int;
begin
  select count(*) into n from public.categories
  where slug in ('acid-resistant-fans','frequency-converters','electric-duct-heaters','parking-jet-fan');
  if n <> 4 then
    raise exception 'F2 guard: yeni kategori sayısı 4 değil (%)', n;
  end if;

  select count(*) into n from public.categories
  where slug in ('acid-resistant-fans','frequency-converters','electric-duct-heaters') and level <> 1;
  if n <> 0 then
    raise exception 'F2 guard: yeni alt kategorilerde level != 1';
  end if;

  select count(*) into n
  from information_schema.referential_constraints rc
  join information_schema.table_constraints tc on tc.constraint_name = rc.constraint_name
  where tc.constraint_name in ('inventory_movements_product_id_fkey','categories_parent_id_fkey')
    and rc.delete_rule <> 'RESTRICT';
  if n <> 0 then
    raise exception 'F2 guard: RESTRICT dönüşümü eksik';
  end if;
end $$;

commit;
