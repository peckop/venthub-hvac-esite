---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\lib\services\registry.ts
skeleton_hash: 880e7ef26e82624b
entity_hashes:
  func:AddressService:constructor: 0e35462915cc5372
  func:AddressService:createAddress: 610d4cd342edb149
  func:AddressService:deleteAddress: 9dd56a6af60ae911
  func:AddressService:listAddresses: f1864ad9990631a5
  func:AddressService:setDefaultAddress: 1fb233bcfce543c5
  func:AddressService:updateAddress: df83314a160401dc
  func:CartService:clearCartItems: e5288a23587a30e5
  func:CartService:constructor: 0e35462915cc5372
  func:CartService:getOrCreateShoppingCart: 56ef117cdaec779d
  func:CartService:listCartItems: b1344b3014f00843
  func:CartService:listCartItemsWithProducts: 9933c98a5e23b7d4
  func:CartService:removeCartItem: 790c0e8eb8809d7f
  func:CartService:upsertCartItem: c02594fbb6f625da
  func:CategoryService:constructor: 0e35462915cc5372
  func:CategoryService:getCategories: 267df561bb884d42
  func:InvoiceService:constructor: 0e35462915cc5372
  func:InvoiceService:createInvoiceProfile: 201a6001e63fddd3
  func:InvoiceService:deleteInvoiceProfile: 960037284824bcac
  func:InvoiceService:fetchDefaultInvoiceProfile: 5c25067368b13d9b
  func:InvoiceService:listInvoiceProfiles: 7611db7b5f134e84
  func:InvoiceService:setDefaultInvoiceProfile: 4c684c75c1f44302
  func:InvoiceService:updateInvoiceProfile: 4666047aa0d29d4e
  func:PricingService:constructor: 0e35462915cc5372
  func:PricingService:getEffectivePriceInfo: cf564dbdf168d6f1
  func:PricingService:getEffectiveUnitPrice: 1d3f924608a0a54f
  func:ProductService:adminSearchProducts: 5c46368893fc056d
  func:ProductService:constructor: 0e35462915cc5372
  func:ProductService:ftsSearchProducts: 01a525f00a12cf6b
  func:ProductService:getAllProducts: 8949438f20aea47d
  func:ProductService:getFeaturedProducts: 656a387fd35eb0ae
  func:ProductService:getProductById: 38d53284a4889ab0
  func:ProductService:getProductBySlug: 5b058ba43c9bca7a
  func:ProductService:getProductBySlugOrId: 6dee1121996f4853
  func:ProductService:getProducts: 8cb83fccd0624f9f
  func:ProductService:getProductsByCategory: 052f2ff3b4934488
  func:ProductService:getProductsBySubcategory: 0a621b8639d811ef
  func:ProductService:getProductsEnriched: 0a0357b8c4480782
  func:ProductService:getSearchSuggestions: f828af306a10601d
  func:ProductService:searchProducts: 3ba4b2d8b0027d5a
  func:ProjectService:addProductToProject: 835ce083f03e61b1
  func:ProjectService:constructor: 0e35462915cc5372
  func:ProjectService:createProject: 08186ae461b0a5d6
  func:ProjectService:deleteProject: 1bb4189dbbb9b828
  func:ProjectService:listProjectItems: a0921fb164ce18a3
  func:ProjectService:listUserProjects: 96b38aafc316f0a8
  func:ProjectService:removeProductFromProject: 616bb2fd054964a1
  func:ServiceRegistry:constructor: 0e35462915cc5372
  overview: 01e17ea82195b5d7
generated_at: 2026-06-19T20:49:07Z
---

## Genel Bakış

Bu modül, venthub-hvac e-ticariat uygulamasının tüm servislerini merkezi bir yapıda tanımlar ve sunar. Her bir servis, Supabase veritabanı üzerinden belirli bir iş alanına (adresler, sepet, ürünler, fiyatlandırma, projeler vb.) yönelik CRUD ve iş mantığı operasyonlarını yönetir. ServiceRegistry sınıfı, tüm bu servisleri tek bir noktadan örnekler ve uygulama genelinde tutarlı bir erişim sağlar.

## Fonksiyon Grupları

### Ürün ve Kategori Yönetimi
Ürün kataloğunun sorgulanması, aranması ve kategorilere göre filtrelenmesiyle ilgilenir. Zenginleştirilmiş ürün verileri, slug tabanlı erişim ve tam metin arama desteği sunar.
- `getProductsEnriched`, `getProducts`, `getAllProducts`, `getProductsByCategory`, `getProductsBySubcategory`, `getProductById`, `getProductBySlugOrId`, `getProductBySlug`, `getFeaturedProducts`, `searchProducts`, `ftsSearchProducts`, `getSearchSuggestions`, `adminSearchProducts`
- `getCategories`

### Sepet İşlemleri
Kullanıcı alışveriş sepetinin oluşturulması, öğelerin eklenip kaldırılması ve temizlenmesini yönetir. Ürün detaylarıyla birlikte sepet içeriği sorgulama desteği de sağlar.
- `getOrCreateShoppingCart`, `listCartItems`, `listCartItemsWithProducts`, `upsertCartItem`, `removeCartItem`, `clearCartItems`

### Fiyatlandırma
Ürünler için geçerli birim fiyat ve fiyat bilgilerini hesaplar. Fiyat listesi ve kampanya gibi dinamik fiyatlandırma kurallarını değerlendirerek nihai fiyatı belirler.
- `getEffectiveUnitPrice`, `getEffectivePriceInfo`

### Kullanıcı Profil Bilgileri (Adresler ve Fatura Profilleri)
Kullanıcının teslimat/fatura adreslerini ve fatura profillerini yönetir. Varsayılan adres/profil belirleme, CRUD işlemleri ve varsayılan profilleri getirme işlevlerini kapsar.
- `listAddresses`, `createAddress`, `updateAddress`, `deleteAddress`, `setDefaultAddress`
- `listInvoiceProfiles`, `createInvoiceProfile`, `updateInvoiceProfile`, `deleteInvoiceProfile`, `setDefaultInvoiceProfile`, `fetchDefaultInvoiceProfile`

### Proje Yönetimi
Kullanıcıların ürünleri gruplandırarak oluşturduğu projeleri yönetir. Projelere ürün ekleme, çıkarma ve proje öğelerini listeleme işlemlerini kapsar.
- `listUserProjects`, `createProject`, `deleteProject`, `addProductToProject`, `removeProductFromProject`, `listProjectItems`

### Servis Kayıt ve Koordinasyonu
Tüm servislerin merkezi örneklendirilmesini ve uygulama genelinde tutarlı şekilde erişilmesini sağlar. Tek bir Supabase istemcisi üzerinden tüm servis örneklerini oluşturur ve sunar.
- `ServiceRegistry` (constructor)

---

## AXIOMS – Mimari Varsayımlar

Bu modül, tüm servislerin merkezi olarak oluşturulduğu ve erişildiği bir Servis Registry'sidir. Tüm servisler aynı `SupabaseClient`instance'ını paylaşır.

[Aksiyom 1]: Eğer `ServiceRegistry` constructor'a geçilen `supabase` parametresi geçerli ve aktif bir `SupabaseClient<Database>` instance'ı değilse, registry tarafından üretilen tüm servislerin (AddressService, CartService, CategoryService, InvoiceService, PricingService, ProductService, ProjectService) veritabanı işlemleri başarısız olur.

[Aksiyom 2]: Eğer `ServiceRegistry` constructor hiç çağrılmadan servislere erişilmeye çalışılırsa (örn. statik/instance olmadan), tüm servis metodları `undefined` referans hatası ile karşılaşır.

[Aksiyom 3]: Registry'den alınan servis instance'ları arasında `SupabaseClient` bağımlılığı ortaktır; eğer bir servisin içindeki `supabase` bağlantısı koparsa veya geçersizleşirse, yalnızca o servis değil, aynı client'ı paylaşan diğer servisler de etkilenebilir.

---

## FONKSİYON DETAYLARI

### constructor
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

### listAddresses
**Ne yapar**: İlgili kullanıcının tüm kayıtlı adreslerini getirerek bir liste olarak sunar.
**Nasıl yapar**: Asenkron bir fonksiyondur. Sınıf içinde saklanan `supabase` istemcisi referansını kullanarak, aynı isimdeki modül seviyesindeki `listAddresses` yardımcı fonksiyonunu çağırır. Tüm iş mantığı ve veritabanı sorgusu bu dış yardımcı fonksiyonda tanımlıdır; servis metodu sadece bağımlılığı (supabase) iletir.
**Parametreler**: Bu fonksiyon herhangi bir parametre almaz.
**Dönüş**: `Promise<any>` — Fonksiyon asenkron olduğu için bir Promise döner. Dönen değer, yardımcı fonksiyonun sonucuna bağlı olarak adres listesi olacaktır.

### createAddress
**Ne yapar**: Sisteme yeni bir kullanıcı adresi kaydı oluşturur.
**Nasıl yapar**: Asenkron bir fonksiyondur. Sınıf içindeki `supabase` istemcisini ve dışarıdan gelen `payload` verisini alarak, modül seviyesindeki `createAddress` yardımcı fonksiyonunu çağırır. Oluşturma işlemi için gerekli tüm veritabanı ekleme mantığı bu yardımcı fonksiyonda bulunur.
**Parametreler**:
- `payload`: `DbUserAddressInsert` — Oluşturulacak yeni adresin tüm alanlarını içeren veri nesnesi. Veritabanı şemasına uygun, ekleme operasyonuna hazırlık verisi taşır.
**Dönüş**: `Promise<any>` — Asenkron çalışır. Dönen Promise, oluşturulan adresin veritabanı sonucunu (örn: inserted row) içerecektir.

### updateAddress
**Ne yapar**: Belirli bir ID ile tanımlanmış mevcut bir adres kaydını günceller.
**Nasıl yapar**: Asenkron bir fonksiyondur. Verilen `id` ve güncelleme verilerini (`payload`) içeren `updateAddress` yardımcı fonksiyonunu, sınıfın `supabase` istemcisi ile birlikte çağırır. Güncelleme mantığı, hangi alanların değişeceğine dair iş kuralları yardımcı fonksiyon içinde uygulanır.
**Parametreler**:
- `id`: `string` — Güncellenecek adresin benzersiz tanımlayıcısı (ID).
- `payload`: `DbUserAddressUpdate` — Adresin güncellenecek alanlarını içeren veri nesnesi. Mevcut kaydın sadece belirtilen alanlarını değiştirir.
**Dönüş**: `Promise<any>` — Asenkron çalışır. Dönen Promise, güncellenen adresin son halini veya işlem durumunu içerebilir.

### deleteAddress
**Ne yapar**: Verilen ID'ye sahip adresi sistemden kalıcı olarak siler.
**Nasıl yapar**: Asenkron bir fonksiyondur. `id` parametresiyle ve sınıfın `supabase` istemcisiyle birlikte `deleteAddress` yardımcı fonksiyonunu çağırır. Silme işlemi (soft veya hard delete) ve ilgili verit

### setDefaultAddress
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

### constructor
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

### getOrCreateShoppingCart
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

### listCartItems
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

### listCartItemsWithProducts
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

### CartService.upsertCartItem
**Ne yapar**: Sepette belirli bir ürünün var olup olmadığına bakılmaksızın, ürünün sepete eklenmesini veya mevcut ürünün (aynı cartId ve _productId kombinasyonu ile) güncellenmesini sağlar. Bu, sepet CRUD operasyonlarında "create or update" mantığını uygular.

**Nasıl yapar**: Fonksiyon, bağımlılık enjeksiyonu ile alınan `this.supabase` istemcisini ve istemci tarafından sağlanan `payload` nesnesini birincil `upsertCartItem` fonksiyonuna aktarır. Asenkron çalışır ve sonucu doğrudan döndürür.

**Parametreler**:
- `payload`: `{ cartId: string; _productId: string; quantity: number; unitPrice?: number; priceListId?: string }` — Sepet işlemi için gerekli tüm verileri içeren nesne. `cartId` ve `_productId` zorunlu alanlardır; `unitPrice` ve `priceListId` opsiyoneldir.

**Dönüş**: Birincil `upsertCartItem` fonksiyonunun döndürdüğü değer (Promiss döner).

### CartService.removeCartItem
**Ne yapar**: Belirli bir sepetteki (cartId) belirli bir ürünü (productId) silerek sepetten kaldırma işlemini gerçekleştirir. Bu, kullanıcının sepetindeki tek bir kalemi çıkarmak için kullanılır.

**Nasıl yapar**: Fonksiyon, bağımlılık olarak aldığı `this.supabase` istemcisini ve sepetteki ürünü tanımlayan `cartId` ile `productId` parametrelerini birincil `removeCartItem` fonksiyonuna aktarır. Asenkron çalışır ve sonucu doğrudan döndürür.

**Parametreler**:
- `cartId`: `string` — Ürünün kaldırılacağı sepetin benzersiz tanımlayıcısı.
- `productId`: `string` — Sepetten kaldırılacak ürünün benzersiz tanımlayıcısı.

**Dönüş**: Birincil `removeCartItem` fonksiyonunun döndürdüğü değer (Promise döner).

### CartService.clearCartItems
**Ne yapar**: Belirli bir sepetteki tüm ürünleri (kalemleri) tek bir işlemle silerek sepeti tamamen boşaltır. Bu, siparişi tamamlama sonrası veya kullanıcı "sepeti temizle" dediğinde kullanılır.

**Nasıl yapar**: Fonksiyon, bağımlılık olarak aldığı `this.supabase` istemcisini ve temizlenecek sepetin tanımlayıcısı olan `cartId` parametrelerini birincil `clearCartItems` fonksiyonuna aktarır. Asenkron çalışır ve sonucu doğrudan döndürür.

**Parametreler**:
- `cartId`: `string` — Tüm kalemlerin silineceği sepetin benzersiz tanımlayıcısı.

**Dönüş**: Birincil `clearCartItems` fonksiyonunun döndürdüğü değer (Promise döner).

### constructor
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

### CategoryService.getCategories
**Ne yapar**: Sistemde tanımlı tüm ürün kategorilerinin listesini getirir. Arayüzde veya filtrasyon süreçlerinde kullanılmak üzere kategori verilerinin çekilmesini sağlar.

**Nasıl yapar**: Fonksiyon, bağımlılık olarak aldığı `this.supabase` istemcisini birincil `getCategories` fonksiyonuna aktarır. Asenkron çalışır ve kategori listesini (veya ilgili sonucu) doğrudan döndürür.

**Parametreler**: Bu fonksiyonun herhangi bir parametresi yoktur.

**Dönüş**: Birincil `getCategories` fonksiyonunun döndürdüğü değer (Promise döner).

### constructor
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

### InvoiceService.listInvoiceProfiles
**Ne yapar**: Sistemde kayıtlı tüm fatura profillerini (şirket bilgileri, fatura adresleri vb.) listeler. Kullanıcının fatura oluştururken seçebileceği profilleri göstermek için kullanılır.

**Nasıl yapar**: Fonksiyon, bağımlılık olarak aldığı `this.supabase` istemcisini birincil `listInvoiceProfiles` fonksiyonuna aktarır. Asenkron çalışır ve fatura profilleri listesini doğrudan döndürür.

**Parametreler**: Bu fonksiyonun herhangi bir parametresi yoktur.

**Dönüş**: Birincil `listInvoiceProfiles` fonksiyonunun döndürdüğü değer (Promise döner).

### InvoiceService.createInvoiceProfile
**Ne yapar**: Yeni bir fatura profili oluşturarak sistemde kaydetme işlemini başlatır. Kullanıcının şirket adı, vergi numarası, fatura adresi gibi bilgileri girerek yeni bir profil tanımlamasını sağlar.

**Nasıl yapar**: Fonksiyon, bağımlılık olarak aldığı `this.supabase` istemcisini ve istemci tarafından sağlanan `DbInvoiceProfileInsert` türündeki `payload` nesnesini birincil `createInvoiceProfile` fonksiyonuna aktarır. Asenkron çalışır ve oluşturulan profilin sonucunu doğrudan döndürür.

**Parametreler**:
- `payload`: `DbInvoiceProfileInsert` — Oluşturulacak fatura profilinin tüm verilerini içeren insert nesnesi.

**Dönüş**: Birincil `createInvoiceProfile` fonksiyonunun döndürdüğü değer (Promise döner).

### InvoiceService.updateInvoiceProfile
**Ne yapar**: Sistemde mevcut olan belirli bir fatura profilinin (id ile tanımlanan) güncellenmesini sağlar. Kullanıcının profil bilgilerini (adres, vergi numarası vb.) değiştirmesi durumunda kullanılır.

**Nasıl yapar**: Fonksiyon, bağımlılık olarak aldığı `this.supabase` istemcisini, güncellenecek profilin `id` parametresini ve güncellenecek alanları içeren `DbInvoiceProfileUpdate` türündeki `payload` nesnesini birincil `updateInvoiceProfile` fonksiyonuna aktarır. Asenkron çalışır ve güncelleme sonucunu doğrudan döndürür.

**Parametreler**:
- `id`: `string` — Güncellenecek fatura profilinin benzersiz tanımlayıcısı.
- `payload`: `DbInvoiceProfileUpdate` — Güncellenecek alanları içeren partial güncelleme nesnesi.

**Dönüş**: Birincil `updateInvoiceProfile` fonksiyonunun döndürdüğü değer (Promise döner).

### InvoiceService.deleteInvoiceProfile
**Ne yapar**: Sistemde mevcut olan belirli bir fatura profilinin (id ile tanımlanan) silinmesini sağlar. Kullanıcının artık kullanmadığı profil bilgilerini kaldırması durumunda kullanılır.

**Nasıl yapar**: Fonksiyon, bağımlılık olarak aldığı `this.supabase` istemcisini ve silinecek profilin `id` parametresini birincil `deleteInvoiceProfile` fonksiyonuna aktarır. Asenkron çalışır ve silme sonucunu doğrudan döndürür.

**Parametreler**:
- `id`: `string` — Silinecek fatura profilinin benzersiz tanımlayıcısı.

**Dönüş**: Birincil `deleteInvoiceProfile` fonksiyonunun döndürdüğü değer (Promise döner).

### InvoiceService.setDefaultInvoiceProfile

**Ne yapar**: Belirtilen fatura profilini (invoice profile) varsayılan olarak ayarlar. Bu, kullanıcının veya kuruluşun fatura oluştururken otomatik olarak seçilecek profilini belirler.

**Nasıl yapar**: Fonksiyon, sınıf içinde tutulan `this.supabase` bağlantı nesnesini ve verilen `id` parametresini alarak bağımsız `setDefaultInvoiceProfile` fonksiyonuna delege eder. Gerçek veritabanı mantığı dış fonksiyonda yürütülür; bu metot yalnızca bir yönlendirici (delegate) görevi görür.

**Parametreler**:
- `id`: `string` — Varsayılan olarak ayarlanacak fatura profilinin benzersiz tanımlayıcısı (UUID)

**Dönüş**: `Promise<unknown>` — Delegasyon yapılan bağımsız fonksiyonun dönüş değeri doğrudan aktarılır. Başarılı olursa ayarlanan profilin sonucu döner.

### fetchDefaultInvoiceProfile
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

### constructor
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

### getEffectiveUnitPrice
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

### getEffectivePriceInfo
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

### constructor
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

### getProductsEnriched
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

### getSearchSuggestions
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

### ftsSearchProducts
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

### getProducts
**Ne yapar**: Belirli bir sayıda ürünü getirmek için kullanılır. Genellikle ana sayfa veya ürün listeleme sayfalarında sayfalama yaparken son eklenen veya popüler ürünlerden bir alt kümesi sunmak amacıyla tercih edilir.
**Nasıl yapar**: Sınıfın `this.supabase` bağımlılığını ve opsiyonel `limit` parametresini, `getProducts` adlı harici servis fonksiyonuna aktarır. Fonksiyon, veritabanı bağlantısı ve limit değerini kullanarak ilgili sorguyu çalıştırır ve sonucu döndürür.
**Parametreler**:
- limit: `number | undefined` — Getirilecek maksimum ürün sayısını belirtir. Tanımlanmazsa servis fonksiyonunun kendi varsayılan değeri kullanılır.
**Dönüş**: Promise. Verilen kriterlere uyan bir ürün listesi (dizisi) döndürür. Dönüş tipi, harici servis fonksiyonunun tanımına bağlıdır.

### getAllProducts
**Ne yapar**: Veritabanındaki tüm ürünleri getirmek için kullanılır. Ürün yönetimi panelleri, toplu işlem gereken yerler veya tam ürün kataloğunun sunulması gereken durumlar için tasarlanmıştır.
**Nasıl yapar**: Sınıfın `this.supabase` bağımlılığını doğrudan `getAllProducts` adlı harici servis fonksiyonuna iletir. Fonksiyon, herhangi bir filtre veya limit uygulamadan tüm ürün kayıtlarını sorgular.
**Parametreler**: Fonksiyon herhangi bir parametre almaz.
**Dönüş**: Promise. Veritabanındaki tüm ürünleri içeren bir dizi döndürür.

### getProductsByCategory
**Ne yapar**: Belirli bir kategorideki ürünleri getirmek için kullanılır. Kategori bazlı ürün listeleme sayfalarında filtreleme yapmak amacıyla kullanılır.
**Nasıl yapar**: Verilen `categoryId` parametresini ve `this.supabase` bağımlılığını `getProductsByCategory` servis fonksiyonuna aktarır. Servis fonksiyonu, ürünlerin `category_id` alanı üzerinden eşleştirme yaparak ilgili kayıtları getirir.
**Parametreler**:
- categoryId: `string` — Ürünlerin getirileceği kategorinin benzersiz tanımlayıcısı.
**Dönüş**: Promise. Belirtilen kategoriye ait ürünleri içeren bir dizi döndürür.

### getProductsBySubcategory
**Ne yapar**: Belirli bir alt kategorideki ürünleri getirmek için kullanılır. Daha detaylı filtreleme yapılarak kullanıcıların istedikleri ürün türlerine hızla ulaşmasını sağlar.
**Nasıl yapar**: `subcategoryId` parametresini ve `this.supabase` bağımlılığını `getProductsBySubcategory` servis fonksiyonuna iletir. Servis fonksiyonu, ürünlerin `subcategory_id` alanı üzerinden eşleştirme yaparak ilgili kayıtları sorgular.
**Parametreler**:
- subcategoryId: `string` — Ürünlerin getirileceği alt kategorinin benzersiz tanımlayıcısı.
**Dönüş**: Promise. Belirtilen alt kategoriye ait ürünleri içeren bir dizi döndürür.

### getProductById
**Ne yapar**: Ürünün benzersiz veritabanı kimliği (`id`) kullanılarak tek bir ürünü getirmek için kullanılır. Ürün detay sayfaları veya iç referanslar için temel bir erişim methodudur.
**Nasıl yapar**: Verilen `id` parametresini ve `this.supabase` bağımlılığını `getProductById` servis fonksiyonuna aktarır. Servis fonksiyonu, doğrudan bu kimliğe sahip kaydı veritabanından çeker.
**Parametreler**:
- id: `string` — İstenen ürünün veritabanındaki benzersiz tanımlayıcısı.
**Dönüş**: Promise. Belirtilen kimliğe sahip tek bir ürün nesnesi döndürür. Ürün bulunamazsa servis fonksiyonunun davranışına bağlı olarak null veya hata döndürebilir.

### getProductBySlugOrId
**Ne yapar**: Ürünün URL dostu slug'ı veya veritabanı kimliği ile tek bir ürünü getirmek için kullanılır. Esnek bir arama mekanizması sağlar; önce slug ile arar, bulunamazsa ID ile dener.
**Nasıl yapar**: `identifier` parametresini (slug veya ID olabilir) ve `this.supabase` bağımlılığını `getProductBySlugOrId` servis fonksiyonuna iletir. Servis fonksiyonu, birincil olarak slug alanı üzerinden arama yapar; eğer sonuç gelmezse ikincil olarak ID alanı üzerinden sorgulama gerçekleştirir.
**Parametreler**:
- identifier: `string` — Ürünün slug'ı veya veritabanı kimliği olabilen esnek arama parametresi.
**Dönüş**: Promise. Slug veya ID ile eşleşen tek bir ürün nesnesi döndürür.

### getProductBySlug
**Ne yapar**: Ürünün URL dostu slug'ı kullanılarak tek bir ürünü getirmek için kullanılır. SEO uyumlu URL'ler ve kullanıcı dostu ürün sayfaları için temel bir methoddur.
**Nasıl yapar**: Verilen `slug` parametresini ve `this.supabase` bağımlılığını `getProductBySlug` servis fonksiyonuna aktarır. Servis fonksiyonu, ürünlerin `slug` alanı üzerinden eşleştirme yaparak ilgili kaydı getirir.
**Parametreler**:
- slug: `string` — İstenen ürünün URL'de kullanılan benzersiz, okunabilir tanımlayıcısı.
**Dönüş**: Promise. Belirtilen slug'a sahip tek bir ürün nesnesi döndürür.

### getFeaturedProducts
**Ne yapar**: Öne çıkan veya vitrin ürünlerini getirmek için kullanılır. Ana sayfada, promosyon bölümlerinde veya özel kampanya sayfalarında sergilenmek üzere seçilmiş ürünleri sunar.
**Nasıl yapar**: Sınıfın `this.supabase` bağımlılığını `getFeaturedProducts` servis fonksiyonuna iletir. Servis fonksiyonu, öne çıkan ürünleri belirleyen bir iş mantığına (örneğin, `is_featured` alanı true olan kayıtlar) göre veritabanını sorgular.
**Parametreler**: Fonksiyon herhangi bir parametre almaz.
**Dönüş**: Promise. Öne çıkan ürünleri içeren bir dizi döndürür.

### searchProducts
**Ne yapar**: Genel ürün arama işlevi sunar. Kullanıcıların anahtar kelimelerle ürünleri bulmasını sağlar; ürün adı, açıklaması veya diğer metin alanlarında arama yapabilir.
**Nasıl yapar**: `query` parametresini ve `this.supabase` bağımlılığını `searchProducts` servis fonksiyonuna aktarır. Servis fonksiyonu, verilen arama dizesini kullanarak tam metin araması veya LIKE sorguları gibi tekniklerle ilgili ürünleri bulur.
**Parametreler**:
- query: `string` — Arama çubuğuna girilen anahtar kelime veya ifade.
**Dönüş**: Promise. Arama sorgusuyla eşleşen ürünleri içeren bir dizi döndürür.

### adminSearchProducts
**Ne yapar**: Yönetici paneli için gelişmiş veya detaylı ürün arama işlevi sunar. Genellikle daha fazla alan (stok kodu, SKU, barkod vb.) üzerinde arama yapabilir veya farklı filtreler uygulayabilir.
**Nasıl yapar**: `query` parametresini ve `this.supabase` bağımlılığını `adminSearchProducts` servis fonksiyonuna aktarır. Servis fonksiyonu, standart aramaya kıyasla daha geniş bir alan yelpazesinde veya daha karmaşık sorgularla arama gerçekleştirerek yöneticilere kapsamlı sonuçlar sunar.
**Parametreler**:
- query: `string` — Yöneticinin arama kriteri olarak girdiği metin.
**Dönüş**: Promise. Yönetici arama kriterleriyle eşleşen ürünleri içeren bir dizi döndürür.

### constructor
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

### listUserProjects
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

### createProject
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

### deleteProject
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

### addProductToProject
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

### removeProductFromProject
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

### listProjectItems
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

### constructor
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

---

## İTHALATLAR (IMPORTS)
- import: ./category.service::getCategories
- import: @/types/database.types::type { Database }
- import: @/types/database.types::type { TablesInsert }
- import: @/types/db-rows::type { DbInvoiceProfileInsert, DbInvoiceProfileUpdate }
- import: @/types/db-rows::type { DbUserAddressInsert, DbUserAddressUpdate }
- import: @/types/ui-models::type { Product }
- import: @supabase/supabase-js::type { SupabaseClient }

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/lib/services/registry.ts::AddressService.constructor
- **params**: `(supabase: SupabaseClient<Database>)`
- **ic_degiskenler**: `supabase` — Servis için kullanılan Supabase istemcisi, constructor parametresinden alınır
- **Dönüş**: yok

### [N2_NASIL] AST Pointer: src/lib/services/registry.ts::AddressService.listAddresses
- **params**: ()
- **ic_degiskenler**: `this.supabase` — Adres listesini getirmek için kullanılır
- **Dönüş**: `listAddresses(this.supabase)` sonucu döner

### [N3_NASIL] AST Pointer: src/lib/services/registry.ts::AddressService.createAddress
- **params**: `(payload: DbUserAddressInsert)`
- **ic_degiskenler**: 
  - `this.supabase` — Veritabanı bağlantısı
  - `payload` — Yeni adres verisi
- **Dönüş**: `createAddress(this.supabase, payload)` sonucu döner

### [N4_NASIL] AST Pointer: src/lib/services/registry.ts::AddressService.updateAddress
- **params**: `(id: string, payload: DbUserAddressUpdate)`
- **ic_degiskenler**: 
  - `this.supabase` — Veritabanı bağlantısı
  - `id` — Güncellenecek adresin ID'si
  - `payload` — Güncellenme verisi
- **Dönüş**: `updateAddress(this.supabase, id, payload)` sonucu döner

### [N5_NASIL] AST Pointer: src/lib/services/registry.ts::AddressService.deleteAddress
- **params**: `(id: string)`
- **ic_degiskenler**: 
  - `this.supabase` — Veritabanı bağlantısı
  - `id` — Silinecek adresin ID'si
- **Dönüş**: `deleteAddress(this.supabase, id)` sonucu döner

### [N6_NASIL] AST Pointer: src/lib/services/registry.ts::AddressService.setDefaultAddress
- **params**: `(kind: 'shipping' | 'billing', id: string)`
- **ic_degiskenler**: 
  - `this.supabase` — Veritabanı bağlantısı
  - `kind` — Varsayılan adres tipi ('shipping' veya 'billing')
  - `id` — Varsayılan yapılacak adresin ID'si
- **Dönüş**: `setDefaultAddress(this.supabase, kind, id)` sonucu döner

### [N7_NASIL] AST Pointer: src/lib/services/registry.ts::CartService.constructor
- **params**: `(supabase: SupabaseClient<Database>)`
- **ic_degiskenler**: `supabase` — Servis için kullanılan Supabase istemcisi
- **Dönüş**: yok

### [N8_NASIL] AST Pointer: src/lib/services/registry.ts::CartService.getOrCreateShoppingCart
- **params**: `(userId: string)`
- **ic_degiskenler**: 
  - `this.supabase` — Veritabanı bağlantısı
  - `userId` — Kullanıcı ID'si
- **Dönüş**: `getOrCreateShoppingCart(this.supabase, userId)` sonucu döner

### [N9_NASIL] AST Pointer: src/lib/services/registry.ts::CartService.listCartItems
- **params**: `(cartId: string)`
- **ic_degiskenler**: 
  - `this.supabase` — Veritabanı bağlantısı
  - `cartId` — Sepetin ID'si
- **Dönüş**: `listCartItems(this.supabase, cartId)` sonucu döner

### [N10_NASIL] AST Pointer: src/lib/services/registry.ts::CartService.listCartItemsWithProducts
- **params**: `(cartId: string)`
- **ic_degiskenler**: 
  - `this.supabase` — Veritabanı bağlantısı
  - `cartId` — Sepetin ID'si
- **Dönüş**: `listCartItemsWithProducts(this.supabase, cartId)` sonucu döner

### [N11_NASIL] AST Pointer: src/lib/services/registry.ts::CartService.upsertCartItem
- **params**: `(payload: { cartId: string; _productId: string; quantity: number; unitPrice?: number; priceListId?: string })`
- **ic_degiskenler**: 
  - `this.supabase` — Veritabanı bağlantısı
  - `payload` — Sepet kalemi verisi
- **Dönüş**: `upsertCartItem(this.supabase, payload)` sonucu döner

### [N12_NASIL] AST Pointer: src/lib/services/registry.ts::CartService.removeCartItem
- **params**: `(cartId: string, productId: string)`
- **ic_degiskenler**: 
  - `this.supabase` — Veritabanı bağlantısı
  - `cartId` — Sepetin ID'si
  - `productId` — Kaldırılacak ürünün ID'si
- **Dönüş**: `removeCartItem(this.supabase, cartId, productId)` sonucu döner

### [N13_NASIL] AST Pointer: src/lib/services/registry.ts::CartService.clearCartItems
- **params**: `(cartId: string)`
- **ic_degiskenler**: 
  - `this.supabase` — Veritabanı bağlantısı
  - `cartId` — Sepetin ID'si
- **Dönüş**: `clearCartItems(this.supabase, cartId)` sonucu döner

### [N14_NASIL] AST Pointer: src/lib/services/registry.ts::CategoryService.constructor
- **params**: `(supabase: SupabaseClient<Database>)`
- **ic_degiskenler**: `supabase` — Servis için kullanılan Supabase istemcisi
- **Dönüş**: yok

### [N15_NASIL] AST Pointer: src/lib/services/registry.ts::CategoryService.getCategories
- **params**: ()
- **ic_degiskenler**: `this.supabase` — Kategorileri getirmek için kullanılır
- **Dönüş**: `getCategories(this.supabase)` sonucu döner

### [N16_NASIL] AST Pointer: src/lib/services/registry.ts::InvoiceService.constructor
- **params**: `(supabase: SupabaseClient<Database>)`
- **ic_degiskenler**: `supabase` — Servis için kullanılan Supabase istemcisi
- **Dönüş**: yok

### [N17_NASIL] AST Pointer: src/lib/services/registry.ts::InvoiceService.listInvoiceProfiles
- **params**: ()
- **ic_degiskenler**: `this.supabase` — Fatura profillerini getirmek için kullanılır
- **Dönüş**: `listInvoiceProfiles(this.supabase)` sonucu döner

### [N18_NASIL] AST Pointer: src/lib/services/registry.ts::InvoiceService.createInvoiceProfile
- **params**: `(payload: DbInvoiceProfileInsert)`
- **ic_degiskenler**: 
  - `this.supabase` — Veritabanı bağlantısı
  - `payload` — Yeni fatura profili verisi
- **Dönüş**: `createInvoiceProfile(this.supabase, payload)` sonucu döner

### [N19_NASIL] AST Pointer: src/lib/services/registry.ts::InvoiceService.updateInvoiceProfile
- **params**: `(id: string, payload: DbInvoiceProfileUpdate)`
- **ic_degiskenler**: 
  - `this.supabase` — Veritabanı bağlantısı
  - `id` — Güncellenecek fatura profilinin ID'si
  - `payload` — Güncellenme verisi
- **Dönüş**: `updateInvoiceProfile(this.supabase, id, payload)` sonucu döner

### [N20_NASIL] AST Pointer: src/lib/services/registry.ts::InvoiceService.deleteInvoiceProfile
- **params**: `(id: string)`
- **ic_degiskenler**: 
  - `this.supabase` — Veritabanı bağlantısı
  - `id` — Silinecek fatura profilinin ID'si
- **Dönüş**: `deleteInvoiceProfile(this.supabase, id)` sonucu döner

### [N21_NASIL] AST Pointer: src/lib/services/registry.ts::InvoiceService.setDefaultInvoiceProfile
- **params**: `(id: string)`
- **ic_degiskenler**: 
  - `this.supabase` — Veritabanı bağlantısı
  - `id` — Varsayılan yapılacak fatura profilinin ID'si
- **Dönüş**: `setDefaultInvoiceProfile(this.supabase, id)` sonucu döner

### [N22_NASIL] AST Pointer: src/lib/services/registry.ts::InvoiceService.fetchDefaultInvoiceProfile
- **params**: ()
- **ic_degiskenler**: `this.supabase` — Varsayılan fatura profilini getirmek için kullanılır
- **Dönüş**: `fetchDefaultInvoiceProfile(this.supabase)` sonucu döner

### [N23_NASIL] AST Pointer: src/lib/services/registry.ts::PricingService.constructor
- **params**: `(supabase: SupabaseClient<Database>)`
- **ic_degiskenler**: `supabase` — Servis için kullanılan Supabase istemcisi
- **Dönüş**: yok

### [N24_NASIL] AST Pointer: src/lib/services/registry.ts::PricingService.getEffectiveUnitPrice
- **params**: `(product: Product)`
- **ic_degiskenler**: 
  - `this.supabase` — Veritabanı bağlantısı
  - `product` — Fiyatı hesaplanacak ürün
- **Dönüş**: `getEffectiveUnitPrice(this.supabase, product)` sonucu döner

### [N25_NASIL] AST Pointer: src/lib/services/registry.ts::PricingService.getEffectivePriceInfo
- **params**: `(product: Product)`
- **ic_degiskenler**: 
  - `this.supabase` — Veritabanı bağlantısı
  - `product` — Fiyat bilgisi hesaplanacak ürün
- **Dönüş**: `getEffectivePriceInfo(this.supabase, product)` sonucu döner

### [N26_NASIL] AST Pointer: src/lib/services/registry.ts::ProductService.constructor
- **params**: `(supabase: SupabaseClient<Database>)`
- **ic_degiskenler**: `supabase` — Servis için kullanılan Supabase istemcisi
- **Dönüş**: yok

### [N27_NASIL] AST Pointer: src/lib/services/registry.ts::ProductService.getProductsEnriched
- **params**: `(options: Parameters<typeof getProductsEnriched>[1])`
- **ic_degiskenler**: 
  - `this.supabase` — Veritabanı bağlantısı
  - `options` — Zenginleştirilmiş ürünleri getirmek için seçenekler
- **Dönüş**: `getProductsEnriched(this.supabase, options)` sonucu döner

### [N28_NASIL] AST Pointer: src/lib/services/registry.ts::ProductService.getSearchSuggestions
- **params**: `(query: string, limit?: number)`
- **ic_degiskenler**: 
  - `this.supabase` — Veritabanı bağlantısı
  - `query` — Arama sorgusu
  - `limit` — Sonuç limiti (isteğe bağlı)
- **Dönüş**: `getSearchSuggestions(this.supabase, query, limit)` sonucu döner

### [N29_NASIL] AST Pointer: src/lib/services/registry.ts::ProductService.ftsSearchProducts
- **params**: `(term: string, limit?: number)`
- **ic_degiskenler**: 
  - `this.supabase` — Veritabanı bağlantısı
  - `term` — Tam metin arama terimi
  - `limit` — Sonuç limiti (isteğe bağlı)
- **Dönüş**: `ftsSearchProducts(this.supabase, term, limit)` sonucu döner

### [N30_NASIL] AST Pointer: src/lib/services/registry.ts::ProductService.getProducts
- **params**: `(limit?: number)`
- **ic_degiskenler**: 
  - `this.supabase` — Veritabanı bağlantısı
  - `limit` — Getirilecek ürün sayısı (isteğe bağlı)
- **Dönüş**: `getProducts(this.supabase, limit)` sonucu döner

### [N31_NASIL] AST Pointer: src/lib/services/registry.ts::ProductService.getAllProducts
- **params**: ()
- **ic_degiskenler**: `this.supabase` — Tüm ürünleri getirmek için kullanılır
- **Dönüş**: `getAllProducts(this.supabase)` sonucu döner

### [N32_NASIL] AST Pointer: src/lib/services/registry.ts::ProductService.getProductsByCategory
- **params**: `(categoryId: string)`
- **ic_degiskenler**: 
  - `this.supabase` — Veritabanı bağlantısı
  - `categoryId` — Kategori ID'si
- **Dönüş**: `getProductsByCategory(this.supabase, categoryId)` sonucu döner

### [N33_NASIL] AST Pointer: src/lib/services/registry.ts::ProductService.getProductsBySubcategory
- **params**: `(subcategoryId: string)`
- **ic_degiskenler**: 
  - `this.supabase` — Veritabanı bağlantısı
  - `subcategoryId` — Alt kategori ID'si
- **Dönüş**: `getProductsBySubcategory(this.supabase, subcategoryId)` sonucu döner

### [N34_NASIL] AST Pointer: src/lib/services/registry.ts::ProductService.getProductById
- **params**: `(id: string)`
- **ic_degiskenler**: 
  - `this.supabase` — Veritabanı bağlantısı
  - `id` — Ürün ID'si
- **Dönüş**: `getProductById(this.supabase, id)` sonucu döner

### [N35_NASIL] AST Pointer: src/lib/services/registry.ts::ProductService.getProductBySlugOrId
- **params**: `(identifier: string)`
- **ic_degiskenler**: 
  - `this.supabase` — Veritabanı bağlantısı
  - `identifier` — Ürün slug'ı veya ID'si
- **Dönüş**: `getProductBySlugOrId(this.supabase, identifier)` sonucu döner

### [N36_NASIL] AST Pointer: src/lib/services/registry.ts::ProductService.getProductBySlug
- **params**: `(slug: string)`
- **ic_degiskenler**: 
  - `this.supabase` — Veritabanı bağlantısı
  - `slug` — Ürün slug'ı
- **Dönüş**: `getProductBySlug(this.supabase, slug)` sonucu döner

### [N37_NASIL] AST Pointer: src/lib/services/registry.ts::ProductService.getFeaturedProducts
- **params**: ()
- **ic_degiskenler**: `this.supabase` — Öne çıkan ürünleri getirmek için kullanılır
- **Dönüş**: `getFeaturedProducts(this.supabase)` sonucu döner

### [N38_NASIL] AST Pointer: src/lib/services/registry.ts::ProductService.searchProducts
- **params**: `(query: string)`
- **ic_degiskenler**: 
  - `this.supabase` — Veritabanı bağlantısı
  - `query` — Arama sorgusu
- **Dönüş**: `searchProducts(this.supabase, query)` sonucu döner

### [N39_NASIL] AST Pointer: src/lib/services/registry.ts::ProductService.adminSearchProducts
- **params**: `(query: string)`
- **ic_degiskenler**: 
  - `this.supabase` — Veritabanı bağlantısı
  - `query` — Admin arama sorgusu
- **Dönüş**: `adminSearchProducts(this.supabase, query)` sonucu döner

### [N40_NASIL] AST Pointer: src/lib/services/registry.ts::ProjectService.constructor
- **params**: `(supabase: SupabaseClient<Database>)`
- **ic_degiskenler**: `supabase` — Servis için kullanılan Supabase istemcisi
- **Dönüş**: yok

### [N41_NASIL] AST Pointer: src/lib/services/registry.ts::ProjectService.listUserProjects
- **params**: ()
- **ic_degiskenler**: `this.supabase` — Kullanıcı projelerini getirmek için kullanılır
- **Dönüş**: `listUserProjects(this.supabase)` sonucu döner

### [N42_NASIL] AST Pointer: src/lib/services/registry.ts::ProjectService.createProject
- **params**: `(project: TablesInsert<'user_projects'>)`
- **ic_degiskenler**: 
  - `this.supabase` — Veritabanı bağlantısı
  - `project` — Yeni proje verisi
- **Dönüş**: `createProject(this.supabase, project)` sonucu döner

### [N43_NASIL] AST Pointer: src/lib/services/registry.ts::ProjectService.deleteProject
- **params**: `(id: string)`
- **ic_degiskenler**: 
  - `this.supabase` — Veritabanı bağlantısı
  - `id` — Silinecek projenin ID'si
- **Dönüş**: `deleteProject(this.supabase, id)` sonucu döner

### [N44_NASIL] AST Pointer: src/lib/services/registry.ts::ProjectService.addProductToProject
- **params**: `(projectId: string, productId: string, quantity?: number)`
- **ic_degiskenler**: 
  - `this.supabase` — Veritabanı bağlantısı
  - `projectId` — Proje ID'si
  - `productId` — Eklenecek ürünün ID'si
  - `quantity` — Miktar (isteğe bağlı)
- **Dönüş**: `addProductToProject(this.supabase, projectId, productId, quantity)` sonucu döner

### [N45_NASIL] AST Pointer: src/lib/services/registry.ts::ProjectService.removeProductFromProject
- **params**: `(projectId: string, productId: string)`
- **ic_degiskenler**: 
  - `this.supabase` — Veritabanı bağlantısı
  - `projectId` — Proje ID'si
  - `productId` — Kaldırılacak ürünün ID'si
- **Dönüş**: `removeProductFromProject(this.supabase, projectId, productId)` sonucu döner

### [N46_NASIL] AST Pointer: src/lib/services/registry.ts::ProjectService.listProjectItems
- **params**: `(projectId: string)`
- **ic_degiskenler**: 
  - `this.supabase` — Veritabanı bağlantısı
  - `projectId` — Proje ID'si
- **Dönüş**: `listProjectItems(this.supabase, projectId)` sonucu döner

### [N47_NASIL] AST Pointer: src/lib/services/registry.ts::ServiceRegistry.constructor
- **params**: `(supabase: SupabaseClient<Database>)`
- **ic_degiskenler**: 
  - `supabase` — Tüm servisler için kullanılan Supabase istemcisi
  - `this.address` — AddressService örneği
  - `this.cart` — CartService örneği
  - `this.category` — CategoryService örneği
  - `this.invoice` — InvoiceService örneği
  - `this.pricing` — PricingService örneği
  - `this.product` — ProductService örneği
  - `this.project` — ProjectService örneği
- **Dönüş**: yok

---


## MERMAID CALL GRAPH
```mermaid
graph TD
    registry_ts__addProductToProject["addProductToProject"]
    registry_ts__adminSearchProducts["adminSearchProducts"]
    registry_ts__clearCartItems["clearCartItems"]
    registry_ts__constructor["constructor"]
    registry_ts__createAddress["createAddress"]
    registry_ts__createInvoiceProfile["createInvoiceProfile"]
    registry_ts__createProject["createProject"]
    registry_ts__deleteAddress["deleteAddress"]
    registry_ts__deleteInvoiceProfile["deleteInvoiceProfile"]
    registry_ts__deleteProject["deleteProject"]
    registry_ts__fetchDefaultInvoiceProfile["fetchDefaultInvoiceProfile"]
    registry_ts__ftsSearchProducts["ftsSearchProducts"]
    registry_ts__getAllProducts["getAllProducts"]
    registry_ts__getCategories["getCategories"]
    registry_ts__getEffectivePriceInfo["getEffectivePriceInfo"]
    registry_ts__getEffectiveUnitPrice["getEffectiveUnitPrice"]
    registry_ts__getFeaturedProducts["getFeaturedProducts"]
    registry_ts__getOrCreateShoppingCart["getOrCreateShoppingCart"]
    registry_ts__getProductById["getProductById"]
    registry_ts__getProductBySlug["getProductBySlug"]
    registry_ts__getProductBySlugOrId["getProductBySlugOrId"]
    registry_ts__getProducts["getProducts"]
    registry_ts__getProductsByCategory["getProductsByCategory"]
    registry_ts__getProductsBySubcategory["getProductsBySubcategory"]
    registry_ts__getProductsEnriched["getProductsEnriched"]
    registry_ts__getSearchSuggestions["getSearchSuggestions"]
    registry_ts__listAddresses["listAddresses"]
    registry_ts__listCartItems["listCartItems"]
    registry_ts__listCartItemsWithProducts["listCartItemsWithProducts"]
    registry_ts__listInvoiceProfiles["listInvoiceProfiles"]
    registry_ts__listProjectItems["listProjectItems"]
    registry_ts__listUserProjects["listUserProjects"]
    registry_ts__removeCartItem["removeCartItem"]
    registry_ts__removeProductFromProject["removeProductFromProject"]
    registry_ts__searchProducts["searchProducts"]
    registry_ts__setDefaultAddress["setDefaultAddress"]
    registry_ts__setDefaultInvoiceProfile["setDefaultInvoiceProfile"]
    registry_ts__updateAddress["updateAddress"]
    registry_ts__updateInvoiceProfile["updateInvoiceProfile"]
    registry_ts__upsertCartItem["upsertCartItem"]
```

## NODE ID STANDARD

  file: src\lib\services\registry.ts
  class: src\lib\services\registry.ts::AddressService
  class: src\lib\services\registry.ts::CartService
  class: src\lib\services\registry.ts::CategoryService
  class: src\lib\services\registry.ts::InvoiceService
  class: src\lib\services\registry.ts::PricingService
  class: src\lib\services\registry.ts::ProductService
  class: src\lib\services\registry.ts::ProjectService
  class: src\lib\services\registry.ts::ServiceRegistry

---

## DISA AKTARILANLAR (EXPORTS)
  export: AddressService
  export: CartService
  export: CategoryService
  export: InvoiceService
  export: PricingService
  export: ProductService
  export: ProjectService
  export: ServiceRegistry

---

## BILEŞIM (CONTAINS)
  contains: AddressService
  contains: CartService
  contains: CategoryService
  contains: InvoiceService
  contains: PricingService
  contains: ProductService
  contains: ProjectService