---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\account\AccountSecurityPage.tsx
skeleton_hash: 3ee88315eea607cf
entity_hashes:
  func:AccountSecurityPage: c6bf7ae08fac23f0
  overview: 44f19fdf9e73a3e3
  style_tokens: ac89c7eeea9aa372
generated_at: 2026-05-29T18:53:04Z
---

## Genel Bakış
`AccountSecurityPage`, kullanıcının hesap güvenliğiyle ilgili tüm ayarları yönettiği ana React sayfasıdır. Şifre değiştirme, bağlı kimlik sağlayıcılarını (Google, e-posta vb.) görüntüleme/bağlama ve şifre gücü kontrolü gibi güvenlik işlevlerini tek bir bileşen içinde sunar.

## Fonksiyon Grupları
### Güvenlik Ayarları Arayüzü ve Etkileşim
Sayfanın ana rendered durumunu, form alanlarını ve kullanıcı etkileşimlerini yöneten tek bir kapsamlı bileşeni içerir. Şifre formu alanlarını, durum yönetimini ve tüm UI mantığını barındırır.
- `AccountSecurityPage` (sayfanın tüm render, durum ve etkileşim mantığını yöneten ana bileşen)

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

**Not:** `AccountSecurityPage()` fonksiyon imzası parametresizdir ve modül sabitleri tanımlı değildir. Fonksiyon gövdesi analiz edilmediği için, veri bağımlılıkları, koşullar ve iş mantığı çıkarılamamıştır. Mimari varsayımlar belirlenememiştir.

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

### [N1_NASIL] AST Pointer: `src/views/account/AccountSecurityPage.tsx`::AccountSecurityPage
- **params**: (yok)
- **ic_degiskenler**:
  - `router` — `useRouter()` hookundan dönen Next.js yönlendirici nesnesi, sayfa yönlendirmeleri için kullanılır
  - `user` — `useAuth()` hookundan destructure edilen mevcut oturum açmış kullanıcı nesnesi
  - `t` — `useI18n()` hookundan destructure edilen çeviri fonksiyonu, UI metinleri için kullanılır
  - `current` — `useState('')` state'i, mevcut/eski şifre input değerini tutar
  - `password` — `useState('')` state'i, yeni şifre input değerini tutar
  - `confirm` — `useState('')` state'i, şifre tekrar input değerini tutar
  - `saving` — `useState(false)` state'i, form gönderim işleminin devam edip etmediğini belirtir
  - `identities` — `useState<Array<{id?: string; provider?: string}>>()` state'i, kullanıcının bağlı kimlik/bağlantı listesini tutar (google, email vb.)
  - `hasProvider` — arrow fonksiyon, verilen provider string'ine sahip identities elemanı olup olmadığını kontrol eder
  - `passwordRules` — dizi, her biri `key`, `label`, `test` alanına sahip şifre kuralları nesneleri dizisi (uzunluk, büyük harf, rakam, özel karakter)
  - `passedRules` — `passwordRules` dizisi üzerinden `password` state'inin test ettiği kural sayısı (0-4 arası)
  - `strengthColor` — `passedRules` sayısına göre arka plan rengi CSS sınıfı (bg-red-500, bg-orange-400, bg-yellow-400, bg-green-500)
  - `strengthLabel` — `passedRules` sayısına göre Türkçe güç etiketi string'i (Zayıf, Orta, İyi, Güçlü)
- **Dönüş**: JSX (React bileşen render çıktısı)

### [N2_NASIL] AST Pointer: `src/views/account/AccountSecurityPage.tsx`::refreshIdentities
- **params**: (yok)
- **ic_degiskenler**:
  - `data` — `supabase.auth.getUser()` çağrısından dönen data nesnesi, kullanıcı bilgilerini içerir
  - `error` — `supabase.auth.getUser()` çağrısından dönen hata nesnesi, hata yoksa undefined
  - `ids` — `data.user.identities` alanının tip cast edilmiş hali `Array<{id?: string; provider?: string}>`, boş dizi fallback ile `setIdentities(ids)` ile state'e yazılır
- **Dönüş**: void (yan etki: `identities` state'ini günceller)

### [N3_NASIL] AST Pointer: `src/views/account/AccountSecurityPage.tsx`::handleSubmit
- **params**: `e: React.FormEvent` — form submit event nesnesi, `e.preventDefault()` ile varsayılan engellenir
- **ic_degiskenler**:
  - `email` — `user?.email || ''` ile elde edilen kullanıcı e-posta adresi, yeniden kimlik doğrulama için kullanılır
  - `reauth` — `supabase.auth.signInWithPassword({ email, password: current })` çağrısının sonucu, mevcut şifre ile yeniden kimlik doğrulama yanıtı; `reauth.error` varsa yanlış şifre
  - `pwned` — `hibpPwnedCount(password)` async çağrısının sonucu (sayı), yeni şifrenin Have I Been Pwned veritabanında kaç kez sızdırıldığını gösterir; 0'dan büyükse şifre reddedilir
  - `error` — `supabase.auth.updateUser({ password })` çağrısından destructure edilen hata nesnesi, şifre güncelleme başarısızsa fırlatılır
- **Dönüş**: void (yan etkiler: şifre günceller, form alanlarını sıfırlar, toast bildirimleri gösterir)

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