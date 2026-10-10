# REC-442 alt işi — `category-images` kovasında herkese açık yazma politikalarının kaldırılması

**Tarih:** 2026-09-29 · **Sahip:** ALTYAPI · **Durum:** PLAN (plan-challenger 2026-09-29: KOŞULLU, F1-F7 işlendi; kova sınırı ayrı işe çıkarıldı) · **Onarım sınıfı:** müşteriye
görünmeyen ama ziyaretçi-yakın güvenlik kusuru; OPS hükmü "onarım, karar değil" (165 güvenlik istisnası).

**Yöneten cetveller:** `docs/standards/migration-safety-standard.md` (atomiklik, tip/taban maddesi, geri alma notu) ·
`docs/standards/rls-yetki-karari-standard.md` (yetki kararı kaynağı) · CLAUDE.md kural 12 ve 13.
**Tazelik:** ölçümler 2026-09-29 canlı, yalnız SELECT + herkese açık `/auth/v1/settings` okuması.

## 1. Ölçüm (canlı)

| Soru | Bulgu |
|---|---|
| Politikalar | `storage.objects` üzerinde 3 politika: `Auth Upload` (INSERT), `Auth Update` (UPDATE), `Auth Delete` (DELETE). Rol listesi `{public}`, koşul yalnız `bucket_id = 'category-images' AND auth.role() = 'authenticated'`. Yönetici, tenant ya da sahip kapısı YOK |
| Kayıt açık mı | Evet: `disable_signup=false`, `mailer_autoconfirm=false` (e-posta doğrulaması gerekir), anonim giriş kapalı, sağlayıcılar google + e-posta. Gerçek e-postası olan herkes `authenticated` olur |
| Kovanın durumu | `public=true`; 3 nesne (2025-12-10, webp, 11–19 KB); MIME ve boyut sınırı YOK; kategori görsellerinin 0'ı bu kovada (21'i `product-images`, 1'i başka) |
| Kim yazıyor | Depoda tek `storage.upload` çağrısı var: `CategoryFormModal.tsx:201`, ve o `products` kovasını çağırıyor; canlıda `products` kovası YOK → o yükleme bugün "Bucket not found" ile düşüyor. Betikler (`upload-pilot-images`, `kademe2-load`) `service_role` kullanıyor, RLS'i atlar. Yani bu üç politikanın MEŞRU kullanıcısı yok |
| Politikalar depoda var mı | HAYIR: hiçbir migration'da geçmiyor (panelden elle oluşturulmuş; migration'lardaki tek `category-images` geçişi `20260831110000_kategori_gorselleri.sql` yorumlarında). Bu yüzden migration metnini tarayan bir kapı bunları göremezdi; kapı CANLIYI okumalı |
| Öteki kovalar | `product-images`'ın 7 politikası tenant + yönetici kapılı. "Yalnız authenticated" deseni yalnız bu 3 politikada |
| 24 saatlik kullanım | `/auth/v1/signup` ve `/storage` yazma isteği 0 (kimse denememiş) |

**Ölçülmedi (dürüstlük):** gerçek bir yükleme denemesi (prod'da yazma yasak); kovadaki 3 nesnenin hangi işlemden kaldığı
(2025-12 admin yüklemesi, sahipli); Storage API'nin RLS reddini hangi HTTP koduyla döndüğü (403 beklenir, gölgede ölçülecek).

## 2. Karar

**Kullanılmayan yazma yolu gevşetilmez, kaldırılır.** Üç politika DROP edilir; okuma etkilenmez (kova `public`, herkese açık
URL'ler politika istemez); `service_role` etkilenmez. Yönetici kapısına bağlamak seçeneği reddedildi çünkü çağıran kod yok
(yaşamayan yol için politika bakım yükü); kategori formu düzeltilirken ADMIN yüklemeyi zaten yönetici kapılı `product-images`
kovasına taşıyacak (alt iş ADMIN'e iletildi, kabul edildi).

**Kova MIME/boyut sınırı BU migration'dan ÇIKARILDI** (plan-challenger A4/F5, rapor 2026-09-29): yazma yolu kapanınca sınırın
önlediği vaka sıfır; `Content-Type` istemci beyanı olduğundan MIME listesi zayıf savunma; sınırın `service_role` yazılarını da
kısıtlayıp kısıtlamadığı ve workflow rolünün `storage.buckets` UPDATE yetkisi ÖLÇÜLEMEDİ. Ayrı iş olarak REC-442 altına alt iş
yorumu yazılır, ADMIN kategori yükleme yolunu yeniden yazarken (yönetici kapılı yol açılırken) ele alınır. `product-images`
DEĞİŞTİRİLMEZ (1.188 nesne, betikler yazıyor).

**En sömürülebilir yol INSERT** (F3): herkese açık kovaya sahipsiz dosya barındırma (kimlik avı içeriği, depolama maliyeti).
UPDATE ve DELETE, kovada hiç SELECT politikası olmadığından mevcut nesneler üzerinde büyük olasılıkla 0 satırı etkiliyordu
(Postgres davranışından çıkarım, canlıda DENENMEDİ). Karar üçüne de geçerli. Mevcut 3 nesnenin sahibi `super_admin` (Aralık 2025
meşru yönetici yüklemesi), nesnelere dokunulmaz.

## 3. Migration (tek dosya, atomik, `BEGIN … COMMIT`)

`supabase/migrations/20260929120000_rec442_category_images_yazma_kapat.sql` (damga 14 hane; yazım anında güncellenir).

1. **Ön-guard (F1):** üç politika adı `storage.objects` üzerinde varsa, her birinin `coalesce(qual, with_check)` metninde
   `category-images` GEÇİYOR olmalı (canlıda `Auth Upload` ve `Auth Update` için `qual` NULL, koşul yalnız `with_check`'te;
   yalnız `qual`'e bakmak 2/3'te yanlışlıkla raise ederdi); geçmiyorsa `raise exception` (aynı adlı başka bir politikayı silmemek
   için). Ters fikstür (aynı ad, başka kova → raise) gölgede sınanır.
2. `DROP POLICY IF EXISTS "Auth Upload" / "Auth Update" / "Auth Delete" ON storage.objects;` (idempotent).
3. **Son-guard (F2), evren GENİŞ:** `storage.objects` üzerindeki TÜM INSERT/UPDATE/DELETE/ALL politikaları taranır; her biri ya
   `bucket_id = '<başka kova>'` sabitli ya da yönetici/tenant kapılı olmalı; kovaya sabitli olmayan ve kapısız (ör. `with check
   (true)`) hiçbir yazma politikası kalmamalı, aksi halde `raise exception`. Ayrıca `relrowsecurity = true` doğrulanır (anon ve
   authenticated'ın tablo düzeyinde INSERT/UPDATE/DELETE GRANT'i var; koruma yalnız RLS'te).

**Geri alma notu (dosya başına yorum):** üç politikayı canlı tanımlarıyla yeniden oluştur (INSERT `WITH CHECK`, UPDATE
`WITH CHECK`, DELETE `USING`; hepsi `TO public`, koşul `bucket_id = 'category-images' AND auth.role() = 'authenticated'`).
Geri alma ANCAK bilinçli bir karardır (açığı yeniden açar).

**Şema görünen yüzü:** değişmez (`public` şemasında tablo/kolon/fonksiyon yok, yalnız `storage` politikaları ve kova ayarı).
`src/types/database.types.ts` etkilenmez; "tip takibi: gerekmez". Ama migration damgası taban tarihinden yeni olacağı için
INV-TABAN-TAZE-1 gereği merge günü `sema-tabani-uret.yml` koşturulur (aynı saat, ALTYAPI).

## 4. Doğrulama (davranışı olan migration → gölge)

Davranış ölçütü: **kaldırmadan ÖNCE** sade kullanıcı yüklüyor (negatif kontrol: test dişli mi), **kaldırdıktan SONRA** sade
kullanıcı ve anon reddediliyor, `service_role` yazıyor, okuma açık kalıyor. INSERT hem `RETURNING`'li hem `RETURNING`'siz
denenir (kovada SELECT politikası olmadığından Storage API'nin hangi biçimi kullandığı sonucu değiştirebilir), UPDATE/DELETE
0 satır davranışı da ölçülür.

Yöntem: gölge veritabanı (`scripts/db/golge-kur.mjs`, Docker) YA DA bellek elvermezse bellek-içi PGlite (yalnız bu ölçüm için,
depoya bağımlılık olarak EKLENMEZ): `storage.objects` + `storage.buckets` iskeleti, `anon/authenticated/service_role`
rolleri, `auth.role()` yardımcısı (JWT talebinden), RLS açık. **Üç eski politika ELLE YAZILMAZ (F4, döngüsellik)**: canlıdaki
tanımdan (`pg_get_expr(polqual)`, `pg_get_expr(polwithcheck)`, roller, komut) makineyle üretilir. Gölgenin sınırı adıyla:
gerçek Storage API'nin ek kontrolleri (HTTP kodu, `RETURNING` davranışı) SİMÜLE EDİLMEZ; ölçülen şey RLS kararıdır.
**Gerçek kanıt canlıdır (adım 6):** migration sonrası salt-okuma ile politikalar yok, 3 nesne yerinde; ayrıca bir nesnenin
herkese açık URL'sine HTTP GET migration ÖNCESİ ve SONRASI 200 dönmeli (okuma etkilenmez iddiası DB düzeyinde değil uçtan uca).

## 5. İkinci parça — canlıyı okuyan nöbetçi (ayrı PR, migration'dan SONRA)

`scripts/db/checks/storage-yazma-nobetcisi.{mjs,sql}` + `docs/storage-yazma-politika-ilani.json` (`anon-yazma-nobetcisi`
kardeşi, aynı fail-closed `SUPABASE_DB_URL` deseni, `db-advisor.yml` içinde): `storage.objects` üzerinde INSERT/UPDATE/DELETE/ALL
politikası olup koşulunda yönetici/tenant/sahip kapısı bulunmayan her kalem, ilan dosyasında yoksa KIRMIZI. Migration
uygulandıktan sonra ilan BOŞ başlar (taban 0). **Kabul ölçütü canlı 11 politikayla yazılır (F6):** bugün 3 KIRMIZI (bu üçü) +
8 YEŞİL (`product-images`, üç farklı kapı kalıbı: `user_profiles` EXISTS + role, `jwt_tenant_id()` eşitliği,
`storage.foldername`); migration sonrası 0 kırmızı; kapsama `ALL` komutu ve `{public}` rolü dahil; sınıflayıcı için fikstür
(kapılı/kapısız örnekler) birim testi. Sınır (adıyla): nöbetçi politika koşulunun metnini sınıflar, koşulun anon için
gerçekten false döndüğünü kanıtlamaz. İlan mantığı iki yönlü DEĞİL (bayat ilan kalemi uyarı verir, kırmızı vermez), çünkü
migration ile ilan temizliği yarış yaratırdı. Bu parça tam-liste §30 kapısının çekirdeğidir.

## 6. Riskler ve karşı önlemler

| Risk | Karşı önlem |
|---|---|
| Aynı adlı başka bir politika silinir | Ön-guard koşulda `category-images` şartı arar |
| Bilinmeyen meşru yükleyici kırılır | Kod taraması: tek çağrı ölü (`products` kovası yok); betikler `service_role`. Migration sonrası admin panelinde yükleme zaten çalışmıyordu (Bucket not found) |
| Prod'da migration kendi başına bozulur | Atomik; son-guard doğrular; okuma yolu ve 3 nesne etkilenmez |
| Geri alma pahalı mı | Ucuz (üç `CREATE POLICY`), ama açığı yeniden açar |
| Tip/taban kırmızısı | Şema görünen yüzü değişmez; taban tazeleme merge günü aynı saatte |

## 7. Sıra ve kapılar

1. plan-challenger (bu belge) → 2. migration dosyası + gölge kanıtı → 3. PR (`⚠ MIGRATION İÇERİR — merge = prod'a otomatik uygulama.
Yalnız Recep onayıyla merge.`) → 4. OPS Recep'e sorar → 5. merge + `sema-tabani-uret` → 6. canlıda salt-okuma doğrulama
(politika yok, kova sınırı yazılı, 3 nesne yerinde) → 7. nöbetçi PR'ı → 8. Linear (REC-442 altına yorum) ve durum dosyası.
