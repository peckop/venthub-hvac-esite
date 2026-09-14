-- REC-321 adım 3 / SEÇENEK 1: BEŞ ölü migration dosyası SİLİNİR — defter satırları da
--
-- ⭐KAPSAM ALTIDAN BEŞE İNDİ (2026-09-14, bağımsız çürütmenin bulgusu + OPS hükmü):
-- `202508261956_user_invoice_profiles.sql` SİLİNMİYOR. Sebebi ölçüldü: o dosya
-- (a) GEÇERLİ SQL taşıyor — politikaları `DO $$ ... EXCEPTION WHEN duplicate_object`
--     ile korumalı, `CREATE POLICY IF NOT EXISTS` hiç kullanmıyor;
-- (b) `public.user_invoice_profiles` tablosunun depodaki TEK YARATICISI, ve o tabloya
--     dokunan sekiz migration hayatta;
-- (c) yani replay'de İŞE YARIYOR.
-- Recep'in ilkesi "işe yaramayan dosya tutulmaz" idi; bu dosya YARIYOR, dolayısıyla
-- ilke onu kapsamıyor. Ölü olması (hiç uygulanmamış olması) tek başına silme gerekçesi
-- DEĞİL — geçersizlik ve işlevsizlik gerekçe.
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
-- Yani "dosyayı sil" kararı, teknik olarak "defterden de beş satır sil" demektir.
-- Bu, kararı Recep'in kapısına taşıyan şeydir: prod veritabanına YAZMA.
-- ══════════════════════════════════════════════════════════════════════════════
--
-- ARİTMETİK (ölçüldü 2026-09-14, varsayılmadı):
--   · master'da migration dosyası            : 236
--   · son YEŞİL parite koşumunda (643c7089)  : 236  → yani defter de 236
--   · o koşumdan sonra master'a giren migration: 0   (ölçüldü, `git diff --diff-filter=A`)
--   · silinen dosya                          : 5  (altidan bese indi, yukariya bakiniz)
--   · eklenen dosya (bu migration)           : 1
--   → dosya  : 236 − 5 + 1 = 232   (yerelde OLCULDU: 232)
--   → defter : 236 − 5 + 1 = 232   (5 satır bu dosya tarafından silinir,
--                                    1 satır bu dosyanın kendi adı olarak eklenir)
--   PARİTE KORUNUR.
--
-- ADIM SIRASI DOĞRULANDI (workflow satır numaraları): Baseline(80) → Apply(95) →
-- Ledger paritesi(179). Yani bu dosya UYGULAMA adımında koşar ve beş satırı siler;
-- parite adımı ONDAN SONRA ölçer. Sıra ters olsaydı kapı kırmızı yanardı.
--
-- ══════════════════════════════════════════════════════════════════════════════
-- ⛔FELAKET KURTARMA — İLK YAZDIĞIM GEREKÇE YANLIŞTI, bağımsız çürütme çürüttü
--
-- İlk hâlinde burada "replay bugün patlıyor, SİLME BUNU ÇÖZÜYOR" yazıyordu. YANLIŞTI.
-- plan-challenger çürüttü; örneklemeden kabul etmedim, kendim ölçüp doğruladım.
--
-- ÖLÇÜLEN GERÇEK, İKİ SAYIYLA:
--   · Silmeden ÖNCE  : replay `20250907_admin_audit_log.sql`'de durur (sözdizimi hatası)
--   · Silmeden SONRA : replay `20250908_enable_realtime_error_tables.sql`'de durur
--                      (`relation "error_groups" does not exist`)
-- → Replay İKİ HÂLDE DE imkânsız. Silme kırılma noktasını BİR GÜN ileri kaydırıyor ve
--   hata türünü değiştiriyor. NET DURUM DEĞİŞMİYOR.
--
-- ⭐DERS: "bu dosyalar patlıyor"u ölçtüm, "silmek bunu düzeltir"i ÖLÇMEDİM — silme
-- SONRASI replay'in nerede durduğuna bakmamıştım. BİR DÜZELTMENİN İŞE YARADIĞI,
-- DÜZELTME SONRASI DURUM ÖLÇÜLMEDEN SÖYLENMEZ.
--
-- ⚠KARAR YİNE DE DOĞRU ama BAŞKA SEBEPLE: bu beş dosya prod'da ölü, geçersiz SQL
-- taşıyor ve depoda "burada politika yazılmış" yanlış inancını üretiyor. Recep'in
-- "işe yaramayan dosya tutulmaz" gerekçesi GEÇERLİ; benim DR gerekçem GEÇERSİZ.
--
-- ⭐⭐VE ALTINDA DAHA BÜYÜK BİR AÇIK VAR (yeni bulgu, AYRI KAYIT — REC-336):
-- Üç tabloyu hayatta kalan HİÇBİR migration yaratmıyor: `client_errors`,
-- `error_groups`, `user_invoice_profiles`. O tablolara dokunan hayatta kalan migration
-- sayısı 9 · 9 · 8. Yani bu depo, migration geçmişinden veritabanını YENİDEN KURAMIYOR:
-- tablolar prod'da VAR ama depoda onları YARATAN migration YOK. Bu açık silmeden ÖNCE
-- de vardı; silme onu yalnız GÖRÜNÜR kıldı.
-- ⭐`user_invoice_profiles`'in TEK yaratıcısı bu yüzden SİLİNMİYOR (en yukarıya bakınız).
--
-- Politika kaybı yok: silinen beş dosyanın hiçbiri prod'a uygulanmamıştı, yani vaat
-- ettikleri politikalar bugün de YOK. Tek davranışsal fark
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
-- ⚠SAYI DÜZELTMESİ, KENDİMDEN: REC-321'in başlığı "altı dosyada 11 kez geçersiz SQL"
-- diyor. Yorumlar çıkarıldıktan sonra ölçtüm: gerçek geçersiz ifade sayısı 10 ve BEŞ
-- dosyada. Altıncısı (`202508261956_user_invoice_profiles.sql`) geçersiz SQL TAŞIMIYOR;
-- tek `CREATE POLICY IF NOT EXISTS` geçişi bir YORUM satırında ve politikaları
-- `DO $$ ... EXCEPTION` ile korumalı. 11 sayısı o yorumu da saymıştı.
-- ⭐Bu düzeltme kapsamı da değiştirdi: o dosya ölü ama GEÇERSİZ DEĞİL ve İŞE YARIYOR,
-- bu yüzden silinmiyor. Yani bir SAYIYI düzeltmek bir KARARI düzeltti.

-- Kilit kuyruğunda bekleyip tabloyu kilitlemek yerine HIZLI BAŞARISIZ OL.
-- INV-MIGRATION-3 bu iki satırı arar.
set lock_timeout = '5s';
set statement_timeout = '5s';

begin;

-- ⚠TAM BES AD, TEK TEK YAZILI. Desen (`LIKE '2025%'` gibi) KULLANILMADI: bir desen
-- yarın eklenen bir dosyayı da kapsayabilir ve o zaman bu migration sessizce YANLIŞ
-- satırı siler. Ad listesi uzun ama denetlenebilir.
delete from public._migration_ledger
where name in (
  '20250907_admin_audit_log.sql',
  '20250908_client_errors.sql',
  '20250908_error_groups.sql',
  '20250908_error_groups_policies_fix.sql',
  '20250909_fix_product_images_rls.sql'
);

-- ⭐KALAN SATIR SAYISI DOĞRULANIR — "koştu" ile "yaptı" ayrı şeylerdir.
-- DELETE'ten sonra bu beş addan biri hâlâ defterde duruyorsa migration KIRMIZI yanar
-- ve transaction geri alınır.
--
-- ⚠BU KONTROLÜN SINIRI, ADIYLA (bağımsız çürütme buldu, ORTA risk): kontrol "KALAN
-- satır 0 mı" diye soruyor, "KAÇ satır SİLİNDİ" diye sormuyor. Defterde bu beş addan
-- yalnız üçü varsa DELETE üçünü siler, `kalan = 0` çıkar ve exception TETİKLENMEZ.
-- Yani "fazla kalan"ı yakalar, "beklenenden az silinen"i YAKALAMAZ.
-- İKİNCİ SAVUNMA HATTI VAR: workflow'un ayrı PARİTE adımı dosya listesiyle defteri
-- tam karşılaştırıyor ve o tutarsızlığı yakalar — pratik zarar bu yüzden sınırlı.
-- ⛔NİÇİN ŞİMDİ DÜZELTİLMEDİ: doğru düzeltme (`row_count` karşılaştırması, beklenen
-- sayı ile) defterin GERÇEK hâlini bilmeyi gerektiriyor; prod salt-okuma izni bu
-- turda verilmedi. Tahminle yazılmış bir sayı kontrolü, olmayan bir kontrolden DAHA
-- KÖTÜ olurdu: yanlış beklenti migration'ı sebepsiz kırmızıya düşürürdü.
do $$
declare
  kalan integer;
begin
  select count(*) into kalan
  from public._migration_ledger
  where name in (
    '20250907_admin_audit_log.sql',
    '20250908_client_errors.sql',
    '20250908_error_groups.sql',
    '20250908_error_groups_policies_fix.sql',
    '20250909_fix_product_images_rls.sql'
  );
  if kalan <> 0 then
    raise exception
      'REC-321: defterde bu bes addan % tanesi HALA duruyor — parite bozulur, geri alindi', kalan;
  end if;
end $$;

commit;
