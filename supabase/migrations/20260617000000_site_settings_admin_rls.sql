-- site_settings — admin-only RLS politikaları
--
-- SORUN: site_settings tablosunda RLS AÇIK ama 0 politika tanımlı (pg_policies boş) →
-- default-deny: authenticated/anon client tablodan OKUYAMAZ da YAZAMAZ da. AdminSettingsPage
-- (key-value: general/payment/admins/system satırları) bu yüzden client'tan çalışamaz.
--
-- ÇÖZÜM: products tablosunun kanıtlı admin-yazma desenine (prod_admin_update_opt) birebir uyan
-- admin-only SELECT/INSERT/UPDATE. Okuma da admin-only → ayar değerleri (ör. iyzico) public/anon'a
-- SIZMAZ. DELETE bilinçli yok (ayar satırları silinmez; gerekirse ayrı migration).
--
-- ⚠️ UYGULAMA = yalnız kullanıcının açık komutuyla. Bu dosya idempotent (drop-if-exists + create).

alter table public.site_settings enable row level security;

-- Yardımcı koşul (inline tekrar — repo konvansiyonu, helper fonksiyon yok):
--   user_profiles.role ∈ {admin, superadmin, moderator} ve satır = aktif kullanıcı.

drop policy if exists site_settings_admin_select on public.site_settings;
create policy site_settings_admin_select
  on public.site_settings
  for select
  to authenticated
  using (
    exists (
      select 1 from public.user_profiles up
      where up.id = (select auth.uid())
        and up.role::text = any (array['admin', 'superadmin', 'moderator'])
    )
  );

drop policy if exists site_settings_admin_insert on public.site_settings;
create policy site_settings_admin_insert
  on public.site_settings
  for insert
  to authenticated
  with check (
    exists (
      select 1 from public.user_profiles up
      where up.id = (select auth.uid())
        and up.role::text = any (array['admin', 'superadmin', 'moderator'])
    )
  );

drop policy if exists site_settings_admin_update on public.site_settings;
create policy site_settings_admin_update
  on public.site_settings
  for update
  to authenticated
  using (
    exists (
      select 1 from public.user_profiles up
      where up.id = (select auth.uid())
        and up.role::text = any (array['admin', 'superadmin', 'moderator'])
    )
  )
  with check (
    exists (
      select 1 from public.user_profiles up
      where up.id = (select auth.uid())
        and up.role::text = any (array['admin', 'superadmin', 'moderator'])
    )
  );
