---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\account\AccountProfilePage.tsx
skeleton_hash: 8f54003fdfbd1d91
entity_hashes:
  func:AccountProfilePage: 754183d7e2ba9791
  overview: 6f24907adef049a2
  style_tokens: d7513d5d715e48fe
generated_at: 2026-05-28T22:38:52Z
---

## Genel Bakış
Bu modül, kullanıcı profil bilgilerini gösteren ve düzenleyen bir hesap profili sayfası bileşenini içerir. Sayfa, kullanıcı verilerini alarak arayüzde sunar ve gerekli etkileşimleri yönetir.

## Fonksiyon Grupları
### Ana Bileşen
Kullanıcı profil sayfasının görsel yapısını oluşturur ve veri akışını koordin eder.
- AccountProfilePage

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

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

### [N1_NASIL] AST Pointer: src\views\account\AccountProfilePage.tsx::AccountProfilePage
- **params**: (none)
- **ic_degiskenler**:
  - `t` — translation function returned by `useI18n()`, used to localize UI strings.
  - `user` — current authenticated user object returned by `useAuth()`, contains `user_metadata`.
  - `fullName` — state variable holding the current value of the full name input field.
  - `setFullName` — state updater function for `fullName`.
  - `phone` — state variable holding the current value of the phone input field.
  - `setPhone` — state updater function for `phone`.
  - `saving` — state variable indicating whether a save operation is in progress.
  - `setSaving` — state updater function for `saving`.
  - `onSave` — event handler function defined within the component, invoked on form submission.
- **Dönüş**: returns JSX markup for the account profile page.

### [N2_NASIL] AST Pointer: src\views\account\AccountProfilePage.tsx::useEffect callback
- **params**: (none)
- **ic_degiskenler**:
  - `user` — accessed from outer scope to read `user_metadata`.
  - `meta` — local variable holding the user metadata cast to `UserMetadata`; defaults to an empty object if `user` or `user_metadata` is undefined.
  - `fullName` — accessed from outer scope to set its state.
  - `setFullName` — state updater function for `fullName`.
  - `phone` — accessed from outer scope to set its state.
  - `setPhone` — state updater function for `phone`.
- **Dönüş**: no explicit return; side effect updates component state.

### [N3_NASIL] AST Pointer: src\views\account\AccountProfilePage.tsx::onSave
- **params**: `e` — `React.FormEvent` representing the form submission event.
- **ic_degiskenler**:
  - `e` — event object; `e.preventDefault()` stops default form submission.
  - `setSaving` — state updater function for `saving`; called with `true` at start and `false` in `finally`.
  - `saving` — accessed only in JSX button `disabled={saving}` (not within this function body).
  - `supabase` — imported client used to call `supabase.auth.updateUser`.
  - `fullName` — current value of the full name state, used in the update payload.
  - `phone` — current value of the phone state, used in the update payload.
  - `toast` — imported notification library; `toast.success` and `toast.error` are called based on operation outcome.
  - `t` — translation function used to fetch localized toast messages.
  - `error` — local variable capturing the `error` property from the Supabase response.
- **Dönüş**: no explicit return; performs asynchronous update and side‑effects (state changes, notifications).

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