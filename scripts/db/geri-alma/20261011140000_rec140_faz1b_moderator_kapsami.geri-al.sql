-- REC-140 Faz 1b geri alma — 20261011140000_rec140_faz1b_moderator_kapsami.sql
-- 16 politikayı ESKİ gövdeyle (user_profiles.role ∈ {super_admin, admin, moderator}) yeniden kurar.
-- Kaynak: supabase/baselines/2026-10-10_public_schema.sql satır 8402-8420, 8539-8557, 8568-8586, 8792-8810.
-- Veri kaybı yok (yalnız politika). Geri aldıktan sonra karar 95 yeniden açılır: moderatör maliyet ve tedarik
-- tablolarını görür/yazar; önce OPS'a haber ver, çünkü rbac.ts'teki purchasing izni de eski hâline dönmelidir
-- (UI izni ⊆ DB izni, R6 testi).
-- ELLE, tek işlem.

begin;

set local lock_timeout = '5s';
set local statement_timeout = '60s';

-- pricing_rule
drop policy if exists pricing_rule_admin_select on public.pricing_rule;
create policy pricing_rule_admin_select on public.pricing_rule
  for select to authenticated
  using (tenant_id = (select public.jwt_tenant_id()) and exists (
    select 1 from public.user_profiles up
    where up.id = (select auth.uid()) and up.role::text = any (array['super_admin'::text, 'admin'::text, 'moderator'::text])));

drop policy if exists pricing_rule_admin_insert on public.pricing_rule;
create policy pricing_rule_admin_insert on public.pricing_rule
  for insert to authenticated
  with check (tenant_id = (select public.jwt_tenant_id()) and exists (
    select 1 from public.user_profiles up
    where up.id = (select auth.uid()) and up.role::text = any (array['super_admin'::text, 'admin'::text, 'moderator'::text])));

drop policy if exists pricing_rule_admin_update on public.pricing_rule;
create policy pricing_rule_admin_update on public.pricing_rule
  for update to authenticated
  using (tenant_id = (select public.jwt_tenant_id()) and exists (
    select 1 from public.user_profiles up
    where up.id = (select auth.uid()) and up.role::text = any (array['super_admin'::text, 'admin'::text, 'moderator'::text])))
  with check (tenant_id = (select public.jwt_tenant_id()) and exists (
    select 1 from public.user_profiles up
    where up.id = (select auth.uid()) and up.role::text = any (array['super_admin'::text, 'admin'::text, 'moderator'::text])));

drop policy if exists pricing_rule_admin_delete on public.pricing_rule;
create policy pricing_rule_admin_delete on public.pricing_rule
  for delete to authenticated
  using (tenant_id = (select public.jwt_tenant_id()) and exists (
    select 1 from public.user_profiles up
    where up.id = (select auth.uid()) and up.role::text = any (array['super_admin'::text, 'admin'::text, 'moderator'::text])));

-- purchase_orders
drop policy if exists purchase_orders_admin_select on public.purchase_orders;
create policy purchase_orders_admin_select on public.purchase_orders
  for select to authenticated
  using (tenant_id = (select public.jwt_tenant_id()) and exists (
    select 1 from public.user_profiles up
    where up.id = (select auth.uid()) and up.role::text = any (array['super_admin'::text, 'admin'::text, 'moderator'::text])));

drop policy if exists purchase_orders_admin_insert on public.purchase_orders;
create policy purchase_orders_admin_insert on public.purchase_orders
  for insert to authenticated
  with check (tenant_id = (select public.jwt_tenant_id()) and exists (
    select 1 from public.user_profiles up
    where up.id = (select auth.uid()) and up.role::text = any (array['super_admin'::text, 'admin'::text, 'moderator'::text])));

drop policy if exists purchase_orders_admin_update on public.purchase_orders;
create policy purchase_orders_admin_update on public.purchase_orders
  for update to authenticated
  using (tenant_id = (select public.jwt_tenant_id()) and exists (
    select 1 from public.user_profiles up
    where up.id = (select auth.uid()) and up.role::text = any (array['super_admin'::text, 'admin'::text, 'moderator'::text])))
  with check (tenant_id = (select public.jwt_tenant_id()) and exists (
    select 1 from public.user_profiles up
    where up.id = (select auth.uid()) and up.role::text = any (array['super_admin'::text, 'admin'::text, 'moderator'::text])));

drop policy if exists purchase_orders_admin_delete on public.purchase_orders;
create policy purchase_orders_admin_delete on public.purchase_orders
  for delete to authenticated
  using (tenant_id = (select public.jwt_tenant_id()) and exists (
    select 1 from public.user_profiles up
    where up.id = (select auth.uid()) and up.role::text = any (array['super_admin'::text, 'admin'::text, 'moderator'::text])));

-- purchase_order_items
drop policy if exists purchase_order_items_admin_select on public.purchase_order_items;
create policy purchase_order_items_admin_select on public.purchase_order_items
  for select to authenticated
  using (tenant_id = (select public.jwt_tenant_id()) and exists (
    select 1 from public.user_profiles up
    where up.id = (select auth.uid()) and up.role::text = any (array['super_admin'::text, 'admin'::text, 'moderator'::text])));

drop policy if exists purchase_order_items_admin_insert on public.purchase_order_items;
create policy purchase_order_items_admin_insert on public.purchase_order_items
  for insert to authenticated
  with check (tenant_id = (select public.jwt_tenant_id()) and exists (
    select 1 from public.user_profiles up
    where up.id = (select auth.uid()) and up.role::text = any (array['super_admin'::text, 'admin'::text, 'moderator'::text])));

drop policy if exists purchase_order_items_admin_update on public.purchase_order_items;
create policy purchase_order_items_admin_update on public.purchase_order_items
  for update to authenticated
  using (tenant_id = (select public.jwt_tenant_id()) and exists (
    select 1 from public.user_profiles up
    where up.id = (select auth.uid()) and up.role::text = any (array['super_admin'::text, 'admin'::text, 'moderator'::text])))
  with check (tenant_id = (select public.jwt_tenant_id()) and exists (
    select 1 from public.user_profiles up
    where up.id = (select auth.uid()) and up.role::text = any (array['super_admin'::text, 'admin'::text, 'moderator'::text])));

drop policy if exists purchase_order_items_admin_delete on public.purchase_order_items;
create policy purchase_order_items_admin_delete on public.purchase_order_items
  for delete to authenticated
  using (tenant_id = (select public.jwt_tenant_id()) and exists (
    select 1 from public.user_profiles up
    where up.id = (select auth.uid()) and up.role::text = any (array['super_admin'::text, 'admin'::text, 'moderator'::text])));

-- suppliers
drop policy if exists suppliers_admin_select on public.suppliers;
create policy suppliers_admin_select on public.suppliers
  for select to authenticated
  using (tenant_id = (select public.jwt_tenant_id()) and exists (
    select 1 from public.user_profiles up
    where up.id = (select auth.uid()) and up.role::text = any (array['super_admin'::text, 'admin'::text, 'moderator'::text])));

drop policy if exists suppliers_admin_insert on public.suppliers;
create policy suppliers_admin_insert on public.suppliers
  for insert to authenticated
  with check (tenant_id = (select public.jwt_tenant_id()) and exists (
    select 1 from public.user_profiles up
    where up.id = (select auth.uid()) and up.role::text = any (array['super_admin'::text, 'admin'::text, 'moderator'::text])));

drop policy if exists suppliers_admin_update on public.suppliers;
create policy suppliers_admin_update on public.suppliers
  for update to authenticated
  using (tenant_id = (select public.jwt_tenant_id()) and exists (
    select 1 from public.user_profiles up
    where up.id = (select auth.uid()) and up.role::text = any (array['super_admin'::text, 'admin'::text, 'moderator'::text])))
  with check (tenant_id = (select public.jwt_tenant_id()) and exists (
    select 1 from public.user_profiles up
    where up.id = (select auth.uid()) and up.role::text = any (array['super_admin'::text, 'admin'::text, 'moderator'::text])));

drop policy if exists suppliers_admin_delete on public.suppliers;
create policy suppliers_admin_delete on public.suppliers
  for delete to authenticated
  using (tenant_id = (select public.jwt_tenant_id()) and exists (
    select 1 from public.user_profiles up
    where up.id = (select auth.uid()) and up.role::text = any (array['super_admin'::text, 'admin'::text, 'moderator'::text])));

do $geri_al$
declare
  v_adet int;
begin
  select count(*) into v_adet
  from pg_policies
  where schemaname = 'public'
    and tablename in ('pricing_rule', 'purchase_orders', 'purchase_order_items', 'suppliers')
    and policyname like '%\_admin\_%'
    and (coalesce(qual, '') || coalesce(with_check, '')) ilike '%moderator%';
  if v_adet <> 16 then
    raise exception 'REC-140 Faz 1b geri alma: moderator içeren 16 politika bekleniyordu, bulunan %', v_adet;
  end if;
end
$geri_al$;

commit;
