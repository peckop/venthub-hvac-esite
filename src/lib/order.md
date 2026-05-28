---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\lib\order.ts
skeleton_hash: 34310d9d2c13f2a6
entity_hashes:
  func:validateServerCart: 5d44a017c1d324c4
  overview: 24f5c5f866f2e17e
generated_at: 2026-05-28T22:38:02Z
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

## FONKSİYON DETAYLARI

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

### [N1_NASIL] AST Pointer: src/lib/order.ts::validateServerCart
- **params**: `input` — `{ cartId?: string; userId?: string }` tipinde giriş nesnesi; opsiyonel olarak cartId ve userId içerir
- **ic_degiskenler**:
  - `url` — `process.env.NEXT_PUBLIC_SUPABASE_URL` değerini alır, tanımsızsa boş string fallback kullanılır; Supabase edge function URL'sinin temelini oluşturur
  - `anon` — `process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY` değerini alır, tanımsızsa boş string fallback kullanılır; Supabase API isteklerinde `apikey` ve `Authorization` header'larında kullanılır
  - `resp` — `fetch` çağrısının döndüğü Response nesnesi; HTTP yanıtının durum kodu ve gövdesi bu üzerinden erişilir
- **Dönüş**: `Promise<ValidationResult>` — Supabase edge function'ın (`order-validate`) döndürdüğü JSON doğrulama sonucu nesnesi; HTTP yanıtı başarısızsa (`!resp.ok`) hata fırlatılır

**Çıkarılan detay akış bilgileri** (fonksiyon gövdesinden):
- `input.cartId` → `cart_id` olarak JSON body'ye dönüştürülür
- `input.userId` → `user_id` olarak JSON body'ye dönüştürülür
- `resp.ok` kontrolü başarısız olursa `resp.text()` ile ham hata mesajı okunur ve `throw new Error(...)` ile fırlatılır
- `url`, `anon` her ikisi de boş string'e eşitse (yani env tanımsızsa) fonksiyon hemen `throw new Error('Missing Supabase envs')` ile sonlanır

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