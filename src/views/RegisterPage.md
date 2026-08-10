---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\RegisterPage.tsx
skeleton_hash: 4b87a54e9a311eb5
entity_hashes:
  func:RegisterPage: 595595bc145e81ea
  func:handleChange: c35710484665a43c
  func:handleSubmit: 460293fdfa9263b6
  func:validateForm: 35d7413c1db3ab00
  overview: c7a082fe60195496
  style_tokens: b4142733c6599819
generated_at: 2026-06-19T20:51:31Z
---

## Genel Bakış
RegisterPage.tsx modülü, kullanıcıların yeni bir hesap oluşturabilmesi için gerekli olan kayıt formunu ve formun yönetim mantığını barındıran bir React bileşenidir. Modül, kullanıcının form alanlarına girdiği verileri tutar, bu verilerin tanımlı kurallara göre geçerliliğini doğrular ve geçerli ise sunucuya göndererek kayıt işlemini tamamlar.

## Fonksiyon Grupları
### Ana Sayfa Bileşeni
Modülün dışa açılan kapısı olup tüm kayıt sayfası arayüzünü, form yapısını ve kullanıcı etkileşim noktalarını ekrana çizer.
- RegisterPage

### Form Etkileşimi ve İş Akışı Yönetimi
Kullanıcı girdilerini yakalayarak form verisini güncelleyen, bu verilerin doğruluğunu test eden ve son olarak formun sunucuya gönderilmesi işlemini başlatarak iş akışını tamamlayan yardımcı fonksiyonlardır.
- handleChange, validateForm, handleSubmit

---

## AXIOMS – Mimari Varsayımlar
[Genel varsayım]: Bu modül, bir kullanıcı kayıt formu sunan ve gönderilen verilerin doğruluğunu doğrulayan bir React bileşenidir.

[Aksiyom 1]: Eğer bileşen doğru bir şekilde render edilecekse, bir `useState` hook'u ile en az `email`, `password`, `confirmPassword`, `error` ve `loading` alanlarını tutan bir başlangıç state'i (initialState) tanımlı olmalıdır.
[Aksiyom 2]: Eğer bir form alanı güncellenecekse, `handleChange` fonksiyonu, bir `React.ChangeEvent<HTMLInputElement>` parametresi almalı ve ilgili state alanını güncellemelidir. Etkilenen state alanının adı, HTML input'unun `name` özelliği ile eşleşmelidir.
[Aksiyom 3]: Eğer form gönderimi tetiklenecekse, `handleSubmit` fonksiyonu, bir `React.FormEvent` parametresi almalı ve `e.preventDefault()` çağrısı ile sayfa yenilemesini engellemelidir.
[Aksiyom 4]: Eğer `validateForm` fonksiyonu çalıştırılacaksa, mevcut state alanlarını (`email`, `password`, `confirmPassword`) kontrol etmeli ve geçerli ise `true`, geçersiz ise `false` döndürmelidir. Eşik değerleri ve kurallar (ör. email formatı, minimum şifre uzunluğu) fonksiyon gövdesinde tanımlı olmalıdır.
[Aksiyom 5]: Eğer `handleSubmit` başarılı bir form doğrulamasından (`validateForm() === true`) geçecekse, `loading` state'i `true` olarak ayarlanmalı ve bir API isteği (fetch/axios) gönderilmelidir. İstek başarısız olursa `error` state'i güncellenmeli, başarılı olursa kullanıcı başka bir sayfaya yönlendirilmelidir.

---

## FONKSİYON DETAYLARI

### RegisterPage
**Ne yapar**: Bu React bileşeni, kullanıcı kayıt formunu oluşturur ve yönetir. Bileşen, form alanlarını, giriş doğrulamayı ve gönderme işlemini kapsayan bir kayıt arayüzü sağlar.
**Nasıl yapar**: Bileşen, içinde `handleChange`, `validateForm` ve `handleSubmit` yardımcı fonksiyonlarını tanımlayarak form durumunu (state) ve olaylarını yönetir. `useState` ve `useEffect` gibi React hook'larını kullanarak form verilerini ve hata mesajlarını tutar. JSX dönüşünde bir HTML form öğesi ve gerekli input alanlarını render eder.
**Parametreler**: Fonksiyon hiçbir parametre almaz.
**Dönüş**: `React.FC` — Bileşen, geçerli bir React fonksiyonel bileşeni olarak `React.FC` tipini döndürür.

### handleChange
**Ne yapar**: Form içindeki herhangi bir giriş alanındaki (input) değişiklik olayını yakalar ve ilgili form durumunu (state) günceller. Kullanıcının her tuş vuruşunda veya seçiminde form verilerini canlı olarak güncel tutar.
**Parametreler**:
- `e: React.ChangeEvent<HTMLInputElement>` — Bir input öğesinden (text, email, password vb.) gelen değişiklik olayını temsil eder. Olay nesnesinden hedef elementin `name` ve `value` niteliklerini alarak ilgili form alanını günceller.
**Dönüş**: Hiçbir değer döndürmez (void). Sadece yan etki olarak form state'ini günceller.

### validateForm
**Ne yapar**: Formdaki tüm alanların geçerliliğini kontrol eder. Gerekli alanların boş olup olmadığını, e-posta formatı gibi belirli kurallara uygunluğu denetler.
**Parametreler**: Hiçbir parametre almaz. Form durumuna (state) doğrudan erişir.
**Dönüş**: Hiçbir değer döndürmez (void). Doğrulama sonuçlarını bir hata durumu (errors state) nesnesine kaydeder veya geçerlilik bayrağını günceller. `handleSubmit` tarafından gönderme öncesi çağrılır.

### handleSubmit
**Ne yapar**: Form gönderme olayını işler. Öncelikle `validateForm` ile doğrulama yapar, eğer doğrulama başarılıysa form verilerini bir API'ye göndermek veya başka bir işlem için hazırlar. Sayfanın yeniden yüklenmesini engeller.
**Parametreler**:
- `e: React.FormEvent` — Formun submit olayını temsil eder. `preventDefault()` yöntemi ile varsayılan form gönderme davranışı durdurulur.
**Dönüş**: Hiçbir değer döndürmez (void). Başarılı gönderimde kullanıcıyı başka bir sayfaya yönlendirebilir veya bir durum mesajı gösterebilir.

---

## İTHALATLAR (IMPORTS)
- import: ../hooks/useAuth::useAuth
- import: ../hooks/useLocalizedRoutes::useLocalizedRoutes
- import: ../i18n/I18nProvider::useI18n
- import: ../utils/passwordSecurity::hibpPwnedCount
- import: lucide-react::ArrowLeft
- import: lucide-react::CheckCircle
- import: lucide-react::Eye
- import: lucide-react::EyeOff
- import: lucide-react::Lock
- import: lucide-react::Mail
- import: lucide-react::User
- import: next/link::Link
- import: react::React
- import: react::useState
- import: sonner::toast

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/RegisterPage.tsx::RegisterPage
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `useState` hook'lardan dönen state'ler ve setter'lar — form verisi, loading durumu, şifre görünürlüğü, kurallar listesi, registration tamamlanma durumu, şifre gücü rengi,passedRules (geçilen kural sayısı) bileşen içinde manage edilir
  - `formData` — `{ name, email, password, confirmPassword }` shape'inde form state'i
  - `loading` — submit sırasında true olan yüklenme flag'i
  - `showPassword` — şifre alanı toggling görünürlüğü
  - `showConfirmPassword` — şifre tekrar alanı toggling görünürlüğü
  - `registrationComplete` — kayıt sonrası email onay ekranına geçiş flag'i
  - `strengthColor` — şifre gücü barı için dinamik renk (passedRules'a bağlı)
  - `passedRules` — kurallar listesi içinde test() geçen kural sayısı
  - `rules` — şifre güvenlik kuralları dizisi (her biri `{ key, test, label }`)
  - `t` — `useI18n()` hook'undan dönen çeviri fonksiyonu
  - `signUp` — `useAuth()` hook'undan dönen kayıt fonksiyonu
  - `router` — `useLocalizedRoutes()` hook'undan dönen yönlendirme objesi
- **Dönüş**: JSX — Register sayfası (form, şifre gücü göstergesi, kurallar listesi, onay ekranı)

---

### [N2_NASIL] AST Pointer: src/views/RegisterPage.tsx::handleChange
- **params**: `(e: React.ChangeEvent<HTMLInputElement>)`
- **ic_degiskenler**:
  - `formData` — mevcut form state'i, spread ile kopyalanıp güncellenir (`...formData`)
  - `e.target.name` — değişen input'un name attribute'u (dynamic key olarak kullanılır: `[e.target.name]: e.target.value`)
  - `e.target.value` — değişen input'un yeni değeri
- **Dönüş**: yok (doğrudan `setFormData` ile state günceller)

---

### [N3_NASIL] AST Pointer: src/views/RegisterPage.tsx::validateForm
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `formData.name` — kullanıcının girdiği isim, `trim()` ile boşluk kontrolü yapılır
  - `formData.email` — kullanıcının girdiği email, `includes('@')` ile format kontrolü yapılır
  - `passedRules` — şifre güvenlik kurallarından kaçının geçildiği sayacı, `passedRules < 4` kontrolü ile tüm kuralların zorunlu olduğunu doğrular
  - `formData.password` — kullanıcının girdiği şifre, passedRules kontrolünde kullanılır
  - `formData.confirmPassword` — şifre tekrar alanı, `formData.password !== formData.confirmPassword` eşleşme kontrolü yapılır
  - `t` — çeviri fonksiyonu, hata mesajları için kullanılır
  - `toast.error` —Sonner toast kütüphanesinden hata bildirim gösterir
- **Dönüş**: `true` (tüm kontroller geçildi) veya `false` (validation hatası, toast ile kullanıcıya bildirim gösterilir)

---

### [N4_NASIL] AST Pointer: src/views/RegisterPage.tsx::handleSubmit
- **params**: `(e: React.FormEvent)`
- **ic_degiskenler**:
  - `e.preventDefault()` — form submit'in default browser davranışını engeller
  - `validateForm()` — form validasyonu çağrılır, false dönerse fonksiyon erken return ile çıkar
  - `setLoading(true)` — yükleme durumunu aktif eder
  - `pwned` — `hibpPwnedCount(formData.password)` async çağrısından dönen sayı; bilinen veri sızıntılarında şifrenin kaç kez geçtiğini tutar. `pwned > 0` ise engellenir
  - `formData.password` — HIBP kontrolü ve `signUp` çağrısı için kullanılır
  - `hibpPwnedCount` — `../utils/passwordSecurity` modülünden import edilmiş k-Anonymity tabanlı şifre sızıntı kontrol fonksiyonu
  - `signUp` — `useAuth()` hook'undan gelen Supabase auth kayıt fonksiyonu, `(formData.email, formData.password, formData.name)` ile çağrılır
  - `error` — `signUp` dönüşündeki `{ error }` destructured objesi; `error.message` içinde `'already registered'` veya `'Password should be at least'` substring kontrolü yapılır
  - `formData.email` — signUp için email parametresi
  - `formData.name` — signUp için name parametresi
  - `setRegistrationComplete(true)` — başarılı kayıt sonrası email onay ekranına geçişi tetikler
  - `t` — çeviri fonksiyonu, hata/başarı mesajları için kullanılır
  - `toast` — Sonner toast kütüphanesi (`.error` ve `.success` metodları)
  - `console.error` — catch bloğunda registration error loglaması yapar
- **Dönüş**: yok (yan etkiler: toast bildirimleri, state güncellemeleri, Supabase auth çağrısı)

---

### [N5_NASIL] AST Pointer: src/views/RegisterPage.tsx::(render: strengthBar iterator)
- **params**: `(i: number)` — strength bar segmentlerinin index'i
- **ic_degiskenler**:
  - `passedRules` — kaç kuralın geçildiği sayacı, `i <= passedRules` koşulu ile segmentin dolu mu boş mu olacağını belirler
  - `strengthColor` — geçilen kural sayısına göre dinamik arka plan rengi (Tailwind class)
  - `className` — ternary ile `strengthColor` veya `'bg-light-gray'` atanır
- **Dönüş**: JSX `<div>` — `flex-1 rounded-full` stilli, `transition-colory` animasyonlu bar segmenti

---

### [N6_NASIL] AST Pointer: src/views/RegisterPage.tsx::(render: ruleItem iterator)
- **params**: `(rule)` — `{ key, test, label }` shape'inde şifre kuralı objesi
- **ic_degiskenler**:
  - `rule.test(formData.password)` — kuralın mevcut şifre üzerindeki test fonksiyonu çağrısı, boolean döner
  - `formData.password` — test edilen şifre değeri
  - `rule.key` — React key identifier olarak kullanılır
  - `rule.label` — kural açıklaması, JSX içinde `<li>` içeriğinde render edilir
  - `rule.test(formData.password)` sonucuna göre ternary: `'✓'` veya `'○'` ikonu ve `text-green-600` / `text-steel-gray` renk class'ı atanır
- **Dönüş**: JSX `<li>` — her şifre kuralı için onay/başarısız göstergeli liste elemanı

---


## MERMAID CALL GRAPH
```mermaid
graph TD
    RegisterPage_tsx__RegisterPage["RegisterPage"]
    RegisterPage_tsx__handleChange["handleChange"]
    RegisterPage_tsx__handleSubmit["handleSubmit"]
    RegisterPage_tsx__validateForm["validateForm"]
    RegisterPage_tsx__RegisterPage --> RegisterPage_tsx__validateForm
```

## NODE ID STANDARD

  file: src\views\RegisterPage.tsx
  function: src\views\RegisterPage.tsx::RegisterPage
  function: src\views\RegisterPage.tsx::handleChange
  function: src\views\RegisterPage.tsx::validateForm
  function: src\views\RegisterPage.tsx::handleSubmit

---

## DISA AKTARILANLAR (EXPORTS)
  export: RegisterPage

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-gradient-to-br`, `bg-light-gray`, `bg-primary-navy`, `bg-repeat`, `bg-success-green`, `bg-white/90`, `border-2`, `border-b-2`, `border-light-gray`, `border-primary-navy`, `border-white`, `border-white/20`, `focus-visible:border-transparent`, `from-air-blue`, `hover:bg-primary-navy`
- **Layout:** `absolute`, `backdrop-blur-sm`, `block`, `flex`, `flex-1`, `from-air-blue`, `gap-1`, `gap-1.5`, `h-1.5`, `h-16`, `h-5`, `inline-flex`, `items-center`, `justify-center`, `left-3`
- **Varyant/Responsive:** `:`, `disabled:`, `focus-visible:`, `hover:` önekleri
- **Yardımcı Sınıflar:** `$`, `:`, `<=`, `animate-spin`, `border`, `disabled:cursor-not-allowed`, `disabled:opacity-50`, `duration-300`, `focus-visible:outline-none`, `focus-visible:ring-2`, `focus-visible:ring-primary-navy`, `font-bold`, `font-medium`, `font-semibold`, `i`