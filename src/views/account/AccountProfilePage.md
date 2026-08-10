---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\account\AccountProfilePage.tsx
skeleton_hash: 3c6a16a7851521bc
entity_hashes:
  func:AccountProfilePage: 754183d7e2ba9791
  overview: e09379a678d9fa90
  style_tokens: d7513d5d715e48fe
generated_at: 2026-06-19T20:48:28Z
---

## Genel Bakış
Bu modül, kullanıcının hesap profil bilgilerini görüntülemesini ve düzenlemesini sağlayan tek sayfalık bir React bileşenidir. Kullanıcı mevcut ad-soyad ve telefon bilgilerini forma yansıtır, düzenleyebilir ve Supabase kimlik doğrulama servisi aracılığıyla güncellemelerini kaydedebilir.

## Fonksiyon Grupları
### Ana Bileşen
Sayfanın tüm kullanıcı arayüzünü, form durumunu ve Supabase ile olan veri akışını tek bir kapsamlı bileşen içinde yönetir.
- AccountProfilePage

---

## AXIOMS – Mimari Varsayımlar

Bu modül için kod gövdesi paylaşılmadığından, sadece fonksiyon imzası ve modül yapısından türetilebilecek minimum aksiyomlar tanımlanabilmektedir.

[Aksiyom 1]: Eğer Supabase kimlik doğrulama oturumu (session) yoksa, bileşen profil verilerini yükleyemez ve form boş/hata durumunda kalır.

[Aksiyom 2]: Eğer kullanıcının Supabase auth user nesnesinde `id` alanı yoksa, profil sorgusu çalıştırılamaz ve veri getirme başarısız olur.

[Aksiyom 3]: Eğer form gönderimi (submit) sırasında Supabase bağlantısı kesik veya zaman aşımına uğramışsa, güncelleme başarısız olur ve kullanıcıya hata bildirimi gösterilmesi gerekir.

[Aksiyom 4]: Eğer bileşen ilk yüklendiğinde mevcut profil verisi getirilirken bir hata oluşursa, form alanları boş değerlerle (veya varsayılan değerlerle) başlatılır.

[Aksiyom 5]: Eğer `AccountProfilePage` bileşeni props almıyorsa (parametresiz fonksiyon imzası), tüm gerekli bilgiyi kendi içindeki state/hook'lar ve Supabase servisleri üzerinden sağlamak zorundadır.

---

## FONKSİYON DETAYLARI

### AccountProfilePage
**Ne yapar**: Kullanıcının profil bilgilerini (ad soyad ve telefon) görüntüleyip düzenlemesini sağlayan bir React bileşenidir. Kullanıcı mevcut bilgilerini forma yansıtır, değişiklik yapıp kaydedebilir.

**Nasıl yapar**: `useAuth()` ile mevcut kullanıcıyı alır, `user_metadata` içindeki `full_name` ve `phone` değerlerini `useEffect` ile `fullName` ve `phone` state'lerine yükler. Form gönderildiğinde `onSave` async fonksiyonu çalışır: `supabase.auth.updateUser` ile kullanıcı metadata'sını günceller, başarılı olursa toast ile bildirim gösterir, hata durumunda ise hata mesajı gösterir. Kaydetme işlemi sırasında buton devre dışı kalır ve yüklenme animasyonu gösterilir.

**Parametreler**:
- (parametre almaz)

**Dönüş**: JSX.Element — Kullanıcı profili düzenleme formunu içeren bir React bileşeni döndürür.

---

## İTHALATLAR (IMPORTS)
- import: ../../hooks/useAuth::useAuth
- import: @/i18n/I18nProvider::useI18n
- import: @/lib/supabase/client::supabaseBrowserClient
- import: lucide-react::Check
- import: lucide-react::Loader2
- import: lucide-react::Phone
- import: lucide-react::User
- import: react::React
- import: sonner::toast

---

## INTERFACES

### UserMetadata
- `full_name?: string`
- `phone?: string`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: `src/views/account/AccountProfilePage.tsx`::AccountProfilePage
- **params**: (yok)
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan dönen çeviri fonksiyonu, tüm UI metinleri bu ile çekilir
  - `user` — `useAuth()` hook'undan dönen oturum açmış kullanıcı nesnesi, user_metadata içerir
  - `fullName` / `setFullName` — Kullanıcının tam adını tutan React state'i, input'a bağlanır
  - `phone` / `setPhone` — Kullanıcının telefon numarasını tutan React state'i, input'a bağlanır
  - `saving` / `setSaving` — Kaydetme işlemi sırasında loading durumunu tutan boolean state, buton disabled ve spinner kontrolü için kullanılır
  - `meta` — `user?.user_metadata` değerinden türetilen UserMetadata cast nesnesi, useEffect içinde fullName ve phone state'lerini besler
  - `onSave` — Form submit handler'ı, async fonksiyon olarak tanımlı
  - `e` — `React.FormEvent` parametresi, `e.preventDefault()` ile sayfa yenilemesi engellenir
  - `error` — `supabase.auth.updateUser()` destructuring sonucundan elde edilen hata nesnesi, varsa throw edilir
- **Dönüş**: JSX (React bileşeni), profil düzenleme formu render eder

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