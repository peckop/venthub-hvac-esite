---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\hooks\useSettings.ts
skeleton_hash: ed9f98cd3060abe2
entity_hashes:
  func:useSettings: 0139115fd60135da
  overview: 611d74a1adafaf67
generated_at: 2026-06-06T21:55:43Z
---

## Genel Bakış
VentHub HVAC projesindeki bu modül, React uygulaması genelindeki ayar verilerine tutarlı ve merkezi bir erişim noktası sağlayan özel bir hook sunar. Tek bir `useSettings` fonksiyonu üzerinden ayarların okunması ve güncellenmesi işlemleri gerçekleştirilerek, farklı bileşenler arasında veri tutarlılığı ve tekil kaynak (SSOT) prensibi garantilenir.

## Fonksiyon Grupları
### Merkezi Ayar Erişim ve Yönetim Katmanı
Uygulama genelindeki ayar değerlerinin (örneğin birim tercihleri, tema ayarları vb.) tek bir kaynaktan okunmasını ve güncellenmesini sağlayan, tüm bileşenlerin ortak kullanımına sunulan arayüz katmanıdır.
- useSettings

---



---

## FONKSİYON DETAYLARI

### useSettings
**Ne yapar**: Supabase veritabanında yer alan `app_settings` tablosundan global uygulama ayarlarını çekip state'te tutan, React uygulamaları için tasarlanmış özel bir custom hook'tur. Ayarların alınma sürecindeki yükleme durumu, oluşabilecek hatalar ve ayarların kendisini yöneterek uygulamanın tüm bölümlerinden güvenli bir şekilde global ayarlara erişilmesini sağlar. Tek bir merkezden yönetilen ayarların tutarlı bir şekilde tüm uygulama genelinde kullanılmasını garanti eder.
**Nasıl yapar**: Hook çağrıldığı anda öncelikle yükleme (loading) durumunu aktif hale getirerek Supabase üzerinden `app_settings` tablosundan veri çekme isteğini başlatır. İstek başarılı bir şekilde sonuçlandığında gelen ayar verilerini yerel state'e kaydeder ve yükleme durumunu devre dışı bırakır. Eğer veri çekme işlemi sırasında herhangi bir sorun oluşursa hata mesajını error state'ine kaydeder ve yükleme durumunu sonlandırır, tüm bu durumları uygulamaya kullanımına sunar.
**Parametreler**:
- Herhangi bir giriş parametresi almaz: Doğrudan çağrılarak kullanılır, herhangi bir giriş değeri talep etmez.
**Dönüş**: İçerisinde üç ana değer barındıran bir JavaScript nesnesi döndürür. Nesnenin içerdiği değerler şunlardır: `settings`: `app_settings` tablosundan çekilen tüm global uygulama ayarlarını içeren nesne, `loading`: ayarların çekilme sürecinin devam edip etmediğini belirten boolean değer (true ise işlem devam ediyor, false ise işlem tamamlanmış anlamına gelir), `error`: veri çekme işlemi sırasında oluşan hatayı içeren string değer, herhangi bir hata oluşmaması halinde boş veya null değer alır.

---

## INTERFACES

### AppSettings
- `id: string`
- `site_title: string`
- `site_description: string`
- `contact_email: string`
- `contact_phone: string`
- `contact_address: string`
- `social_links: Record<string, string>`
- `maintenance_mode: boolean`
- `google_analytics_id: string | null`
- `footer_text: string`
- `header_announcement: string | null`
- `default_meta_image: string | null`
- `brand_logo_url: string | null`
- `whatsapp_number: string | null`
- `updated_at: string`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/hooks/useSettings.ts::useSettings
- **params**: (yok)
- **ic_degiskenler**: 
  - `settings` — Uygulama ayarlarını tutan state değişkeni, başlangıçta null
  - `setSettings` — settings state'ini güncelleyen setter fonksiyonu
  - `loading` — Veri yükleme durumunu belirten boolean state, başlangıçta true
  - `setLoading` — loading state'ini güncelleyen setter fonksiyonu
  - `error` — Hata mesajını tutan string state, başlangıçta null
  - `setError` — error state'ini güncelleyen setter fonksiyonu
  - `fetchSettings` — useEffect içinde tanımlanan asenkron veri çekme fonksiyonu
- **Dönüş**: { settings, loading, error } objesi

### [N2_NASIL] AST Pointer: src/hooks/useSettings.ts::() => (anonymous)
- **params**: (yok)
- **ic_degiskenler**: 
  - `data` — Supabase'den çekilen app_settings tablosunun tek satır verisi
  - `fetchError` — Supabase sorgusu sırasında oluşabilecek hata nesnesi
  - `err` — Try bloğunda yakalanan hata, Error tipinde olmayabilir
- **Dönüş**: yok (async state güncelleme fonksiyonu)

### [N3_NASIL] AST Pointer: src/hooks/useSettings.ts::fetchSettings
- **params**: (yok)
- **ic_degiskenler**: 
  - `data` — Supabase'den çekilen app_settings tablosunun tek satır verisi
  - `fetchError` — Supabase sorgusu sırasında oluşabilecek hata nesnesi
  - `err` — Try bloğunda yakalanan hata, Error tipinde olmayabilir
- **Dönüş**: yok (async state güncelleme fonksiyonu)

---

## NODE ID STANDARD

  file: src\hooks\useSettings.ts
  function: src\hooks\useSettings.ts::useSettings

---

## DISA AKTARILANLAR (EXPORTS)
  export: AppSettings
  export: useSettings