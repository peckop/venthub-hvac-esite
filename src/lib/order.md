---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\ops-t165\src\lib\order.ts
skeleton_hash: 8cf2ce519513741b
entity_hashes:
  func:validateServerCart: be0fbe2d0b50eaac
  overview: 5c7e7d27dac9b004
generated_at: 2026-08-27T06:57:38Z
---

## Genel Bakış
VentHub HVAC projesinin sipariş yönetiminde yer alan bu modül, sunucu tarafındaki kullanıcı sepetlerinin doğrulama işlemlerini gerçekleştirir. Sipariş oluşturma sürecinin ilk güvenlik adımı olarak çalışan modül, Supabase veritabanı bağlantısı üzerinden sepet ve kullanıcı kimliklerinin geçerliliğini kontrol eder. Yetkisiz erişim veya geçersiz sepet durumlarını tespit ederek hatalı sipariş oluşumunu engeller.

## Fonksiyon Grupları
### Sunucu Sepeti Doğrulama İşlevleri
Sunucu tarafında tutulan kullanıcı alışveriş sepetlerinin geçerlilik ve erişim kontrollerini gerçekleştiren bu grup, sipariş akışının güvenli ve hatasız ilerlemesini sağlamakla sorumludur. Girdi olarak iletilen sepet kimliği veya kullanıcı kimliğinin sistemde kayıtlı, doğru formatta ve birbiriyle eşleşir durumda olmasını doğrular; aksi durumlarda yetkisiz erişim veya geçersiz kimlik hataları üretir.
- validateServerCart

---

## AXIOMS – Mimari Varsayımlar
- Bu modül davranışsal mantık içermez (salt veri / konfigürasyon / tip tanımı).
- [Aksiyom 1]: Modülün dışa açtığı yapı (anahtar kümesi / şema) bir sözleşmedir; tüketiciler bu sabit yapıya bağlıdır — kırıcı değişiklik tüm tüketicileri etkiler.
- [Aksiyom 2]: Bir öğe ekleme/çıkarma yapısal-uyumlu olmalı; ilgili tipler ve seçiciler aynı commit'te güncel tutulmalıdır.

---

## FONKSİYON DETAYLARI

### validateServerCart
**Ne yapar**: Sepeti sunucu tarafında fiyat ve stok açısından doğrulamak için Supabase Edge Function olan `order-validate`'i çağırır. Doğrulama yapılamazsa veya boş yanıt dönerse hata fırlatır; boş yanıtı "başarılı" olarak kabul etmez.

**Nasıl yapar**: Doğrudan ham `fetch` kullanmaz; bunun yerine `supabase.functions.invoke` yöntemini tercih eder. Bu tercihin nedeni, önceki sürümde `fetch` ile anonim anahtarın `Authorization` başlığı olarak gönderildiğinin tespit edilmesidir. `order-validate` fonksiyonu ise kimliği gövde içindeki `user_id` alanından alır. Gövde olarak `cart_id` ve `user_id` alanlarını gönderir. Dönen yanıtta hata varsa bu hatayı fırlatır. Yanıt verisi yoksa ya da `data.items` bir dizi değilse, `ORDER_VALIDATE_EMPTY_RESPONSE` kodlu bir hata fırlatır. Boş gövde, doğrulamanın yapılmadığı anlamına gelir ve bunu "ok" saymak doğrulamayı atlamakla eşdeğerdir.

**Parametreler**:
- `supabase`: `SupabaseClient<Database>` — Doğrulanmış bir SupabaseClient örneği. Edge Function çağrısını yapmak için kullanılır.
- `input`: `{ cartId?: string; userId?: string }` — Opsiyonel `cartId` ve `userId` alanlarını içeren nesne. `cart_id` ve `user_id` olarak Edge Function gövdesine aktarılır.

**Dönüş**: `Promise<ValidationResult>` — Doğrulanmış fiyatları ve stok bilgisini içeren `ValidationResult` nesnesini çözümleyen bir Promise döner.

---

## İTHALATLAR (IMPORTS)
- import: @/types/database.types::type { Database }
- import: @supabase/supabase-js::type { SupabaseClient }

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
- `cart_id?: string`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/lib/order.ts::validateServerCart
- **params**:
  - `supabase` — SupabaseClient<Database> tipinde, Supabase istemcisi; Edge Function çağrısı için kullanılır
  - `input` — { cartId?: string; userId?: string } tipinde, sepet ve kullanıcı tanımlayıcılarını taşır
- **ic_degiskenler**:
  - `data` — `supabase.functions.invoke` çağrısından dönen yanıtın veri kısmı (ValidationResult tipinde); `input.cartId` ve `input.userId` gönderilerek 'order-validate' Edge Function'ı çağrılır
  - `error` — `supabase.functions.invoke` çağrısından dönen hata nesnesi; varsa `throw error` ile fırlatılır
  - `input.cartId` — input objesinden okunan sepet kimliği; Edge Function body'sinde `cart_id` olarak gönderilir
  - `input.userId` — input objesinden okunan kullanıcı kimliği; Edge Function body'sinde `user_id` olarak gönderilir
  - `data.items` — data objesinden okunan items dizisi; `Array.isArray(data.items)` kontrolü yapılır, dizi değilse `ORDER_VALIDATE_EMPTY_RESPONSE` hatası fırlatılır
- **Dönüş**: ValidationResult — Edge Function'dan gelen doğrulama sonucu; `data` null ise veya `data.items` dizi değilse hata fırlatılır, aksi halde `data` döndürülür

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