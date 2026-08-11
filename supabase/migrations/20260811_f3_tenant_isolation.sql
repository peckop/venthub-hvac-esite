-- F3 — Tenant izolasyonu (plan: docs/plans/kademe2-clean-rebuild-2026-08-11.md, PS Wave 3)
-- products/brands/product_families tenant_id'yi F2'de aldı; bu dalga kalan katalog tablolarını
-- tenant'lar, public-read politikalarını tenant-scope'lar, politikasız RLS tablolarını kapatır,
-- Storage yazma yolunu tenant-klasörüne kilitler. (PS-001/020/021/024/032)

begin;

-- === 1. tenant_id kolonları (kalan katalog tabloları) ===
alter table public.categories
  add column if not exists tenant_id uuid not null default public.jwt_tenant_id() references public.tenants(id) on delete restrict;
alter table public.product_images
  add column if not exists tenant_id uuid not null default public.jwt_tenant_id() references public.tenants(id) on delete restrict;
alter table public.product_authorities
  add column if not exists tenant_id uuid not null default public.jwt_tenant_id() references public.tenants(id) on delete restrict;

create index if not exists categories_tenant_id_idx on public.categories (tenant_id);
create index if not exists product_images_tenant_id_idx on public.product_images (tenant_id);
create index if not exists product_authorities_tenant_id_idx on public.product_authorities (tenant_id);

-- === 2. Public-read politikalarını tenant-scope'la (InitPlan scalar subquery şablonu, PS-020) ===
alter policy prod_public_read_opt on public.products
  using (tenant_id = (select public.jwt_tenant_id()));
alter policy cat_public_read_opt on public.categories
  using (tenant_id = (select public.jwt_tenant_id()));
alter policy product_images_select_all on public.product_images
  using (tenant_id = (select public.jwt_tenant_id()));

-- === 3. RLS açık ama politikasız 6 tablo: erişim service-role işidir; açıkça belgele (PS-021) ===
do $$
declare t text;
begin
  foreach t in array array['category_mapping_rules','client_errors','order_email_events',
                           'payment_transactions','rate_limits','shipping_idempotency'] loop
    execute format('drop policy if exists service_role_only on public.%I', t);
    execute format('create policy service_role_only on public.%I for all to service_role using (true) with check (true)', t);
  end loop;
end $$;

-- === 4. Storage: product-images yazmaları tenant klasörüne kilitli (path = <tenant_id>/...) ===
-- (public bucket okuması değişmez; yazma yalnız admin + kendi tenant klasörü. service_role RLS-bypass.)
drop policy if exists product_images_tenant_write on storage.objects;
create policy product_images_tenant_write on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] = (select public.jwt_tenant_id())::text
    and exists (
      select 1 from public.user_profiles up
      where up.id = (select auth.uid()) and up.role in ('admin', 'super_admin')
    )
  );

drop policy if exists product_images_tenant_update on storage.objects;
create policy product_images_tenant_update on storage.objects
  for update to authenticated
  using (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] = (select public.jwt_tenant_id())::text
    and exists (
      select 1 from public.user_profiles up
      where up.id = (select auth.uid()) and up.role in ('admin', 'super_admin')
    )
  );

drop policy if exists product_images_tenant_delete on storage.objects;
create policy product_images_tenant_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] = (select public.jwt_tenant_id())::text
    and exists (
      select 1 from public.user_profiles up
      where up.id = (select auth.uid()) and up.role in ('admin', 'super_admin')
    )
  );

-- === Doğrulama guard'ları ===
do $$
declare n int;
begin
  select count(*) into n from information_schema.columns
  where table_schema = 'public' and column_name = 'tenant_id'
    and table_name in ('categories','product_images','product_authorities','products','brands','product_families');
  if n <> 6 then
    raise exception 'F3 guard: tenant_id kolon sayısı 6 değil (%)', n;
  end if;

  select count(*) into n from pg_policy pol join pg_class c on c.oid = pol.polrelid
  where pol.polname = 'service_role_only'
    and c.relname in ('category_mapping_rules','client_errors','order_email_events',
                      'payment_transactions','rate_limits','shipping_idempotency');
  if n <> 6 then
    raise exception 'F3 guard: service_role_only politika sayısı 6 değil (%)', n;
  end if;
end $$;

commit;
