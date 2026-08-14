---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\providers\SupabaseProvider.tsx
skeleton_hash: ebb09593c042729b
entity_hashes:
  func:SupabaseProvider: 0486f9c3690a1312
  func:useSupabaseClient: 7e076e7731f37f73
  overview: 3b25cabc9a7a5c0d
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-06-19T20:48:28Z
---

## Genel Bakış
Bu modül, Supabase istemcisini React uygulaması genelinde paylaşmak için bir bağlam (context) sağlar. SupabaseProvider bileşeni, istemciyi oluşturarak ve bağlam aracılığıyla ileterek alt bileşenlerin Supabase veritabanı veya kimlik doğrulama hizmetlerine erişmesini kolaylaştırır. useSupabaseClient hook'u ise bu bağlamdan istemciyi tüketmek için kullanılır.

## Fonksiyon Grupları
### Bağlam Sağlama ve Tüketme
Modül, Supabase istemcisini oluşturup uygulama genelinde paylaşmak ve bileşenlerin bu istemciye erişmesini sağlamakla sorumludur.
- SupabaseProvider, useSupabaseClient

---

## AXIOMS – Mimari Varsayımlar

Bu modül, React bağlamı (context) aracılığıyla Supabase istemcisini uygulama genelinde paylaşmak için tasarlanmıştır.

**[Aksiyom 1]:** Eğer `useSupabaseClient()` hook'u `SupabaseProvider` bileşeni dışında çağrılırsa, bağlam değeri (`SupabaseContext`) tanımsız (undefined) olur.

**[Aksiyom 2]:** Eğer `SupabaseProvider` bileşenine `children` prop'u geçirilmezse, bileşen ağacı render edilmez ve alt bileşenler erişilemez hale gelir.

**[Aksiyom 3]:** Eğer `SupabaseContext` doğru bir şekilde başlatılmazsa (örn. Supabase istemcisi oluşturulamazsa), tüm bağımlı bileşenler geçersiz istemci nesnesine erişir ve veri işlemleri başarısız olur.

**[Aksiyom 4]:** Eğer `useSupabaseClient()` birden fazla seviyede iç içe `SupabaseProvider` ile sarılıysa, en iç seviyedeki bağlam değeri geçerli olur (context override davranışı).

---

## FONKSİYON DETAYLARI

### SupabaseProvider
**Ne yapar**: Tekil bir Supabase istemcisini (browser client) React bileşen ağacının içine, bağlam (context) yoluyla sağlayan bir üst düzey (wrapper) bileşendir. Bu sayede, alt bileşenler Supabase istemcisine doğrudan veya özel hook'lar aracılığıyla erişebilir.

**Nasıl yapar**: Bileşen, import edilmiş tekil `supabaseBrowserClient` instance'ını `useState` hook'uyla başlatır. `useMemo` kullanarak bağlam değerinin (`{ supabase }`) referansının, `supabase` değişmediği sürece değişmemesini sağlar ve gereksiz yeniden render'ları önler. Son olarak, oluşturulan değeri `SupabaseContext.Provider` bileşeninin `value` prop'una atayarak alt bileşenlerine (`children`) bağlar.

**Parametreler**:
- children: `React.ReactNode` — Provider tarafından sarılacak ve Supabase istemcisine erişim sağlayabilecek React bileşenleri veya elementleri.

**Dönüş**: `React.JSX.Element` — `SupabaseContext.Provider` ile sarılmış `children` içeriğini döndürür.

### useSupabaseClient
**Ne yapar**: `SupabaseProvider` tarafından sağlanan bağlam değerini okuyarak, mevcut React bileşen ağacındaki herhangi bir alt bileşenin tekil Supabase istemcisine erişmesini sağlayan bir özel hook'tur.

**Nasıl yapar**: `useContext` hook'u kullanarak `SupabaseContext`'ten bağlam değerini alır. Eğer hook, `SupabaseProvider` dışındaki bir yerde çağrılırsa bağlam `undefined` olur ve bu durum hata fırlatılarak hatalı kullanımı önlenir. Geçerli bağlam varsa, içindeki `supabase` nesnesini döndürür.

**Parametreler**: Parametre almaz.

**Dönüş**: `{ supabase: SupabaseClient }` — Bağlam nesnesi, içinde `supabase` istemci instance'ını barındırır.

---

## İTHALATLAR (IMPORTS)
- import: @/lib/supabase/client::supabaseBrowserClient
- import: @/types/database.types::type { Database }
- import: @supabase/supabase-js::type { SupabaseClient }
- import: react::React
- import: react::createContext
- import: react::useContext
- import: react::useMemo
- import: react::useState

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
- **params**: `{ children }: { children: React.ReactNode }` — React child elemanları, provider kapsamı vermek için kullanılır
- **ic_degiskenler**:
  - `supabase` — `useState` hook'u ile initial edilen tekil Supabase browser client instance'ı; `supabaseBrowserClient` referansını initialState callback ile ata, ikinci GoTrueClient oluşturmasını engelle
  - `contextValue` — `useMemo` ile sarılmış `{ supabase }` nesnesi; SupabaseContext'e verilen value, gereksiz yeniden render'ları önler
- **Dönüş**: JSX — `SupabaseContext.Provider` ile `contextValue` value olarak sarılmış `children` elemanlarını render eder (yan etki: `SupabaseContext`'e global supabase instance'ını enjekte eder)

---

### [N2_NASIL] AST Pointer: src/providers/SupabaseProvider.tsx::useSupabaseClient
- **params**: (yok)
- **ic_degiskenler**:
  - `context` — `useContext(SupabaseContext)` çağrısından dönen mevcut context nesnesi (içinde `supabase` barındırır); null olursa hata fırlatır
- **Dönüş**: `context` nesnesi — `{ supabase: SupabaseClient<Database> }` yapısındaki context değeri

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