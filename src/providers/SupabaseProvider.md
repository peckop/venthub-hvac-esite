---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\providers\SupabaseProvider.tsx
skeleton_hash: 206efd9c448ac8ef
entity_hashes:
  func:SupabaseProvider: d2391552680159cd
  func:useSupabaseClient: 117ceb934f45e8a6
  overview: 191f6f58b43bb490
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-06-07T14:02:47Z
---

## Genel Bakış
Bu modül, Supabase istemcisini React uygulaması genelinde paylaşmak için bir bağlam (context) sağlar. Uygulama bileşenlerinin Supabase veritabanı veya kimlik doğrulama hizmetlerine erişmesini kolaylaştırır.

## Fonksiyon Grupları
### Bağlam Sağlama ve Tüketme
Modül, Supabase istemcisini oluşturup React bileşen ağacı boyunca iletmek ve bileşenlerin bu istemciye erişmesini sağlamakla sorumludur.
- SupabaseProvider, useSupabaseClient

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdesi verilmediğinden, sadece imza bilgilerine dayanan anlamlı bir mimari varsayım üretmek mümkün değildir. Bu nedenle, sadece yapısal ve zorunlu aksiyomlar tanımlanmıştır.

[Aksiyom 1]: Eğer `SupabaseContext` doğru bir React Context olarak çağrılmamışsa (örn. `createContext` ile oluşturulmamış veya `call` metodu tanımsızsa), `useSupabaseClient` hook'u `undefined` veya `null` bir değer döndürür ve bu durumda client kullanan tüm alt bileşenler çalışma zamanı hatası alır.

[Aksiyom 2]: Eğer `SupabaseProvider`, uygulama bileşen hiyerarşisinde `useSupabaseClient` hook'unu kullanan bileşenlerin üstünde konumlandırılmamışsa (örn.-provider dışında bir yerde kullanılırsa), hook çağrısı `Context`'e erişemez ve `undefined` değer döner; bu durumda veritabanı işlemleri başarısız olur.

[Aksiyom 3]: Eğer `SupabaseProvider`'ın içine geçirilen `children` prop'u geçerli bir React.ReactNode (örn. JSX Element, string, number, array veya null) değilse, React render ağacı bozulur ve bileşen ağaçları doğru oluşturulamaz.

---

## FONKSİYON DETAYLARI

### SupabaseProvider

**Ne yapar**: React uygulamasının tüm alt bileşenlerine Supabase istemcisini sağlamak için kullanılan bir context provider bileşenidir. Bu bileşen, uygulama hiyerarşisinde sarmaladığı tüm çocuk bileşenlerin Supabase bağlantısına erişmesini mümkün kılar.

**Nasıl yapar**: `useState` hook'u kullanarak tarayıcı tarafında tek bir Supabase istemcisi oluşturur ve bu istemciyi `createBrowserClient` fonksiyonuyla başlatır. Ortam değişkenlerinden (`NEXT_PUBLIC_SUPABASE_URL` ve `NEXT_PUBLIC_SUPABASE_ANON_KEY`) yapılandırma bilgilerini okur; bu değerler tanımlı değilse `placeholder` değerleriyle varsayılan bir istemci oluşturur. Oluşturulan istemci nesnesi `SupabaseContext.Provider` aracılığıyla tüm alt bileşenlere dağıtılır.

**Parametreler**:
- `children`: `React.ReactNode` — Provider içinde sarılacak alt React bileşenleri. Bu prop, provider'ın render edeceği tüm JSX içeriğini temsil eder.

**Dönüş**: `JSX.Element` — `SupabaseContext.Provider` ile sarılmış children bileşenlerini içeren JSX yapısı döndürür.

### useSupabaseClient
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

---

## TYPE ALIASES

### SupabaseContextType
```typescript
type SupabaseContextType = {
  supabase: SupabaseClient<Database>
}
```

---

## SABİTLER
- **SupabaseContext** (call) — `createContext<SupabaseContextType | undefined>(undefined)`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/providers/SupabaseProvider.tsx::SupabaseProvider
- **params**: (`{ children }: { children: React.ReactNode }`)
- **ic_degiskenler**:
  - `supabase` — `useState` ile oluşturulan state değişkeni. Fonksiyonsal güncelleyici ile `createBrowserClient` çağrısı yapılarak bir kere oluşturulur. `process.env.NEXT_PUBLIC_SUPABASE_URL` ve `process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY` çevre değişkenlerinden değerleri alır; tanımlı değillerse placeholder değerler kullanılır. `Database` tipi ile generic olarak tiplenmiştir.
- **Dönüş**: JSX (React.ReactNode), `SupabaseContext.Provider` ile sarılmış `children`.

### [N2_NASIL] AST Pointer: src/providers/SupabaseProvider.tsx::useSupabaseClient
- **params**: (yok)
- **ic_degiskenler**:
  - `context` — `useContext(SupabaseContext)` ile alınan bağlam nesnesi. `SupabaseProvider` içinde verilen `value={{ supabase }}` objesini içerir. `context` falsy ise bir `Error` fırlatılır (mesaj: `'useSupabaseClient must be used inside a SupabaseProvider'`).
- **Dönüş**: `context` objesi (içerisinde `supabase` anahtarı bulunan `{ supabase: SupabaseClient<Database> }`).

---

## NODE ID STANDARD

  file: src\providers\SupabaseProvider.tsx
  function: src\providers\SupabaseProvider.tsx::SupabaseProvider
  function: src\providers\SupabaseProvider.tsx::useSupabaseClient

---

## DISA AKTARILANLAR (EXPORTS)
  export: SupabaseProvider
  export: useSupabaseClient

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** (yok)
- **Layout:** (yok)
- **Varyant/Responsive:** (yok)
- **Yardımcı Sınıflar:** (yok)