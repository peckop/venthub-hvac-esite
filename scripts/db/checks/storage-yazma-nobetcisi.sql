-- INV-STORAGE-YAZMA-1 — storage.objects YAZMA politikası, kiracı/yönetici kapısı OLMADAN açık bırakılamaz (REC-442).
--
-- NİÇİN VAR (ölçüldü 2026-09-29, canlı prod):
--   · category-images kovasında üç politika ("Auth Upload/Update/Delete") yalnız
--     `bucket_id = '...' AND auth.role() = 'authenticated'` diyordu: giriş yapmış HERKES
--     (kayıt açık, e-posta doğrulamalı) kamuya açık kovaya yükleyebilir, üzerine yazabilir, silebilirdi.
--   · Politikalar HİÇBİR migration'da yoktu (panelden elle oluşturulmuştu): dosya tarayan bir kapı
--     onları GÖREMEZDİ. Bu yüzden ölçüm CANLI KATALOGDAN yapılır (pg_policies), depo metninden değil.
--   · Onarım #1513 (4b8af7bf1): üç politika kaldırıldı. Bu nöbetçi aynı sınıfın PANELDEN geri
--     gelmesini yakalar.
--
-- ÖLÇÜT: yazma komutu (INSERT/UPDATE/DELETE/ALL) olan, public/anon/authenticated rollerine açık ve
-- ifadesi (USING + WITH CHECK) kiracıyı ya da yöneticiyi SORGULAMAYAN politika = kapısız.
-- Kapı belirteçleri: user_profiles (rol tablosu), is_admin (yetki fonksiyonları), jwt_tenant_id
-- (kiracı). `owner` BİLEREK kapı sayılmaz: sahibine yazdıran ama kimin yükleyebileceğini
-- sınırlamayan politika hâlâ herkese açık yükleme yüzeyidir; ilan edilip gerekçelendirilir.
--
-- ÇIKTI SÖZLEŞMESİ: her satır bir POLİTİKA (sayı DEĞİL — döküm). Karşılaştırma
-- `storage-yazma-politika-ilani.json` ile yapılır: listede olmayan satır = İHLAL.
select p.policyname, p.cmd, p.roles::text as roller,
       coalesce(p.qual, '') as qual,
       coalesce(p.with_check, '') as with_check
from pg_policies p
where p.schemaname = 'storage'
  and p.tablename = 'objects'
  and p.cmd in ('INSERT', 'UPDATE', 'DELETE', 'ALL')
  and p.roles && array['public', 'anon', 'authenticated']::name[]
  and (coalesce(p.qual, '') || ' ' || coalesce(p.with_check, '')) !~* '(user_profiles|is_admin|jwt_tenant_id)'
order by p.policyname;
