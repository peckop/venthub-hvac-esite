---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\checkout\PaymentIframeContainer.tsx
skeleton_hash: 5bac558917d71a75
entity_hashes:
  func:PaymentIframeContainer: a26b3523d4f0ca84
  overview: 80658adb5b36a144
  style_tokens: aa1cb9d92aed5506
generated_at: 2026-05-28T22:40:10Z
---

## Genel Bakış
Bu modül, VentHub HVAC platformunda ödeme adımında müşterilerin güvenli bir şekilde ödeme işlemini gerçekleştirmesi için kullanılan bir React bileşenidir. Iyzico tabanlı ödeme altyapısıyla entegre çalışarak, gerekli kimlik doğrulama ve ödeme içeriğini barındıran iframe'i sayfaya entegre eder. Ayrıca, ödeme sayfasındaki yardım paneli gibi ek arayüz elemanlarının görünürlük durumunu da yönetir.

## Fonksiyon Grupları
### Ana Ödeme Iframe Yönetim Bileşeni
Modülün tüm temel sorumluluklarını üstlenen bu bileşen, dışarıdan gelen gerekli tüm bilgileri alarak güvenli ödeme iframe'ini render eder ve arayüz durumunu kontrol eder.
- PaymentIframeContainer

---

## AXIOMS – Mimari Varsayımlar
Bu modül, Iyzico ödeme altyapısına ait iframe tabanlı ödeme formunu barındıran bir React konteyner bileşenidir. Doğru çalışması için aşağıdaki mimari varsayımlar geçerlidir:

[Aksiyom 1]: Eğer `iyzToken` sağlanmazsa, ödeme iframe'i güvenli bir şekilde başlatılamaz ve ödeme işlemi gerçekleştirilemez.

[Aksiyom 2]: Eğer `paymentFrameContent` sağlanmazsa, iframe içinde render edilecek içerik olmadığından bileşen boş/görünmez kalır.

[Aksiyom 3]: Eğer `setShowHelp` fonksiyonu sağlanmazsa, yardım panelinin görünürlük durumu değiştirilemez ve `showHelp` durumu bileşen dışında kontrol edilemez hale gelir.

[Aksiyom 4]: Eğer `paymentFrameContent` geçerli bir HTML/iframe kaynağı içermiyorsa, tarayıcı tarafından安全 olmayan içerik olarak reddedilebilir veya boş görüntülenir.

[Aksiyom 5]: Eğer `iyzToken` geçersiz veya süresi dolmuş bir token ise, Iyzico tarafında ödeme başlatma hatası oluşur ve kullanıcıya hata gösterilmesi beklenir.

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
- **params**: `{ iyzToken, paymentFrameContent, showHelp, setShowHelp, progressPct, overlayStep, t }` — destructure edilmiş prop objesi
- **ic_degiskenler**:
  - `iyzToken` — iyzico ödeme token'ı; JSX'te `data-token={iyzToken}` olarakcheckout form div'ine bağlanır; truthy olduğunda iyzico checkout formu render edilir
  - `paymentFrameContent` — alternatif ödeme iframe HTML içeriği; `iyzToken` yoksa ve bu doluysa `dangerouslySetInnerHTML={{ __html: paymentFrameContent }}` ile render edilir
  - `showHelp` — boolean; SMS yardım ipuçları bölümünün açılıp kapalı olduğunu kontrol eder (`{showHelp && ( ... )}`Conditional rendering)
  - `setShowHelp` — state setter fonksiyonu; yardım butonuna tıklandığında `setShowHelp(v => !v)` ile toggle eder
  - `progressPct` — sayısal yüzde değeri (0-100); progress bar'ın genişliğini `style={{ width: \`${progressPct}%\` }}` olarak ayarlar
  - `overlayStep` — sayısal overlay adımını (1, 2, 3) temsil eder; `overlayStep === 1` thì "starting", `=== 2` thì "secureForm", diğer durumlarda "bank3d" metnini gösterir
  - `t` — çeviri fonksiyonu; `t('checkout.paymentSectionTitle')`, `t('checkout.securePaymentBrand', { brand: 'Venthub HVAC' })`, `t('checkout.securePaymentProvider', { provider: 'iyzico' })`, `t('checkout.paymentLoading')`, `t('checkout.formPreparing')`, `t('checkout.overlay.starting')`, `t('checkout.overlay.secureForm')`, `t('checkout.overlay.bank3d')`, `t('checkout.help.smsTitle')`, `t('checkout.help.tip1')`, `t('checkout.help.tip2')`, `t('checkout.help.tip3')` çağrılarında kullanılır
- **Dönüş**: JSX (React elementi) — Ödeme bölümünün tamamını render eden React bileşeni; `CreditCard`, `Lock`, `CheckCircle` icon'larını lucide-react'ten import eder; üç durumlu conditional rendering (iyzToken varsa form, paymentFrameContent varsa HTML iframe, ikisi de yoksa hazırlık animasyonu) ve yardım toggle butonu içerir

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