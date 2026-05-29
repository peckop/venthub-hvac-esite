---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\account\AccountProfilePage.tsx
skeleton_hash: 04eeead58cbf5946
entity_hashes:
  func:AccountProfilePage: 754183d7e2ba9791
  overview: dc99ac3fc9b4a582
  style_tokens: d7513d5d715e48fe
generated_at: 2026-05-29T18:52:27Z
---

## Genel Bakış
Bu modül, kullanıcı profil sayfasını temsil eden bir React bileşenidir. Kullanıcının mevcut profil bilgilerini (ad soyad ve telefon) görüntülemesini, düzenlemesini ve Supabase üzerinden güncelleme yapmasını sağlar.

## Fonksiyon Grupları
### Ana Bileşen
Sayfanın tüm kullanıcı arayüzünü, durum yönetimini ve veriyle etkileşimi tek bir bileşen içinde yönetir.
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

### [N1_NASIL] AST Pointer: AccountProfilePage.tsx::AccountProfilePage
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `t` — useI18n hook'undan dönen çeviri fonksiyonu; UI string'lerini dil bazlı render eder
  - `user` — useAuth hook'undan dönen mevcut Supabase kullanıcı nesnesi; user_metadata alanı profili bilgilerini tutar
  - `fullName` — React state (string), kullanıcının tam adını tutar; input value'sine bağlanır; başlangıç değeri boş string
  - `setFullName` — fullName state'ini güncelleyen setter; input onChange handler'ında kullanılır
  - `phone` — React state (string), kullanıcının telefon numarasını tutar; input value'sine bağlanır; başlangıç değeri boş string
  - `setPhone` — phone state'ini güncelleyen setter; input onChange handler'ında kullanılır
  - `saving` — React state (boolean), form kaydetme işleminin devam edip etmediğini kontrol eder; true iken buton disable edilir ve spinner gösterilir
  - `setSaving` — saving state'ini güncelleyen setter; onSave fonksiyonunda try/finally bloklarında kullanılır
- **Dönüş**: JSX — Kullanıcı profil düzenleme sayfasını render eder; isim ve telefon alanlarını içerir

### [N1_NASIL] AST Pointer: AccountProfilePage.tsx::onSave
- **params**: `e: React.FormEvent` — form submit olay nesnesi
- **ic_degiskenler**:
  - `error` — supabase.auth.updateUser çağrısının destructure edilmiş error alanı; hata varsa hata nesnesi, yoksa undefined
- **Dönüş**: void (async) — supabase.auth.updateUser ile full_name ve phone alanlarını günceller; başarılıysa toast.success, hatalıysa toast.error gösterir; her durumda saving'i false'a çeker

### [N1_NASIL] AST Pointer: AccountProfilePage.tsx::useEffect callback (anonim)
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `meta` — user?.user_metadata değerinin UserMetadata tipine cast edilmiş hali; user_metadata mevcut değilse boş obje `{}` kullanılır
- **Dönüş**: yok — user değiştiğinde tetiklenerek fullName ve phone state'lerini meta.full_name ve meta.phone değerleriyle başlatır (yan etki)

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