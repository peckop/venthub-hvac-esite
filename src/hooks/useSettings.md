---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\hooks\useSettings.ts
skeleton_hash: 9aca7355dd0ea4fc
generated_at: 2026-05-23T22:30:27Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesinde React tabanlı arayüz bileşenleri tarafından kullanılmak üzere geliştirilmiş özel bir hook modülüdür. Uygulama genelindeki sistem ve kullanıcı ayarlarına merkezi, tutarlı erişim sağlamak amacıyla tasarlanmıştır. Tüm ayar yönetimi süreçlerini tek ana işlev üzerinden yürütür.

## Fonksiyon Grupları
### Merkezi Ayar Yönetimi Hook'u
Tüm uygulama genelinde kullanılacak ayarların okunması, güncellenmesi ve farklı bileşenler arasında güvenilir şekilde paylaşılmasını sağlayan ana işlevi barındırır.
- useSettings

---

## AXIOMS – Mimari Varsayımlar
Bu React custom hook'u, uygulama genelindeki ayar değerlerine merkezi erişim sağlamak üzere tasarlanmıştır, çalışması için geçerli bir React runtime ortamı ve ayar state'ini barındıran üst bağlam/altyapının mevcut olması zorunludur.

[Aksiyom 1]: Eğer hook, yalnızca React bileşenleri veya diğer React custom hook'ları içinde olmak zorunda olan geçerli bir çağrı bağlamında tetiklenmezse, React tarafından runtime hatası fırlatılır ve hook çalışmaz.
[Aksiyom 2]: Eğer bu hook'un erişmesi gereken SettingsContext veya eşdeğer ayar sağlayıcı altyapı, hook'un çağrıldığı bileşen ağacında üst seviyede tanımlanmamışsa, ayar değerlerine erişilemez, boş/hatalı değer döner veya uygulama çalışma anında çöker.
[Aksiyom 3]: Eğer projeye React kütüphanesi dahil edilmemişse veya React sürümü hook'ları (16.8 ve üzeri) desteklemiyorsa, useSettings hook'u hiç çalışmaz, uygulama build veya runtime aşamasında hata alır.
[Aksiyom 4]: Eğer hook'un ayar verilerini okuduğu yerel depolama veya sunucu altyapısı erişilemez durumdaysa, useSettings tarafından döndürülen ayar değerleri güncel olmaz, uygulama ayarlara bağlı tüm özellikler beklendiği gibi çalışmaz.

---

## FONKSIYON DETAYLARI

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

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\hooks\useSettings::useSettings
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `settings` — Uygulama ayarlarını saklayan, AppSettings | null tipinde React state değişkeni
  - `setSettings` — settings state değerini güncellemek için kullanılan React state setter fonksiyonu
  - `loading` — Ayarların yükleme durumunu saklayan boolean tipinde React state değişkeni
  - `setLoading` — loading state değerini güncellemek için kullanılan React state setter fonksiyonu
  - `error` — Yükleme sırasında oluşan hataları saklayan string | null tipinde React state değişkeni
  - `setError` — error state değerini güncellemek için kullanılan React state setter fonksiyonu
  - `useEffect` — Bileşen ilk mount olduğunda bir kere çalışacak yan etki oluşturmak için kullanılan React hook'u
  - `fetchSettings` — useEffect içinde tanımlanan, Supabase'den ayarları çeken async iç fonksiyon
  - `data` — fetchSettings içinde Supabase sorgusundan dönen ayar verisini saklayan değişken
  - `fetchError` — fetchSettings içinde Supabase sorgusu sırasında oluşan hatayı saklayan değişken
  - `err` — fetchSettings içindeki try/catch bloğunda yakalanan genel hata nesnesi
- **Dönüş**: { settings, loading, error } içeren state nesnesi

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\hooks\useSettings::anonim useEffect callback fonksiyonu
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `fetchSettings` — Supabase'den uygulama ayarlarını çekmek için tanımlanan async iç fonksiyon
  - `data` — fetchSettings içinde Supabase sorgusundan dönen ayar verisini saklayan değişken
  - `fetchError` — fetchSettings içinde Supabase sorgusu sırasında oluşan hatayı saklayan değişken
  - `err` — fetchSettings içindeki try/catch bloğunda yakalanan genel hata nesnesi
- **Dönüş**: yok

### [N3_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\hooks\useSettings::fetchSettings
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `data` — Supabase app_settings tablosundan sorgulanarak dönen ayar verisini saklayan değişken
  - `fetchError` — Supabase sorgusu sırasında oluşan hatayı saklayan değişken
  - `err` — try/catch bloğunda fırlatılan hataları yakalayan hata nesnesi
  - `setSettings` — Harici erişilen settings state'ini güncellemek için kullanılan setter fonksiyonu
  - `setError` — Harici erişilen error state'ini güncellemek için kullanılan setter fonksiyonu
  - `setLoading` — Harici erişilen loading state'ini güncellemek için kullanılan setter fonksiyonu
- **Dönüş**: yok

---

## NODE ID STANDARD

  file: src\hooks\useSettings.ts
  function: src\hooks\useSettings.ts::useSettings

---

## DISA AKTARILANLAR (EXPORTS)
  export: AppSettings
  export: useSettings