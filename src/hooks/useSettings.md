---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\hooks\useSettings.ts
skeleton_hash: be620be3010306bc
entity_hashes:
  func:useSettings: 0139115fd60135da
  overview: a5fd51a59ccbf3f0
generated_at: 2026-06-08T10:09:33Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesindeki React uygulamasının tüm bileşenlerinden erişilebilen küresel uygulama ayarlarını merkezi olarak yöneten bir custom hook sunar. Tek bir `useSettings` fonksiyonu, ayarların Supabase veritabanından çekilmesi, yüklenme ve hata durumlarının yönetilmesi işlemlerini kapsar, böylece uygulama genelinde veri tutarlılığı ve tekil kaynak prensibini sağlar.

## Fonksiyon Grupları
### Merkezi Ayar Yönetim Katmanı
Uygulama genelindeki ayar değerlerinin (ör. birim tercihleri, tema) tek bir kaynaktan okunmasını ve güncellenmesini sağlayarak bileşenler arası veri tutarlılığını garanti altına alan, ortak bir erişim arayüzü sunar.
- useSettings

---

## AXIOMS – Mimari Varsayımlar
Bu modül için tanımlı bir fonksiyon gövdesi (fonksiyon implementasyonu) bulunmamaktadır, bu nedenle fonksiyonel aksiyomlar türetilememektedir. Modülün yapısına ilişkin aşağıdaki yapısal varsayımlar belirtilebilir:

[Aksiyom 1]: Eğer `useSettings` fonksiyonu bir React bileşeni veya özel hook içinde çağrılmazsa (React Hook kurallarını ihlal ederse), React çalışma zamanı hatası oluşur.

[Aksiyom 2]: Eğer `useSettings` fonksiyonu, ayar verilerinin tutulduğu merkezi bir bağlam (Context) veya durum yönetimi (State) kaynağı tarafından desteklenmiyorsa, fonksiyon geçerli veya tutarlı ayar verisi döndüremez.

[Aksiyom 3]: Eğer `useSettings` fonksiyonunun çağrıldığı bileşen ağacı içinde ayarlar için gerekli sağlayıcı (Provider) bileşeni mevcut değilse, fonksiyon varsayılan değerler döndüremez veya hata fırlatır.

[Aksiyom 4]: Eğer `useSettings` hook'u dışarıdan bir parametre almıyorsa, döndürdüğü ayar nesnesinin yapısı ve içeriği tamamen içsel tanımlara bağlıdır ve dışarıdan müdahale edilemez.

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
  - `settings` — Uygulama ayarlarını tutan state, başlangıçta `null`, `setSettings` ile güncellenir, tipi `AppSettings | null`
  - `setSettings` — `settings` state'ini güncellemek için React setter fonksiyonu
  - `loading` — Veri yükleme durumunu takip eden boolean state, başlangıçta `true`
  - `setLoading` — `loading` state'ini güncellemek için React setter fonksiyonu, `finally` bloğunda `false` yapılır
  - `error` — Hata mesajını tutan string veya null state, başlangıçta `null`
  - `setError` — `error` state'ini güncellemek için React setter fonksiyonu
  - `fetchSettings` — `useEffect` içinde tanımlı nested async fonksiyon, Supabase'den `app_settings` tablosundan tek satır veri çeker
  - `supabase` — Import edilen Supabase browser client instance'ı, `.from().select().single()` zincirinde kullanılır
  - `data` — `supabase.from('app_settings').select('*').single()` response'undan destructure edilen veri nesnesi, `setSettings` argumenti olarak cast edilerek kullanılır
  - `fetchError` — Supabase response'undan destructure edilen hata nesnesi, `if (fetchError)` ile kontrol edilip throw edilir
  - `err` — `catch` bloğu parametresi, `unknown` tipinde, `instanceof Error` kontrolü ile message'e erişilir
- **Dönüş**: `{ settings, loading, error }` object — settings verisi, yükleme durumu ve hata mesajını döner

### [N2_NASIL] AST Pointer: src/hooks/useSettings.ts::useSettings::useEffect_callback
- **params**: (yok)
- **ic_degiskenler**:
  - `fetchSettings` — useCallback yok, her render'da yeniden oluşturulan async fonksiyon, Supabase'den ayar verisini çeker ve state'lere yazar
- **Dönüş**: yok (yan etki: `fetchSettings()` çağrısı ile state'leri mutate eder)

### [N3_NASIL] AST Pointer: src/hooks/useSettings.ts::useSettings::useEffect_callback::fetchSettings
- **params**: (yok)
- **ic_degiskenler**:
  - `data` — Supabase `.single()` response'undan destructure edilen ham ayar verisi, `Partial<AppSettings>` ve ardından `AppSettings` tipine cast edilerek `setSettings`'e passed edilir
  - `fetchError` — Supabase `.single()` response'undan destructure edilen hata objesi, truthy ise `throw` ile catch bloğuna aktarılır
  - `err` — Catch bloğu yakaladığı `unknown` tipindeki hata, `instanceof Error` kontrolü ile `err.message` veya `String(err)` formatında `setError`'e passed edilir
- **Dönüş**: yok (yan etkiler: `setSettings(data)` başarılı durumda, `setError(err)` hata durumunda, `setLoading(false)` her durumda finally bloğunda çağrılır)

---

## NODE ID STANDARD

  file: src\hooks\useSettings.ts
  function: src\hooks\useSettings.ts::useSettings

---

## DISA AKTARILANLAR (EXPORTS)
  export: AppSettings
  export: useSettings