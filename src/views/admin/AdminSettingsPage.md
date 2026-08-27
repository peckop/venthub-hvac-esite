---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\venthub-wt-t131\src\views\admin\AdminSettingsPage.tsx
skeleton_hash: 955efbb84184a1dc
entity_hashes:
  func:AdminSettingsPage: d7abe5daa414ecdd
  func:openModal: 742557352e2b120f
  overview: c1b3377dff6e6dba
  style_tokens: 05cbeefecec906ae
generated_at: 2026-08-27T07:54:13Z
---

## Genel Bakış
AdminSettingsPage, yönetim panelinde merkezi bir ayarlar sayfası olarak çalışan bir React bileşenidir. Yönetici kullanıcıların genel yapılandırma, ödeme, admin ve sistem gibi farklı kategorilerdeki ayarları sekmeli bir arayüzde görüntülemesini ve düzenlemesini sağlar. Modül, `SettingsSection` ve `RenderableSettings` tiplerine bağımlıdır ve kendi veri yükleme mekanizmasına dayanır.

## Fonksiyon Grupları

### Sayfa Bileşeni
Ana React bileşenini ve sayfa yapısını oluşturur. Ayar sekmelerinin yönetimi, durum kontrolü ve alt bileşenlerin render edilmesi koordine edilir.
- AdminSettingsPage

### Modal Etkileşimi
Belirli bir ayar bölümünün düzenlenmesi için modal penceresi açma mantığını yönetir. Bölüm türüne göre uygun modal içeriğini ve varsayılan değerleri belirler.
- openModal

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdeleri sağlanmadığından, yalnızca imzalardan çıkarılabilecek varsayımlar belirlenebilir.

[Aksiyom 1]: Eğer `SettingsSection` tipi tanımlı değilse, `openModal` fonksiyonu çağrılamaz ve derleme hatası oluşur.

[Aksiyom 2]: Eğer `RenderableSettings` tipi tanımlı değilse, `openModal` fonksiyonu çağrılamaz ve derleme hatası oluşur.

[Aksiyom 3]: Eğer `openModal` fonksiyonuna `values` parametresi olarak `null` geçilirse, modal düzenleme modu yerine farklı bir davranış sergilemelidir (gövde bilinmediğinden kesin davranış belirlenemez).

[Aksiyom 4]: Eğer `AdminSettingsPage` bileşeni bir üst bileşen tarafından render edilmezse, ayarlar sayfası kullanıcıya gösterilmez.

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
  - `t` — `useI18n()` hook'undan destructure edilen çeviri fonksiyonu; JSX içinde `t('admin.titles.settings')` gibi anahtarlarla metinleri çözümlemek için kullanılır
  - `canWrite` — `useRole()` hook'undan destructure edilen yetki kontrol fonksiyonu; belirli bir modülün yazma iznini sorgular
  - `hasWriteAccess` — `canWrite('settings')` çağrısının boolean sonucu; düzenleme butonlarının `disabled` özelliğini kontrol eder
  - `loading` — sayfa yükleme durumunu tutan boolean state; `true` iken skeleton gösterilir
  - `setLoading` — `loading` state'ini güncelleyen setter fonksiyonu
  - `error` — hata mesajını tutan `string | null` state; fetch sırasında oluşan hata burada saklanır
  - `setError` — `error` state'ini güncelleyen setter fonksiyonu
  - `generalValues` — genel site ayarlarını (site_name, tagline, contact_email, support_phone, headquarters, logo_url) tutan `RenderableSettings | null` state
  - `setGeneralValues` — `generalValues` state'ini güncelleyen setter fonksiyonu
  - `paymentValues` — ödeme ayarlarını (iyzico_enabled, iyzico_mode, iyzico_api_key) tutan `RenderableSettings | null` state
  - `setPaymentValues` — `paymentValues` state'ini güncelleyen setter fonksiyonu
  - `adminsValues` — yönetici politikalarını (admin_sessions_timeout, mfa_required) tutan `RenderableSettings | null` state
  - `setAdminsValues` — `adminsValues` state'ini güncelleyen setter fonksiyonu
  - `systemValues` — sistem yapılandırmalarını (system_log_level, debug_mode) tutan `RenderableSettings | null` state
  - `setSystemValues` — `systemValues` state'ini güncelleyen setter fonksiyonu
  - `modalOpen` — modal'ın açık/kapalı durumunu tutan boolean state
  - `setModalOpen` — `modalOpen` state'ini güncelleyen setter fonksiyonu; `SettingsFormModal` bileşeninin `onOpenChange` prop'una bağlanır
  - `modalSection` — modal'da düzenlenen ayar bölümünü tutan `SettingsSection | null` state
  - `setModalSection` — `modalSection` state'ini güncelleyen setter fonksiyonu
  - `modalInitialValues` — modal açıldığında forma doldurulan başlangıç değerlerini tutan `RenderableSettings | null` state
  - `setModalInitialValues` — `modalInitialValues` state'ini güncelleyen setter fonksiyonu
  - `fetchAllSettings` — `useCallback` ile sarılmış async fonksiyon; Supabase'den `site_settings` tablosunu çekip dört section state'ini doldurur
  - `openModal` — modal'ı açan fonksiyon; section ve values parametrelerini state'lere yazar, `modalOpen`'u `true` yapar
- **Dönüş**: JSX elementi — loading durumunda skeleton, aksi halde ayar kartları grid'i ve `SettingsFormModal` bileşeni render edilir

### [N2_NASIL] AST Pointer: src/views/admin/AdminSettingsPage.tsx::fetchAllSettings
- **params**: yok (useCallback ile sarılmış, dependency array boş `[]`)
- **ic_degiskenler**:
  - `data` — `supabase.from('site_settings').select('key, value')` sorgusundan dönen satır dizisi; her satırda `key` ve `value` alanları bulunur
  - `fetchError` — Supabase sorgusundan dönen hata nesnesi; `error` olarak yeniden adlandırılır, varsa `throw` ile yakalanır
  - `gen` — `data` içinde `key === 'general'` olan satırın `value` alanı; bulunamazsa boş obje `{}` kullanılır, `RenderableSettings` tipine cast edilir
  - `pay` — `data` içinde `key === 'payment'` olan satırın `value` alanı; bulunamazsa boş obje `{}` kullanılır, `RenderableSettings` tipine cast edilir
  - `adm` — `data` içinde `key === 'admins'` olan satırın `value` alanı; bulunamazsa boş obje `{}` kullanılır, `Record<string, unknown>` tipine cast edilir
  - `sys` — `data` içinde `key === 'system'` olan satırın `value` alanı; bulunamazsa boş obje `{}` kullanılır, `Record<string, unknown>` tipine cast edilir
  - `err` — `catch` bloğunda yakalanan hata nesnesi; `console.error` ile loglanır, `Error` instance ise `.message`'ı, değilse `String(err)` ile `setError`'a yazılır
- **Dönüş**: `Promise<void>` — async fonksiyon, bir değer döndürmez; yan etki olarak dört section state'ini (`setGeneralValues`, `setPaymentValues`, `setAdminsValues`, `setSystemValues`) günceller

### [N3_NASIL] AST Pointer: src/views/admin/AdminSettingsPage.tsx::useEffect callback
- **params**: yok
- **ic_degiskenler**: yok
- **Dönüş**: yok — bileşen mount edildiğinde `fetchAllSettings()` fonksiyonunu çağırır; dependency array `[fetchAllSettings]` olarak tanımlıdır

### [N4_NASIL] AST Pointer: src/views/admin/AdminSettingsPage.tsx::openModal
- **params**:
  - `section` — `SettingsSection` tipinde; modal'da düzenlenecek ayar bölümünü belirtir ('general', 'payment', 'admins', 'system' değerlerinden biri)
  - `values` — `RenderableSettings | null` tipinde; modal'a aktarılacak mevcut ayar değerleri
- **ic_degiskenler**: yok (sadece state setter çağrıları yapılır)
- **Dönüş**: yok — yan etki olarak `setModalSection(section)`, `setModalInitialValues(values)` ve `setModalOpen(true)` çağrılarıyla modal state'lerini günceller

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