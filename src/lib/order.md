---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\lib\order.ts
skeleton_hash: 34310d9d2c13f2a6
generated_at: 2026-05-23T22:31:22Z
---

## Genel Bakış
VentHub HVAC projesinin sipariş yönetimi katmanında yer alan bu modül, sunucu üzerindeki kullanıcı sepetlerinin geçerliliğini kontrol etmeye odaklanır. Sipariş oluşturma sürecinin ilk güvenlik adımı olarak çalışan modül, yetkisiz erişim veya geçersiz sepetlerle oluşabilecek hataları önlemek için temel doğrulama hizmeti sunar.

## Fonksiyon Grupları
### Sunucu Sepeti Doğrulama İşlevleri
Sunucu tarafında tutulan kullanıcı alışveriş sepetlerinin geçerlilik ve erişim kontrollerini gerçekleştiren bu grup, sipariş akışının güvenli ve hatasız ilerlemesini sağlamakla sorumludur.
- validateServerCart

---

## AXIOMS – Mimari Varsayımlar
Bu order.ts modülündeki `validateServerCart` sunucu sepeti doğrulama fonksiyonu, çalışması için girdi olarak iletilen opsiyonel kimliklerin doğru formatta, sistemde kayıtlı ve erişim yetkisi kapsamında olmasına dayanır.

[Aksiyom 1]: Eğer `validateServerCart` fonksiyonuna gönderilen input nesnesi ne cartId ne de userId değerini içermiyorsa, sepet doğrulama işlemi başarısız olur ve yetkisiz erişim hatası oluşur.
[Aksiyom 2]: Eğer input nesnesi içindeki cartId veya userId string veri tipi dışında bir türde iletilirse, kimlik doğrulama mantığı çalışmaz, sepet veya kullanıcı eşleştirme hataları meydana gelir.
[Aksiyom 3]: Eğer inputta iletilen cartId veya userId sistemde kayıtlı bir değere sahip değilse, doğrulama işlemi reddedilir ve geçersiz kimlik hatası döndürülür.
[Aksiyom 4]: Eğer inputta iletilen cartId ait olduğu aktif kullanıcı kimliği (userId) ile eşleşmiyorsa, doğrulama başarısız olur ve yetkisiz erişim hatası fırlatılır.

---

## FONKSIYON DETAYLARI

### validateServerCart
**Ne yapar**: Kullanıcının alışveriş sepetini sunucu üzerinden doğrularak mevcut fiyat ve stok bilgilerinin güncel olup olmadığını teyit eder. Supabase altyapısındaki `order-validate` adlı Edge Function'a istek göndererek sepetin geçerliliğini kontrol eder. Doğrulama sonucunda ortaya çıkan tüm sorunları ve hesaplanan güncel toplamları içeren bir sonuç nesnesi döndürür.
**Nasıl yapar**: Öncelikle Supabase entegrasyonu için gerekli ortam değişkenlerinin mevcudiyetini denetler, herhangi bir eksik tespit etmesi halinde hata fırlatır. Giriş nesnesindeki sepet ve kullanıcı kimliklerini kullanarak ilgili sunucu uç noktasına HTTP isteği gönderir. Uç noktadan 200 (başarılı) olmayan bir yanıt dönmesi halinde de hata fırlatır. Başarılı yanıt alması durumunda stok sorunları, fiyat uyumsuzlukları ve hesaplanan tutarları içeren doğrulama sonucunu promise olarak çözümler.
**Parametreler**:
- name: input, type: { cartId?: string; userId?: string } — Sepeti sunucu tarafında doğrulamak için ihtiyaç duyulan tüm kimlik bilgilerini barındıran giriş nesnesi. İçindeki tüm alanlar isteğe bağlı olarak tanımlanmıştır.
- name: input.cartId, type: string | undefined — Kullanıcının alışveriş sepetine ait benzersiz tanımlayıcı. Giriş nesnesi içinde zorunlu değildir.
- name: input.userId, type: string | undefined — Doğrulama işlemini gerçekleştiren, kimliği doğrulanmış kullanıcının benzersiz tanımlayıcısı. Giriş nesnesi içinde zorunlu değildir.
**Dönüş**: Promise<ValidationResult> — Tespit edilen stok eksiklikleri, güncel ve eski fiyatlar arasındaki uyumsuzluklar ve sepetin hesaplanmış güncel toplam tutarları gibi tüm doğrulama detaylarını içeren `ValidationResult` tipinde bir nesneye çözülen promise döndürür. İşlem sırasında oluşan hatalarda promise reddedilerek ilgili hata nesnesi fırlatılır.

---

## INTERFACES

### ValidationItem
- `product_id: string`
- `quantity: number`
- `unit_price: number`
- `price_list_id: string | null`

### StockIssue
- `product_id: string`
- `requested: number`
- `available: number`

### PriceMismatch
- `product_id: string`
- `expected_price: number`
- `actual_price: number`

### ValidationResult
- `ok: boolean`
- `items: ValidationItem[]`
- `mismatches: PriceMismatch[]`
- `stock_issues?: StockIssue[]`
- `totals: { subtotal: number }`
- `cart_id: string`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\lib\order.ts::validateServerCart
- **params**: (input: { cartId?: string; userId?: string })
- **ic_degiskenler**:
  - `url` — Supabase projesinin genel URL'si, ortam değişkeninden alınır, eksikse varsayılan boş string atanır
  - `anon` — Supabase anon erişim anahtarı, ortam değişkeninden alınır, eksikse varsayılan boş string atanır
  - `process.env.NEXT_PUBLIC_SUPABASE_URL` — Supabase URL'sini tutan ortam değişkeni, okunarak url değişkenine atanır
  - `process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon anahtarını tutan ortam değişkeni, okunarak anon değişkenine atanır
  - `resp` — order-validate edge fonksiyonuna gönderilen POST isteğinin yanıtını tutan Response nesnesi
  - `input.cartId` — Girişte gelen opsiyonel sepet kimliği, harici doğrulama fonksiyonuna iletilmek üzere istek gövdesine eklenir
  - `input.userId` — Girişte gelen opsiyonel kullanıcı kimliği, harici doğrulama fonksiyonuna iletilmek üzere istek gövdesine eklenir
  - `resp.ok` — İstek yanıtının başarı durumunu kontrol eden Response nesnesi özelliği
  - `resp.text()` — Başarısız istek durumunda hata mesajını çeken Response metodu
  - `resp.json()` — Başarılı istek durumunda doğrulama sonucunu JSON formatına çeviren Response metodu
- **Dönüş**: Promise<ValidationResult>; eksik ortam değişkeni veya başarısız istek durumunda Error fırlatır, başarılı durumda sunucu doğrulama sonucunu içeren promise döndürür

---

## NODE ID STANDARD

  file: src\lib\order.ts
  function: src\lib\order.ts::validateServerCart

---

## DISA AKTARILANLAR (EXPORTS)
  export: StockIssue
  export: ValidationItem
  export: ValidationResult
  export: validateServerCart