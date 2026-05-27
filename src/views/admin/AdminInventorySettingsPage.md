---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\admin\AdminInventorySettingsPage.tsx
skeleton_hash: 46f3ae0b5676adff
entity_hashes:
  func:AdminInventorySettingsPage: 19119fa4d0915cd3
  func:save: 0164a79f2bf21d0f
  func:saveGeneralSettings: e292d3d4a2e6fa04
  overview: 59445d0b8972e8c9
  style_tokens: 114083f4641bd38f
generated_at: 2026-05-27T18:30:49Z
---

## Genel Bakış
AdminInventorySettingsPage modülü, yönetici panelinde envanter ayarlarını görüntülemek ve güncellemek için kullanılan sayfanın bileşenini ve kaydetme iş mantığını tanımlar. Kaydetme işlemleri, genel ayarların ayrı ayrı ele alınmasını sağlayacak şekilde yapılandırılmıştır.

## Fonksiyon Grupları
### Sayfa Bileşeni
Envanter ayarları sayfasının React bileşenini oluşturur, kullanıcı arayüzünü sunar ve kaydetme eylemlerini tetikler.
- AdminInventorySettingsPage

### Kaydetme İşlemleri
Envanter ayarlarının ve genel ayarların güncellenmesi için asenkron kaydetme fonksiyonlarını içerir. Daha kapsamlı olan save muhtemelen diğer alt kaydetme işlemlerini de yönetir.
- save, saveGeneralSettings

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

**Aksiyom 1**: Eğer `AdminInventorySettingsPage()` bileşeni oluşturulmazsa, yönetim paneli envanter ayarları kullanıcı arayüzü gösterilemez.

**Aksiyom 2**: Eğer `save()` fonksiyonu çağrıldığında gerekli form verileri (ör. ayar değerleri) mevcut değilse, ayarların kalıcı depoya kaydedilmesi gerçekleşmez ve bir hata/uyarı durumu ortaya çıkar.

**Aksiyom 3**: Eğer `saveGeneralSettings()` fonksiyonu çalıştırıldığında genel ayarların geçerli bir yapılandırma nesnesi sağlanmazsa, genel ayarlar güncellenmez ve sistem mevcut ayarları korur.

**Domain‑specific kural**: Bu fonksiyonların hiçbiri parametre almadığından, gerekli veri kaynağı (örn. bileşen durumu, context, veya global store) önceden hazırlanmış olmalıdır; aksi takdirde fonksiyonların iç mantığı çalışamaz ve beklenen yan etki (ayarların kaydedilmesi) gerçekleşmez.

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

### [N1_NASIL] AST Pointer: src\views\admin\AdminInventorySettingsPage.tsx::AdminInventorySettingsPage
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `pathname` — `usePathname()` hook ile mevcut URL yolunu alır, `React.useEffect` bağımlılığı olarak kullanılır.
  - `defaultThreshold` — Stok düşük eşik değeri; sayı ya da boş string tutar, `<input>` değerine bağlanır.
  - `setDefaultThreshold` — `defaultThreshold` state’ini güncelleyen setter fonksiyonu.
  - `resetAll` — “Tüm Ürünlere Uygula” checkbox’ının boolean durumu.
  - `setResetAll` — `resetAll` state’ini güncelleyen setter.
  - `loading` — veri yükleme durumu (`LoadState` enum); UI’da loading spinner gösterimi için kullanılır.
  - `setLoading` — `loading` state’ini güncelleyen setter.
  - `saving` — eşik güncelleme işlemi sırasında gösterilen loading flag’i.
  - `setSaving` — `saving` state’ini güncelleyen setter.
  - `savingGeneral` — genel ayarların kaydedilmesi sırasında gösterilen loading flag’i.
  - `setSavingGeneral` — `savingGeneral` state’ini güncelleyen setter.
  - `error` — hata mesajı string’i; UI’da hata bildirimi için gösterilir.
  - `setError` — `error` state’ini güncelleyen setter.
  - `success` — başarı mesajı string’i; UI’da başarı bildirimi için gösterilir.
  - `setSuccess` — `success` state’ini güncelleyen setter.
  - `alertEmail` — e‑posta bildirim adresi; form input değeri.
  - `setAlertEmail` — `alertEmail` state’ini güncelleyen setter.
  - `alertWebhook` — webhook URL; form input değeri.
  - `setAlertWebhook` — `alertWebhook` state’ini güncelleyen setter.
  - `resTimeout` — rezervasyon iptal süresi (saat); form input değeri.
  - `setResTimeout` — `resTimeout` state’ini güncelleyen setter.
  - `canWrite` — `useRole()` hook’tan gelen yetki kontrol fonksiyonu.
  - `hasWriteAccess` — `canWrite('inventory_settings')` sonucunu tutar; UI’da erişim kontrolü.
  - `load` — `React.useCallback` içinde tanımlı async fonksiyon; ayarları Supabase’den çeker ve state’leri doldurur.
- **Dönüş**: React bileşeni JSX döndürür; yan etkileri: `useEffect` ile `load` fonksiyonunu sayfa yüklendiğinde ve `pathname` değiştiğinde çalıştırır, Supabase API çağrıları yapar, state güncellemeleriyle UI’yı yönetir.

### [N2_NASIL] AST Pointer: src\views\admin\AdminInventorySettingsPage.tsx::save
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `value` — `defaultThreshold` boş ise `null`, değilse sayısal eşik değeri; RPC’ye gönderilir.
  - `error` — `supabase.rpc` çağrısının döndürdüğü hata nesnesi (varsa).
  - `e` — `catch` bloğunda yakalanan bilinmeyen hata; mesajı `msg` değişkenine dönüştürülür.
  - `msg` — hata mesajı string’i; `setError` ile UI’da gösterilir.
- **Dönüş**: `void` (yan etkileri: `saving` flag’i, `success`/`error` state’leri güncellenir, `load()` çağrısı ile veriler yeniden çekilir).

### [N3_NASIL] AST Pointer: src\views\admin\AdminInventorySettingsPage.tsx::saveGeneralSettings
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `error` — `supabase.from(...).update(...).eq(... )` çağrısının döndürdüğü hata nesnesi (varsa).
  - `e` — `catch` bloğunda yakalanan bilinmeyen hata; mesajı `msg` değişkenine dönüştürülür.
  - `msg` — hata mesajı string’i; `setError` ile UI’da gösterilir.
- **Dönüş**: `void` (yan etkileri: `savingGeneral` flag’i, `success`/`error` state’leri güncellenir, `load()` ile ayarlar yeniden yüklenir).

### [N4_NASIL] AST Pointer: src\views\admin\AdminInventorySettingsPage.tsx::load
- **params**: (parametre yok) – `React.useCallback` içinde tanımlı.
- **ic_degiskenler**:
  - `data` — Supabase `select('*').maybeSingle()` sonucunda gelen kayıt objesi.
  - `error` — API çağrısında oluşan hata nesnesi (varsa).
  - `val` — `data?.default_low_stock_threshold` değerinin number | null tipinde tutulduğu ara değişken.
- **Dönüş**: `void` (yan etkileri: `defaultThreshold`, `alertEmail`, `alertWebhook`, `resTimeout`, `error`, `loading` state’lerini günceller).

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