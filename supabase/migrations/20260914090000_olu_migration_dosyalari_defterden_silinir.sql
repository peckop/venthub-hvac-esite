-- REC-321 adım 3 / SEÇENEK 1: altı ölü migration dosyası SİLİNİR — defter satırları da
--
-- Recep kararı 2026-09-14 (kendi sözü: "tamam silinsin ve bana merge onayına gelmeyecek
-- mi? ben de onay veririm"). ALTYAPI'nın ve OPS'un önerisi SEÇENEK 2'ydi (yerinde tut,
-- başına not düş); Recep ikisini de aştı. Gerekçesi: işe yaramayan dosya tutulmaz.
--
-- ⛔BU DOSYA MERGE EDİLMEDEN prod'a uygulanmaz; merge = uygulama (CLAUDE.md kural 13).
-- Merge Recep'in kendi penceresinde, kendi onayıyla.
--
-- ══════════════════════════════════════════════════════════════════════════════
-- NİÇİN DEFTER SATIRI DA SİLİNİYOR — bu işin tek teknik zorunluluğu
--
-- `.github/workflows/supabase-migrate.yml` son adımında bir LEDGER PARİTESİ kapısı
-- var: depodaki dosya adları listesi ile `public._migration_ledger` kayıt listesi
-- BİREBİR aynı olmak zorunda ve İKİ YÖN DE hata sayılıyor. Dosya silinir de defter
-- satırı kalırsa kapı "uygulanmış bir migration depodan silinmiş — DB ile repo
-- ayrışmış" der ve migration turu KIRMIZI yanar.
--
-- Yani "dosyayı sil" kararı, teknik olarak "defterden de altı satır sil" demektir.
-- Bu, kararı Recep'in kapısına taşıyan şeydir: prod veritabanına YAZMA.
-- ══════════════════════════════════════════════════════════════════════════════
--
-- ARİTMETİK (ölçüldü 2026-09-14, varsayılmadı):
--   · master'da migration dosyası            : 236
--   · son YEŞİL parite koşumunda (643c7089)  : 236  → yani defter de 236
--   · o koşumdan sonra master'a giren migration: 0   (ölçüldü, `git diff --diff-filter=A`)
--   · silinen dosya                          : 6
--   · eklenen dosya (bu migration)           : 1
--   → dosya  : 236 − 6 + 1 = 231
--   → defter : 236 − 6 + 1 = 231   (6 satır bu dosya tarafından silinir,
--                                    1 satır bu dosyanın kendi adı olarak eklenir)
--   PARİTE KORUNUR.
--
-- ADIM SIRASI DOĞRULANDI (workflow satır numaraları): Baseline(80) → Apply(95) →
-- Ledger paritesi(179). Yani bu dosya UYGULAMA adımında koşar ve altı satırı siler;
-- parite adımı ONDAN SONRA ölçer. Sıra ters olsaydı kapı kırmızı yanardı.
--
-- ══════════════════════════════════════════════════════════════════════════════
-- ⭐FELAKET KURTARMA (DR / ledger reset) — ve burada Recep'in kararı BİZİMKİNDEN İYİ
--
-- Boş bir veritabanına bütün migration'lar sırayla koşulduğunda ne olur diye ölçtüm.
-- Beş ölü dosya `CREATE POLICY IF NOT EXISTS` taşıyor ve PostgreSQL bu sözdizimini
-- DESTEKLEMİYOR; ifadeler en üst seviyede, hiçbir `DO $$` bloğuyla korunmuş değil
-- (ölçüldü). Yani BUGÜN, sıfırdan bir kurulum denenirse o replay o dosyalarda
-- SÖZDİZİMİ HATASIYLA PATLAR.
--
-- Bizim önerdiğimiz SEÇENEK 2 (dosyayı yerinde tutup başına not düşmek) bu kusuru
-- ÇÖZMÜYORDU — notu okuyan insan uyarılırdı, replay yine patlardı. Silme çözüyor.
-- Ben bu boyutu ölçmeden öneri vermiştim; Recep'in kararı ölçülmemiş bir boyutta
-- daha iyi çıktı ve bu kayda geçti.
--
-- Politika kaybı da yok: silinen dosyaların hiçbiri prod'a uygulanmamıştı, yani
-- vaat ettikleri politikalar bugün de YOK. Tek davranışsal fark
-- `20250909_fix_product_images_rls.sql`'de: o dosya üç `storage.objects` admin
-- politikasını düşürüyordu. Replay'de o düşürme artık olmayacak — ama aynı üçünü
-- `20260530224000_tenant_aware_storage_policies.sql:9-11` de düşürüyor ve o SONRA
-- koşuyor. Net sonuç AYNI. (Bu bağ silmeden önce REC-321'e yorum olarak yazıldı.)
--
-- ⚠VAAT EDİLEN POLİTİKALARIN PROD'DA OLMAMASI AYRI BİR SORUN ve bu iş onu ÇÖZMÜYOR.
-- Ayrı kayıt: REC-321 adım 2 (PR #1173, `error_groups` yazma politikası, merge EDİLMEDİ).
-- Dosyaları silmek o borcu kapatmaz, yalnız YANLIŞ İNANCI kaldırır.
-- ══════════════════════════════════════════════════════════════════════════════
--
-- ⚠SAYI DÜZELTMESİ, KENDİMDEN: REC-321'in başlığı "11 kez geçersiz SQL" diyor.
-- Yorumlar çıkarıldıktan sonra ölçtüm: gerçek geçersiz ifade sayısı 10 ve BEŞ dosyada.
-- Altıncısı (`202508261956_user_invoice_profiles.sql`) geçersiz SQL TAŞIMIYOR —
-- içindeki `IF NOT EXISTS`'lerin hepsi geçerli `CREATE TABLE` / `CREATE INDEX` biçimi;
-- tek `CREATE POLICY IF NOT EXISTS` geçişi bir YORUM satırında. 11 sayısı o yorumu da
-- saymıştı. O dosya ölü, ama "geçersiz" değil — yalnız hiç uygulanmamış.

-- Kilit kuyruğunda bekleyip tabloyu kilitlemek yerine HIZLI BAŞARISIZ OL.
-- INV-MIGRATION-3 bu iki satırı arar.
set lock_timeout = '5s';
set statement_timeout = '5s';

begin;

-- ⚠TAM ALTI AD, TEK TEK YAZILI. Desen (`LIKE '2025%'` gibi) KULLANILMADI: bir desen
-- yarın eklenen bir dosyayı da kapsayabilir ve o zaman bu migration sessizce YANLIŞ
-- satırı siler. Ad listesi uzun ama denetlenebilir.
delete from public._migration_ledger
where name in (
  '202508261956_user_invoice_profiles.sql',
  '20250907_admin_audit_log.sql',
  '20250908_client_errors.sql',
  '20250908_error_groups.sql',
  '20250908_error_groups_policies_fix.sql',
  '20250909_fix_product_images_rls.sql'
);

-- ⭐SİLİNEN SATIR SAYISI DOĞRULANIR — "koştu" ile "yaptı" ayrı şeylerdir.
-- Altı satır beklenirken başka bir sayı çıkarsa migration KIRMIZI yanar ve
-- transaction geri alınır. Sessiz bir kısmi silme, paritenin bozulması demekti.
do $$
declare
  kalan integer;
begin
  select count(*) into kalan
  from public._migration_ledger
  where name in (
    '202508261956_user_invoice_profiles.sql',
    '20250907_admin_audit_log.sql',
    '20250908_client_errors.sql',
    '20250908_error_groups.sql',
    '20250908_error_groups_policies_fix.sql',
    '20250909_fix_product_images_rls.sql'
  );
  if kalan <> 0 then
    raise exception
      'REC-321: defterde bu adlardan % tanesi HALA duruyor — parite bozulur, geri alindi', kalan;
  end if;
end $$;

commit;
