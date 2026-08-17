# T080-VH — Ödeme ekranı boş açılıyor (ölçüm + plan)

**Tarih:** 2026-08-17 · **Şerit:** PRICING-STOK · **Kaynak:** LEGAL-SEO'nun latent tespiti,
OPS-AUDIT tarafından sahibi olarak bana verildi.
**Cetvel:** **YOK.** CLAUDE.md kural 1 gereği bu iş, cetveli yazmayı da kapsar →
`docs/standards/checkout-payment-standard.md` (bu planın §5'i taslağıdır).

> **Sonuç önce:** İyzico'nun gömülü form dalı **hiçbir zaman çalışmamış**. Ödeme adımı
> boş bir kutu gösteriyor. Kusur "MEDIUM/latent" değil — **varsayılan ödeme yolu bu**.
> Latent görünmesinin tek sebebi prod'da **sıfır gerçek sipariş** olması (T058).

---

## 1. Ölçülen zincir

Ödeme başlatma başarılı olduğunda İyzico üç alan birden döndürür: `token`,
`checkoutFormContent` (formu basan script) ve `paymentPageUrl` (barındırılan sayfa).

| # | Yer | Ölçüm | Sonuç |
|---|---|---|---|
| 1 | `supabase/functions/iyzico-payment/index.ts:799` | Üçünden **biri** doluysa başarı der, üçünü de gövdeye koyar | ✅ doğru |
| 2 | `src/hooks/useCheckoutPayment.ts:155` | `paymentPageUrl && !token` → barındırılan sayfaya yönlendir | ⚠️ `token` başarıda **daima** dolu → bu dal fiilen hiç çalışmaz |
| 3 | `src/hooks/useCheckoutPayment.ts:160` | `token` → `setIyzToken`, `setPaymentUrl` | ✅ ama `checkoutFormContent` **hiç okunmuyor** |
| 4 | `src/hooks/useCheckoutPayment.ts:91` | `const [paymentFrameContent] = useState('')` — **setter YOK** | ❌ kalıcı `''`; alan ölü |
| 5 | `src/views/checkout/PaymentIframeContainer.tsx:55` | `iyzToken` dolu → `<div id="iyzipay-checkout-form" data-token=... />` | ❌ **boş div** |
| 6 | Tüm `src/` | İyzico checkout betiğini yükleyen **hiçbir yer yok** | ❌ div'i dolduracak kod yok |
| 7 | `next.config.mjs:60` CSP | `script-src 'self' 'unsafe-inline' 'unsafe-eval'` | ❌ `static.iyzipay.com` yok |
| 8 | `next.config.mjs:60` CSP | `frame-src` **yazılmamış** → `default-src 'self'`e düşer | ❌ İyzico iframe'i engellenir |
| 9 | `next.config.mjs:60` CSP | `form-action 'self'` | ❌ forma İyzico'ya POST ettirmez |

**Render sonucu:** `iyzToken` dolu olduğu için 5. satırdaki dal kazanır; içi boş bir div
basılır. Onu dolduracak betik ne yüklüdür (6) ne de yüklense CSP geçer (7-9).
Kullanıcı ödeme adımında **boş kutu** görür; hata da yoktur, çünkü teknik olarak
"başarı" dönmüştür.

**5. satırdaki `paymentFrameContent` yedeği de kurtarmaz:** (a) 4. satır yüzünden daima
boştur, (b) dolu olsaydı bile `dangerouslySetInnerHTML` **`<script>` çalıştırmaz** —
İyzico'nun `checkoutFormContent`'i tam olarak bir script'tir. İki bağımsız sebeple ölü.

## 2. Niçin bugüne kadar görülmedi

- Prod'da **sıfır gerçek sipariş** (T058 ölçümü) → yol hiç yürünmedi.
- Uçtan uca test yok; birim testleri hook'un dönüş değerine bakıyor, **render'a bakmıyor**.
- Edge fonksiyonu "başarı" döndürdüğü için hiçbir alarm tetiklenmiyor —
  bu, `failclosed-seam-needs-alarm` sınıfının kardeşi: **sessiz başarı**.

## 3. Karar gerektiren nokta (Recep)

İki geçerli entegrasyon var, ikisi de İyzico'nun desteklediği:

| | A — Gömülü form (kodun mevcut niyeti) | B — Barındırılan sayfaya yönlendirme |
|---|---|---|
| Akış | Kullanıcı sitede kalır | İyzico'ya gidip döner |
| Gereken | `checkoutFormContent` taşınması + script'in ÇALIŞTIRILMASI + CSP açılması | Sadece dal sırasının düzeltilmesi |
| CSP riski | `script-src`/`frame-src`/`form-action` gevşetilir | **Yok** |
| İş | Orta | Küçük |

**Önerim: A**, çünkü kodun tamamı (div id'si, `data-pay-with-iyzico`, overlay adımları,
`PaymentWatcher`) zaten gömülü akış için yazılmış; B'ye geçmek bu yüzeyi çöpe atar.
B yalnız "lansmanı bugün açmak" gerekirse acil çıkış olarak durmalı.

## 4. Plan (A seçilirse)

1. **P1 — İstemci sözleşmesi (benim şeridim, migration yok):** `useCheckoutPayment`
   `checkoutFormContent`'i yakalasın; ölü `useState('')` kalksın.
2. **P2 — Script'i çalıştıran render:** `dangerouslySetInnerHTML` yerine script
   düğümünü elle kurup ekleyen dar bir yardımcı; `iyzToken` dalı **tek başına**
   kalmasın (boş div üretemesin).
3. **P3 — CSP (LEGAL-SEO şeridi, `next.config.mjs`):** `script-src` + `frame-src` +
   `form-action` İzyico alan adları. **Bu dosya bana ait değil** — LEGAL-SEO'ya adresli
   not bırakıldı, tek başına P1/P2 çalışmaz.
4. **P4 — Kapı (INV-PAY-RENDER-1):** "token dolu ama formu basacak kaynak yok" hâli
   testle yasaklanır. Kapı, `paymentFrameContent`-ölü-state sınıfını da yakalamalı:
   *state'in yazıldığını* değil **bir setter'ı olduğunu** ölçmeli.
5. **P5 — Cetvel:** `docs/standards/checkout-payment-standard.md`.

## 5. Cetvel taslağı (yazılacak kuralın çekirdeği)

> **K1.** Ödeme sağlayıcısından dönen her alan için istemcide **bir tüketici** olmalı.
> Tüketicisi olmayan alan ya kaldırılır ya da eksikliği testle işaretlenir.
> **K2.** Ödeme yüzeyinde "başarı" dönen hiçbir yol **boş ekran** üretemez; her render
> dalının ya görünür içeriği ya da açık bir hata mesajı olmak zorundadır.
> **K3.** Üçüncü taraf betiğe dayanan her dal, o betiğin **yüklendiğini ve CSP'den
> geçtiğini** ayrıca ölçer — kod doğru olsa da CSP dalı sessizce öldürür.
> **K4.** `dangerouslySetInnerHTML` ile `<script>` **çalıştırılamaz**; sağlayıcıdan
> gelen script içeriği açıkça düğüm kurularak eklenir.

## 6. Durum

- P1–P2 ve P4–P5 bende, **Recep A/B kararını verince** başlıyorum.
- P3 LEGAL-SEO'da (`next.config.mjs` + `csp-standard.md`), haber verildi.
- Bu plan tek başına hiçbir davranış değiştirmez — yalnız ölçüm ve karar zeminidir.
