---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\hooks\useSettings.ts
skeleton_hash: c3659edf855e64a7
entity_hashes:
  func:useSettings: caf0b25f3b0d5fb3
  overview: 094819e02d799328
generated_at: 2026-06-19T11:49:28Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesindeki React uygulamasının ayarlarını (birim tercihleri, tema ayarları vb.) yöneten bir custom hook sunar. `useSettings` fonksiyonu, Supabase veritabanından ayar verilerini çekerek yükleme ve hata durumlarını yönetir; böylece tüm bileşenler tutarlı ve güncel ayar verilerine tek bir kaynaktan erişir.

## Fonksiyon Grupları

### Merkezi Ayar Erişim Katmanı
Uygulama genelindeki ayarların okunması ve yönetilmesi için tekil bir erişim noktası oluşturarak bileşenler arası veri tutarlılığını garanti altına alır.
- useSettings

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSİYON DETAYLARI

### useSettings
**Ne yapar**: Bu React custom hook, uygulamanın genel ayarlarını Supabase veritabanındaki `site_settings` tablosundan çeker, bu ayarları state'te tutar ve yükleme ile hata durumlarını yönetir. Hook, ilk render'da otomatik olarak veri çeker ve ayrıca ayarları manuel olarak yenilemek için bir `reload` callback'i döndürür.

**Nasıl yapar**: Fonksiyon, `useState` ile `settings`, `loading` ve `error` state'lerini oluşturur. Ana iş mantığı, `useCallback` ile optimize edilmiş `fetchSettings` async fonksiyonunda yer alır. Bu fonksiyon, Supabase istemcisini kullanarak `site_settings` tablosundan tüm satırları (`key` ve `value` alanlarıyla) çeker. Gelen veri içinde `'general'` ve `'payment'` anahtarlarına sahip satırları bulur ve bu satırların `value` alanlarındaki nesneleri, tanımlı `AppSettings` tipine uygun şekilde dönüştürerek `settings` state'ini günceller. `useEffect` hook'u, `fetchSettings` fonksiyonunu (bağımlılık dizisinde olduğu için) component mount edildiğinde çağırarak ilk veri yükleme işlemini tetikler. İşlem sırasındaki olası hatalar `catch` bloğu yakalanarak `error` state'ine yazılır ve `finally` bloğu ile `loading` durumu her durumda `false` olarak ayarlanır.

**Parametreler**: Bu fonksiyon parametre almaz.

**Dönüş**: `{ settings, loading, error, reload: fetchSettings }` şeklinde bir nesne döndürür.
- `settings`: `AppSettings | null` tipinde, çekilen ayarları temsil eden nesne. Veri henüz yüklenmediyse veya hata oluştuysa `null` olabilir. İçeriği `general` (site adı, slogan, iletişim bilgileri, logo URL'i) ve `payment` (iyzico ödeme sistemi ayarları) alt nesnelerinden oluşur.
- `loading`: `boolean` tipinde, verinin hala yüklenmekte olduğunu belirten bayrak.
- `error`: `string | null` tipinde, yükleme sırasında oluşan bir hata mesajını içerir; hata yoksa `null`'dır.
- `reload`: `() => Promise<void>` tipinde (asıl adı `fetchSettings`), ayarları yeniden çekmek için çağrılabilir asenkron bir fonksiyondur.

---

## İTHALATLAR (IMPORTS)
- import: @/lib/supabase/client::supabaseBrowserClient
- import: react::useCallback
- import: react::useEffect
- import: react::useState

---

## INTERFACES

### AppSettings
- `general: {`
- `payment: {`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/hooks/useSettings.ts::useSettings
- **params**: (yok)
- **ic_degiskenler**:
  - `settings` — useState hook'u, uygulama ayarlarını tutar (AppSettings | null), Supabase'den çekilen genel ve ödeme ayarlarını içerir
  - `setSettings` — settings state'ini güncellemek için setter fonksiyonu
  - `loading` — useState hook'u, veri yüklenme durumunu belirtir (başlangıçta true)
  - `setLoading` — loading state'ini güncellemek için setter fonksiyonu
  - `error` — useState hook'u, hata mesajını tutar (string | null)
  - `setError` — error state'ini güncellemek için setter fonksiyonu
  - `fetchSettings` — useCallback ile sarılmış asenkron fonksiyon, Supabase'den site_settings tablosunu çeker
  - `data` — Supabase sorgusundan dönen satır dizisi (site_settings tablosu, key ve value alanları)
  - `fetchError` — Supabase sorgu hatası (error destructuring ile ayrıştırılmış)
  - `generalRow` — data içinden key === 'general' olan satır, genel site ayarlarını tutar
  - `paymentRow` — data içinden key === 'payment' olan satır, ödeme ayarlarını tutar
- **Dönüş**: `{ settings, loading, error, reload: fetchSettings }` — settings nesnesi (general ve payment alt nesneleri dahil), loading boolean, error string veya null, reload fonksiyonu referansı

---

## NODE ID STANDARD

  file: src\hooks\useSettings.ts
  function: src\hooks\useSettings.ts::useSettings

---

## DISA AKTARILANLAR (EXPORTS)
  export: AppSettings
  export: useSettings