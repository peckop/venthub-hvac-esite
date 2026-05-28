---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\account\AccountSecurityPage.tsx
skeleton_hash: 714d41430b62d140
entity_hashes:
  func:AccountSecurityPage: c6bf7ae08fac23f0
  overview: 4253e862f0a8090f
  style_tokens: ac89c7eeea9aa372
generated_at: 2026-05-28T22:38:52Z
---

## Genel Bakış
`AccountSecurityPage` bileşeni, kullanıcı hesabının güvenlik ayarlarını görüntülemek ve yönetmek için tasarlanmış bir React sayfasıdır. Sayfa, şifre değişikliği, iki faktörlü kimlik doğrulama ve oturum yönetimi gibi güvenlik ilgili işlemlerin UI mantığını barındırır.

## Fonksiyon Grupları
### Güvenlik Ayarları UI
Bu grup, güvenlik ayarlarını kullanıcıya sunan ve etkileşimlerini yöneten tek bir bileşeni içerir.  
- AccountSecurityPage   (sayfanın ana render ve durum yönetimi)

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSİYON DETAYLARI

### AccountSecurityPage
**Ne yapar**: Kullanıcı hesap güvenlik ayarlarını görüntüleyen ve yöneten bir React sayfa bileşenidir. Şifre değiştirme formu, şifre gücü göstergesi ve bağlı giriş yöntemlerini (Google, e-posta/şifre) listeleme/bağlantı yönetimi özelliklerini içerir.

**Nasıl yapar**: Bileşen `useState` ile mevcut şifre, yeni şifre, şifre tekrarı, kaydetme durumu ve kimlik sağlayıcı listesi state'lerini yönetir. Sayfa yüklendiğinde `useEffect` ile `refreshIdentities` çağrılarak Supabase Authentication üzerinden kullanıcının bağlı kimlikleri (`identities`) alınır. `hasProvider` yardımcı fonksiyonu belirli bir sağlayıcının mevcut olup olmadığını kontrol eder. Şifre formu gönderildiğinde (`handleSubmit`): mevcut şifre boş mu, şifre kuralları (8 karakter, büyük harf, rakam, özel karakter) karşılanıyor mu, yeni şifre ve tekrarı eşleşiyor mu kontrolleri yapılır; ardından mevcut şifreyle re-auth yapılır, HIBP üzerinden sızıntı kontrolü gerçekleştirilir ve geçilirse Supabase'de şifre güncellenir. Bağlı hesaplar bölümünde Google sağlayıcısı yönetimi `linkIdentity` ve `unlinkIdentity` API'leri ile yapılır. Şifre gücü, `passwordRules` dizisindeki dört kuralın geçilme sayısına göre hesaplanır ve görsel çubuk ve metin olarak gösterilir.

**Parametreler**:
- Bu fonksiyon React bileşeni olduğu için herhangi bir parametre almaz. Kullanıcı bilgilerine `useAuth()` hook'u, yönlendirme için `useRouter()` hook'u ve çeviri için `useI18n()` hook'u üzerinden erişir.

**Dönüş**: JSX elementi döndürür (`React.ReactNode`). Şifre değiştirme formu ve bağlı hesaplar kartını içeren bir kullanıcı arayüzü render eder.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\AccountSecurityPage.tsx::AccountSecurityPage
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `router` — `useRouter()` hook'undan gelen router nesnesi; sayfa yönlendirmeleri için kullanılır.
  - `user` — `useAuth()` hook'undan gelen oturum bilgisi; mevcut kullanıcının e‑posta vb. alanlarına erişim sağlar.
  - `t` — `useI18n()` hook'undan gelen çeviri fonksiyonu; UI metinlerini yerelleştirir.
  - `current` — Mevcut şifre giriş alanının state'i; `setCurrent` ile güncellenir.
  - `setCurrent` — `current` state'ini güncelleyen setter fonksiyonu.
  - `password` — Yeni şifre giriş alanının state'i; `setPassword` ile güncellenir.
  - `setPassword` — `password` state'ini güncelleyen setter fonksiyonu.
  - `confirm` — Yeni şifre tekrar giriş alanının state'i; `setConfirm` ile güncellenir.
  - `setConfirm` — `confirm` state'ini güncelleyen setter fonksiyonu.
  - `saving` — Form gönderimi sırasında gösterilen yükleme durumu; `setSaving` ile güncellenir.
  - `setSaving` — `saving` state'ini güncelleyen setter fonksiyonu.
  - `identities` — Bağlı kimlik (google, email vb.) listesi; `setIdentities` ile güncellenir.
  - `setIdentities` — `identities` state'ini güncelleyen setter fonksiyonu.
  - `hasProvider` — Belirli bir sağlayıcı (`p`) mevcut mu diye kontrol eden yardımcı fonksiyon; `identities` üzerinden `some` ile arama yapar.
  - `passwordRules` — Şifre kurallarını tanımlayan nesne dizisi; her kural bir `key`, `label` ve `test` fonksiyonu içerir.
  - `passedRules` — `passwordRules` içinde `password` değerini geçen kural sayısı; şifre gücünü hesaplamak için kullanılır.
  - `strengthColor` — `passedRules` değerine göre belirlenen arka plan rengi sınıfı; UI’da şifre gücünü gösterir.
  - `strengthLabel` — `passedRules` değerine göre belirlenen metin etiketi (Zayıf, Orta, İyi, Güçlü); UI’da şifre gücünü gösterir.
- **Dönüş**: yok (React bileşeni JSX döndürür; yan etkileri `useEffect` ve iç fonksiyonlarla yönetilir)

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\AccountSecurityPage.tsx::refreshIdentities
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `data` — `supabase.auth.getUser()` çağrısının başarılı yanıtı; kullanıcı bilgilerini içerir.
  - `error` — `supabase.auth.getUser()` çağrısının hata nesnesi; hata kontrolü için kullanılır.
  - `ids` — `data.user.identities` alanından alınan kimlik listesi; yoksa boş dizi (`[]`) atanır.
  - `setIdentities` — Üst bileşenden gelen state setter; kimlik listesini günceller.
  - `supabase` — Supabase istemcisi; kimlik bilgilerini almak için `auth.getUser()` metodunu çağırır.
- **Dönüş**: yok (state güncellenir, UI yeniden render olur)

### [N3_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\AccountSecurityPage.tsx::handleSubmit
- **params**: `e` — `React.FormEvent` nesnesi; form gönderimini durdurmak için `preventDefault()` çağrılır.
- **ic_degiskenler**:
  - `e` — Form submit olayı; `e.preventDefault()` ile varsayılan davranış engellenir.
  - `current` — Mevcut şifre state'i; boş ise hata toast'ı gösterilir.
  - `passedRules` — Şifre kurallarının kaç tanesinin sağlandığını gösteren sayı; 4’ten azsa hata toast'ı gösterilir.
  - `password` — Yeni şifre state'i; kurallara uymuyorsa hata toast'ı gösterilir.
  - `confirm` — Yeni şifre tekrar state'i; `password` ile eşleşmezse hata toast'ı gösterilir.
  - `setSaving` — Form gönderimi sırasında yükleme durumunu (`saving`) kontrol eden setter; işlem başında `true`, bitişte `false` yapılır.
  - `user` — `useAuth()` hook'undan gelen oturum bilgisi; `email` alanı `reauth` için kullanılır.
  - `supabase` — Supabase istemcisi; kimlik doğrulama, şifre güncelleme ve kimlik bağlama işlemlerinde kullanılır.
  - `toast` — `react-hot-toast` kütüphanesinden gelen toast fonksiyonu; hata ve başarı mesajları gösterir.
  - `t` — Çeviri fonksiyonu; toast mesajlarını yerelleştirir.
  - `hibpPwnedCount` — `password`'ün daha önce sızdırılıp sızdırılmadığını kontrol eden async fonksiyon; 0’dan büyükse hata toast'ı gösterilir.
  - `setCurrent` — `current` state'ini temizleyen setter; işlem başarılı olduğunda boş string atanır.
  - `setPassword` — `password` state'ini temizleyen setter; işlem başarılı olduğunda boş string atanır.
  - `setConfirm` — `confirm` state'ini temizleyen setter; işlem başarılı olduğunda boş string atanır.
  - `console` — Hata yakalama bloklarında hataları konsola loglamak için kullanılır.
- **Dönüş**: yok (form gönderimi yan etkileriyle (toast, state güncellemeleri, yönlendirme) yönetilir)

---

## NODE ID STANDARD

  file: src\views\account\AccountSecurityPage.tsx
  function: src\views\account\AccountSecurityPage.tsx::AccountSecurityPage

---

## DISA AKTARILANLAR (EXPORTS)
  export: AccountSecurityPage

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-green-50`, `bg-primary-navy`, `bg-slate-100`, `bg-slate-200`, `bg-slate-50`, `bg-white`, `border-b`, `border-green-200`, `border-slate-100`, `border-slate-200`, `border-slate-200/60`, `border-t`, `border-transparent`, `focus-visible:border-primary-navy`, `hover:bg-industrial-gray`
- **Layout:** `absolute`, `block`, `flex`, `flex-1`, `gap-1`, `gap-1.5`, `gap-2`, `gap-3`, `gap-5`, `gap-x-2`, `gap-y-0.5`, `grid`, `grid-cols-1`, `grid-cols-2`, `h-1`
- **Varyant/Responsive:** `:`, `disabled:`, `focus-visible:`, `hover:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `$`, `:`, `<=`, `animate-spin`, `border`, `disabled:cursor-not-allowed`, `disabled:opacity-60`, `duration-300`, `focus-visible:outline-none`, `focus-visible:ring-2`, `focus-visible:ring-primary-navy/20`, `font-bold`, `font-medium`, `font-semibold`, `hover:scale-102`