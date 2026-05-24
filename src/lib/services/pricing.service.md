---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\lib\services\pricing.service.ts
skeleton_hash: f8f645d877537df2
generated_at: 2026-05-23T22:32:31Z
---

## Genel Bakış
Bu modül VentHub HVAC platformunun merkezi fiyatlandırma servisidir, ürünlere ait güncel ve geçerli fiyat bilgilerini güvenilir şekilde hesaplayıp sunmakla yükümlüdür. Tüm fiyat işlemlerinde standart zaman damgası kullanımını desteklemek amacıyla yardımcı bir tarih-saat üretim fonksiyonu da barındırır.

## Fonksiyon Grupları
### Yardımcı Tarih-Saat Fonksiyonu
Modül içindeki tüm fiyat işlemlerinde ihtiyaç duyulan anlık tarih-saat bilgisini ISO standardında metin formatında döndürür, tüm zaman kullanımlarını standardize eder.
- nowIso

### Ürün Fiyat Bilgisi Hesaplama Fonksiyonları
Girdi olarak alınan ürün nesnesine göre ürünün güncel geçerli birim fiyatını ve detaylı fiyat metaverilerini (fiyat listesi kimliği dahilinde) asenkron şekilde sunar.
- getEffectiveUnitPrice, getEffectivePriceInfo

---

## AXIOMS – Mimari Varsayımlar
Bu fiyatlandırma servisi, ürünlere ait geçerli birim ve toplam fiyat bilgilerini hesaplamak, standart formatta zaman damgası üretmek için tasarlanmıştır; doğru çalışması için tüm bağımlı kaynakların erişilebilirliği ve iletilen veri yapılarının beklenen özelliklere sahip olması zorunludur.

[Aksiyom 1]: Eğer getEffectiveUnitPrice ve getEffectivePriceInfo fonksiyonlarına iletilen Product nesnesi, fiyat hesaplamaları için gereken tüm zorunlu alanlara sahip değilse, her iki fonksiyon da geçersiz fiyat değerleri döndürür veya çalışma zamanı hatası fırlatır.
[Aksiyom 2]: Eğer nowIso() fonksiyonunun eriştiği sistem zaman kaynağı erişilemez veya geçersiz zaman değeri üretiyorsa, zaman bazlı fiyat geçerliliği kontrolleri yanlış çalışır, tüm zaman bağımlı fiyat hesaplamaları hatalı sonuçlanır.
[Aksiyom 3]: Eğer fiyat hesaplama fonksiyonlarına Product nesnesi yerine null, undefined veya geçersiz tipte bir değer iletilirse, servis herhangi bir geçerli fiyat bilgisi üretemez, istisna fırlatır.
[Aksiyom 4]: Eğer Product nesnesi içerisindeki fiyatlandırma için kullanılan alanların veri tipleri (fiyat için sayısal tip, tarih değerleri için standart format vb.) beklenen tiplerden farklıysa, hesaplama işlemleri aritmetik veya mantıksal hatalara yol açar.

---

## FONKSIYON DETAYLARI

### nowIso
**Ne yapar**: Fonksiyonun çağrıldığı anın sistem zamanına ait ISO 8601 standart formatında tarih-saat string'ini döndürür. Genel olarak zaman damgası gerektiren fiyatlandırma hesapları, işlem kayıtları veya diğer zaman bazlı işlemler için standart formatta güvenilir zaman bilgisi sunar.
**Nasıl yapar**: Mevcut sistem zamanını alarak standart dönüşüm yöntemleriyle ISO 8601 formatına çevirir, herhangi bir ek filtreleme veya değişiklik uygulamadan doğrudan standart string çıktısını üretir.
**Parametreler**: Bu fonksiyonun herhangi bir giriş parametresi bulunmamaktadır.
**Dönüş**: string türünde, çağrıldığı anın ISO 8601 formatında tarih-saat bilgisini içeren bir değeri döndürür.

### getEffectiveUnitPrice
**Ne yapar**: Verilen ürün için mevcut kullanıcının rolü, sistemdeki tüm aktif fiyat listeleri ve geçerli tüm indirimleri değerlendirerek ürünün nihai olarak uygulanacak birim fiyatını hesaplar. Ürünün temel fiyatı üzerinden tüm güncel koşullara uygun özel fiyatlandırmayı uygular, kullanıcı ve döneme özel doğru fiyatı kullanıcılara sunar.
**Nasıl yapar**: Önce fiyatlandırma isteğini yapan kullanıcının rolünü doğrular, ardından tarih aralığı geçerli olan tüm aktif fiyat listelerini sorgular. Bu listelerdeki özel fiyatlar veya indirimleri ürün için sırayla değerlendirerek en uygun geçerli fiyatı belirler, tüm asenkron veri çekme ve hesaplama işlemleri tamamlandıktan sonra nihai fiyatı döndürür.
**Parametreler**:
- name: product — type: Product — İçinde ürünün temel fiyat bilgilerini barındıran, fiyatlandırması hesaplanacak ürün nesnesi.
**Dönüş**: Promise<number> türünde, tüm koşullar değerlendirildikten sonra hesaplanan nihai birim fiyatını içeren asenkron promise nesnesi döndürür. await anahtar kelimesi ile çözümlenerek kullanılabilir.

### getEffectivePriceInfo
**Ne yapar**: Mevcut kullanıcının rolü bazında verilen ürün için en uygun fiyatlandırma bilgilerini belirler. Hesapladığı birim fiyatın yanı sıra uygulanan fiyat listesinin ID'sini de döndürür. Hiçbir eşleşen fiyat listesi bulunamadığında veya herhangi bir işlem sırasında hata oluştuğunda ürünün kendi temel fiyatına dayalı bir yedek fiyatlandırması sunar.
**Nasıl yapar**: Sistemdeki aktif fiyat listelerini geçerlilik başlangıç ve bitiş tarihlerine göre sıralayarak sorgular, sıralı listedeki her bir fiyat listesinin ürün için geçerliliğini ve sunduğu fiyat/indirim değerini değerlendirerek en avantajlı geçerli fiyatı seçer. Uygulanan bir fiyat listesi varsa ID'sini sonuç nesnesine ekler, herhangi bir sorun oluşması halinde ürünün varsayılan temel fiyatını geri döndürür, tüm veri çekme ve hesaplama işlemleri asenkron olarak yürütülür.
**Parametreler**:
- name: product — type: Product — Fiyatlandırma bilgileri hesaplanacak ürün nesnesi.
**Dönüş**: Promise<{ unitPrice: number, priceListId: string | null }> türünde, asenkron olarak çözümlenen, hesaplanmış nihai birim fiyatı ve uygulanan fiyat listesinin ID'sini (eğer herhangi bir fiyat listesi uygulanmamışsa null olarak) içeren bir nesneyi barındıran promise döndürür.

---

## INTERFACES

### UserProfileLight
- `id: string`
- `role?: UserRole | null`
- `organization_id?: string | null`

### OrganizationLight
- `id: string`
- `tier_level?: number | null`

---

## TYPE ALIASES

### UserRole
```typescript
type UserRole = 'individual' | 'dealer' | 'corporate' | 'admin'
```

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/lib/services/pricing.service.ts::nowIso
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `new Date()` — Geçerli sistem zamanını temsil eden yerel Date nesnesi
  - `Date.prototype.toISOString` — Date nesnesini ISO 8601 standartında stringe dönüştürmek için kullanılan yerleşik metod
- **Dönüş**: string (geçerli zamanın ISO formatlı string hali)

---

### [N2_NASIL] AST Pointer: src/lib/services/pricing.service.ts::getEffectiveUnitPrice
- **params**: [product: Product] — Birim fiyatı hesaplanacak ürün nesnesi, Supabase Product tipinde
- **ic_degiskenler**:
  - `info` — `getEffectivePriceInfo` fonksiyonundan await ile alınan, fiyat detaylarını barındıran nesne
  - `getEffectivePriceInfo` — Gelişmiş fiyat bilgisi getiren fonksiyona yapılan çağrı, product parametresi aktarılır
  - `info.unitPrice` — info nesnesinden çıkarılan hesaplanmış nihai birim fiyat değeri
- **Dönüş**: Promise<number> (hesaplanmış geçerli birim fiyat)

---

### [N3_NASIL] AST Pointer: src/lib/services/pricing.service.ts::getEffectivePriceInfo
- **params**: [product: Product] — Geçerli fiyat bilgisi hesaplanacak ürün nesnesi, Supabase Product tipinde
- **ic_degiskenler**:
  - `fallback` — Hiçbir özel fiyat koşulu sağlanmadığında kullanılacak yedek varsayılan ürün fiyatı
  - `v` (IIFE içi) — `product.price` alanından türetilen ham sayısal fiyat değeri, tip dönüşümü sonrası
  - `product.price` — Ürün nesnesinden okunan orijinal fiyat alanı
  - `product.id` — Ürün nesnesinden okunan benzersiz ürün ID'si, ürün fiyatı sorgusunda kullanılır
  - `authData` — `supabase.auth.getUser()` çağrısından dönen oturum açmış kullanıcı verisi
  - `userErr` — Kullanıcı bilgisi alma işlemi sırasında oluşabilecek hata nesnesi
  - `user` — Hata yoksa authData'dan çıkarılan kullanıcı nesnesi, hata durumunda null
  - `prof` — `user_profiles` tablosundan sorgulanan kullanıcı profili verisi
  - `profErr` — Kullanıcı profili sorgulama işlemi sırasında oluşabilecek hata nesnesi
  - `profile` — prof nesnesine tip ataması yapılan hafif kullanıcı profili nesnesi
  - `role` — Profilden alınan kullanıcı rolü, tanımsızsa varsayılan `individual` değeri atanır
  - `now` — `nowIso()` fonksiyonu ile alınan geçerli zamanın ISO formatlı string hali
  - `lists` — `price_lists` tablosundan sorgulanan aktif fiyat listeleri verisi
  - `listErr` — Fiyat listesi sorgulama işlemi sırasında oluşabilecek hata nesnesi
  - `typedLists` — lists dizisine `PriceListRow` tipi ataması yapılan tipli dizi
  - `matchedLists` — Kullanıcının rolüyle eşleşen fiyat listelerinin filtrelenmiş dizisi
  - `sorted` — Eşleşen fiyat listelerinin öncelik sırasına göre sıralanmış hali
  - `sorted[0]` — Sıralı listedeki ilk (en öncelikli) fiyat listesi elemanı
  - `chosen` — Seçilen en öncelikli fiyat listesi nesnesi, liste boşsa null
  - `priceListIds` — Denenmesi gereken fiyat listesi ID'lerinin dizisi (önce özel kullanıcı listesi, sonra genel varsayılan)
  - `plId` — Döngüde her adımda işlenen mevcut fiyat listesi ID'si
  - `query` — `product_prices` tablosu için oluşturulan Supabase sorgu nesnesi
  - `rows` — Ürün fiyatları sorgusundan dönen fiyat satırları dizisi
  - `prErr` — Ürün fiyatı sorgulama sırasında oluşabilecek hata nesnesi
  - `rows[0]` — Fiyat satırları dizisindeki ilk eleman, geçerli tarih aralığında uygun satır bulunamazsa kullanılır
  - `pick` — Geçerli tarih aralığında olan ilk uygun fiyat satırı, bulunamazsa ilk satır seçilir
  - `base` — Seçilen fiyat satırındaki temel fiyatın sayısal hali
  - `sale` — Seçilen satırdaki indirimli satış fiyatı, tanımsızsa null atanır
  - `disc` — Seçilen satırdaki yüzdelik indirim oranı
  - `val` — Temel fiyata indirim uygulandıktan sonra hesaplanan nihai fiyat değeri
  - `e` (catch bloğu) — İşlem sırasında oluşan yakalanmış genel hata nesnesi
- **Dönüş**: Promise<{ unitPrice: number, priceListId: string | null }> (hesaplanmış birim fiyat ve kullanılan fiyat listesi ID'si, liste kullanılmadıysa null)

---

## ÇAĞRI HARİTASI

### Disariya Cagrilar (Outgoing)
getEffectiveUnitPrice() birim fiyat hesaplaması için kendi dosyasındaki getEffectivePriceInfo() fonksiyonunu, getEffectivePriceInfo() ise zaman damgası almak için nowIso fonksiyonunu çağırır.

### Disaridan Cagrilanlar (Incoming)
Sağlanan veri setinde bu modülü kullanan dış dosya/fonksiyon bilgisi yer almamaktadır.

### Ic Ice Fonksiyonlar (Nested)
Yok

---

## DOSYA-İÇİ ÇAĞRI GRAFİĞİ
  getEffectivePriceInfo() → nowIso()
  getEffectiveUnitPrice() → getEffectivePriceInfo()

```mermaid
graph LR
    getEffectivePriceInfo["getEffectivePriceInfo()"] --> nowIso["nowIso()"]
    getEffectiveUnitPrice["getEffectiveUnitPrice()"] --> getEffectivePriceInfo["getEffectivePriceInfo()"]
```

---

## NODE ID STANDARD

  file: src\lib\services\pricing.service.ts
  function: src\lib\services\pricing.service.ts::nowIso
  function: src\lib\services\pricing.service.ts::getEffectiveUnitPrice
  function: src\lib\services\pricing.service.ts::getEffectivePriceInfo

---

## DISA AKTARILANLAR (EXPORTS)
  export: OrganizationLight
  export: UserProfileLight
  export: UserRole
  export: getEffectivePriceInfo
  export: getEffectiveUnitPrice
  export: nowIso