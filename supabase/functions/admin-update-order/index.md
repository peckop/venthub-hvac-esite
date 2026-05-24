---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\supabase\functions\admin-update-order\index.ts
skeleton_hash: f52d9153a17ad7ad
generated_at: 2026-05-24T07:32:03Z
---

## Genel Bakış
Bu modül, admin kullanıcısının bir sipariş güncelleme talebini işleyen tek bir işlevi içerir. Gelen HTTP isteğini alır, gerekli doğrulama ve veri güncelleme adımlarını yürütür ve sonucu uygun bir HTTP yanıtı olarak döndürür.

## Fonksiyon Grupları
### İstek İşleme ve Yanıt Üretimi
Modülün tek sorumluluğu, admin tarafından gönderilen sipariş güncelleme isteğini alıp işlemek ve işlem sonucunu istemciye yanıt olarak iletmektir.
- admin-update-order_handler

---

## AXIOMS – Mimari Varsayımlar
Bu modülün doğru çalışması için aşağıdaki varsayımlar geçerlidir:
[Aksiyom 1]: Eğer `req` parametresi sağlanmazsa, fonksiyon çalıştırılamaz veya hata fırlatır.

---

## FONKSIYON DETAYLARI

### admin-update-order_handler
**Ne yapar**: Admin tarafından bir siparişin güncellenmesini işleyen HTTP handler fonksiyonudur.  
**Nasıl yapar**: Gelen `Request` nesnesini alır, içeriğini işler, gerekli güncelleme işlemini gerçekleştirir ve sonuç olarak uygun bir `Response` nesnesi döndürür.  
**Parametreler**:  
- req: Request — Güncellenecek sipariş verilerini içeren HTTP isteği nesnesi.  
**Dönüş**: Response — İşlemin sonucunu temsil eden HTTP yanıtı nesnesi (başarı durumu, hata mesajı veya güncellenmiş sipariş bilgisi).

---

We need to produce AST POINTERS section for each function. The file has main handler function (async admin-update-order_handler(req: Request) -> Response) and two inner functions patch and listRecent defined inside the handler? Actually they are defined inside the try block, but they are separate functions. The provided "FONKSIYON GOVDELERI (TAM)" includes the main arrow function body, then after that there are separate definitions for patch and listRecent (they appear duplicated? Actually they appear twice: once inside the try block (as definitions) and then again after the main function? The text shows after the main function body there are:

async function patch(filter: string) { ... }

async function listRecent(_limit = 100) { ... }

These appear to be the same as inner functions but maybe they are separate top-level functions? However given the context, they are defined inside the handler but also repeated? The "FONKSIYON GOVDELERI (TAM)" includes the main arrow function body, then after the closing brace of the main function, there are two function definitions (patch and listRecent). Likely they are intended as separate functions (maybe they were extracted). We'll treat them as separate functions.

Thus we have three functions:

1. admin-update-order_handler (the main arrow function)
2. patch(filter: string)
3. listRecent(_limit = 100)

We need to produce for each:

### [N1_NASIL] AST Pointer: {rel_path}::fonksiyon_adı

We need rel_path: source_path given: C:\Users\alize\venthub-hvac\supabase\functions\admin-update-order\index.ts

We need relative path? Probably just the file path as given? Use that path.

Thus for each function:

- params: list of parameters
- ic_degiskenler: variables declared inside function body (including const, let, var). For each variable we need description: what it is used for.

- Dönüş: return type or "yok". For async functions returning Promise<Response> etc. We'll state return type: Response (or Promise<Response>)? In TypeScript, async function returns Promise<Response>. We'll just say Response (since they return Response). For patch and listRecent: patch returns Promise<Response> (since await fetch returns Response). listRecent returns Promise<any[]>? Actually returns Array (list of orders). We'll say returns Order[] (or any[]). We'll infer.

Now we need to extract variables from each function body.

Let's parse main handler body.

Main handler arrow function body (the big block). We'll list all const/let declarations.

I'll go through the code:

Now list all const/let declarations (including those inside try block, inside ifs, etc). We'll list each variable with description.

Variables:

- origin: string from request header 'origin' or empty.
- allowed: array of allowed origins from env var ALLOWED_ORIGINS split, trimmed, filtered.
- okOrigin: boolean indicating if origin is allowed (empty allowed list or origin present in allowed).
- requestId: string UUID or timestamp for request tracing.
- cors: object containing CORS headers.
- ct: content-type header lowercased.
- max: max allowed body size in bytes (from env MAX_BODY_KB default 100KB).
- cl: content-length header as integer (default 0).
- supabaseUrl: string env var SUPABASE_URL.
- serviceRoleKey: string env var SUPABASE_SERVICE_ROLE_KEY.
- anonKey: string env var SUPABASE_ANON_KEY.
- authHeader: string Authorization header.
- authClient: Supabase client instance created with anonKey and auth header.
- data: object from authClient.auth.getUser()? Actually destructuring: const { data: { user }, error: authErr } = await authClient.auth.getUser(); So we have:
   - user: the user object from auth data.
   - authErr: error from auth call.
- roleCheck: Response from fetch to user_profiles endpoint.
- arr: array parsed from roleCheck.json() (or empty array).
- role: string role from first element of arr.
- body: parsed JSON body from request (or empty object).
- id, conversation_id, status, display_code: destructured from body.
- newStatus: string status to set (default 'paid').
- patch: inner async function (but it's a function declaration, not a variable? It's a const? Actually declared as async function patch... It's a function declaration, but we can treat as variable? The instruction: ic_degiskenler: her değişken için "isim — ne işe yarar" formatında. Should we include function declarations? Probably yes, as they are identifiers. But they are functions; we can include them with description.
- listRecent: inner async function.
- resp: Response | null variable to hold patch response.
- recent: array of recent orders from listRecent.
- target: object representing order matching display_code.
- ok: boolean indicating if resp ok.
- text: string response body.

Also there is _e in catch block: variable _e (error). We'll include.

Also there is maybe other variables like `const { data: { user }, error: authErr }` we already captured user and authErr.

Also there is `const { id, conversation_id, status, display_code } = body || {};` we captured those.

Also there is `const { data: { user }, error: authErr }` we captured.

Also there is `const { data: { user }, error: authErr }` we captured.

Also there is `const { data: { user }, error: authErr }` we captured.

Also there is `const { data: { user }, error: authErr }` we captured.

Also there is `const { data: { user }, error: authErr }` we captured.

Ok.

Now we need to produce ic_degiskenler list for main function.

We'll list each variable with description.

Now for patch function:

Variables inside patch:

- filter: parameter (string)
- supabaseUrl: from outer scope (but used inside). Should we include as internal variable? It's not declared inside patch; it's from outer scope. The instruction: "Her değişken için mutlaka açıklama yaz" and "SADECE fonksiyon gövdesinde GERÇEKTEN kullanılan değişkenleri listele". So we should list variables that are used inside the function body, regardless of where they are declared? It says "fonksiyon gövdesinde GERÇEKTEN kullanılan değişkenleri listele". That suggests we list variables that are used in the function body, even if they are from outer scope. However earlier they said "ic_degiskenler: her değişken için 'isim — ne işe yarar' formatında". Likely they mean variables declared inside the function. But ambiguous. To be safe, we list only those declared inside the function (const/let/var/function). In patch, there are no declarations besides the parameter filter. There's no const/let inside

---

## NODE ID STANDARD

  file: supabase\functions\admin-update-order\index.ts
  function: supabase\functions\admin-update-order\index.ts::admin-update-order_handler

---

## DISA AKTARILANLAR (EXPORTS)
  export: admin-update-order_handler