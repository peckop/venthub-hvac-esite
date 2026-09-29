-- REC-442 alt işi — category-images kovasında giriş yapmış HERKESE açık yazma politikalarının kaldırılması
--
-- Plan   : docs/plans/rec442-category-images-yazma-kapatma-2026-09-29.md (plan-challenger 2026-09-29: KOŞULLU, F1-F7 işlendi)
-- Cetvel : docs/standards/migration-safety-standard.md · CLAUDE.md kural 12
-- Ölçüm  : canlı DB, 2026-09-29 (yalnız SELECT)
--
-- NE: storage.objects üzerinde "Auth Upload" (INSERT), "Auth Update" (UPDATE), "Auth Delete" (DELETE).
--     Rol listesi {public}, koşul yalnız `bucket_id = 'category-images' AND auth.role() = 'authenticated'`.
--     Yönetici, tenant ya da sahip kapısı YOK; kayıt herkese açık (disable_signup=false) → gerçek e-postası
--     olan herkes bu KAMUYA AÇIK kovaya dosya yükleyebilir.
-- NEDEN KALDIRMA (gevşetme değil): bu politikaların meşru kullanıcısı yok. Depoda tek storage.upload var
--     (admin CategoryFormModal) ve o var olmayan `products` kovasını çağırıyor; betikler service_role
--     kullanıyor (RLS'i atlar). Kategori görsellerinin 0'ı bu kovada. Okuma etkilenmez: kova public, herkese
--     açık URL'ler politika istemez. Mevcut 3 nesneye (2025-12-10, super_admin yüklemesi) DOKUNULMAZ.
-- KAPSAM DIŞI (bilerek): kovanın MIME/boyut sınırı (plan-challenger A4/F5: yazma yolu kapanınca önlediği vaka yok,
--     service_role etkisi ölçülemedi) ve product-images (1.188 nesne, betikler yazıyor).
--
-- Şema görünen yüzü DEĞİŞMEZ (public şemasında tablo/kolon/fonksiyon yok) → tip takibi: gerekmez.
-- Migration damgası taban tarihinden yeni → merge günü sema-tabani-uret.yml koşturulur (INV-TABAN-TAZE-1).
--
-- GERİ ALMA (yalnız bilinçli bir kararla; açığı yeniden açar):
--   create policy "Auth Upload" on storage.objects for insert to public
--     with check ((bucket_id = 'category-images'::text) and (auth.role() = 'authenticated'::text));
--   create policy "Auth Update" on storage.objects for update to public
--     with check ((bucket_id = 'category-images'::text) and (auth.role() = 'authenticated'::text));
--   create policy "Auth Delete" on storage.objects for delete to public
--     using ((bucket_id = 'category-images'::text) and (auth.role() = 'authenticated'::text));

-- DROP POLICY, storage.objects üzerinde kısa süreli kilit ister (INV-MIGRATION-3, squawk require-lock/statement-timeout):
-- kilit alınamazsa 5 sn sonra HIZLI BAŞARISIZ ol (workflow kırmızı, yükleme/okuma trafiği ayakta), sonsuza dek bekleme.
set lock_timeout = '5s';
set statement_timeout = '30s';

begin;

-- A) Ön-guard: bu üç AD genel; aynı adlı başka bir politikayı yanlışlıkla silmeyelim. Koşul `using` YA DA
--    `with check` içinde durabilir (canlıda Upload ve Update için using NULL) → ikisi birlikte okunur.
do $$
declare
  r record;
begin
  for r in
    select p.polname,
           coalesce(pg_get_expr(p.polqual, p.polrelid), '') || ' ' ||
           coalesce(pg_get_expr(p.polwithcheck, p.polrelid), '') as ifade
      from pg_policy p
     where p.polrelid = 'storage.objects'::regclass
       and p.polname in ('Auth Upload', 'Auth Update', 'Auth Delete')
  loop
    if r.ifade not like '%category-images%' then
      raise exception 'ON-GUARD: "%" politikasi category-images kovasina bakmiyor (%), silinmedi',
        r.polname, r.ifade;
    end if;
  end loop;
end $$;

-- B) Kaldırma (idempotent)
drop policy if exists "Auth Upload" on storage.objects;
drop policy if exists "Auth Update" on storage.objects;
drop policy if exists "Auth Delete" on storage.objects;

-- C) Son-guard, evren GENİŞ: storage.objects üzerindeki TÜM yazma politikaları (INSERT/UPDATE/DELETE/ALL).
--    Bir yazma politikası şu iki durumda İHLALDİR:
--      (1) hiçbir kovaya sabitlenmemiş VE yönetici/tenant kapısı yok (ör. `with check (true)`: her kovaya yazar),
--      (2) category-images'a bakıyor VE yönetici/tenant kapısı yok.
--    Kapı = is_admin_* / jwt_tenant_id / user_profiles geçen ifade. Ayrıca RLS açık olmalı: anon ve authenticated'ın
--    tablo düzeyinde INSERT/UPDATE/DELETE GRANT'i var, koruma yalnız RLS'te.
do $$
declare
  v_rls boolean;
  v_ihlal text;
begin
  select c.relrowsecurity into v_rls from pg_class c where c.oid = 'storage.objects'::regclass;
  if not coalesce(v_rls, false) then
    raise exception 'SON-GUARD: storage.objects uzerinde RLS KAPALI';
  end if;

  select string_agg(x.polname, ', ') into v_ihlal
    from (
      select p.polname,
             coalesce(pg_get_expr(p.polqual, p.polrelid), '') || ' ' ||
             coalesce(pg_get_expr(p.polwithcheck, p.polrelid), '') as ifade
        from pg_policy p
       where p.polrelid = 'storage.objects'::regclass
         and p.polcmd in ('a', 'w', 'd', '*')
    ) x
   where x.ifade !~ '(is_admin|jwt_tenant_id|user_profiles)'
     and (x.ifade !~ 'bucket_id = ''' or x.ifade like '%category-images%');

  if v_ihlal is not null then
    raise exception 'SON-GUARD: kapisiz yazma politikasi kaldi: %', v_ihlal;
  end if;
end $$;

commit;
