---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\lib\supabase\static.ts
skeleton_hash: c0b4248c73227b1e
entity_hashes:
  overview: cb63656e8f0a9199
generated_at: 2026-06-19T20:48:10Z
---

## Genel Bakış

Bu modül, Statik Supabase istemcisini yapılandırarak dış kaynak bağımlılığı olmadan çalışabilen bir veritabanı bağlantısı sağlar. Ortam değişkenlerinden `SUPABASE_URL` ve `SUPABASE_ANON_KEY` değerlerini okuyarak tip güvenli (`Database` türü ile) bir Supabase istemcisi oluşturur. Oluşturulan `supabaseStaticClient` nesnesi, uygulama genelinde statik veya sunucu tarafı veri erişimi gereken senaryolarda kullanılmak üzere dışa aktarılır.

---

## AXIOMS – Mimari Varsayımlar

Bu modül, statik bir Supabase istemcisi oluşturmak için ortam değişkenlerine bağımlıdır. Aşağıda modülün doğru çalışması için gerekli mimari varsayımlar listelenmektedir.

[Aksiyom 1]: Eğer `NEXT_PUBLIC_SUPABASE_URL` ortam değişkeni tanımlı değilse veya boşsa, `SUPABASE_URL` sabiti `https://placeholder.supabase.co` değerine düşer. Bu durumda `supabaseStaticClient` geçersiz bir URL ile yapılandırılır; tüm veritabanı istekleri başarısız olur veya yanlış bir hedefe yönlendirilir.

[Aksiyom 2]: Eğer `NEXT_PUBLIC_SUPABASE_ANON_KEY` ortam değişkeni tanımlı değilse veya boşsa, `SUPABASE_ANON_KEY` sabiti bir placeholder anahtara (kesin değer belgede kesik, `'placeholder-k...'` olarak başlıyor) düşer. Bu durumda `supabaseStaticClient` geçersiz bir kimlik doğrulama anahtarı ile yapılandırılır; Supabase API çağrıları yetkilendirme hataları ile karşılaşır.

[Aksiyom 3]: `supabaseStaticClient` nesnesi modül yüklenirken (`module level`) bir kez oluşturulur ve değiştirilemez. Eğer bu istemci yanlış yapılandırılmışsa (örn. geçersiz URL veya anahtar), uygulama boyunca tüm statik/sunucu tarafı veri erişimleri etkilenir; sorunu düzeltmek için modülün yeniden yüklenmesi veya uygulamanın yeniden başlatılması gerekir.

[Aksiyom 4]: Modülün `process.env` nesnesine erişim gerektirir. Eğer çalışma ortamı (runtime) `process.env` desteklemiyorsa (örn. bazı tarayıcı ortamları), `SUPABASE_URL` ve `SUPABASE_ANON_KEY` değerleri `undefined` olarak değerlendirilir ve placeholder değerler devreye girer; bu da geçersiz bir bağlantı yapılandırmasına yol açar.

[Aksiyom 5]: `supabaseStaticClient` nesnesinin `Database` tipi ile tip güvenli olması, modülün import edildiği dosyalarda bu tipe uygun veritabanı şeması tanımının (`Database` tipi) mevcut olmasını gerektirir. Eğer `Database` tipi tanımlı değilse veya yanlış tanımlanmışsa, derleme zamanı tip hataları oluşur.

---

## FONKSİYON DETAYLARI

---

## İTHALATLAR (IMPORTS)
- import: ../../types/database.types::type { Database }
- import: @supabase/supabase-js::createClient

---

## SABİTLER
- **SUPABASE_URL** [env-backed] (binary_expression) — `process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'`
- **SUPABASE_ANON_KEY** [env-backed] (binary_expression) — `process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'`
- **supabaseStaticClient** (call) — `createClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth...`

---

## AST POINTERS

Bu dosyada herhangi bir **fonksiyon gövdesi** bulunmamaktadır. Dosya yalnızca：

- **Sabit tanımlamalar**: `SUPABASE_URL` ve `SUPABASE_ANON_KEY` (binary expression ile değer ataması)
- **Modül düzeyi client oluşturma**: `supabaseStaticClient` (fonksiyon gövedesi olmayan, doğrudan `createClient` çağrısı)

---

## NODE ID STANDARD

  file: src\lib\supabase\static.ts

---

## DISA AKTARILANLAR (EXPORTS)
  export: supabaseStaticClient