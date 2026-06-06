---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\admin\AdminInventorySettingsPage.tsx
skeleton_hash: e987897f7e8ea53d
entity_hashes:
  func:AdminInventorySettingsPage: 19119fa4d0915cd3
  func:save: 0164a79f2bf21d0f
  func:saveGeneralSettings: e292d3d4a2e6fa04
  overview: c6b768cf9235a671
  style_tokens: 114083f4641bd38f
generated_at: 2026-06-06T21:57:52Z
---

## Genel Bakış
Bu modül, yönetici panelindeki stok ayarları sayfasının kullanıcı arayüzünü oluşturur ve ayarların kaydedilmesi için gerekli iş mantığını içerir. Sayfa, ayarların görüntülenmesini ve yöneticinin bu ayarları güncelleme eylemlerini tetikleyen bir merkez olarak işlev görür; kaydetme işlemleri ise verilerin asenkron olarak kalıcı depoya aktarılmasını sağlar.

## Fonksiyon Grupları
### Sayfa Bileşeni ve Arayüz
Envanter ayarları sayfasının ana React bileşenini tanımlar. Bu bileşen, kullanıcı arayüzünü sunar ve yöneticinin ayarları görüntülemesini, değiştirmesini ve kaydetme eylemlerini tetiklemesini sağlar.
- AdminInventorySettingsPage

### Kaydetme İşlemleri
Stok ayarlarının güncellenmesi ve kaydedilmesi için kullanılan asenkron fonksiyonları kapsar. Bu grup, genel ve spesifik kaydetme senaryolarını ele alarak verilerin arka planda güvenli bir şekilde depolanmasını yönetir.
- save, saveGeneralSettings

---

## AXIOMS – Mimari Varsayımlar

Bu modül için aksiyomlar, verilen fonksiyon imzalarından üretilmiştir.

---

**[Aksiyom 1]:** Eğer `save()` veya `saveGeneralSettings()` işlevleri çağrıldığında persistans katmanı (API endpoint veya veritabanı bağlantısı) mevcut değilse, ayarlar kaydedilmez.

**[Aksiyom 2]:** Eğer `AdminInventorySettingsPage` bileşeni render edildiğinde geçerli bir oturum (session) veya yetkilendirme token'ı yoksa, yönetici ayarlarına erişim sağlanamaz.

**[Aksiyom 3]:** Eğer `saveGeneralSettings()` işlevi, `save()` işlevinden bağımsız olarak çalışıyorsa (imzalar ayrı ve parametresiz), iki işlevin farklı veri setlerini hedeflediği varsayılır; birbirlerinin durumunu doğrudan etkilemezler.

**[Aksiyom 4]:** Eğer `save()` veya `saveGeneralSettings()` işlevleri asenkron çalışıyorsa (önceki dokümanda "asenkron kaydetme" belirtilmiş), işlevlerin Promise/async-await dönüş türüne sahip olduğu ve hata yönetimi mekanizması gerektirdiği varsayılır.

**[Aksiyom 5]:** Eğer `AdminInventorySettingsPage()` parametresiz olarak tanımlıysa, bileşenin gerekli tüm state ve props'u iç referanslarla (Context, hooks vb.) sağladığı veya modül-içi bağımlılıklarla beslendiği varsayılır.

---

> **Not:** Fonksiyon gövdelerine erişim olmadan, API endpoint'leri, form alanlarının yapısı veya veri modelleri hakkında kesin aksiyom üretilememektedir.

---

## FONKSİYON DETAYLARI

### AdminInventorySettingsPage
**Ne yapar**: React uygulamasında envanter ayarları sayfasının bileşenini tanımlar ve dışarıya bir fonksiyonel bileşen (`React.FC`) olarak sunar.  
**Nasıl yapar**: Fonksiyon, TypeScript/React ortamında bir fonksiyonel bileşen tanımı döndürür; bileşenin içeriği dosyada tanımlı diğer yardımcı fonksiyonlar ve UI öğeleriyle birleştirilir.  
**Parametreler**:
- *yok* — Bu bileşen dışarıdan parametre almaz.
**Dönüş**: `React.FC` — Bileşen tipinde bir fonksiyonel React bileşeni döndürür.

### save
**Ne yapar**: Genel envanter ayarlarını veritabanına kaydeder ve işlem sonucuna göre kullanıcıya geri bildirim verir.  
**Nasıl yapar**: `saveGeneralSettings` fonksiyonunun aynı mantığını uygular; kaydetme sürecini başlatır, hata ve başarı durumlarını yönetir, ardından ayarları yeniden yükler.  
**Parametreler**:
- *yok* — Fonksiyon dışarıdan veri almaz; gerekli değerler bileşen içinde tanımlı durum değişkenlerinden (`alertEmail`, `alertWebhook`, `resTimeout`) elde edilir.
**Dönüş**: `void` — İşlem tamamlandığında bir değer döndürmez; sadece yan etkileri (state güncellemeleri, console log) vardır.

### saveGeneralSettings
**Ne yapar**: Envanter ayarlarını Supabase veritabanındaki `inventory_settings` tablosuna günceller, işlem sonucunu kullanıcıya bildirir ve güncel ayarları tekrar yükler.  
**Nasıl yapar**: 
1. `setSavingGeneral(true)` ile kaydetme sürecini başlatır ve UI’da bekleme durumu gösterir.  
2. `setSuccess('')` ve `setError('')` ile önceki mesajları temizler.  
3. Supabase SDK’sı ile `inventory_settings` tablosunda `id = true` koşuluna sahip satırı, `alert_email`, `alert_webhook_url`, `reservation_timeout_hours` ve `updated_at` alanlarını güncelleyerek değiştirir.  
4. Güncelleme sırasında bir hata oluşursa `throw` ile yakalar; hata mesajını konsola yazar ve `setError` ile kullanıcıya gösterir.  
5. Başarılı olursa `setSuccess('Genel ayarlar kaydedildi')` mesajını ayarlar ve `await load()` ile en son ayarları tekrar yükler.  
6. `finally` bloğunda `setSavingGeneral(false)` çağrısı yapılarak bekleme durumu sonlandırılır.  
**Parametreler**:
- *yok* — Gerekli tüm veriler bileşen içindeki durum değişkenlerinden (`alertEmail`, `alertWebhook`, `resTimeout`) alınır.
**Dönüş**: `void` — Fonksiyon asenkron çalışır ancak dışarıya bir değer döndürmez; sadece yan etkileri (state güncellemeleri, veri kaydetme) vardır.

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
  - `pathname` — usePathname() hookundan alınan mevcut URL yolu
  - `defaultThreshold` — numeric input state, varsayılan düşük stok eşiğini tutar
  - `resetAll` — boolean checkbox state, tüm ürünlere uygulama durumunu kontrol eder
  - `loading` — LoadState enum loading durumunu tutar
  - `saving` — boolean, eşik güncelleme kaydetme işleminin durumunu tutar
  - `savingGeneral` — boolean, genel ayarları kaydetme işleminin durumunu tutar
  - `error` — string hata mesajını tutar
  - `success` — string başarı mesajını tutar
  - `alertEmail` — string alarm e-posta adresini tutar
  - `alertWebhook` — string webhook URL'ini tutar
  - `resTimeout` — number rezervasyon timeout süresini tutar (saat)
  - `canWrite` — useRole() hookundan gelen write izni kontrol fonksiyonu
  - `hasWriteAccess` — canWrite('inventory_settings') çağrısının boolean sonucu
  - `load` — useCallback ile sarılmış asenkron veri yükleme fonksiyonu
  - `save` — asenkron eşik güncelleme kaydetme fonksiyonu
  - `saveGeneralSettings` — asenkron genel ayarları kaydetme fonksiyonu
- **Dönüş**: JSX (React.FC)

### [N2_NASIL] AST Pointer: src/views/admin/AdminInventorySettingsPage.tsx::AdminInventorySettingsPage::load
- **params**: ()
- **ic_degiskenler**:
  - `setLoading` — loading state setter'ı, LoadState.Loading ile başlatır
  - `supabase` — import edilen Supabase browser client'ı
  - `data` — inventory_settings tablosundan select('*').maybeSingle() sonucu gelen satır objesi
  - `error` — Supabase sorgu hatası
  - `val` — data?.default_low_stock_threshold değeri (null veya number)
  - `setDefaultThreshold` — defaultThreshold state setter'ı
  - `setAlertEmail` — alertEmail state setter'ı
  - `setAlertWebhook` — alertWebhook state setter'ı
  - `setResTimeout` — resTimeout state setter'ı
  - `setError` — error state setter'ı
  - `setLoading` — loading state setter'ı (LoadState.Idle ile)
- **Dönüş**: yok (undefined)

### [N3_NASIL] AST Pointer: src/views/admin/AdminInventorySettingsPage.tsx::AdminInventorySettingsPage::save
- **params**: ()
- **ic_degiskenler**:
  - `setSaving` — saving state setter'ı (true)
  - `setSuccess` — success state setter'ı (boş string)
  - `setError` — error state setter'ı (boş string)
  - `defaultThreshold` — numeric input state, eşik değerini tutar
  - `resetAll` — boolean checkbox state, tüm ürünlere uygulama durumunu tutar
  - `value` — defaultThreshold'un null veya number dönüşümü (=== '' ise null, değilse Number)
  - `supabase` — import edilen Supabase browser client'ı
  - `error` — update_inventory_thresholds RPC çağrısının hatası
  - `setSuccess` — success state setter'ı (mesaj ile)
  - `load` — useCallback ile sarılmış asenkron veri yükleme fonksiyonu
  - `e` — catch bloğu için Error nesnesi
  - `msg` — e'nin message özelliği veya varsayılan hata mesajı
- **Dönüş**: yok (undefined)

### [N4_NASIL] AST Pointer: src/views/admin/AdminInventorySettingsPage.tsx::AdminInventorySettingsPage::saveGeneralSettings
- **params**: ()
- **ic_degiskenler**:
  - `setSavingGeneral` — savingGeneral state setter'ı (true)
  - `setSuccess` — success state setter'ı (boş string)
  - `setError` — error state setter'ı (boş string)
  - `alertEmail` — string alarm e-posta adresi state'i
  - `alertWebhook` — string webhook URL'i state'i
  - `resTimeout` — number rezervasyon timeout süresi state'i
  - `supabase` — import edilen Supabase browser client'ı
  - `error` — update sorgusunun hatası
  - `setSuccess` — success state setter'ı ("Genel ayarlar kaydedildi")
  - `load` — useCallback ile sarılmış asenkron veri yükleme fonksiyonu
  - `e` — catch bloğu için Error nesnesi
  - `msg` — e'nin message özelliği veya varsayılan hata mesajı
- **Dönüş**: yok (undefined)

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