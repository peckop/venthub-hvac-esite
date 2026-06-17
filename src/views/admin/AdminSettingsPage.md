---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\vh-settings-i18n\src\views\admin\AdminSettingsPage.tsx
skeleton_hash: b9807eb7cfdd5d7d
entity_hashes:
  func:AdminSettingsPage: d7abe5daa414ecdd
  func:handleSave: e32c68904d8a419f
  overview: 7bfa420fad4577a6
  style_tokens: 6047f3ed12c6d671
generated_at: 2026-06-17T20:39:44Z
---

## Genel Bakış
AdminSettingsPage, VentHub HVAC yönetim panelinde yönetici ayarlarının görüntülendiği ve düzenlendiği merkezi React bileşenidir. Genel, ödeme, yönetici yönetimi ve sistem olmak üzere dört kategorideki ayarları sekmeli bir arayüzde sunar ve yapılan değişikliklerin sunucuda kalıcı hale getirilmesini sağlar.

## Fonksiyon Grupları
### Arayüz ve Bileşen Sunumu
Yönetici ayarlarının sekmeli yapıda kullanıcılara sunulmasını, form alanlarının oluşturulmasını ve yerel durum yönetimini içerir. Sayfa yapısını tanımlayarak kullanıcı etkileşimine olanak tanır.
- AdminSettingsPage

### Veri Kalıcılığı
Düzenlenen ayarların ilgili sekme kategorisine göre asenkron olarak sunucuya gönderilmesini ve veritabanına kaydedilmesini sağlar.
- handleSave

---

## AXIOMS – Mimari Varsayımlar
- Bu modül davranışsal mantık içermez (salt veri / konfigürasyon / tip tanımı).
- [Aksiyom 1]: Modülün dışa açtığı yapı (anahtar kümesi / şema) bir sözleşmedir; tüketiciler bu sabit yapıya bağlıdır — kırıcı değişiklik tüm tüketicileri etkiler.
- [Aksiyom 2]: Bir öğe ekleme/çıkarma yapısal-uyumlu olmalı; ilgili tipler ve seçiciler aynı commit'te güncel tutulmalıdır.

---

## FONKSİYON DETAYLARI

### AdminSettingsPage

**Ne yapar**: VentHub HVAC sisteminin yönetici ayarları sayfasını render eden ana React bileşenidir. Sistemin yapılandırma seçeneklerini, yönetici tercihlerini veya uygulama ayarlarını görüntülemek ve düzenlemek için kullanılan bir functional component'tir.

**Nasıl yapar**: React functional component yapısı ile tanımlanmıştır. İçerisinde handleSave gibi yardımcı fonksiyonları barındırarak form işlemlerini yönetir. Sayfa yüklenmesi durumunda mevcut ayarları_getirebilir ve kullanıcıya bir arayüz sunar.

**Parametreler**:
Bu bileşen parametre almaz — React.FC olarak tanımlı, stateles veya kendi içinde state yöneten bağımsız bir sayfa bileşenidir.

**Dönüş**: `React.ReactNode` — JSX ile oluşturulmuş bir React bileşen döndürür. Sayfanın tüm HTML yapısını ve interaktif öğelerini içerir.

### handleSave
**Ne yapar**: Admin ayarları sayfasında, belirli bir sekme (tab) için yapılan değişiklikleri kaydeder.

**Nasıl yapar**: Fonksiyon, bir `tab` parametresi alır ve muhtemelen bu sekmeye ait form verilerini veya ayarları bir API'ye göndererek sunucuda güncelleme işlemi başlatır. Verilen kod bloğunda, bir arrow fonksiyonunun `handleSave('general')` çağrısı yaptığı görülmektedir; bu, varsayılan olarak "general" sekmesinin kaydedilme işlemini tetiklediğini gösterir. Fonksiyonun `async` olması, içeriğinde asenkron bir işlem (örn. `fetch`, `axios.post`) yürütüleceğini ve bir `Promise` döndürebileceğini ima eder.

**Parametreler**:
- `tab`: `'general' | 'payment' | 'admins' | 'system'` — Kaydedilecek ayarların bulunduğu sekmeyi belirten bir union type. Sadece bu dört değerden birini alabilir.
- **Dönüş**: `Promise<void>` (veya muhtemelen `Promise<any>`). Fonksiyon bir `async` bloğu olduğu için bir `Promise` döndürür; ancak kesin dönüş tipi kaynak kodunda belirtilmediği için `void` veya bilinmeyen bir veri olabilir.

---

## İTHALATLAR (IMPORTS)
- import: ../../components/admin/AdminSkeleton::AdminSkeleton
- import: ../../hooks/useRole::useRole
- import: ../../hooks/useSettings::useSettings
- import: ../../i18n/I18nProvider::useI18n
- import: ../../lib/admin/mutateWithAudit::AdminPermissionError
- import: ../../lib/admin/mutateWithAudit::mutateWithAudit
- import: ../../lib/supabase/client::supabaseBrowserClient
- import: lucide-react::Activity
- import: lucide-react::CreditCard
- import: lucide-react::Globe
- import: lucide-react::Save
- import: lucide-react::ShieldCheck
- import: react::React
- import: react::useEffect
- import: react::useState
- import: sonner::toast

---

## AST POINTERS

### [N1_NASIL] AST Pointer: `AdminSettingsPage.tsx`::AdminSettingsPage
- **params**: (yok — React fonksiyonel bileşen, parametre almaz)
- **ic_degiskenler** (state setter'lar ve JSX'te erişilen değişkenler — fonksiyon gövdesinden çıkarılmıştır):
  - `settings` — useSettings() hook'undan gelen mevcut site ayarları nesnesi; `settings.general.*` ve `settings.payment.*` alt nesnelerine erişilir
  - `siteName` — site adı input değeri; `settings.general.site_name`'den doldurulur, `setSiteName` ile güncellenir
  - `setSiteName` — site adı state setter'ı
  - `tagline` — site sloganı input değeri; `settings.general.tagline`'dan doldurulur
  - `setTagline` — slogan state setter'ı
  - `contactEmail` — iletişim e-posta adresi input değeri; `settings.general.contact_email`'den doldurulur
  - `setContactEmail` — e-posta state setter'ı
  - `supportPhone` — destek telefonu input değeri; `settings.general.support_phone`'dan doldurulur
  - `setSupportPhone` — telefon state setter'ı
  - `headquarters` — merkez adresi input değeri; `settings.general.headquarters`'dan doldurulur
  - `setHeadquarters` — merkez state setter'ı
  - `logoUrl` — logo URL input değeri; `settings.general.logo_url`'den doldurulur (fallback boş string)
  - `setLogoUrl` — logo URL state setter'ı
  - `iyzicoEnabled` — iyzico ödeme sistemi aktiflik durumu; `settings.payment.iyzico_enabled`'den doldurulur
  - `setIyzicoEnabled` — iyzico aktiflik state setter'ı
  - `iyzicoMode` — iyzico test/live modu; `settings.payment.iyzico_mode`'dan doldurulur
  - `setIyzicoMode` — iyzico mod state setter'ı
  - `iyzicoApiKey` — iyzico API anahtarı; `settings.payment.iyzico_api_key`'den doldurulur
  - `setIyzicoApiKey` — iyzico API anahtarı state setter'ı
  - `activeTab` — şu an seçili olan ayarlar sekmesi ID'si; JSX'te `activeTab === tab.id` karşılaştırması ile sekmeler arası geçiş kontrol edilir
  - `setActiveTab` — aktif sekme değiştirme fonksiyonu; her sekme butonunun `onClick`'inde çağrılır
  - `tabs` — sekme tanımları dizisi; her elemanın `tab.id`, `tab.label`, `tab.icon` özellikleri JSX'te kullanılır
- **Dönüş**: `React.FC` — JSX içeren React bileşeni; ayarlar formunu sekmeli arayüzde render eder

---

## NODE ID STANDARD

  file: src\views\admin\AdminSettingsPage.tsx
  function: src\views\admin\AdminSettingsPage.tsx::AdminSettingsPage
  function: src\views\admin\AdminSettingsPage.tsx::handleSave

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
- **Renkler:** `bg-cyan-400`, `bg-cyan-500/5`, `bg-rose-500/10`, `bg-slate-900`, `bg-slate-950/40`, `bg-transparent`, `border-b`, `border-rose-500/20`, `border-t`, `border-white/10`, `border-white/5`, `group-hover:bg-cyan-500/10`, `group-hover:text-cyan-400`, `hover:bg-cyan-300`, `hover:bg-white/5`
- **Layout:** `absolute`, `block`, `flex`, `flex-col`, `gap-2`, `gap-3`, `gap-4`, `gap-6`, `gap-8`, `grid`, `grid-cols-1`, `h-5`, `h-64`, `items-center`, `items-start`
- **Varyant/Responsive:** `:`, `focus-visible:`, `group-hover:`, `hover:`, `lg:`, `md:` önekleri
- **Yardımcı Sınıflar:** `!bg-slate-950`, `!border-white/5`, `$`, `${adminButtonPrimaryClass`, `${adminCardClass`, `${adminInputClass`, `-mr-32`, `-mt-32`, `:`, `===`, `activeTab`, `animate-in`, `blur-3xl`, `border`, `cursor-pointer`