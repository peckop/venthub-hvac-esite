---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\lib\services\registry.ts
skeleton_hash: ead5959635a07f48
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
generated_at: 2026-06-08T10:10:57Z
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
**Ne yapar**: `ServiceRegistry` sınıfının başlatıcısı olarak görev yapar ve bağımlılık enjeksiyonunu gerçekleştirir.
**Nasıl yapar**: Sınıfın private bir üyesi olan `supabase` nesnesini, verilen `SupabaseClient` örneğiyle başlatır. Bu, sınıfın tüm metodlarının Veritabanı bağlantısını kullanmasını sağlar.
**Parametreler**:
- supabase: SupabaseClient<Database> — Servislerin kullanacağı Supabase istemcisi nesnesi.
**Dönüş**: Belirtilmemiş (constructor fonksiyonları bir şey döndürmez).

### listAddresses
**Ne yapar**: Bir kullanıcının tüm adreslerini listeler.
**Nasıl yapar**: Asenkron olarak çalışır ve sınıfın içindeki `supabase` nesnesini kullanarak dışarıda tanımlanmış `listAddresses` fonksiyonunu çağırır. Bu çağrı, Veritabanından adres kayıtlarını alıp bir liste olarak döndürür.
**Parametreler**: Yok.
**Dönüş**: Promise (belirtilmemiş, ancak async fonksiyon olduğu için bir Promise döndürür; içeriği dışarıda tanımlı `listAddresses` fonksiyonuna bağlıdır).

### createAddress
**Ne yapar**: Yeni bir kullanıcı adresi oluşturur.
**Nasıl yapar**: Asenkron bir işlemdir. Verilen `payload` verisini ve `supabase` bağlantısını kullanarak, dışarıda tanımlanmış `createAddress` fonksiyonunu çağırır. Bu fonksiyon, Veritabanına yeni bir adres kaydı ekler.
**Parametreler**:
- payload: DbUserAddressInsert — Oluşturulacak adresin verilerini içeren nesne.
**Dönüş**: Promise (dışarıda tanımlı `createAddress` fonksiyonunun dönüşüne bağlıdır).

### updateAddress
**Ne yapar**: Belirli bir ID'ye sahip mevcut bir adresi günceller.
**Nasıl yapar**: Asenkron bir işlemdir. Verilen `id` ve `payload` parametrelerini alarak, `supabase` bağlantısıyla dışarıda tanımlanmış `updateAddress` fonksiyonunu çağırır. Bu, Veritabanındaki ilgili adres kaydının güncellenmesini sağlar.
**Parametreler**:
- id: string — Güncellenecek adresin benzersiz tanımlayıcısı.
- payload: DbUserAddressUpdate — Adresin güncellenecek alanlarını içeren nesne.
**Dönüş**: Promise (dışarıda tanımlı `updateAddress` fonksiyonunun dönüşüne bağlıdır).

### deleteAddress
**Ne yapar**: Belirli bir ID'ye sahip bir adresi siler.
**Nasıl yapar**: Asenkron bir işlemdir. Verilen `id` ile `supabase` bağlantısını kullanarak, dışarıda tanımlanmış `deleteAddress` fonksiyonunu çağırır. Bu işlem, Veritabanından ilgili adres kaydının silinmesini tetikler.
**Parametreler**:
- id: string — Silinecek adresin benzersiz tanımlayıcısı.
**Dönüş**: Promise (dışarıda tanımlı `deleteAddress` fonksiyonunun dönüşüne bağlıdır).

### setDefaultAddress
**Ne yapar**: Belirtilen türde (gönderi veya fatura) bir adresi varsayılan olarak ayarlar.
**Nasıl yapar**: Asenkron bir işlemdir. `kind` parametresiyle adres türünü (shipping veya billing) belirler ve `id` ile hangi adresin varsayılan yapılacağını söyler. `supabase` bağlantısıyla dışarıda tanımlanmış `setDefaultAddress` fonksiyonunu çağırarak Veritabanında ilgili güncellemeyi yapar.
**Parametreler**:
- kind: 'shipping' | 'billing' — Ayarlanacak varsayılan adresin türü.
- id: string — Varsayılan olarak ayarlanacak adresin benzersiz tanımlayıcısı.
**Dönüş**: Promise (dışarıda tanımlı `setDefaultAddress` fonksiyonunun dönüşüne bağlıdır).

### constructor
**Ne yapar**: `ServiceRegistry` sınıfının başlatıcısı olarak görev yapar ve bağımlılık enjeksiyonunu gerçekleştirir.
**Nasıl yapar**: Sınıfın private bir üyesi olan `supabase` nesnesini, verilen `SupabaseClient` örneğiyle başlatır. Bu, sınıfın tüm metodlarının Veritabanı bağlantısını kullanmasını sağlar.
**Parametreler**:
- supabase: SupabaseClient<Database> — Servislerin kullanacağı Supabase istemcisi nesnesi.
**Dönüş**: Belirtilmemiş (constructor fonksiyonları bir şey döndürmez).

### getOrCreateShoppingCart
**Ne yapar**: Belirli bir kullanıcıya ait alışveriş sepetini getirir; eğer yoksa yeni bir tane oluşturur.
**Nasıl yapar**: Asenkron bir işlemdir. Verilen `userId` ile `supabase` bağlantısını kullanarak, dışarıda tanımlanmış `getOrCreateShoppingCart` fonksiyonunu çağırır. Bu fonksiyon, Veritabanında kullanıcıya ait bir sepet arar, bulamazsa yeni bir tane oluşturur ve sepet nesnesini döndürür.
**Parametreler**:
- userId: string — Sepeti oluşturulacak veya getirilecek kullanıcının benzersiz tanımlayıcısı.
**Dönüş**: Promise (dışarıda tanımlı `getOrCreateShoppingCart` fonksiyonunun dönüşüne bağlıdır).

### listCartItems
**Ne yapar**: Belirli bir sepetteki ürünleri (satır kalemlerini) listeler.
**Nasıl yapar**: Asenkron bir işlemdir. Verilen `cartId` ile `supabase` bağlantısını kullanarak, dışarıda tanımlanmış `listCartItems` fonksiyonunu çağırır. Bu fonksiyon, Veritabanından ilgili sepete ait tüm kalemleri alır ve bir liste olarak döndürür.
**Parametreler**:
- cartId: string — Ürünleri listelenecek sepetin benzersiz tanımlayıcısı.
**Dönüş**: Promise (dışarıda tanımlı `listCartItems` fonksiyonunun dönüşüne bağlıdır).

### listCartItemsWithProducts
**Ne yapar**: Belirli bir sepetteki ürünleri, ürün detaylarıyla birlikte (ilişkili ürün bilgilerini de dahil ederek) listeler.
**Nasıl yapar**: Asenkron bir işlemdir. Verilen `cartId` ile `supabase` bağlantısını kullanarak, dışarıda tanımlanmış `listCartItemsWithProducts` fonksiyonunu çağırır. Bu fonksiyon, sepet kalemlerini alır ve her kalemle ilişkili ürün bilgilerini de getirerek zenginleştirilmiş bir liste sunar.
**Parametreler**:
- cartId: string — Ürün detaylarıyla birlikte listelenecek sepetin benzersiz tanımlayıcısı.
**Dönüş**: Promise (dışarıda tanımlı `listCartItemsWithProducts` fonksiyonunun dönüşüne bağlıdır).

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
**Ne yapar**: Varsayılan fatura profilini getirir. Bu fonksiyon, InvoiceService sınıfı tarafından çağrılmaktadır ve Supabase istemcisini kullanarak varsayılan fatura profilini veritabanından çeker.

**Nasıl yapar**: Fonksiyon, InvoiceService sınıfının bir metodu olarak tanımlanmıştır. Sınıf içinde tanımlı olan `this.supabase` istemcisini alır ve harici bir fonksiyon olan `fetchDefaultInvoiceProfile`'a parametre olarak geçirir. Bu sayede fatura profilinin getirme işlemi harici modülden bağımsız olarak gerçekleştirilir.

**Parametreler**:
Bu fonksiyon herhangi bir parametre almaz.

**Dönüş**: `Promise<any>` — Varsayılan fatura profilini içeren bir nesne veya promise döndürür. Kesin dönüş tipi harici `fetchDefaultInvoiceProfile` fonksiyonunun tanımına bağlıdır.

### constructor
**Ne yapar**: ServiceRegistry sınıfının kurucu metodudur ve sınıf örneği oluşturulurken Supabase istemcisini bağımlılık olarak enjekte eder.

**Nasıl yapar**: TypeScript'in private alan sözdizimini kullanarak `supabase` parametresini sınıfın özel bir üyesine dönüştürür. Bu sayede sınıfın tüm metotları, veritabanı bağlantısını bu ortak `this.supabase` referansı üzerinden erişebilir.

**Parametreler**:
- supabase: SupabaseClient<Database> — Veritabanı bağlantısı için kullanılan Supabase istemci nesnesi. Database türü, veritabanı şemasını temsil eder.

**Dönüş**: void — Kurucu metodlar dönüş değeri döndürmez.

### getEffectiveUnitPrice
**Ne yapar**: Belirli bir ürün için geçerli birim fiyatı hesaplar veya getirir. Bu fonksiyon, PricingService sınıfı tarafından çağrılmaktadır.

**Nasıl yapar**: Fonksiyon, PricingService sınıfının bir metodu olarak çalışır. Sınıf içinde tanımlı olan `this.supabase` istemcisini ve parametre olarak gelen `product` nesnesini alır. Ardından harici bir fonksiyon olan `getEffectiveUnitPrice`'a bu parametreleri geçirerek birim fiyat hesaplama işlemini gerçekleştirir.

**Parametreler**:
- product: Product — Fiyatı hesaplanacak olan ürün nesnesi. Ürün bilgilerini içeren bir yapıya sahiptir.

**Dönüş**: `Promise<number>` veya `Promise<{ unitPrice: number; ... }>` — Geçerli birim fiyatı veya birim fiyat bilgisini içeren bir promise döndürür. Kesin dönüş yapısı harici `getEffectiveUnitPrice` fonksiyonunun tanımına bağlıdır.

### getEffectivePriceInfo
**Ne yapar**: Belirli bir ürün için geçerli fiyat bilgilerini (birim fiyat, indirimler, vergiler vb. içerebilecek detaylı bilgi) getirir.

**Nasıl yapar**: Fonksiyon, PricingService sınıfının bir metodu olarak tanımlanmıştır. Sınıfın `this.supabase` istemcisini ve parametre olarak gelen `product` nesnesini alır. Bu bilgileri harici bir fonksiyon olan `getEffectivePriceInfo`'a geçirerek detaylı fiyat bilgisini hesaplar veya getirir.

**Parametreler**:
- product: Product — Fiyat bilgisi hesaplanacak olan ürün nesnesi. Ürünün tüm özelliklerini içerebilir.

**Dönüş**: `Promise<PriceInfo>` veya benzeri bir yapı — Geçerli fiyat bilgisini (birim fiyat, olası indirimler, toplam maliyet gibi detayları) içeren bir promise döndürür. Kesin dönüş yapısı harici `getEffectivePriceInfo` fonksiyonunun tanımına bağlıdır.

### constructor
**Ne yapar**: ServiceRegistry sınıfının kurucu metodudur ve sınıf örneği oluşturulurken Supabase istemcisini bağımlılık olarak enjekte eder.

**Nasıl yapar**: TypeScript'in private alan sözdizimini kullanarak `supabase` parametresini sınıfın özel bir üyesine dönüştürür. Bu sayede sınıfın tüm metotları, veritabanı bağlantısını bu ortak `this.supabase` referansı üzerinden erişebilir.

**Parametreler**:
- supabase: SupabaseClient<Database> — Veritabanı bağlantısı için kullanılan Supabase istemci nesnesi. Database türü, veritabanı şemasını temsil eder.

**Dönüş**: void — Kurucu metodlar dönüş değeri döndürmez.

### getProductsEnriched
**Ne yapar**: Ürünleri zenginleştirilmiş (enriched) bir şekilde getirir. Bu, ürünlerin ilişkili verilerle (kategoriler, tedarikçiler, fiyatlar vb.) birlikte getirildiği anlamına gelir.

**Nasıl yapar**: Fonksiyon, ProductService sınıfının bir metodu olarak çalışır. Sınıfın `this.supabase` istemcisini ve parametre olarak gelen `options` nesnesini alır. Bu options nesnesi, harici `getProductsEnriched` fonksiyonunun ikinci parametresinin türüyle aynı yapıya sahiptir (örneğin filtreleme, sıralama, sayfalama seçenekleri). Fonksiyon bu parametreleri kullanarak veritabanından ilişkisel verilerle zenginleştirilmiş ürün listesini çeker.

**Parametreler**:
- options: Parameters<typeof getProductsEnriched>[1] — Ürün getirme işlemini yapılandıran seçenekler nesnesi. Harici fonksiyonun ikinci parametresinin türüyle aynı yapıya sahiptir. Filtreleme, sıralama, sayfalama gibi seçenekleri içerebilir.

**Dönüş**: `Promise<Product[]>` veya `Promise<EnrichedProduct[]>` — Zenginleştirilmiş ürün listesini içeren bir promise döndürür. Her ürün, ilişkili verilerle birlikte gelir.

### getSearchSuggestions
**Ne yapar**: Kullanıcıların arama yaparken öneriler almasını sağlar. Belirli bir arama sorgusuna göre ürün adı veya açıklamasında eşleşen önerileri getirir.

**Nasıl yapar**: Fonksiyon, ProductService sınıfının bir metodu olarak tanımlanmıştır. Sınıfın `this.supabase` istemcisini, arama sorgusunu (`query`) ve opsiyonel olarak limit parametresini alır. Bu bilgileri harici bir fonksiyon olan `getSearchSuggestions`'a geçirerek arama önerilerini getirir.

**Parametreler**:
- query: string — Arama önerileri için kullanılacak olan arama sorgusu/metni.
- limit?: number — Opsiyonel. Getirilecek maksimum öneri sayısını belirtir. Belirtilmezse varsayılan bir değer kullanılır.

**Dönüş**: `Promise<string[]>` veya `Promise<Suggestion[]>` — Arama sorgusuyla eşleşen ürün adı veya açıklama önerilerini içeren bir promise döndürür.

### ftsSearchProducts
**Ne yapar**: Tam metin araması (Full Text Search) kullanarak ürünleri arar. Bu, veritabanının tam metin arama özelliklerini kullanarak daha gelişmiş ve hızlı arama yapar.

**Nasıl yapar**: Fonksiyon, ProductService sınıfının bir metodu olarak çalışır. Sınıfın `this.supabase` istemcisini, arama terimini (`term`) ve opsiyonel olarak limit parametresini alır. Bu parametreleri harici bir fonksiyon olan `ftsSearchProducts`'a geçirerek tam metin araması yapar.

**Parametreler**:
- term: string — Tam metin araması yapılacak olan arama terimi/metni.
- limit?: number — Opsiyonel. Getirilecek maksimum sonuç sayısını belirtir.

**Dönüş**: `Promise<Product[]>` — Tam metin aramasıyla eşleşen ürün listesini içeren bir promise döndürür.

### getProducts
**Ne yapar**: Ürünleri belirli bir limit dahilinde getirir. Basit bir ürün listeleme fonksiyonudur.

**Nasıl yapar**: Fonksiyon, ProductService sınıfının bir metodu olarak tanımlanmıştır. Sınıfın `this.supabase` istemcisini ve opsiyonel olarak limit parametresini alır. Bu bilgileri harici bir fonksiyon olan `getProducts`'a geçirerek veritabanından ürünleri çeker.

**Parametreler**:
- limit?: number — Opsiyonel. Getirilecek maksimum ürün sayısını belirtir. Belirtilmezse tüm ürünler getirilebilir veya varsayılan bir limit kullanılabilir.

### getAllProducts
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

### getProductsByCategory
**Ne yapar**: Belirli bir kategoriye ait tüm ürünleri getirir.
**Nasıl yapar**: Verilen `categoryId` parametresini ve bağımlılık olarak enjekte edilen `this.supabase` istemcisini, iş mantığını içeren ayrı bir `getProductsByCategory` yardımcı fonksiyonuna iletir.
**Parametreler**:
- categoryId: `string` — Ürünlerin getirileceği kategorinin benzersiz tanımlayıcısıdır.
**Dönüş**: `Promise` — İlgili kategorideki ürünleri içeren bir veri dizisi veya Promise çözücüleri tarafından belirlenen belirli bir yapı.

### getProductsBySubcategory
**Ne yapar**: Belirli bir alt kategoriye ait tüm ürünleri getirir.
**Nasıl yapar**: Verilen `subcategoryId` parametresini ve bağımlılık olarak enjekte edilen `this.supabase` istemcisini, iş mantığını içeren ayrı bir `getProductsBySubcategory` yardımcı fonksiyonuna iletir.
**Parametreler**:
- subcategoryId: `string` — Ürünlerin getirileceği alt kategorinin benzersiz tanımlayıcısıdır.
**Dönüş**: `Promise` — İlgili alt kategorideki ürünleri içeren bir veri dizisi veya Promise çözücüleri tarafından belirlenen belirli bir yapı.

### getProductById
**Ne yapar**: Benzersiz kimliğe (ID) göre tek bir ürünü getirir.
**Nasıl yapar**: Verilen `id` parametresini ve bağımlılık olarak enjekte edilen `this.supabase` istemcisini, iş mantığını içeren ayrı bir `getProductById` yardımcı fonksiyonuna iletir.
**Parametreler**:
- id: `string` — İstenen ürünün benzersiz tanımlayıcısıdır.
**Dönüş**: `Promise` — Belirtilen ID'ye sahip ürünü temsil eden bir nesne veya null/undefined (bulunamazsa).

### getProductBySlugOrId
**Ne yapar**: Bir ürünün URL-uyumlu kısa adı (slug) veya benzersiz kimliği (ID) ile getirir; her iki alanı da destekleyen esnek bir arama sunar.
**Nasıl yapar**: Verilen `identifier` parametresini (bir slug veya ID olabilir) ve bağımlılık olarak enjekte edilen `this.supabase` istemcisini, iş mantığını içeren ayrı bir `getProductBySlugOrId` yardımcı fonksiyonuna iletir.
**Parametreler**:
- identifier: `string` — Aranacak ürünün slug'ı veya ID'si olabilir.
**Dönüş**: `Promise` — Belirtilen tanımlayıcıya eşleşen ürünü temsil eden bir nesne veya null/undefined.

### getProductBySlug
**Ne yapar**: URL-uyumlu kısa adı (slug) verilen tek bir ürünü getirir.
**Nasıl yapar**: Verilen `slug` parametresini ve bağımlılık olarak enjekte edilen `this.supabase` istemcisini, iş mantığını içeren ayrı bir `getProductBySlug` yardımcı fonksiyonuna iletir.
**Parametreler**:
- slug: `string` — İstenen ürünün URL'de kullanılan kısa adıdır.
**Dönüş**: `Promise` — Belirtilen slug'a sahip ürünü temsil eden bir nesne veya null/undefined.

### getFeaturedProducts
**Ne yapar**: Öne çıkan veya vitrin ürünleri olarak belirlenmiş tüm ürünleri getirir.
**Nasıl yapar**: Parametre almaz; sadece bağımlılık olarak enjekte edilen `this.supabase` istemcisini, iş mantığını içeren ayrı bir `getFeaturedProducts` yardımcı fonksiyonuna iletir.
**Parametreler**: Yok.
**Dönüş**: `Promise` — Öne çıkan ürünleri içeren bir veri dizisi.

### searchProducts
**Ne yapar**: Genel kullanıcılara yönelik ürün araması yapar; ürün adı, açıklaması vb. alanlarda eşleşmeler döndürür.
**Nasıl yapar**: Verilen `query` (arama sorgusu) parametresini ve bağımlılık olarak enjekte edilen `this.supabase` istemcisini, iş mantığını içeren ayrı bir `searchProducts` yardımcı fonksiyonuna iletir.
**Parametreler**:
- query: `string` — Kullanıcının arama kutusuna girdiği anahtar kelime veya cümle.
**Dönüş**: `Promise` — Arama sorgusuyla eşleşen ürünleri içeren bir veri dizisi.

### adminSearchProducts
**Ne yapar**: Yönetici paneli için gelişmiş veya filtrelenmiş ürün araması yapar; muhtemelen daha fazla alan (stok kodu, SKU vb.) veya durum (yayında, taslak) içerebilir.
**Nasıl yapar**: Verilen `query` (arama sorgusu) parametresini ve bağımlılık olarak enjekte edilen `this.supabase` istemcisini, iş mantığını içeren ayrı bir `adminSearchProducts` yardımcı fonksiyonuna iletir.
**Parametreler**:
- query: `string` — Yöneticinin arama kutusuna girdiği anahtar kelime veya cümle.
**Dönüş**: `Promise` — Yönetici arama sorgusuyla eşleşen ürünleri içeren bir veri dizisi.

### constructor
**Ne yapar**: ServiceRegistry sınıfının yapıcı metodudur ve bağımlılık enjeksiyonu ile bir Supabase istemcisini servislerin kullanımına hazırlar.
**Nasıl yapar**: Private bir `supabase` özelliğini başlatır; bu istemci, servislerin tüm veritabanı işlemleri için kullanılacak olan merkezi bağlantı nesnesidir.
**Parametreler**:
- supabase: `SupabaseClient<Database>` — Servislerin kullanacağı, veritabanı bağlantı ve sorgulama işlemlerini yürüten Supabase istemcisidir.
**Dönüş**: void (Geri dönüş değeri yoktur; sadece sınıf durumunu başlatır.)

### listUserProjects
**Ne yapar**: Oturum açmış kullanıcının projelerini listeler.
**Nasıl yapar**: Bağımlılık olarak enjekte edilen `this.supabase` istemcisini, iş mantığını içeren ayrı bir `listUserProjects` yardımcı fonksiyonuna iletir.
**Parametreler**: Yok (Kullanıcı kimliği muhtemelen oturum veya Supabase istemcisi içindeki mevcut bağlamdan alınır).
**Dönüş**: `Promise` — İlgili kullanıcıya ait projeleri içeren bir veri dizisi.

### createProject
**Ne yapar**: Yeni bir kullanıcı projesi oluşturur ve veritabanına kaydeder. Kullanıcıların HVAC projelerini başlatmasını sağlayan temel işlevdir.

**Nasıl yapar**: `this.supabase` client'ını kullanarak `user_projects` tablosuna yeni bir kayıt ekler. Oluşturulacak projenin tüm verileri `TablesInsert<'user_projects'>` tipinde parametre olarak alınır ve doğrudan Supabase'in insert metoduna iletilir.

**Parametreler**:
- `project`: `TablesInsert<'user_projects'>` — Oluşturulacak projenin tüm verilerini içeren nesne. Proje adı, açıklama, kullanıcı ID'si gibi alanları barındırır.

**Dönüş**: Oluşturulan proje kaydının bilgilerini içeren bir yanıt döner. Başarı durumunda yeni oluşturulan projenin verileri, hata durumunda hata bilgisi döner.

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

## AST POINTERS

### [N1_NASIL] AST Pointer: src/lib/services/registry.ts::AddressService.constructor
- **params**: `(supabase: SupabaseClient<Database>)`
- **ic_degiskenler**:
  - `supabase` — Bu servise ait Supabase istemci referansı, sınıf field'ına atanır
- **Dönüş**: yok (constructor)

### [N2_NASIL] AST Pointer: src/lib/services/registry.ts::AddressService.listAddresses
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `this.supabase` — AddressService'in constructor'dan aldığı Supabase istemcisi, bağımsız fonksiyona aktarılır
- **Dönüş**: `listAddresses(this.supabase)` — bağımsız `listAddresses` fonksiyonunun dönüş değeni (adres listesi)

### [N3_NASIL] AST Pointer: src/lib/services/registry.ts::AddressService.createAddress
- **params**: `(payload: DbUserAddressInsert)`
- **ic_degiskenler**:
  - `this.supabase` — Supabase istemcisi, bağımsız fonksiyona aktarılır
  - `payload` — Oluşturulacak adres verisi, DB insert tipinde
- **Dönüş**: `createAddress(this.supabase, payload)` — bağımsız fonksiyonun dönüşü (oluşturulan adres)

### [N4_NASIL] AST Pointer: src/lib/services/registry.ts::AddressService.updateAddress
- **params**: `(id: string, payload: DbUserAddressUpdate)`
- **ic_degiskenler**:
  - `this.supabase` — Supabase istemcisi
  - `id` — Güncellenecek adresin UUID'si
  - `payload` — Güncellenecek alanları içeren DB update nesnesi
- **Dönüş**: `updateAddress(this.supabase, id, payload)` — bağımsız fonksiyonun dönüşü (güncellenen adres)

### [N5_NASIL] AST Pointer: src/lib/services/registry.ts::AddressService.deleteAddress
- **params**: `(id: string)`
- **ic_degiskenler**:
  - `this.supabase` — Supabase istemcisi
  - `id` — Silinecek adresin UUID'si
- **Dönüş**: `deleteAddress(this.supabase, id)` — bağımsız fonksiyonun dönüşü (silme sonucu)

### [N6_NASIL] AST Pointer: src/lib/services/registry.ts::AddressService.setDefaultAddress
- **params**: `(kind: 'shipping' | 'billing', id: string)`
- **ic_degiskenler**:
  - `this.supabase` — Supabase istemcisi
  - `kind` — Varsayılan adres türü: 'shipping' veya 'billing'
  - `id` — Varsayılan olarak ayarlanacak adresin UUID'si
- **Dönüş**: `setDefaultAddress(this.supabase, kind, id)` — bağımsız fonksiyonun dönüşü

### [N7_NASIL] AST Pointer: src/lib/services/registry.ts::CartService.constructor
- **params**: `(supabase: SupabaseClient<Database>)`
- **ic_degiskenler**:
  - `supabase` — CartService'e ait Supabase istemci referansı
- **Dönüş**: yok (constructor)

### [N8_NASIL] AST Pointer: src/lib/services/registry.ts::CartService.getOrCreateShoppingCart
- **params**: `(userId: string)`
- **ic_degiskenler**:
  - `this.supabase` — Supabase istemcisi
  - `userId` — Kullanıcının UUID'si, alışveriş sepeti bulmak veya oluşturmak için kullanılır
- **Dönüş**: `getOrCreateShoppingCart(this.supabase, userId)` — mevcut veya yeni oluşturulmuş sepet

### [N9_NASIL] AST Pointer: src/lib/services/registry.ts::CartService.listCartItems
- **params**: `(cartId: string)`
- **ic_degiskenler**:
  - `this.supabase` — Supabase istemcisi
  - `cartId` — Sepetin UUID'si
- **Dönüş**: `listCartItems(this.supabase, cartId)` — sepet öğeleri listesi

### [N10_NASIL] AST Pointer: src/lib/services/registry.ts::CartService.listCartItemsWithProducts
- **params**: `(cartId: string)`
- **ic_degiskenler**:
  - `this.supabase` — Supabase istemcisi
  - `cartId` — Sepetin UUID'si
- **Dönüş**: `listCartItemsWithProducts(this.supabase, cartId)` — ürün bilgileri zenginleştirilmiş sepet öğeleri

### [N11_NASIL] AST Pointer: src/lib/services/registry.ts::CartService.upsertCartItem
- **params**: `(payload: { cartId: string; _productId: string; quantity: number; unitPrice?: number; priceListId?: string })`
- **ic_degiskenler**:
  - `this.supabase` — Supabase istemcisi
  - `payload` — Sepet öğesi ekleme/güncelleme verisi; cartId (sepet ID), _productId (ürün ID), quantity (miktar), unitPrice (birim fiyat, opsiyonel), priceListId (fiyat listesi ID, opsiyonel)
- **Dönüş**: `upsertCartItem(this.supabase, payload)` — eklenen veya güncellenen sepet öğesi

### [N12_NASIL] AST Pointer: src/lib/services/registry.ts::CartService.removeCartItem
- **params**: `(cartId: string, productId: string)`
- **ic_degiskenler**:
  - `this.supabase` — Supabase istemcisi
  - `cartId` — Sepetin UUID'si
  - `productId` — Kaldırılacan ürünün UUID'si
- **Dönüş**: `removeCartItem(this.supabase, cartId, productId)` — kaldırma sonucu

### [N13_NASIL] AST Pointer: src/lib/services/registry.ts::CartService.clearCartItems
- **params**: `(cartId: string)`
- **ic_degiskenler**:
  - `this.supabase` — Supabase istemcisi
  - `cartId` — Tüm öğeleri silinecek sepetin UUID'si
- **Dönüş**: `clearCartItems(this.supabase, cartId)` — temizleme sonucu

### [N14_NASIL] AST Pointer: src/lib/services/registry.ts::CategoryService.constructor
- **params**: `(supabase: SupabaseClient<Database>)`
- **ic_degiskenler**:
  - `supabase` — CategoryService'e ait Supabase istemci referansı
- **Dönüş**: yok (constructor)

### [N15_NASIL] AST Pointer: src/lib/services/registry.ts::CategoryService.getCategories
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `this.supabase` — Supabase istemcisi
- **Dönüş**: `getCategories(this.supabase)` — kategori listesi

### [N16_NASIL] AST Pointer: src/lib/services/registry.ts::InvoiceService.constructor
- **params**: `(supabase: SupabaseClient<Database>)`
- **ic_degiskenler**:
  - `supabase` — InvoiceService'e ait Supabase istemci referansı
- **Dönüş**: yok (constructor)

### [N17_NASIL] AST Pointer: src/lib/services/registry.ts::InvoiceService.listInvoiceProfiles
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `this.supabase` — Supabase istemcisi
- **Dönüş**: `listInvoiceProfiles(this.supabase)` — fatura profilleri listesi

### [N18_NASIL] AST Pointer: src/lib/services/registry.ts::InvoiceService.createInvoiceProfile
- **params**: `(payload: DbInvoiceProfileInsert)`
- **ic_degiskenler**:
  - `this.supabase` — Supabase istemcisi
  - `payload` — Oluşturulacak fatura profili verisi, DB insert tipinde
- **Dönüş**: `createInvoiceProfile(this.supabase, payload)` — oluşturulan fatura profili

### [N19_NASIL] AST Pointer: src/lib/services/registry.ts::InvoiceService.updateInvoiceProfile
- **params**: `(id: string, payload: DbInvoiceProfileUpdate)`
- **ic_degiskenler**:
  - `this.supabase` — Supabase istemcisi
  - `id` — Güncellenecek fatura profilinin UUID'si
  - `payload` — Güncellenecek alanları içeren DB update nesnesi
- **Dönüş**: `updateInvoiceProfile(this.supabase, id, payload)` — güncellenen fatura profili

### [N20_NASIL] AST Pointer: src/lib/services/registry.ts::InvoiceService.deleteInvoiceProfile
- **params**: `(id: string)`
- **ic_degiskenler**:
  - `this.supabase` — Supabase istemcisi
  - `id` — Silinecek fatura profilinin UUID'si
- **Dönüş**: `deleteInvoiceProfile(this.supabase, id)` — silme sonucu

### [N21_NASIL] AST Pointer: src/lib/services/registry.ts::InvoiceService.setDefaultInvoiceProfile
- **params**: `(id: string)`
- **ic_degiskenler**:
  - `this.supabase` — Supabase istemcisi
  - `id` — Varsayılan olarak ayarlanacak fatura profilinin UUID'si
- **Dönüş**: `setDefaultInvoiceProfile(this.supabase, id)` — ayarlama sonucu

### [N22_NASIL] AST Pointer: src/lib/services/registry.ts::InvoiceService.fetchDefaultInvoiceProfile
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `this.supabase` — Supabase istemcisi
- **Dönüş**: `fetchDefaultInvoiceProfile(this.supabase)` — varsayılan fatura profili veya null

### [N23_NASIL] AST Pointer: src/lib/services/registry.ts::PricingService.constructor
- **params**: `(supabase: SupabaseClient<Database>)`
- **ic_degiskenler**:
  - `supabase` — PricingService'e ait Supabase istemci referansı
- **Dönüş**: yok (constructor)

### [N24_NASIL] AST Pointer: src/lib/services/registry.ts::PricingService.getEffectiveUnitPrice
- **params**: `(product: Product)`
- **ic_degiskenler**:
  - `this.supabase` — Supabase istemcisi
  - `product` — Fiyatı hesaplanacak ürün nesnesi (Product UI model tipi)
- **Dönüş**: `getEffectiveUnitPrice(this.supabase, product)` — etkili birim fiyat

### [N25_NASIL] AST Pointer: src/lib/services/registry.ts::PricingService.getEffectivePriceInfo
- **params**: `(product: Product)`
- **ic_degiskenler**:
  - `this.supabase` — Supabase istemcisi
  - `product` — Fiyat bilgisi hesaplanacak ürün nesnesi
- **Dönüş**: `getEffectivePriceInfo(this.supabase, product)` — detaylı fiyat bilgisi (indirim, liste fiyatı vb.)

### [N26_NASIL] AST Pointer: src/lib/services/registry.ts::ProductService.constructor
- **params**: `(supabase: SupabaseClient<Database>)`
- **ic_degiskenler**:
  - `supabase` — ProductService'e ait Supabase istemci referansı
- **Dönüş**: yok (constructor)

### [N27_NASIL] AST Pointer: src/lib/services/registry.ts::ProductService.getProductsEnriched
- **params**: `(options: Parameters<typeof getProductsEnriched>[1])`
- **ic_degiskenler**:
  - `this.supabase` — Supabase istemcisi
  - `options` — Bağımsız `getProductsEnriched` fonksiyonunun ikinci parametresi tipinde; filtreleme, sıralama, sayfalama seçenekleri
- **Dönüş**: `getProductsEnriched(this.supabase, options)` — zenginleştirilmiş ürün listesi

### [N28_NASIL] AST Pointer: src/lib/services/registry.ts::ProductService.getSearchSuggestions
- **params**: `(query: string, limit?: number)`
- **ic_degiskenler**:
  - `this.supabase` — Supabase istemcisi
  - `query` — Arama sorgu metni
  - `limit` — Maksimum öneri sayısı (opsiyonel)
- **Dönüş**: `getSearchSuggestions(this.supabase, query, limit)` — arama önerileri listesi

### [N29_NASIL] AST Pointer: src/lib/services/registry.ts::ProductService.ftsSearchProducts
- **params**: `(term: string, limit?: number)`
- **ic_degiskenler**:
  - `this.supabase` — Supabase istemcisi
  - `term` — Full-text search arama terimi
  - `limit` — Maksimum sonuç sayısı (opsiyonel)
- **Dönüş**: `ftsSearchProducts(this.supabase, term, limit)` — full-text search ile bulunan ürünler

### [N30_NASIL] AST Pointer: src/lib/services/registry.ts::ProductService.getProducts
- **params**: `(limit?: number)`
- **ic_degiskenler**:
  - `this.supabase` — Supabase istemcisi
  - `limit` — Maksimum ürün sayısı (opsiyonel)
- **Dönüş**: `getProducts(this.supabase, limit)` — ürün listesi

### [N31_NASIL] AST Pointer: src/lib/services/registry.ts::ProductService.getAllProducts
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `this.supabase` — Supabase istemcisi
- **Dönüş**: `getAllProducts(this.supabase)` — tüm ürünler listesi

### [N32_NASIL] AST Pointer: src/lib/services/registry.ts::ProductService.getProductsByCategory
- **params**: `(categoryId: string)`
- **ic_degiskenler**:
  - `this.supabase` — Supabase istemcisi
  - `categoryId` — Kategori UUID'si
- **Dönüş**: `getProductsByCategory(this.supabase, categoryId)` — belirli kategorideki ürünler

### [N33_NASIL] AST Pointer: src/lib/services/registry.ts::ProductService.getProductsBySubcategory
- **params**: `(subcategoryId: string)`
- **ic_degiskenler**:
  - `this.supabase` — Supabase istemcisi
  - `subcategoryId` — Alt kategori UUID'si
- **Dönüş**: `getProductsBySubcategory(this.supabase, subcategoryId)` — belirli alt kategorideki ürünler

### [N34_NASIL] AST Pointer: src/lib/services/registry.ts::ProductService.getProductById
- **params**: `(id: string)`
- **ic_degiskenler**:
  - `this.supabase` — Supabase istemcisi
  - `id` — Ürün UUID'si
- **Dönüş**: `getProductById(this.supabase, id)` — tek ürün nesnesi veya null

### [N35_NASIL] AST Pointer: src/lib/services/registry.ts::ProductService.getProductBySlugOrId
- **params**: `(identifier: string)`
- **ic_degiskenler**:
  - `this.supabase` — Supabase istemcisi
  - `identifier` — Ürün slug'ı veya UUID'si (her ikisini de kabul eder)
- **Dönüş**: `getProductBySlugOrId(this.supabase, identifier)` — eşleşen ürün veya null

### [N36_NASIL] AST Pointer: src/lib/services/registry.ts::ProductService.getProductBySlug
- **params**: `(slug: string)`
- **ic_degiskenler**:
  - `this.supabase` — Supabase istemcisi
  - `slug` — Ürün slug değeri
- **Dönüş**: `getProductBySlug(this.supabase, slug)` — slug ile bulunan ürün veya null

### [N37_NASIL] AST Pointer: src/lib/services/registry.ts::ProductService.getFeaturedProducts
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `this.supabase` — Supabase istemcisi
- **Dönüş**: `getFeaturedProducts(this.supabase)` — öne çıkan ürünler listesi

### [N38_NASIL] AST Pointer: src/lib/services/registry.ts::ProductService.searchProducts
- **params**: `(query: string)`
- **ic_degiskenler**:
  - `this.supabase` — Supabase istemcisi
  - `query` — Arama sorgu metni
- **Dönüş**: `searchProducts(this.supabase, query)` — arama sonuçları ürün listesi

### [N39_NASIL] AST Pointer: src/lib/services/registry.ts::ProductService.adminSearchProducts
- **params**: `(query: string)`
- **ic_degiskenler**:
  - `this.supabase` — Supabase istemcisi
  - `query` — Admin arama sorgu metni
- **Dönüş**: `adminSearchProducts(this.supabase, query)` — admin arama sonuçları ürün listesi

### [N40_NASIL] AST Pointer: src/lib/services/registry.ts::ProjectService.constructor
- **params**: `(supabase: SupabaseClient<Database>)`
- **ic_degiskenler**:
  - `supabase` — ProjectService'e ait Supabase istemci referansı
- **Dönüş**: yok (constructor)

### [N41_NASIL] AST Pointer: src/lib/services/registry.ts::ProjectService.listUserProjects
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `this.supabase` — Supabase istemcisi
- **Dönüş**: `listUserProjects(this.supabase)` — kullanıcının proje listesi

### [N42_NASIL] AST Pointer: src/lib/services/registry.ts::ProjectService.createProject
- **params**: `(project: TablesInsert<'user_projects'>)`
- **ic_degiskenler**:
  - `this.supabase` — Supabase istemcisi
  - `project` — Oluşturulacak proje verisi, user_projects tablosu insert tipinde
- **Dönüş**: `createProject(this.supabase, project)` — oluşturulan proje

### [N43_NASIL] AST Pointer: src/lib/services/registry.ts::ProjectService.deleteProject
- **params**: `(id: string)`
- **ic_degiskenler**:
  - `this.supabase` — Supabase istemcisi
  - `id` — Silinecek projenin UUID'si
- **Dönüş**: `deleteProject(this.supabase, id)` — silme sonucu

### [N44_NASIL] AST Pointer: src/lib/services/registry.ts::ProjectService.addProductToProject
- **params**: `(projectId: string, productId: string, quantity?: number)`
- **ic_degiskenler**:
  - `this.supabase` — Supabase istemcisi
  - `projectId` — Hedef projenin UUID'si
  - `productId` — Eklenecek ürünün UUID'si
  - `quantity` — Eklenecek miktar (opsiyonel, belirtilmezse varsayılan)
- **Dönüş**: `addProductToProject(this.supabase, projectId, productId, quantity)` — eklenen proje öğesi

### [N45_NASIL] AST Pointer: src/lib/services/registry.ts::ProjectService.removeProductFromProject
- **params**: `(projectId: string, productId: string)`
- **ic_degiskenler**:
  - `this.supabase` — Supabase istemcisi
  - `projectId` — Projenin UUID'si
  - `productId` — Kaldırılacak ürünün UUID'si
- **Dönüş**: `removeProductFromProject(this.supabase, projectId, productId)` — kaldırma sonucu

### [N46_NASIL] AST Pointer: src/lib/services/registry.ts::ProjectService.listProjectItems
- **params**: `(projectId: string)`
- **ic_degiskenler**:
  - `this.supabase` — Supabase istemcisi
  - `projectId` — Öğeleri listelenecek projenin UUID'si
- **Dönüş**: `listProjectItems(this.supabase, projectId)` — proje öğeleri listesi

### [N47_NASIL] AST Pointer: src/lib/services/registry.ts::ServiceRegistry.constructor
- **params**: `(supabase: SupabaseClient<Database>)`
- **ic_degiskenler**:
  - `supabase` — Merkezi Supabase istemci referansı, tüm alt servislere dağıtılır
  - `this.address` — `new AddressService(this.supabase)` ile oluşturulan AddressService instance'ı
  - `this.cart` — `new CartService(this.supabase)` ile oluşturulan CartService instance'ı
  - `this.category` — `new CategoryService(this.supabase)` ile oluşturulan CategoryService instance'ı
  - `this.invoice` — `new InvoiceService(this.supabase)` ile oluşturulan InvoiceService instance'ı
  - `this.pricing` — `new PricingService(this.supabase)` ile oluşturulan PricingService instance'ı
  - `this.product` — `new ProductService(this.supabase)` ile oluşturulan ProductService instance'ı
  - `this.project` — `new ProjectService(this.supabase)` ile oluşturulan ProjectService instance'ı
- **Dönüş**: yok (constructor); yan etki olarak tüm servis alanlarını başlatır

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