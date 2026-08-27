---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\venthub-wt-t131\src\views\checkout\PaymentIframeContainer.tsx
skeleton_hash: 0688d7b2bbf8e4ce
entity_hashes:
  func:PaymentIframeContainer: a26b3523d4f0ca84
  overview: 06c7c6530c379380
  style_tokens: a68f98e81d24e9bc
generated_at: 2026-08-27T07:32:48Z
---

## Genel Bakış
Bu modül, ödeme sürecinde güvenli bir ödeme formu sunmak için kullanılan bir React bileşenini içerir. Bileşen, dışarıdan sağlanan bir ödeme token'ı ve iframe içeriği ile güvenli bir ödeme arayüzü oluşturur. Ayrıca, bir yardım panelinin görünürlük durumunu dışarıdan kontrol edilebilir şekilde yönetir.

## Fonksiyon Grupları
### Ana Ödeme Iframe Konteyner Bileşeni
Modülün tek bileşeni olup, dışarıdan gelen ödeme token'ı, iframe içeriği ve yardım paneli görünürlük durumu ile güvenli ödeme arayüzünü oluşturur ve ilgili durum değişimlerini üst bileşenlere bildirir.
- PaymentIframeContainer

---

## AXIOMS – Mimari Varsayımlar
- Bu modül davranışsal mantık içermez (salt veri / konfigürasyon / tip tanımı).
- [Aksiyom 1]: Modülün dışa açtığı yapı (anahtar kümesi / şema) bir sözleşmedir; tüketiciler bu sabit yapıya bağlıdır — kırıcı değişiklik tüm tüketicileri etkiler.
- [Aksiyom 2]: Bir öğe ekleme/çıkarma yapısal-uyumlu olmalı; ilgili tipler ve seçiciler aynı commit'te güncel tutulmalıdır.

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

## İTHALATLAR (IMPORTS)
- import: ../../hooks/useCheckoutPayment::FORM_RENDER_TIMEOUT_MS
- import: ../../hooks/useCheckoutPayment::type { PaymentPhase }
- import: ./injectCheckoutForm::hasRenderedSurface
- import: ./injectCheckoutForm::injectCheckoutForm
- import: lucide-react::AlertTriangle
- import: lucide-react::CheckCircle
- import: lucide-react::CreditCard
- import: lucide-react::Lock
- import: react::React

---

## INTERFACES

### PaymentIframeContainerProps
- `iyzToken: string`
- `paymentFrameContent: string`
- `showHelp: boolean`
- `setShowHelp: (v: boolean | ((p: boolean) => boolean)) => void`
- `progressPct: number`
- `overlayStep: number`
- `phase: PaymentPhase`
- `errorMessage: string`
- `onFormReady: () => void`
- `onFormFailed: (reason: string) => void`
- `onRetry?: () => void`
- `t: (key: string, params?: Record<string, unknown>) => string`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: PaymentIframeContainer.tsx::PaymentIframeContainer
- **params**: `iyzToken`, `paymentFrameContent`, `showHelp`, `setShowHelp`, `progressPct`, `overlayStep`, `phase`, `errorMessage`, `onFormReady`, `onFormFailed`, `onRetry`, `t`
- **ic_degiskenler**:
  - `formHostRef` — `React.useRef<HTMLDivElement | null>(null)` ile oluşturulmuş DOM referansı; ödeme formunun yerleştirileceği `<div>` elemanına bağlanır
- **Dönüş**: JSX element (React.FC)

### [N2_NASIL] AST Pointer: PaymentIframeContainer.tsx::useEffect callback
- **params**: yok
- **ic_degiskenler**:
  - `host` — `formHostRef.current` değeri; ödeme formunun enjekte edileceği DOM kabının referansı, null ise erken çıkış yapılır
  - `cleanupInjection` — `injectCheckoutForm(host, paymentFrameContent).cleanup` dönüşü; form enjeksiyonunun temizleme fonksiyonu, `paymentFrameContent` yoksa veya hata oluşursa `null` kalır
  - `observer` — `new MutationObserver(...)` ile oluşturulmuş DOM gözlemcisi; `host` elemanında çocuk öğe veya alt ağaç değişikliklerini izler, yüzey belirdiğinde `onFormReady` çağırır
  - `timer` — `window.setTimeout(...)` ile oluşturulan zamanlayıcı; `FORM_RENDER_TIMEOUT_MS` süresi dolduğunda `onFormFailed('render_timeout')` çağırır
- **Dönüş**: cleanup fonksiyonu (`observer.disconnect()`, `window.clearTimeout(timer)`, `cleanupInjection?.()` çağırır) veya `undefined`

### [N3_NASIL] AST Pointer: PaymentIframeContainer.tsx::MutationObserver callback
- **params**: yok
- **ic_degiskenler**: yok (dış kapsamdan `host`, `observer`, `timer`, `onFormReady` erişilir)
- **Dönüş**: yok

### [N4_NASIL] AST Pointer: PaymentIframeContainer.tsx::setTimeout callback
- **params**: yok
- **ic_degiskenler**: yok (dış kapsamdan `observer`, `onFormFailed` erişilir)
- **Dönüş**: yok

### [N5_NASIL] AST Pointer: PaymentIframeContainer.tsx::useEffect cleanup
- **params**: yok
- **ic_degiskenler**: yok (dış kapsamdan `observer`, `timer`, `cleanupInjection` erişilir)
- **Dönüş**: yok

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
- **Renkler:** `bg-air-blue/20`, `bg-danger-red/5`, `bg-gradient-to-r`, `bg-light-gray/80`, `bg-primary-navy`, `bg-white`, `bg-white/90`, `border-danger-red/40`, `border-light-gray`, `border-primary-navy/30`, `from-primary-navy`, `hover:text-secondary-blue`, `text-danger-red`, `text-industrial-gray`, `text-primary-navy`
- **Layout:** `flex`, `flex-col`, `from-primary-navy`, `gap-2`, `gap-3`, `h-2`, `h-full`, `items-center`, `items-start`, `justify-between`, `min-h-520px`, `overflow-hidden`, `p-2`, `p-3`, `p-4`
- **Varyant/Responsive:** `focus-visible:`, `hover:` önekleri
- **Yardımcı Sınıflar:** `animate-pulse`, `border`, `focus-visible:outline-none`, `focus-visible:ring-2`, `focus-visible:ring-primary-navy/30`, `font-semibold`, `mb-2`, `mt-0.5`, `mt-2`, `mt-3`, `mt-4`, `responsive`, `ring-1`, `ring-black/5`, `rounded`