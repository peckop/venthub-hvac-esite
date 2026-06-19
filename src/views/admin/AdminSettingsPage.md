---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\admin\AdminSettingsPage.tsx
skeleton_hash: 6f4e81ef99cd3f0d
entity_hashes:
  func:AdminSettingsPage: d7abe5daa414ecdd
  func:openModal: 742557352e2b120f
  overview: a93bc9c56cdba4e0
  style_tokens: f388bdfece87d34c
generated_at: 2026-06-19T11:49:52Z
---

## Genel Bakış
AdminSettingsPage, VentHub HVAC yönetim panelinde yönetici ayarlarının görüntülendiği ve düzenlendiği merkezi React bileşenidir. Sistem yapılandırmalarını, tercihleri ve yönetim seçeneklerini kullanıcılara sunarak bu ayarların değiştirilmesine ve güncellenmesine olanak tanır.

## Fonksiyon Grupları
### Sayfa Bileşeni ve Arayüz
Modülün ana React bileşenini ve temel arayüz yapısını oluşturur. Sayfanın yüklenmesi, sekmeler arası geçiş ve yerel durum yönetimi bu grupta ele alınır.
- AdminSettingsPage

### Modal Etkileşimi
Kullanıcı arayüzünde belirli bir ayar bölümünü düzenlemek için modal penceresi açma işlevini yönetir. Seçilen bölüme göre modal içeriğini ve durumunu kontrol eder.
- openModal

## Dış Bağımlılıklar
- React kütüphanesi ve bileşen yaşam döngüsü
- Proje içindeki tipler (SettingsSection, RenderableSettings)
- Muhtemelen merkezi durum yönetimi (Context veya Store) ve API çağrıları

---

## AXIOMS – Mimari Varsayımlar

Bu modül, yönetici ayarlarının sekmeli bir arayüzde görüntülenmesini ve düzenlenmesini sağlayan React bileşenidir. Doğru çalışması için aşağıdaki mimari varsayımlar geçerlidir.

[Aksiyom 1]: Eğer geçerli bir SettingsSection (örn: 'general', 'payment', 'admin', 'system') değeri sağlanmazsa, openModal fonksiyonu uygun modalı açamaz veya bileşen doğru ayar kategorisini gösteremez.

[Aksiyom 2]: Eğer openModal fonksiyonu null değerinde values parametresi ile çağrılırsa, modal varsayılan boş/default değerlerle açılır.

[Aksiyom 3]: Eğer AdminSettingsPage bileşeni React çerçeve ortamında (React.FC olarak) çalışmıyorsa, bileşen render edilemez veya hata fırlatır.

[Aksiyom 4]: Eğer bir ayar kategorisi için RenderableSettings yapısı geçerli alanları içermiyorsa, form alanları yanlış değerler gösterebilir veya doldurulamaz.

---

## FONKSİYON DETAYLARI

### AdminSettingsPage

**Ne yapar**: VentHub HVAC sisteminin yönetici ayarları sayfasını render eden ana React bileşenidir. Sistemin yapılandırma seçeneklerini, yönetici tercihlerini veya uygulama ayarlarını görüntülemek ve düzenlemek için kullanılan bir functional component'tir.

**Nasıl yapar**: React functional component yapısı ile tanımlanmıştır. İçerisinde handleSave gibi yardımcı fonksiyonları barındırarak form işlemlerini yönetir. Sayfa yüklenmesi durumunda mevcut ayarları_getirebilir ve kullanıcıya bir arayüz sunar.

**Parametreler**:
Bu bileşen parametre almaz — React.FC olarak tanımlı, stateles veya kendi içinde state yöneten bağımsız bir sayfa bileşenidir.

**Dönüş**: `React.ReactNode` — JSX ile oluşturulmuş bir React bileşen döndürür. Sayfanın tüm HTML yapısını ve interaktif öğelerini içerir.

### openModal
**Ne yapar**: Belirtilen ayarlar bölümünü ve ilgili değerleri kullanarak modal penceresini açar. Kullanıcının belirli bir ayarlar kategorisinde düzenleme yapabilmesi için gerekli olan arayüzü aktif hale getirir.

**Nasıl yapar**: Fonksiyon, verilen `section` parametresi ile hangi ayarlar kategorisinin açılacağını belirler ve `values` parametresi ile o kategorideki mevcut ayar değerlerini modal içeriğine aktarır. Bu sayede kullanıcı, ilgili ayarları düzenleyebilmek için açılan modalda doğru bilgilerle karşılaşır. Fonksiyonun return tipi `void` olarak belirlenmiştir, bu nedenle herhangi bir değer dönmez.

**Parametreler**:
- `section`: `SettingsSection` — Modalda açılacak ayarlar bölümünü belirtir. Bu tip muhtemelen `'general'`, `'notifications'`, `'security'` gibi string literal union türünden oluşmaktadır.
- `values`: `RenderableSettings | null` — Modalda gösterilecek ve düzenlenecek olan mevcut ayar değerlerini temsil eder. `null` değer gönderildiğinde modal boş değerlerle açılabilir veya varsayılan değerler kullanılabilir.

**Dönüş**: `void` — Fonksiyon herhangi bir değer dönmez, yalnızca modal penceresinin açılması gibi bir yan etki gerçekleştirir.

---

## İTHALATLAR (IMPORTS)
- import: ../../components/admin/AdminSkeleton::AdminSkeleton
- import: @/hooks/useRole::useRole
- import: @/i18n/I18nProvider::useI18n
- import: @/lib/supabase/client::supabaseBrowserClient
- import: lucide-react::Activity
- import: lucide-react::CreditCard
- import: lucide-react::Globe
- import: lucide-react::ShieldCheck
- import: react::React
- import: react::useCallback
- import: react::useEffect
- import: react::useState

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/admin/AdminSettingsPage.tsx::AdminSettingsPage
- **params**: () (parametre yok)
- **ic_degiskenler**:
  - `t` — useI18n hook'undan gelen çeviri fonksiyonu, metinleri uluslararasılaştırmak için kullanılır
  - `canWrite` — useRole hook'undan gelen yetki kontrol fonksiyonu, belirli alanlarda yazma izni olup olmadığını kontrol eder
  - `hasWriteAccess` — Boolean, canWrite('settings') çağrısının sonucu, ayarlar alanında yazma izni olup olmadığını tutar
  - `loading` — Boolean state, veri yüklenirken true, yükleme tamamlanınca false olur
  - `error` — String|null state, oluşabilecek hata mesajlarını tutar
  - `RenderableSettings` — Type alias, ayar değerlerinin tutulduğu Record tipi (string|number|boolean|null|undefined değerleri kabul eder)
  - `generalValues` — RenderableSettings|null state, genel ayar değerlerini tutar (site_name, tagline, contact_email, support_phone, headquarters, logo_url)
  - `paymentValues` — RenderableSettings|null state, ödeme ayar değerlerini tutar (iyzico_enabled, iyzico_mode, iyzico_api_key)
  - `adminsValues` — Record<string,unknown> state, yönetici politika ayarlarını tutar (admin_sessions_timeout, mfa_required)
  - `systemValues` — Record<string,unknown> state, sistem yapılandırma ayarlarını tutar (system_log_level, debug_mode)
  - `modalOpen` — Boolean state, modal penceresinin açık olup olmadığını kontrol eder
  - `modalSection` — SettingsSection|null state, hangi ayar bölümünün düzenleneceğini tutar
  - `modalInitialValues` — RenderableSettings|null state, modal'a gönderilecek başlangıç değerlerini tutar
  - `fetchAllSettings` — useCallback ile sarılmış async fonksiyon, supabase'den site_settings tablosundan tüm ayarları çeker ve ilgili state'leri günceller
- **Dönüş**: JSX element (React component) — Admin ayarları sayfasını gösteren React bileşeni

### [N2_NASIL] AST Pointer: src/views/admin/AdminSettingsPage.tsx::fetchAllSettings
- **params**: [] (parametre yok)
- **ic_degiskenler**:
  - `data` — Supabase'den gelen site_settings tablosu satırları (key ve value alanları)
  - `fetchError` — Supabase sorgusu sırasında oluşan hata nesnesi
  - `gen` — RenderableSettings, data içinden key='general' olan satırın value değeri, genel ayarları tutar
  - `pay` — RenderableSettings, data içinden key='payment' olan satırın value değeri, ödeme ayarlarını tutar
  - `adm` — Record<string,unknown>, data içinden key='admins' olan satırın value değeri, yönetici politika ayarlarını tutar
  - `sys` — Record<string,unknown>, data içinden key='system' olan satırın value değeri, sistem yapılandırma ayarlarını tutar
  - `gen.site_name` — Genel ayarlar içindeki site adı değeri
  - `gen.tagline` — Genel ayarlar içindeki slogan değeri
  - `gen.contact_email` — Genel ayarlar içindeki iletişim emaili değeri
  - `gen.support_phone` — Genel ayarlar içindeki destek telefonu değeri
  - `gen.headquarters` — Genel ayarlar içindeki merkez adresi değeri
  - `gen.logo_url` — Genel ayarlar içindeki logo URL'si değeri
  - `pay.iyzico_enabled` — Ödeme ayarları içindeki iyzico etkinlik durumu
  - `pay.iyzico_mode` — Ödeme ayarları içindeki iyzico modu (production/sandbox)
  - `pay.iyzico_api_key` — Ödeme ayarları içindeki iyzico API anahtarı
  - `adm.admin_sessions_timeout` — Yönetici politika ayarları içindeki oturum zaman aşımı süresi
  - `adm.mfa_required` — Yönetici politika ayarları içindeki çok faktörlü kimlik doğrulama zorunluluğu
  - `sys.system_log_level` — Sistem yapılandırma ayarları içindeki log seviyesi
  - `sys.debug_mode` — Sistem yapılandırma ayarları içindeki hata ayıklama modu durumu
  - `err` — Catch bloğunda yakalanan hata nesnesi (Error tipi veya bilinmeyen tip)
- **Dönüş**: void (async fonksiyon, state'leri günceller ve yan etkileri vardır)

### [N3_NASIL] AST Pointer: src/views/admin/AdminSettingsPage.tsx::openModal
- **params**: (section: SettingsSection, values: RenderableSettings | null) — section: Düzenlenecek ayar bölümü, values: Modal'a gönderilecek başlangıç değerleri
- **ic_degiskenler**: (yok, sadece state güncelleme işlemleri yapar)
- **Dönüş**: void (modal'ı açar ve state'leri günceller)

---

## NODE ID STANDARD

  file: src\views\admin\AdminSettingsPage.tsx
  function: src\views\admin\AdminSettingsPage.tsx::AdminSettingsPage
  function: src\views\admin\AdminSettingsPage.tsx::openModal

---

## DISA AKTARILANLAR (EXPORTS)
  export: AdminSettingsPage

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-cyan-400/10`, `bg-cyan-500/5`, `bg-rose-500/10`, `border-b`, `border-cyan-400/20`, `border-rose-500/20`, `border-t`, `border-white/5`, `group-hover:bg-cyan-500/10`, `hover:bg-cyan-400`, `hover:text-slate-950`, `text-amber-400`, `text-cyan-400`, `text-emerald-400`, `text-lg`
- **Layout:** `absolute`, `block`, `flex`, `flex-col`, `gap-3`, `gap-6`, `gap-8`, `grid`, `grid-cols-1`, `h-64`, `items-center`, `justify-between`, `lg:p-10`, `md:flex-row`, `md:grid-cols-2`
- **Varyant/Responsive:** `:`, `disabled:`, `group-hover:`, `hover:`, `lg:`, `md:` önekleri
- **Yardımcı Sınıflar:** `${adminCardClass`, `-mr-32`, `-mt-32`, `:`, `animate-in`, `blur-3xl`, `border`, `disabled:cursor-not-allowed`, `disabled:opacity-50`, `duration-300`, `duration-700`, `fade-in`, `font-black`, `font-bold`, `font-mono`