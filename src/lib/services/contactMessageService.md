---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-rec80\src\lib\services\contactMessageService.ts
skeleton_hash: 7132a939a872ee42
entity_hashes:
  func:submitContactMessage: 0d8bdfa3ae2bec82
  overview: e4c082f3ad81112f
generated_at: 2026-08-26T19:27:53Z
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
**Ne yapar**: İletişim mesajını veritabanına kaydeder ve kaydedilen satırın kimliğini döndürür. Hata durumunda fırlatır — sessiz yutma yoktur. Başarı kanıtlanamıyorsa (RPC hata vermez ama kimlik de dönmezse) bu durum da hata olarak değerlendirilir.

**Nasıl yapar**: Supabase istemcisi üzerinden `submit_contact_message` adlı sunucu tarafı (RPC) fonksiyonunu çağırır. Girdi nesnesindeki tüm alanları bu RPC fonksiyonuna parametre olarak aktarır. Çağrı tamamlandıktan sonra iki kontrol yapılır: Birincisi, `error` değişkeni doluysa bu hata doğrudan fırlatılır. İkincisi, `data` değişkeni boşsa (yani RPC hata vermeden çalıştı ama bir kimlik dönmediyse) bu durum "yazma kanıtlanamadı" anlamına geldiği için açık bir `Error` fırlatılarak çağıranın başarı ekranını göstermesi engellenir. Her iki kontrol de geçilirse `data` değeri (yazılan satırın kimliği) döndürülür.

**Parametreler**:
- supabase: `SupabaseClient<Database>` — Supabase veritabanı istemcisi. RPC çağrısını gerçekleştirmek için kullanılır.
- input: `ContactMessageInput` — İletişim formundan gelen girdi verisi. İçinde şu alanları barındırır: `name` (ad), `message` (mesaj), `email` (e-posta), `phone` (telefon), `company` (şirket), `city` (şehir), `applicationArea` (uygulama alanı), `subject` (konu), `consent` (onay).

**Dönüş**: `Promise<string>` — Başarılı kayıt durumunda veritabanına yazılan satırın kimliğini (string) döndürür. Hata durumunda bu Promise rejection ile sonuçlanır (hata fırlatılır).

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

### [N1_NASIL] AST Pointer: contactMessageService.ts::submitContactMessage
- **params**:
  - `supabase` — SupabaseClient<Database> tipinde, veritabanı istemcisi
  - `input` — ContactMessageInput tipinde, iletişim formu verilerini taşır
- **ic_degiskenler**:
  - `data` — `supabase.rpc('submit_contact_message', {...})` çağrısından dönen sonuç; RPC fonksiyonu başarılıysa oluşturulan kaydın kimliğini (string) içerir, başarısızsa null olabilir
  - `error` — `supabase.rpc('submit_contact_message', {...})` çağrısından dönen hata nesnesi; hata yoksa null/falsy
  - `input.name` — RPC parametresi `p_name` olarak gönderilir, kullanıcının adı
  - `input.message` — RPC parametresi `p_message` olarak gönderilir, mesaj içeriği
  - `input.email` — RPC parametresi `p_email` olarak gönderilir, e-posta adresi
  - `input.phone` — RPC parametresi `p_phone` olarak gönderilir, telefon numarası
  - `input.company` — RPC parametresi `p_company` olarak gönderilir, şirket adı
  - `input.city` — RPC parametresi `p_city` olarak gönderilir, şehir
  - `input.applicationArea` — RPC parametresi `p_application_area` olarak gönderilir, uygulama alanı
  - `input.subject` — RPC parametresi `p_subject` olarak gönderilir, konu
  - `input.consent` — RPC parametresi `p_consent` olarak gönderilir, onay durumu
- **Dönüş**: `Promise<string>` — RPC fonksiyonundan dönen kimlik (data); hata varsa veya data null ise hata fırlatır, aksi takdirde data string olarak döner

---

## NODE ID STANDARD

  file: src\lib\services\contactMessageService.ts
  function: src\lib\services\contactMessageService.ts::submitContactMessage

---

## DISA AKTARILANLAR (EXPORTS)
  export: ContactMessageInput
  export: submitContactMessage