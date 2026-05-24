---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\supabase\functions\order-validate\index.ts
skeleton_hash: bf6740246d4dc074
generated_at: 2026-05-24T07:46:05Z
---

## Genel Bakış
Bu modül, Supabase üzerindeki bir HTTP işlevi olarak sipariş verilerinin geçerliliğini kontrol eden bir işleyici sağlar. Gelen istekleri alır, sipariş bilgilerini doğrular ve uygun bir HTTP yanıtı döndürerek işlemi tamamlar.

## Fonksiyon Grupları
### Sipariş Doğrulama İşlemi
Sipariş verilerinin alınması, gerekli kontrollerin yapılması ve sonuçların istemciye iletilmesi sorumluluğunu üstlenir.
- order-validate_handler

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSIYON DETAYLARI

### order-validate_handler
**Ne yapar**: Gelen istekteki sipariş verisini doğrular ve doğrulama sonucunu bir `Response` nesnesi olarak döndürür.  
**Nasıl yapar**: İstek gövdesindeki sipariş verisini okur, gerekli doğrulama kurallarını uygular ve sonuçta uygun HTTP durum kodunu ve mesajı içeren bir yanıt üretir.  
**Parametreler**:
- `req`: Request — İşlenecek gelen HTTP isteği; sipariş verisi genellikle isteğin gövdesinde bulunur.  
**Dönüş**: `Response` — İşlem sonucunu gösteren HTTP yanıtı; başarılı doğrulama durumunda genellikle 200 OK, başarısızlık durumunda 400 Bad Request veya başka uygun hata kodu döner.

---

## INTERFACES

### CartItem
- `product_id: string`
- `quantity: number | string`
- `unit_price?: number | string`
- `price_list_id?: string | null`

### Product
- `id: string`
- `price?: number | string`
- `stock_qty?: number | string`
- `stock?: number | string`
- `quantity_available?: number | string`
- `inventory?: number | string`
- `inventory_quantity?: number | string`
- `available?: number | string`
- `on_hand?: number | string`

### UserProfile
- `id: string`
- `role?: string`
- `organization_id?: string | null`

### Organization
- `id: string`
- `tier_level?: number | null`

### PriceList
- `id: string`
- `allowed_user_roles?: string[] | null`
- `organization_tiers?: number[] | null`
- `is_default?: boolean`
- `effective_from?: string | null`

### ProductPrice
- `base_price?: number | string | null`
- `sale_price?: number | string | null`
- `discount_percentage?: number | string | null`
- `is_active?: boolean`
- `valid_from?: string | null`
- `valid_until?: string | null`
- `price_list_id?: string | null`

### RecalcItem
- `product_id: string`
- `quantity: number`
- `unit_price: number`
- `price_list_id: string | null`

### MismatchItem
- `product_id: string`
- `had: unknown`
- `expected: number`
- `price_list_id: string | null`

### StockIssue
- `product_id: string`
- `requested: number`
- `available: number`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\supabase\functions\order-validate\index.ts::order-validate_handler
- **params**: (req: Request)
- **ic_degiskenler**:
  - `cors` — CORS politikasını tanımlayan header nesnesi, tüm HTTP yanıtlarında kullanılır
  - `supabaseUrl` — Deno ortam değişkeninden alınan Supabase proje URL'si
  - `serviceRoleKey` — Deno ortam değişkeninden alınan admin yetkili Supabase servis rolü anahtarı
  - `anonKey` — Deno ortam değişkeninden alınan herkese açık anonim Supabase istemci anahtarı
  - `authHeader` — İstekten alınan Authorization başlığı, kullanıcı kimlik doğrulaması için kullanılır
  - `authClient` — Kullanıcı oturumunu doğrulamak için oluşturulan anonim yetkili Supabase istemcisi
  - `user` — authClient ile alınan doğrulanmış kullanıcı nesnesi
  - `authErr` — Kullanıcı bilgisi alınırken oluşan hata nesnesi
  - `headers` — Servis rolü ile yetkilendirilmiş API istekleri için kullanılan header nesnesi
  - `body` — İstekten parse edilen JSON gövdesi, parse hatasında boş nesne olarak atanır
  - `userId` — Doğrulanmış kullanıcının benzersiz ID'si
  - `cartId` — İstekten alınan veya kullanıcıya ait sepet ID'si, string formatına standartlaştırılır
  - `getJson` — İç içe tanımlanan, Supabase REST API'sinden tipli JSON verisi çeken async yardımcı fonksiyon
  - `nowIso` — İç içe tanımlanan, şu anki zamanı ISO string formatında döndüren zaman yardımcısı
  - `carts` — Kullanıcıya ait sepetleri çeken dizi, kullanıcıya ait tek sepeti almak için kullanılır
  - `carts[0]` — Kullanıcının ilk sepet nesnesi, ID'si cartId'ye atanır
  - `items` — Sepete ait ürünleri içeren cart_items dizisi, boş olursa boş cevap döndürülür
  - `_productIds` — Sepetteki benzersiz ürün ID'leri dizisi, ürünleri toplu çekmek için kullanılır
  - `prods` — Sepetteki ürünlerin detaylarını içeren products dizisi
  - `pmap` — Ürün ID'si ile ürün nesnesini eşleştiren Map nesnesi, hızlı erişim sağlar
  - `role` — Kullanıcının rolü, varsayılan 'individual', kullanıcı profiline göre güncellenir
  - `orgId` — Kullanıcının ait olduğu kuruluşun ID'si, null varsayılanı ile başlar
  - `tier` — Kullanıcının kuruluşunun seviye puanı, null varsayılanı ile başlar
  - `prof` — Kullanıcının profilini içeren user_profiles dizisi
  - `prof[0]` — Kullanıcının ilk profil nesnesi, rolü ve kuruluş ID'si alınır
  - `org` — Kullanıcının kuruluş detaylarını içeren organizations dizisi
  - `org[0]` — Kullanıcının ilk kuruluş nesnesi, tier_level değeri alınır
  - `n` — Şu anki zamanın ISO string formatındaki değeri, fiyat listeleri filtrelemek için kullanılır
  - `lists` — Tüm aktif fiyat listelerini içeren price_lists dizisi
  - `flists` — Kullanıcının rolü ve kuruluş seviyesine göre filtrelenmiş geçerli fiyat listeleri dizisi
  - `chosenListId` — Sıralama sonrası seçilen ilk fiyat listesinin ID'si
  - `priceFor` — İç içe tanımlanan, bir ürün için geçerli birim fiyatını hesaplayan async yardımcı fonksiyon
  - `recalculated` — Yeniden hesaplanan sepet öğelerini tutan dizi, son cevapta gönderilir
  - `mismatches` — Sepetteki kayıtlı fiyat ile hesaplanan gerçek fiyat arasındaki uyumsuzlukları tutan dizi
  - `stockIssues` - Stokta yeterli ürün olmayan öğeler için oluşan sorunları tutan dizi
  - `to2` - Sayıyı 2 ondalık basamağa yuvarlayan yardımcı fonksiyon
  - `toCents` - Tutarı sent cinsine çevirmek için 100 ile çarpıp yuvarlayan yardımcı fonksiyon
  - `it` - Döngüde işlenen her bir sepet öğesi
  - `product` - pmap'ten alınan mevcut öğeye ait ürün nesnesi
  - `pr` - priceFor ile hesaplanan ürünün birim fiyatı ve kullandığı fiyat listesi bilgisi
  - `unitNorm` - 2 ondalık basamağa yuvarlanmış standartlaştırılmış birim fiyat
  - `equal` - Sepetteki kayıtlı fiyat ile hesaplanan fiyatın uyumlu olup olmadığını gösteren boolean
  - `available` - Ürünün mevcut stok miktarı, ürün nesnesindeki yaygın stok alanlarından alınır
  - `cand` - Ürün nesnesinde stok miktarını bulmak için kontrol edilen alan isimleri listesi
  - `c` - Döngüde kontrol edilen her bir stok alanı değeri
  - `qty` - Sepette istenen ürün miktarı, sayıya dönüştürülür
  - `finalQty` - Stok durumuna göre önerilen nihai ürün miktarı, yetersiz stokta mevcut miktara ayarlanır
  - `subtotalCents` - Tüm yeniden hesaplanan öğelerin sent cinsinden toplam tutarı
  - `subtotal` - Sent cinsinden toplamın ana para birimi cinsinden değeri
  - `ok` - Tüm uyumsuzlukların ve stok sorunlarının sıfır olduğunu gösteren boolean
  - `_e` - Ana try bloğunda yakalanan genel hata nesnesi
  - `msg` - Hata nesnesinden alınan okunabilir hata mesajı
- **Dönüş**: Response, tüm sipariş doğrulama sonuçlarını veya hata mesajlarını içeren HTTP yanıtı

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\supabase\functions\order-validate\index.ts::getJson
- **params**: (_path: string)
- **ic_degiskenler**:
  - `res` - Supabase REST API'ye yapılan fetch isteğinin cevap nesnesi
  - `txt` - API cevabından okunan ham metin içeriği
- **Dönüş**: Promise<T>, Generic tipinde parse edilmiş JSON verisi, parse hatası durumunda null döner

### [N3_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\supabase\functions\order-validate\index.ts::flists_filter_cb
- **params**: (pl: PriceList)
- **ic_degiskenler**:
  - `rs` - Fiyat listesinin izin verilen kullanıcı rolleri dizisi, null/undefined olabilir
  - `ts` - Fiyat listesinin izin verilen kuruluş seviyeleri dizisi, null/undefined olabilir
  - `roleOk` - Kullanıcının rolü fiyat listesine uygun mu diye kontrol eden boolean
  - `tierOk` - Kullanıcının kuruluş seviyesi fiyat listesine uygun mu diye kontrol eden boolean
- **Dönüş**: boolean, fiyat listesinin kullanıcı için geçerli olup olmadığını belirtir

### [N4_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\supabase\functions\order-validate\index.ts::flists_sort_cb
- **params**: (a: PriceList, b: PriceList)
- **ic_degiskenler**:
  - `ad` - a fiyat listesinin varsayılan olup olmadığını belirten sayısal değer (1: varsayılan, 0: değil)
  - `bd` - b fiyat listesinin varsayılan olup olmadığını belirten sayısal değer
  - `at` - a fiyat listesinin geçerlilik başlangıç zamanının timestamp değeri
  - `bt` - b fiyat listesinin geçerlilik başlangıç zamanının timestamp değeri
- **Dönüş**: number, sıralama için karşılaştırma sonucu, negatif/pozitif/sıfır olarak sıralamayı yönlendirir

### [N5_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\supabase\functions\order-validate\index.ts::priceFor
- **params**: (product: Product)
- **ic_degiskenler**:
  - `queries` - Sırayla denenecek fiyat listesi ID'leri, önce seçilen liste sonra null (genel fiyatlar)
  - `q` - Döngüde denenen her bir fiyat listesi ID'si
  - `basePath` - Ürün fiyatlarını çekmek için kullanılan ortak API yolunun başlangıcı
  - `_path` - Sorguya göre tam olarak oluşturulmuş ürün fiyatları API yolu
  - `rows` - getJson ile çekilen ürün fiyatları dizisi
  - `pick` - Geçerlilik tarihlerine göre seçilen ilk uygun fiyat nesnesi, bulunamazsa ilk öğe seçilir
  - `r` - rows.find içinde kontrol edilen her bir fiyat nesnesi
  - `f` - Fiyatın geçerlilik başlangıç tarihinin mevcut zamandan önce olup olmadığını kontrol eden boolean
  - `t` - Fiyatın geçerlilik bitiş tarihinin mevcut zamandan sonra olup olmadığını kontrol eden boolean
  - `base` - Fiyatın temel fiyatı, sayıya dönüştürülür
  - `sale` - Fiyatın indirimli satış fiyatı, null olabilir
  - `disc` - Fiyatın yüzdesel indirim oranı, sayıya dönüştürülür
  - `v` - İndirim uygulandıktan sonra hesaplanan ara fiyat değeri
  - `fb` - Hiçbir uygun fiyat bulunamazsa ürün nesnesindeki varsayılan fiyat
- **Dönüş**: Promise<{unit: number, listId: string|null}>, Hesaplanan birim fiyatı ve kullanılan fiyat listesi ID'sini içeren nesne

---

## NODE ID STANDARD

  file: supabase\functions\order-validate\index.ts
  function: supabase\functions\order-validate\index.ts::order-validate_handler

---

## DISA AKTARILANLAR (EXPORTS)
  export: order-validate_handler