---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\admin\AdminSettingsPage.tsx
skeleton_hash: 82eb6271e372de31
entity_hashes:
  func:AdminSettingsPage: d7abe5daa414ecdd
  func:openModal: 742557352e2b120f
  overview: c1b3377dff6e6dba
  style_tokens: f388bdfece87d34c
generated_at: 2026-06-19T20:49:27Z
---

## Genel Bakış
AdminSettingsPage, yönetim panelindeki ayarların sekmeli bir arayüzde görüntülenmesini ve düzenlenmesini sağlayan React bileşenidir. Genel yapılandırma, ödeme, admin ve sistem gibi farklı ayar kategorilerini merkezi bir sayfada sunarak yönetici kullanıcıların bu ayarları güncellemesine olanak tanır. Bileşen, iç durum yönetimi ve modal tabanlı düzenleme akışıyla çalışır.

## Fonksiyon Grupları
### Sayfa Bileşeni
Ana React bileşenini ve sayfa yapısını oluşturur. Ayar sekmeleri, durum yönetimi ve alt bileşenlerin render edilmesi bu bileşen tarafından koordine edilir.
- AdminSettingsPage

### Modal Etkileşimi
Belirli bir ayar bölümünün düzenlenmesi için modal penceresi açma mantığını yönetir. Bölüm türüne göre uygun modal içeriğini ve varsayılan değerleri belirler.
- openModal

## Dış Bağımlılıklar
- React çerçeve kütüphanesi ve bileşen yaşam döngüsü
- SettingsSection ve RenderableSettings gibi proje içi tip tanımları
- Merkezi durum yönetimi (Context veya Store) ve olası API katmanları

## Mimari Notlar
Bileşen, Modal aracılığıyla düzenlemeyi lazy olarak tetikler; bu sayede sadece gerektiğinde ilgili form yüklenir. Sayfa, dinamik olarak farklı ayar bölümleri arasında geçiş yapabilen modüler bir yapıya sahiptir.

---

## AXIOMS – Mimari Varsayımlar
Bu modül için, verilen fonksiyon imzaları ve mevcut doküman metni temel alınarak aşağıdaki mimari varsayımlar tanımlanmıştır.

[Aksiyom 1]: Eğer `openModal` fonksiyonu geçerli bir `SettingsSection` (enum tipi) değeri olmadan çağrılırsa, modal penceresi doğru bir bölüm için açılamaz veya uygulama beklenmeyen bir duruma girer.

[Aksiyom 2]: Eğer `openModal` fonksiyonundaki `values` parametresi `null` değilse, bu parametrenin `RenderableSettings` tipinde ve modal'ın açıldığı bölüm ile uyumlu bir veri yapısına sahip olması gerekir; aksi halde modal içindeki form alanları doğru değerleri gösteremez.

[Aksiyom 3]: Eğer `AdminSettingsPage` bileşeni, `openModal` fonksiyonunu çağıracak bir referansa veya erişime sahip değilse (örn. prop olarak geçilmiyor veya import edilmiyor), ayar düzenleme işlevi kullanıcıya sunulamaz ve sayfa salt görüntüleme modunda çalışır.

[Aksiyom 4]: Eğer `SettingsSection` veya `RenderableSettings` tipleri (veya ilgili veri yapıları) modül dışında tanımlıysa ve bu tanımlar değişirse, `openModal` fonksiyonunun çağrılma biçimi de güncellenmelidir; aksi halde derleme veya çalışma zamanı hataları oluşur.

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
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `t` — useI18n hook'undan gelen çeviri fonksiyonu
  - `canWrite` — useRole hook'undan gelen rol kontrol fonksiyonu
  - `hasWriteAccess` — 'settings' izni olup olmadığını boolean olarak tutar
  - `loading` — veri yükleme durumunu boolean olarak tutar (useState)
  - `error` — hata mesajını string veya null olarak tutar (useState)
  - `generalValues` — genel ayarları (site adı, slogan, iletişim bilgileri) tutar (useState)
  - `paymentValues` — ödeme ayarlarını (iyzico aktif/pasif, mod, api key) tutar (useState)
  - `adminsValues` — admin politikalarını (session timeout, MFA gerekliliği) tutar (useState)
  - `systemValues` — sistem yapılandırmalarını (log seviyesi, debug modu) tutar (useState)
  - `modalOpen` — modalın açık/kapalı durumunu tutar (useState)
  - `modalSection` — şu an hangi bölümün edit edildiğini tutar (useState)
  - `modalInitialValues` — modal için başlangıç değerlerini tutar (useState)
  - `fetchAllSettings` — tüm ayarları Supabase'den çeken async fonksiyon (useCallback)
  - `adminSectionTitleClass` — admin başlık için CSS class (kodda tanımlı değil, dış kaynak)
  - `adminSubtitleClass` — admin alt başlık için CSS class (kodda tanımlı değil, dış kaynak)
  - `adminCardClass` — admin kartları için CSS class (kodda tanımlı değil, dış kaynak)
- **Dönüş**: React JSX elementi (ayarlar sayfası)

### [N2_NASIL] AST Pointer: src/views/admin/AdminSettingsPage.tsx::fetchAllSettings
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `fetchError` — Supabase sorgusundan gelen hata nesnesi
  - `data` — Supabase'den çekilen site_settings tablosu satırları
  - `gen` — 'general' anahtarına ait ayarlar (site_name, tagline vb. alanlarını tutar)
  - `pay` — 'payment' anahtarına ait ayarlar (iyzico_enabled, iyzico_mode vb. alanlarını tutar)
  - `adm` — 'admins' anahtarına ait ayarlar (admin_sessions_timeout, mfa_required alanlarını tutar)
  - `sys` — 'system' anahtarına ait ayarlar (system_log_level, debug_mode alanlarını tutar)
  - `err` — try-catch bloğunda yakalanan hata nesnesi
- **Dönüş**: void (Promise<void>) - state'leri günceller, return ile değer dönmez

### [N3_NASIL] AST Pointer: src/views/admin/AdminSettingsPage.tsx::useEffect callback
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: undefined - fetchAllSettings() çağırır, temizlik dönüşü yok

### [N4_NASIL] AST Pointer: src/views/admin/AdminSettingsPage.tsx::openModal
- **params**: (section: SettingsSection, values: RenderableSettings | null)
- **ic_degiskenler**: (yok - sadece state setter'ları çağırır)
- **Dönüş**: void - modal durumunu günceller

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