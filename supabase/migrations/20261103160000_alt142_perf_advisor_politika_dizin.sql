-- squawk-ignore-file require-concurrent-index-creation
-- ALT-142 — Supabase Performance Advisor düzeltmeleri: auth çağrısı initplan'a alınır, çakışan PERMISSIVE
-- politikalar birleşir, dizinsiz 14 yabancı anahtara dizin eklenir. (Kanban: ALT-142)
-- Cetvel: migration-safety-standard.md · supabase-security yeteneği · CLAUDE.md kural 11/12/13/14 ·
--         envanter: 2026-11-03 (taban 2026-11-01_public_schema.sql; canlı politikalar tabanla aynı ölçüldü).
--
-- NİÇİN:
--   A) quote_email_events_admin_read `up.id = auth.uid()` yazıyordu; auth.uid() her satırda yeniden hesaplanıyordu.
--      `(SELECT auth.uid())` sorgu başına bir kez hesaplanır (auth_rls_initplan).
--   B) Aynı tablo × komut × rolde birden çok PERMISSIVE politika her sorguda hepsini değerlendirir
--      (multiple_permissive_policies). Birleşik politika, eskilerin VEYA'sıdır: yetki anlamı aynı kalır,
--      yalnız tek değerlendirme olur. Yeni politikalar ÖNCE oluşturulur, eskiler SONRA düşer (aynı işlemde),
--      arada koruma boşluğu yoktur.
--      · Yetki ifadeleri AYNEN korundu: brands/product_families admin kaynağı user_profiles alt sorgusu,
--        diğerleri is_admin_user(). Admin kaynağı birleştirilmedi (davranış değişirdi).
--      · brands/product_families SELECT iki rol politikasına bölündü (anon ve authenticated). Sebep: anon'un
--        user_profiles üzerinde SELECT yetkisi yok; admin alt sorgusunu "public" rolüne koymak anon sorgusunu
--        "permission denied" ile kırabilirdi. anon yalnız kiracı koşulunu, authenticated kiracı VEYA admin görür
--        (öncekiyle birebir).
--      · ALL (admin yazma) politikaları INSERT/UPDATE/DELETE olarak ayrıldı; ALL'ın SELECT payı birleşik
--        authenticated SELECT politikasında zaten vardı.
--   C) Dizinsiz yabancı anahtarlar (unindexed_foreign_keys): 14 dizin. Tablolar çok küçük (en büyüğü product_families,
--      47 satır; reltuples ölçümü 2026-11-03) → CONCURRENTLY gerekmez, tek işlemde kısa kilit yeter.
--
-- NE YAPMAZ: yetki kaynağını değiştirmez; brands/product_families admin okumasındaki kiracı filtresizliği
--   (mevcut davranış) ALT-136 kapsamındadır. ALT-135 RESTRICTIVE deny politikaları bu tablolarda yok: etkileşim yok.
--   Tip dosyası (database.types.ts) etkilenmez: şemanın görünen yüzü değişmiyor (politika ve dizin).
--
-- GERİ ALMA: (B) yeni politikaları düşür, eski tanımları 2026-11-01 tabanından yeniden oluştur
--   (brands_admin_write, brands_tenant_select, merged_brands_authenticated_select, product_families_admin_write,
--   product_families_tenant_select, merged_product_families_authenticated_select, p_dsr_admin_all,
--   p_dsr_owner_insert [+COMMENT], p_dsr_owner_select [+COMMENT], quote_items_insert_admin,
--   quote_items_insert_own_requested, quotes_insert_admin_draft, quotes_insert_own_requested,
--   quotes_update_admin, quotes_update_customer_decision). (A) politikayı bare auth.uid() ile yeniden yaz.
--   (C) drop index if exists idx_<tablo>_<sütun>; (14 dizin, hepsi idx_ önekli).

-- Tek işlem: ya hepsi ya hiçbiri. Kilit/süre sınırı: bekleyen DDL vitrini durdurmasın.
begin;
set lock_timeout = '1s';
set statement_timeout = '5s';

-- ───────── A) quote_email_events: auth.uid() initplan ─────────
alter policy quote_email_events_admin_read on public.quote_email_events
  using (
    exists (
      select 1 from public.user_profiles up
      where up.id = (select auth.uid())
        and up.role::text = any (array['admin'::character varying, 'super_admin'::character varying]::text[])
    )
  );

-- ───────── B1) brands ─────────
create policy brands_select_anon on public.brands
  for select to anon
  using (tenant_id = (select public.jwt_tenant_id()));

create policy brands_select_authenticated on public.brands
  for select to authenticated
  using (
    tenant_id = (select public.jwt_tenant_id())
    or exists (
      select 1 from public.user_profiles up
      where up.id = (select auth.uid())
        and up.role::text = any (array['admin'::character varying, 'super_admin'::character varying]::text[])
    )
  );

create policy brands_admin_insert on public.brands
  for insert to authenticated
  with check (
    exists (
      select 1 from public.user_profiles up
      where up.id = (select auth.uid())
        and up.role::text = any (array['admin'::character varying, 'super_admin'::character varying]::text[])
    )
  );

create policy brands_admin_update on public.brands
  for update to authenticated
  using (
    exists (
      select 1 from public.user_profiles up
      where up.id = (select auth.uid())
        and up.role::text = any (array['admin'::character varying, 'super_admin'::character varying]::text[])
    )
  )
  with check (
    exists (
      select 1 from public.user_profiles up
      where up.id = (select auth.uid())
        and up.role::text = any (array['admin'::character varying, 'super_admin'::character varying]::text[])
    )
  );

create policy brands_admin_delete on public.brands
  for delete to authenticated
  using (
    exists (
      select 1 from public.user_profiles up
      where up.id = (select auth.uid())
        and up.role::text = any (array['admin'::character varying, 'super_admin'::character varying]::text[])
    )
  );

drop policy brands_admin_write on public.brands;
drop policy brands_tenant_select on public.brands;
drop policy merged_brands_authenticated_select on public.brands;

-- ───────── B2) product_families ─────────
create policy product_families_select_anon on public.product_families
  for select to anon
  using (tenant_id = (select public.jwt_tenant_id()) and deleted_at is null);

create policy product_families_select_authenticated on public.product_families
  for select to authenticated
  using (
    (tenant_id = (select public.jwt_tenant_id()) and deleted_at is null)
    or exists (
      select 1 from public.user_profiles up
      where up.id = (select auth.uid())
        and up.role::text = any (array['admin'::character varying, 'super_admin'::character varying]::text[])
    )
  );

create policy product_families_admin_insert on public.product_families
  for insert to authenticated
  with check (
    exists (
      select 1 from public.user_profiles up
      where up.id = (select auth.uid())
        and up.role::text = any (array['admin'::character varying, 'super_admin'::character varying]::text[])
    )
  );

create policy product_families_admin_update on public.product_families
  for update to authenticated
  using (
    exists (
      select 1 from public.user_profiles up
      where up.id = (select auth.uid())
        and up.role::text = any (array['admin'::character varying, 'super_admin'::character varying]::text[])
    )
  )
  with check (
    exists (
      select 1 from public.user_profiles up
      where up.id = (select auth.uid())
        and up.role::text = any (array['admin'::character varying, 'super_admin'::character varying]::text[])
    )
  );

create policy product_families_admin_delete on public.product_families
  for delete to authenticated
  using (
    exists (
      select 1 from public.user_profiles up
      where up.id = (select auth.uid())
        and up.role::text = any (array['admin'::character varying, 'super_admin'::character varying]::text[])
    )
  );

drop policy product_families_admin_write on public.product_families;
drop policy product_families_tenant_select on public.product_families;
drop policy merged_product_families_authenticated_select on public.product_families;

-- ───────── B3) data_subject_requests (KVKK talepleri) ─────────
create policy p_dsr_select on public.data_subject_requests
  for select to authenticated
  using (
    (select public.is_admin_user())
    or user_id = (select auth.uid())
  );

create policy p_dsr_insert on public.data_subject_requests
  for insert to authenticated
  with check (
    (select public.is_admin_user())
    or (
      user_id = (select auth.uid())
      and applicant_email = (select auth.jwt() ->> 'email')
      and status = 'received'::text
      and due_at = (received_at + '30 days'::interval)
      and outcome is null
      and completed_at is null
      and identity_verified_at is null
      and handled_by is null
      and retained_data_note is null
    )
  );

create policy p_dsr_admin_update on public.data_subject_requests
  for update to authenticated
  using ((select public.is_admin_user()))
  with check ((select public.is_admin_user()));

create policy p_dsr_admin_delete on public.data_subject_requests
  for delete to authenticated
  using ((select public.is_admin_user()));

-- p_dsr_owner_insert yorumu (20260817143000_dsr_customer_channel.sql) birleşik INSERT politikasına aynen taşındı.
comment on policy p_dsr_insert on public.data_subject_requests is
  'Veri sahibi kendi talebini acar. Kimlik tevsiki: applicant_email = JWT email (Teblig m.5). '
  'Surec alanlari (status/due_at/outcome/completed_at/identity_verified_at/handled_by/'
  'retained_data_note) with check ile DB default''una PIN''lidir -- kolon-GRANT ile DEGIL, '
  'cunku tablo-duzeyi grant kolon grant''ini gecersiz kilar. UPDATE politikasi yok.';

comment on policy p_dsr_select on public.data_subject_requests is
  'Veri sahibi yalnız kendi talebini görür; süreci ve 30 günlük son tarihi izleyebilir. Yönetici (is_admin_user) tümünü görür.';

drop policy p_dsr_admin_all on public.data_subject_requests;
drop policy p_dsr_owner_insert on public.data_subject_requests;
drop policy p_dsr_owner_select on public.data_subject_requests;

-- ───────── B4) venthub_quote_items INSERT ─────────
create policy quote_items_insert on public.venthub_quote_items
  for insert to authenticated
  with check (
    tenant_id = public.jwt_tenant_id()
    and (
      (
        (select public.is_admin_user())
        and exists (
          select 1 from public.venthub_quotes q
          where q.id = venthub_quote_items.quote_id
            and q.tenant_id = public.jwt_tenant_id()
            and q.status = 'draft'::text
        )
      )
      or exists (
        select 1 from public.venthub_quotes q
        where q.id = venthub_quote_items.quote_id
          and q.user_id = (select auth.uid())
          and q.status = 'requested'::text
      )
    )
  );

drop policy quote_items_insert_admin on public.venthub_quote_items;
drop policy quote_items_insert_own_requested on public.venthub_quote_items;

-- ───────── B5) venthub_quotes INSERT ve UPDATE ─────────
create policy quotes_insert on public.venthub_quotes
  for insert to authenticated
  with check (
    tenant_id = public.jwt_tenant_id()
    and (
      ((select public.is_admin_user()) and status = 'draft'::text)
      or (user_id = (select auth.uid()) and status = 'requested'::text)
    )
  );

create policy quotes_update on public.venthub_quotes
  for update to authenticated
  using (
    tenant_id = public.jwt_tenant_id()
    and (
      (select public.is_admin_user())
      or (user_id = (select auth.uid()) and status = 'quoted'::text)
    )
  )
  with check (
    tenant_id = public.jwt_tenant_id()
    and (
      (select public.is_admin_user())
      or (
        user_id = (select auth.uid())
        and (
          status = 'rejected'::text
          or (
            status = 'accepted'::text
            and superseded_by is null
            and valid_until >= now()
            and accept_channel = 'site'::text
            and accept_recorded_by is null
            and accepted_revision_no = revision_no
          )
        )
      )
    )
  );

drop policy quotes_insert_admin_draft on public.venthub_quotes;
drop policy quotes_insert_own_requested on public.venthub_quotes;
drop policy quotes_update_admin on public.venthub_quotes;
drop policy quotes_update_customer_decision on public.venthub_quotes;

-- ───────── C) dizinsiz yabancı anahtarlar (14) ─────────
-- Gerekçe: tablolar çok küçük (en büyüğü 47 satır) ve bu migration tek işlemde koşar; CONCURRENTLY işlem içinde olmaz.
create index if not exists idx_data_subject_requests_handled_by on public.data_subject_requests (handled_by);
create index if not exists idx_goods_receipts_tenant_id on public.goods_receipts (tenant_id);
create index if not exists idx_order_invoices_issued_by on public.order_invoices (issued_by);
create index if not exists idx_pricing_rule_price_book_id on public.pricing_rule (price_book_id);
create index if not exists idx_product_families_subcategory_id on public.product_families (subcategory_id);
create index if not exists idx_purchase_order_items_tenant_id on public.purchase_order_items (tenant_id);
create index if not exists idx_refund_attempts_tenant_id on public.refund_attempts (tenant_id);
create index if not exists idx_venthub_quote_items_product_id on public.venthub_quote_items (product_id);
create index if not exists idx_venthub_quote_items_tenant_id on public.venthub_quote_items (tenant_id);
create index if not exists idx_venthub_quotes_accept_confirmed_by on public.venthub_quotes (accept_confirmed_by);
create index if not exists idx_venthub_quotes_accept_recorded_by on public.venthub_quotes (accept_recorded_by);
create index if not exists idx_venthub_quotes_amended_from on public.venthub_quotes (amended_from);
create index if not exists idx_venthub_quotes_source_project_id on public.venthub_quotes (source_project_id);
create index if not exists idx_venthub_quotes_superseded_by on public.venthub_quotes (superseded_by);

commit;
