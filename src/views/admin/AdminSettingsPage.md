---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-wt-quote\src\views\admin\AdminSettingsPage.tsx
skeleton_hash: ed3434f0015766ed
entity_hashes:
  func:AdminSettingsPage: d7abe5daa414ecdd
  func:openModal: 742557352e2b120f
  overview: a93bc9c56cdba4e0
  style_tokens: 05cbeefecec906ae
generated_at: 2026-08-17T13:20:42Z
---

## Genel Bakış
AdminSettingsPage, yönetim panelinde merkezi bir ayarlar sayfası olarak çalışır. Yönetici kullanıcıların genel yapılandırma, ödeme, admin ve sistem gibi farklı kategorilerdeki ayarları sekmeli bir arayüzde görüntülemesini ve düzenlemesini sağlar.

## Fonksiyon Grupları

### Sayfa Bileşeni
Ana React bileşenini ve sayfa yapısını oluşturur. Ayar sekmelerinin yönetimi, durum kontrolü ve alt bileşenlerin render edilmesi koordine edilir.
- `AdminSettingsPage`

### Modal Etkileşimi
Belirli bir ayar bölümünün düzenlenmesi için modal penceresi açma mantığını yönetir. Bölüm türüne göre uygun modal içeriğini ve varsayılan değerleri belirler.
- `openModal`

---

## AXIOMS – Mimari Varsayımlar

AdminSettingsPage modülü, bağımsız çalışan bir React bileşeni olup, iç state yönetimi ve modal tabanlı düzenleme akışına dayanır.

---

**[Aksiyom 1]:** Eğer `SettingsSection` tipi tanımlı veya erişilebilir değilse, `openModal` fonksiyonunun `section` parametresi geçersiz olacağından modal hangi ayar bölümünü göstereceği bilemez.

**[Aksiyom 2]:** Eğer `RenderableSettings` tipi tanımlı veya erişilebilir değilse, `openModal` fonksiyonunun `values` parametresi için tip uyumsuzluğu oluşur.

**[Aksiyom 3]:** Eğer `openModal(section, values)` çağrısında `section` parametresi geçerli bir `SettingsSection` değeri değilse, modal doğru ayar arayüzünü render edemez.

**[Aksiyom 4]:** `AdminSettingsPage` hiç parametre almaz (`()`), bu nedenle kendi veri yükleme mechanism'ına (fetch, context, store vb.) bağımlıdır. Eğer bu mekanizma çalışmazsa sayfa boş veya hatalı render olur.

**[Aksiyom 5]:** `openModal` fonksiyonu `values: null` alabilir — bu durumda modal muhtemelen "yeni ekleme" modunda açılmalıdır. Eğer modal bileşeni `null` değerini handle edemezse hata oluşur.

**[Aksiyom 6]:** Bileşen modal durumunu kendi içinde yönetiyorsa (state), bileşen unmount olduğunda modal state'i temizlenmezse (cleanup) hafıza sızıntısı oluşabilir.

---

> **Not:** `SettingsSection` ve `RenderableSettings` tiplerinin içeriği fonksiyon imzasında belirtilmediğinden, bunların hangi değerlere izin verdiği bilinmemektedir. Bu tiplerin modül dışında tanımlı olduğu varsayılmıştır.

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
- **params**: yok
- **ic_degiskenler**:
  - `t` — useI18n hook'undan gelen çeviri fonksiyonu, Türkçe dize çevirileri için kullanılır
  - `canWrite` — useRole hook'undan gelen izin kontrol fonksiyonu
  - `hasWriteAccess` — `canWrite('settings')` çağrısının boolean sonucu, settings bölümü için yazma izni olup olmadığını belirtir
  - `loading` — `useState(true)` ile tanımlı, sayfa yükleme durumunu tutar (başlangıçta true)
  - `setLoading` — loading state'ini güncellemek için setter
  - `error` — `useState<string | null>(null)` ile tanımlı, hata mesajını tutar
  - `setError` — error state'ini güncellemek için setter
  - `RenderableSettings` — `Record<string, string | number | boolean | null | undefined>` türünde tip tanımı
  - `generalValues` — `useState<RenderableSettings | null>(null)` ile tanımlı, genel site ayar değerlerini tutar (site_name, tagline, contact_email, support_phone, headquarters, logo_url)
  - `setGeneralValues` — generalValues state'ini güncellemek için setter
  - `paymentValues` — `useState<RenderableSettings | null>(null)` ile tanımlı, ödeme ayar değerlerini tutar (iyzico_enabled, iyzico_mode, iyzico_api_key)
  - `setPaymentValues` — paymentValues state'ini güncellemek için setter
  - `adminsValues` — `useState<RenderableSettings | null>(null)` ile tanımlı, admin politika değerlerini tutar (admin_sessions_timeout, mfa_required)
  - `setAdminsValues` — adminsValues state'ini güncellemek için setter
  - `systemValues` — `useState<RenderableSettings | null>(null)` ile tanımlı, sistem yapılandırma değerlerini tutar (system_log_level, debug_mode)
  - `setSystemValues` — systemValues state'ini güncellemek için setter
  - `modalOpen` — `useState(false)` ile tanımlı, modalın açık olup olmadığını belirtir
  - `setModalOpen` — modalOpen state'ini güncellemek için setter
  - `modalSection` — `useState<SettingsSection | null>(null)` ile tanımlı, modalda düzenlenecek bölümü tutar
  - `setModalSection` — modalSection state'ini güncellemek için setter
  - `modalInitialValues` — `useState<RenderableSettings | null>(null)` ile tanımlı, modal açılırken kullanılacak başlangıç değerlerini tutar
  - `setModalInitialValues` — modalInitialValues state'ini güncellemek için setter
  - `fetchAllSettings` — `useCallback` ile sarılmış, supabase'den `site_settings` tablosunu çekip state'leri güncelleyen asenkron fonksiyon
- **Dönüş**: JSX — AdminSettingsPage bileşeninin render ettiği React elementi (ayar kartları, modal, skeleton veya hata gösterimi)

### [N2_NASIL] AST Pointer: src/views/admin/AdminSettingsPage.tsx::fetchAllSettings
- **params**: yok
- **ic_degiskenler**:
  - `data` — `supabase.from('site_settings').select('key, value')` çağrısından dönen satır dizisi
  - `fetchError` — supabase çağrısından dönen hata nesnesi, `error: fetchError` destructuring ile ayrıştırılmış
  - `gen` — `data?.find((r) => r.key === 'general')?.value` sonucu, `RenderableSettings` olarak cast edilmiş genel ayarlar
  - `pay` — `data?.find((r) => r.key === 'payment')?.value` sonucu, `RenderableSettings` olarak cast edilmiş ödeme ayarları
  - `adm` — `data?.find((r) => r.key === 'admins')?.value` sonucu, `Record<string, unknown>` olarak cast edilmiş admin politika değerleri
  - `sys` — `data?.find((r) => r.key === 'system')?.value` sonucu, `Record<string, unknown>` olarak cast edilmiş sistem yapılandırma değerleri
  - `err` — catch bloğunda yakalanan hata nesnesi (unknown türünde)
- **Dönüş**: yok — state setter'ları (setGeneralValues, setPaymentValues, setAdminsValues, setSystemValues, setLoading, setError) çağırarak yan etki üretir

### [N3_NASIL] AST Pointer: src/views/admin/AdminSettingsPage.tsx::useEffect callback
- **params**: yok
- **ic_degiskenler**: yok
- **Dönüş**: yok — `fetchAllSettings()` çağırarak bileşen mount edildiğinde ayarları çeker

### [N4_NASIL] AST Pointer: src/views/admin/AdminSettingsPage.tsx::openModal
- **params**: `(section: SettingsSection, values: RenderableSettings | null)`
- **ic_degiskenler**: yok
- **Dönüş**: yok — `setModalSection(section)`, `setModalInitialValues(values)`, `setModalOpen(true)` çağırarak modalı açar

### [N5_NASIL] AST Pointer: src/views/admin/AdminSettingsPage.tsx::SettingsFormModal onSuccess callback
- **params**: yok
- **ic_degiskenler**: yok
- **Dönüş**: yok — `fetchAllSettings()` çağırarak modal başarıyla kapandığında ayarları yeniden çeker

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
- **Renkler:** `bg-admin-accent-weak`, `bg-admin-danger-weak`, `border-admin-accent/30`, `border-admin-border`, `border-admin-danger/30`, `border-b`, `border-t`, `group-hover:bg-admin-accent-weak`, `hover:bg-admin-accent`, `hover:text-admin-fg-subtle`, `text-admin-accent`, `text-admin-danger`, `text-admin-fg`, `text-admin-fg-muted`, `text-admin-success`
- **Layout:** `absolute`, `block`, `flex`, `flex-col`, `gap-3`, `gap-6`, `gap-8`, `grid`, `grid-cols-1`, `h-64`, `items-center`, `justify-between`, `lg:p-10`, `md:flex-row`, `md:grid-cols-2`
- **Varyant/Responsive:** `:`, `disabled:`, `group-hover:`, `hover:`, `lg:`, `md:` önekleri
- **Yardımcı Sınıflar:** `${adminCardClass`, `-mr-32`, `-mt-32`, `:`, `animate-in`, `blur-3xl`, `border`, `disabled:cursor-not-allowed`, `disabled:opacity-50`, `duration-300`, `duration-700`, `fade-in`, `font-bold`, `font-mono`, `font-semibold`