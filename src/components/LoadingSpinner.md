---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\LoadingSpinner.tsx
skeleton_hash: 1429988b8b8756c2
entity_hashes:
  func:LoadingSpinner: 420e244c3ab22ba8
  overview: 055c22213f5fb1f9
  style_tokens: b21c3354ed86bc3e
generated_at: 2026-05-28T22:36:06Z
---

## Genel Bakış
LoadingSpinner.tsx modülü, uygulama içinde veri yükleme veya işlem sırasında kullanıcıya görsel geri bildirim sağlayan basit bir yükleme animasyonu bileşenini içerir. Bileşen, boyut ve tam ekran görüntüleme seçenekleriyle özelleştirilebilir.

## Fonksiyon Grupları
### Ana Bileşen
Bu grup, LoadingSpinner bileşeninin temel tanımını ve özelliklerini içerir.
- LoadingSpinner

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

[Aksiyom 1]: Eğer `size` prop'u verilmezse, varsayılan olarak `'md'` kullanılır.  
[Aksiyom 2]: Eğer `fullScreen` prop'u verilmezse, varsayılan olarak `true` olur.

---

## FONKSİYON DETAYLARI

### LoadingSpinner
**Ne yapar**: LoadingSpinner, bir yükleme göstergesi (spinner) render eden bir React bileşenidir.  
**Nasıl yapar**: Fonksiyon, `size` ve `fullScreen` adlı iki props'u alır; bu değerler spinner'ın boyutunu ve ekranı kaplayıp kaplamayacağını belirler. Daha sonra bu props'lara göre uygun stil ve görünümü uygulayan JSX döndürür.  
**Parametreler**:
- size: string — Spinner'ın boyutunu belirler; varsayılan değer `'md'` (medium) olur.  
- fullScreen: boolean — Spinner'ın ekranı kaplayıp kaplamayacağını belirler; varsayılan değer `true` olur.  
**Dönüş**: React.FC<LoadingSpinnerProps> — JSX elementi olarak render edilebilir bir React fonksiyonel bileşeni döndürür.

---

## INTERFACES

### LoadingSpinnerProps
- `size?: 'sm' | 'md' | 'lg'`
- `fullScreen?: boolean`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/LoadingSpinner.tsx::LoadingSpinner
- **params**: size — string (default 'md'), fullScreen — boolean (default true)
- **ic_degiskenler**:
  - `t` — translation function from useI18n used for the aria-label of the spinner
  - `sizeClasses` — object mapping size strings ('sm', 'md', 'lg') to Tailwind CSS classes that set width and height
  - `spinnerElement` — JSX element rendering the spinner with the appropriate size class, border styling, spin animation, and aria-label
- **Dönüş**: React.FC<LoadingSpinnerProps> (returns JSX; if fullScreen is true, wraps spinner in a full-height flex container, otherwise returns the spinner element directly)

---

## NODE ID STANDARD

  file: src\components\LoadingSpinner.tsx
  function: src\components\LoadingSpinner.tsx::LoadingSpinner

---

## DISA AKTARILANLAR (EXPORTS)
  export: LoadingSpinner

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `border-2`, `border-primary-navy`, `border-t-transparent`
- **Layout:** `flex`, `inline-block`, `items-center`, `justify-center`, `min-h-400px`
- **Varyant/Responsive:** (yok)
- **Yardımcı Sınıflar:** `${sizeClasses[size]`, `animate-spin`, `rounded-full`