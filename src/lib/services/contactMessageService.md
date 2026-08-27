---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\ops-t165\src\lib\services\contactMessageService.ts
skeleton_hash: 12c46923ef1efb26
entity_hashes:
  func:submitContactMessage: bdff0d3b1c594401
  overview: e4c082f3ad81112f
generated_at: 2026-08-27T06:59:27Z
---

## Genel Bakış

Bu modül, iletişim mesajlarının gönderilmesiyle ilgilenen bir servis katmanıdır. Supabase veritabanı istemcisini kullanarak kullanıcıdan gelen iletişim mesajı verilerini işler. Modül tek bir asenkron fonksiyondan oluşur ve bir sonuç değeri döndürür.

## Fonksiyon Grupları

### İletişim Mesajı Gönderme

Kullanıcıdan alınan iletişim mesajı verisini Supabase veritabanına kaydeder ve işlemin sonucunu döndürür.

- submitContactMessage

## Bağımlılıklar

- **Dış bağımlılık:** SupabaseClient ve Database türleri (Supabase kütüphanesi)
- **Dış bağımlılık:** ContactMessageInput türü (muhtemelen aynı projede tanımlı bir arayüz veya tip)

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Neden:** Fonksiyon gövdesi verilmediğinden, `submitContactMessage` fonksiyonunun çalışma mantığı, hangi tabloya yazdığı, hangi doğrulama kontrollerini yaptığı veya hangi hata senaryolarını ele aldığı bilinmemektedir. Yalnızca fonksiyon imzası (`supabase: SupabaseClient<Database>`, `input: ContactMessageInput`, dönüş tipi `Promise<string>`) mevcuttur; bu bilgiler fonksiyonun davranışını belirlemek için yeterli değildir.

---

## FONKSİYON DETAYLARI

### submitContactMessage
**Ne yapar**: İletişim formu mesajını veritabanına kaydeder ve kaydedilen satırın kimliğini döndürür. Hata durumunda fırlatır; sessiz yutma yoktur.

**Nasıl yapar**: Supabase istemcisini kullanarak `submit_contact_message` adlı RPC fonksiyonunu çağırır. Girdi nesnesindeki tüm alanları (`name`, `message`, `email`, `phone`, `company`, `city`, `applicationArea`, `subject`, `consent`) RPC parametrelerine eşler. Çağrı sonucunda hata varsa hatayı fırlatır. Hata yoksa ancak dönen veri de null ise, yazma işleminin kanıtlanamadığı gerekçesiyle bir `Error` fırlatır. Başarılı durumda dönen kimlik değerini döndürür.

**Parametreler**:
- supabase: `SupabaseClient<Database>` — Supabase veritabanı istemcisi. RPC çağrısını gerçekleştirmek için kullanılır.
- input: `ContactMessageInput` — İletişim formundan gelen verileri taşıyan nesne. Şu alanları içerir: `name`, `message`, `email`, `phone`, `company`, `city`, `applicationArea`, `subject`, `consent`.

**Dönüş**: `Promise<string>` — Kaydedilen mesaj satırının kimliğini temsil eden string değer. Ancak RPC başarılı olup kimlik döndürürse bu değere ulaşılır; aksi takdirde hata fırlatılır.

---

## İTHALATLAR (IMPORTS)
- import: @/types/database.types::type { Database }
- import: @supabase/supabase-js::type { SupabaseClient }

---

## INTERFACES

### ContactMessageInput
MÜŞTERİ-YÜZÜ FORM YAZMA KATMANI — `docs/standards/form-submission-standard.md` §6. NİÇİN SERVİS: bileşen doğrudan `supabase.from(...)` çağırmaz; yazma DI'lı bir servisten geçer (CLAUDE.md §2 — ilk parametre `supabase`). Ev deseni: `createQuoteRequest`. NİÇİN RPC, DOĞRUDAN TABLO DEĞİL — cetvel §6'da 
- `name: string`
- `message: string`
- `email?: string`
- `phone?: string`
- `company?: string`
- `city?: string`
- `applicationArea?: string`
- `subject?: string`
- `consent: boolean`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/lib/services/contactMessageService.ts::submitContactMessage
- **params**:
  - `supabase` — `SupabaseClient<Database>` tipinde, Supabase veritabanı istemcisi
  - `input` — `ContactMessageInput` tipinde, iletişim mesajı form verisi
- **ic_degiskenler**:
  - `data` — `supabase.rpc` çağrısından dönen yanıt verisi; `submit_contact_message` RPC fonksiyonunun dönüş değeri (string beklenir). Destructuring ile `error` ile birlikte alınır
  - `error` — `supabase.rpc` çağrısından dönen hata nesnesi; varsa `throw error` ile fırlatılır
- **Dönüş**: `Promise<string>` — RPC fonksiyonundan dönen `data` değeri (yazma kanıtı olarak kimlik/ID). `data` null ise hata fırlatılır, çağıran başarı ekranı açmaması için `Error` nesnesi üretilir

---

## NODE ID STANDARD

  file: src\lib\services\contactMessageService.ts
  function: src\lib\services\contactMessageService.ts::submitContactMessage

---

## DISA AKTARILANLAR (EXPORTS)
  export: ContactMessageInput
  export: submitContactMessage