---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\account\AccountSecurityPage.tsx
skeleton_hash: b17f74b19a7c2fff
entity_hashes:
  func:AccountSecurityPage: c6bf7ae08fac23f0
  overview: cc7d6b7ff9f545d5
  style_tokens: ac89c7eeea9aa372
generated_at: 2026-06-06T21:56:59Z
---

## Genel Bakış
`AccountSecurityPage`, kullanıcının hesap güvenliğiyle ilgili tüm ayarları yönettiği ana React sayfasıdır. Şifre değiştirme, bağlı kimlik sağlayıcılarını (Google, e-posta vb.) görüntüleme/bağlama ve şifre gücü kontrolü gibi güvenlik işlevlerini tek bir bileşen içinde sunar.

## Fonksiyon Grupları
### Güvenlik Ayarları Arayüzü ve Etkileşim
Sayfanın ana rendered durumunu, form alanlarını ve kullanıcı etkileşimlerini yöneten tek bir kapsamlı bileşeni içerir. Şifre formu alanlarını, durum yönetimini ve tüm UI mantığını barındırır.
- `AccountSecurityPage`

---

## AXIOMS – Mimari Varsayımlar
Bu modül, kullanıcının hesap güvenliğiyle ilgili tüm ayarları yönettiği ana React sayfasıdır.

[Aksiyom 1]: Eğer component, kullanıcı bilgilerini (oturum açmış kullanıcı) alamıyorsa veya kullanıcının kimliği doğrulanamıyorsa, security ayarları gösterilemez ve form alanları doldurulamaz.
[Aksiyom 2]: Eğer component, şifre değiştirme formunu submit ederken gerekli alanların (mevcut şifre, yeni şifre, onay) validasyonunu yapamıyorsa veya eksik alan varsa, form gönderilemez.
[Aksiyom 3]: Eğer component, şifre gücü kontrolü için gerekli kuralları veya

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

### [N1_NASIL] AST Pointer: AccountSecurityPage.tsx::AccountSecurityPage
- **params**: (yok)
- **ic_degiskenler**:
  - `router` — Next.js router nesnesi, programlı sayfa yönlendirmeleri (router.push) için
  - `user` — useAuth hook'undan gelen mevcut kullanıcı nesnesi, user.email erişimi yapılır
  - `t` — useI18n hook'undan gelen çeviri fonksiyonu, tüm UI metinleri için kullanılır
  - `current` — useState: Mevcut şifre inputunun değeri, kullanıcının girdiği mevcut şifreyi tutar
  - `password` — useState: Yeni şifre inputunun değeri, güç göstergesi ve kurallar hesaplanırken kullanılır
  - `confirm` — useState: Şifre tekrar inputunun değeri, password ile eşleşme kontrolü yapılır
  - `saving` — useState: Kaydetme işleminin devam edip etmediğini belirten boolean loading flag
  - `identities` — useState<Array<{id?, provider?}>>: Kullanıcının bağlı kimliklerinin (google, email vb.) listesi
  - `hasProvider` — Fonksiyon: Verilen provider adının identities dizisinde varlığını Some ile kontrol eder
  - `passwordRules` — Şifre güvenlik kurallarının tanımlandığı dizi (length, upper, digit, special test fonksiyonları ile)
  - `passedRules` — passwordRules dizisi üzerinde filter + length ile kaç kuralın geçildiğini hesaplayan sayı
  - `strengthColor` — passedRules sayısına göre CSS renk sınıfı stringi (red-500, orange-400, yellow-400, green-500)
  - `strengthLabel` — passedRules sayısına göre metin etiketi: 'Zayıf', 'Orta', 'İyi' veya 'Güçlü'
- **Dönüş**: JSX (React component render çıktısı), return yok ama yan etki olarak UI döndürür

---

### [N2_NASIL] AST Pointer: AccountSecurityPage.tsx::refreshIdentities
- **params**: (yok) — AccountSecurityPage içinde inner async fonksiyon
- **ic_degiskenler**:
  - `data` — supabase.auth.getUser() sonucu gelen {user: {...}} verisi, user.identities dizisine erişilir
  - `error` — supabase.auth.getUser() sonucu hata nesnesi, null olmadığında kullanıcı verisi alınır
  - `ids` — (data.user as {identities?}).identities cast edilerek elde edilen kimlikler dizisi, || [] ile fallback boş dizi
- **Dönüş**: void — async fonksiyon, setIdentities(state updater) ile identities state'ini günceller

---

### [N3_NASIL] AST Pointer: AccountSecurityPage.tsx::handleSubmit
- **params**:
  - `e` — React.FormEvent, form onSubmit olay nesnesi, e.preventDefault() ile varsayılan engellenir
- **ic_degiskenler**:
  - `email` — user?.email || '' ile elde edilen kullanıcının e-posta adresi, reauth signInWithPassword için kullanılır
  - `reauth` — supabase.auth.signInWithPassword({email, password: current}) sonucu, mevcut şifreyle yeniden kimlik doğrulama
  - `pwned` — hibpPwnedCount(password) sonucu, şifrenin HaveIBeenPwned veritabanında kaç kez sızıntıda bulunduğunu gösteren sayı
  - `error` — supabase.auth.updateUser({password}) sonucu hata nesnesi, throw ile catch bloğuna iletilir
- **Dönüş**: void — async fonksiyon, yan etkiler: toast bildirimleri, supabase auth güncelleme, state resetleme (setCurrent, setPassword, setConfirm)

---

### [N4_NASIL] AST Pointer: AccountSecurityPage.tsx::Google unlink handler (anonymous async)
- **params**: (yok) — Button onClick handler, async arrow fonksiyon
- **ic_degiskenler**:
  - `google` — identities.find(i => (i.provider||'').toLowerCase() === 'google') ile bulunan Google provider kimlik nesnesi, google.id kullanılır
  - `error` — supabase.auth.unlinkIdentity(google as UserIdentity) sonucu hata nesnesi, throw ile catch bloğuna iletilir
- **Dönüş**: void — async fonksiyon, yan etkiler: toast bildirimleri, supabase auth unlinkIdentity çağrısı, refreshIdentities() ile state güncelleme

---

### [N5_NASIL] AST Pointer: AccountSecurityPage.tsx::Google link handler (anonymous async)
- **params**: (yok) — Button onClick handler, async arrow fonksiyon
- **ic_degiskenler**:
  - `data` — supabase.auth.linkIdentity({provider: 'google', options: {redirectTo: ...}}) sonucu veri nesnesi
  - `error` — supabase.auth.linkIdentity sonucu hata nesnesi, throw ile catch bloğuna iletilir
  - `url` — (data as {url?: string})?.url ile elde edilen OAuth yönlendirme URL'si, varsa router.push ile açılır
- **Dönüş**: void — async fonksiyon, yan etkiler: toast bildirimleri, supabase auth linkIdentity çağrısı, olası router.push(url), refreshIdentities() ile state güncelleme

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