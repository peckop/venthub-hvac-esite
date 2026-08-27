---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\venthub-wt-t131\src\views\admin\AdminInventorySettingsPage.tsx
skeleton_hash: cf467ca46cc66985
entity_hashes:
  func:AdminInventorySettingsPage: 19119fa4d0915cd3
  func:save: f665f70eecd0464b
  func:saveGeneralSettings: 8c4e593571ba8563
  overview: bac780a222edc79e
  style_tokens: d543402d4cb49685
generated_at: 2026-08-27T07:17:32Z
---

## Genel Bakış
Bu modül, yönetici panelinde envanter ile ilgili ayarların görüntülenmesini ve değiştirilmesini sağlayan bir React sayfa bileşenidir. Sayfa, genel stok ayarları ve konfigürasyonları için bir form arayüzü sunarken, yapılan değişikliklerin sunucuya kaydedilmesi için asenkron işlemler yürütür. Modül, envanter yönetimi politikalarının ve limitlerin merkezi olarak yapılandırılmasını mümkün kılar.

## Fonksiyon Grupları

### Sayfa Bileşeni
Ana sayfa yapısını ve kullanıcı arayüzünü tanımlayan React bileşenidir. Form alanlarını, durum yönetimini ve kullanıcı etkileşimlerini koordine ederek yöneticiye envanter ayarları panelini sunar.
- AdminInventorySettingsPage

### Kaydetme İşlemleri
Yapılan değişikliklerin sunucuya iletilmesini ve kalıcı olarak saklanmasını sağlayan asenkron fonksiyonları kapsar. Genel ayarlar için özel bir kaydetme akışı mevcuttur.
- save, saveGeneralSettings

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır. Fonksiyon gövdeleri sağlanmadığından, modülün doğru çalışması için gerekli koşullar belirlenememiştir.

---

## FONKSİYON DETAYLARI

### AdminInventorySettingsPage
**Ne yapar**: React uygulamasında envanter ayarları sayfasının bileşenini tanımlar ve dışarıya bir fonksiyonel bileşen (`React.FC`) olarak sunar.  
**Nasıl yapar**: Fonksiyon, TypeScript/React ortamında bir fonksiyonel bileşen tanımı döndürür; bileşenin içeriği dosyada tanımlı diğer yardımcı fonksiyonlar ve UI öğeleriyle birleştirilir.  
**Parametreler**:
- *yok* — Bu bileşen dışarıdan parametre almaz.
**Dönüş**: `React.FC` — Bileşen tipinde bir fonksiyonel React bileşeni döndürür.

### save
**Ne yapar**: Envanter ayarlarını (bildirim e-postası, webhook URL'i, ayırma zaman aşımı süresini) Supabase veritabanına kaydeder ve denetim (audit) kaydı oluşturur.

**Nasıl yapar**: Bu fonksiyon bir React asenkron olay işleyicisidir. İlk olarak `setSavingGeneral(true)` çağrısıyla arayüzde kaydetme işlemi sürdüğünü belirtir, ardından başarı ve hata mesajlarını temizler. `mutateWithAudit` fonksiyonunu kullanarak veritabanı güncellemesini ve denetim kaydını birlikte yürütür. `mutateWithAudit` içinde, `canWrite` izni kontrol edilir, ardından `fn` parametresi ile verilen asenkron fonksiyon çalıştırılır. Bu fonksiyon, `supabase.from('inventory_settings').update()` çağrısıyla ilgili satırı günceller ve `eq('id', true)` koşuluyla tüm satırları hedefler. İşlem başarılı olursa success mesajı ayarlanır ve `load()` fonksiyonuyla veriler yeniden yüklenir. Hata oluşursa, hatanın türüne göre (`AdminPermissionError` veya standart `Error`) uygun hata mesajı ayarlanır. İşlem sonunda `finally` bloğu ile kaydetme durumu sıfırlanır.

**Parametreler**: Bu fonksiyon herhangi bir parametre almaz. Fonksiyon içindeki state değerleri (`alertEmail`, `alertWebhook`, `resTimeout`, `hasWriteAccess`) ve bağımlılıklar (`supabase`, `mutateWithAudit`, `t`, `load`) React hook'ları ve kapsama alanından (closure) erişilir.

**Dönüş**: Fonksiyon `void` döndürür. Sonuç, React state'leri (`setSuccess`, `setError`) aracılığıyla arayüze yansıtılır.

### saveGeneralSettings
**Ne yapar**: `save` fonksiyonuyla aynı işlevi görür; envanter ayarlarını Supabase veritabanına kaydeder ve denetim kaydı tutar.

**Nasıl yapar**: Tam olarak `save` fonksiyonunun uygulama mantığını paylaşır. `setSavingGeneral`, `setSuccess`, `setError` state setter'larını kullanarak arayüz durumunu yönetir. Merkezi olarak `mutateWithAudit` fonksiyonunu çağırarak hem veritabanı güncellemesini (`supabase.from('inventory_settings').update(...)`) hem de denetim logunu tek bir atomik işlemde yürütür. Güncelleme, `updated_at` alanını da mevcut zaman damgasıyla set eder. İşlem başarıyla tamamlanırsa, uluslararasılaştırma fonksiyonu `t()` ile success mesajı gösterilir ve `load()` ile tablo verileri yenilenir. Hata yönetimi, `AdminPermissionError` izin hatalarını standart hatalardan ayırt ederek kullanıcıya anlamlı mesajlar sunar.

**Parametreler**: Bu fonksiyon da parametre almaz. Gerekli tüm değerler (`alertEmail`, `alertWebhook`, `resTimeout`, `hasWriteAccess`) ve servisler (`supabase`, `mutateWithAudit`, `t`, `load`) React component'in state'inden ve kapsamından alınır.

**Dönüş**: Fonksiyon `void` döndürür. Herhangi bir değer dönmez; yan etkileri (state güncellemeleri ve veritabanı işlemleri) vardır.

---

## İTHALATLAR (IMPORTS)
- import: ../../components/admin/AdminSkeleton::AdminSkeleton
- import: ../../components/admin/overlay/ConfirmProvider::useConfirm
- import: ../../hooks/useRole::useRole
- import: @/i18n/I18nProvider::useI18n
- import: @/lib/admin/mutateWithAudit::AdminPermissionError
- import: @/lib/admin/mutateWithAudit::mutateWithAudit
- import: @/lib/supabase/client::supabaseBrowserClient
- import: lucide-react::Bell
- import: lucide-react::Settings
- import: lucide-react::ShieldAlert
- import: lucide-react::Zap
- import: next/navigation::usePathname
- import: react::React

---

## ENUMS

### LoadState
- `Idle`
- `Loading`
- `Error`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/admin/AdminInventorySettingsPage.tsx::AdminInventorySettingsPage
- **params**: (parametre yok)
- **ic_degiskenler**: (ana bileşen fonksiyonu, gövdesi verilmemiş)
- **Dönüş**: React.FC

---

### [N2_NASIL] AST Pointer: src/views/admin/AdminInventorySettingsPage.tsx::anonim_async_load
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `data` — Supabase `inventory_settings` tablosundan `select('*').maybeSingle()` ile çekilen satır; `default_low_stock_threshold`, `alert_email`, `alert_webhook_url`, `reservation_timeout_hours` alanlarına erişilir
  - `error` — Supabase sorgusundan dönen hata nesnesi; varsa throw ile fırlatılır
  - `val` — `data?.default_low_stock_threshold` değeri, `number | null` tipinde; null ise formda boş gösterilir
  - `thresholdVal` — `val` null ise boş string `''`, değilse `Number(val)` ile sayıya dönüştürülen eşik değeri
  - `emailVal` — `data?.alert_email` değeri; yoksa boş string `''`
  - `webhookVal` — `data?.alert_webhook_url` değeri; yoksa boş string `''`
  - `timeoutVal` — `data?.reservation_timeout_hours` değeri; yoksa varsayılan `24`
- **Dönüş**: yok
- **Yan etkiler**: `setLoading`, `setDefaultThreshold`, `setAlertEmail`, `setAlertWebhook`, `setResTimeout`, `setResetAll`, `setError`, `setInitialValues` state setter'larını çağırır; hata durumunda `setError` ve `setLoading(LoadState.Error)` ile hata state'ini günceller

---

### [N3_NASIL] AST Pointer: src/views/admin/AdminInventorySettingsPage.tsx::anonim_useEffect_cleanup
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `handleBeforeUnload` — `window` `beforeunload` olayını dinleyen fonksiyon; `isFormDirty` true ise `e.preventDefault()` çağırır ve `e.returnValue = ''` atar
- **Dönüş**: cleanup fonksiyonu — `window.removeEventListener('beforeunload', handleBeforeUnload)` çağırır

---

### [N4_NASIL] AST Pointer: src/views/admin/AdminInventorySettingsPage.tsx::handleBeforeUnload
- **params**:
  - `e` — `BeforeUnloadEvent` tipinde; tarayıcı sekmesi kapatılmadan önce tetiklenen olay nesnesi
- **ic_degiskenler**: yok
- **Dönüş**: `string` (`''`) veya `undefined` — `isFormDirty` true ise `e.preventDefault()` çağrılır ve boş string döndürülür; false ise hiçbir şey yapılmaz

---

### [N5_NASIL] AST Pointer: src/views/admin/AdminInventorySettingsPage.tsx::save
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `ok` — `confirm()` dialog sonucu; kullanıcı onaylarsa true, iptal ederse false; `resetAll` true iken gösterilen onay dialogundan döner
  - `value` — `defaultThreshold` boş string ise `null`, değilse `Number(defaultThreshold)` ile sayıya dönüştürülen eşik değeri; `update_inventory_thresholds` RPC'sine `p_default` parametresi olarak gönderilir
  - `e` — `catch` bloğunda yakalanan hata nesnesi; `AdminPermissionError` veya `Error` tipine göre farklı mesaj gösterilir
  - `msg` — hata tipine göre belirlenen kullanıcıya gösterilecek mesaj; `AdminPermissionError` ise yetki hatası, `Error` ise `e.message`, diğer durumlarda çeviri anahtarı
- **Dönüş**: yok
- **Yan etkiler**: `setSaving`, `setSuccess`, `setError` state setter'larını çağırır; `mutateWithAudit` ile `update_inventory_thresholds` RPC'sini tetikler; başarılı olursa `load()` fonksiyonunu çağırır; `setSaving(false)` ile yüklenme durumunu sıfırlar

---

### [N6_NASIL] AST Pointer: src/views/admin/AdminInventorySettingsPage.tsx::save::mutateWithAudit_fn
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `error` — `supabase.rpc('update_inventory_thresholds', ...)` çağrısından dönen hata; varsa throw ile fırlatılır
  - `p_default` — RPC parametresi olarak gönderilen `value` değeri, `number` tipinde zorlanır (`as number`)
  - `p_reset_overrides` — RPC parametresi olarak gönderilen `resetAll` boolean değeri; tüm ürün-bazlı eşik override'larını silme bayrağı
- **Dönüş**: yok
- **Yan etkiler**: Supabase `update_inventory_thresholds` RPC fonksiyonunu çağırır

---

### [N7_NASIL] AST Pointer: src/views/admin/AdminInventorySettingsPage.tsx::saveGeneralSettings
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `e` — `catch` bloğunda yakalanan hata nesnesi; `AdminPermissionError` veya `Error` tipine göre farklı mesaj gösterilir
  - `msg` — hata tipine göre belirlenen kullanıcıya gösterilecek mesaj; `AdminPermissionError` ise yetki hatası, `Error` ise `e.message`, diğer durumlarda çeviri anahtarı
- **Dönüş**: yok
- **Yan etkiler**: `setSavingGeneral`, `setSuccess`, `setError` state setter'larını çağırır; `mutateWithAudit` ile `inventory_settings` tablosunu güncelleme işlemi tetikler; başarılı olursa `load()` fonksiyonunu çağırır; `setSavingGeneral(false)` ile yüklenme durumunu sıfırlar

---

### [N8_NASIL] AST Pointer: src/views/admin/AdminInventorySettingsPage.tsx::saveGeneralSettings::mutateWithAudit_fn
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `error` — `supabase.from('inventory_settings').update(...)` çağrısından dönen hata; varsa throw ile fırlatılır
  - `alert_email` — `alertEmail` state değeri; boşsa `null` olarak gönderilir
  - `alert_webhook_url` — `alertWebhook` state değeri; boşsa `null` olarak gönderilir
  - `reservation_timeout_hours` — `resTimeout` state değeri; yoksa varsayılan `24` gönderilir
  - `updated_at` — `new Date().toISOString()` ile üretilen güncel zaman damgası
- **Dönüş**: yok
- **Yan etkiler**: Supabase `inventory_settings` tablosunda `.eq('id', true)` koşuluyla satır güncelleme işlemi gerçekleştirir

---


## MERMAID CALL GRAPH
```mermaid
graph TD
    AdminInventorySettingsPage_tsx__AdminInventorySettingsPage["AdminInventorySettingsPage"]
    AdminInventorySettingsPage_tsx__save["save"]
    AdminInventorySettingsPage_tsx__saveGeneralSettings["saveGeneralSettings"]
```

## NODE ID STANDARD

  file: src\views\admin\AdminInventorySettingsPage.tsx
  function: src\views\admin\AdminInventorySettingsPage.tsx::AdminInventorySettingsPage
  function: src\views\admin\AdminInventorySettingsPage.tsx::save
  function: src\views\admin\AdminInventorySettingsPage.tsx::saveGeneralSettings

---

## DISA AKTARILANLAR (EXPORTS)
  export: AdminInventorySettingsPage

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-admin-accent`, `bg-admin-danger-weak`, `bg-admin-surface`, `bg-admin-warning-weak`, `bg-surface-deep/40`, `bg-transparent`, `border-admin-border`, `border-admin-danger/30`, `border-admin-warning/30`, `border-t`, `first:border-t-0`, `group-hover/item:text-admin-accent`, `hover:bg-admin-accent`, `hover:border-admin-border`, `text-admin-accent`
- **Layout:** `block`, `flex`, `flex-1`, `gap-3`, `gap-4`, `gap-6`, `gap-8`, `grid`, `grid-cols-1`, `h-14`, `h-5`, `items-center`, `items-end`, `items-start`, `justify-end`
- **Varyant/Responsive:** `first:`, `focus-visible:`, `group-hover/item:`, `hover:`, `lg:`, `md:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `${adminButtonPrimaryClass`, `${adminCardClass`, `${adminInputClass`, `${adminInputThresholdClass`, `${adminInputTimeoutClass`, `animate-in`, `border`, `cursor-pointer`, `duration-700`, `fade-in`, `first:pt-0`, `focus-visible:ring-admin-accent/30`, `font-bold`, `font-semibold`, `group`