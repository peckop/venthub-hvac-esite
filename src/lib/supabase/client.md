---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\lib\supabase\client.ts
skeleton_hash: af393b98f3ea3dda
entity_hashes:
  overview: 34e9332f051f8980
generated_at: 2026-06-08T10:10:57Z
---

## Genel Bakış

Bu modül, istemci tarafında (tarayıcıda) Supabase bağlantısı kurmak için kullanılır. Ortam değişkenlerinden (`SUPABASE_URL`, `SUPABASE_ANON_KEY`) yapılandırma bilgilerini alarak типize edilmiş bir Supabase tarayıcı istemcisi oluşturur. Bu istemci, uygulama genelinde veritabanı sorguları ve kimlik doğrulama işlemleri için kullanılabilir.

## Modül İçeriği

Bu dosya fonksiyon içermez; yalnızca aşağıdaki bileşenleri tanımlar:

- **Ortam Değişkenleri**: Supabase proje URL'si ve anon anahtarı sabit olarak tanımlanır
- **Tarayıcı İstemcisi**: `@supabase/ssr` paketindeki `createBrowserClient` kullanılarak tip güvenli bir istemci oluşturulur
- **Tip Desteği**: Veritabanı şeması `Database` tipi ile import edilerek sorgularda tip tamamlama (autocomplete) ve derleme zamanı kontrolü sağlanır

---

## AXIOMS – Mimari Varsayımlar

Bu modül, Supabase istemcisini yapılandıran ve dışa aktaran bir başlatma (initialization) modülüdür.

[Aksiyom 1]: Eğer `SUPABASE_URL` sabiti tanımlı veya erişilebilir değilse, tarayıcı istemcisi (`supabaseBrowserClient`) geçersiz bir URL ile oluşturulur ve tüm Supabase istekleri bağlantı hatası ile başarısız olur.

[Aksiyom 2]: Eğer `SUPABASE_ANON_KEY` sabiti tanımlı veya erişilebilir değilse, tarayıcı istemcisi (`supabaseBrowserClient`) yetkilendirme anahtarı olmadan oluşturulur ve tüm kimlik doğrulama gerektiren istekler reddedilir.

[Aksiyom 3]: Eğer `supabaseBrowserClient` oluşturulamazsa (örn: `SUPABASE_URL` veya `SUPABASE_ANON_KEY` eksik/bozuksa), bu modülü import eden tüm modüller geçersiz bir istemci nesnesi kullanır ve Supabase ile olan tüm iletişim kesilir.

---

## FONKSİYON DETAYLARI

---

## SABİTLER
- **SUPABASE_URL** [env-backed] (binary_expression) — `process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'`
- **SUPABASE_ANON_KEY** [env-backed] (binary_expression) — `process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'`
- **supabaseBrowserClient** (call) — `createBrowserClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
)`

---

## AST POINTERS

> **Not**: Bu dosya (`src/lib/supabase/client.ts`) modül düzeyinde sabitler ve istemci başlatma içerir; tanımlı fonksiyon bulunmamaktadır.

### [M1] AST Pointer: client.ts (Modül Düzeyi)

- **Import Edilenler**:
  - `createBrowserClient` — `@supabase/ssr` paketinden, tarayıcı tarafı Supabase istemcisi oluşturan fonksiyon
  - `Database` — `../../types/database.types` dosyasından, Supabase veritabanı şema tiplerini tanımlayan tip

- **Sabitler (Modül Düzeyi)**:
  - `SUPABASE_URL` — Supabase projesi URL adresi (binary_expression ile tanımlanmış, büyük olasılıkla `process.env.NEXT_PUBLIC_SUPABASE_URL`)
  - `SUPABASE_ANON_KEY` — Supabase anon (genel) anahtarı (binary_expression ile tanımlanmış, büyük olasılıkla `process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY`)

- **İstemci Değişkeni (Modül Düzeyi)**:
  - `supabaseBrowserClient` — `createBrowserClient()` çağrısı ile oluşturulan, tipi `Database` olarak parametreleştirilmiş Supabase tarayıcı istemcisi; uygulama genelinde kullanılmak üzere export edilir

- **Dönüş**: Yok (modül sonu; dosya sadece istemci örneğini export eder)

---

## NODE ID STANDARD

  file: src\lib\supabase\client.ts

---

## DISA AKTARILANLAR (EXPORTS)
  export: supabaseBrowserClient