---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\checkout\PaymentIframeContainer.tsx
skeleton_hash: 69a0f3097b8ce0d3
entity_hashes:
  func:PaymentIframeContainer: a26b3523d4f0ca84
  overview: 63cea4293d180d15
  style_tokens: aa1cb9d92aed5506
generated_at: 2026-06-08T10:11:01Z
---

## Genel Bakış
Bu modül, VentHub HVAC platformunda ödeme sürecinde Iyzico tabanlı güvenli ödeme altyapısını entegre eden bir React konteyner bileşenidir. Temel olarak, gerekli güvenlik token'ı ve ödeme içeriği ile donatılmış bir iframe'i sayfaya yerleştirerek ödeme formunun güvenli bir şekilde sunulmasını sağlar. Ayrıca, ödeme sayfasındaki yardım paneli gibi ek arayüz elemanlarının görünürlük durumunu da dışarıdan kontrol edilebilir şekilde yönetir.

## Fonksiyon Grupları
### Ana Ödeme Iframe Konteyner Bileşeni
Modülün tek ve temel bileşeni olup, dışarıdan gelen parametrelerle (güvenlik token'ı, iframe içeriği, görünürlük durumu) güvenli ödeme arayüzünü render eder ve ilgili durum değişimlerini üst bileşenlere bildirir.
- PaymentIframeContainer

---

## AXIOMS – Mimari Varsayımlar

Bu modül için, sadece fonksiyon gövdesinden (bu durumda prop imzasından) çıkarılabilecek net, kanıtlanabilir mimari aksiyomlar sınırlıdır. Aşağıdaki aksiyomlar, bileşenin doğru çalışması için zorunlu olan koşulları belirtir.

[Aksiyom 1]: Eğer `iyzToken` prop'u verilmezse veya geçersiz/boş bir değer (null, undefined) ise, bileşenin ödeme işlemini başlatmak için gerekli olan oturum/b kimlik doğrulaması yapılamaz, bu durum ödeme iframe'inin güvenli bir şekilde oluşturulmasını veya içerik yüklenmesini engeller.

[Aksiyom 2]: Eğer `paymentFrameContent` prop'u verilmezse veya geçersiz/boş bir değer ise, bileşenin iframe içinde göstereceği güvenli ödeme sayfası içeriği olmaz, bu durum kullanıcının ödeme formunu görememesine ve işlem yapamamasına yol açar.

[Aksiyom 3]: Eğer `showHelp` ve `setShowHelp` prop'ları verilmezse, bileşenin yardım panelinin görünürlük durumunu okuması veya bu durumu kullanıcı etkileşimiyle değiştirip üst bileşene bildirmesi mümkün olmaz; bu durum arayüzdeki ilgili kontrollerin işlevsiz kalmasına neden olur.

[Aksiyom 4]: Bileşen, `paymentFrameContent`'i bir iframe kaynak içeriği olarak kullanmak üzere tasarlanmıştır. Eğer `paymentFrameContent`, XSS saldırılarına açık veya doğrulanmamış bir kaynaktan geliyorsa, uygulamanın güvenliği tehlikeye girer.

---

## FONKSİYON DETAYLARI

### PaymentIframeContainer
**Ne yapar**: Iyzipay ödeme sayfasını içeren bir React konteyner bileşenidir. Ödeme işlemlerinin iframe içerisinde gösterilmesini ve yardım paneli kontrolünü yönetir.

**Nasıl yapar**: Iyzipay tarafından sağlanan token ve iframe içeriğini alarak ödeme formunu render eder. Yardım paneli gösterilip gizlenebilir durumda olup, bu durumun kontrolü bileşen dışından sağlanır.

**Parametreler**:
- iyzToken: string — Iyzipay ödeme sistemi tarafından sağlanan doğrulama token'ıdır
- paymentFrameContent: string | ReactNode — Ödeme iframe'inin içerisine yerleştirilecek HTML içeriği veya React bileşenidir
- showHelp: boolean — Yardım panelinin görünür olup olmadığını belirler
- setShowHelp: (value: boolean) => void — Yardım paneli durumunu güncellemek için kullanılan state setter fonksiyonudur

**Dönüş**: React.FC<PaymentIframeContainerProps> — PaymentIframeContainerProps arabirimine uygun olarak tanımlanmış bir React fonksiyonel bileşeni döndürür.

---

## INTERFACES

### PaymentIframeContainerProps
- `iyzToken: string`
- `paymentFrameContent: string`
- `showHelp: boolean`
- `setShowHelp: (v: boolean | ((p: boolean) => boolean)) => void`
- `progressPct: number`
- `overlayStep: number`
- `t: (key: string, params?: Record<string, unknown>) => string`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/checkout/PaymentIframeContainer.tsx::PaymentIframeContainer
- **params**: `iyzToken`, `paymentFrameContent`, `showHelp`, `setShowHelp`, `progressPct`, `overlayStep`, `t`
- **ic_degiskenler**:
  - `iyzToken` — iyzico ödeme token'ı; varsa checkout formunu `data-token` attribute'una bağlar, yoksa alternatif yollara yönelir
  - `paymentFrameContent` — iyzico'dan dönen HTML iframe içeriği; `dangerouslySetInnerHTML` ile doğrudan render edilir
  - `showHelp` — boolean flag; SMS yardım ipuçlarının açılıp kapanmasını kontrol eder
  - `setShowHelp` — state setter; butona tıklanınca `v => !v` ile toggling yapar
  - `progressPct` — yüzde bazlı ilerleme değeri; progress bar'ın `style={{ width }}`'ine bind edilir
  - `overlayStep` — overlay adım numarası (1, 2 veya 3); ternary zincir ile hangi msg gösterileceğini belirler: `overlayStep === 1 → starting`, `overlayStep === 2 → secureForm`, diğer → bank3d
  - `t` — i18n çeviri fonksiyonu; `t('checkout.paymentSectionTitle')`, `t('checkout.securePaymentBrand', { brand: 'Venthub HVAC' })`, `t('checkout.securePaymentProvider', { provider: 'iyzico' })`, `t('checkout.paymentLoading')`, `t('checkout.formPreparing')`, `t('checkout.help.smsTitle')`, `t('checkout.help.tip1')`, `t('checkout.help.tip2')`, `t('checkout.help.tip3')`, `t('checkout.overlay.starting')`, `t('checkout.overlay.secureForm')`, `t('checkout.overlay.bank3d')` çağrıları yapılır
- **Dönüş**: JSX — `{space-y-6}` wrapper div içinde: CreditCard ikonlu başlık, `Lock` ikonlu secure payment header (progress bar + overlayStep mesajı), koşullu render bloğu (`iyzToken` varsa div + `iyzipay-checkout-form` id'li container / `paymentFrameContent` varsa `dangerouslySetInnerHTML` div / ikisi de yoksa `CheckCircle` animasyonlu "form hazırlanıyor" skeleton), toggle butonu ile `showHelp` durumuna göre SMS yardım paneli

---

## NODE ID STANDARD

  file: src\views\checkout\PaymentIframeContainer.tsx
  function: src\views\checkout\PaymentIframeContainer.tsx::PaymentIframeContainer

---

## DISA AKTARILANLAR (EXPORTS)
  export: PaymentIframeContainer

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-air-blue/20`, `bg-gradient-to-r`, `bg-light-gray/80`, `bg-primary-navy`, `bg-white`, `bg-white/90`, `border-light-gray`, `border-primary-navy/30`, `from-primary-navy`, `hover:text-secondary-blue`, `text-industrial-gray`, `text-primary-navy`, `text-sm`, `text-steel-gray`, `text-white`
- **Layout:** `flex`, `flex-col`, `from-primary-navy`, `gap-2`, `gap-3`, `h-2`, `h-full`, `items-center`, `justify-between`, `min-h-520px`, `overflow-hidden`, `p-2`, `p-3`, `p-4`, `shadow-lg`
- **Varyant/Responsive:** `hover:` önekleri
- **Yardımcı Sınıflar:** `animate-pulse`, `border`, `font-semibold`, `mb-2`, `mt-2`, `mt-3`, `mt-4`, `responsive`, `ring-1`, `ring-black/5`, `rounded-full`, `rounded-lg`, `rounded-xl`, `space-x-3`, `space-y-1`