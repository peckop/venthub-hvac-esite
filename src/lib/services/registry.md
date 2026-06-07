---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\lib\services\registry.ts
skeleton_hash: 50e57eab60a2724c
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
generated_at: 2026-06-07T14:01:34Z
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
**Ne yapar**: Kullanıcıya ait tüm adres kayıtlarını listeler.
**Nasıl yapar**: AddressService sınıfının içinde, constructor'dan enjekte edilen supabase istemcisini kullanarak harici `listAddresses` fonksiyonunu çağırır ve sonucu doğrudan döndürür. Bu, veritabanındaki adresleri getirmek için bir proxy görevi görür.
**Parametreler**: Bu fonksiyon herhangi bir parametre almaz.
**Dönüş**: ReturnType olarak `listAddresses(this.supabase)` çağrısının dönüşü, yani adres listesi döner. Kesin dönüş tipi harici fonksiyona bağlıdır.

### createAddress
**Ne yapar**: Verilen verilerle yeni bir adres kaydı oluşturur.
**Nasıl yapar**: Adres verilerini (payload) alır ve harici `createAddress` fonksiyonuna, supabase istemcisi ile birlikte iletir. İşlem supabase istemcisi üzerinden veritabanına yazma realizasyonunu yapar.
**Parametreler**:
- payload: DbUserAddressInsert — Oluşturulacak adresin verilerini içeren nesne. Veritabanı şemasına uygun insert veri tipi.
**Dönüş**: ReturnType olarak `createAddress(this.supabase, payload)` çağrısının dönüşü, yani oluşturulan adres kaydı döner.

### updateAddress
**Ne yapar**: Belirli bir ID'ye sahip adres kaydını günceller.
**Nasıl yapar**: Güncellenecek adresin ID'sini ve yeni verileri (payload) alır. Supabase istemcisi ile harici `updateAddress` fonksiyonunu çağırarak ilgili kaydı veritabanında günceller.
**Parametreler**:
- id: string — Güncellenecek adresin benzersiz tanımlayıcısı.
- payload: DbUserAddressUpdate — Adresin güncellenecek alanlarını içeren nesne.
**Dönüş**: ReturnType olarak `updateAddress(this.supabase, id, payload)` çağrısının dönüşü, yani güncellenen adres kaydı döner.

### deleteAddress
**Ne yapar**: Belirli bir ID'ye sahip adres kaydını siler.
**Nasıl yapar**: Silinecek adresin ID'sini alır. Supabase istemcisi ve harici `deleteAddress` fonksiyonu kullanılarak ilgili kayıt veritabanından kalıcı olarak kaldırılır.
**Parametreler**:
- id: string — Silinecek adresin benzersiz tanımlayıcısı.
**Dönüş**: ReturnType olarak `deleteAddress(this.supabase, id)` çağrısının dönüşü, yani silme işleminin sonucu döner.

### setDefaultAddress
**Ne yapar**: Kullanıcının belirli bir türdeki (gönderi veya fatura) varsayılan adresini ayarlar.
**Nasıl yapar**: Adres türünü ('shipping' veya 'billing') ve ilgili adresin ID'sini alır. Harici `setDefaultAddress` fonksiyonunu çağırarak, kullanıcının o türdeki varsayılan adresini belirtilen ID ile günceller.
**Parametreler**:
- kind: 'shipping' | 'billing' — Ayarlanacak varsayılan adresin türü: gönderi adresi mi yoksa fatura adresi mi.
- id: string — Varsayılan olarak ayarlanacak adresin benzersiz tanımlayıcısı.
**Dönüş**: ReturnType olarak `setDefaultAddress(this.supabase, kind, id)` çağrısının dönüşü, yani güncelleme işleminin sonucu döner.

### constructor
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

### getOrCreateShoppingCart
**Ne yapar**: Belirli bir kullanıcıya ait alışveriş sepetini bulur veya yoksa yeni bir tane oluşturur.
**Nasıl yapar**: Kullanıcı ID'sini alır. Supabase istemcisi ve harici `getOrCreateShoppingCart` fonksiyonu kullanılarak, kullanıcının mevcut sepeti sorgulanır. Eğer sepet yoksa, yeni bir sepet kaydı oluşturulur ve sepet döndürülür.
**Parametreler**:
- userId: string — Alışveriş sepati oluşturulacak veya mevcut sepeti aranacak kullanıcının benzersiz tanımlayıcısı.
**Dönüş**: ReturnType olarak `getOrCreateShoppingCart(this.supabase, userId)` çağrısının dönüşü, yani bulunan veya oluşturulan alışveriş sepeti nesnesi döner.

### listCartItems
**Ne yapar**: Belirli bir alışveriş sepetindeki tüm ürün kalemlerini listeler.
**Nasıl yapar**: Sepet ID'sini alır. Harici `listCartItems` fonksiyonunu, supabase istemcisi ile birlikte çağırarak ilgili.sepetteki tüm kalemleri (ürün, miktar vb.) getirir.
**Parametreler**:
- cartId: string — Ürün kalemListesinin getirileceği alışveriş sepetinin benzersiz tanımlayıcısı.
**Dönüş**: ReturnType olarak `listCartItems(this.supabase, cartId)` çağrısının dönüşü, yani sepet kalemlerinin listesi döner.

### listCartItemsWithProducts
**Ne yapar**: Belirli bir alışveriş sepetindeki ürün kalemlerini, ilgili ürün detaylarıyla birlikte listeler.
**Nasıl yapar**: Sepet ID'sini alır. Harici `listCartItemsWithProducts` fonksiyonunu çağırır. Bu fonksiyon, sepet kalemlerini çekerken ilişkili ürün tablosuyla bir JOIN işlemi yaparak, her kalem için ürün adı, fiyatı, görseli gibi detaylı bilgileri de getirir.
**Parametreler**:
- cartId: string — Ürün detaylı kalemListesinin getirileceği alışveriş sepetinin benzersiz tanımlayıcısı.
**Dönüş**: ReturnType olarak `listCartItemsWithProducts(this.supabase, cartId)` çağrısının dönüşü, yani ürün detayları zenginleştirilmiş sepet kalemlerinin listesi döner.

### upsertCartItem
**Ne yapar**: Belirtilen sepetteki bir ürünü ekler veya varsa miktar ve fiyat bilgilerini günceller. Sepet öğesi mevcut değilse yeni bir kayıt oluşturur, mevcutsa quantity ve opsiyonel fiyat alanlarını günceller.
**Nasıl yapar**: Fonksiyon, bir Supabase istemcisi ve bir payload nesnesi alır. Payload içinde cartId, _productId, quantity, opsiyonel unitPrice ve priceListId bulunur. Bu verileri kullanarak ilgili sepet tablosunda bir upsert (insert/update) işlemi gerçekleştirir.
**Parametreler**:
- payload: `{ cartId: string; _productId: string; quantity: number; unitPrice?: number; priceListId?: string }` — Sepet işlemi için gerekli tüm verileri içeren nesne. cartId sepeti, _productId ürünü, quantity miktarı belirtir. unitPrice ve priceListId opsiyoneldir ve fiyatlandırma bilgisini taşır.
**Dönüş**: Promise, realizasyonunda upsert işleminin sonucunu (örneğin eklenen/güncellenen satır verisi) döndürür.

### removeCartItem
**Ne yapar**: Belirtilen sepetteki belirli bir ürünü tamamen kaldırır.
**Nasıl yapar**: Fonksiyon, bir Supabase istemcisi, cartId ve productId parametrelerini alır. Bu bilgilerle sepet tablosunda ilgili ürünü bulur ve siler.
**Parametreler**:
- cartId: string — Ürünün kaldırılacağı sepetin benzersiz tanımlayıcısı.
- productId: string — Sepetten kaldırılacak ürünün benzersiz tanımlayıcısı.
**Dönüş**: Promise, realizasyonunda silme işleminin sonucunu (örneğin success durumu veya silinen satır sayısı) döndürür.

### clearCartItems
**Ne yapar**: Belirtilen sepetteki tüm ürünleri (tüm sepet öğelerini) toplu olarak silerek sepeti tamamen boşaltır.
**Nasıl yapar**: Fonksiyon, bir Supabase istemcisi ve cartId alır. Bu cartId ile ilişkili tüm seket kalemlerini bulur ve toplu silme işlemi uygular.
**Parametreler**:
- cartId: string — Tüm öğeleri temizlenecek sepetin benzersiz tanımlayıcısı.
**Dönüş**: Promise, realizasyonunda temizleme işleminin sonucunu (örneğin silinen toplam satır sayısı) döndürür.

### constructor
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

### getCategories
**Ne yapar**: Sistemde tanımlı tüm ürün kategorilerini listeler.
**Nasıl yapar**: Fonksiyon, bir Supabase istemcisi alır ve ilgili kategoriler tablosundan tüm kayıtları sorgular. Sonuç olarak kategori listesini döndürür.
**Parametreler**: Bu fonksiyonun dışarıdan alınan herhangi bir parametresi yoktur. Sadece sınıf içindeki `this.supabase` nesnesini kullanır.
**Dönüş**: Promise, realizasyonunda DbCategory türünde bir dizi (array) veya ilgili kategori verilerini içeren bir nesne döndürür.

### constructor
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

### listInvoiceProfiles
**Ne yapar**: Sistemde tanımlı tüm fatura profillerini listeler.
**Nasıl yapar**: Fonksiyon, bir Supabase istemcisi alır ve fatura profilleri tablosundan tüm kayıtları sorgular. Sonuç olarak fatura profillerinin listesini döndürür.
**Parametreler**: Bu fonksiyonun dışarıdan alınan herhangi bir parametresi yoktur. Sadece sınıf içindeki `this.supabase` nesnesini kullanır.
**Dönüş**: Promise, realizasyonunda DbInvoiceProfile türünde bir dizi (array) veya ilgili fatura profili verilerini içeren bir nesne döndürür.

### createInvoiceProfile
**Ne yapar**: Yeni bir fatura profili oluşturur ve veritabanına kaydeder.
**Nasıl yapar**: Fonksiyon, bir Supabase istemcisi ve DbInvoiceProfileInsert türünde bir payload alır. Bu payload, oluşturulacak fatura profilinin tüm veri alanlarını içerir. Fonksiyon bu verileri kullanarak fatura profilleri tablosuna yeni bir satır ekler.
**Parametreler**:
- payload: DbInvoiceProfileInsert — Oluşturulacak yeni fatura profilinin tüm zorunlu ve opsiyonel alanlarını içeren veri nesnesi.
**Dönüş**: Promise, realizasyonunda oluşturulan fatura profilinin verilerini (örneğin generated ID ile birlikte) döndürür.

### updateInvoiceProfile
**Ne yapar**: Var olan bir fatura profilini günceller.
**Nasıl yapar**: Fonksiyon, bir Supabase istemcisi, güncellenecek profilin ID'si ve DbInvoiceProfileUpdate türünde bir payload alır. Bu bilgilerle veritabanındaki ilgili kaydı bulur ve payload'daki alanlarla günceller.
**Parametreler**:
- id: string — Güncellenecek fatura profilinin benzersiz tanımlayıcısı.
- payload: DbInvoiceProfileUpdate — Güncellenecek alanları içeren veri nesnesi. Sadece değiştirilmek istenen alanlar gönderilebilir.
**Dönüş**: Promise, realizasyonunda güncellenen fatura profilinin güncel verilerini döndürür.

### deleteInvoiceProfile
**Ne yapar**: Belirtilen ID'ye sahip fatura profilini veritabanından siler.
**Nasıl yapar**: Fonksiyon, bir Supabase istemcisi ve silinecek profilin ID'sini alır. Bu ID ile fatura profilleri tablosundaki ilgili kaydı bulur ve siler.
**Parametreler**:
- id: string — Silinecek fatura profilinin benzersiz tanımlayıcısı.
**Dönüş**: Promise, realizasyonunda silme işleminin sonucunu (örneğin success durumu) döndürür.

### setDefaultInvoiceProfile
**Ne yapar**: Verilen ID'ye sahip fatura profilini varsayılan olarak ayarlar. Bu işlem, kullanıcının veya firmanın aktif faturasını belirler.
**Nasıl yapar**: Inner function yapısında çalışır. Service katmanındaki `this.supabase` bağlantısını alarak dışarıdaki `setDefaultInvoiceProfile` fonksiyonuna aktarır. Gerçek veritabanı işlemleri bu dış fonksiyon içinde yürütülür.
**Parametreler**:
- id: string — Varsayılan olarak ayarlanacak faturanın benzersiz tanımlayıcısı
**Dönüş**: Promise<boolean> veyaPromise<{ success: boolean }> — İşlemin başarı durumunu döner

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
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

### getAllProducts

**Ne yapar**: Veritabanındaki tüm ürünleri getirir. Ürün listeleme sayfaları veya katalog görüntüleme senaryolarında kullanılır.

**Nasıl yapar**: Sınıf içindeki `supabase` istemcisini alarak bağımsız `getAllProducts` fonksiyonuna iletir. Gerçek veritabanı sorgulama mantığı dışarıdaki fonksiyonda yürütülür, bu metot yalnızca bir yönlendirici (delegator) görevi görür.

**Parametreler**:

Bu fonksiyon herhangi bir parametre almaz. Supabase istemcisi zaten sınıf seviyesinde constructor aracılığıyla enjekte edilmiştir.

**Dönüş**: `Promise<Product[]>` — Veritabanındaki tüm ürün kayıtlarını içeren bir promise döner.

### getProductsByCategory
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

### getProductsBySubcategory
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

### getProductById
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

### getProductBySlugOrId
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

### getProductBySlug
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

### getFeaturedProducts
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

### searchProducts
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

### adminSearchProducts
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

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
**Ne yapar**: ProjectService sınıfını başlatır ve Supabase istemcisini_dependency olarak enjekte eder. Bu构造函数, servisin tüm metodlarının veritabanı bağlantısını kullanabilmesi için gerekli olan Supabase client'ını sınıf内部实例ına kaydeder.

**Nasıl yapar**: TypeScript'in `private` erişim belirtecini kullanarak `supabase` parametresini doğrudan sınıfın `this.supabase` özel değişkenine atar. Bu sayede servisin tüm diğer metodları bu bağlantı bilgisine erişebilir.

**Parametreler**:
- `supabase`: `SupabaseClient<Database>` — Veritabanı işlemleri için kullanılacak Supabase istemcisi. Tip güvenliği sağlanmış `Database` generic'i ile tanımlanmıştır.

**Dönüş**: `void` — Constructor'lar dönüş değeri dönmez.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/lib/services/registry.ts::AddressService.listAddresses
- **params**: (yok)
- **ic_degiskenler**:
  - `this.supabase` — Adres servisi için kullanılan Supabase istemcisi referansı
- **Dönüş**: listAddresses(this.supabase) çağrı sonucu

### [N2_NASIL] AST Pointer: src/lib/services/registry.ts::AddressService.createAddress
- **params**: `payload: DbUserAddressInsert` — oluşturulacak adres verisi
- **ic_degiskenler**:
  - `this.supabase` — Adres servisi için kullanılan Supabase istemcisi referansı
- **Dönüş**: createAddress(this.supabase, payload) çağrı sonucu

### [N3_NASIL] AST Pointer: src/lib/services/registry.ts::AddressService.updateAddress
- **params**: `id: string` — güncellenecek adresin ID'si, `payload: DbUserAddressUpdate` — güncelleme verisi
- **ic_degiskenler**:
  - `this.supabase` — Adres servisi için kullanılan Supabase istemcisi referansı
- **Dönüş**: updateAddress(this.supabase, id, payload) çağrı sonucu

### [N4_NASIL] AST Pointer: src/lib/services/registry.ts::AddressService.deleteAddress
- **params**: `id: string` — silinecek adresin ID'si
- **ic_degiskenler**:
  - `this.supabase` — Adres servisi için kullanılan Supabase istemcisi referansı
- **Dönüş**: deleteAddress(this.supabase, id) çağrı sonucu

### [N5_NASIL] AST Pointer: src/lib/services/registry.ts::AddressService.setDefaultAddress
- **params**: `kind: 'shipping' | 'billing'` — adres türü (teslimat veya fatura), `id: string` — varsayılan yapılacak adresin ID'si
- **ic_degiskenler**:
  - `this.supabase` — Adres servisi için kullanılan Supabase istemcisi referansı
- **Dönüş**: setDefaultAddress(this.supabase, kind, id) çağrı sonucu

### [N6_NASIL] AST Pointer: src/lib/services/registry.ts::CartService.getOrCreateShoppingCart
- **params**: `userId: string` — kullanıcının ID'si
- **ic_degiskenler**:
  - `this.supabase` — Sepet servisi için kullanılan Supabase istemcisi referansı
- **Dönüş**: getOrCreateShoppingCart(this.supabase, userId) çağrı sonucu

### [N7_NASIL] AST Pointer: src/lib/services/registry.ts::CartService.listCartItems
- **params**: `cartId: string` — sepetin ID'si
- **ic_degiskenler**:
  - `this.supabase` — Sepet servisi için kullanılan Supabase istemcisi referansı
- **Dönüş**: listCartItems(this.supabase, cartId) çağrı sonucu

### [N8_NASIL] AST Pointer: src/lib/services/registry.ts::CartService.listCartItemsWithProducts
- **params**: `cartId: string` — sepetin ID'si
- **ic_degiskenler**:
  - `this.supabase` — Sepet servisi için kullanılan Supabase istemcisi referansı
- **Dönüş**: listCartItemsWithProducts(this.supabase, cartId) çağrı sonucu

### [N9_NASIL] AST Pointer: src/lib/services/registry.ts::CartService.upsertCartItem
- **params**: `payload: { cartId: string; _productId: string; quantity: number; unitPrice?: number; priceListId?: string }` — sepet öğesi ekleme/güncelleme verisi
- **ic_degiskenler**:
  - `this.supabase` — Sepet servisi için kullanılan Supabase istemcisi referansı
- **Dönüş**: upsertCartItem(this.supabase, payload) çağrı sonucu

### [N10_NASIL] AST Pointer: src/lib/services/registry.ts::CartService.removeCartItem
- **params**: `cartId: string` — sepetin ID'si, `productId: string` — kaldırılacak ürünün ID'si
- **ic_degiskenler**:
  - `this.supabase` — Sepet servisi için kullanılan Supabase istemcisi referansı
- **Dönüş**: removeCartItem(this.supabase, cartId, productId) çağrı sonucu

### [N11_NASIL] AST Pointer: src/lib/services/registry.ts::CartService.clearCartItems
- **params**: `cartId: string` — sepetin ID'si
- **ic_degiskenler**:
  - `this.supabase` — Sepet servisi için kullanılan Supabase istemcisi referansı
- **Dönüş**: clearCartItems(this.supabase, cartId) çağrı sonucu

### [N12_NASIL] AST Pointer: src/lib/services/registry.ts::CategoryService.getCategories
- **params**: (yok)
- **ic_degiskenler**:
  - `this.supabase` — Kategori servisi için kullanılan Supabase istemcisi referansı
- **Dönüş**: getCategories(this.supabase) çağrı sonucu

### [N13_NASIL] AST Pointer: src/lib/services/registry.ts::InvoiceService.listInvoiceProfiles
- **params**: (yok)
- **ic_degiskenler**:
  - `this.supabase` — Fatura servisi için kullanılan Supabase istemcisi referansı
- **Dönüş**: listInvoiceProfiles(this.supabase) çağrı sonucu

### [N14_NASIL] AST Pointer: src/lib/services/registry.ts::InvoiceService.createInvoiceProfile
- **params**: `payload: DbInvoiceProfileInsert` — oluşturulacak fatura profili verisi
- **ic_degiskenler**:
  - `this.supabase` — Fatura servisi için kullanılan Supabase istemcisi referansı
- **Dönüş**: createInvoiceProfile(this.supabase, payload) çağrı sonucu

### [N15_NASIL] AST Pointer: src/lib/services/registry.ts::InvoiceService.updateInvoiceProfile
- **params**: `id: string` — güncellenecek fatura profilinin ID'si, `payload: DbInvoiceProfileUpdate` — güncelleme verisi
- **ic_degiskenler**:
  - `this.supabase` — Fatura servisi için kullanılan Supabase istemcisi referansı
- **Dönüş**: updateInvoiceProfile(this.supabase, id, payload) çağrı sonucu

### [N16_NASIL] AST Pointer: src/lib/services/registry.ts::InvoiceService.deleteInvoiceProfile
- **params**: `id: string` — silinecek fatura profilinin ID'si
- **ic_degiskenler**:
  - `this.supabase` — Fatura servisi için kullanılan Supabase istemcisi referansı
- **Dönüş**: deleteInvoiceProfile(this.supabase, id) çağrı sonucu

### [N17_NASIL] AST Pointer: src/lib/services/registry.ts::InvoiceService.setDefaultInvoiceProfile
- **params**: `id: string` — varsayılan yapılacak fatura profilinin ID'si
- **ic_degiskenler**:
  - `this.supabase` — Fatura servisi için kullanılan Supabase istemcisi referansı
- **Dönüş**: setDefaultInvoiceProfile(this.supabase, id) çağrı sonucu

### [N18_NASIL] AST Pointer: src/lib/services/registry.ts::InvoiceService.fetchDefaultInvoiceProfile
- **params**: (yok)
- **ic_degiskenler**:
  - `this.supabase` — Fatura servisi için kullanılan Supabase istemcisi referansı
- **Dönüş**: fetchDefaultInvoiceProfile(this.supabase) çağrı sonucu

### [N19_NASIL] AST Pointer: src/lib/services/registry.ts::PricingService.getEffectiveUnitPrice
- **params**: `product: Product` — fiyat bilgisi alınacak ürün nesnesi
- **ic_degiskenler**:
  - `this.supabase` — Fiyatlandırma servisi için kullanılan Supabase istemcisi referansı
- **Dönüş**: getEffectiveUnitPrice(this.supabase, product) çağrı sonucu

### [N20_NASIL] AST Pointer: src/lib/services/registry.ts::PricingService.getEffectivePriceInfo
- **params**: `product: Product` — fiyat bilgisi alınacak ürün nesnesi
- **ic_degiskenler**:
  - `this.supabase` — Fiyatlandırma servisi için kullanılan Supabase istemcisi referansı
- **Dönüş**: getEffectivePriceInfo(this.supabase, product) çağrı sonucu

### [N21_NASIL] AST Pointer: src/lib/services/registry.ts::ProductService.getProductsEnriched
- **params**: `options: Parameters<typeof getProductsEnriched>[1]` — ürün sorgulama seçenekleri
- **ic_degiskenler**:
  - `this.supabase` — Ürün servisi için kullanılan Supabase istemcisi referansı
- **Dönüş**: getProductsEnriched(this.supabase, options) çağrı sonucu

### [N22_NASIL] AST Pointer: src/lib/services/registry.ts::ProductService.getSearchSuggestions
- **params**: `query: string` — arama sorgusu, `limit?: number` — önerilen maksimum sonuç sayısı
- **ic_degiskenler**:
  - `this.supabase` — Ürün servisi için kullanılan Supabase istemcisi referansı
- **Dönüş**: getSearchSuggestions(this.supabase, query, limit) çağrı sonucu

### [N23_NASIL] AST Pointer: src/lib/services/registry.ts::ProductService.ftsSearchProducts
- **params**: `term: string` — tam metin arama terimi, `limit?: number` — maksimum sonuç sayısı
- **ic_degiskenler**:
  - `this.supabase` — Ürün servisi için kullanılan Supabase istemcisi referansı
- **Dönüş**: ftsSearchProducts(this.supabase, term, limit) çağrı sonucu

### [N24_NASIL] AST Pointer: src/lib/services/registry.ts::ProductService.getProducts
- **params**: `limit?: number` — getirilecek maksimum ürün sayısı
- **ic_degiskenler**:
  - `this.supabase` — Ürün servisi için kullanılan Supabase istemcisi referansı
- **Dönüş**: getProducts(this.supabase, limit) çağrı sonucu

### [N25_NASIL] AST Pointer: src/lib/services/registry.ts::ProductService.getAllProducts
- **params**: (yok)
- **ic_degiskenler**:
  - `this.supabase` — Ürün servisi için kullanılan Supabase istemcisi referansı
- **Dönüş**: getAllProducts(this.supabase) çağrı sonucu

### [N26_NASIL] AST Pointer: src/lib/services/registry.ts::ProductService.getProductsByCategory
- **params**: `categoryId: string` — kategori ID'si
- **ic_degiskenler**:
  - `this.supabase` — Ürün servisi için kullanılan Supabase istemcisi referansı
- **Dönüş**: getProductsByCategory(this.supabase, categoryId) çağrı sonucu

### [N27_NASIL] AST Pointer: src/lib/services/registry.ts::ProductService.getProductsBySubcategory
- **params**: `subcategoryId: string` — alt kategori ID'si
- **ic_degiskenler**:
  - `this.supabase` — Ürün servisi için kullanılan Supabase istemcisi referansı
- **Dönüş**: getProductsBySubcategory(this.supabase, subcategoryId) çağrı sonucu

### [N28_NASIL] AST Pointer: src/lib/services/registry.ts::ProductService.getProductById
- **params**: `id: string` — ürün ID'si
- **ic_degiskenler**:
  - `this.supabase` — Ürün servisi için kullanılan Supabase istemcisi referansı
- **Dönüş**: getProductById(this.supabase, id) çağrı sonucu

### [N29_NASIL] AST Pointer: src/lib/services/registry.ts::ProductService.getProductBySlugOrId
- **params**: `identifier: string` — slug veya ID olarak kullanılabilecek tanımlayıcı
- **ic_degiskenler**:
  - `this.supabase` — Ürün servisi için kullanılan Supabase istemcisi referansı
- **Dönüş**: getProductBySlugOrId(this.supabase, identifier) çağrı sonucu

### [N30_NASIL] AST Pointer: src/lib/services/registry.ts::ProductService.getProductBySlug
- **params**: `slug: string` — ürün slug'ı
- **ic_degiskenler**:
  - `this.supabase` — Ürün servisi için kullanılan Supabase istemcisi referansı
- **Dönüş**: getProductBySlug(this.supabase, slug) çağrı sonucu

### [N31_NASIL] AST Pointer: src/lib/services/registry.ts::ProductService.getFeaturedProducts
- **params**: (yok)
- **ic_degiskenler**:
  - `this.supabase` — Ürün servisi için kullanılan Supabase istemcisi referansı
- **Dönüş**: getFeaturedProducts(this.supabase) çağrı sonucu

### [N32_NASIL] AST Pointer: src/lib/services/registry.ts::ProductService.searchProducts
- **params**: `query: string` — arama sorgusu
- **ic_degiskenler**:
  - `this.supabase` — Ürün servisi için kullanılan Supabase istemcisi referansı
- **Dönüş**: searchProducts(this.supabase, query) çağrı sonucu

### [N33_NASIL] AST Pointer: src/lib/services/registry.ts::ProductService.adminSearchProducts
- **params**: `query: string` — admin arama sorgusu
- **ic_degiskenler**:
  - `this.supabase` — Ürün servisi için kullanılan Supabase istemcisi referansı
- **Dönüş**: adminSearchProducts(this.supabase, query) çağrı sonucu

### [N34_NASIL] AST Pointer: src/lib/services/registry.ts::ProjectService.listUserProjects
- **params**: (yok)
- **ic_degiskenler**:
  - `this.supabase` — Proje servisi için kullanılan Supabase istemcisi referansı
- **Dönüş**: listUserProjects(this.supabase) çağrı sonucu

### [N35_NASIL] AST Pointer: src/lib/services/registry.ts::ProjectService.createProject
- **params**: `project: TablesInsert<'user_projects'>` — oluşturulacak proje verisi
- **ic_degiskenler**:
  - `this.supabase` — Proje servisi için kullanılan Supabase istemcisi referansı
- **Dönüş**: createProject(this.supabase, project) çağrı sonucu

### [N36_NASIL] AST Pointer: src/lib/services/registry.ts::ProjectService.deleteProject
- **params**: `id: string` — silinecek projenin ID'si
- **ic_degiskenler**:
  - `this.supabase` — Proje servisi için kullanılan Supabase istemcisi referansı
- **Dönüş**: deleteProject(this.supabase, id) çağrı sonucu

### [N37_NASIL] AST Pointer: src/lib/services/registry.ts::ProjectService.addProductToProject
- **params**: `projectId: string` — projenin ID'si, `productId: string` — eklenecek ürünün ID'si, `quantity?: number` — opsiyonel miktar
- **ic_degiskenler**:
  - `this.supabase` — Proje servisi için kullanılan Supabase istemcisi referansı
- **Dönüş**: addProductToProject(this.supabase, projectId, productId, quantity) çağrı sonucu

### [N38_NASIL] AST Pointer: src/lib/services/registry.ts::ProjectService.removeProductFromProject
- **params**: `projectId: string` — projenin ID'si, `productId: string` — kaldırılacak ürünün ID'si
- **ic_degiskenler**:
  - `this.supabase` — Proje servisi için kullanılan Supabase istemcisi referansı
- **Dönüş**: removeProductFromProject(this.supabase, projectId, productId) çağrı sonucu

### [N39_NASIL] AST Pointer: src/lib/services/registry.ts::ProjectService.listProjectItems
- **params**: `projectId: string` — projenin ID'si
- **ic_degiskenler**:
  - `this.supabase` — Proje servisi için kullanılan Supabase istemcisi referansı
- **Dönüş**: listProjectItems(this.supabase, projectId) çağrı sonucu

### [N40_NASIL] AST Pointer: src/lib/services/registry.ts::ServiceRegistry.constructor
- **params**: `private supabase: SupabaseClient<Database>` — tüm servisler için kullanılacak Supabase istemcisi
- **ic_degiskenler**:
  - `this.address` — AddressService örneği, adres yönetimi için kullanılır
  - `this.cart` — CartService örneği, sepet yönetimi için kullanılır
  - `this.category` — CategoryService örneği, kategori yönetimi için kullanılır
  - `this.invoice` — InvoiceService örneği, fatura profili yönetimi için kullanılır
  - `this.pricing` — PricingService örneği, fiyatlandırma hesaplamaları için kullanılır
  - `this.product` — ProductService örneği, ürün CRUD ve arama işlemleri için kullanılır
  - `this.project` — ProjectService örneği, proje yönetimi için kullanılır
- **Dönüş**: yok (constructor)

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