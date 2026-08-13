---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\lib\services\registry.ts
skeleton_hash: 69bd4c2379786328
entity_hashes:
  func:AddressService:constructor: 0e35462915cc5372
  func:AddressService:createAddress: 523df76982196318
  func:AddressService:deleteAddress: 9f08637066e5d026
  func:AddressService:listAddresses: f22286292283469e
  func:AddressService:setDefaultAddress: 0f3d6123c13d00cd
  func:AddressService:updateAddress: bd093088b0de4ceb
  func:CartService:clearCartItems: 5a6f32af9de5ca87
  func:CartService:constructor: 0e35462915cc5372
  func:CartService:getOrCreateShoppingCart: 4f0d704382557024
  func:CartService:listCartItems: 33ee0f06b0104f0d
  func:CartService:listCartItemsWithProducts: 84affa20dce1ba53
  func:CartService:removeCartItem: 1a9e64194e20942a
  func:CartService:upsertCartItem: ebced09d9fdba235
  func:CategoryService:constructor: 0e35462915cc5372
  func:CategoryService:getCategories: 2983c049f4d2e7d8
  func:InvoiceService:constructor: 0e35462915cc5372
  func:InvoiceService:createInvoiceProfile: 37d528c75ce54c94
  func:InvoiceService:deleteInvoiceProfile: 13f7c3522ad55dec
  func:InvoiceService:fetchDefaultInvoiceProfile: a78f653642b40a76
  func:InvoiceService:listInvoiceProfiles: fb4bd83da6df944c
  func:InvoiceService:setDefaultInvoiceProfile: 6e494946f223e1e1
  func:InvoiceService:updateInvoiceProfile: 0aea69e54f3c870b
  func:PricingService:constructor: 0e35462915cc5372
  func:PricingService:getEffectivePriceInfo: 9cdcf3ba8f40a370
  func:PricingService:getEffectiveUnitPrice: d8e9491e9fc56a60
  func:ProductService:adminSearchProducts: 768bd04c524f83b6
  func:ProductService:constructor: 0e35462915cc5372
  func:ProductService:ftsSearchProducts: 36d3ea5bf250c397
  func:ProductService:getAllProducts: e0c6d5e8782155c4
  func:ProductService:getFeaturedProducts: 98b5160d5ce29759
  func:ProductService:getProductById: cfb9a7aac4b64ed4
  func:ProductService:getProductBySlug: 40ce7a7e331afeda
  func:ProductService:getProductBySlugOrId: bf8ab219e71d69bf
  func:ProductService:getProducts: 872a534cd286900c
  func:ProductService:getProductsByCategory: 403527d3f618f15a
  func:ProductService:getProductsBySubcategory: 4360866b18eabb65
  func:ProductService:getSearchSuggestions: dc074cfeccf2f3a6
  func:ProjectService:addProductToProject: 100d9d74c4ce983d
  func:ProjectService:constructor: 0e35462915cc5372
  func:ProjectService:createProject: eb0af2d6a2d8b494
  func:ProjectService:deleteProject: b2b85b5b3156e6d3
  func:ProjectService:listProjectItems: 2b9feb6beee0d5cd
  func:ProjectService:listUserProjects: d9fadc7583ba3617
  func:ProjectService:removeProductFromProject: 267b218308338057
  func:ServiceRegistry:constructor: 0e35462915cc5372
  overview: 938705e66862ef28
generated_at: 2026-08-13T08:53:50Z
---

## Genel Bakış
Bu modül, VentHub HVAC e-ticaret uygulamasının temel servis katmanını oluşturur. Merkezi bir servis kayıt defteri (ServiceRegistry) altında toplanan farklı iş alanlarındaki servisler, Supabase veritabanıyla doğrudan etkileşime geçerek veri yönetimi işlemlerini soyutlar.

## Fonksiyon Grupları
### Adres Yönetimi
Kullanıcı adreslerinin (teslimat ve fatura) oluşturulması, listelenmesi, güncellenmesi, silinmesi ve varsayılan adresin belirlenmesi işlemlerini yönetir.
- listAddresses, createAddress, updateAddress, deleteAddress, setDefaultAddress

### Sepet Yönetimi
Alışveriş sepetinin oluşturulması veya mevcut sepetin getirilmesi, sepet ürünlerinin listelenmesi/eklenmesi/kaldırılması ve sepetin temizlenmesi gibi işlemleri yürütür.
- getOrCreateShoppingCart, listCartItems, listCartItemsWithProducts, upsertCartItem, removeCartItem, clearCartItems

### Kategori Yönetimi
Ürün kategorilerinin listelenmesi gibi temel katalog işlemleri sağlar.
- getCategories

### Fatura Yönetimi
Kullanıcı fatura profillerinin CRUD işlemleri ile varsayılan profil belirleme ve getirme işlevlerini sunar.
- listInvoiceProfiles, createInvoiceProfile, updateInvoiceProfile, deleteInvoiceProfile, setDefaultInvoiceProfile, fetchDefaultInvoiceProfile

### Fiyatlandırma
Ürünler için geçerli birim fiyatları ve fiyatlandırma bilgilerini hesaplar veya getirir.
- getEffectiveUnitPrice, getEffectivePriceInfo

### Ürün Yönetimi
Ürünlerin aranması (tam metin ve öneriler), farklı filtrelere göre listelenmesi (kategori, alt kategori, öne çıkan) ve tekil ürün getirilmesi işlemlerini kapsar.
- getSearchSuggestions, ftsSearchProducts, getProducts, getAllProducts, getProductsByCategory, getProductsBySubcategory, getProductById, getProductBySlugOrId, getProductBySlug, getFeaturedProducts, adminSearchProducts

### Proje Yönetimi
Kullanıcı projelerinin oluşturulması, silinmesi, listelenmesi ve projelere ürün eklenmesi/çıkarılması gibi proje tabanlı alışveriş özelliklerini yönetir.
-

---

## AXIOMS – Mimari Varsayımlar

Bu modül, ServiceRegistry aracılığıyla bir SupabaseClient üzerinden birden fazla servisi (AddressService, CartService, CategoryService, InvoiceService, PricingService, ProductService, ProjectService) başlatan bir servis katmanı konteynırıdır.

**[Aksiyom 1]**: Eğer constructor'a geçilen `supabase: SupabaseClient<Database>` parametresi geçersiz, null veya veritabanı şeması ile uyumsuz bir instance ise, tüm servisler Veritabanı iletişim hataları üretir.

**[Aksiyom 2]**: Eğer `AddressService.setDefaultAddress` çağrısında `kind` parametresi `'shipping'` veya `'billing'` değerlerinden biri değilse, parametre tip ihlali oluşur.

**[Aksiyom 3]**: Eğer `CartService.getOrCreateShoppingCart` çağrısında `userId` parametresi geçerli bir kullanıcıya karşılık gelmiyorsa, alışveriş sepeti oluşturulamaz veya mevcut sepet getirilemez.

**[Aksiyom 4]**: Eğer `CartService.upsertCartItem` çağrısında `payload.cartId` geçerli bir sepet kimliği değilse veya `payload._productId` varolan bir ürünü referans almıyorsa, sepet kalemi eklenemez/güncellenemez.

**[Aksiyom 5]**: Eğer `CartService.removeCartItem` çağrısında belirtilen `cartId` + `productId` kombinasyonu sepette mevcut değilse, silinecek kalem bulunamaz.

**[Aksiyom 6]**: Eğer `InvoiceService.setDefaultInvoiceProfile` çağrısında `id` parametresi mevcut bir fatura profilini temsil etmiyorsa, varsayılan profil atanamaz.

**[Aksiyom 7]**: Eğer `PricingService.getEffectiveUnitPrice` veya `getEffectivePriceInfo` çağrısında `product` parametresi null veya eksik alanlara sahipse, fiyat hesaplama sonucu tanımsız olur.

**[Aksiyom 8]**: Eğer `ProductService.getProductBySlugOrId` çağrısında `identifier` ne geçerli bir slug formatına ne de geçerli bir UUID formatına uyuyorsa, sonuç boş (null/undefined) döner.

**[Aksiyom 9]**: Eğer `ProjectService.addProductToProject` çağrısında `projectId` veya `productId` geçerli bir kimlik değilse, ürün projeye eklenemez.

**[Aksiyom 10]**: Eğer `CategoryService.getCategories` çağrısı veritabanından kategori listesini getiremiyorsa (bağlantı hatası veya boş tablo), boş bir liste döner; servis çökmez.

---

## FONKSİYON DETAYLARI

### constructor
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

### AddressService.listAddresses
**Ne yapar**: Tüm adres kayıtlarını listeler.
**Nasıl yapar**: Dışarıda tanımlanmış olan bağımsız `listAddresses` fonksiyonunu çağırarak asenkron bir veritabanı sorgusu başlatır. Fonksiyon, sınıfa ait Supabase istemcisini (`this.supabase`) parametre olarak geçer.
**Parametreler**: Parametre almaz.
**Dönüş**: `listAddresses` fonksiyonunun dönüş değeri. Verilen bilgiye göre dönüş tipi belirtilmemiştir.

### AddressService.createAddress
**Ne yapar**: Yeni bir adres kaydı oluşturur.
**Nasıl yapar**: Dışarıda tanımlanmış olan bağımsız `createAddress` fonksiyonunu çağırarak asenkron bir veritabanı ekleme işlemi başlatır. Fonksiyon, sınıfa ait Supabase istemcisini (`this.supabase`) ve adres verilerini (`payload`) parametre olarak geçer.
**Parametreler**:
- payload: `DbUserAddressInsert` — Oluşturulacak adresin tüm veri alanlarını içeren bir nesne. Veritabanı tablosuna eklenecek satırın yapısını temsil eder.
**Dönüş**: `createAddress` fonksiyonunun dönüş değeri. Verilen bilgiye göre dönüş tipi belirtilmemiştir.

### AddressService.updateAddress
**Ne yapar**: Belirtilen ID'ye sahip adres kaydını günceller.
**Nasıl yapar**: Dışarıda tanımlanmış olan bağımsız `updateAddress` fonksiyonunu çağırarak asenkron bir veritabanı güncelleme işlemi başlatır. Fonksiyon, Supabase istemcisi ile birlikte güncellenecek adresin kimliğini (`id`) ve güncellenecek verileri (`payload`) parametre olarak geçer.
**Parametreler**:
- id: `string` — Güncellenecek adresin benzersiz tanımlayıcısı.
- payload: `DbUserAddressUpdate` — Adresin güncellenecek alanlarını içeren bir nesne. Veritabanı tablosundaki satırın güncellenmiş yapısını temsil eder.
**Dönüş**: `updateAddress` fonksiyonunun dönüş değeri. Verilen bilgiye göre dönüş tipi belirtilmemiştir.

### AddressService.deleteAddress
**Ne yapar**: Belirtilen ID'ye sahip adres kaydını siler.
**Nasıl yapar**: Dışarıda tanımlanmış olan bağımsız `deleteAddress` fonksiyonunu çağırarak asenkron bir veritabanı silme işlemi başlatır. Fonksiyon, Supabase istemcisi ile birlikte silinecek adresin kimliğini (`id`) parametre olarak geçer.
**Parametreler**:
- id: `string` — Silinecek adresin benzersiz tanımlayıcısı.
**Dönüş**: `deleteAddress` fonksiyonunun dönüş değeri. Verilen bilgiye göre dönüş tipi belirtilmemiştir.

### AddressService.setDefaultAddress
**Ne yapar**: Belirtilen türde (gönderi veya fatura) varsayılan adresi belirler.
**Nasıl yapar**: Dışarıda tanımlanmış olan bağımsız `setDefaultAddress` fonksiyonunu çağırarak asenkron bir veritabanı güncelleme işlemi başlatır. Fonksiyon, Supabase istemcisi ile birlikte adres türünü (`kind`) ve set edilecek adresin kimliğini (`id`) parametre olarak geçer.
**Parametreler**:
- kind: `'shipping' | 'billing'` — Varsayılan adresin türünü belirtir. Yalnızca `'shipping'` (gönderi adresi) veya `'billing'` (fatura adresi) olabilir.
- id: `string` — Varsayılan olarak ayarlanacak adresin benzersiz tanımlayıcısı.
**Dönüş**: `setDefaultAddress` fonksiyonunun dönüş değeri. Verilen bilgiye göre dönüş tipi belirtilmemiştir.

### CartService.constructor
**Ne yapar**: CartService sınıfının bir örneğini oluşturur ve gerekli olan Supabase istemcisini enjekte eder.
**Nasıl yapar**: TypeScript'in `private` erişim belirleyicisi ile `supabase` parametresini sınıfın bir özelliğine dönüştürür. Bu, sınıfa ait tüm metotların bu istemciyi kullanarak alışveriş sepeti ile ilgili veritabanı işlemleri yapabilmesini sağlar.
**Parametreler**:
- supabase: `SupabaseClient<Database>` — Supabase istemcisini temsil eder ve veritabanı bağlantısını sağlar. `Database` generic tipi, veritabanı şemasının (tablolar, RPC fonksiyonları vb.) TypeScript tiplerini tanımlar.
**Dönüş**: Sınıfın kendisini (bu durumda `void` dönüşlü bir kurucudur).

### CartService.getOrCreateShoppingCart
**Ne yapar**: Belirtilen kullanıcıya ait alışveriş sepetini getirir; eğer sepet yoksa yenisini oluşturur.
**Nasıl yapar**: Dışarıda tanımlanmış olan bağımsız `getOrCreateShoppingCart` fonksiyonunu çağırarak asenkron bir veritabanı sorgulama veya ekleme işlemi başlatır. Fonksiyon, Supabase istemcisi ile birlikte kullanıcı kimliğini (`userId`) parametre olarak geçer.
**Parametreler**:
- userId: `string` — Alışveriş sepatinin ait olduğu kullanıcının benzersiz tanımlayıcısı.
**Dönüş**: `getOrCreateShoppingCart` fonksiyonunun dönüş değeri. Verilen bilgiye göre dönüş tipi belirtilmemiştir.

### CartService.listCartItems
**Ne yapar**: Belirtilen alışveriş sepetindeki ürün kalemlerini listeler.
**Nasıl yapar**: Dışarıda tanımlanmış olan bağımsız `listCartItems` fonksiyonunu çağırarak asenkron bir veritabanı sorgusu başlatır. Fonksiyon, Supabase istemcisi ile birlikte sepet kimliğini (`cartId`) parametre olarak geçer.
**Parametreler**:
- cartId: `string` — Ürünlerin listeleneceği alışveriş sepetinin benzersiz tanımlayıcısı.
**Dönüş**: `listCartItems` fonksiyonunun dönüş değeri. Verilen bilgiye göre dönüş tipi belirtilmemiştir.

### CartService.listCartItemsWithProducts
**Ne yapar**: Belirtilen alışveriş sepetindeki ürün kalemlerini, ilişkili ürün bilgileriyle birlikte listeler.
**Nasıl yapar**: Dışarıda tanımlanmış olan bağımsız `listCartItemsWithProducts` fonksiyonunu çağırarak asenkron bir veritabanı sorgusu başlatır. Bu sorgu büyük olasılıkla bir JOIN işlemi veya PostgREST embed özelliği kullanarak `cart_items` tablosunu `products` tablosuyla ilişkilendirir. Fonksiyon, Supabase istemcisi ile birlikte sepet kimliğini (`cartId`) parametre olarak geçer.
**Parametreler**:
- cartId: `string` — Ürünlerin listeleneceği alışveriş sepetinin benzersiz tanımlayıcısı.
**Dönüş**: `listCartItemsWithProducts` fonksiyonunun dönüş değeri. Verilen bilgiye göre dönüş tipi belirtilmemiştir.

### upsertCartItem
**Ne yapar**: Bir sepete ürün ekler veya mevcut bir ürünün miktarını/parametrelerini günceller (yukarı ekleme-upsert).
**Nasıl yapar**: Fonksiyon, harici bir `upsertCartItem` modül fonksiyonunu çağırır. Bu modül fonksiyonuna `this.supabase` istemcisini ve verilen `payload` parametresini geçerek veritabanı işlemini başlatır. Bu, sepet öğesi eklemek/güncellemek için merkezi bir mantık uygular.
**Parametreler**:
- `payload`: `{ cartId: string; _productId: string; quantity: number; unitPrice?: number; priceListId?: string }` — Sepet işleminin tüm gerekli ve opsiyonel verilerini içeren bir nesne. `cartId` hedef sepetin, `_productId` ürünün, `quantity` miktarın, `unitPrice` birim fiyatın (opsiyonel), `priceListId` fiyat listesinin (opsiyonel) kimliğini/değerini tutar.
**Dönüş**: Fonksiyon, altındaki `upsertCartItem` modül fonksiyonunun Promise olarak döndürdüğü sonucu doğrudan iletir (veritabanı sonucu).

### removeCartItem
**Ne yapar**: Belirli bir sepetteki belirli bir ürünü kaldırır.
**Nasıl yapar**: Fonksiyon, harici bir `removeCartItem` modül fonksiyonunu çağırır. Bu fonksiyona `this.supabase` istemcisini, `cartId` ve `productId` parametrelerini geçirerek belirtilen ürünü sepetten silme işlemini başlatır.
**Parametreler**:
- `cartId`: `string` — Ürünü kaldırılacak sepetin benzersiz tanımlayıcısı.
- `productId`: `string` — Kaldırılacak ürünün benzersiz tanımlayıcısı.
**Dönüş**: Fonksiyon, altındaki `removeCartItem` modül fonksiyonunun Promise olarak döndürdüğü sonucu doğrudan iletir.

### clearCartItems
**Ne yapar**: Belirtilen sepetin içindeki tüm ürünleri toplu olarak kaldırır (sepeti temizler).
**Nasıl yapar**: Fonksiyon, harici bir `clearCartItems` modül fonksiyonunu çağırır. Bu fonksiyona `this.supabase` istemcisini ve `cartId` parametreterini geçirerek ilgili sepetin tüm öğelerini silme işlemini başlatır.
**Parametreler**:
- `cartId`: `string` — İçeriği temizlenecek sepetin benzersiz tanımlayıcısı.
**Dönüş**: Fonksiyon, altındaki `clearCartItems` modül fonksiyonunun Promise olarak döndürdüğü sonucu doğrudan iletir.

### constructor
**Ne yapar**: `ServiceRegistry` sınıfının bir örneğini oluşturur ve bağımlılık enjeksiyonu yapar.
**Nasıl yapar**: Sınıfın bir alanı olan `this.supabase`'i, constructor'a verilen `supabase` parametresiyle başlatır. Bu, servislerin veritabanı bağlantısını almasının temel yoludur. `private` anahtar kelimesi, parametrenin aynı zamanda sınıf alanı olarak da atanmasını sağlar.
**Parametreler**:
- `supabase`: `SupabaseClient<Database>` — Bu servislerin kullanacağı, veritabanı şeması (`Database`) ile güçlü tiplendirilmiş Supabase istemcisi örneği.
**Dönüş**: Fonksiyon bir constructor olduğu için doğrudan bir değer dönmez (geri dönüş tipi `void`).

### getCategories
**Ne yapar**: Veritabanından tüm ürün kategorilerinin listesini getirir.
**Nasıl yapar**: Fonksiyon, harici bir `getCategories` modül fonksiyonunu çağırır. Bu fonksiyona `this.supabase` istemcisini geçirerek kategorilerin okunma (listelenme) işlemini başlatır.
**Parametreler**: Fonksiyonun herhangi bir parametresi yoktur.
**Dönüş**: Fonksiyon, altındaki `getCategories` modül fonksiyonunun Promise olarak döndürdüğü kategori listesini (veya sonucunu) doğrudan iletir.

### constructor
**Ne yapar**: `ServiceRegistry` sınıfının bir örneğini oluşturur ve bağımlılık enjeksiyonu yapar.
**Nasıl yapar**: Sınıfın bir alanı olan `this.supabase`'i, constructor'a verilen `supabase` parametresiyle başlatır. Bu, servislerin veritabanı bağlantısını almasının temel yoludur. `private` anahtar kelimesi, parametrenin aynı zamanda sınıf alanı olarak da atanmasını sağlar.
**Parametreler**:
- `supabase`: `SupabaseClient<Database>` — Bu servislerin kullanacağı, veritabanı şeması (`Database`) ile güçlü tiplendirilmiş Supabase istemcisi örneği.
**Dönüş**: Fonksiyon bir constructor olduğu için doğrudan bir değer dönmez (geri dönüş tipi `void`).

### listInvoiceProfiles
**Ne yapar**: Mevcut tüm fatura profillerinin bir listesini getirir.
**Nasıl yapar**: Fonksiyon, harici bir `listInvoiceProfiles` modül fonksiyonunu çağırır. Bu fonksiyona `this.supabase` istemcisini geçirerek fatura profillerinin veritabanından okunmasını başlatır.
**Parametreler**: Fonksiyonun herhangi bir parametresi yoktur.
**Dönüş**: Fonksiyon, altındaki `listInvoiceProfiles` modül fonksiyonunun Promise olarak döndürdüğü fatura profili listesini doğrudan iletir.

### createInvoiceProfile
**Ne yapar**: Verilen verilerle yeni bir fatura profili oluşturur.
**Nasıl yapar**: Fonksiyon, harici bir `createInvoiceProfile` modül fonksiyonunu çağırır. Bu fonksiyona `this.supabase` istemcisini ve `payload` parametresini geçirerek veritabanına yeni bir fatura profili ekleme işlemini başlatır.
**Parametreler**:
- `payload`: `DbInvoiceProfileInsert` — Veritabanına eklenecek yeni fatura profilinin tüm alanlarını içeren veri nesnesi. Bu tip, veritabanı şemasına göre zorunlu ve opsiyonel alanları belirler.
**Dönüş**: Fonksiyon, altındaki `createInvoiceProfile` modül fonksiyonunun Promise olarak döndürdüğü sonucu (muhtemelen oluşturulan profilin kendisi) doğrudan iletir.

### updateInvoiceProfile
**Ne yapar**: Belirli bir ID'ye sahip mevcut bir fatura profilini günceller.
**Nasıl yapar**: Fonksiyon, harici bir `updateInvoiceProfile` modül fonksiyonunu çağırır. Bu fonksiyona `this.supabase` istemcisini, güncellenecek profilin `id`'sini ve güncellenecek alanları içeren `payload`'ı geçirerek veritabanı güncelleme işlemini başlatır.
**Parametreler**:
- `id`: `string` — Güncellenecek fatura profilinin benzersiz tanımlayıcısı.
- `payload`: `DbInvoiceProfileUpdate` — Güncellenecek alanları ve değerleri içeren veri nesnesi. Bu tip, veritabanı şemasına göre güncellenebilir alanları belirler.
**Dönüş**: Fonksiyon, altındaki `updateInvoiceProfile` modül fonksiyonunun Promise olarak döndürdüğü sonucu (muhtemelen güncellenen profilin güncel hali) doğrudan iletir.

### deleteInvoiceProfile
**Ne yapar**: Belirli bir ID'ye sahip fatura profilini siler.
**Nasıl yapar**: Fonksiyon, harici bir `deleteInvoiceProfile` modül fonksiyonunu çağırır. Bu fonksiyona `this.supabase` istemcisini ve silinecek profilin `id`'sini geçirerek veritabanından kaydı kaldırma işlemini başlatır.
**Parametreler**:
- `id`: `string` — Silinecek fatura profilinin benzersiz tanımlayıcısı.
**Dönüş**: Fonksiyon, altındaki `deleteInvoiceProfile` modül fonksiyonunun Promise olarak döndürdüğü sonucu doğrudan iletir.

### setDefaultInvoiceProfile
**Ne yapar**: Belirtilen fatura profilini, ilgili kullanıcının veya sistem konfigürasyonunun varsayılan fatura profili olarak ayarlar.
**Nasıl yapar**: Fonksiyon, bir Supabase istemcisi ve profil ID'si alır. Bu istemciyi ve ID'yi kullanarak, `setDefaultInvoiceProfile` adlı harici bir modül fonksiyonunu çağırır. Bu harici fonksiyon, veritabanında ilgili kayıt üzerinde güncelleme işlemi yaparak profile varsayılan statüsünü atar.
**Parametreler**:
- id: string — Varsayılan olarak ayarlanacak fatura profilinin benzersiz tanımlayıcısı.
**Dönüş**: Promise<any> — Harici fonksiyonun döndürdüğü sonucu, muhtemelen işlem durumunu veya güncellenen profil bilgisini içeren bir promise.

### fetchDefaultInvoiceProfile
**Ne yapar**: Sistemde yapılandırılmış olan veya aktif kullanıcının sahip olduğu varsayılan fatura profilini getirir.
**Nasıl yapar**: Fonksiyon, bir Supabase istemcisi alır ve bu istemciyi kullanarak `fetchDefaultInvoiceProfile` adlı harici bir modül fonksiyonunu çağırır. Bu harici fonksiyon, veritabanından varsayılan olarak işaretlenmiş fatura profilini sorgular ve sonucu döndürür.
**Parametreler**: Bu fonksiyonun parametresi yoktur.
**Dönüş**: Promise<any> — Harici fonksiyonun döndürdüğü sonucu, muhtemelen fatura profilinin verilerini veya null döndüren bir promise.

### constructor
**Ne yapar**: İlgili servis sınıfının bir örneğini oluşturur ve bağımlılık enjeksiyonu yapar.
**Nasıl yapar**: Bu, bir TypeScript yapıcı metodudur. `private` erişim belirteci ile `supabase` parametresini alır ve bu parametreyi sınıfın bir özel üyesine atar. Bu tasarım, servis metodlarının bu ortak Supabase istemcisini kullanmasını sağlar.
**Parametreler**:
- supabase: SupabaseClient<Database> — Servis tarafından kullanılacak Supabase istemcisi.
**Dönüş**: Bu bir yapıcıdır, doğrudan bir dönüş değeri yoktur.

### getEffectiveUnitPrice
**Ne yapar**: Belirli bir ürün için, varsa indirimler, vergiler veya özel fiyatlandırma kuralları uygulanmış geçerli birim fiyatı hesaplar veya getirir.
**Nasıl yapar**: Fonksiyon, bir Supabase istemcisi ve bir `Product` nesnesi alır. Bu bilgileri kullanarak `getEffectiveUnitPrice` adlı harici bir modül fonksiyonunu çağırır. Bu harici fonksiyon, ürün verilerini ve olası fiyatlandırma mantığını işleyerek nihai birim fiyatı hesaplar.
**Parametreler**:
- product: Product — Fiyatı hesaplanacak olan ürün nesnesi. Ürünün temel bilgilerini (örn. temel fiyat, kategori) içerir.
**Dönüş**: Promise<number | null> — Harici fonksiyonun döndürdüğü sonucu, hesaplanmış geçerli birim fiyatını veya fiyat bulunamazsa null değerini içeren bir promise.

### getEffectivePriceInfo
**Ne yapar**: Belirli bir ürün için, birim fiyatın yanı sıra ilgili tüm fiyatlandırma detaylarını (örn. para birimi, indirim oranı, vergi bilgisi) da içeren kapsamlı bir fiyat bilgi nesnesi getirir.
**Nasıl yapar**: Fonksiyon, bir Supabase istemcisi ve bir `Product` nesnesi alır. Bu bilgileri kullanarak `getEffectivePriceInfo` adlı harici bir modül fonksiyonunu çağırır. Bu harici fonksiyon, ürün ve fiyatlandırma kurallarını analiz ederek zenginleştirilmiş bir fiyat bilgi yapısı oluşturur.
**Parametreler**:
- product: Product — Fiyat bilgisi istenen ürün nesnesi.
**Dönüş**: Promise<PriceInfo | null> — Harici fonksiyonun döndürdüğü sonucu, detaylı fiyat bilgilerini (birim fiyat, para birimi, indirim vb.) içeren bir nesneyi veya bilgi bulunamazsa null değerini içeren bir promise.

### constructor
**Ne yapar**: İlgili servis sınıfının bir örneğini oluşturur ve bağımlılık enjeksiyonu yapar.
**Nasıl yapar**: Bu, bir TypeScript yapıcı metodudur. `private` erişim belirteci ile `supabase` parametresini alır ve bu parametreyi sınıfın bir özel üyesine atar. Bu tasarım, servis metodlarının bu ortak Supabase istemcisini kullanmasını sağlar.
**Parametreler**:
- supabase: SupabaseClient<Database> — Servis tarafından kullanılacak Supabase istemcisi.
**Dönüş**: Bu bir yapıcıdır, doğrudan bir dönüş değeri yoktur.

### getSearchSuggestions
**Ne yapar**: Kullanıcının girdiği kısmi bir arama sorgusuna dayanarak, eşleşen ürün adları veya anahtar kelimelerden oluşan bir öneri listesi döndürür.
**Nasıl yapar**: Fonksiyon, bir Supabase istemcisi, bir arama dizesi ve opsiyonel bir limit alır. Bu parametreleri kullanarak `getSearchSuggestions` adlı harici bir modül fonksiyonunu çağırır. Bu harici fonksiyon, veritabanında kısmi eşleşme (örn. LIKE sorgusu) yaparak önerileri bulur ve belirtilen limit kadar sonuç döndürür.
**Parametreler**:
- query: string — Arama motoruna girilen kısmi sorgu veya anahtar kelime.
- limit: number | undefined — Döndürülecek maksimal öneri sayısı. Tanımlanmazsa varsayılan bir değer kullanılır.
**Dönüş**: Promise<string[]> — Harici fonksiyonun döndürdüğü sonucu, eşleşen arama önerilerini içeren bir dize dizisi.

### ftsSearchProducts
**Ne yapar**: Full-Text Search (FTS) özelliğini kullanarak, belirtilen arama terimine göre ürünleri kapsamlı bir şekilde arar.
**Nasıl yapar**: Fonksiyon, bir Supabase istemcisi, bir arama terimi ve opsiyonel bir limit alır. Bu parametreleri kullanarak `ftsSearchProducts` adlı harici bir modül fonksiyonunu çağırır. Bu harici fonksiyon, veritabanında full-text search indekslerini sorgulayarak terimle anlamlı şekilde eşleşen ürünleri bulur ve döndürür.
**Parametreler**:
- term: string — Ürünlerde aranacak tam veya kısmi anahtar kelime/cümle.
- limit: number | undefined — Döndürülecek maksimal sonuç sayısı.
**Dönüş**: Promise<Product[]> — Harici fonksiyonun döndürdüğü sonucu, arama terimiyle eşleşen ürün nesnelerinden oluşan bir dizi.

### getProducts
**Ne yapar**: Belirli bir miktarda ürün listesini, temel bilgileriyle birlikte getirir.
**Nasıl yapar**: Fonksiyon, bir Supabase istemcisi ve opsiyonel bir limit alır. Bu parametreleri kullanarak `getProducts` adlı harici bir modül fonksiyonunu çağırır. Bu harici fonksiyon, veritabanından belirtilen limit kadar kaydı (örn. en son eklenenler veya varsayılan sıralamayla) sorgular ve döndürür.
**Parametreler**:
- limit: number | undefined — Getirilecek maksimal ürün sayısı. Tanımlanmazsa tüm ürünler döndürülebilir veya varsayılan bir limit uygulanabilir.
**Dönüş**: Promise<Product[]> — Harici fonksiyonun döndürdüğü sonucu, ürün nesnelerinden oluşan bir dizi.

### getAllProducts
**Ne yapar**: Veritabanında bulunan tüm ürün kayıtlarını, temel bilgileriyle birlikte getirir.
**Nasıl yapar**: Fonksiyon, bir Supabase istemcisi alır. Bu istemciyi kullanarak `getAllProducts` adlı harici bir modül fonksiyonunu çağırır. Bu harici fonksiyon, sınırlama olmadan (LIMITsiz) tüm ürünleri sorgular ve döndürür.
**Parametreler**: Bu fonksiyonun parametresi yoktur.
**Dönüş**: Promise<Product[]> — Harici fonksiyonun döndürdüğü sonucu, veritabanındaki tüm ürün nesnelerinden oluşan bir dizi.

### getProductsByCategory
**Ne yapar**: Belirli bir kategoriye (category) ait tüm ürünleri getirir.
**Nasıl yapar**: `getProductsByCategory` adlı harici (external) bir servis fonksiyonunu, sınıf içinde saklanan `this.supabase` istemcisini ve gelen `categoryId` parametreğini ileterek çağırır. Asenkron bir operasyondur ve sonucu bir Promise olarak döner. Bu yapı, veritabanı erişim mantığını (`getProductsByCategory` fonksiyonu) sınıfın kendi metodundan ayırarak modülerlik sağlar.
**Parametreler**:
- categoryId: `string` — Ürünlerin getirilmek istendiği kategorinin benzersiz tanımlayıcısı (ID).
**Dönüş**: Fonksiyonun kendisi bir `Promise` döner. Dönen değerin tipi, çağrılan `getProductsByCategory` harici fonksiyonunun dönüş tipine bağlıdır; bu durumda bir ürün listesi (örn. `Product[]`) veya hata durumu beklenir.

### getProductsBySubcategory
**Ne yapar**: Belirli bir alt kategoriye (subcategory) ait tüm ürünleri getirir.
**Nasıl yapar**: `getProductsBySubcategory` adlı harici bir servis fonksiyonunu, `this.supabase` istemcisini ve `subcategoryId` parametresini ileterek çağırır. Asenkron bir operasyondur ve sonucu bir Promise olarak döner. Kategori bazlı sorgulamadan daha spesifik bir alt kategori filtresi uygular.
**Parametreler**:
- subcategoryId: `string` — Ürünlerin getirilmek istendiği alt kategorinin benzersiz tanımlayıcısı (ID).
**Dönüş**: Bir `Promise` döner. Dönen değerin tipi, çağrılan harici fonksiyonun dönüş tipine bağlıdır; genellikle bir ürün listesi beklenir.

### getProductById
**Ne yapar**: Benzersiz bir tanımlayıcıya (ID) sahip tek bir ürünü getirir.
**Nasıl yapar**: `getProductById` adlı harici bir servis fonksiyonunu, `this.supabase` istemcisini ve ürünün `id` parametresini ileterek çağırır. Bu, en temel ve spesifik ürün sorgulama metodudur. Sonuç bir Promise içinde döner.
**Parametreler**:
- id: `string` — İstenen ürünün benzersiz tanımlayıcısı (ID).
**Dönüş**: Bir `Promise` döner. Dönen değerin tipi, çağrılan harici fonksiyonun dönüş tipine bağlıdır; bu durumda tek bir ürün nesnesi veya belirtilen ID ile eşleşen ürün bulunamazsa bir hata durumu/boş değer beklenir.

### getProductBySlugOrId
**Ne yapar**: Bir ürünün URL-dostu kısa adı (slug) veya benzersiz tanımlayıcısı (ID) ile ürünü getirir.
**Nasıl yapar**: `getProductBySlugOrId` adlı harici bir servis fonksiyonunu, `this.supabase` istemcisini ve esnek `identifier` parametresini ileterek çağırır. Bu metot, birincil arama anahtarı olarak slug kullanmayı tercih eden, ancak ID ile de erişimi destekleyen bir arama mantığına sahiptir. Sonuç bir Promise içinde döner.
**Parametreler**:
- identifier: `string` — Ürünü bulmak için kullanılan esnek tanımlayıcı. Bu değer bir slug (URL-dostu kısa ad) veya bir ID olabilir. Harici fonksiyonun hangi tür değer olduğunu belirleyip arama yapması beklenir.
**Dönüş**: Bir `Promise` döner. Dönen değerin tipi, çağrılan harici fonksiyonun dönüş tipine bağlıdır; bulunan ürün nesnesi veya eşleşme yoksa hata durumu beklenir.

### getProductBySlug
**Ne yapar**: Bir ürünün URL-dostu kısa adı (slug) ile ürünü getirir.
**Nasıl yapar**: `getProductBySlug` adlı harici bir servis fonksiyonunu, `this.supabase` istemcisi ve ürünün `slug` parametresini ileterek çağırır. Bu, `getProductBySlugOrId` metodundan daha spesifik, sadece slug tabanlı bir arama metodudur. Sonuç bir Promise içinde döner.
**Parametreler**:
- slug: `string` — İstenen ürünün URL-dostu kısa adı.
**Dönüş**: Bir `Promise` döner. Dönen değerin tipi, çağrılan harici fonksiyonun dönüş tipine bağlıdır; belirtilen slug ile eşleşen ürün nesnesi veya eşleşme yoksa hata durumu beklenir.

### getFeaturedProducts
**Ne yapar**: Öne çıkan (featured) ürünleri getirir.
**Nasıl yapar**: `getFeaturedProducts` adlı harici bir servis fonksiyonunu, sadece `this.supabase` istemcisini ileterek çağırır. Bu metot, genellikle ana sayfa veya özel kampanya bölümlerinde gösterilecek, önceden belirlenmiş (örn. veritabanında `is_featured` alanı işaretli) ürünleri sorgular. Parametre almayan bir metottur ve sonucu bir Promise olarak döner.
**Parametreler**: Parametre almaz.
**Dönüş**: Bir `Promise` döner. Dönen değerin tipi, çağrılan harici fonksiyonun dönüş tipine bağlıdır; genellikle öne çıkan ürünlerin bir listesi (örn. `Product[]`) beklenir.

### adminSearchProducts
**Ne yapar**: Yönetici (admin) paneli için ürünleri belirli bir sorgu metnine göre arar.
**Nasıl yapar**: `adminSearchProducts` adlı harici bir servis fonksiyonunu, `this.supabase` istemcisi ve `query` parametresini ileterek çağırır. Bu arama, yöneticinin ürünleri isim, açıklama, SKU gibi alanlarda serbest metin araması yapabilmesini sağlar. Arama sonuçları, yönetici arayüzüne özel olarak formatlanabilir (örn. daha fazla alan içerebilir). Sonuç bir Promise içinde döner.
**Parametreler**:
- query: `string` — Ürünlerde yapılacak serbest metin araması için kullanılan anahtar kelime veya cümle.
**Dönüş**: Bir `Promise` döner. Dönen değerin tipi, çağrılan harici fonksiyonun dönüş tipine bağlıdır; arama kriterlerine uyan ürünlerin bir listesi veya boş bir dizi beklenir.

### constructor
**Ne yapar**: ServiceRegistry sınıfının (veya türediği sınıfların) başlatıcısı olarak görev yapar. Bu metot, sınıf örneği oluşturulduğunda çağrılır ve bağımlılıkları (dependencies) sınıfa enjekte eder.
**Nasıl yapar**: `constructor` anahtar kelimesi ile tanımlanmış bir metottur. `private` erişim belirleyicisi ile tanımlanan `supabase` parametresi, bu sınıfın tüm metotları tarafından kullanılacak olan Supabase veritabanı istemcisini (client) temsil eder. TypeScript/JavaScript'deki `private` anahtar kelimesi, bu özelliğin sadece sınıf içinde erişilebilir olduğunu ve aynı zamanda bir class field olarak otomatik olarak atanacağını belirtir. Sınıf dışarıdan bu istemciyi doğrudan değiştiremez.
**Parametreler**:
- supabase: `SupabaseClient<Database>` — Bağımlılık olarak enjekte edilen, veritabanı işlemleri için kullanılacak Supabase istemcisi örneği. Generic tipi `Database` olarak belirtilmiştir, bu da veritabanı şemasının (tabloların, enumların vb.) TypeScript'e yansıtılmış tip tanımını ifade eder.
**Dönüş**: `void` veya belirtilmemiş. Bir constructor metodu olduğu için değer dönmez, sadece nesne başlatma işlemi yapar.

### listUserProjects
**Ne yapar**: Oturum açmış kullanıcının tüm projelerini listeler.
**Nasıl yapar**: `listUserProjects` adlı harici bir servis fonksiyonunu, `this.supabase` istemcisini ileterek çağırır. Bu metot, arka planda mevcut kullanıcının oturum bilgisine (authenticated user) erişerek, sadece o kullanıcıya ait projeleri (`user_projects` tablosundan) sorgular. Asenkron bir operasyondur ve sonuçları bir Promise olarak döner.
**Parametreler**: Parametre almaz.
**Dönüş**: Bir `Promise` döner. Dönen değerin tipi, çağrılan harici fonksiyonun dönüş tipine bağlıdır; kullanıcının projelerinden oluşan bir dizi (örn. `UserProject[]`) beklenir.

### createProject
**Ne yapar**: Yeni bir kullanıcı projesi oluşturur ve kaydeder.
**Nasıl yapar**: `createProject` adlı harici bir servis fonksiyonunu, `this.supabase` istemcisi ve `project` parametresini ileterek çağırır. `project` parametresi, veritabanına eklenecek yeni satırın (record) verilerini içeren bir nesnedir. `TablesInsert<'user_projects'>` tipi, `user_projects` tablosuna eklenebilecek geçerli veri yapısını (alan adlarını ve tiplerini) tanımlar. Asenkron operasyon sonucu Promise olarak döner.
**Parametreler**:
- project: `TablesInsert<'user_projects'>` — Oluşturulacak yeni projenin verilerini içeren nesne. Bu tip, `user_projects` tablosuna eklenebilecek tüm zorunlu ve opsiyonel alanların bir dökümüdür (örn. `title`, `description`, `user_id` vb.).
**Dönüş**: Bir `Promise` döner. Dönen değerin tipi, çağrılan harici fonksiyonun dönüş tipine bağlıdır; başarı durumunda oluşturulan yeni proje nesnesi (muhtemelen veritabanı tarafından otomatik eklenen `id`, `created_at` gibi alanları da içerir) veya hata durumu beklenir.

### deleteProject
**Ne yapar**: Belirtilen ID'ye sahip projeyi veritabanından siler.
**Nasıl yapar**: Fonksiyon, sınıf içinde tanımlı olan `deleteProject` import edilmiş fonksiyonunu çağırır. Bu çağrıya, sınıfa ait `this.supabase` istemcisini ve silinecek projenin `id` parametresini iletir. Asenkron bir işlemdir.
**Parametreler**:
- `id`: `string` — Silinecek projenin benzersiz tanımlayıcısı.
**Dönüş**: `Promise<...>` — İçe aktarılan `deleteProject` fonksiyonunun döndürdüğü sonucu döndürür.

### addProductToProject
**Ne yapar**: Belirli bir projeye bir ürün ekler.
**Nasıl yapar**: Sınıf içinde tanımlı olan `addProductToProject` import edilmiş fonksiyonunu çağırır. Bu çağrıya, Supabase istemcisi (`this.supabase`), proje ID'si, ürün ID'si ve opsiyonel olarak ürün miktarını iletir. Bu asenkron bir işlemdir.
**Parametreler**:
- `projectId`: `string` — Ürünün ekleneceği projenin benzersiz tanımlayıcısı.
- `productId`: `string` — Projeye eklenecek olan ürünün benzersiz tanımlayıcısı.
- `quantity?`: `number` — Eklenecek ürün miktarı. Belirtilmezse varsayılan bir değer kullanılabilir.
**Dönüş**: `Promise<...>` — İçe aktarılan `addProductToProject` fonksiyonunun döndürdüğü sonucu döndürür.

### removeProductFromProject
**Ne yapar**: Belirli bir projeden bir ürünü kaldırır.
**Nasıl yapar**: Sınıf içinde tanımlı olan `removeProductFromProject` import edilmiş fonksiyonunu çağırır. Bu çağrıya, Supabase istemcisi (`this.supabase`), proje ID'si ve kaldırılacak ürün ID'sini iletir. Bu asenkron bir işlemdir.
**Parametreler**:
- `projectId`: `string` — Ürünün kaldırılacağı projenin benzersiz tanımlayıcısı.
- `productId`: `string` — Projeden kaldırılacak olan ürünün benzersiz tanımlayıcısı.
**Dönüş**: `Promise<...>` — İçe aktarılan `removeProductFromProject` fonksiyonunun döndürdüğü sonucu döndürür.

### listProjectItems
**Ne yapar**: Belirli bir projeye ait tüm ürün kalemlerini listeler.
**Nasıl yapar**: Sınıf içinde tanımlı olan `listProjectItems` import edilmiş fonksiyonunu çağırır. Bu çağrıya, Supabase istemcisi (`this.supabase`) ve listelenecek projenin ID'sini iletir. Bu asenkron bir işlemdir.
**Parametreler**:
- `projectId`: `string` — Ürünlerin listeleneceği projenin benzersiz tanımlayıcısı.
**Dönüş**: `Promise<...>` — İçe aktarılan `listProjectItems` fonksiyonunun döndürdüğü sonucu döndürür.

### constructor
**Ne yapar**: `ServiceRegistry` sınıfının bir örneğini başlatır ve bağımlılıklarını enjekte eder.
**Nasıl yapar**: `ServiceRegistry` sınıfının yapıcı (constructor) metodudur. TypeScript'in `private` erişim belirteci kullanılarak, gelen `supabase` parametresini sınıfın `_supabase` private üyesine atar. Bu, sınıfın tüm metotlarının (örneğin, `deleteProject`, `addProductToProject` vb.) bu Supabase istemcisini kullanmasını sağlar.
**Parametreler**:
- `supabase`: `SupabaseClient<Database>` — Veritabanı bağlantısı için kullanılan ve yapılandırılmış bir Supabase istemci nesnesi.
**Dönüş**: Yok (`void`).

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

### [N1_NASIL] AST Pointer: registry.ts::AddressService.listAddresses
- **params**: (yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: this.supabase ile çağrılmış bağımsız `listAddresses` fonksiyonunun dönüşü; kullanıcının tüm adres listesini döndürür

---

### [N2_NASIL] AST Pointer: registry.ts::AddressService.createAddress
- **params**: (`payload`: DbUserAddressInsert — oluşturulacak adres verisi)
- **ic_degiskenler**: (yok)
- **Dönüş**: this.supabase ve payload ile çağrılmış bağımsız `createAddress` fonksiyonunun dönüşü; yeni oluşturulan kaydı döndürür

---

### [N3_NASIL] AST Pointer: registry.ts::AddressService.updateAddress
- **params**: (`id`: string — güncellenecek adresin ID'si, `payload`: DbUserAddressUpdate — güncelleme verisi)
- **ic_degiskenler**: (yok)
- **Dönüş**: this.supabase, id, payload ile çağrılmış bağımsız `updateAddress` fonksiyonunun dönüşü; güncellenen kaydı döndürür

---

### [N4_NASIL] AST Pointer: registry.ts::AddressService.deleteAddress
- **params**: (`id`: string — silinecek adresin ID'si)
- **ic_degiskenler**: (yok)
- **Dönüş**: this.supabase ve id ile çağrılmış bağımsız `deleteAddress` fonksiyonunun dönüşü; silme işleminin sonucunu döndürür

---

### [N5_NASIL] AST Pointer: registry.ts::AddressService.setDefaultAddress
- **params**: (`kind`: 'shipping' | 'billing' — adres türü, `id`: string — varsayılan yapılacak adresin ID'si)
- **ic_degiskenler**: (yok)
- **Dönüş**: this.supabase, kind, id ile çağrılmış bağımsız `setDefaultAddress` fonksiyonunun dönüşü; varsayılan adres güncelleme sonucunu döndürür

---

### [N6_NASIL] AST Pointer: registry.ts::CartService.getOrCreateShoppingCart
- **params**: (`userId`: string — kullanıcının ID'si)
- **ic_degiskenler**: (yok)
- **Dönüş**: this.supabase ve userId ile çağrılmış bağımsız `getOrCreateShoppingCart` fonksiyonunun dönüşü; mevcut veya yeni oluşturulan sepet nesnesini döndürür

---

### [N7_NASIL] AST Pointer: registry.ts::CartService.listCartItems
- **params**: (`cartId`: string — sepetin ID'si)
- **ic_degiskenler**: (yok)
- **Dönüş**: this.supabase ve cartId ile çağrılmış bağımsız `listCartItems` fonksiyonunun dönüşü;.sepetteki ürün kalemleri listesini döndürür

---

### [N8_NASIL] AST Pointer: registry.ts::CartService.listCartItemsWithProducts
- **params**: (`cartId`: string — sepetin ID'si)
- **ic_degiskenler**: (yok)
- **Dönüş**: this.supabase ve cartId ile çağrılmış bağımsız `listCartItemsWithProducts` fonksiyonunun dönüşü; ürün detaylarıyla zenginleştirilmiş sepet kalemlerini döndürür

---

### [N9_NASIL] AST Pointer: registry.ts::CartService.upsertCartItem
- **params**: (`payload`: { cartId: string; _productId: string; quantity: number; unitPrice?: number; priceListId?: string } — sepet kalemi ekleme/güncelleme verisi)
- **ic_degiskenler**: (yok)
- **Dönüş**: this.supabase ve payload ile çağrılmış bağımsız `upsertCartItem` fonksiyonunun dönüşü; eklenen/güncellenen sepet kalemini döndürür

---

### [N10_NASIL] AST Pointer: registry.ts::CartService.removeCartItem
- **params**: (`cartId`: string — sepetin ID'si, `productId`: string — kaldırılacak ürünün ID'si)
- **ic_degiskenler**: (yok)
- **Dönüş**: this.supabase, cartId, productId ile çağrılmış bağımsız `removeCartItem` fonksiyonunun dönüşü; kaldırma işleminin sonucunu döndürür

---

### [N11_NASIL] AST Pointer: registry.ts::CartService.clearCartItems
- **params**: (`cartId`: string — sepetin ID'si)
- **ic_degiskenler**: (yok)
- **Dönüş**: this.supabase ve cartId ile çağrılmış bağımsız `clearCartItems` fonksiyonunun dönüşü; sepetin tüm kalemlerini temizleme sonucunu döndürür

---

### [N12_NASIL] AST Pointer: registry.ts::CategoryService.getCategories
- **params**: (yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: this.supabase ile çağrılmış bağımsız `getCategories` fonksiyonunun dönüşü; kategori listesini döndürür

---

### [N13_NASIL] AST Pointer: registry.ts::InvoiceService.listInvoiceProfiles
- **params**: (yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: this.supabase ile çağrılmış bağımsız `listInvoiceProfiles` fonksiyonunun dönüşü; fatura profilleri listesini döndürür

---

### [N14_NASIL] AST Pointer: registry.ts::InvoiceService.createInvoiceProfile
- **params**: (`payload`: DbInvoiceProfileInsert — oluşturulacak fatura profili verisi)
- **ic_degiskenler**: (yok)
- **Dönüş**: this.supabase ve payload ile çağrılmış bağımsız `createInvoiceProfile` fonksiyonunun dönüşü; yeni oluşturulan fatura profilini döndürür

---

### [N15_NASIL] AST Pointer: registry.ts::InvoiceService.updateInvoiceProfile
- **params**: (`id`: string — güncellenecek fatura profilinin ID'si, `payload`: DbInvoiceProfileUpdate — güncelleme verisi)
- **ic_degiskenler**: (yok)
- **Dönüş**: this.supabase, id, payload ile çağrılmış bağımsız `updateInvoiceProfile` fonksiyonunun dönüşü; güncellenen fatura profilini döndürür

---

### [N16_NASIL] AST Pointer: registry.ts::InvoiceService.deleteInvoiceProfile
- **params**: (`id`: string — silinecek fatura profilinin ID'si)
- **ic_degiskenler**: (yok)
- **Dönüş**: this.supabase ve id ile çağrılmış bağımsız `deleteInvoiceProfile` fonksiyonunun dönüşü; silme işleminin sonucunu döndürür

---

### [N17_NASIL] AST Pointer: registry.ts::InvoiceService.setDefaultInvoiceProfile
- **params**: (`id`: string — varsayılan yapılacak fatura profilinin ID'si)
- **ic_degiskenler**: (yok)
- **Dönüş**: this.supabase ve id ile çağrılmış bağımsız `setDefaultInvoiceProfile` fonksiyonunun dönüşü; varsayılan fatura profilini ayarlama sonucunu döndürür

---

### [N18_NASIL] AST Pointer: registry.ts::InvoiceService.fetchDefaultInvoiceProfile
- **params**: (yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: this.supabase ile çağrılmış bağımsız `fetchDefaultInvoiceProfile` fonksiyonunun dönüşü; varsayılan fatura profilini döndürür

---

### [N19_NASIL] AST Pointer: registry.ts::PricingService.getEffectiveUnitPrice
- **params**: (`product`: Product — birim fiyat hesaplanacak ürün nesnesi)
- **ic_degiskenler**: (yok)
- **Dönüş**: this.supabase ve product ile çağrılmış bağımsız `getEffectiveUnitPrice` fonksiyonunun dönüşü; geçerli birim fiyatı (sayı) döndürür

---

### [N20_NASIL] AST Pointer: registry.ts::PricingService.getEffectivePriceInfo
- **params**: (`product`: Product — fiyat bilgisi hesaplanacak ürün nesnesi)
- **ic_degiskenler**: (yok)
- **Dönüş**: this.supabase ve product ile çağrılmış bağımsız `getEffectivePriceInfo` fonksiyonunun dönüşü; detaylı fiyat bilgisini döndürür

---

### [N21_NASIL] AST Pointer: registry.ts::ProductService.getSearchSuggestions
- **params**: (`query`: string — arama sorgusu, `limit?`: number — maksimum sonuç sayısı)
- **ic_degiskenler**: (yok)
- **Dönüş**: this.supabase, query, limit ile çağrılmış bağımsız `getSearchSuggestions` fonksiyonunun dönüşü; arama önerileri listesini döndürür

---

### [N22_NASIL] AST Pointer: registry.ts::ProductService.ftsSearchProducts
- **params**: (`term`: string — full-text arama terimi, `limit?`: number — maksimum sonuç sayısı)
- **ic_degiskenler**: (yok)
- **Dönüş**: this.supabase, term, limit ile çağrılmış bağımsız `ftsSearchProducts` fonksiyonunun dönüşü; full-text arama sonuçlarını döndürür

---

### [N23_NASIL] AST Pointer: registry.ts::ProductService.getProducts
- **params**: (`limit?`: number — maksimum ürün sayısı)
- **ic_degiskenler**: (yok)
- **Dönüş**: this.supabase ve limit ile çağrılmış bağımsız `getProducts` fonksiyonunun dönüşü; ürün listesini döndürür

---

### [N24_NASIL] AST Pointer: registry.ts::ProductService.getAllProducts
- **params**: (yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: this.supabase ile çağrılmış bağımsız `getAllProducts` fonksiyonunun dönüşü; tüm ürünleri döndürür

---

### [N25_NASIL] AST Pointer: registry.ts::ProductService.getProductsByCategory
- **params**: (`categoryId`: string — kategori ID'si)
- **ic_degiskenler**: (yok)
- **Dönüş**: this.supabase ve categoryId ile çağrılmış bağımsız `getProductsByCategory` fonksiyonunun dönüşü; belirli kategorideki ürünleri döndürür

---

### [N26_NASIL] AST Pointer: registry.ts::ProductService.getProductsBySubcategory
- **params**: (`subcategoryId`: string — alt kategori ID'si)
- **ic_degiskenler**: (yok)
- **Dönüş**: this.supabase ve subcategoryId ile çağrılmış bağımsız `getProductsBySubcategory` fonksiyonunun dönüşü; belirli alt kategorideki ürünleri döndürür

---

### [N27_NASIL] AST Pointer: registry.ts::ProductService.getProductById
- **params**: (`id`: string — ürün ID'si)
- **ic_degiskenler**: (yok)
- **Dönüş**: this.supabase ve id ile çağrılmış bağımsız `getProductById` fonksiyonunun dönüşü; tek bir ürünü döndürür

---

### [N28_NASIL] AST Pointer: registry.ts::ProductService.getProductBySlugOrId
- **params**: (`identifier`: string — ürün slug'ı veya ID'si)
- **ic_degiskenler**: (yok)
- **Dönüş**: this.supabase ve identifier ile çağrılmış bağımsız `getProductBySlugOrId` fonksiyonunun dönüşü; slug veya ID ile bulunan tek ürünü döndürür

---

### [N29_NASIL] AST Pointer: registry.ts::ProductService.getProductBySlug
- **params**: (`slug`: string — ürün slug'ı)
- **ic_degiskenler**: (yok)
- **Dönüş**: this.supabase ve slug ile çağrılmış bağımsız `getProductBySlug` fonksiyonunun dönüşü; slug ile bulunan tek ürünü döndürür

---

### [N30_NASIL] AST Pointer: registry.ts::ProductService.getFeaturedProducts
- **params**: (yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: this.supabase ile çağrılmış bağımsız `getFeaturedProducts` fonksiyonunun dönüşü; öne çıkan ürünleri döndürür

---

### [N31_NASIL] AST Pointer: registry.ts::ProductService.adminSearchProducts
- **params**: (`query`: string — admin arama sorgusu)
- **ic_degiskenler**: (yok)
- **Dönüş**: this.supabase ve query ile çağrılmış bağımsız `adminSearchProducts` fonksiyonunun dönüşü; admin arama sonuçlarını döndürür

---

### [N32_NASIL] AST Pointer: registry.ts::ProjectService.listUserProjects
- **params**: (yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: this.supabase ile çağrılmış bağımsız `listUserProjects` fonksiyonunun dönüşü; kullanıcının proje listesini döndürür

---

### [N33_NASIL] AST Pointer: registry.ts::ProjectService.createProject
- **params**: (`project`: TablesInsert<'user_projects'> — oluşturulacak proje verisi)
- **ic_degiskenler**: (yok)
- **Dönüş**: this.supabase ve project ile çağrılmış bağımsız `createProject` fonksiyonunun dönüşü; yeni oluşturulan projeyi döndürür

---

### [N34_NASIL] AST Pointer: registry.ts::ProjectService.deleteProject
- **params**: (`id`: string — silinecek projenin ID'si)
- **ic_degiskenler**: (yok)
- **Dönüş**: this.supabase ve id ile çağrılmış bağımsız `deleteProject` fonksiyonunun dönüşü; silme işleminin sonucunu döndürür

---

### [N35_NASIL] AST Pointer: registry.ts::ProjectService.addProductToProject
- **params**: (`projectId`: string — projenin ID'si, `productId`: string — eklenecek ürünün ID'si, `quantity?`: number — eklenecek miktar)
- **ic_degiskenler**: (yok)
- **Dönüş**: this.supabase, projectId, productId, quantity ile çağrılmış bağımsız `addProductToProject` fonksiyonunun dönüşü; eklenen proje kalemini döndürür

---

### [N36_NASIL] AST Pointer: registry.ts::ProjectService.removeProductFromProject
- **params**: (`projectId`: string — projenin ID'si, `productId`: string — kaldırılacak ürünün ID'si)
- **ic_degiskenler**: (yok)
- **Dönüş**: this.supabase, projectId, productId ile çağrılmış bağımsız `removeProductFromProject` fonksiyonunun dönüşü; kaldırma işleminin sonucunu döndürür

---

### [N37_NASIL] AST Pointer: registry.ts::ProjectService.listProjectItems
- **params**: (`projectId`: string — projenin ID'si)
- **ic_degiskenler**: (yok)
- **Dönüş**: this.supabase ve projectId ile çağrılmış bağımsız `listProjectItems` fonksiyonunun dönüşü; projedeki ürün kalemleri listesini döndürür

---

### [N38_NASIL] AST Pointer: registry.ts::ServiceRegistry.constructor
- **params**: (`supabase`: SupabaseClient<Database> — Supabase istemcisi, private alan olarak saklanır)
- **ic_degiskenler**:
  - `this.supabase` — constructor parametresinden alınan SupabaseClient<Database> referansı, tüm alt servislere aktarılır
  - `this.address` — `new AddressService(this.supabase)` ile oluşturulan AddressService örneği; adres CRUD işlemlerini yönetir
  - `this.cart` — `new CartService(this.supabase)` ile oluşturulan CartService örneği; sepet işlemlerini yönetir
  - `this.category` — `new CategoryService(this.supabase)` ile oluşturulan CategoryService örneği; kategori okuma işlemlerini yönetir
  - `this.invoice` — `new InvoiceService(this.supabase)` ile oluşturulan InvoiceService örneği; fatura profili CRUD işlemlerini yönetir
  - `this.pricing` — `new PricingService(this.supabase)` ile oluşturulan PricingService örneği; fiyat hesaplama işlemlerini yönetir
  - `this.product` — `new ProductService(this.supabase)` ile oluşturulan ProductService örneği; ürün CRUD ve arama işlemlerini yönetir
  - `this.project` — `new ProjectService(this.supabase)` ile oluşturulan ProjectService örneği; proje CRUD işlemlerini yönetir
- **Dönüş**: yok (constructor); yan etki olarak 7 adet servis örneği oluşturur ve readonly alanlara atar

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
    registry_ts__getSearchSuggestions["getSearchSuggestions"]
    registry_ts__listAddresses["listAddresses"]
    registry_ts__listCartItems["listCartItems"]
    registry_ts__listCartItemsWithProducts["listCartItemsWithProducts"]
    registry_ts__listInvoiceProfiles["listInvoiceProfiles"]
    registry_ts__listProjectItems["listProjectItems"]
    registry_ts__listUserProjects["listUserProjects"]
    registry_ts__removeCartItem["removeCartItem"]
    registry_ts__removeProductFromProject["removeProductFromProject"]
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