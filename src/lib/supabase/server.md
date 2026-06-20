---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\lib\supabase\server.ts
skeleton_hash: f4e30b8090c51d71
entity_hashes:
  func:createSupabaseServerClient: e1abcfb101f22d63
  overview: 32f6efa96dd36ed3
generated_at: 2026-06-19T20:48:10Z
---

## Genel Bakış
Bu modül, sunucu tarafında Supabase istemcisi oluşturmak için tek bir fabrika fonksiyonu içerir. Next.js sunucu bileşenleri, API rotaları veya sunucu taraflı veri erişim katmanları için güvenli bir Supabase bağlantısı kurulmasını sağlar. Modül, kimlik bilgilerinin ve oturum yönetiminin merkezi olarak yapılandırılmasını temsil eder.

## Fonksiyon Grupları

### Supabase İstemci Oluşturma
Supabase ile iletişim kuracak ve sunucu tarafında çalışacak olan istemci nesnesini oluşturmak ve yapılandırmakla yükümlüdür.
- createSupabaseServerClient

---

## AXIOMS – Mimari Varsayımlar

Supabase sunucu istemcisi oluşturma modülü için temel mimari varsayımlar:

---

## FONKSİYON DETAYLARI

### createSupabaseServerClient

**Ne yapar**: Bu fonksiyon, sunucu tarafında (Next.js App Router ortamında) çalışacak şekilde yapılandırılmış bir Supabase istemcisi oluşturur. Temel amacı, kullanıcı oturumunu ve ilgili cookie'leri yönetebilen bir veritabanı bağlantısı sağlamaktır.

**Nasıl yapar**: Fonksiyon, asenkron olarak mevcut istekle ilişkili cookie mağazasını (`cookies()`) alır. Ardından, ortam değişkenlerinden (`NEXT_PUBLIC_SUPABASE_URL` ve `NEXT_PUBLIC_SUPABASE_ANON_KEY`) Supabase bağlantısı için gerekli URL ve anahtarı okur; bu değerler tanımlı değilse bir yer tutucu değer kullanır. Son olarak, `createServerClient` fonksiyonunu çağırarak, cookie'leri okma (`getAll`) ve ayarlama (`setAll`) yeteneklerine sahip bir Supabase istemcisi nesnesi döndürür. `setAll` metodundaki `try-catch` bloğu, cookie ayarlama işleminin başarısız olabileceği durumları (örneğin, istek gövdesinin salt okunur olduğu durumları) sessizce işler.

**Parametreler**:
- Bu fonksiyon herhangi bir parametre almaz.

**Dönüş**:
Fonksiyon, `SupabaseClient<Database>` tipinde bir nesne döndürür. Bu nesne, sunucu tarafında veritabanı sorguları yapmak ve kullanıcı oturumunu yönetmek için kullanılır.

---

## İTHALATLAR (IMPORTS)
- import: ../../types/database.types::type { Database }
- import: @supabase/ssr::createServerClient
- import: next/headers::cookies

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/lib/supabase/server.ts::createSupabaseServerClient
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `cookieStore` — Next.js cookies() API'sinden dönen cookie depolama nesnesi; tarayıcı çerezlerine okuma/yazma yapmak için kullanılır
  - `SUPABASE_URL` — `process.env.NEXT_PUBLIC_SUPABASE_URL` ortam değişkeninden okunan Supabase proje URL'i; yoksa `'https://placeholder.supabase.co'` fallback değeri kullanılır
  - `SUPABASE_ANON_KEY` — `process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY` ortam değişkeninden okunan Supabase anonim anahtarı; yoksa `'placeholder-key'` fallback değeri kullanılır
  - `cookiesToSet` — `setAll` iç fonksiyonunun parametresi; ayarlanması istenen çerezlerin dizisi
  - `name` — `cookiesToSet` içindeki her bir çerezin adı; `cookieStore.set()` çağrısında kullanılır
  - `value` — `cookiesToSet` içindeki her bir çerezin değeri; `cookieStore.set()` çağrısında kullanılır
  - `options` — `cookiesToSet` içindeki her bir çerezin seçenekleri (path, maxAge, httpOnly vb.); `cookieStore.set()` çağrısında kullanılır
- **Dönüş**: `Database` tipi ile tiplemiş `createServerClient<Database>` çağısının döndürdüğü Supabase sunucu istemcisi (ServerClient<Database>); cookie getAll/setAll adapter'ı bağlanmış halde

---

## NODE ID STANDARD

  file: src\lib\supabase\server.ts
  function: src\lib\supabase\server.ts::createSupabaseServerClient

---

## DISA AKTARILANLAR (EXPORTS)
  export: createSupabaseServerClient