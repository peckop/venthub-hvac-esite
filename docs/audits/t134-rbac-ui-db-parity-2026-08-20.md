# RBAC UI↔DB Parite Karnesi — `moderator` (2026-08-20)

**Üreten:** `scripts/db/checks/rbac-ui-db-parity.mjs` · **Şerit:** ADMIN-CUSTOMER · **İş:** T134-VH
**Ölçülen matris:** PR #714'ün daraltılmış 6 rotalı `moderator` listesi. Ölçüm PR henüz açıkken
dal üzerinde yapıldı; #714 `f3ae845d` ile master'a indikten sonra karne **yeniden üretilerek
doğrulandı** — `--kuru` koşusu birleşmiş master'da tam olarak aşağıdaki altı rotayı ve aynı
tablo kümesini veriyor. Yani bu karne bir anlık fotoğraf değil, komutla tekrarlanabilir.

## Bu karne ne diyor, ne demiyor

- **Der:** arayüz bir role şu rotayı vaat ediyor; o rolün kimliğiyle o rotanın okuduğu tablolar
  gerçekten satır veriyor mu.
- **Demez:** yazma yolunu ölçmez (yalnız SELECT). Politika **metnini** okumaz, **davranışını**
  ölçer. `rls-role-coverage.mjs` ile kesişmez — o DB-içi (politika var mı), bu DB↔UI (satır
  geliyor mu). Ayrım betiğin baş yorumunda yazılı.

## Ölçüm kurulumu ve ayırt edicilik kanıtı

Kimlik `request.jwt.claims` ile takıldı, ardından `set local role authenticated`. **Sonda kör
değil** — ayırt edici kontrol koşuldu:

| Kimlik | `is_admin_user()` |
|---|---|
| `user_role: admin` | `true` |
| `user_role: moderator` | `false` |

`sub` **sentetik** bir UUID'dir. "Kendi satırın VEYA admin" biçimli politikalar bu kimliğe doğal
olarak sıfır satır verir — bu, *yönetim ekranı olarak boş* demektir ve doğru semantiktir.

## Tablo bazında ham ölçüm (14 tablo, iki kol)

| Tablo | `moderator` | `admin` (kabul kolu) | Okuma |
|---|---:|---:|---|
| `admin_audit_log` | **0** | **60** | moderator KÖR, admin görüyor |
| `categories` | 31 | 31 | tutarlı |
| `coupons` | 1 | 1 | tutarlı |
| `inventory_settings` | 1 | 1 | tutarlı |
| `inventory_summary` | 374 | 374 | tutarlı |
| `products` | 374 | 374 | tutarlı |
| `tenants` | 1 | 1 | tutarlı |
| `venthub_orders` | **0** | **5** | moderator KÖR, admin görüyor |
| `goods_receipts` | 0 | 0 | **ölçülemedi** — tablo boş, kabul kolu kör |
| `product_images` | 0 | 0 | **ölçülemedi** — tablo boş |
| `purchase_order_items` | 0 | 0 | **ölçülemedi** — tablo boş |
| `purchase_orders` | 0 | 0 | **ölçülemedi** — tablo boş |
| `suppliers` | 0 | 0 | **ölçülemedi** — tablo boş |
| `venthub_returns` | 0 | 0 | **ölçülemedi** — tablo boş |

`0/0` satırlar **"temiz" değildir**: admin de göremediği için o tablo hakkında hüküm verilemez.
Bunları "geçti" saymak, tam olarak bu karnenin engellemek için var olduğu hatadır.

## Rota bazında hüküm — `moderator`, 6 rota

| Rota | Hüküm | Dayanak |
|---|---|---|
| `/admin` | KISMİ | 2/3 görünür tabloda satır var; `venthub_orders` boş (admin 5) |
| `/admin/categories` | KISMİ | 2/3; `admin_audit_log` boş (admin 60) |
| `/admin/coupons` | KISMİ | 2/3; `admin_audit_log` boş |
| `/admin/products` | KISMİ | 2/3; `admin_audit_log` boş |
| `/admin/inventory/settings` | KISMİ | 1/2; `admin_audit_log` boş |
| `/admin/purchasing` | KISMİ | 1/2; satınalma tablolarının **hepsi** ölçülemez durumda |

**Altı rotanın altısı da KISMİ.** Yani #714'ün daraltması doğru yöne gitti (VAAT-BOŞ kalmadı),
ama hiçbir rota tam tutarlı değil.

## İki bulgu — biri yaygın, biri yapısal

### 1. `admin_audit_log` sistematik sessiz-boş (moderator 0, admin 60)

Denetim defteri **altı rotanın beşinde** okunuyor ve moderator hiçbirinde satır görmüyor.
Sayfa açılır, ekranın denetim paneli boş gelir, hata yoktur. Bu tek bir rotanın kusuru değil,
**yatay** bir sınıftır: rota listesini daraltmak onu çözmez, çünkü kalan rotalarda da var.

Karar gerektirir (ADMIN-CUSTOMER'ın kendi başına vereceği karar değil): ya denetim paneli
moderator için **gizlenir** (UI kararı), ya politika moderator'ü **sayar** (migration = Recep
kapısı). Üçüncü seçenek — bugünkü hâl — sessiz-boş üretmeye devam eder.

### 2. `/admin/purchasing`'in gerekçesi bugün **ölçülemez**

`rbac.ts` bu rotayı moderator listesinde tutuyor ve gerekçesi *"`purchase_orders` politikası
`moderator`'ü AÇIKÇA sayıyor"* — yani **politika metnine** dayanıyor. Davranışsal ölçüm bunu
bugün **doğrulayamaz**: `purchase_orders`, `purchase_order_items`, `suppliers`, `goods_receipts`
tablolarının **dördü de boş**, dolayısıyla kabul kolu da kör.

Bu bir çelişki değil, bir **kanıt boşluğu**dur ve öyle yazılmalıdır: gerekçe metinden geliyor,
davranıştan gelmiyor. Satınalma defterine ilk gerçek satır girdiği gün bu ölçüm tekrarlanmalı —
o gün gerekçe ya doğrulanır ya düşer. Bugün "doğru" demek de "yanlış" demek de ölçümün
söylemediğini söyletmek olur.

## Sınırlar (betiğin baş yorumundakiyle aynı, burada tekrarı kasıtlı)

1. Rota→tablo haritası **statik import yürüyüşüyle** çıkarılır. Koşul içinde seçilen tablo adı,
   şablon dizgesiyle kurulan ad ve RPC arkasındaki tablo **görünmez**.
2. Yürüyüş **yorumları atar**. Gerekçe ölçüldü: `ensureSessionFresh.ts` bir JSDoc örneğinde
   `.from('table')` yazıyor ve ham tarama `table` adlı **hayali** bir tabloyu beş rotada birden
   gerçek sandı. Örnek kod, kod değildir.
3. Ölçüm **canlı prod DB'de** yapıldı; yalnız `SELECT`, her kol `begin`/`rollback` içinde,
   hiçbir yazma yok.
4. Betiğin kendi canlı kolu bu koşuda `SUPABASE_DB_URL` ile **çalıştırılamadı** (kimlik doğrulama
   reddi). Karnedeki sayılar Supabase MCP üzerinden **aynı SQL şekliyle** alındı; betiğin statik
   yarısı (`--kuru`) doğrulandı. Bağlantı dizesi tazelenince uçtan uca tek komutla üretilebilir.
   Bu satır, "betik koştu" izlenimi vermemek için burada.

## Tekrar üretme

```
SUPABASE_DB_URL=... node scripts/db/checks/rbac-ui-db-parity.mjs --rol moderator
node scripts/db/checks/rbac-ui-db-parity.mjs --kuru      # bağımlılık gerektirmez
```
