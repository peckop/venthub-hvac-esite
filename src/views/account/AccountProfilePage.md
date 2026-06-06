---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\account\AccountProfilePage.tsx
skeleton_hash: 422e2ff5a3ff1bd3
entity_hashes:
  func:AccountProfilePage: 754183d7e2ba9791
  overview: dd4bd16d5abc640e
  style_tokens: d7513d5d715e48fe
generated_at: 2026-06-06T21:56:42Z
---

## Genel Bakış
Bu modül, kullanıcının hesap profil bilgilerini görüntülemesini ve düzenlemesini sağlayan tek sayfalık bir React bileşenidir. Kullanıcı, mevcut ad-soyad ve telefon bilgilerini forma yansıtır, düzenleyebilir ve Supabase kimlik doğrulama servisi aracılığıyla güncellemelerini kaydedebilir.

## Fonksiyon Grupları
### Ana Bileşen
Sayfanın tüm kullanıcı arayüzünü, form durumunu ve Supabase ile olan veri akışını tek bir kapsamlı bileşen içinde yönetir.
- AccountProfilePage

---



---

## FONKSİYON DETAYLARI

### AccountProfilePage
**Ne yapar**: Kullanıcının profil bilgilerini (ad soyad ve telefon) görüntüleyip düzenlemesini sağlayan bir React bileşenidir. Kullanıcı mevcut bilgilerini forma yansıtır, değişiklik yapıp kaydedebilir.

**Nasıl yapar**: `useAuth()` ile mevcut kullanıcıyı alır, `user_metadata` içindeki `full_name` ve `phone` değerlerini `useEffect` ile `fullName` ve `phone` state'lerine yükler. Form gönderildiğinde `onSave` async fonksiyonu çalışır: `supabase.auth.updateUser` ile kullanıcı metadata'sını günceller, başarılı olursa toast ile bildirim gösterir, hata durumunda ise hata mesajı gösterir. Kaydetme işlemi sırasında buton devre dışı kalır ve yüklenme animasyonu gösterilir.

**Parametreler**:
- (parametre almaz)

**Dönüş**: JSX.Element — Kullanıcı profili düzenleme formunu içeren bir React bileşeni döndürür.

---

## INTERFACES

### UserMetadata
- `full_name?: string`
- `phone?: string`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/account/AccountProfilePage.tsx::AccountProfilePage
- **params**: (yok)
- **ic_degiskenler**:
  - `t` — useI18n() hook'undan dönen çeviri fonksiyonu, sayfa genelinde locale metinleri için kullanılır
  - `user` — useAuth() hook'undan dönen oturum açmış kullanıcı nesnesi, user_metadata alanı üzerinden profil bilgilerine erişilir
  - `fullName` — React state, kullanıcının tam adını tutan editable metin input değeri, onChange ile güncellenir, useEffect ile user.user_metadata.full_name'den başlatılır
  - `setFullName` — fullName state setter'ı, input onChange handler'ında ve useEffect callback'inde çağrılır
  - `phone` — React state, kullanıcının telefon numarasını tutan editable metin input değeri, regex filtreleme (yalnızca rakam, +, boşluk, tire) uygulanarak güncellenir, useEffect ile user.user_metadata.phone'dan başlatılır
  - `setPhone` — phone state setter'ı, input onChange handler'ında ve useEffect callback'inde çağrılır
  - `saving` — React state (boolean), updateUser API çağrısı devam ederken true olur, butonu disabled yapar ve spinner gösterir
  - `setSaving` — saving state setter'ı, onSave fonksiyonunun try/finally bloklarında çağrılır
  - `onSave` — inner async fonksiyon, form onSubmit handler'ı olarak bağlanır, supabase.auth.updateUser ile profil günceller
- **Dönüş**: JSX (React component return value — form sayfası)

### [N2_NASIL] AST Pointer: src/views/account/AccountProfilePage.tsx::useEffect callback ([])
- **params**: (yok — React.useEffect callback)
- **ic_degiskenler**:
  - `meta` — user.user_metadata değerinin `UserMetadata` cast edilmiş hali, `{}` fallback ile undefined koruması; full_name ve phone alanlarından okuma yapılır
- **Dönüş**: yok (React side-effect callback, state setter'ları çağırır)

### [N3_NASIL] AST Pointer: src/views/account/AccountProfilePage.tsx::onSave
- **params**:
  - `e` — React.FormEvent, form submit event, e.preventDefault() ile varsayılan submit engellenir
- **ic_degiskenler**:
  - `error` — supabase.auth.updateUser({ data: {...} }) yanıtından destructured edilen hata nesnesi; truthy ise throw ile catch bloğuna düşülür
  - `e` (catch bloğu) — yakalanan exception nesnesi, console.error ile loglanır; parametre `e`'yi shadow eder
- **Yan etkiler**: supabase.auth.updateUser çağrısı ile user_metadata güncellenir; başarı/hata durumunda toast bildirimi gösterilir
- **Dönüş**: yok (async void — promise döner ama return değeri kullanılmaz)

---

## NODE ID STANDARD

  file: src\views\account\AccountProfilePage.tsx
  function: src\views\account\AccountProfilePage.tsx::AccountProfilePage

---

## DISA AKTARILANLAR (EXPORTS)
  export: AccountProfilePage

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-primary-navy`, `bg-slate-50`, `bg-white`, `border-slate-100`, `border-slate-200`, `border-slate-200/60`, `border-t`, `focus-visible:border-primary-navy`, `hover:bg-industrial-gray`, `text-2xl`, `text-primary-navy`, `text-slate-400`, `text-slate-500`, `text-slate-900`, `text-sm`
- **Layout:** `absolute`, `block`, `flex`, `gap-2`, `h-10`, `h-4`, `h-6`, `items-center`, `justify-end`, `left-0`, `max-w-2xl`, `overflow-hidden`, `p-6`, `relative`, `shadow-primary-navy/20`
- **Varyant/Responsive:** `disabled:`, `focus-visible:`, `hover:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `animate-spin`, `border`, `disabled:cursor-not-allowed`, `disabled:opacity-60`, `focus-visible:outline-none`, `focus-visible:ring-2`, `focus-visible:ring-primary-navy/20`, `font-bold`, `font-medium`, `hover:scale-102`, `inset-y-0`, `mb-1.5`, `mb-8`, `mt-1`, `mt-2`