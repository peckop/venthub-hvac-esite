# REC-355 VULN-002 + iki kardeşi — müşterinin sipariş verisine yazması kapanır (bekçi tetikleri) — PLAN v3, 2026-09-27

> **v3 (OPS hükmü 2026-09-27):** aynı sınıftan iki kardeş delik aynı pakete alındı — sipariş kalemi
> (`venthub_order_items`) ve iade kaydı (`venthub_returns`), bkz. §3b. Kapsam genişlediği için
> plan-challenger v3 ile BİR KEZ DAHA koşar.

**Cetvel:** `docs/standards/migration-safety-standard.md` (atomik uygulama, guard şablonu, tip/taban
maddesi) · `docs/standards/edge-security-standard.md` §3 · CLAUDE.md kural 11 (sipariş durumu monoton,
sunucu kaynaklı), 13 (merge = prod), 14 (tam iş). **Kayıt:** REC-355 (VULN-002 + 09-24 AUTH eki).
**Yöntem:** şerit (ALTYAPI), plan → plan-challenger (zorunlu) → PR. Merge = Recep kapısı (OPS karar
numarasıyla götürür).

**Çürütme geçmişi:** v1 bağımsız denetimden **KOŞULLU** döndü (2026-09-27, 6 şart). Çekirdek (tetik,
INVOKER, sıralama, istemciye sıfır yazma) doğrulandı; migration içindeki davranış doğrulaması iki
biçimde yanlış yeşil verebiliyordu, admin kolu ise canlıda gerçek bir siparişin `updated_at`'ini kalıcı
değiştirirdi. v2 şartların altısını da karşılar — eşleme §7'de.

## 1. Sorun (canlıda ölçüldü, 2026-09-27 salt okuma)

- `venthub_orders` ACL: `anon=awdDxtm/postgres` (SELECT yok; INSERT/UPDATE/DELETE/TRUNCATE/REFERENCES/
  TRIGGER/MAINTAIN var); `authenticated` tablo düzeyinde INSERT/UPDATE/DELETE. Kolon düzeyi ACL yok.
- `orders_update_policy` yalnız satır sahipliği: `tenant_id = jwt_tenant_id() AND (user_id = auth.uid()
  OR is_admin_user())`. Hangi kolonun değiştiğine bakılmıyor.
- Zincir: oturumlu müşteri kendi siparişine PostgREST ile `status='confirmed'` → `trg_sync_payment_status_upd`
  `payment_status='paid'` → `trg_stamp_order_paid_at` → `trg_notify_order_paid` onay e-postası.
  Para çekilmeden "ödendi". 09-24 eki: müşteri sıradaki `order_number`'ı yazarsa o günün siparişleri 23505 ile düşer.
- **Maruziyet bugün:** canlıda 5 sipariş, hiçbiri `paid` değil; satış kapalı; istismar izi 0.
  Satış açılmadan kapanması ŞART.

## 2. Yazma yüzeyi envanteri (bekçi kimin yolunu keser?)

| Yazan | Rol (current_user) | Ne yazar | Bekçiden sonra |
|---|---|---|---|
| `iyzico-payment` :496/:527 (sipariş oluşturma), :854 (payment_token) | service_role | INSERT/PATCH | etkilenmez |
| `iyzico-callback`, `iyzico-refund` :392, `order-housekeeping`, `release-expired-reservations`, `delivery-notification`, `_shared/refund_guard.ts` | service_role | UPDATE | etkilenmez |
| `shipping-webhook` :272 (istemci @152 service key), `order-paid-webhook` :202 (`paid_email_sent_at`) | service_role | UPDATE | etkilenmez |
| `admin-update-order`, `admin-update-shipping`, `admin-orders-latest` | service_role (kullanıcı JWT'si yalnız kimlik doğrulamada) | UPDATE/SELECT | etkilenmez |
| `fn_admin_update_order_status` (EXECUTE yalnız service_role), `anonymize_user_personal_data` (gövdede `is_admin_user()` yoksa `forbidden`) | SECURITY DEFINER, sahip postgres | UPDATE | etkilenmez (current_user = postgres) |
| `src/lib/orderStatusService.ts` :130/:143/:150/:262, `OrderFormModal.tsx` :340 | authenticated + admin claim | UPDATE | etkilenmez (admin muafiyeti) |
| Müşteri yüzleri (`CartProvider`, `useCheckoutPayment`, `PaymentWatcher`, `PaymentSuccessPage`, `OrdersPage`, `account/*`), admin okumaları (`OrdersTableBody` :298/:656, `OrderFormModal` :175), Realtime | authenticated / anon | **yalnız SELECT** | etkilenmez |
| FK referans eylemleri (`user_id`, `tenant_id` ON DELETE CASCADE) | tablo sahibi | DELETE | tetik INSERT/UPDATE'e bağlı, DELETE'e değil |

Yöntem: `git grep venthub_orders` (src + supabase/functions) + kullanıcı JWT'li istemcinin `.from/.rpc`
çağrısı (0) + canlı `pg_proc.prosrc ilike '%venthub_orders%'` (6 fonksiyon, yazanı 2, ikisi DEFINER/postgres)
+ kural (rule) yok + görünümler security_invoker (görünüm üzerinden UPDATE'te current_user çağıran kalır).
**Sonuç (denetçi de doğruladı): istemci rolüyle, admin olmadan sipariş satırına yazan meşru yol YOK.**

## 3. Onarım (tek migration)

Dosya: `supabase/migrations/20260927162755_rec355_siparis_kolon_bekcisi.sql`, biçim (a) `begin…commit`,
başta `set lock_timeout = '5s';` (emsal `20260925082744_quote_yayim_sunucu.sql`).

1. **Bekçi fonksiyonu** `public.istemci_yazma_bekcisi()` — `create or replace`, `language plpgsql`,
   **SECURITY INVOKER**, `set search_path = public, pg_temp`.
   **Kural İZİN LİSTESİ** (şart 2'nin önerisi): `current_user not in ('service_role','postgres','supabase_admin')
   and not public.is_admin_claim()` ise
   `raise exception 'REC355_BEKCI: siparis satirina istemciden yazilamaz' using errcode = '42501'`.
   Yasak listesi (`in ('anon','authenticated')`) yeni bir API rolü eklenince sessizce açık kalırdı.
   Mesaj kısa ve iç ayrıntısız (müşteriye PostgREST gövdesinde döner); `REC355_BEKCI` işareti
   doğrulamanın RLS'ten ve yetki hatasından ayırt ettiği imzadır (42501 üçünde de aynı).
   - `is_admin_claim()`: claim yoksa tabloya düşmez (54001 döngüsü #1258'de bu yüzden kesildi).
   - Kolon listesi YOK — istemci rolünün hiçbir kolona yazması gerekmiyor (§2); liste tutmak yeni
     kolonda sessiz delik açar (bugünkü delik de öyle doğdu).
2. **Tetik:** `drop trigger if exists orders_istemci_yazma_bekcisi on public.venthub_orders;` +
   `create trigger orders_istemci_yazma_bekcisi before insert or update on public.venthub_orders for each row`.
   Ad `o` ile başlar → BEFORE tetikleri ada göre (C sırası) koşar: `set_order_number_trigger`, `trg_*`,
   `update_*`'ten önce; istemcinin ham değerini görür. Reddedilince ifade iptal olur, AFTER tetiği
   (`trg_notify_order_paid`) kuyruğa girmez, pg_net çağrısı aynı işlemde geri alınır (denetçi doğruladı).
3. **Derinlik:** `revoke all on public.venthub_orders from anon;` (anon'un SELECT'i zaten yok, hiçbir
   yolda yazmıyor; TRUNCATE dahil — TRUNCATE RLS'i ve satır tetiklerini atlar). `authenticated` tablo
   yetkisi DURUR (admin ekranları bu rolle yazıyor; kapı tetikte).
4. **Fonksiyon yetkisi:** `revoke all on function public.istemci_yazma_bekcisi() from public, anon, authenticated;`
   (tetik fonksiyonunun EXECUTE'u yalnız CREATE TRIGGER anında denetlenir; kaldırmak bekçiyi bozmaz).
5. **Kendini doğrulama (guard) — dosyanın EN SONUNDA, yalnız YAPISAL + MÜŞTERİ KOLU:**
   - Yapısal: tetik var, BEFORE INSERT OR UPDATE, fonksiyon `prosecdef = false`;
     `has_table_privilege('anon', …, 'INSERT'/'UPDATE'/'DELETE'/'TRUNCATE')` hepsi false ve
     `has_any_column_privilege('anon', …, 'INSERT'/'UPDATE')` false.
   - **Müşteri kolu** (şart 1 + 2): `user_id` dolu bir sipariş seçilir. Alt blok (`begin … exception … end`
     = örtük savepoint) içinde, `set_config('role','authenticated',true)` ve claim'ler AÇIKÇA:
     `{"role":"authenticated","sub":<user_id>,"user_role":"user","app_metadata":{"tenant_id":<t>,"user_role":"user"}}`
     (`jwt_tenant_id()` kiracıyı YALNIZ `app_metadata.tenant_id`'den okur — canlı tanım).
     a) **Ön koşul, ayrı ifade:** aynı rol + claim'lerle `select count(*) … where id = X` = 1; değilse
        `raise exception 'guard: on kosul — satir gorunmuyor'` (RLS satırı elerse tetik hiç koşmaz → yanlış yeşil).
     b) `update … set status = status where id = X` → yalnız mesajında `REC355_BEKCI` olan hata GEÇTİ sayılır
        (`get stacked diagnostics v_msg = message_text`). Başka 42501 (RLS WITH CHECK, yetki) → `raise`.
        Hata GELMEZSE → `raise exception 'guard: bekci atesmedi'`.
     c) Rol ve claim'ler alt blok hatayla geri sarılınca otomatik geri döner; hatasız yol yok (b her koşulda raise eder).
     Müşteri kolu hiçbir koşulda satır DEĞİŞTİRMEZ (bekçi reddeder; reddetmezse guard raise eder, migration
     bütünüyle geri alınır).
   - Sipariş yoksa (0 satır): müşteri kolu NOTICE ile adıyla atlanır. Canlıda 5 satır var.
   - **Admin kolu migration'da YOK** (şart 3): başarılı güncelleme alt blokta geri alınmaz ve
     `update_venthub_orders_updated_at` gerçek siparişin damgasını kalıcı değiştirirdi. Admin kolu gölgede
     ve canlı kabulde (tek çağrıda, `rollback`'li) ölçülür.

**Geri alma** (dosya başı yorumu): `drop trigger orders_istemci_yazma_bekcisi on public.venthub_orders;
drop function public.istemci_yazma_bekcisi(); grant insert, update, delete, truncate, references,
trigger on public.venthub_orders to anon;` (MAINTAIN PG17'de ayrı; önceki ACL `anon=awdDxtm` birebir).

## 3b. Kardeş delikler (v3) — aynı migration

**Ölçüm (canlı, 2026-09-27):** iki tablonun ACL'si de `anon=awdDxtm`, `authenticated=arwdDxtm`.
Satır: `venthub_order_items` 6, `venthub_returns` 1 (`approved`).

**(a) `venthub_order_items`** — `venthub_order_items_insert_optimized` (authenticated, INSERT): satır sahibi
müşteri KENDİ siparişine `unit_price`, `total_price`, `quantity` serbest kalem ekleyebilir. UPDATE/DELETE
politikası yok. **İstemciden yazan kod YOK:** `src` ve `supabase/functions` taramasında `venthub_order_items`
yalnız SELECT (gömülü `venthub_order_items (…)`) — kalemleri `iyzico-payment` service_role ile yazıyor.
→ **Onarım:** §3'teki bekçi fonksiyonu genelleştirilir — ad `public.istemci_yazma_bekcisi()` (tabloya
bağımsız; mesajda `TG_TABLE_NAME`) — ve `venthub_order_items` üzerine de `before insert or update` tetiği
`order_items_istemci_yazma_bekcisi` olarak bağlanır. Aynı izin listesi, aynı `REC355_BEKCI` işareti.
`revoke all on public.venthub_order_items from anon;`. Politika DURUR (admin ekranı bugün kalem yazmıyor;
düşürmek ayrı karar, bekçi zaten reddeder).

**(b) `venthub_returns`** — `returns_insert_policy` müşterinin KENDİ siparişine iade açmasına izin veriyor
(meşru özellik: `AccountReturnsPage.tsx:131-137` yalnız `order_id, user_id, reason, description` gönderir).
Ama satırın yönetici alanları da serbest: müşteri `status='approved'`, `refund_amount`, `admin_notes`,
`approved_at/processed_at/completed_at` yazarak iadeyi "onaylanmış" açabilir. UPDATE politikası zaten
yalnız admin. Admin iade açma yolu: `orderStatusService.ts:307` (admin claim).
→ **Onarım:** ayrı fonksiyon `public.iade_istemci_kayit_bekcisi()` (INVOKER, aynı izin listesi) +
tetik `iade_istemci_kayit_bekcisi` `before insert or update on public.venthub_returns`:
- ayrıcalıksız istemci **INSERT**: `status <> 'requested'` ya da `refund_amount`, `admin_notes`,
  `approved_at`, `processed_at`, `completed_at`'ten biri dolu ise `REC355_BEKCI` ile ret. Sunucu damgaları
  **ezilir** (ret değil): `requested_at := now()`, `created_at := now()`, `updated_at := now()` — istemci
  bunları göndermiyor, geriye tarih atmayı kapatır, meşru formu kırmaz.
- ayrıcalıksız istemci **UPDATE**: `REC355_BEKCI` ile ret (politika zaten admin-only; derinlik).
- `revoke all on public.venthub_returns from anon;`.
Kolon listesi burada BİLİNÇLİ: tablo müşteriye yarı açık (INSERT meşru), yasaklı alanlar yöneticinin
alanları. Yeni yönetici alanı eklenirse INV kolu (g) bunu yakalar (aşağıda).

**Guard (migration sonu, yalnız ret kolları — hiçbiri satır değiştirmez):** (a) müşteri claim'iyle kendi
siparişine kalem INSERT → `REC355_BEKCI`; (b) müşteri claim'iyle `status='approved'` iade INSERT →
`REC355_BEKCI`. Ön koşul sayımı (sipariş görünür = 1) ayrı ifadede; hata gelmezse `raise` (yanlış yeşil
yok; beklenmeyen başarı durumunda da migration bütünüyle geri alınır). **Meşru iade INSERT kolu migration'da
YOK** (canlıya satır yazar) → gölge + rollback'li canlı kabul.

## 4. Kilit (INV) ve testler

- **INV-SIPARIS-ISTEMCI-YAZMA-1** (`src/__tests__/conformance/siparis-istemci-yazma-bekcisi.test.ts`), migration
  zincirinde: (a) `venthub_orders` üzerinde BEFORE INSERT OR UPDATE bekçi tetiği var; (b) bekçi INVOKER,
  `is_admin_claim()` kullanır, kural İZİN listesi (`not in (…service_role…)`) — yasak listesine dönüş KIRMIZI;
  (c) `REC355_BEKCI` işareti var; (d) anon'a sonraki bir migration'da yazma yetkisi geri verilirse KIRMIZI;
  (e) sonraki migration tetiği/fonksiyonu düşürürse KIRMIZI; (f) guard müşteri kolunda ön koşul sayımı ve
  işaret denetimi var (yanlış yeşile karşı); (g) v3: aynı bekçi `venthub_order_items`'a bağlı, iade bekçisi
  `venthub_returns`'a bağlı; iade bekçisinin yasaklı alan listesi, tablonun müşteri formunda OLMAYAN her
  kolonunu kapsar (yeni kolon eklenip listeye girmezse KIRMIZI — kolon evreni migration zincirinden/taban
  şemasından okunur, izinli küme `order_id, user_id, reason, description, tenant_id` + sunucu damgaları + `id`);
  anon'a üç tablodan birine yazma geri verilirse KIRMIZI. Her ihlal ayrı sabotaj koluyla üretilir (emsal
  `quote-yayim-sunucu.test.ts`); dosyalar okunurken `\r\n → \n` (bugünkü #1442 dersi).
- **Gölge DB** (`node scripts/db/golge-kur.mjs --ad rec355`, psql `-v ON_ERROR_STOP=1`): senaryo satırı
  KENDİ kurar (kiracı + user_id + status `processing`, payment_status `failed` — onay zinciri tetiklenmez).
  Kollar: müşteri → `REC355_BEKCI`; admin claim → güncelleme 1 satır; service_role → geçer; anon INSERT →
  yetki hatası; müşteri INSERT → `REC355_BEKCI`. Her kolda ön koşul AYRI sorguyla ölçülür (gölgede
  `auth.uid()` NULL; claim'ler `request.jwt.claims` ile).
- **Canlı kabul (merge + uygulama sonrası):** tek `execute_sql` çağrısında `begin; … rollback;`:
  müşteri claim'iyle ön koşul 1 + UPDATE → `REC355_BEKCI`; admin claim'iyle (satır `confirmed`+`pending`
  DIŞINDA seçilir) güncelleme sayısı 1 → `rollback`. Yetki tablosu: anon her yazma yetkisi false.

## 5. Yan etkiler ve sıra

- Şemanın görünen yüzü değişmez (tetik fonksiyonları tip dosyasına girmiyor — mevcutların hiçbiri yok)
  → tip dosyası değişmez. **Şema tabanı değişir** → merge günü `sema-tabani-uret.yml` (INV-TABAN-TAZE-1), ALTYAPI.
- Admin oturumunun JWT'sinde claim yoksa admin sipariş güncelleyemez (fail-closed). **Kanca canlıda AÇIK —
  2026-09-27 taze ölçüm:** Management API `hook_custom_access_token_enabled = true`,
  uri `pg-functions://postgres/public/custom_access_token_hook`. Kanca rolü `user_profiles.role`'den kök
  `user_role` ve `app_metadata.user_role`'e yazar. Canlı roller: super_admin ×2, user ×1.
- CREATE TRIGGER `venthub_orders` üzerinde SHARE ROW EXCLUSIVE kilit alır; tablo 5 satır, `lock_timeout 5s`.

## 6. Kapsam dışı — ADIYLA (kural 14; kayıtlar OPS üzerinden, Linear 247/250 dolu)

1. **Admin yolu DB'de sınırsız:** bekçi admin claim'li oturumu bırakır; DB'de sipariş durumunun yalnız ileri
   gitmesini (kural 11) ve `payment_status`/`order_number`/`total_amount`'ın yalnız sunucudan yazılmasını
   zorlayan tetik YOK. Admin hesabı ele geçirilirse ya da admin ekranında XSS olursa bu bekçi durdurmaz.
2. ~~Kardeş delik — sipariş kalemi~~ → v3'te bu pakete ALINDI (§3b a).
3. ~~Kardeş delik — iade durumu~~ → v3'te bu pakete ALINDI (§3b b).
   Kalem 1 ve 4 OPS hükmüyle **ikinci DB paketi** (planı sonra); ikisi de **satış açılış ön koşulu**.
4. **Saklama:** `venthub_orders.user_id → auth.users ON DELETE CASCADE` kullanıcı silinince siparişleri siler
   (VUK/TTK 10 yıl saklama yükümlülüğüyle çelişir).
5. `authenticated` rolünün tablo düzeyi TRUNCATE yetkisi (PostgREST çalıştıramaz; derinlik borcu).

## 7. Çürütme şartları → v2 karşılığı

| Şart | v2 |
|---|---|
| 1 (5b) müşteri kolu yanlış yeşil — RLS eler | §3.5 a: claim'ler `app_metadata.tenant_id` ile açık, ön koşul sayımı ayrı ifade, "hata gelmedi" = raise |
| 2 (5c) 42501 belirsiz | §3.1 `REC355_BEKCI` işareti, §3.5 b `get stacked diagnostics` |
| 3 (5d) admin kolu prod satırını kalıcı değiştirir | admin kolu migration'dan ÇIKARILDI; gölge + rollback'li canlı kabul, satır seçimi `confirmed`+`pending` dışı |
| 4 (3) kanca taze ölçülsün | §5: 2026-09-27 Management API `true` |
| 5 (8) lock_timeout + tekrar koşulabilir DDL | §3: `set lock_timeout`, `create or replace`, `drop trigger if exists` |
| 6 (7) admin sınırsızlığı + kardeş delikler yazılsın | §6, beş kalem, kayıt OPS'a |
| öneri: izin listesi | §3.1 uygulandı + INV kolu (b) |
| öneri: `revoke all from anon` | §3.3 uygulandı + guard `has_any_column_privilege` |
| öneri: envanter tamamlansın | §2 dört satır eklendi; `anonymize_user_personal_data` cümlesi düzeltildi (yalnız admin) |
