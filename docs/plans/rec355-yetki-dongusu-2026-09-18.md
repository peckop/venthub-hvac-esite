# REC-355 — `user_profiles` yetki döngüsü (54001) onarım planı

> **KAYNAK/CETVEL (kural 1):** yöneten cetvel **`docs/standards/rls-yetki-karari-standard.md`**
> (§1 "uygulama rolü kararı yalnız `public.is_admin_user()` üzerinden verilir" — bu iş o hükmü
> DEĞİŞTİRİR, cetvel aynı PR'da güncellenir). Komşu cetveller: `CLAUDE.md` kural 12 (yetki kararı
> `app_metadata`), kural 13 (migration merge = prod'a otomatik uygulama), kural 14 (tam iş).
> Migration kontrol listesi çapalı hafızada (`supabase/migrations` dizin çapası).
> Karar numarası: **43** · Tarih: 2026-09-18 · Şerit: ALTYAPI · Kayıt: REC-355.
> Bu belge `plan-challenger` red-team denetiminden geçti (hüküm KOŞULLU, altı şart) ve şartların
> hepsi aşağıda kapatıldı; çürütmenin ölçümleriyle çelişen ilk sürüm terk edildi.

## 1. Kusur — ölçülmüş, iki bağımsız ortamda

`public.is_admin_user()` (plpgsql, **SECURITY INVOKER**, 2026-06-02
`20260602110000_hardened_invoker_functions.sql` kararı) JWT'de `user_role` claim'i **yoksa** yedek
dalda `public.user_profiles` okur. `user_profiles`ın politikaları `is_admin_user()` **çağırır** →
politika → fonksiyon → politika → `54001 stack depth limit exceeded`.

**Sonuç veriye ve sorgu planına bağlı, yani KARARSIZ** (bu, "gizli kusur"dan kötüdür):

| Ortam | Jeton | `user_profiles` sonucu |
|---|---|---|
| Gölge (2 profil, 09-18) | claim'siz, `sub` yok / `sub`=user / `sub`=admin | **54001** (üçü de) |
| Canlı (3 profil, 09-18 salt-okuma) | claim'siz, `sub`=super_admin | **3 satır, hata yok** |
| Canlı | claim'siz, `sub`=user ya da var olmayan uuid | **54001** |

Özyineleme, yedek dalın iç sorgusu kendi satırında `id = auth.uid()` kolundan geçebildiğinde
duruyor; geçemediğinde sürüyor. Hangi kolun önce değerlendirileceği satır sayısı ve plana bağlı,
bu yüzden aynı jeton bir ortamda çalışıp ötekinde patlıyor.

**Maskeleme:** `custom_access_token_hook` canlıda açık ve her JWT'ye `user_role` yazıyor
(profilsize `'user'`). Kusur claim'siz jetonda görünür: hook kapanması, hook'tan önce üretilmiş
uzun ömürlü jeton, doğrudan PostgREST çağrısı.

### Kapsam envanteri (çürütmenin düzelttiği madde)

- `user_profiles` politikaları `is_admin_user()` çağırır (select/insert/update/delete).
  **DELETE'te `id = auth.uid()` kolu YOKTUR** — yalnız `tenant_id` + yönetici koşulu.
- **`is_user_admin(uuid)` 20 politikada çağrılıyor** (`coupons`, `product_prices`, `price_lists`,
  `order_notes`, `order_attachments` ×4; `inventory_movements`, `inventory_settings` ×1). Bu
  fonksiyonun claim dalı **hiç yok**, her koşumda `user_profiles` okur → aynı boğaz. İlk plan
  "politikalarda çağrılmıyor" diyordu, **yanlıştı**.
- `security_invoker` görünümler de aynı boğazdan geçer: `view_admin_orders`, `admin_users`,
  `view_admin_uninvoiced_orders`.
- Tetikler döngü kurmaz: `enforce_role_change()` **SECURITY DEFINER** (RLS'i atlar),
  `trg_user_profiles_updated_at` tablo okumaz. `is_admin()` / `is_staff_user()` hiçbir politikada
  çağrılmıyor.

## 2. Seçenekler ve hüküm

| Seçenek | Ne yapar | Hüküm |
|---|---|---|
| A. `is_admin_user()` → `SECURITY DEFINER` | Yedek dal RLS'i atlar, döngü kapanır | **Seçilmedi:** 06-02'de bilinçli INVOKER kararı; tersine çevirmek yetki yüzeyini genişletir |
| B. Döngüyü **politikada** kes: `user_profiles` politikaları claim-only yardımcı çağırsın | Tablo okuması olmadan yetki kararı → döngü yapısal olarak imkânsız | **SEÇİLDİ** |
| C. Dört politikaya gömülü claim SQL'i | Aynı etki | **Seçilmedi:** aynı mantık dört yere kopyalanır |

### Seçilen onarım (B)

1. `public.is_admin_claim()` — yeni, `stable`, `SECURITY INVOKER`, `search_path` sabit, **yalnız
   claim okur** (`user_role`, `app_metadata.user_role`; `user_metadata` YOK), tablo okuması yok,
   `service_role` → `true`.
2. EXECUTE duruşu emsale göre **daraltılır**: `revoke … from public, anon, authenticated`, sonra
   yalnız `authenticated, service_role`. Emsal: `20260916113803_arama_fonksiyon_yetki_daraltma.sql`.
   (`anon`ın `user_profiles` üzerinde politikası yok, EXECUTE'a ihtiyacı da yok.)
3. `user_profiles`ın dört politikası `is_admin_user()` yerine `is_admin_claim()` çağırır; **adlar
   birebir korunur**, tenant ve self kolları olduğu gibi kalır.
4. `is_admin_user()` **değişmez**. Onarımdan sonra yedek dalının okuduğu politika artık
   `is_admin_user()` çağırmadığı için özyineleme **imkânsız**; 20 politikanın `is_user_admin` yolu
   da böylece döngüsüzleşir.

### Ölçülmüş takas (çürütmenin 1. şartı — "gerileme değil" hükmü GERİ ÇEKİLDİ)

| Kim | Bugün | Onarımdan sonra |
|---|---|---|
| claim'siz normal kullanıcı | 54001 hatası | kendi satırı (1), hata yok |
| claim'siz **yönetici** | kararsız: canlıda 3 satır, gölgede 54001 | **yalnız kendi satırı (1)** — yönetici görüşü kaybı |
| claim'siz yönetici, DELETE | kararsız (gölgede 54001, canlıda çalışıyor) | **reddedilir (0 satır)** |
| hook biçimli jeton (bugünkü normal durum) | kullanıcı 1 · yönetici 2 | **aynı** (1 · 2) |
| hook biçimli yönetici, DELETE | çalışır | **çalışır (1)** |

Yani bu bir takastır: **claim'siz yönetici yetkisini kaybeder, claim'siz kullanıcı hatadan
kurtulur.** Bugünkü canlı akışta her jetonda `user_role` var, dolayısıyla günlük kullanımda fark
yok; fark yalnız hook kapanırsa ya da eski jeton kullanılırsa görünür — ve o durumda davranış
**kararsız hata yerine öngörülebilir kısıtlama** olur.

### Sessiz liste kaybı — adıyla, ama BU ŞERİDİN İŞİ DEĞİL

`src/views/admin/AdminUsersTableBody.tsx:264` listeyi ve `count` değerini doğrudan
`user_profiles`tan okur; e-postalar `admin_list_all_users()` (SECURITY DEFINER, RLS'i atlar)
RPC'sinden gelir. Eksiklik uyarısı `list.length < count` ile yanıyor; claim'siz yöneticide
`count`=1, RPC listesi=3 → uyarı **yanmaz**, sayfa sessizce tek kullanıcı gösterir. Aynı sınıf:
`src/lib/admin/search/resourceSearchers.ts:111`.

`src/**` **URUN'un şeridi** (pano kaydı) → bu dosyalara ALTYAPI dokunmaz. Bulgu URUN'a devredilir
ve REC-355'e ayrı kalem olarak yazılır (kural 14: ilgisiz değil ama başka sahipli iş → ayrı kayıt).

## 3. Ölçüm matrisi (gölge, `rollback`'li — canlıya yazma YOK)

Jeton şekilleri: **J1** `sub` yok · **J2** `sub`=profil rolü `user` · **J3** `sub`=profil rolü
`admin`, claim yok · **J4** hook biçimli `user_role=user` · **J5** hook biçimli `user_role=admin`.

| Kol | ÖNCESİ (ölçüldü) | SONRASI (ölçüldü) |
|---|---|---|
| J1 · `user_profiles` select | 54001 | 0 |
| J2 · `user_profiles` select | 54001 | 1 |
| J3 · `user_profiles` select | 54001 | 1 |
| J4 · `user_profiles` select | 1 | 1 |
| J5 · `user_profiles` select | 2 | 2 |
| J3 · `user_profiles` DELETE | 54001 | 0 (reddedildi) |
| J5 · `user_profiles` DELETE | — | 1 (çalışır) |
| J2/J4 · `is_user_admin(uid)` | false | false |
| J3 · `is_user_admin(uid)` | — | true |

**Gölgenin sadakat sınırları (ölçülerek bulundu, üçü de düzeltildi/adıyla yazıldı):**

1. `auth` şemasına `anon`/`authenticated` USAGE izni **yoktu** → yetki fonksiyonu "permission
   denied for schema auth" veriyordu. Canlıda izin var; gölgede verildi.
2. `auth.uid()` / `auth.role()` / `auth.jwt()` gölgede **sabit `null` döndüren taklitlerdi** →
   politika gövdesi hiç değerlendirilmiyordu, kusur **üretilemiyordu**. Canlı tanımlarıyla
   eşitlendi. **Bu, bugüne kadarki bütün gölge yetki ölçümlerini kör bırakan boşluktu.**
3. `user_profiles` gölgede **boştu**; boş tabloda politika gövdesi hiç çalışmaz. İki deneme
   kullanıcısı tohumlandı (`enforce_role_change` tetiği tohum sırasında yerel olarak kapatıldı).
   `auth.users` gölgede beş kolonlu bir taklittir. `product_prices` ve `coupons` **boş** → o iki
   tablonun kolları gölgede **ölçülemedi**; `is_user_admin` yolu doğrudan fonksiyon çağrısıyla
   ölçüldü.

`postgres` rolüyle yapılan deneme **kanıt değildir** (`bypassrls`), yalnız sağlık kontrolüdür.

## 4. Kapılar

- `INV-SEARCH-BEHAVIOR-1` rol kolu (`scripts/db/checks/arama-davranisi.mjs`): claim'siz
  `authenticated` kolu bu PR'da eklenir — kusur bir daha sessizce dönmesin.
- Yeni konformans kolu: `user_profiles` politikaları `is_admin_claim()` çağırıyor mu, fonksiyon
  tablo okumuyor mu (metin kolu), EXECUTE daraltması yerinde mi.
- `rls-yetki-karari-standard.md` §1 güncellenir: karar mercii **iki** fonksiyondur ve niçin ikiye
  ayrıldığı yazılır. `INV-AUTH-ROLE-2` bu sapmayı **sessiz geçiriyor** (dedektör `->> 'role'`
  arıyor), yani görünür tek fren cetvelin kendisidir.
- Migration kontrol listesi: damga 14 hane · yeni fonksiyona EXECUTE açıkça · politika adları
  birebir · tek işlem (koşucu `--single-transaction`) · geri alma satırı.

## 5. Riskler

1. **Migration merge = prod'a otomatik uygulanır** (kural 13) → merge yalnız Recep'in onayıyla
   (karar **43**).
2. `DROP POLICY` + `CREATE POLICY` `user_profiles` üzerinde kısa süreli ACCESS EXCLUSIVE kilit
   alır; tek işlem içinde, kabul edilebilir.
3. EXECUTE verilmezse politika `42501` verir — 09-17'nin canlı arıza sınıfı buydu; kol ölçer.
4. `jwt_tenant_id()` claim yoksa **sabit varsayılan tenant'a** düşüyor (canlı tanım). Tek tenant
   olduğu sürece görünmez; ikinci tenant geldiği gün varsayılan tenant çöp kovası olur. Bu işin
   kapsamı **değil** → ayrı kalem (REC-355 yorumu).
5. `public.is_admin()` ölü bir karar merciidir (INVOKER, `user_profiles` okur, `search_path`
   kardeşlerinden farklı, hiçbir politikada çağrılmıyor) → ayrı kalem.
