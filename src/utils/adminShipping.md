---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-altyapi-t165\src\utils\adminShipping.ts
skeleton_hash: 239e849b7b70a52d
entity_hashes:
  func:SharedTrackingDeclinedError:constructor: 0da9cec1646cf6c1
  func:invokeShippingUpdate: c7a81a79ab7e135c
  func:isSharedTrackingConflict: 7ea7741c5087f777
  overview: 4609d8f90089ab87
generated_at: 2026-08-27T08:37:11Z
---

## Genel Bakış
Bu modül, admin panelinden gerçekleştirilen kargo güncelleme işlemlerini yönetir. Paylaşımlı takip numarası çakışmalarını tespit eder ve bu durumlarda özel hata mekanizması sunar. Supabase üzerinden kargo güncelleme çağrısı yaparken karşılaşılabilen hata durumlarını ele alır.

## Fonksiyon Grupları

### Kargo Güncelleme Çağrısı
Supabase fonksiyon host'u üzerinden kargo güncelleme isteği gönderir ve sonucu döndürür. Paylaşımlı takip numarasına izin verilip verilmediği parametreyle kontrol edilir.
- invokeShippingUpdate

### Hata Tespiti ve Yönetimi
Paylaşımlı takip numarası çakışması durumunu tanımlar ve tespit eder. `SharedTrackingDeclinedError` özel hata sınıfı, bu tür çakışmalarda fırlatılmak üzere tanımlanmıştır; `isSharedTrackingConflict` ise verilen bir hata nesnesinin bu çakışma türüne ait olup olmadığını kontrol eder.
- isSharedTrackingConflict, SharedTrackingDeclinedError (constructor)

---

## AXIOMS – Mimari Varsayımlar
- Bu modül davranışsal mantık içermez (salt veri / konfigürasyon / tip tanımı).
- [Aksiyom 1]: Modülün dışa açtığı yapı (anahtar kümesi / şema) bir sözleşmedir; tüketiciler bu sabit yapıya bağlıdır — kırıcı değişiklik tüm tüketicileri etkiler.
- [Aksiyom 2]: Bir öğe ekleme/çıkarma yapısal-uyumlu olmalı; ilgili tipler ve seçiciler aynı commit'te güncel tutulmalıdır.

---

## FONKSİYON DETAYLARI

### isSharedTrackingConflict
**Ne yapar**: Verilen hata nesnesinin bir "paylaşılan takip numarası" reddi (409 Conflict) olup olmadığını tespit eder. `supabase-js` kütüphanesi, Edge Function 2xx dışı bir durum kodu döndürüğünde `FunctionsHttpError` üretir; bu hata nesnesinin `context` alanı ham `Response` nesnesini taşır ve hata mesajı yalnızca "Edge Function returned a non-2xx status code" ifadesini içerir. Hangi 409 hatası olduğunu anlamak için yanıt gövdesindeki `error` kodunun okunması gerekir.

**Nasıl yapar**: İlk olarak `error` nesnesinin `context` özelliğini kontrol eder. `context` bir `Response` nesnesi değilse veya `status` değeri 409 değilse `false` döner. 409 durumunda yanıt gövdesini `clone()` metoduyla klonlayarak okur; bu klonlama, gövdenin tek kullanımlık olmasını önlemek içindir — çağıran aynı `Response` nesnesini loglamak için tekrar okumak isteyebilir. Gövde içindeki `error` alanının değeri `SHARED_TRACKING_CONFLICT` sabitiyle eşleşiyorsa `true`, aksi halde `false` döner. JSON ayrıştırma sırasında oluşan herhangi bir hata durumunda da `false` döner.

**Parametreler**:
- error: unknown — kontrol edilecek hata nesnesi; `supabase-js` tarafından üretilen `FunctionsHttpError` olabilir

**Dönüş**: `Promise<boolean>` — hata bir paylaşılan takip numarası reddiyse `true`, değilse `false`

### invokeShippingUpdate
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

### constructor
**Ne yapar**: `SharedTrackingDeclinedError` sınıfının yapıcı metodudur. Bu hata sınıfı, paylaşılan bir takip numarasının onaylanmaması durumunda fırlatılmak üzere özel bir hata nesnesi oluşturur ve başlatır.
**Nasıl yapar**: Metot, üst sınıfın (muhtemelen `Error`) yapıcı metodunu `super()` çağrısıyla çalıştırır ve varsayılan bir hata mesajı olarak `'Paylaşılan takip numarası onaylanmadı; kargo bilgisi yazılmadı.'` iletir. Ardından, oluşturulan hata nesnesinin `name` özelliğini `'SharedTrackingDeclinedError'` olarak ayarlayarak hatanın türünü tanımlar.
**Parametreler**:
- Bu fonksiyon herhangi bir parametre almaz.
**Dönüş**: Kaynakta dönüş tipi açıkça belirtilmemiştir. TypeScript'te `constructor` metodları genellikle `void` döndürür, ancak bu spesifik durumda dönüş tipi bilinmiyor.

---

## INTERFACES

### ShippingFunctionsHost
Bu modülün istemciden ihtiyaç duyduğu TEK yetenek. `SupabaseClient<Database>` yerine dar bir sözleşme yazıldı — gerçek istemci bunu yapısal olarak zaten karşılıyor, ama test bir "sahte istemci" üretmek için tip zorlamasına (`as unknown as`) mecbur kalmıyor. Tip zorlaması testte de üretimdeki kadar t
- `functions: {`

---

## TYPE ALIASES

### ShippingUpdateBody
`interface` DEĞİL `type`: arayüzlerin örtük indeks imzası yoktur ve `Record<string, unknown>` bekleyen `invoke` sözleşmesine geçmezdi.
```typescript
type ShippingUpdateBody = {
  order_id: string
  carrier: string
  tracking_number: string
  tracking_url: string | null
  send_email: boolean
}
```

### ShippingInvokeOutcome
```typescript
type ShippingInvokeOutcome = | { ok: true; conflict: false }
  /** `conflict: true` → SADECE paylaşılan takip numarası reddi; başka her hata `false`. */
  | { ok: false; conflict: boolean; error: unknown }
```

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\tmp\vh-altyapi-t165\src\utils\adminShipping.ts::isSharedTrackingConflict
- **params**: `error: unknown`
- **ic_degiskenler**:
  - `context` — `error` nesnesinin `context` özelliğini alır; `Response` instance'ı olup olmadığını kontrol eder.
  - `body` — `context.clone().json()` ile elde edilen yanıt gövdesi; `SHARED_TRACKING_CONFLICT` sabitiyle eşleşip eşleşmediğini kontrol eder.
- **Dönüş**: `Promise<boolean>`

### [N2_NASIL] AST Pointer: C:\tmp\vh-altyapi-t165\src\utils\adminShipping.ts::invokeShippingUpdate
- **params**: `supabase: ShippingFunctionsHost`, `body: ShippingUpdateBody`, `allowSharedTracking` (varsayılan değer: `false`)
- **ic_degiskenler**:
  - `payload` — `allowSharedTracking` true ise `body`'ye `allow_shared_tracking: true` eklenmiş nesne, aksi halde `body`'nin kendisi.
  - `error` — `supabase.functions.invoke('admin-update-shipping', { body: payload })` çağrısının hata sonucu.
- **Dönüş**: `Promise<ShippingInvokeOutcome>`

### [N3_NASIL] AST Pointer: C:\tmp\vh-altyapi-t165\src\utils\adminShipping.ts::SharedTrackingDeclinedError.constructor
- **params**: yok
- **ic_degiskenler**: yok
- **Dönüş**: yok

---


## MERMAID CALL GRAPH
```mermaid
graph TD
    adminShipping_ts__constructor["constructor"]
    adminShipping_ts__invokeShippingUpdate["invokeShippingUpdate"]
    adminShipping_ts__isSharedTrackingConflict["isSharedTrackingConflict"]
    adminShipping_ts__invokeShippingUpdate --> adminShipping_ts__isSharedTrackingConflict
```

## NODE ID STANDARD

  file: src\utils\adminShipping.ts
  function: src\utils\adminShipping.ts::isSharedTrackingConflict
  function: src\utils\adminShipping.ts::invokeShippingUpdate
  class: src\utils\adminShipping.ts::SharedTrackingDeclinedError

---

## DISA AKTARILANLAR (EXPORTS)
  export: SharedTrackingDeclinedError
  export: ShippingFunctionsHost
  export: ShippingInvokeOutcome
  export: ShippingUpdateBody
  export: invokeShippingUpdate
  export: isSharedTrackingConflict