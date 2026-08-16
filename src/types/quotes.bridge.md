---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-wt-quote\src\types\quotes.bridge.ts
skeleton_hash: 1a03ed253fbf6d0b
entity_hashes:
  func:withQuotesSchema: cd144cb372dd5c65
  overview: c6ded114909290b8
generated_at: 2026-08-16T10:22:28Z
---

## Genel Bakış

Bu modül, Supabase istemcisini `quotes.bridge` şeması ile ilişkilendirerek tür güvenliği sağlayan bir markalama (branding) yardimcısıdır. Tek bir fonksiyondan oluşan bu modül, veritabanı erişim katmanında doğru tablo ve sütun referanslarının compile-time'da doğrulanmasını temin eder.

## Fonksiyon Grupları

### Şema Markalama (Schema Branding)

Genel amaçlı Supabase istemcisini belirli bir veritabanı şemasıyla ilişkilendirerek, o şemadaki tablolara erişim sırasında tür bilgisini korur.

- `withQuotesSchema` — Verilen Supabase istemcisini alır ve `QuotesBridgeDatabase` türüyle yeniden markalanmış (re-branded) şekilde geri döner; böylece `quotes.bridge` şemasındaki tablo ve sütun isimleri compile-time'da tip kontrolüne tabi tutulur.

---

## AXIOMS – Mimari Varsayımlar

Bu modül, bir Supabase istemcisini `QuotesBridgeDatabase` şemasına uygun hale getiren bir sarmalayıcı (wrapper) fonksiyonudur. Fonksiyon gövdesi verilmediği için varsayımlar yalnızca fonksiyon imzasından türetilmiştir.

**[Aksiyom 1]**: Eğer `supabase` parametresi `null` veya `undefined` olarak verilirse, fonksiyon beklenmeyen bir hata fırlatır veya tanımsız davranış (undefined behavior) gösterir.

**[Aksiyom 2]**: Eğer `Database` generic tipi ile `QuotesBridgeDatabase` generic tipi yapısal olarak (structural) uyumlu değilse, fonksiyonun döndürdüğü istemci ile yapılan sorgulamalar derleme zamanında tip hatası verir veya çalışma zamanında hatalı sorgular üretir.

**[Aksiyom 3]**: Eğer verilen `supabase` istemcisinin arkasındaki bağlantı (connection) yapılandırması (`SUPABASE_URL`, `SUPABASE_ANON_KEY` vb.) geçersizse, döndürülen istemci ile yapılan istekler başarısız olur — bu durum fonksiyonun sorumluluğu dışında kabul edilir.

**[Aksiyom 4]**: Eğer `QuotesBridgeDatabase` tipi, `quotes` tablosunu ve ilişkili tabloları içermiyorsa, döndürülen istemci ile `quotes` şemasına ait tablolara erişim denemeleri zaman zaman tip sistemince engellenir veya çalışma zamanında hata oluşur.

---

**Not**: Fonksiyon gövdesi (implementasyon) paylaşılmadığı için, bu fonksiyonun sadece bir tip assert/cast mi yaptığı, yoksa runtime'da ek bir dönüştürme (örn. `rpc`, `schema` bağlama) mı yaptığı belirlenememiştir. Aksiyomlar bu belirsizliği yansıtmaktadır.

---

## FONKSİYON DETAYLARI

### withQuotesSchema
**Ne yapar**: Verilen Supabase client nesnesini, quotes tablolarını da içeren genişletilmiş veritabanı şeması (QuotesBridgeDatabase) ile eşleşen tipe dönüştürerek tip güvenli erişim sağlar. Bu fonksiyon yalnızca TypeScript derleyici aşamasında devreye girer, runtime'da herhangi bir dönüşüm veya kopyalama gerçekleştirmez.

**Nasıl yapar**: Fonksiyon, TypeScript'in type assertion (tip iddiası) mekanizmasını kullanarak `SupabaseClient<Database>` tipini doğrudan `SupabaseClient<QuotesBridgeDatabase>` tipine dönüştürür. Bu basit cast işlemi, mevcut DI (Dependency Injection) client'ının yeniden oluşturulmasını engeller. Yeni bir client yaratılmaması kritiktir; çünkü Supabase client'ının çift实例 (instance) edilmesi GoTrueClient kaynak kilidi ve donma sorunlarına yol açabilir. Fonksiyon gövdesinde herhangi bir mantıksal işlem yoktur, yalnızca return ifadesi ile aynı nesneyi farklı tip altında döndürür.

**Parametreler**:
- supabase: `SupabaseClient<Database>` — Mevcut dependency injection ile enjekte edilmiş Supabase istemcisi. Bu client, temel veritabanı şeması (Database) ile yapılandırılmıştır ve zaten aktif bir oturum ve bağlantı havuzu içerir.

**Dönüş**: `SupabaseClient<QuotesBridgeDatabase>` — Orijinal client nesnesinin aynı referansı, ancak TypeScript derleyicisi tarafından quotes tablolarına (quotes, quotes_items vb.) tip güvenli erişim izni verilen genişletilmiş şema ile ilişkilendirilmiş olarak döndürülür.

---

## İTHALATLAR (IMPORTS)
- import: ../lib/quotes/quoteStatusMachine::type { QuoteStatus }
- import: ./database.types::type { Database }
- import: @supabase/supabase-js::type { SupabaseClient }

---

## TYPE ALIASES

### QuoteSource
```typescript
type QuoteSource = 'pdp' | 'cart' | 'project'
```

### QuoteRow
```typescript
type QuoteRow = {
  id: string
  user_id: string
  source: QuoteSource
  source_project_id: string | null
  status: QuoteStatus
  tenant_id: string
  created_at: string
  updated_at: string
}
```

### QuoteInsert
```typescript
type QuoteInsert = {
  user_id: string
  source: QuoteSource
  source_project_id?: string | null
}
```

### QuoteUpdate
```typescript
type QuoteUpdate = {
  status?: QuoteStatus
}
```

### QuoteItemRow
```typescript
type QuoteItemRow = {
  id: string
  quote_id: string
  product_id: string | null
  product_name: string
  qty: number
  note: string | null
  unit_price: number | null
  currency: string | null
  valid_until: string | n
```

### QuoteItemInsert
```typescript
type QuoteItemInsert = {
  quote_id: string
  product_id?: string | null
  product_name: string
  qty: number
  note?: string | null
}
```

### QuoteItemPriceUpdate
Yalnız admin fiyatlama yolu kullanır (cetvel Q3/R5 — müşteri yüzünde bu tip import edilmez).
```typescript
type QuoteItemPriceUpdate = {
  unit_price?: number | null
  currency?: string | null
  valid_until?: string | null
}
```

### QuotesTables
```typescript
type QuotesTables = {
  venthub_quotes: {
    Row: QuoteRow
    Insert: QuoteInsert
    Update: QuoteUpdate
    Relationships: []
  }
  venthub_quote_items: {
    Row: QuoteItemRow
    Insert: QuoteItemInsert
    Update:
```

### QuotesBridgeDatabase
Database + iki yeni tablo — regen sonrası bu tipin kendisi gereksizleşir ve silinir.
```typescript
type QuotesBridgeDatabase = Omit<Database, 'public'> & {
  public: Omit<Database['public'], 'Tables'> & {
    Tables: Database['public']['Tables'] & QuotesTables
  }
}
```

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/types/quotes.bridge.ts::withQuotesSchema
- **params**: `supabase` — SupabaseClient<Database> tipinde, Supabase istemcisi
- **ic_degiskenler**: (yok — fonksiyon gövdesinde değişken tanımlanmamıştır)
- **Dönüş**: `SupabaseClient<QuotesBridgeDatabase>` — supabase parametresini QuotesBridgeDatabase şemasına cast ederek döner

---

## NODE ID STANDARD

  file: src\types\quotes.bridge.ts
  function: src\types\quotes.bridge.ts::withQuotesSchema

---

## DISA AKTARILANLAR (EXPORTS)
  export: QuoteInsert
  export: QuoteItemInsert
  export: QuoteItemPriceUpdate
  export: QuoteItemRow
  export: QuoteRow
  export: QuoteSource
  export: QuoteUpdate
  export: withQuotesSchema