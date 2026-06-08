---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\providers\SupabaseProvider.tsx
skeleton_hash: dd474ac74930675b
entity_hashes:
  func:SupabaseProvider: 10fa967be7816ba2
  func:useSupabaseClient: 117ceb934f45e8a6
  overview: 237b8c153c868842
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-06-08T10:10:58Z
---

## Genel Bakış
Bu modül, Supabase istemcisini React uygulaması genelinde paylaşmak için bir bağlam (context) sağlar. Uygulama bileşenlerinin Supabase veritabanı veya kimlik doğrulama hizmetlerine erişmesini kolaylaştırır.

## Fonksiyon Grupları
### Bağlam Sağlama ve Tüketme
Modül, Supabase istemcisini oluşturup React bileşen ağacı boyunca iletmek ve bileşenlerin bu istemciye erişmesini sağlamakla sorumludur.
- SupabaseProvider, useSupabaseClient

---

## AXIOMS – Mimari Varsayımlar

Bu modül, uygulama genelinde Supabase istemcisini paylaşmak için bir React bağlamı (context) sağlar.

**[Aksiyom 1]:** Eğer `SupabaseProvider` bileşeni, `SupabaseContext` için bir değer sağlamıyorsa, alt bileşenler (children) `useSupabaseClient` hook'u aracılığıyla istemciye erişemez.

**[Aksiyom 2]:** Eğer `useSupabaseClient` hook'u, `SupabaseProvider` bileşeninin kapsamı (scope) dışında çağrılırsa, bağlamdan değer alınamaz ve potansiyel olarak hata oluşur.

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

### [N1_NASIL] AST Pointer: src/providers/SupabaseProvider.tsx::SupabaseProvider
- **params**: `{ children }` — React children elemanları, provider içinde sarılacak olan bileşenler
- **ic_degiskenler**:
  - `supabase` — `useState` hook'u ile oluşturulan Supabase istemcisi; `createBrowserClient<Database>` çağrısı ile `process.env.NEXT_PUBLIC_SUPABASE_URL` ve `process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY` ortam değişkenlerinden başlatılır, fallback olarak `'https://placeholder.supabase.co'` ve `'placeholder-key'` kullanılır; lazy initialization ile sadece ilk render'da oluşturulur
  - `contextValue` — `useMemo` ile `{ supabase }` şeklinde sarılan değer; `supabase` referansı değişmediği sürece yeniden hesaplanmaz, `SupabaseContext.Provider`'a `value` olarak geçirilir
- **Dönüş**: JSX — `SupabaseContext.Provider` içinde `children`'ı saran React elementi döner

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