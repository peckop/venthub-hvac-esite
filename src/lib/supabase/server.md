---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\ops-t165\src\lib\supabase\server.ts
skeleton_hash: ab267eb484a0c7c2
entity_hashes:
  func:createSupabaseServerClient: f9a15c72a61b3af3
  overview: 32f6efa96dd36ed3
generated_at: 2026-08-27T07:08:05Z
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
**Ne yapar**: Sunucu tarafında çalışan bir Supabase istemcisi oluşturur. Cookie tabanlı oturum yönetimini yapılandırarak Next.js sunucu ortamında Supabase veritabanı bağlantısı sağlar.

**Nasıl yapar**: Fonksiyon önce `cookies()` fonksiyonunu çağırarak cookie deposunu elde eder. Ardından ortam değişkenlerinden `NEXT_PUBLIC_SUPABASE_URL` ve `NEXT_PUBLIC_SUPABASE_ANON_KEY` değerlerini okur; bu değişkenler tanımlı değilse `'https://placeholder.supabase.co'` ve `'placeholder-key'` gibi placeholder değerler kullanır. Son olarak `createServerClient<Database>` fonksiyonunu çağırarak istemciyi döndürür. Bu çağrıda cookie yönetimi için iki metot tanımlanır: `getAll()` mevcut tüm cookie'leri okurken, `setAll()` yeni cookie'leri yazmaya çalışır. `setAll` içindeki `try-catch` bloğu, cookie yazma işleminde oluşan hataları yakalar ve yoksayar; kod yorumuna göre bu durumda middleware'in refresh işlemini üstlenmesi beklenir.

**Parametreler**:
- Fonksiyon herhangi bir parametre almaz.

**Dönüş**: `createServerClient<Database>` fonksiyonunun dönüş değeri olan Supabase sunucu istemcisini döndürür. Kesin dönüş tipi belirtilmemiştir.

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
  - `cookieStore` — `await cookies()` ile elde edilen Next.js cookie store nesnesi; `getAll()` ve `set()` metodlarını sağlar
  - `SUPABASE_URL` — `process.env.NEXT_PUBLIC_SUPABASE_URL` ortam değişkeni; tanımlı değilse `'https://placeholder.supabase.co'` varsayılan değerini alır
  - `SUPABASE_ANON_KEY` — `process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY` ortam değişkeni; tanımlı değilse `'placeholder-key'` varsayılan değerini alır
  - `cookies` — `createServerClient`'a iletilen yapılandırma nesnesi içindeki alt obje; `getAll` ve `setAll` metodlarını tanımlar
  - `getAll()` — `cookieStore.getAll()` çağırarak tüm çerezleri döndüren anonim fonksiyon
  - `setAll(cookiesToSet)` — verilen çerez dizisini `cookieStore.set()` ile ayarlayan anonim fonksiyon; hata fırlatılırsa yoksayar (middleware'in yenilemeyi üstlenebileceği varsayımıyla)
  - `cookiesToSet` — `setAll` fonksiyonuna gelen parametre; her elemanı `{ name, value, options }` alanlarına sahip nesnelerden oluşan dizi
  - `name` — `cookiesToSet` elemanlarından destructuring ile elde edilen çerez adı
  - `value` — `cookiesToSet` elemanlarından destructuring ile elde edilen çerez değeri
  - `options` — `cookiesToSet` elemanlarından destructuring ile elde edilen çerez seçenekleri nesnesi
- **Dönüş**: `createServerClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, { cookies })` çağrısının dönüşü — `Database` tipi ile genericlenmiş Supabase sunucu istemcisi

---

## NODE ID STANDARD

  file: src\lib\supabase\server.ts
  function: src\lib\supabase\server.ts::createSupabaseServerClient

---

## DISA AKTARILANLAR (EXPORTS)
  export: createSupabaseServerClient