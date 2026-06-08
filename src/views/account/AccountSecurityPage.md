---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\account\AccountSecurityPage.tsx
skeleton_hash: 2cd227e6d543fe3d
entity_hashes:
  func:AccountSecurityPage: c6bf7ae08fac23f0
  overview: 075ea80a94c87d0f
  style_tokens: ac89c7eeea9aa372
generated_at: 2026-06-08T10:10:59Z
---

## Genel Bakış
`AccountSecurityPage`, kullanıcının hesap güvenliğiyle ilgili tüm ayarları yönettiği ana React sayfasıdır. Şifre değiştirme, bağlı kimlik sağlayıcılarını (Google, e-posta vb.) görüntüleme/bağlama ve şifre gücü kontrolü gibi güvenlik işlevlerini tek bir bileşen içinde sunar.

## Fonksiyon Grupları
### Güvenlik Ayarları Arayüzü ve Etkileşim
Sayfanın ana arayüzünü, form alanlarını ve kullanıcı etkileşimlerini yöneten tek bir kapsamlı bileşeni içerir. Şifre formu alanlarını, durum yönetimini ve tüm UI mantığını barındırır.
- AccountSecurityPage

---

## AXIOMS – Mimari Varsayımlar

`AccountSecurityPage`, parametresiz bir React bileşenidir; dış veri bağımlılıkları ve render koşulları aşağıdaki varsayımlarla tanımlanır.

[Aksiyom 1]: Eğer bileşen dışındaki veri sağlayıcılar (React Context, custom hook'lar, global store vb.) mevcut değilse veya bileşen bunlara erişemiyorsa, sayfa güvenlik ayarlarını gösteren form alanları boş/varsayılan durumda render olur veya bileşen hata verir.

[Aksiyom 2]: Eğer oturum açmış kullanıcı nesnesi (current user) erişilebilir bir kaynaktan sağlanamıyorsa, şifre değiştirme formu ve bağlı kimlik sağlayıcıları bölümü kullanıcıya anlamsız veya boş bir arayüz sunar.

[Aksiyom 3]: Eğer bileşen hiçbir prop almıyorsa (fonksiyon imzası `AccountSecurityPage()` şeklindedir), sayfanın konfigürasyonu tamamen iç bağımlılıklar (hook'lar, context) üzerinden sağlanmalıdır; prop ile dışarıdan yapılandırma mümkün değildir.

[Aksiyom 4]: Eğer şifre gücü kontrolü için gerekli değerlendirme mantığı (zayıf/orta/güçlü eşik değerleri) dışarıdan bir yardımcı fonksiyon veya hook aracılığıyla sağlanamıyorsa, şifre gücü göstergesi yanlış veya sabit değerlerle render olur.

[Aksiyom 5]: Eğer kimlik sağlayıcıları (Google, e-posta vb.) için bağlantı durumları_depolanmıyorsa veya ilgili API çağrıları başarısız olursa, bağlı sağlayıcılar bölümü kullanıcının mevcut durumunu doğru yansıtmaz.

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

### [N1_NASIL] AST Pointer: `AccountSecurityPage.tsx`::AccountSecurityPage
- **params**: (yok)
- **ic_degiskenler**:
  - `router` — `useRouter()` hookundan alınan navigasyon nesnesi, programlı sayfa yönlendirmesi için kullanılır
  - `user` — `useAuth()` hookundan alınan mevcut oturum açmış kullanıcı nesnesi, email bilgisine erişim sağlar
  - `t` — `useI18n()` hookundan alınan çeviri fonksiyonu, UI metinlerini çok dilli yapar
  - `current` / `setCurrent` — mevcut şifre input'unun state'i, kullanıcının girdiği mevcut şifreyi tutar
  - `password` / `setPassword` — yeni şifre input'unun state'i, girilen yeni şifreyi tutar
  - `confirm` / `setConfirm` — şifre tekrar input'unun state'i, yeni şifrenin onayını tutar
  - `saving` / `setSaving` — form gönderim sırasındaki loading durum flag'i, buton disabled durumunu kontrol eder
  - `identities` / `setIdentities` — kullanıcının bağlı kimliklerinin (google, email vb.) listesini tutar, Supabase identities dizisi
  - `hasProvider` — arrow fonksiyon, verilen provider string'inin identities listesinde bulunup olmadığını kontrol eder (case-insensitive)
  - `passwordRules` — 4 elemanlı dizi, her biri `{key, label, test}` yapısında şifre kurallarını tanımlar (uzunluk, büyük harf, rakam, özel karakter)
  - `passedRules` — `passwordRules` dizisinin `test` fonksiyonları ile `password` state'ini filtreleyip `.length` ile geçen kural sayısını hesaplar
  - `strengthColor` — `passedRules` sayısına göre CSS arka plan renk sınıfı döndürür (red/orange/yellow/green)
  - `strengthLabel` — `passedRules` sayısına göre insan okunabilir güç etiketini döndürür (Zayıf/Orta/İyi/Güçlü)
- **Dönüş**: JSX (React bileşen render çıktısı)

### [N2_NASIL] AST Pointer: `AccountSecurityPage.tsx`::refreshIdentities
- **params**: (yok)
- **ic_degiskenler**:
  - `data` — `supabase.auth.getUser()` çağrısından dönen data nesnesi, `data.user` içinde identities bilgisini barındırır
  - `error` — `supabase.auth.getUser()` çağrısından dönen hata nesnesi, hata olup olmadığını kontrol eder
  - `ids` — `data.user.identities` dizisinin tip atlaması (cast) ile elde edilen `{id, provider}` dizisi, `|| []` ile fallback boş dizi
- **Dönüş**: void (setIdentities state setter ile identities state'ini günceller)

### [N3_NASIL] AST Pointer: `AccountSecurityPage.tsx`::handleSubmit
- **params**: `e` — `React.FormEvent`, form submit event nesnesi, `e.preventDefault()` ile varsayılan davranışı engellenir
- **ic_degiskenler**:
  - `email` — `user?.email` veya boş string fallback, re-authentication için kullanılır
  - `reauth` — `supabase.auth.signInWithPassword({email, password: current})` çağrısının sonucu, mevcut şifreyle yeniden kimlik doğrulaması yapar
  - `pwned` — `hibpPwnedCount(password)` async çağrısının返回 değeri, Have I Been Pwned API ile şifrenin sızıntı veritabanında olup olmadığını sayısal olarak döndürür (k-Anonymity)
  - `error` — `supabase.auth.updateUser({password})` çağrısından destructured hata nesnesi, şifre güncelleme başarısızsa throw edilir
- **Dönüş**: void (yan etkiler: toast bildirimleri, Supabase auth güncelleme, state resetleme)

### [N4_NASIL] AST Pointer: `AccountSecurityPage.tsx`::Google unlink handler (inline async arrow)
- **params**: (yok — anonymous arrow fonksiyon)
- **ic_degiskenler**:
  - `google` — `identities.find(...)` ile provider'ı 'google' olan kimlik nesnesi bulunur, `google?.id` ile Supabase identity ID'sine erişilir
  - `error` — `supabase.auth.unlinkIdentity(google as UserIdentity)` çağrısından destructured hata nesnesi, bağlantı koparma başarısızsa throw edilir
- **Dönüş**: void (yan etkiler: toast bildirimleri, identities listesi refresh)

### [N5_NASIL] AST Pointer: `AccountSecurityPage.tsx`::Google link handler (inline async arrow)
- **params**: (yok — anonymous arrow fonksiyon)
- **ic_degiskenler**:
  - `data` — `supabase.auth.linkIdentity({provider: 'google', options: {redirectTo: ...}})` çağrısının sonucu, içinde yönlendirme URL'i barındırır
  - `error` — linkIdentity çağrısından destructured hata nesnesi, hata varsa throw edilir
  - `url` — `(data as {url?: string})?.url` cast erişimi ile elde edilen OAuth yönlendirme URL'i, varsa `router.push()` ile navigasyon yapılır
- **Dönüş**: void (yan etkiler: toast bildirimleri, possible OAuth redirect via `router.push(url)`, identities refresh)

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