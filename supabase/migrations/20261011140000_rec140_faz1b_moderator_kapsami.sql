-- REC-140 Faz 1b — karar 95 moderatör kapsamı: maliyet/tedarik tablolarında moderatör politikadan çıkar
--
-- Plan: docs/plans/rec140-maliyet-kolonlari-kilidi-2026-09-24.md (v3, §4 Faz 1b). Kart: ALT-52.
-- Karar 95 (Recep 2026-09-24): moderatör maliyeti, alış iskontosunu ve tedarikçiyi GÖRMEZ; yalnız admin/super_admin.
-- Cetvel: rls-yetki-karari-standard.md §1 (rol kararı yalnız `public.is_admin_user()` ile verilir),
--         purchasing-standard.md §8.1 (UI izni ⊆ DB izni), migration-safety-standard.md.
--
-- NE YAPAR: dört tablodaki 16 politikayı (tablo başına select/insert/update/delete) satır içi
--   `user_profiles.role = any(['super_admin','admin','moderator'])` kontrolünden `is_admin_user()` kararına çeker:
--     pricing_rule · purchase_orders · purchase_order_items · suppliers
--   Koşul her dörtte aynı: tenant_id = jwt_tenant_id() ∧ is_admin_user(). Yazma da aynı (moderatör satınalma yazmaz).
--   Politika adları, `to authenticated` ve komut türleri DEĞİŞMEZ; yalnız rol koşulu değişir.
--
-- NE YAPMAZ (bilinçli): products/categories politikalarına dokunmaz (moderatör orada hâlâ yazıyor; ayrı karar).
--   pricing_policy ve goods_receipts politikaları da `moderator` içeriyor ama plan kapsamında DEĞİL (karar 95 bu
--   tabloları adlandırmadı); ayrı soru olarak ALT-52 kartına yazıldı. Şema tabanı bu migration ile eskir:
--   INV-TABAN-TAZE-1 master push CI'ını kırmızı yakar, `sema-tabani-uret.yml` ile tazelenir (OPS).
--
-- CANLI ETKİ: ölçüldü (2026-10-11, salt okuma): user_profiles'ta super_admin 2, admin 0, moderator 0 → bugün hiçbir
--   kullanıcının erişimi değişmez. Kazanç ilkesel kapatma: yarın bir moderatör eklenirse bu tabloları göremez.
--
-- GERİ ALMA (tek işlemde, veri kaybı yok — yalnız politika): scripts/db/geri-alma/20261011140000_rec140_faz1b_moderator_kapsami.geri-al.sql
--   (eski 16 politika gövdesi şema tabanından birebir).

begin;

set local lock_timeout = '5s';
set local statement_timeout = '60s';

-- 1 ── pricing_rule ────────────────────────────────────────────────────────────────
drop policy if exists pricing_rule_admin_select on public.pricing_rule;
create policy pricing_rule_admin_select on public.pricing_rule
  for select to authenticated
  using (tenant_id = (select public.jwt_tenant_id()) and (select public.is_admin_user()));

drop policy if exists pricing_rule_admin_insert on public.pricing_rule;
create policy pricing_rule_admin_insert on public.pricing_rule
  for insert to authenticated
  with check (tenant_id = (select public.jwt_tenant_id()) and (select public.is_admin_user()));

drop policy if exists pricing_rule_admin_update on public.pricing_rule;
create policy pricing_rule_admin_update on public.pricing_rule
  for update to authenticated
  using (tenant_id = (select public.jwt_tenant_id()) and (select public.is_admin_user()))
  with check (tenant_id = (select public.jwt_tenant_id()) and (select public.is_admin_user()));

drop policy if exists pricing_rule_admin_delete on public.pricing_rule;
create policy pricing_rule_admin_delete on public.pricing_rule
  for delete to authenticated
  using (tenant_id = (select public.jwt_tenant_id()) and (select public.is_admin_user()));

-- 2 ── purchase_orders ─────────────────────────────────────────────────────────────
drop policy if exists purchase_orders_admin_select on public.purchase_orders;
create policy purchase_orders_admin_select on public.purchase_orders
  for select to authenticated
  using (tenant_id = (select public.jwt_tenant_id()) and (select public.is_admin_user()));

drop policy if exists purchase_orders_admin_insert on public.purchase_orders;
create policy purchase_orders_admin_insert on public.purchase_orders
  for insert to authenticated
  with check (tenant_id = (select public.jwt_tenant_id()) and (select public.is_admin_user()));

drop policy if exists purchase_orders_admin_update on public.purchase_orders;
create policy purchase_orders_admin_update on public.purchase_orders
  for update to authenticated
  using (tenant_id = (select public.jwt_tenant_id()) and (select public.is_admin_user()))
  with check (tenant_id = (select public.jwt_tenant_id()) and (select public.is_admin_user()));

drop policy if exists purchase_orders_admin_delete on public.purchase_orders;
create policy purchase_orders_admin_delete on public.purchase_orders
  for delete to authenticated
  using (tenant_id = (select public.jwt_tenant_id()) and (select public.is_admin_user()));

-- 3 ── purchase_order_items ────────────────────────────────────────────────────────
drop policy if exists purchase_order_items_admin_select on public.purchase_order_items;
create policy purchase_order_items_admin_select on public.purchase_order_items
  for select to authenticated
  using (tenant_id = (select public.jwt_tenant_id()) and (select public.is_admin_user()));

drop policy if exists purchase_order_items_admin_insert on public.purchase_order_items;
create policy purchase_order_items_admin_insert on public.purchase_order_items
  for insert to authenticated
  with check (tenant_id = (select public.jwt_tenant_id()) and (select public.is_admin_user()));

drop policy if exists purchase_order_items_admin_update on public.purchase_order_items;
create policy purchase_order_items_admin_update on public.purchase_order_items
  for update to authenticated
  using (tenant_id = (select public.jwt_tenant_id()) and (select public.is_admin_user()))
  with check (tenant_id = (select public.jwt_tenant_id()) and (select public.is_admin_user()));

drop policy if exists purchase_order_items_admin_delete on public.purchase_order_items;
create policy purchase_order_items_admin_delete on public.purchase_order_items
  for delete to authenticated
  using (tenant_id = (select public.jwt_tenant_id()) and (select public.is_admin_user()));

-- 4 ── suppliers ───────────────────────────────────────────────────────────────────
drop policy if exists suppliers_admin_select on public.suppliers;
create policy suppliers_admin_select on public.suppliers
  for select to authenticated
  using (tenant_id = (select public.jwt_tenant_id()) and (select public.is_admin_user()));

drop policy if exists suppliers_admin_insert on public.suppliers;
create policy suppliers_admin_insert on public.suppliers
  for insert to authenticated
  with check (tenant_id = (select public.jwt_tenant_id()) and (select public.is_admin_user()));

drop policy if exists suppliers_admin_update on public.suppliers;
create policy suppliers_admin_update on public.suppliers
  for update to authenticated
  using (tenant_id = (select public.jwt_tenant_id()) and (select public.is_admin_user()))
  with check (tenant_id = (select public.jwt_tenant_id()) and (select public.is_admin_user()));

drop policy if exists suppliers_admin_delete on public.suppliers;
create policy suppliers_admin_delete on public.suppliers
  for delete to authenticated
  using (tenant_id = (select public.jwt_tenant_id()) and (select public.is_admin_user()));

-- 5 ── öz-kontrol (başarısızsa işlem geri döner) ───────────────────────────────────
do $kabul$
declare
  v_beklenen constant text[] := array[
    'pricing_rule_admin_select', 'pricing_rule_admin_insert', 'pricing_rule_admin_update', 'pricing_rule_admin_delete',
    'purchase_orders_admin_select', 'purchase_orders_admin_insert', 'purchase_orders_admin_update', 'purchase_orders_admin_delete',
    'purchase_order_items_admin_select', 'purchase_order_items_admin_insert', 'purchase_order_items_admin_update', 'purchase_order_items_admin_delete',
    'suppliers_admin_select', 'suppliers_admin_insert', 'suppliers_admin_update', 'suppliers_admin_delete'
  ];
  v_tablolar constant text[] := array['pricing_rule', 'purchase_orders', 'purchase_order_items', 'suppliers'];
  v_adet int;
  v_moderator int;
  v_kararsiz int;
begin
  select count(*) into v_adet
  from pg_policies
  where schemaname = 'public' and tablename = any (v_tablolar) and policyname = any (v_beklenen);
  if v_adet <> 16 then
    raise exception 'REC-140 Faz 1b: beklenen 16 politika, bulunan %', v_adet;
  end if;

  select count(*) into v_moderator
  from pg_policies
  where schemaname = 'public' and tablename = any (v_tablolar)
    and (coalesce(qual, '') ilike '%moderator%' or coalesce(with_check, '') ilike '%moderator%');
  if v_moderator <> 0 then
    raise exception 'REC-140 Faz 1b: % politika hâlâ moderator içeriyor', v_moderator;
  end if;

  select count(*) into v_kararsiz
  from pg_policies
  where schemaname = 'public' and tablename = any (v_tablolar) and policyname = any (v_beklenen)
    and (coalesce(qual, '') || coalesce(with_check, '')) not ilike '%is_admin_user%';
  if v_kararsiz <> 0 then
    raise exception 'REC-140 Faz 1b: % politika is_admin_user() kararını kullanmıyor', v_kararsiz;
  end if;

  raise notice 'REC-140 Faz 1b öz-kontrolü GEÇTİ (16 politika, moderator 0)';
end
$kabul$;

commit;
