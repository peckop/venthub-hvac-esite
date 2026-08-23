# RBAC UI↔DB Parite Karnesi — `moderator` (2026-08-20)

**Üreten:** `scripts/db/checks/rbac-ui-db-parity.mjs` · **Şerit:** ADMIN-CUSTOMER · **İş:** T134-VH
**Ölçülen matris:** PR #714'ün daraltılmış 6 rotalı `moderator` listesi (master `f3ae845d`).
`--kuru` koşusu birleşmiş master'da aşağıdaki altı rotayı ve aynı tablo kümesini birebir
yeniden üretiyor — bu karne anlık fotoğraf değil, komutla tekrarlanabilir.

> **Bu karnenin ilk sürümü YANLIŞTI ve düzeltildi.** İlk sürüm altı rotayı da `KISMİ` diye
> işaretlemişti. AUTH (`99fa366e`) kimlik takma yönteminin sistematik bir kör noktasını
> bildirdi; ölçtüm, doğruladım ve **kendi eklediğim üçüncü aileyle** birlikte hükümler
> değişti. Aşağıdaki §2 bunu anlatır. Eski sürüm PR #718'in ilk commit'inde durur.

> **Tekrarlanabilirlik ÖLÇÜLDÜ (2026-08-23):** karne 08-20'de üretildi; üç gün ve ~70 PR
> sonraki master'da (`5e052853`) `--kuru` koşusu **birebir aynı** altı rotayı ve aynı tablo
> kümesini verdi. `ROLE_PAGE_ACCESS` bu sürede hiç değişmedi (`git diff` boş). Yani karnenin
> konusu bayat değil; iddia "tekrarlanabilir" sözünden ibaret kalmadı, **tekrarlandı**.

## 1. Bu karne ne diyor, ne demiyor

- **Der:** arayüz bir role şu rotayı vaat ediyor; o rolün kimliğiyle o rotanın okuduğu
  tablolar gerçekten satır veriyor mu.
- **Demez:** yazma yolunu ölçmez (yalnız SELECT). `rls-role-coverage.mjs` ile kesişmez —
  o DB-içi (politika var mı), bu DB↔UI (satır geliyor mu).

## 2. Yüklem aileleri — ölçümün NEREDE geçerli olduğu

> **SSOT:** ailelerin **tanımı ve gerekçesi** bu karnede değil,
> `docs/standards/db-grant-hygiene-standard.md` §3.2'dedir (LEGAL, PR #719 — 2026-08-20'de
> birleşti). Aşağısı o cetvelin **ölçülmüş uygulamasıdır**. Çelişkide: **tanım için cetvel,
> bugünkü değer için betik** — çünkü betik aileleri her koşuda canlı katalogdan türetir.

Yöntem: sahte bir `uid` ile `request.jwt.claims` takıp `set local role authenticated` demek,
sonra satır saymak. Bu yöntem **her yüklemi sınayamaz**. Aile ayrımı **metinden değil
davranıştan** türetildi — çünkü metin yanıltıyor:

| Yardımcı | Gövdesinde `user_profiles` | Admin iddiası + sahte uid ile dönen |
|---|---|---|
| `is_admin_user()` | **evet** | `true` — JWT dalı kısa devre yapıyor |
| `is_user_admin(uid)` | evet | `false` — profil satırı arıyor |

İkisi de `user_profiles` okuyor; **metinle ayırt edilemezler, davranışla edilirler.** Betik
artık her yardımcıyı admin iddiası altında **çağırıp** sınıflandırıyor.

| Aile | Tanım | Yöntem |
|---|---|---|
| **(A)** | JWT onurunu koruyan yüklem (`is_admin_user()`) | **geçerli** |
| **(B)** | Profil satırına bağımlı yüklem (`is_user_admin()`, `EXISTS … user_profiles`) | **KÖR** — sahte uid'in satırı yok, yüklem tablo dolu olsa da her zaman `false` |
| **(C)** | Rol yüklemi hiç yok (`tenant_id = jwt_tenant_id()`) | rol **sınanmıyor** — satır görmek yetkiyi kanıtlamaz |

**Sınıflandırıcının kendi körlüğü de bulundu ve kapatıldı:** `service_role` politikaları
`qual = true` taşır; rol süzgeci olmadan bakılınca "rol yüklemi yok" gibi görünüp tabloyu
yanlışlıkla (C) yapıyorlardı. Kısıt `qual`'de değil `pg_policies.roles` sütununda. Süzgeç eklendi.

### Neden negatif kontrolüm bunu yakalamadı

Kontrol kolum `is_admin_user()` admin'de `true`, moderator'de `false` idi ve **geçti** — çünkü
o kontrol **(A) ailesinden**. Kör olduğum aile **(B)** idi.
**Kontrol kolu, kör olduğun aileden seçilmezse körlüğü gizler.**

## 3. Tablo bazında ölçüm ve aile

| Tablo | Aile | `moderator` | `admin` | Okuma |
|---|---|---:|---:|---|
| `admin_audit_log` | **A** | **0** | **60** | ölçüldü — moderator KÖR |
| `venthub_orders` | **A** | **0** | **5** | ölçüldü — yönetim düzeyi okuma YOK |
| `venthub_returns` | A | 0 | 0 | kabul kolu kör (tablo boş) |
| `goods_receipts` | **B** | 0 | 0 | **ölçülemedi — yöntem kör** |
| `purchase_order_items` | **B** | 0 | 0 | **ölçülemedi — yöntem kör** |
| `purchase_orders` | **B** | 0 | 0 | **ölçülemedi — yöntem kör** |
| `suppliers` | **B** | 0 | 0 | **ölçülemedi — yöntem kör** |
| `coupons` | B/karma | 1 | 1 | aynı yüklemde hem profil-bağımlı dal hem `is_active` dalı var; satır **ikinci daldan** geliyor |
| `categories` | **C** | 31 | 31 | rol kapısı YOK |
| `products` | **C** | 374 | 374 | rol kapısı YOK |
| `product_images` | **C** | 0 | 0 | rol kapısı YOK |
| `inventory_settings` | **C** | 1 | 1 | rol kapısı YOK |
| `tenants` | **C** | 1 | 1 | rol kapısı YOK |
| `inventory_summary` | — | 374 | 374 | görünüm; kendi politikası yok, atfedilemez |

## 4. Rota bazında hüküm — `moderator`, 6 rota

Hüküm **yalnız (A) ailesindeki tablolardan** kurulur. (B) hükme katılmaz, (C) rolü sınamaz.

| Rota | Ölçülebilir (A) tablolar | Hüküm | Kör (B) | Rol kapısı yok (C) |
|---|---|---|---|---|
| `/admin` | `venthub_orders` 0/5 | **VAAT-BOŞ** | — | `products`, `inventory_summary` |
| `/admin/categories` | `admin_audit_log` 0/60 | **VAAT-BOŞ** | — | `categories`, `products` |
| `/admin/coupons` | `admin_audit_log` 0/60 | **VAAT-BOŞ** | `coupons` | `tenants` |
| `/admin/products` | `admin_audit_log` 0/60 | **VAAT-BOŞ** | — | `categories`, `products`, `product_images` |
| `/admin/inventory/settings` | `admin_audit_log` 0/60 | **VAAT-BOŞ** | — | `inventory_settings` |
| `/admin/purchasing` | `admin_audit_log` 0/60 | **VAAT-BOŞ** | `goods_receipts`, `purchase_order_items`, `purchase_orders`, `suppliers` | `products` |

## 5. Sonuç — ilk sürümden daha sert

**Ölçülebilir her tabloda moderator hiçbir şey görmüyor.** Moderator'ün satır gördüğü tablolar
— `categories`, `products`, `inventory_settings`, `tenants` — **rol kapısı taşımıyor**: o
satırları tenant içindeki *herhangi* bir oturum açmış kullanıcı da görür. Yani moderator'ün
yönetim yüzeyi bugün ya **rolden bağımsız açık** ya da **görünmez**; arada rolün gerçekten iş
gördüğü bir yüzey ölçülemedi.

İlk sürümdeki `KISMİ` hükümleri bunu **gizliyordu**: (C) tablolarındaki satırları "tutarlı"
sayınca rol yetkili görünüyordu, oysa o satırlar rolden gelmiyordu.

### Bulgu 1 — `admin_audit_log` yatay sessiz-boş (A ailesi, hüküm sağlam)

Denetim defteri altı rotanın **beşinde** okunuyor; moderator 0, admin 60. Yüklem
`tenant_id = jwt_tenant_id() AND is_admin_user()` — (A) ailesinden, yani bu **gerçek bir
ölçüm**, yöntem artefaktı değil. Rota listesini daraltmak bunu çözmez.

Karar gerekiyor (ADMIN-CUSTOMER'ın tek başına vereceği karar değil): panel moderator için
**gizlensin** (UI kararı) ya da politika moderator'ü **saysın** (migration = Recep kapısı).
Üçüncü seçenek — bugünkü hâl — sessiz-boş üretmeye devam eder.

### Bulgu 2 — `/admin/purchasing` ölçülemez, ve sebebi ilk sandığımdan güçlü

Bu rotanın listede kalma gerekçesi *"`purchase_orders` politikası `moderator`'ü açıkça
sayıyor"* — politika **metnine** dayanıyor. Dört tablosu da **(B) ailesinden**: sahte `uid`
ile o sorgu **tablo dolu olsa bile** 0 dönerdi. Yani "dört tablo boş" açıklaması yetersizdi.

Sonuç: satınalma defterine ilk satır girdiği gün ölçümü tekrarlamak **yetmez** — **gerçek bir
moderator kullanıcısı** da gerekir. (Ayrım AUTH'a ait; kendi tablolarımda doğruladım.)

**Not — "metne dayandı" eleştirisi burada geçerli değil:** AUTH gerekçesini `pg_policies`
**canlı kataloğundan** okumuştu, migration dosyasından değil. Katalog, DB'nin kendi beyanıdır.

### Bulgu 3 — rol matrisinin tamamı bugün kullanılmıyor

`user_profiles`'ta **toplam 2 satır** var ve **ikisi de `super_admin`** (AUTH ölçtü). Sistemde
hiç `moderator`, `admin`, `viewer`, `warehouse`, `sales` kullanıcısı yok. Bu, "moderator vaat
mi kalıntı mı" sorusunun **cevabını değiştirmez ama ağırlığını değiştirir**: bugün hiçbir
gerçek kullanıcı bu yüzeylerden etkilenmiyor, dolayısıyla onarım **acil değil ama ucuz** —
kimseyi bozmadan yapılabilecek bir pencere açık.

## 6. Sınırlar

1. Rota→tablo haritası **statik import yürüyüşüyle** çıkarılır. Koşul içinde seçilen tablo
   adı, şablon dizgesiyle kurulan ad ve RPC arkasındaki tablo **görünmez**.
2. Yürüyüş **yorumları atar**. Gerekçe ölçüldü: `ensureSessionFresh.ts` bir JSDoc örneğinde
   `.from('table')` yazıyor; ham tarama `table` adlı **hayali** tabloyu beş rotada gerçek sandı.
3. **Aynı yüklem içindeki ayrık dallar ayrıştırılamaz.** `coupons` bunun canlı örneği: tek
   politikada hem profil-bağımlı dal hem `is_active` dalı var; moderator'ün gördüğü satır
   ikincisinden geliyor ama betik tabloyu tek bir aileye koymak zorunda.
4. **Görünümlerin** kendi politikası yoktur; `inventory_summary` bir aileye atfedilemez.
5. Ölçüm **canlı prod DB'de** yapıldı; yalnız `SELECT`, her kol `begin`/`rollback` içinde,
   hiçbir yazma yok.
6. Betiğin **kendi canlı kolu bu koşuda çalıştırılamadı** (`SUPABASE_DB_URL` kimlik reddi).
   Sayılar aynı SQL şekliyle Supabase MCP üzerinden alındı; statik yarı `--kuru` ile,
   sözdizimi `node --check` ile doğrulandı. Bu satır, "betik uçtan uca koştu" izlenimi
   doğmasın diye burada.

## 6b. Sınıflandırmanın iki sınırı — LEGAL (#719) ile mutabık

### (TABLO, KOMUT) — tablo başına değil

Aynı tablo **SELECT'te (C), yazmada (B)** olabilir. `products` ve `categories` canlı örneği:
okuma yüklemi yalnız `tenant_id`, yazma yüklemi `user_profiles`'a JOIN eder (AUTH'un ölçümü).
Bu karne **yalnız SELECT** ölçer; sorgusu `cmd in ('SELECT','ALL')` ile sınırlıdır. Dolayısıyla
tablo–aile tablosu aslında **(tablo, SELECT) → aile** haritasıdır. **Yazma tarafına taşımak
yanıltır.**

### Önkoşul: JWT'de `user_role` claim'i bulunduğu varsayımı

(A)/(B) ayrımı, JWT'nin `user_role` claim'ini **taşıdığı** varsayımına dayanır. Claim yoksa
`is_admin_user()` yedek dalına düşer ve `user_profiles` okur — yani **(A) ailesi fiilen (B) gibi
çalışır** ve bu karnenin "ölçülebilir" dediği tablolar da ölçülemez hâle gelir.

Bu varsayım **SQL'den doğrulanamaz**: custom access token hook'unun açık olup olmadığı
veritabanı kataloğunda değil, projenin auth yapılandırmasında yaşar. Otorite burada **DB değil,
Supabase auth ayarıdır.** Karne bunu **ölçmez, varsayım olarak beyan eder** — yeşil verirken
neyi varsaydığını söylememiş olmamak için.

*(İki inceliği de LEGAL bildirdi; ilki AUTH'un ölçümünden geliyor.)*

## 7. Tekrar üretme

```
SUPABASE_DB_URL=... node scripts/db/checks/rbac-ui-db-parity.mjs --rol moderator
node scripts/db/checks/rbac-ui-db-parity.mjs --kuru      # bağımlılık gerektirmez
```
