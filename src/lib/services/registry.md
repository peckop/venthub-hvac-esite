---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\ops-t165\src\lib\services\registry.ts
skeleton_hash: adf6f80ec27738e9
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
generated_at: 2026-08-27T07:07:30Z
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
**Ne yapar**: ServiceRegistry sınıfının yapıcı metodudur. Sınıf örneği oluşturulurken Supabase istemcisini sınıf içinde kullanıma hazırlar.
**Nasıl yapar**: Parametre olarak gelen Supabase istemcisini sınıfın private bir özelliği olarak saklar. Bu sayede sınıfın diğer metotları bu istemciyi kullanarak veritabanı işlemlerini gerçekleştirebilir.
**Parametreler**:
- supabase: SupabaseClient<Database> — Supabase veritabanı bağlantısını temsil eden istemci nesnesi
**Dönüş**: Bilinmiyor (gövdede return ifadesi yok)

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
**Ne yapar**: Sepet öğesini ekler veya günceller. "Upsert" işlemi, öğe yoksa ekler, varsa günceller.
**Nasıl yapar**: Bu metot, CartService sınıfının bir metodudur ve asenkron olarak çalışır. Kendi sınıfının `this.supabase` özelliğini ve gelen payload parametresini alarak harici `upsertCartItem` fonksiyonuna yönlendirir. İşlemin kendisi bu fonksiyon tarafından gerçekleştirilir.
**Parametreler**:
- payload: { cartId: string; _productId: string; quantity: number; unitPrice?: number; priceListId?: string } — Sepet öğesi bilgilerini içeren nesne. cartId sepet kimliğini, _productId ürün kimliğini, quantity miktarı, unitPrice birim fiyatı (isteğe bağlı), priceListId fiyat listesi kimliğini (isteğe bağlı) temsil eder.
**Dönüş**: Harici `upsertCartItem` fonksiyonunun dönüş değerini döndürür (dönüş tipi belirtilmemiş).

### removeCartItem
**Ne yapar**: Belirli bir sepetteki belirli bir ürünü kaldırır.
**Nasıl yapar**: Bu metot, CartService sınıfının bir metodudur ve asenkron olarak çalışır. Kendi sınıfının `this.supabase` özelliğini ve gelen parametreleri alarak harici `removeCartItem` fonksiyonuna yönlendirir. İşlemin kendisi bu fonksiyon tarafından gerçekleştirilir.
**Parametreler**:
- cartId: string — Ürünün kaldırılacağı sepetin kimliği
- productId: string — Kaldırılacak ürünün kimliği
**Dönüş**: Harici `removeCartItem` fonksiyonunun dönüş değerini döndürür (dönüş tipi belirtilmemiş).

### clearCartItems
**Ne yapar**: Belirli bir sepetin tüm öğelerini temizler.
**Nasıl yapar**: Bu metot, CartService sınıfının bir metodudur ve asenkron olarak çalışır. Kendi sınıfının `this.supabase` özelliğini ve gelen parametreyi alarak harici `clearCartItems` fonksiyonuna yönlendirir. İşlemin kendisi bu fonksiyon tarafından gerçekleştirilir.
**Parametreler**:
- cartId: string — Temizlenecek sepetin kimliği
**Dönüş**: Harici `clearCartItems` fonksiyonunun dönüş değerini döndürür (dönüş tipi belirtilmemiş).

### constructor
**Ne yapar**: ServiceRegistry sınıfının yapıcı metodudur. Sınıf örneği oluşturulurken Supabase istemcisini sınıf içinde kullanıma hazırlar.
**Nasıl yapar**: Parametre olarak gelen Supabase istemcisini sınıfın private bir özelliği olarak saklar. Bu sayede sınıfın diğer metotları bu istemciyi kullanarak veritabanı işlemlerini gerçekleştirebilir.
**Parametreler**:
- supabase: SupabaseClient<Database> — Supabase veritabanı bağlantısını temsil eden istemci nesnesi
**Dönüş**: Bilinmiyor (gövdede return ifadesi yok)

### getCategories
**Ne yapar**: Kategorileri getirir.
**Nasıl yapar**: Bu metot, CategoryService sınıfının bir metodudur ve asenkron olarak çalışır. Kendi sınıfının `this.supabase` özelliğini alarak harici `getCategories` fonksiyonuna yönlendirir. İşlemin kendisi bu fonksiyon tarafından gerçekleştirilir.
**Parametreler**: Parametre almaz.
**Dönüş**: Harici `getCategories` fonksiyonunun dönüş değerini döndürür (dönüş tipi belirtilmemiş).

### constructor
**Ne yapar**: ServiceRegistry sınıfının yapıcı metodudur. Sınıf örneği oluşturulurken Supabase istemcisini sınıf içinde kullanıma hazırlar.
**Nasıl yapar**: Parametre olarak gelen Supabase istemcisini sınıfın private bir özelliği olarak saklar. Bu sayede sınıfın diğer metotları bu istemciyi kullanarak veritabanı işlemlerini gerçekleştirebilir.
**Parametreler**:
- supabase: SupabaseClient<Database> — Supabase veritabanı bağlantısını temsil eden istemci nesnesi
**Dönüş**: Bilinmiyor (gövdede return ifadesi yok)

### listInvoiceProfiles
**Ne yapar**: Fatura profillerini listeler.
**Nasıl yapar**: Bu metot, InvoiceService sınıfının bir metodudur ve asenkron olarak çalışır. Kendi sınıfının `this.supabase` özelliğini alarak harici `listInvoiceProfiles` fonksiyonuna yönlendirir. İşlemin kendisi bu fonksiyon tarafından gerçekleştirilir.
**Parametreler**: Parametre almaz.
**Dönüş**: Harici `listInvoiceProfiles` fonksiyonunun dönüş değerini döndürür (dönüş tipi belirtilmemiş).

### createInvoiceProfile
**Ne yapar**: Yeni bir fatura profili oluşturur.
**Nasıl yapar**: Bu metot, InvoiceService sınıfının bir metodudur ve asenkron olarak çalışır. Kendi sınıfının `this.supabase` özelliğini ve gelen payload parametresini alarak harici `createInvoiceProfile` fonksiyonuna yönlendirir. İşlemin kendisi bu fonksiyon tarafından gerçekleştirilir.
**Parametreler**:
- payload: DbInvoiceProfileInsert — Oluşturulacak fatura profilinin verilerini içeren nesne
**Dönüş**: Harici `createInvoiceProfile` fonksiyonunun dönüş değerini döndürür (dönüş tipi belirtilmemiş).

### updateInvoiceProfile
**Ne yapar**: Mevcut bir fatura profilini günceller.
**Nasıl yapar**: Bu metot, InvoiceService sınıfının bir metodudur ve asenkron olarak çalışır. Kendi sınıfının `this.supabase` özelliğini ve gelen parametreleri alarak harici `updateInvoiceProfile` fonksiyonuna yönlendirir. İşlemin kendisi bu fonksiyon tarafından gerçekleştirilir.
**Parametreler**:
- id: string — Güncellenecek fatura profilinin kimliği
- payload: DbInvoiceProfileUpdate — Güncellenecek fatura profilinin yeni verilerini içeren nesne
**Dönüş**: Harici `updateInvoiceProfile` fonksiyonunun dönüş değerini döndürür (dönüş tipi belirtilmemiş).

### deleteInvoiceProfile
**Ne yapar**: Belirtilen kimliğe sahip fatura profilini siler. Bu işlem, `InvoiceService` sınıfı üzerinden yürütülür ve veritabanında ilgili kaydın kaldırılmasını sağlar.

**Nasıl yapar**: Fonksiyon, aldığı `id` parametresini ve sınıfın `this.supabase` bağlantısını harici `deleteInvoiceProfile` fonksiyonuna aktararak silme işlemini gerçekleştirir. İş mantığı bu sınıf içinde değil, dışarıdaki bağımsız fonksiyonda tanımlıdır.

**Parametreler**:
- id: string — Silinecek fatura profilinin benzersiz kimlik numarası

**Dönüş**: Harici `deleteInvoiceProfile` fonksiyonunun dönüş değerini aynen iletir. Kesin dönüş tipi belirtilmemiştir.

### setDefaultInvoiceProfile
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

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

### getSearchSuggestions
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

### ftsSearchProducts
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

### getProducts
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

### getAllProducts
**Ne yapar**: ProductService sınıfının tüm ürünleri getiren asenkron metodudur. Ürünlerin tamamını getirmek için üst kapsam fonksiyonu çağırır.
**Nasıl yapar**: Sınıf içindeki `this.supabase` nesnesini parametre olarak `getAllProducts` fonksiyonuna aktarır ve sonucu doğrudan döndürür. İş mantığı bu metodun içinde değil, çağrılan üst kapsam fonksiyonda yer alır.
**Parametreler**:
- Bu metod herhangi bir parametre almaz.
**Dönüş**: Dönüş tipi belirtilmemiştir, bilinmiyor.

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

### adminSearchProducts
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

### constructor
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

### listUserProjects
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

### createProject
**Ne yapar**: Yeni bir kullanıcı projesi oluşturur. Verilen proje verilerini kullanarak projeyi veritabanına ekler.
**Nasıl yapar**: `ProjectService` sınıfının bir metodu olarak çalışır. Sınıf içindeki `this.supabase` Supabase istemcisini alır ve dışarıda tanımlı `createProject` fonksiyonuna hem bu istemciyi hem de proje verisini aktararak çağırır. İşin asıl yükü dışarıdaki `createProject` fonksiyonuna devredilir.
**Parametreler**:
- project: TablesInsert<'user_projects'> — Oluşturulacak projenin veritabanına eklenecek verilerini içeren nesne. `TablesInsert<'user_projects'>` tipi, `user_projects` tablosuna insert işlemi için gerekli alanları tanımlar.
**Dönüş**: Dışarıdaki `createProject` fonksiyonunun dönüş değerini aynen iletir. Dönüş tipi bu fonksiyonun tanımına bağlıdır ve kaynakta belirtilmemiştir.

### deleteProject
**Ne yapar**: Belirtilen kimliğe sahip kullanıcı projesini siler.
**Nasıl yapar**: `ProjectService` sınıfının bir metodu olarak çalışır. Sınıf içindeki `this.supabase` Supabase istemcisini alır ve dışarıda tanımlı `deleteProject` fonksiyonuna hem bu istemciyi hem de silinecek projenin kimliğini aktararak çağırır. İşin asıl yükü dışarıdaki `deleteProject` fonksiyonuna devredilir.
**Parametreler**:
- id: string — Silinecek projenin benzersiz kimlik değeri.
**Dönüş**: Dışarıdaki `deleteProject` fonksiyonunun dönüş değerini aynen iletir. Dönüş tipi bu fonksiyonun tanımına bağlıdır ve kaynakta belirtilmemiştir.

### addProductToProject
**Ne yapar**: Belirtilen projeye bir ürün ekler. İsteğe bağlı olarak ürün miktarı da belirtilebilir.
**Nasıl yapar**: `ProjectService` sınıfının bir metodu olarak çalışır. Sınıf içindeki `this.supabase` Supabase istemcisini alır ve dışarıda tanımlı `addProductToProject` fonksiyonuna bu istemciyi, proje kimliğini, ürün kimliğini ve opsiyonel miktar bilgisini aktararak çağırır. İşin asıl yükü dışarıdaki `addProductToProject` fonksiyonuna devredilir.
**Parametreler**:
- projectId: string — Ürünün ekleneceği projenin benzersiz kimlik değeri.
- productId: string — Projeye eklenecek ürünün benzersiz kimlik değeri.
- quantity?: number — Eklenecek ürünün miktarı. Opsiyonel parametre olup belirtilmezse varsayılan değer kullanılır.
**Dönüş**: Dışarıdaki `addProductToProject` fonksiyonunun dönüş değerini aynen iletir. Dönüş tipi bu fonksiyonun tanımına bağlıdır ve kaynakta belirtilmemiştir.

### removeProductFromProject
**Ne yapar**: Belirtilen projeden bir ürünü kaldırır.
**Nasıl yapar**: `ProjectService` sınıfının bir metodu olarak çalışır. Sınıf içindeki `this.supabase` Supabase istemcisini alır ve dışarıda tanımlı `removeProductFromProject` fonksiyonuna hem bu istemciyi hem de proje ve ürün kimliklerini aktararak çağırır. İşin asıl yükü dışarıdaki `removeProductFromProject` fonksiyonuna devredilir.
**Parametreler**:
- projectId: string — Ürünün kaldırılacağı projenin benzersiz kimlik değeri.
- productId: string — Projeden kaldırılacak ürünün benzersiz kimlik değeri.
**Dönüş**: Dışarıdaki `removeProductFromProject` fonksiyonunun dönüş değerini aynen iletir. Dönüş tipi bu fonksiyonun tanımına bağlıdır ve kaynakta belirtilmemiştir.

### listProjectItems
**Ne yapar**: Belirtilen projeye ait tüm öğeleri listeler.
**Nasıl yapar**: `ProjectService` sınıfının bir metodu olarak çalışır. Sınıf içindeki `this.supabase` Supabase istemcisini alır ve dışarıda tanımlı `listProjectItems` fonksiyonuna hem bu istemciyi hem de proje kimliğini aktararak çağırır. İşin asıl yükü dışarıdaki `listProjectItems` fonksiyonuna devredilir.
**Parametreler**:
- projectId: string — Öğeleri listelenecek projenin benzersiz kimlik değeri.
**Dönüş**: Dışarıdaki `listProjectItems` fonksiyonunun dönüş değerini aynen iletir. Dönüş tipi bu fonksiyonun tanımına bağlıdır ve kaynakta belirtilmemiştir.

### constructor
**Ne yapar**: `ServiceRegistry` sınıfını başlatır ve sınıf içinde kullanılacak Supabase istemcisini tanımlar.
**Nasıl yapar**: TypeScript constructor sözdizimi kullanılarak `supabase` parametresi doğrudan sınıfın özel (private) özelliği olarak atanır. `private` anahtar kelimesi, bu özelliğin yalnızca sınıf içinden erişilebilir olduğunu belirtir. Bu sayede sınıfın diğer metotları `this.supabase` üzerinden veritabanı işlemlerini gerçekleştirebilir.
**Parametreler**:
- supabase: SupabaseClient<Database> — Veritabanı bağlantısını ve işlemlerini yöneten Supabase istemci nesnesi. `Database` genel tipi, veritabanı şemasının TypeScript tarafındaki tip tanımlarını temsil eder.
**Dönüş**: Kaynakta dönüş tipi belirtilmemiştir.

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
- **params**: `supabase: SupabaseClient<Database>`
- **ic_degiskenler**:
  - `supabase` — constructor parametresi, Supabase istemcisi
- **Dönüş**: yok

### [N2_NASIL] AST Pointer: src/lib/services/registry.ts::AddressService.listAddresses
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `this.supabase` — sınıf içinde saklanan Supabase istemcisi, `listAddresses` fonksiyonuna aktarılır
- **Dönüş**: `listAddresses(this.supabase)` fonksiyonunun dönüşü

### [N3_NASIL] AST Pointer: src/lib/services/registry.ts::AddressService.createAddress
- **params**: `payload: DbUserAddressInsert`
- **ic_degiskenler**:
  - `payload` — eklenecek adres verisi
  - `this.supabase` — sınıf içinde saklanan Supabase istemcisi, `createAddress` fonksiyonuna aktarılır
- **Dönüş**: `createAddress(this.supabase, payload)` fonksiyonunun dönüşü

### [N4_NASIL] AST Pointer: src/lib/services/registry.ts::AddressService.updateAddress
- **params**: `id: string`, `payload: DbUserAddressUpdate`
- **ic_degiskenler**:
  - `id` — güncellenecek adresin kimliği
  - `payload` — güncellenecek adres verisi
  - `this.supabase` — sınıf içinde saklanan Supabase istemcisi, `updateAddress` fonksiyonuna aktarılır
- **Dönüş**: `updateAddress(this.supabase, id, payload)` fonksiyonunun dönüşü

### [N5_NASIL] AST Pointer: src/lib/services/registry.ts::AddressService.deleteAddress
- **params**: `id: string`
- **ic_degiskenler**:
  - `id` — silinecek adresin kimliği
  - `this.supabase` — sınıf içinde saklanan Supabase istemcisi, `deleteAddress` fonksiyonuna aktarılır
- **Dönüş**: `deleteAddress(this.supabase, id)` fonksiyonunun dönüşü

### [N6_NASIL] AST Pointer: src/lib/services/registry.ts::AddressService.setDefaultAddress
- **params**: `kind: 'shipping' | 'billing'`, `id: string`
- **ic_degiskenler**:
  - `kind` — adres türü (kargo veya fatura)
  - `id` — varsayılan yapılacak adresin kimliği
  - `this.supabase` — sınıf içinde saklanan Supabase istemcisi, `setDefaultAddress` fonksiyonuna aktarılır
- **Dönüş**: `setDefaultAddress(this.supabase, kind, id)` fonksiyonunun dönüşü

### [N7_NASIL] AST Pointer: src/lib/services/registry.ts::CartService.constructor
- **params**: `supabase: SupabaseClient<Database>`
- **ic_degiskenler**:
  - `supabase` — constructor parametresi, Supabase istemcisi
- **Dönüş**: yok

### [N8_NASIL] AST Pointer: src/lib/services/registry.ts::CartService.getOrCreateShoppingCart
- **params**: `userId: string`
- **ic_degiskenler**:
  - `userId` — kullanıcı kimliği
  - `this.supabase` — sınıf içinde saklanan Supabase istemcisi, `getOrCreateShoppingCart` fonksiyonuna aktarılır
- **Dönüş**: `getOrCreateShoppingCart(this.supabase, userId)` fonksiyonunun dönüşü

### [N9_NASIL] AST Pointer: src/lib/services/registry.ts::CartService.listCartItems
- **params**: `cartId: string`
- **ic_degiskenler**:
  - `cartId` — sepet kimliği
  - `this.supabase` — sınıf içinde saklanan Supabase istemcisi, `listCartItems` fonksiyonuna aktarılır
- **Dönüş**: `listCartItems(this.supabase, cartId)` fonksiyonunun dönüşü

### [N10_NASIL] AST Pointer: src/lib/services/registry.ts::CartService.listCartItemsWithProducts
- **params**: `cartId: string`
- **ic_degiskenler**:
  - `cartId` — sepet kimliği
  - `this.supabase` — sınıf içinde saklanan Supabase istemcisi, `listCartItemsWithProducts` fonksiyonuna aktarılır
- **Dönüş**: `listCartItemsWithProducts(this.supabase, cartId)` fonksiyonunun dönüşü

### [N11_NASIL] AST Pointer: src/lib/services/registry.ts::CartService.upsertCartItem
- **params**: `payload: { cartId: string; _productId: string; quantity: number; unitPrice?: number; priceListId?: string }`
- **ic_degiskenler**:
  - `payload` — sepete eklenecek/güncellenecek ürün verisi (cartId, _productId, quantity, unitPrice, priceListId alanlarını içerir)
  - `this.supabase` — sınıf içinde saklanan Supabase istemcisi, `upsertCartItem` fonksiyonuna aktarılır
- **Dönüş**: `upsertCartItem(this.supabase, payload)` fonksiyonunun dönüşü

### [N12_NASIL] AST Pointer: src/lib/services/registry.ts::CartService.removeCartItem
- **params**: `cartId: string`, `productId: string`
- **ic_degiskenler**:
  - `cartId` — sepet kimliği
  - `productId` — kaldırılacak ürünün kimliği
  - `this.supabase` — sınıf içinde saklanan Supabase istemcisi, `removeCartItem` fonksiyonuna aktarılır
- **Dönüş**: `removeCartItem(this.supabase, cartId, productId)` fonksiyonunun dönüşü

### [N13_NASIL] AST Pointer: src/lib/services/registry.ts::CartService.clearCartItems
- **params**: `cartId: string`
- **ic_degiskenler**:
  - `cartId` — temizlenecek sepetin kimliği
  - `this.supabase` — sınıf içinde saklanan Supabase istemcisi, `clearCartItems` fonksiyonuna aktarılır
- **Dönüş**: `clearCartItems(this.supabase, cartId)` fonksiyonunun dönüşü

### [N14_NASIL] AST Pointer: src/lib/services/registry.ts::CategoryService.constructor
- **params**: `supabase: SupabaseClient<Database>`
- **ic_degiskenler**:
  - `supabase` — constructor parametresi, Supabase istemcisi
- **Dönüş**: yok

### [N15_NASIL] AST Pointer: src/lib/services/registry.ts::CategoryService.getCategories
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `this.supabase` — sınıf içinde saklanan Supabase istemcisi, `getCategories` fonksiyonuna aktarılır
- **Dönüş**: `getCategories(this.supabase)` fonksiyonunun dönüşü

### [N16_NASIL] AST Pointer: src/lib/services/registry.ts::InvoiceService.constructor
- **params**: `supabase: SupabaseClient<Database>`
- **ic_degiskenler**:
  - `supabase` — constructor parametresi, Supabase istemcisi
- **Dönüş**: yok

### [N17_NASIL] AST Pointer: src/lib/services/registry.ts::InvoiceService.listInvoiceProfiles
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `this.supabase` — sınıf içinde saklanan Supabase istemcisi, `listInvoiceProfiles` fonksiyonuna aktarılır
- **Dönüş**: `listInvoiceProfiles(this.supabase)` fonksiyonunun dönüşü

### [N18_NASIL] AST Pointer: src/lib/services/registry.ts::InvoiceService.createInvoiceProfile
- **params**: `payload: DbInvoiceProfileInsert`
- **ic_degiskenler**:
  - `payload` — eklenecek fatura profili verisi
  - `this.supabase` — sınıf içinde saklanan Supabase istemcisi, `createInvoiceProfile` fonksiyonuna aktarılır
- **Dönüş**: `createInvoiceProfile(this.supabase, payload)` fonksiyonunun dönüşü

### [N19_NASIL] AST Pointer: src/lib/services/registry.ts::InvoiceService.updateInvoiceProfile
- **params**: `id: string`, `payload: DbInvoiceProfileUpdate`
- **ic_degiskenler**:
  - `id` — güncellenecek fatura profilinin kimliği
  - `payload` — güncellenecek fatura profili verisi
  - `this.supabase` — sınıf içinde saklanan Supabase istemcisi, `updateInvoiceProfile` fonksiyonuna aktarılır
- **Dönüş**: `updateInvoiceProfile(this.supabase, id, payload)` fonksiyonunun dönüşü

### [N20_NASIL] AST Pointer: src/lib/services/registry.ts::InvoiceService.deleteInvoiceProfile
- **params**: `id: string`
- **ic_degiskenler**:
  - `id` — silinecek fatura profilinin kimliği
  - `this.supabase` — sınıf içinde saklanan Supabase istemcisi, `deleteInvoiceProfile` fonksiyonuna aktarılır
- **Dönüş**: `deleteInvoiceProfile(this.supabase, id)` fonksiyonunun dönüşü

### [N21_NASIL] AST Pointer: src/lib/services/registry.ts::InvoiceService.setDefaultInvoiceProfile
- **params**: `id: string`
- **ic_degiskenler**:
  - `id` — varsayılan yapılacak fatura profilinin kimliği
  - `this.supabase` — sınıf içinde saklanan Supabase istemcisi, `setDefaultInvoiceProfile` fonksiyonuna aktarılır
- **Dönüş**: `setDefaultInvoiceProfile(this.supabase, id)` fonksiyonunun dönüşü

### [N22_NASIL] AST Pointer: src/lib/services/registry.ts::InvoiceService.fetchDefaultInvoiceProfile
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `this.supabase` — sınıf içinde saklanan Supabase istemcisi, `fetchDefaultInvoiceProfile` fonksiyonuna aktarılır
- **Dönüş**: `fetchDefaultInvoiceProfile(this.supabase)` fonksiyonunun dönüşü

### [N23_NASIL] AST Pointer: src/lib/services/registry.ts::PricingService.constructor
- **params**: `supabase: SupabaseClient<Database>`
- **ic_degiskenler**:
  - `supabase` — constructor parametresi, Supabase istemcisi
- **Dönüş**: yok

### [N24_NASIL] AST Pointer: src/lib/services/registry.ts::PricingService.getEffectiveUnitPrice
- **params**: `product: Product`
- **ic_degiskenler**:
  - `product` — fiyatı hesaplanacak ürün nesnesi
  - `this.supabase` — sınıf içinde saklanan Supabase istemcisi, `getEffectiveUnitPrice` fonksiyonuna aktarılır
- **Dönüş**: `getEffectiveUnitPrice(this.supabase, product)` fonksiyonunun dönüşü

### [N25_NASIL] AST Pointer: src/lib/services/registry.ts::PricingService.getEffectivePriceInfo
- **params**: `product: Product`
- **ic_degiskenler**:
  - `product` — fiyat bilgisi alınacak ürün nesnesi
  - `this.supabase` — sınıf içinde saklanan Supabase istemcisi, `getEffectivePriceInfo` fonksiyonuna aktarılır
- **Dönüş**: `getEffectivePriceInfo(this.supabase, product)` fonksiyonunun dönüşü

### [N26_NASIL] AST Pointer: src/lib/services/registry.ts::ProductService.constructor
- **params**: `supabase: SupabaseClient<Database>`
- **ic_degiskenler**:
  - `supabase` — constructor parametresi, Supabase istemcisi
- **Dönüş**: yok

### [N27_NASIL] AST Pointer: src/lib/services/registry.ts::ProductService.getSearchSuggestions
- **params**: `query: string`, `limit?: number`
- **ic_degiskenler**:
  - `query` — arama sorgusu
  - `limit` — isteğe bağlı sonuç sayısı sınırı
  - `this.supabase` — sınıf içinde saklanan Supabase istemcisi, `getSearchSuggestions` fonksiyonuna aktarılır
- **Dönüş**: `getSearchSuggestions(this.supabase, query, limit)` fonksiyonunun dönüşü

### [N28_NASIL] AST Pointer: src/lib/services/registry.ts::ProductService.ftsSearchProducts
- **params**: `term: string`, `limit?: number`
- **ic_degiskenler**:
  - `term` — tam metin arama terimi
  - `limit` — isteğe bağlı sonuç sayısı sınırı
  - `this.supabase` — sınıf içinde saklanan Supabase istemcisi, `ftsSearchProducts` fonksiyonuna aktarılır
- **Dönüş**: `ftsSearchProducts(this.supabase, term, limit)` fonksiyonunun dönüşü

### [N29_NASIL] AST Pointer: src/lib/services/registry.ts::ProductService.getProducts
- **params**: `limit?: number`
- **ic_degiskenler**:
  - `limit` — isteğe bağlı sonuç sayısı sınırı
  - `this.supabase` — sınıf içinde saklanan Supabase istemcisi, `getProducts` fonksiyonuna aktarılır
- **Dönüş**: `getProducts(this.supabase, limit)` fonksiyonunun dönüşü

### [N30_NASIL] AST Pointer: src/lib/services/registry.ts::ProductService.getAllProducts
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `this.supabase` — sınıf içinde saklanan Supabase istemcisi, `getAllProducts` fonksiyonuna aktarılır
- **Dönüş**: `getAllProducts(this.supabase)` fonksiyonunun dönüşü

### [N31_NASIL] AST Pointer: src/lib/services/registry.ts::ProductService.getProductsByCategory
- **params**: `categoryId: string`
- **ic_degiskenler**:
  - `categoryId` — kategori kimliği
  - `this.supabase` — sınıf içinde saklanan Supabase istemcisi, `getProductsByCategory` fonksiyonuna aktarılır
- **Dönüş**: `getProductsByCategory(this.supabase, categoryId)` fonksiyonunun dönüşü

### [N32_NASIL] AST Pointer: src/lib/services/registry.ts::ProductService.getProductsBySubcategory
- **params**: `subcategoryId: string`
- **ic_degiskenler**:
  - `subcategoryId` — alt kategori kimliği
  - `this.supabase` — sınıf içinde saklanan Supabase istemcisi, `getProductsBySubcategory` fonksiyonuna aktarılır
- **Dönüş**: `getProductsBySubcategory(this.supabase, subcategoryId)` fonksiyonunun dönüşü

### [N33_NASIL] AST Pointer: src/lib/services/registry.ts::ProductService.getProductById
- **params**: `id: string`
- **ic_degiskenler**:
  - `id` — ürün kimliği
  - `this.supabase` — sınıf içinde saklanan Supabase istemcisi, `getProductById` fonksiyonuna aktarılır
- **Dönüş**: `getProductById(this.supabase, id)` fonksiyonunun dönüşü

### [N34_NASIL] AST Pointer: src/lib/services/registry.ts::ProductService.getProductBySlugOrId
- **params**: `identifier: string`
- **ic_degiskenler**:
  - `identifier` — ürün slug'ı veya kimliği
  - `this.supabase` — sınıf içinde saklanan Supabase istemcisi, `getProductBySlugOrId` fonksiyonuna aktarılır
- **Dönüş**: `getProductBySlugOrId(this.supabase, identifier)` fonksiyonunun dönüşü

### [N35_NASIL] AST Pointer: src/lib/services/registry.ts::ProductService.getProductBySlug
- **params**: `slug: string`
- **ic_degiskenler**:
  - `slug` — ürün slug'ı
  - `this.supabase` — sınıf içinde saklanan Supabase istemcisi, `getProductBySlug` fonksiyonuna aktarılır
- **Dönüş**: `getProductBySlug(this.supabase, slug)` fonksiyonunun dönüşü

### [N36_NASIL] AST Pointer: src/lib/services/registry.ts::ProductService.getFeaturedProducts
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `this.supabase` — sınıf içinde saklanan Supabase istemcisi, `getFeaturedProducts` fonksiyonuna aktarılır
- **Dönüş**: `getFeaturedProducts(this.supabase)` fonksiyonunun dönüşü

### [N37_NASIL] AST Pointer: src/lib/services/registry.ts::ProductService.adminSearchProducts
- **params**: `query: string`
- **ic_degiskenler**:
  - `query` — yönetici arama sorgusu
  - `this.supabase` — sınıf içinde saklanan Supabase istemcisi, `adminSearchProducts` fonksiyonuna aktarılır
- **Dönüş**: `adminSearchProducts(this.supabase, query)` fonksiyonunun dönüşü

### [N38_NASIL] AST Pointer: src/lib/services/registry.ts::ProjectService.constructor
- **params**: `supabase: SupabaseClient<Database>`
- **ic_degiskenler**:
  - `supabase` — constructor parametresi, Supabase istemcisi
- **Dönüş**: yok

### [N39_NASIL] AST Pointer: src/lib/services/registry.ts::ProjectService.listUserProjects
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `this.supabase` — sınıf içinde saklanan Supabase istemcisi, `listUserProjects` fonksiyonuna aktarılır
- **Dönüş**: `listUserProjects(this.supabase)` fonksiyonunun dönüşü

### [N40_NASIL] AST Pointer: src/lib/services/registry.ts::ProjectService.createProject
- **params**: `project: TablesInsert<'user_projects'>`
- **ic_degiskenler**:
  - `project` — eklenecek proje verisi
  - `this.supabase` — sınıf içinde saklanan Supabase istemcisi, `createProject` fonksiyonuna aktarılır
- **Dönüş**: `createProject(this.supabase, project)` fonksiyonunun dönüşü

### [N41_NASIL] AST Pointer: src/lib/services/registry.ts::ProjectService.deleteProject
- **params**: `id: string`
- **ic_degiskenler**:
  - `id` — silinecek projenin kimliği
  - `this.supabase` — sınıf içinde saklanan Supabase istemcisi, `deleteProject` fonksiyonuna aktarılır
- **Dönüş**: `deleteProject(this.supabase, id)` fonksiyonunun dönüşü

### [N42_NASIL] AST Pointer: src/lib/services/registry.ts::ProjectService.addProductToProject
- **params**: `projectId: string`, `productId: string`, `quantity?: number`
- **ic_degiskenler**:
  - `projectId` — projenin kimliği
  - `productId` — eklenecek ürünün kimliği
  - `quantity` — isteğe bağlı miktar
  - `this.supabase` — sınıf içinde saklanan Supabase istemcisi, `addProductToProject` fonksiyonuna aktarılır
- **Dönüş**: `addProductToProject(this.supabase, projectId, productId, quantity)` fonksiyonunun dönüşü

### [N43_NASIL] AST Pointer: src/lib/services/registry.ts::ProjectService.removeProductFromProject
- **params**: `projectId: string`, `productId: string`
- **ic_degiskenler**:
  - `projectId` — projenin kimliği
  - `productId` — kaldırılacak ürünün kimliği
  - `this.supabase` — sınıf içinde saklanan Supabase istemcisi, `removeProductFromProject` fonksiyonuna aktarılır
- **Dönüş**: `removeProductFromProject(this.supabase, projectId, productId)` fonksiyonunun dönüşü

### [N44_NASIL] AST Pointer: src/lib/services/registry.ts::ProjectService.listProjectItems
- **params**: `projectId: string`
- **ic_degiskenler**:
  - `projectId` — proje kimliği
  - `this.supabase` — sınıf içinde saklanan Supabase istemcisi, `listProjectItems` fonksiyonuna aktarılır
- **Dönüş**: `listProjectItems(this.supabase, projectId)` fonksiyonunun dönüşü

### [N45_NASIL] AST Pointer: src/lib/services/registry.ts::ServiceRegistry.constructor
- **params**: `supabase: SupabaseClient<Database>`
- **ic_degiskenler**:
  - `supabase` — constructor parametresi, Supabase istemcisi
  - `this.address` — `new AddressService(this.supabase)` ile oluşturulan adres servisi örneği
  - `this.cart` — `new CartService(this.supabase)` ile oluşturulan sepet servisi örneği
  - `this.category` — `new CategoryService(this.supabase)` ile oluşturulan kategori servisi örneği
  - `this.invoice` — `new InvoiceService(this.supabase)` ile oluşturulan fatura servisi örneği
  - `this.pricing` — `new PricingService(this.supabase)` ile oluşturulan fiyatlandırma servisi örneği
  - `this.product` — `new ProductService(this.supabase)` ile oluşturulan ürün servisi örneği
  - `this.project` — `new ProjectService(this.supabase)` ile oluşturulan proje servisi örneği
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