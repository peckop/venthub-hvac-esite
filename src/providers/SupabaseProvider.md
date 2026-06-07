---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\providers\SupabaseProvider.tsx
skeleton_hash: 8b9157ceae697368
entity_hashes:
  func:SupabaseProvider: 10fa967be7816ba2
  func:useSupabaseClient: 117ceb934f45e8a6
  overview: 4ad62b48f1f2b3ca
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-06-07T16:38:23Z
---

## Genel Bakış
Bu modül, Supabase istemcisini React uygulaması genelinde paylaşmak için bir bağlam (context) sağlar. Uygulama bileşenlerinin Supabase veritabanı veya kimlik doğrulama hizmetlerine erişmesini kolaylaştırır.

## Fonksiyon Grupları
### Bağlam Sağlama ve Tüketme
Modül, Supabase istemcisini oluşturup React bileşen ağacı boyunca iletmek ve bileşenlerin bu istemciye erişmesini sağlamakla sorumludur.
- SupabaseProvider, useSupabaseClient

---

## AXIOMS – Mimari Varsayımlar

Supabase istemcisini React bileşen ağacında paylaşmak ve erişilebilir kılmak için tasarlanmış bir context provider modülüdür.

---

**[Aksiyom 1]**: Eğer `useSupabaseClient()` hook'u `SupabaseProvider` bileşeninin kapsamı dışında (hierarşik olarak üstünde) çağrılırsa, `SupabaseContext` değeri `undefined`/`null` olur ve runtime hatası oluşur.

**[Aksiyom 2]**: Eğer `SupabaseProvider` bileşeninin `children` prop'u sağlanmazsa veya geçerli bir `React.ReactNode` içermiyorsa, bileşen ağacı düzgün render edilmez veya boş render sonucu oluşur.

**[Aksiyom 3]**: Eğer uygulama kök seviyesinde (veya Supabase'e erişilmesi gereken en üst bileşenin之上ında) `SupabaseProvider` kullanılmamışsa, tüm alt bileşenlerdeki `useSupabaseClient()` çağrıları başarısız olur.

**[Aksiyom 4]**: Eğer `SupabaseContext` çağrısı (`call`) başarısız olursa veya bağlam değeri tanımsız kalırsa, `useSupabaseClient()` geçerli bir Supabase istemcisi döndürememe durumuna düşer.

---

> **Not**: Fonksiyon gövdesi (implementation) sağlandığında, Supabase client oluşturma parametreleri (URL, anon key vb.), hata yönetimi mekanizmaları ve opsiyel konfigürasyonlar için ek aksiyomlar eklenebilir. Mevcut aksiyomlar yalnızca fonksiyon imzaları ve standart React Context kalıpları üzerinden türetilmiştir.

---

## FONKSİYON DETAYLARI

### SupabaseProvider

**Ne yapar**: Uygulama genelinde kullanılabilir Supabase istemcisini oluşturur ve React Context aracılığıyla tüm alt bileşenlere sunar. Bu bileşen, uygulamanın üst seviyesinde yer alarak çocuk bileşenlerin Supabase bağlantısına erişmesini sağlar.

**Nasıl yapar**: İlk olarak `useState` hook'u ile lazy initialization (tembel başlatma) deseni kullanarak bir kez Supabase tarayıcı istemcisi oluşturur. Ortam değişkenlerinden `NEXT_PUBLIC_SUPABASE_URL` ve `NEXT_PUBLIC_SUPABASE_ANON_KEY` değerlerini okur; eğer bu değerler tanımsızsa yer tutucu (placeholder) değerler kullanır. Oluşturulan istemci nesnesini `useMemo` ile sararak gereksiz yeniden oluşturmaları önler ve `{ supabase }` değerini içeren bir context nesnesi oluşturur. Son olarak `SupabaseContext.Provider` bileşenini döndürerek children'ları bu context ile sarar.

**Parametreler**:
- `children`: `React.ReactNode` — Provider bileşeninin içine sarılacak olan tüm alt React bileşenleri. Bu parametre, Supabase bağlantısına ihtiyaç duyan tüm alt bileşenlerin bu bağlama erişebilmesini sağlar.

**Dönüş**: `JSX.Element` — `SupabaseContext.Provider` bileşeni döndürülür. Bu provider, `value` prop'u olarak `{ supabase }` nesnesini alır ve tüm çocuk bileşenlerin `useSupabase()` hook'u aracılığıyla Supabase istemcisine erişmesini mümkün kılar.

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

### [N1_NASIL] AST Pointer: SupabaseProvider.tsx::SupabaseProvider
- **params**: `{ children }` — `children: React.ReactNode` — Provider tarafından sarılacak alt React elemanları
- **ic_degiskenler**:
  - `supabase` — `createBrowserClient<Database>` ile oluşturulmuş Supabase istemcisi instance'ı; `useState` ile bir kez initialize edilir, sonraki render'larda aynı referans korunur
  - `process.env.NEXT_PUBLIC_SUPABASE_URL` — Supabase projesi URL'i; environment variable'dan okunur, yoksa `'https://placeholder.supabase.co'` fallback'i kullanılır
  - `process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon public anahtarı; environment variable'dan okunur, yoksa `'placeholder-key'` fallback'i kullanılır
  - `contextValue` — `useMemo` ile memoize edilmiş `{ supabase }` nesnesi; `supabase` bağımlılık dizisi değiştiğinde yeniden oluşturulur
- **Dönüş**: JSX — `SupabaseContext.Provider` elemanını `value={contextValue}` ile sarıp `children`'ı render eder

---

### [N2_NASIL] AST Pointer: SupabaseProvider.tsx::useSupabaseClient
- **params**: (yok)
- **ic_degiskenler**:
  - `context` — `useContext(SupabaseContext)` çağrısıyla elde edilen mevcut context değeri; içinde `{ supabase }` nesnesini tutar; `SupabaseProvider` dışındaysa `undefined` olabilir
- **Dönüş**: `context` — `{ supabase: SupabaseClient<Database> }` nesnesi; `context` falsy ise hata fırlatılır

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