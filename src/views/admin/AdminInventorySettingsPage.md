---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\admin\AdminInventorySettingsPage.tsx
skeleton_hash: 4951bc8903437c34
entity_hashes:
  func:AdminInventorySettingsPage: 19119fa4d0915cd3
  func:save: f665f70eecd0464b
  func:saveGeneralSettings: 8c4e593571ba8563
  overview: 9323d0a1247c733d
  style_tokens: 114083f4641bd38f
generated_at: 2026-06-16T10:20:03Z
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

Bu modül, yönetici panelindeki envanter ayarları sayfasını ve ilişkili kaydetme mantığını içeren bir React bileşenidir. Aşağıdaki mimari varsayımlar fonksiyon imzalarından türetilmiştir.

---

**[Aksiyom 1]:** Eğer React runtime ortamı (React context, DOM) yoksa, `AdminInventorySettingsPage` bileşeni render edilemez ve hata oluşur.

**[Aksiyom 2]:** Eğer backend API erişilebilir durumda değilse (sunucu, ağ bağlantısı), `save()` fonksiyonu asenkron çalışırken başarısız olur ve hata fırlatır — bileşenin hata yönetim mekanizması bu durumu yakalamalıdır.

**[Aksiyom 3]:** Eğer `save()` çağrılmadan önce kaydedilecek geçerli bir envanter ayar verisi (state/form verisi) mevcut değilse, fonksiyon geçersiz veya boş veri gönderir; bunun sunucu tarafında ne tür bir davranışa yol açacağı bilinmiyor.

**[Aksiyom 4]:** Eğer `saveGeneralSettings()` çağrılmadan önce genel ayarlarla ilgili geçerli veri mevcut değilse, fonksiyon geçersiz veya boş veri gönderir; bunun sunucu tarafında ne tür bir davranışa yol açacağı bilinmiyor.

**[Aksiyom 5]:** Eğer `save()` ile `saveGeneralSettings()` eş zamanlı (parallel) olarak çağrılırsa, race condition veya veri tutarsızlığı oluşabilir — çünkü her iki fonksiyon da asenkron olup paylaşımlı kaynakları (state, API) etkileyebilir.

**[Aksiyom 6]:** Eğer modül bir admin panelinin parçasıysa, kullanıcıyetik doğrulama/otorizasyon mekanizması modül dışından sağlanmalıdır — fonksiyon imzalarında auth kontrolüne dair herhangi bir parametre veya bağımlılık tanımlı değildir.

---

**Not:** Fonksiyon imzalarında parametre tanımları ve return tipleri minimal düzeyde verildiği için, bu aksiyomlar yalnızca imza yapılarından çıkarılabilen temel bağımlılıkları içermektedir. Fonksiyon gövdelerine erişim olmadığından, detaylı veri akışı ve doğrulama kuralları bilinmemektedir.

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
- **params**: ()
- **ic_degiskenler**:
  - `t` — useI18n hook'undan gelen çeviri fonksiyonu, tüm metinleri çevirir
  - `pathname` — usePathname hook'undan gelen mevcut URL yolu, efektleri tetikler
  - `defaultThreshold` — Stok uyarı eşiği değeri (sayı veya boş string), form input'unun değeri
  - `setDefaultThreshold` — defaultThreshold state setter'ı
  - `resetAll` — Tüm ürünlere eşik değerini uygulayıp uygulamayacağını belirten boolean
  - `setResetAll` — resetAll state setter'ı
  - `loading` — Veri yükleme durumu (LoadState enum)
  - `setLoading` — loading state setter'ı
  - `saving` — Eşik formunun kaydetme durumu
  - `setSaving` — saving state setter'ı
  - `savingGeneral` — Genel ayarlar formunun kaydetme durumu
  - `setSavingGeneral` — savingGeneral state setter'ı
  - `error` — Hata mesajı string'i
  - `setError` — error state setter'ı
  - `success` — Başarı mesajı string'i
  - `setSuccess` — success state setter'ı
  - `alertEmail` — Alarm e-posta adresi, form input'unun değeri
  - `setAlertEmail` — alertEmail state setter'ı
  - `alertWebhook` — Webhook URL'i, form input'unun değeri
  - `setAlertWebhook` — alertWebhook state setter'ı
  - `resTimeout` — Rezervasyon zaman aşımı süresi (saat), varsayılan 24
  - `setResTimeout` — resTimeout state setter'ı
  - `canWrite` — useRole hook'undan gelen izin kontrol fonksiyonu
  - `hasWriteAccess` — canWrite('inventory_settings') ile hesaplanan yazma izni boolean'ı
  - `load` — React.useCallback ile tanımlı, veritabanından ayarları yükleyen async fonksiyon
  - `save` — Stok eşiği ayarlarını kaydeden async fonksiyon
  - `saveGeneralSettings` — Genel alarm ve rezervasyon ayarlarını kaydeden async fonksiyon
- **Dönüş**: JSX element (React component)

### [N2_NASIL] AST Pointer: src/views/admin/AdminInventorySettingsPage.tsx::load
- **params**: ()
- **ic_degiskenler**:
  - `setLoading` — Dış kapsamdan gelen loading state setter'ı
  - `supabase` — Dış kapsamdan gelen Supabase istemcisi
  - `data` — supabase.from('inventory_settings').select('*').maybeSingle() yanıtının data alanı
  - `error` — supabase.from('inventory_settings').select('*').maybeSingle() yanıtının error alanı
  - `val` — data.default_low_stock_threshold değerini number veya null olarak çıkaran geçici değişken
  - `setDefaultThreshold` — Dış kapsamdan gelen setter
  - `setAlertEmail` — Dış kapsamdan gelen setter
  - `setAlertWebhook` — Dış kapsamdan gelen setter
  - `setResTimeout` — Dış kapsamdan gelen setter
  - `setError` — Dış kapsamdan gelen setter
  - `t` — Dış kapsamdan gelen çeviri fonksiyonu
- **Dönüş**: void (Promise)

### [N3_NASIL] AST Pointer: src/views/admin/AdminInventorySettingsPage.tsx::save
- **params**: ()
- **ic_degiskenler**:
  - `setSaving` — Dış kapsamdan gelen saving state setter'ı
  - `setSuccess` — Dış kapsamdan gelen success state setter'ı
  - `setError` — Dış kapsamdan gelen error state setter'ı
  - `defaultThreshold` — Dış kapsamdan gelen stok eşiği değeri
  - `value` — defaultThreshold'u number veya null'a dönüştüren yerel değişken
  - `mutateWithAudit` — Dış kapsamdan gelen audit korumalı mutasyon fonksiyonu
  - `supabase` — Dış kapsamdan gelen Supabase istemcisi
  - `hasWriteAccess` — Dış kapsamdan gelen yazma izni boolean'ı
  - `resetAll` — Dış kapsamdan gelen toplu uygulama boolean'ı
  - `t` — Dış kapsamdan gelen çeviri fonksiyonu
  - `load` — Dış kapsamdan gelen veri yükleme fonksiyonu
  - `e` — catch bloğundaki hata nesnesi
  - `msg` — e nesnesinden türetilen kullanıcıya gösterilecek hata mesajı string'i
- **Dönüş**: void (Promise)

### [N4_NASIL] AST Pointer: src/views/admin/AdminInventorySettingsPage.tsx::save.fn
- **params**: ()
- **ic_degiskenler**:
  - `supabase` — Dış kapsamdan (save fonksiyonu) gelen Supabase istemcisi
  - `value` — Dış kapsamdan (save fonksiyonu) gelen sayısal eşik değeri
  - `resetAll` — Dış kapsamdan (save fonksiyonu) gelen toplu uygulama boolean'ı
  - `error` — supabase.rpc() yanıtının hata alanı
- **Dönüş**: void (Promise)

### [N5_NASIL] AST Pointer: src/views/admin/AdminInventorySettingsPage.tsx::saveGeneralSettings
- **params**: ()
- **ic_degiskenler**:
  - `setSavingGeneral` — Dış kapsamdan gelen savingGeneral state setter'ı
  - `setSuccess` — Dış kapsamdan gelen success state setter'ı
  - `setError` — Dış kapsamdan gelen error state setter'ı
  - `mutateWithAudit` — Dış kapsamdan gelen audit korumalı mutasyon fonksiyonu
  - `supabase` — Dış kapsamdan gelen Supabase istemcisi
  - `hasWriteAccess` — Dış kapsamdan gelen yazma izni boolean'ı
  - `alertEmail` — Dış kapsamdan gelen e-posta adresi string'i
  - `alertWebhook` — Dış kapsamdan gelen webhook URL string'i
  - `resTimeout` — Dış kapsamdan gelen zaman aşımı süresi (saat)
  - `t` — Dış kapsamdan gelen çeviri fonksiyonu
  - `load` — Dış kapsamdan gelen veri yükleme fonksiyonu
  - `e` — catch bloğundaki hata nesnesi
  - `msg` — e nesnesinden türetilen kullanıcıya gösterilecek hata mesajı string'i
- **Dönüş**: void (Promise)

### [N6_NASIL] AST Pointer: src/views/admin/AdminInventorySettingsPage.tsx::saveGeneralSettings.fn
- **params**: ()
- **ic_degiskenler**:
  - `supabase` — Dış kapsamdan (saveGeneralSettings fonksiyonu) gelen Supabase istemcisi
  - `alertEmail` — Dış kapsamdan (saveGeneralSettings fonksiyonu) gelen e-posta adresi
  - `alertWebhook` — Dış kapsamdan (saveGeneralSettings fonksiyonu) gelen webhook URL'i
  - `resTimeout` — Dış kapsamdan (saveGeneralSettings fonksiyonu) gelen zaman aşımı süresi
  - `error` — supabase.from().update().eq() yanıtının hata alanı
- **Dönüş**: void (Promise)

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
- `rounded-hvac-xl`

### Tailwind Sınıf Özeti
- **Renkler:** `bg-amber-500/5`, `bg-cyan-500/5`, `bg-rose-500/5`, `bg-surface-deep/40`, `bg-transparent`, `bg-violet-500`, `bg-violet-500/5`, `border-amber-500/10`, `border-b`, `border-rose-500/20`, `border-t`, `border-white/10`, `border-white/5`, `group-hover:bg-cyan-500/10`, `group-hover:bg-violet-500/10`
- **Layout:** `!h-12`, `absolute`, `block`, `flex`, `flex-1`, `gap-10`, `gap-3`, `gap-4`, `gap-6`, `gap-8`, `grid`, `grid-cols-1`, `h-14`, `h-5`, `h-64`
- **Varyant/Responsive:** `focus-visible:`, `group-hover:`, `hover:`, `lg:`, `md:` önekleri
- **Yardımcı Sınıflar:** `!font-black`, `!text-center`, `!text-lg`, `${adminButtonPrimaryClass`, `${adminCardClass`, `${adminInputClass`, `-mr-32`, `-mt-32`, `animate-in`, `blur-3xl`, `border`, `cursor-pointer`, `duration-700`, `fade-in`, `focus-visible:ring-cyan-400/20`