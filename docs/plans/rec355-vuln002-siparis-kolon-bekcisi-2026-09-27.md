# REC-355 VULN-002 — sipariş satırına istemciden yazma kapanır (kolon bekçisi) — PLAN, 2026-09-27

**Cetvel:** `docs/standards/migration-safety-standard.md` (atomik uygulama, guard şablonu, tip/taban
maddesi) · `docs/standards/edge-security-standard.md` §3 · CLAUDE.md kural 11 (sipariş durumu monoton,
sunucu kaynaklı) ve kural 13 (merge = prod). **Kayıt:** REC-355 (VULN-002 + 09-24 AUTH eki).
**Yöntem:** şerit (ALTYAPI), plan → plan-challenger (zorunlu: migration + ödeme yolu) → PR.
Merge = Recep kapısı (OPS karar numarasıyla götürür).

## 1. Sorun (canlıda ölçüldü, 2026-09-27 salt okuma)

- `anon` ve `authenticated` rollerinin `venthub_orders` üzerinde `status, payment_status, paid_at,
  order_number, total_amount, payment_token` kolonlarında **INSERT ve UPDATE** yetkisi var
  (`information_schema.column_privileges`).
- `orders_update_policy` yalnız satır sahipliğine bakıyor: `tenant_id = jwt_tenant_id() AND
  (user_id = auth.uid() OR is_admin_user())`. Hangi kolonun değiştiği denetlenmiyor.
- Zincir: oturumlu müşteri kendi siparişine PostgREST ile `status='confirmed'` yazar →
  `trg_sync_payment_status_upd` `payment_status='paid'` yapar → `trg_stamp_order_paid_at` `paid_at`
  damgalar → `trg_notify_order_paid` (AFTER UPDATE, paid_at NULL→dolu) onay e-postası kuyruğa girer.
  Para çekilmeden "ödendi" siparişi. Stok düşmez (RPC service_role).
- 09-24 eki: müşteri kendi siparişine sıradaki `order_number`'ı yazarsa sonraki meşru INSERT
  23505 ile düşer → o gün kalan siparişler düşer (hizmet dışı bırakma).
- **Maruziyet bugün:** canlıda 5 sipariş, hiçbiri `paid` değil; satış kapalı. İstismar izi 0.
  Satış açılmadan kapanması ŞART.

## 2. Yazma yüzeyi envanteri (kim bu tabloya yazıyor — onarım kimin yolunu keser?)

| Yazan | Rol (current_user) | Ne yazar | Bekçiden sonra |
|---|---|---|---|
| `iyzico-payment` (sipariş oluşturma, satır 496/527) | service_role | INSERT | etkilenmez |
| `iyzico-callback`, `order-housekeeping`, `release-expired-reservations`, `delivery-notification`, `_shared/refund_guard.ts` | service_role | UPDATE | etkilenmez |
| `admin-update-order`, `admin-update-shipping`, `admin-orders-latest` (Edge) | service_role | UPDATE/SELECT | etkilenmez |
| `fn_admin_update_order_status`, `anonymize_user_personal_data` | SECURITY DEFINER, sahip postgres | UPDATE | etkilenmez (current_user = postgres) |
| `src/lib/orderStatusService.ts` (130/143/150/262), `OrderFormModal.tsx:340` | authenticated + admin claim | UPDATE | etkilenmez (admin muafiyeti) |
| Müşteri yüzleri: `CartProvider`, `useCheckoutPayment`, `PaymentWatcher`, `PaymentSuccessPage`, `OrdersPage`, `account/*` | authenticated / anon | **yalnız SELECT** | etkilenmez |

Envanter yöntemi: `git grep venthub_orders` (src + supabase/functions, origin/master a897d771a) +
canlı `pg_proc.prosrc ~* 'update|insert into venthub_orders'` (2 fonksiyon, ikisi DEFINER).
**Sonuç: istemci rolüyle, admin olmadan sipariş satırına yazan meşru yol YOK.**

## 3. Onarım (tek migration)

Dosya: `supabase/migrations/20260927162755_rec355_siparis_kolon_bekcisi.sql`, biçim (a) `begin…commit`.

1. **Bekçi fonksiyonu** `public.orders_istemci_yazma_bekcisi()` — `language plpgsql`,
   **SECURITY INVOKER** (current_user'ı çağıranın rolü olarak görmesi için), `set search_path = public, pg_temp`.
   Kural: `current_user in ('anon','authenticated') and not public.is_admin_claim()` ise
   `raise exception ... using errcode = '42501'`. Diğer her rol (service_role, postgres, DEFINER
   sahipleri) ve admin claim'li oturum geçer.
   - `is_admin_claim()` seçildi, `is_admin_user()` DEĞİL: claim yoksa tabloya düşmez (54001 döngüsü
     #1258'de bu yüzden kesildi); claim'siz oturum fail-closed reddedilir.
   - Kolon listesi YOK — istemci rolünün hiçbir kolona yazması gerekmiyor (§2). Kolon listesi
     tutmak, yeni kolon eklendiğinde sessiz delik açar (bugünkü delik de böyle doğdu).
2. **Tetik** `orders_istemci_yazma_bekcisi` — `before insert or update on public.venthub_orders
   for each row`. Ad `o` ile başlıyor: BEFORE tetikleri ada göre sıralanır; `set_order_number_trigger`,
   `trg_*`, `update_*` tetiklerinden ÖNCE koşar → istemcinin gönderdiği ham değer görülür, sonraki
   tetiklerin ürettiği değer değil.
3. **Derinlik:** `revoke insert, update, delete on public.venthub_orders from anon;` (anon hiçbir
   yolda yazmıyor; RLS zaten user_id eşleşmesi istiyor). `authenticated` yetkisi DURUR — admin
   ekranları authenticated rolüyle yazıyor; kapı tetikte.
4. **Fonksiyon yetkisi:** `revoke all on function public.orders_istemci_yazma_bekcisi() from public, anon, authenticated;`
   (yalnız tetik çağırır; tetik fonksiyonu EXECUTE yetkisi olmadan da tetikten koşar).
5. **Kendini doğrulama (guard, aynı işlemde):**
   - tetik var ve `BEFORE INSERT OR UPDATE`, fonksiyon `prosecdef = false`;
   - `has_table_privilege('anon','public.venthub_orders','UPDATE') = false` (INSERT, DELETE aynı);
   - **davranış kolu:** `set local role authenticated` + müşteri claim'i (`user_role=customer`,
     `tenant_id` mevcut bir siparişin kiracısı, `sub` o siparişin `user_id`'si) ile bir siparişte
     `update ... set status = status` → 42501 beklenir; admin claim'i ile aynı güncelleme geçer;
     `reset role`. Sipariş yoksa (boş DB/gölge) davranış kolu adıyla atlanır ve NOTICE yazar.
     ⚠ Davranış kolu gerçek satırda `status = status` (değişmeyen) günceller; `updated_at` tetiği
     damgayı değiştirir → bu kol ayrı `savepoint`/istisna bloğunda koşar ve geri alınır.

**Geri alma** (dosya başına yorum): `drop trigger orders_istemci_yazma_bekcisi on public.venthub_orders;
drop function public.orders_istemci_yazma_bekcisi(); grant insert, update, delete on public.venthub_orders to anon;`

## 4. Kilit (INV) ve testler

- **INV-SIPARIS-ISTEMCI-YAZMA-1** (`src/__tests__/conformance/siparis-istemci-yazma-bekcisi.test.ts`):
  migration zincirinde (a) `venthub_orders` üzerinde BEFORE INSERT OR UPDATE bekçi tetiği var,
  (b) bekçi `is_admin_claim()` kullanır ve INVOKER'dır, (c) anon'a INSERT/UPDATE/DELETE geri
  verilmemiş (zincirde sonraki `grant ... to anon` KIRMIZI), (d) sonraki bir migration tetiği
  düşürürse KIRMIZI. Sabotaj kolları her ihlali ayrı üretir (emsal `quote-yayim-sunucu.test.ts`).
  Dosyalar okunurken satır sonu normalleştirilir (bugün #1442'de çıkan Windows dersi).
- **Gölge DB:** `node scripts/db/golge-kur.mjs --ad rec355` + psql `-v ON_ERROR_STOP=1`: müşteri
  claim'iyle UPDATE → 42501; admin claim'iyle → geçer; service_role → geçer; anon INSERT → 42501
  (yetki). ⚠ Gölgede `auth.uid()` NULL (standart notu) → müşteri kolu `request.jwt.claims` ile kurulur,
  ön koşul (satır var, claim set) AYRI sorguyla ölçülür (hafıza: senaryo kurulumu doğrulanmadan sonuç okunmaz).
- **Canlı kabul (merge sonrası, salt okuma + geri alınan işlem):** `begin; set local role authenticated;
  set_config(claims müşteri); update ... ; rollback;` → 42501. Admin claim'iyle → güncelleme sayısı 1, rollback.
  Yetki tablosu: anon INSERT/UPDATE/DELETE false.

## 5. Yan etkiler ve sıra

- **Şemanın görünen yüzü değişmez** (tablo/kolon/imza yok; yalnız tetik + yetki) → tip dosyası
  değişmez. **Şema tabanı değişir** (yeni fonksiyon + tetik) → merge günü `sema-tabani-uret.yml`
  (INV-TABAN-TAZE-1). ALTYAPI yapar.
- Admin oturumunun JWT'sinde claim yoksa (kanca kapalı) admin ekranı sipariş güncelleyemez
  (fail-closed). Kanca canlıda etkin (09-17 ölçümü); bu davranış bilinçli, yazılır.
- `anonymize_user_personal_data` authenticated'a açık ve DEFINER — bekçiyi atlar; bu onun
  meşru işi (kendi verisini silme). Kapsam dışı, not edildi.
- VULN-002 kapanınca REC-355'in "satış kipi açılış listesi" satırı kapanır.

## 6. Ölçülmeyen, adıyla

1. PostgREST `Prefer: return=representation` ile hata gövdesinin müşteriye ne döndüğü (mesaj
   metni sızıntısı) — bekçi mesajı kısa ve iç ayrıntısız yazılır.
2. Realtime aboneliklerinin tetik hatasından etkilenmesi — yazma yoksa etki yok, ölçülmedi.
