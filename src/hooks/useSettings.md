---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\hooks\useSettings.ts
skeleton_hash: 72e586f5fd2c3fa3
entity_hashes:
  func:useSettings: b2a936a9fb8b37f7
  overview: 79dfda5e45940bd8
generated_at: 2026-06-17T13:23:01Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesindeki React uygulamasının ayarlarını (birim tercihleri, tema ayarları vb.) merkezi bir noktadan yöneten bir custom hook sunar. `useSettings` fonksiyonu, ayar verilerinin Supabase veritabanından çekilmesi, yükleme durumu (loading) ve hata yönetimi (error handling) süreçlerini kapsar; böylece tüm bileşenler tutarlı ve güncel ayar verilerine tek bir kaynaktan erişir.

## Fonksiyon Grupları

### Merkezi Ayar Erişim Katmanı
Uygulama genelindeki ayarların okunması ve yönetilmesi için tekil bir erişim noktası oluşturarak bileşenler arası veri tutarlılığını ve basitliği garanti altına alır.
- useSettings

---

## AXIOMS – Mimari Varsayımlar

Bu modül, Supabase bağlantısı gerektiren bir React custom hook'udur.

[Aksiyom 1]: Eğer Supabase istemcisi (client) doğru yapılandırılmamışsa veya Supabase servisine erişilemiyorsa, ayarlar yüklenemez ve hata durumu oluşur.

[Aksiyom 2]: Eğer `useSettings` bir React bileşeni dışında (ör. normal bir fonksiyon veya sınıfta) çağrılırsa, React hooks kuralları ihlal edilir ve çalışma zamanı hatası oluşur.

[Aksiyom 3]: Eğer Supabase'deki ayarlar tablosu/mevcut değilse veya beklenen şemaya sahip değilse, fonksiyon hata döner veya boş/beklenmeyen veri yapısı ile karşılaşır.

[Aksiyom 4]: Eğer ağ bağlantısı kesikse veya istek zaman aşımına uğrarsa, `loading` durumu sonsuza kadar `true` kalabilir veya hata durumu tetiklenir (yeniden deneme mekanizması bilinmiyor).

[Aksiyom 5]: Eğer fonksiyon parametre almıyorsa (`useSettings()`), tüm ayarlar sabit bir kaynaktan (Supabase tablosu) çekilir — kullanıcıya özel filtreleme veya parametreli sorgulama yapılamaz.

---

## FONKSİYON DETAYLARI

### useSettings
**Ne yapar**: Uygulama genelindeki ayarları Supabase veritabanından çekip yöneten bir React custom hook'udur. Bu hook, site ayarlarını (`site_settings` tablosu) yüklerken oluşabilecek yükleme durumunu, hataları ve elde edilen ayarları bir state nesnesi içinde tutar ve bileşene sunar.

**Nasıl yapar**: Fonksiyon, `useState` hook'ları ile `settings`, `loading` ve `error` state'lerini oluşturur. Ardından, `useEffect` hook'u içinde tanımlanan ve boş bir bağımlılık dizisine (`[]`) sahip olduğu için sadece bileşen ilk yüklendiğinde çalışan bir `fetchSettings` asenkron fonksiyonunu çağırır. Bu fonksiyon, Supabase istemcisi (`supabase`) kullanarak `site_settings` tablosundaki tüm satırların `key` ve `value` alanlarını sorgular. Gelen veri içinde `key` değeri `'general'` ve `'payment'` olan satırları ayrı ayrı bularak, bu satırların `value` alanındaki karmaşık nesne yapısını (`Record<string, unknown>` olarak tip-lenmiş) önceden tanımlı ve tipli bir `AppSettings` objesine dönüştürür. Dönüşüm sırasında tüm alanlar `String()` veya `Boolean()` kullanılarak zorunlu tiplere dönüştürülür; eksik veya undefined değerler için varsayılan değerler atanır. Veri çekme işlemi başarılı olursa `settings` state'i güncellenir; bir hata fırlatılırsa `catch` bloğu hatanın mesajını `error` state'ine yazar. İşlem her durumda (`finally` bloğu ile) `loading` state'ini `false` yaparak tamamlanır.

**Parametreleri**:
- Parametre almaz.

**Dönüş**: `{ settings, loading, error }` yapısında bir nesne döndürür.
  - `settings`: `AppSettings | null` tipinde. Veritabanından başarıyla çekilen ve dönüştürülmüş ayarları temsil eder. Veri henüz yüklenmediyse veya bir hata oluştuysa `null` olabilir. `AppSettings` yapısı şu alt nesneleri içerir:
    - `general`: `site_name`, `tagline`, `contact_email`, `support_phone`, `headquarters` (hepsi `string`) ve `logo_url` (`string | null`) alanlarını barındırır.
    - `payment`: `iyzico_enabled` (`boolean`), `iyzico_mode` (`string`, varsayılan `'sandbox'`), `iyzico_api_key` (`string`) alanlarını barındırır.
  - `loading`: `boolean` tipinde. Veri çekilme işleminin devam ettiğini belirtir. `true` ise veri henüz hazır değildir, `false` ise işlem tamamlanmıştır (başarılı veya hatalı).
  - `error`: `string | null` tipinde. İşlem sırasında bir hata oluştuysa hata mesajını, oluşmadıysa `null` değerini içerir.

---

## İTHALATLAR (IMPORTS)
- import: @/lib/supabase/client::supabaseBrowserClient
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
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `settings` — useState ile yönetilen AppSettings | null tipinde state, site genel ayarlarını (site_name, tagline, contact_email, support_phone, headquarters, logo_url) ve ödeme ayarlarını (iyzico_enabled, iyzico_mode, iyzico_api_key) barındırır, başlangıçta null
  - `setSettings` — settings state'ini güncellemek için kullanılan setter fonksiyonu, fetchSettings içinde supabase verisi ile çağrılır
  - `loading` — boolean state, supabase verisi yüklenirken true, yükleme tamamlanınca false olur
  - `setLoading` — loading state'ini güncellemek için kullanılan setter fonksiyonu, finally bloğunda false olarak çağrılır
  - `error` — string | null tipinde state, hata olduğunda hata mesajını, olmadığında null tutar
  - `setError` — error state'ini güncellemek için kullanılan setter fonksiyonu, catch bloğunda hata mesajı ile çağrılır
  - `fetchSettings` — asenkron iç fonksiyon, useEffect callback'i içinde tanımlanır ve hemen çağrılır; supabase'den site_settings tablosunu sorgular
- **Dönüş**: `{ settings: AppSettings | null, loading: boolean, error: string | null }`

### [N2_NASIL] AST Pointer: src/hooks/useSettings.ts::useSettings/anonymous/useEffect_callback
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `fetchSettings` — asenkron fonksiyon, useEffect içinde tanımlanıp hemen invok edilir; supabase API'si üzerinden `site_settings` tablosundan `key, value` sütunlarını çeker
  - `data` — supabase.from('site_settings').select('key, value') çağrısından dönen satır dizisi, her satır {key: string, value: unknown} yapısındadır
  - `fetchError` — supabase sorgusundan dönen hata nesnesi, Error'a cast edilip throw edilir
  - `generalRow` — `data?.find((r) => r.key === 'general')` ile bulunan satır; value alanı Record<string, unknown> olarak cast edilir, site_name, tagline, contact_email, support_phone, headquarters, logo_url alanları String() ile string'e dönüştürülerek okunur, logo_url için null kontrolü yapılır
  - `paymentRow` — `data?.find((r) => r.key === 'payment')` ile bulunan satır; value alanı Record<string, unknown> olarak cast edilir, iyzico_enabled !! ile boolean'a, iyzico_mode String() ile 'sandbox' varsayılanıyla, iyzico_api_key String() ile string'e dönüştürülür
  - `r` — Array.find callback parametresi, her bir satır objesini temsil eder, `r.key` özelliği ile filtreleme yapılır
  - `err` — catch bloğunda yakalanan unknown tip hata, `instanceof Error` kontrolü ile `err.message` veya `String(err)` dönüşümü yapılır
- **Dönüş**: yok (yan etkiler: setSettings, setError, setLoading state setter'ları çağrılır)

### [N3_NASIL] AST Pointer: src/hooks/useSettings.ts::useSettings/anonymous/useEffect_callback::fetchSettings
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `data` — supabase.from('site_settings').select('key, value') çağrısından dönen satır dizisi
  - `fetchError` — supabase sorgusu başarısızsa dönen hata nesnesi, `Error`'a cast edilir ve throw edilir
  - `generalRow` — `data?.find((r) => r.key === 'general')` ile bulunan satır; `generalRow?.value` Record<string, unknown> olarak cast edilip `site_name`, `tagline`, `contact_email`, `support_phone`, `headquarters`, `logo_url` alanları okunur; logo_url varsa String() ile string'e, yoksa null döner
  - `paymentRow` — `data?.find((r) => r.key === 'payment')` ile bulunan satır; `paymentRow?.value` Record<string, unknown> olarak cast edilip `iyzico_enabled` (!!), `iyzico_mode` (String, varsayılan 'sandbox'), `iyzico_api_key` (String) alanları okunur
  - `r` — Array.find callback'indeki her bir satır parametresi, `r.key` özelliği 'general' veya 'payment' değerleri için kontrol edilir
  - `err` — try-catch bloğunda yakalanan hata nesnesi (unknown tip); `instanceof Error` ile kontrol edilip `err.message` veya `String(err)` olarak string'e dönüştürülür
- **Dönüş**: yok (yan etkiler: `setSettings({...})` ile settings state'i güncellenir, `setError(err.message)` ile hata state'i güncellenir, `setLoading(false)` ile yükleme durumu kapatılır)

---

## NODE ID STANDARD

  file: src\hooks\useSettings.ts
  function: src\hooks\useSettings.ts::useSettings

---

## DISA AKTARILANLAR (EXPORTS)
  export: AppSettings
  export: useSettings