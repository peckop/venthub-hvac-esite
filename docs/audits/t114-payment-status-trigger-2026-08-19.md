# T114-VH — `sync_payment_status_with_status` ölçümü (prod, 2026-08-19)

> Şerit: LEGAL-SEO · İş emri: OPS-AUDIT 12:25 · Kaynak bulgu: AUTH şeridi (ölü dallar)
> Onarım taslağı: `supabase/migrations/20260819160000_payment_status_trigger_fix.sql`
> — **MIGRATION VAR, merge Recep kapısıdır**
> Kapı: `src/__tests__/conformance/payment-status-trigger-contract.test.ts` (INV-PAYMENT-TRIGGER-1)

## 1. İş emri doğruydu; altından daha ağırı çıktı

İş emri "ölü dallar" diyordu. Doğrulandı. Ama ölü dalları temizlerken **aynı koşulun içinde
canlı bir kusur** çıktı ve asıl mesele o: **kısmi iade, siparişi sessizce "tam ödenmiş"
hâline getiriyor.**

## 2. Ölçülen gövde ve kısıt

Prod'daki fonksiyon:

```sql
IF NEW.status IN ('paid','confirmed') AND COALESCE(NEW.payment_status,'') <> 'refunded' THEN
  NEW.payment_status := 'paid';
ELSIF NEW.status = 'failed' THEN
  NEW.payment_status := 'failed';
END IF;
```

`venthub_orders_status_check`:

```
pending · confirmed · processing · shipped · delivered · cancelled
```

Yani `status` kolonuna `'paid'` ve `'failed'` **hiç yazılamaz**:

| Dal | Durum |
|---|---|
| `IN ('paid', …)` içindeki `'paid'` | **ölü** |
| `ELSIF NEW.status = 'failed'` | **tamamen ölü** |
| `IN (…, 'confirmed')` | canlı |

`payment_status='failed'` değerini gerçekte yazan yerler başka (ölçüldü):
`iyzico-callback` (başarısız ödeme, 533) · `order-housekeeping` (101) ·
`release-expired-reservations` (118). Ölü dalın kaldırılması hiçbir davranışı değiştirmez.

Tetikler: `trg_sync_payment_status_ins` (BEFORE INSERT) ve `trg_sync_payment_status_upd`
(**BEFORE UPDATE OF status**).

## 3. Canlı kusur: kısmi iade `paid` oluyor

`iyzico-refund` kısmi iadede şu PATCH'i atar (index.ts 363-383):

```
payment_status = 'partial_refunded'
status         = order.status        ← değişmiyor, ama SET listesinde
```

`UPDATE OF status` tetiği, kolon SET listesinde olduğunda **değer değişmese de** ateşlenir.
Koşul: `status='confirmed'` listede var; `payment_status='partial_refunded'` ise `'refunded'`
**değil**, yani koruma tutmaz → `NEW.payment_status := 'paid'`.

**Para çıktı, kayıt "tam ödendi" diyor. Hata yok, log yok.**

Gerçek fonksiyon geçici tabloya bağlanarak ölçüldü (prod'a **yazmadan**):

| status | gelen `payment_status` | tetikten sonra |
|---|---|---|
| `confirmed` | `partial_refunded` | **`paid`** ← kusur |
| `confirmed` | `refunded` | `refunded` (koruma yalnız bu değeri tanıyor) |
| `shipped` | `partial_refunded` | `partial_refunded` |
| `processing` | `partial_refunded` | `partial_refunded` |
| `delivered` | `partial_refunded` | `partial_refunded` |
| `cancelled` | `refunded` | `refunded` |

Pencere dar ama en olağan iade senaryosu tam orada: **kargolanmamış, onaylanmış siparişin
kısmi iadesi**. Tam iade güvende, çünkü `iyzico-refund` o durumda `status`'ü `cancelled`
yapıyor (365-367) ve koşul zaten tutmuyor.

**Bugünkü veri:** `venthub_orders` 5 satır, beşi de `payment_status='pending'`, `cancelled`
sipariş yok. Yani kusur veriyle **henüz karşılaşmadı**; kod yolu ise canlı ve doğru çalışıyor.
"Bugün patlamıyor" ile "güvenli" aynı şey değil — ilk kısmi iadede patlar.

## 4. Çözüm: izin listesi, yasak listesi değil

En küçük düzeltme `'partial_refunded'` değerini korumaya eklemekti. Yetersiz sayıldı: bu,
aynı hatanın **bir sonraki yeni değerde** tekrarlanmasını bekler.

Tetiğin işi, yaşam döngüsü `confirmed` olduğunda **boş kalan** ödeme durumunu doldurmaktır;
dolu bir değeri ezmek işi değildir. Yeni kural:

```sql
IF NEW.status = 'confirmed' AND COALESCE(NEW.payment_status,'') IN ('', 'pending') THEN
  NEW.payment_status := 'paid';
END IF;
```

Önerilen gövde, aynı geçici-tablo yöntemiyle ölçüldü ve beklenen matrisi verdi:
`confirmed+partial_refunded → partial_refunded` · `confirmed+refunded → refunded` ·
`confirmed+pending → paid` · `confirmed+NULL → paid` · diğer statüler dokunulmadan.

**Görünür tek davranış farkı:** ödemesi `failed` kalmış bir sipariş sonradan `confirmed`'e
çekilirse artık otomatik `paid` olmaz. Ölçüldü, gerçek yolda kayıp değil: `iyzico-callback`
başarılı ödemede zaten `{ status:'confirmed', payment_status:'paid' }` çiftini **birlikte**
yazıyor (301) — değer açıkça yazıldığı için tetiğe gerek yok.

## 5. Kanıt katmanları

| Katman | Ne görür | Nerede |
|---|---|---|
| Migration'ın kendi doğrulama bloğu | **canlı davranış** — geçici tabloya gerçek fonksiyon bağlanır, 7 satırlık matris ölçülür, tutmazsa `RAISE EXCEPTION` ile çöker | migration içi |
| INV-PAYMENT-TRIGGER-1 | metin sözleşmesi — izin listesi duruyor mu, ölü dallar geri geldi mi, doğrulama bloğu sökülmüş mü | conformance |
| Bu dosya | ölçümün kendisi ve gerekçe | audits |

Kapı **üç kasıtlı sabotajla** sınandı, üçü de kırmızı verdi: izin listesi eski korumaya
döndürüldü (R1) · ölü dal geri kondu (R2) · doğrulama bloğu silindi (R3).

Not: kapı, migration'ı **kronolojik olarak son tanım** üzerinden okur. Yani ileride biri
fonksiyonu yeniden tanımlayıp korumayı düşürürse kırmızı olur — düzeltme tek seferlik değil,
kalıcı.

## 6. Açık kalan

- **Merge Recep kapısıdır** (kural 13: migration merge = prod'a otomatik uygulama).
- Kusur bugün veriyle karşılaşmadı; yine de ilk kısmi iadeden **önce** inmesi gerekir.
  Sıralama önerisi: bu migration, ilk gerçek iade testinden önce.
- Kapsam dışı, sahibine not: `iyzico-refund` PATCH'inde `status` alanı **değişmediği hâlde**
  gönderiliyor. Tetik ateşlemesinin sebebi bu. Bu migration kusuru tetik tarafında kapatıyor;
  PATCH'in gereksiz kolonu göndermemesi ayrı ve tamamlayıcı bir iyileştirme olurdu (EDGE).
