-- W5 takibi — CANLI iki kusur: olu rol yazimi + gereksiz anon yuzeyi
-- Bulan: OPS-AUDIT (PR #559 incelemesi ve ADMIN-OPS #557 dogrulamasi, 2026-08-16)
--
-- ============================================================================
-- 1) `superadmin` OLU YAZIMDIR — `pricing_rule` politikalari prod'da kor
-- ============================================================================
--
-- OLCULDU (2026-08-16, canli DB):
--   · `user_profiles_role_check` sozlugu: super_admin | admin | moderator | warehouse |
--     sales | viewer | user  → **`superadmin` YOK.**
--   · `pricing_rule` politikalarinda `'superadmin'` gecen ifade sayisi: 3 USING + 2 WITH CHECK.
--
-- F1 kanonlestirmesi (#465) rolleri `super_admin` yapti ama W1'in RLS politikalari eski
-- yazimla yazilmis ve oyle uygulanmis. Sonuc: o dizi elemani HICBIR SATIRLA eslesemez.
-- Bugun latent — canli tek rol `admin` (olculdu) — ama ilk `super_admin` kullanici
-- olusturuldugu an fiyat kurallarina ERISEMEZ ve sebebi hicbir yerde gorunmez.
--
-- Bu "yazim hatasi duzeltmesi" degil, YETKI KAPISI onarimidir: sessizce hicbir seyle
-- eslesmeyen bir liste elemani, kapinin bir dalinin olu oldugu anlamina gelir.
--
-- Politika govdeleri W1 (20260813_pricing_w1_pricing_rule.sql) ile BIREBIR AYNI; tek fark
-- rol dizisi. Yeniden yazilmalari sart cunku PostgreSQL politika ifadesini yerinde
-- duzenlemeye izin vermiyor.

begin;

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
        and up.role::text = any (array['super_admin', 'admin', 'moderator'])
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
        and up.role::text = any (array['super_admin', 'admin', 'moderator'])
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
        and up.role::text = any (array['super_admin', 'admin', 'moderator'])
    )
  )
  with check (
    tenant_id = (select public.jwt_tenant_id())
    and exists (
      select 1 from public.user_profiles up
      where up.id = (select auth.uid())
        and up.role::text = any (array['super_admin', 'admin', 'moderator'])
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
        and up.role::text = any (array['super_admin', 'admin', 'moderator'])
    )
  );

-- ============================================================================
-- 2) `anon`, stok geri-verme RPC'sini CAGIRABILIYOR — gereksiz yuzey
-- ============================================================================
--
-- OLCULDU: `information_schema.routine_privileges` → postgres, anon, authenticated,
-- service_role hepsinde EXECUTE. Oysa 20260815224500 migration'i
-- `revoke all ... from public` + `grant ... to service_role, authenticated` yaziyordu.
--
-- SEBEP — SESSIZ VARSAYIM: `revoke from public` yalnizca PUBLIC sozde-rolunu temizler.
-- Supabase'in `alter default privileges` ayari yeni fonksiyonlara `anon`/`authenticated`
-- icin AYRICA grant veriyor; rol-ozel grant PUBLIC revoke'undan ETKILENMEZ. Yani
-- "revoke ettim" demek "kimse cagiramaz" demek degil. Sonraki her SECURITY DEFINER
-- fonksiyonda ayni tuzak var: yazdigin revoke, gormedigin default'u kapatmiyor.
--
-- SOMURULEBILIR DEGIL: fonksiyonun ilk kapisi `auth.role() = 'service_role' or exists(...)`
-- ve anon'da `auth.uid()` NULL oldugu icin `raise exception 'not authorized'` ile duser.
-- Yine de yuzey gereksiz — derinlemesine savunma, tek kapiya yaslanmamaktir.
revoke execute on function public.process_order_stock_restore(text, text) from anon;

commit;
