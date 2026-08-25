---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\ResetPasswordPage.tsx
skeleton_hash: d093de2c696fc95c
entity_hashes:
  func:ResetPasswordPage: fa23efc56611b686
  func:handleSubmit: 460293fdfa9263b6
  overview: 85697f542d82ad5e
  style_tokens: 37c313d043ea26d9
generated_at: 2026-08-25T08:45:29Z
---

## Genel Bakış
Bu modül, kullanıcıların şifrelerini sıfırlayabilmeleri için bir sayfa bileşeni sunar. Bileşen, bir form görüntüler ve form gönderimi sırasında asenkron bir işlem gerçekleştirir. Modül, şifre sıfırlama akışının kullanıcı arayüzü katmanını temsil eder.

## Fonksiyon Grupları

### Bileşen Tanımı
Ana sayfa bileşenini tanımlar ve şifre sıfırlama formunun arayüzünü render eder.
- ResetPasswordPage

### Form İşleme
Form gönderim olayını yakalayarak asenkron bir şekilde işler; muhtemelen bir şifre sıfırlama isteği gönderir.
- handleSubmit

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdeleri sağlanmadığından, yalnızca imzalardan çıkarılabilecek sınırlı varsayımlar mevcuttur.

[Aksiyom 1]: Eğer `handleSubmit` fonksiyonu async olarak tanımlanmışsa, bu fonksiyon gövdesinde bir asenkron işlem (API çağrısı, veritabanı işlemi vb.) gerçekleştirilir. Ancak bu işlemin ne olduğu fonksiyon gövdesi görülmeden bilinmiyor.

[Aksiyom 2]: Eğer `handleSubmit` fonksiyonu `React.FormEvent` parametresi alıyorsa, bir HTML form elementinin onSubmit olayı ile çağrılır. Form gönderilmesi durumunda varsayılan davranışı (sayfa yenileme) engellemek için `e.preventDefault()` çağrısı beklenir; ancak bu çağrının yapılıp yapılmadığı fonksiyon gövdesi görülmeden bilinmiyor.

[Aksiyom 3]: Eğer `ResetPasswordPage` fonksiyonu `React.FC` tipinde bir değer döndürüyorsa, bu fonksiyon bir React bileşenidir ve JSX döndürmesi beklenir. Ancak bileşenin hangi UI elementlerini render ettiği fonksiyon gövdesi görülmeden bilinmiyor.

**Not:** Fonksiyon gövdeleri sağlanmadığı için; hangi API endpoint'ine istek yapıldığı, hangi state değişkenlerinin kullanıldığı, hata yönetiminin nasıl yapıldığı, hangi form alanlarının bulunduğu ve şifre sıfırlama akışının detayları bilinmiyor.

---

## FONKSİYON DETAYLARI

### ResetPasswordPage
**Ne yapar**: Şifre sıfırlama bağlantısından gelen kurtarma (recovery) oturumuyla yeni şifre belirleme ekranını oluşturan bir React bileşenidir. Kullanıcının şifresini unuttuğu durumda, e-posta yoluyla gönderilen sıfırlama bağlantısı aracılığıyla yeni bir şifre belirlemesini sağlar. AccountSecurityPage bileşeninden temel farkı, mevcut şifrenin sorulmamasıdır; çünkü kullanıcı zaten şifresini hatırlamamaktadır ve kimlik kanıtı e-postadaki bağlantının kurduğu oturum tarafından sağlanır.

**Nasıl yapar**: Bileşen, kurtarma oturumunu kullanarak bir form görüntüler. Kullanıcıdan mevcut şifre istenmez; yalnızca yeni şifre ve şifre onayı alanları sunulur. Şifre politikası RegisterPage ile birebir aynı kuralları uygular. Bileşen fonksiyonel bileşen olarak tanımlanmış olup `React.FC` tipinde bir değer döndürür.

**Parametreler**:
- Bu fonksiyon parametre almaz.

**Dönüş**: `React.FC` — React fonksiyonel bileşeni döndürür.

### handleSubmit
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

---

## İTHALATLAR (IMPORTS)
- import: ../hooks/useLocalizedRoutes::useLocalizedRoutes
- import: ../i18n/I18nProvider::useI18n
- import: ../utils/passwordSecurity::hibpPwnedCount
- import: @/lib/supabase/client::supabaseBrowserClient
- import: lucide-react::AlertCircle
- import: lucide-react::Eye
- import: lucide-react::EyeOff
- import: lucide-react::Lock
- import: next/link::Link
- import: next/navigation::useRouter
- import: react::React
- import: react::useEffect
- import: react::useState
- import: sonner::toast

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/ResetPasswordPage.tsx::ResetPasswordPage
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan dönen çeviri fonksiyonu; UI metinlerini lokalize etmek için kullanılır
  - `Routes` — `useLocalizedRoutes()` hook'undan dönen lokalize rota nesnesi; `Routes.home()` ve `Routes.auth.forgotPassword()` gibi yönlendirme URL'leri üretmek için kullanılır
  - `router` — `useRouter()` hook'undan dönen Next.js router nesnesi; `router.push(Routes.home())` ile başarılı şifre sıfırlama sonrası ana sayfaya yönlendirme yapar
  - `sessionState` — `useState<'checking' | 'ready' | 'missing'>('checking')` ile yönetilen durum; Supabase oturum kontrolünün sonucunu tutar: `'checking'` (yükleniyor), `'ready'` (oturum var, form gösterilir), `'missing'` (oturum yok, hata ekranı gösterilir)
  - `setSessionState` — `sessionState` durumunu güncelleyen setter fonksiyonu
  - `password` — `useState('')` ile yönetilen string; kullanıcının girdiği yeni şifre değerini tutar
  - `setPassword` — `password` durumunu güncelleyen setter fonksiyonu
  - `confirm` — `useState('')` ile yönetilen string; kullanıcının girdiği şifre onay değerini tutar
  - `setConfirm` — `confirm` durumunu güncelleyen setter fonksiyonu
  - `showPassword` — `useState(false)` ile yönetilen boolean; yeni şifre input'unun düz metin olarak gösterilip gösterilmediğini kontrol eder
  - `setShowPassword` — `showPassword` durumunu güncelleyen setter fonksiyonu
  - `showConfirm` — `useState(false)` ile yönetilen boolean; şifre onay input'unun düz metin olarak gösterilip gösterilmediğini kontrol eder
  - `setShowConfirm` — `showConfirm` durumunu güncelleyen setter fonksiyonu
  - `saving` — `useState(false)` ile yönetilen boolean; şifre güncelleme isteği sırasında `true` olur, butonun disabled durumunu ve yükleme göstergesini kontrol eder
  - `setSaving` — `saving` durumunu güncelleyen setter fonksiyonu
  - `cancelled` — `useEffect` içinde tanımlanan boolean; bileşen unmount edildiğinde `true` yapılır, `checkSession` fonksiyonunun oturum sonucunu state'e yazmasını engeller
  - `checkSession` — `useEffect` içinde tanımlanan async fonksiyon; `supabase.auth.getSession()` çağırarak oturum durumunu kontrol eder ve `setSessionState` ile sonucu `'ready'` veya `'missing'` olarak günceller
  - `data` — `supabase.auth.getSession()` yanıtından destructure edilen nesne; `data.session` değeri varsa oturum aktif, yoksa yok demektir
  - `passwordRules` — dizi; her eleman `{ key: string, label: string, test: (p: string) => boolean }` yapısında bir şifre kuralı tanımlar: uzunluk (>=8), büyük harf, rakam, özel karakter
  - `passedRules` — `passwordRules.filter(r => r.test(password)).length` ile hesaplanan sayı; `password` değerinin kaç şifre kuralını geçtiğini tutar
  - `strengthColor` — `passedRules` değerine göre belirlenen Tailwind CSS sınıfı; şifre gücü çubuğunun rengini belirler: 0-1 → `'bg-red-500'`, 2 → `'bg-orange-400'`, 3 → `'bg-yellow-400'`, 4 → `'bg-green-500'`
  - `strengthLabel` — `passedRules` değerine göre `t()` ile çevrilmiş şifre gücü etiketi: 0-1 → weak, 2 → fair, 3 → good, 4 → strong
  - `handleSubmit` — form gönderimini işleyen async fonksiyon; şifre kurallarını, eşleşme kontrolünü, HIBP sızıntı kontrolünü ve `supabase.auth.updateUser({ password })` çağrısını gerçekleştirir
  - `i` — `[1,2,3,4].map(i => ...)` içindeki sayısal indeks; şifre gücü göstergesindeki 4 çubuğun her birini temsil eder
  - `rule` — `passwordRules.map(rule => ...)` içindeki her kural nesnesi; `rule.key`, `rule.label` ve `rule.test(password)` alanlarına erişilir
- **Dönüş**: JSX — `sessionState` değerine göre üç farklı görünüm döndürür: `'checking'` durumunda yükleme spinner'ı, `'missing'` durumunda hata ekranı ve "yeni şifre iste" linki, `'ready'` durumunda şifre sıfırlama formu

### [N2_NASIL] AST Pointer: src/views/ResetPasswordPage.tsx::handleSubmit
- **params**:
  - `e` — `React.FormEvent` tipinde form event nesnesi; `e.preventDefault()` ile formun varsayılan submit davranışını engeller
- **ic_degiskenler**:
  - `pwned` — `hibpPwnedCount(password)` fonksiyonundan dönen sayı; 0'dan büyükse şifre sızıntı veritabanında bulunuyor demektir ve işlem engellenir
  - `error` (try bloğu içinde) — `supabase.auth.updateUser({ password })` yanıtından destructure edilen hata nesnesi; varsa `error.message` konsola yazılır ve kullanıcıya hata toast'ı gösterilir
  - `error` (catch bloğu içinde) — yakalanan genel hata nesnesi; konsola `'Reset password error:'` mesajıyla yazılır ve kullanıcıya beklenmeyen hata toast'ı gösterilir
- **Dönüş**: yok (void) — yan etkileri: başarılı olursa `toast.success` gösterir ve `router.push(Routes.home())` ile ana sayfaya yönlendirir; hata durumunda `toast.error` gösterir; her durumda `setSaving(false)` ile yükleme durumunu sıfırlar

---

## NODE ID STANDARD

  file: src\views\ResetPasswordPage.tsx
  function: src\views\ResetPasswordPage.tsx::ResetPasswordPage
  function: src\views\ResetPasswordPage.tsx::handleSubmit

---

## DISA AKTARILANLAR (EXPORTS)
  export: ResetPasswordPage

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-error-red`, `bg-gradient-to-br`, `bg-light-gray`, `bg-primary-navy`, `bg-white/90`, `border-b-2`, `border-light-gray`, `border-primary-navy`, `border-white`, `border-white/20`, `focus-visible:border-transparent`, `from-air-blue`, `hover:bg-secondary-blue`, `hover:text-primary-navy`, `text-2xl`
- **Layout:** `absolute`, `backdrop-blur-sm`, `block`, `flex`, `flex-1`, `from-air-blue`, `gap-1`, `gap-1.5`, `h-1.5`, `h-12`, `h-16`, `h-5`, `inline-block`, `items-center`, `justify-center`
- **Varyant/Responsive:** `:`, `disabled:`, `focus-visible:`, `hover:` önekleri
- **Yardımcı Sınıflar:** `$`, `:`, `<=`, `animate-spin`, `border`, `disabled:cursor-not-allowed`, `disabled:opacity-50`, `duration-300`, `focus-visible:outline-none`, `focus-visible:ring-2`, `focus-visible:ring-primary-navy`, `font-bold`, `font-medium`, `font-semibold`, `i`