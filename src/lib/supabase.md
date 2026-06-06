---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\lib\supabase.ts
skeleton_hash: b896a177a93a8a4e
entity_hashes:
  overview: 8a47b4c00ad1c0ec
generated_at: 2026-06-06T21:56:04Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesindeki tüm Supabase veritabanı işlemlerinin merkezi yapılandırma noktasıdır. Projede kullanılmak üzere tek bir Supabase istemcisini oluşturur ve dışa aktarır; bu sayede farklı bileşenler tutarlı ve güvenli bir veritabanı bağlantısı kullanır. Modül, gerekli ortam değişkenlerinin varlığını kontrol eder ve eksik durumlarda hata yönetimi sağlar.

## Modül Yapısı

Bu dosyada fonksiyon tanımları bulunmamaktadır; yalnızca modül seviyesinde kodlar ve dışa aktarımlar yer alır.

**Ortam Değişkenleri:**
- `SUPABASE_URL` — Supabase projesinin URL adresi (zorunlu)
- `SUPABASE_ANON_KEY` — Supabase anonim erişim anahtarı (zorunlu)

**İçe Aktarılanlar:**
- `supabaseBrowserClient` — Tarayıcı tarafı istemci yapılandırması (client-side)
- `supabaseStaticClient` — Statik/SSR tarafı istemci yapılandırması (server-side)

**Dışa Aktarılanlar:**
- `supabase` — Proje genelinde kullanılacak tekil Supabase istemci nesnesi

**Amaç:** Bu modül, farklı ortamlara (tarayıcı veya sunucu) uygun Supabase istemcilerini birleştirerek projenin her yerinden erişilebilir tek bir veritabanı bağlantısı sunar. HVAC markaları, ürünler, siparişler ve Sepet işlemleri gibi Supabase tabloları üzerinde sorgulama yapmak için bu istemci kullanılır.

---

## AXIOMS – Mimari Varsayımlar
Bu modül, Supabase istemcisini conditional (koşullu) olarak başlatmak için tasarlanmıştır.

**[Aksiyom 1]:** Eğer `SUPABASE_URL` ortam değişkeni tanımlı değilse veya boşsa, `supabase` istemcisi `null` değerine eşitlenir ve tüm veritabanı işlemleri başarısız olur.

**[Aksiyom 2]:** Eğer `SUPABASE_ANON_KEY` ortam değişkeni tanımlı değilse veya boşsa, `supabase` istemcisi `null` değerine eşitlenir ve tüm veritabanı işlemleri başarısız olur.

**[Aksiyom 3]:** Eğer hem `SUPABASE_URL` hem de `SUPABASE_ANON_KEY` tanımlı ve doluysa, `supabase` değişkeni geçerli bir `SupabaseClient` örneğine eşitlenir.

**[Aksiyom 4]:** Eğer ortam değişkenleri eksikse, modül tarafından bir uyarı (console.error/warn) yayınlanır — bu uyarılar sessizce yutulmaz.

**[Aksiyom 5]:** `supabase` değişkeni `createClient()` fonksiyonu ile oluşturulur ve bu fonksiyon `@supabase/supabase-js` kütüphanesinden gelmelidir;aksi halde istemci oluşmaz.

---

**Not:** Modülde `supabase` değişkeni bir ternary expression (koşullu ifade) ile başlatıldığı için, eksik ortam değişkeni durumunda istemcinin `null` veya `undefined` olacağı varsayılmaktadır.

---

## FONKSİYON DETAYLARI

---

## SABİTLER
- **supabase** (ternary_expression) — `typeof window !== 'undefined' ? supabaseBrowserClient : supabaseStaticClient`

---

## AST POINTERS

Bu dosyada analiz edilecek **fonksiyon gövdesi bulunmamaktadır**.

---

### Dosya Yapısı Özeti

**Kaynak:** `src/lib/supabase.ts`

**İçerik:**
- 2 adet import statement'ı
- 1 adet sabit (ternary expression): `supabase`
- 0 adet fonksiyon gövdesi
- 0 adet class tanımı

---

### Mevcut Tanımlamalar

| Tanım | Tür | Açıklama |
|-------|-----|----------|
| `supabaseBrowserClient` | Import | `./supabase/client` modülünden içe aktarılmış, tarayıcı tarafı Supabase istemcisi |
| `supabaseStaticClient` | Import | `./supabase/static` modülünden içe aktarılmış, statik/SSG tarafı Supabase istemcisi |
| `supabase` | Sabit (Ternary) | Ortam koşuluna bağlı olarak `supabaseBrowserClient` veya `supabaseStaticClient` değerini alan conditionally assigned client |

---

### Sonuç

Bu dosya yalnızca re-export / barrel dosya işlevi görmektedir. `supabase` sabiti bir ternary expression ile ortam değişkenine göre hangi client'ın kullanılacağını belirler. Fonksiyon gövdesi yer almadığından **params, iç değişkenler ve dönüş değeri çıkarımı yapılamamaktadır**.

---

## NODE ID STANDARD

  file: src\lib\supabase.ts

---

## DISA AKTARILANLAR (EXPORTS)
  export: supabase