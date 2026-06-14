---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\account\AccountSecurityPage.tsx
skeleton_hash: 4db14aeff45095c0
entity_hashes:
  func:AccountSecurityPage: f71c4639f75e785f
  overview: 075ea80a94c87d0f
  style_tokens: ac89c7eeea9aa372
generated_at: 2026-06-14T17:24:02Z
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
**Ne yapar**: Kullanıcının hesap güvenlik ayarlarını yöneten ana React bileşenidir. Şifre değiştirme formunu ve bağlı hesapları (Google, e-posta/şifre) yönetme arayüzünü sunar.
**Nasıl yapar**: React hook'larını (useState, useEffect) kullanarak form durumunu, şifre gücünü ve bağlı kimlikleri yönetir. Supabase Auth servisiyle entegre çalışarak kimlik doğrulama, şifre güncelleme ve kimlik bağlama/çıkarma işlemlerini gerçekleştirir. Şifre değiştirme iş akışında, mevcut şifreyle yeniden kimlik doğrulaması yapar, HIBP (Have I Been Pwned) k-Anonimite sızıntı kontrolü uygular ve tüm adımlarda kullanıcıya toast bildirimleri gösterir.
**Parametreler**: Yok (React bileşeni olarak props almaz).
**Dönüş**: `JSX.Element` — Kullanıcı arayüzünü oluşturan React JSX yapısı.

---

## İTHALATLAR (IMPORTS)
- import: ../../hooks/useAuth::useAuth
- import: ../../utils/passwordSecurity::hibpPwnedCount
- import: @/i18n/I18nProvider::useI18n
- import: @/lib/supabase/client::supabaseBrowserClient
- import: @supabase/supabase-js::type { UserIdentity }
- import: next/navigation::useRouter
- import: react::React
- import: react::useEffect
- import: react::useState
- import: sonner::toast

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/account/AccountSecurityPage.tsx::AccountSecurityPage
- **params**: (yok — React functional component, props almaz)
- **ic_degiskenler**:
  - `router` — `useRouter()` hook'undan gelen Next.js yönlendirme nesnesi, link navigasyonunda kullanılır
  - `user` — `useAuth()` hook'undan gelen mevcut oturum açmış kullanıcı nesnesi, `user?.email` ile e-posta adresine erişilir
  - `t` — `useI18n()` hook'undan gelen çeviri fonksiyonu, tüm UI metinleri bu ile render edilir
  - `current` — Mevcut (eski) şifrenin input state'i, `setCurrent` ile güncellenir, `handleSubmit` içinde Supabase re-auth için kullanılır
  - `password` — Yeni şifrenin input state'i, `setPassword` ile güncellenir, güç kontrolü ve `supabase.auth.updateUser` çağrısında kullanılır
  - `confirm` — Yeni şifre onay input'unun state'i, `setConfirm` ile güncellenir, `password !== confirm` eşleşme kontrolünde kullanılır
  - `saving` — Form gönderim sırasındaki loading durumu state'i, `setSaving(true/false)` ile toggle edilir, submit butonunu disabled yapar
  - `identities` — Kullanıcının bağlı kimliklerinin dizisi (`Array<{ id?: string; provider?: string }>`), Supabase'den çekilir, `hasProvider` ile kontrol edilir
  - `hasProvider` — `(p: string) => boolean` — Verilen sağlayıcı adının `identities` dizisinde mevcut olup olmadığını kontrol eden okunur fonksiyon
  - `refreshIdentities` — `async () => void` — Supabase `getUser()` çağrısıyla identities dizisini yenileyen iç fonksiyon, mount'ta ve link/unlink işlemlerinden sonra çağrılır
  - `passwordRules` — Şifre gücü kuralları dizisi; her eleman `{ key, label, test }` yapısındadır: `length` (>=8), `upper` (büyük harf), `digit` (rakam), `special` (özel karakter)
  - `passedRules` — `number` — Mevcut `password` değerinin geçtiği kural sayısı (0-4 arası)
  - `strengthColor` — `string` — `passedRules` sayısına göre CSS arka plan rengi sınıfı: `bg-red-500` / `bg-orange-400` / `bg-yellow-400` / `bg-green-500`
  - `strengthLabel` — `string` — `passedRules` sayısına göre çevrilmiş güç etiketi: zayıf/orta/iyi/güçlü
  - `handleSubmit` — `async (e: React.FormEvent) => void` — Form submit işleyicisi, re-auth + HIBP kontrolü + updateUser flux'u yönetir
- **Dönüş**: JSX element (React component render)

### [N2_NASIL] AST Pointer: src/views/account/AccountSecurityPage.tsx::refreshIdentities
- **params**: (yok)
- **ic_degiskenler**:
  - `data` — `supabase.auth.getUser()` sonucu `{ user }` destructuring'inden gelen veri nesnesi
  - `error` — Supabase API çağrısından dönen hata nesnesi, `null` ise başarı demektir
  - `ids` — `data.user.identities` dizisinin tip-cast edilmiş hali (`Array<{ id?: string; parent?: string }>`), fallback olarak boş dizi
- **Dönüş**: yok — yan etki: `setIdentities(ids)` çağrısıyla üst bileşenin state'ini günceller

### [N3_NASIL] AST Pointer: src/views/account/AccountSecurityPage.tsx::handleSubmit
- **params**: `e: React.FormEvent` — Form submit event nesnesi, `e.preventDefault()` ile varsayılan davranış engellenir
- **ic_degiskenler**:
  - `email` — `string` — `user?.email || ''` ifadesinden elde edilen kullanıcının e-posta adresi, Supabase re-auth için kullanılır
  - `reauth` — `supabase.auth.signInWithPassword({ email, password: current })` çağrısının sonucu, `.error` alanı ile mevcut şifre doğrulanır
  - `pwned` — `number` — `hibpPwnedCount(password)` çağrısının dönüş değeri, Have I Been Pwned API'si ile şifrenin sızıntı veritabanında olup olmadığını belirtir (k-Anonymity), 0'dan büyükse engellenir
  - `error` — `supabase.auth.updateUser({ password })` çağrısından dönen hata nesnesi, `throw` ile catch bloğuna iletilir
- **Dönüş**: yok — yan etkiler: şifre güncelleme, toast bildirimleri, state sıfırlama (`setCurrent('')`, `setPassword('')`, `setConfirm('')`)

### [N4_NASIL] AST Pointer: src/views/account/AccountSecurityPage.tsx::(Google unlink handler — anonim async arrow)
- **params**: (yok — onClick handler)
- **ic_degiskenler**:
  - `google` — `identities.find(...)` ile bulunan Google kimlik nesnesi (`{ id?: string; provider?: string }`), `google?.id` ile Supabase unlink çağrısına parametre olarak verilir
- **Dönüş**: yok — yan etkiler: `supabase.auth.unlinkIdentity(google as UserIdentity)` çağrısı ile Google bağlantısı kesilir, `refreshIdentities()` ile liste yenilenir, toast bildirimleri gösterilir

### [N5_NASIL] AST Pointer: src/views/account/AccountSecurityPage.tsx::(Google link handler — anonim async arrow)
- **params**: (yok — onClick handler)
- **ic_degiskenler**:
  - `data` — `supabase.auth.linkIdentity(...)` çağrısının dönüş verisi, `data?.url` alanı ile OAuth yönlendirme URL'ini içerir
  - `error` — Supabase `linkIdentity` API çağrısından dönen hata nesnesi
  - `url` — `(data as { url?: string })?.url` erişiminden elde edilen OAuth callback URL'i, mevcutsa `router.push(url)` ile yönlendirme yapılır
- **Dönüş**: yok — yan etkiler: `router.push(url)` ile OAuth sayfasına yönlendirme veya `refreshIdentities()` ile kimlik listesi yenileme, toast bildirimleri

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