---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\types\database.types.ts
skeleton_hash: 233ffe2c64624783
entity_hashes:
  overview: ce3fb4ce44f2949f
generated_at: 2026-05-28T22:38:39Z
---

## Genel Bakış

Bu TypeScript dosyası, VentHub HVAC projesinin veritabanı şemasını temsil eden tüm tablo, sütun ve ilişkili veri yapılarının tip tanımlarını içerir. Çalıştırılabilir kod veya fonksiyon barındırmayan modül, proje genelinde tip güvenliğini sağlamak ve veritabanı etkileşimlerinde derleme zamanı hatalarını yakalamak amacıyla kullanılır.

## Fonksiyon Grupları

Bu dosyada herhangi bir fonksiyon bulunmamaktadır; modül yalnızca tip tanımlarından oluşmaktadır.

---

## AXIOMS – Mimari Varsayımlar

Bu modül, çalıştırılabilir fonksiyon veya mantık içermeyen salt bir TypeScript tür tanım dosyasıdır; dolayısıyla runtime'da değiştirilecek bir durum veya koşul zinciri yoktur. Ancak, bu türlerin doğru kullanımı için aşağıdaki mimari varsayımlar (aksiyomlar) geçerlidir.

[Aksiyom 1]: Eğer bu modüldeki tür tanımları veritabanı şemasıyla tutarlı değilse, derleme zamanında tip hataları oluşur veya runtime'da beklenmeyen veri yapısı uyumsuzlukları meydana gelir.

[Aksiyom 2]: Eğer projedeki herhangi bir modül, veritabanı etkileşimlerinde bu dosyadaki tipler yerine kendi yerel tiplerini kullanırsa, veri tutarsızlığı ve bakım zorlukları oluşur.

[Aksiyom 3]: Eğer `as_expression` sabiti kullanılmıyorsa, ilgili veritabanı alanlarının tipi belirsiz kalır ve potansiyel tür hataları ortaya çıkabilir.

[Aksiyom 4]: Eğer veritabanı şemasında bir değişiklik yapılırsa ve bu dosya güncellenmezse, proje genelinde tür uyumsuzluğu hataları oluşur.

[Aksiyom 5]: Eğer bu modüldeki türler yanlışlıkla genişletilmez veya üzerlerine ek alanlar eklenmezse, derleyici tarafından yakalanamayan sessiz veri kayıpları veya bozulmaları meydana gelir.

---

## FONKSİYON DETAYLARI

---

## TYPE ALIASES

### Json
```typescript
type Json = | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]
```

### Database
```typescript
type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "1
```

### DatabaseWithoutInternals
```typescript
type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">
```

### DefaultSchema
```typescript
type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]
```

### Tables
```typescript
type Tables = <
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameO
```

### TablesInsert
```typescript
type TablesInsert = <
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    sche
```

### TablesUpdate
```typescript
type TablesUpdate = <
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    sche
```

### Enums
```typescript
type Enums = <
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: 
```

### CompositeTypes
```typescript
type CompositeTypes = <
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions 
```

---

## SABİTLER
- **Constants** (as_expression) — `{
  public: {
    Enums: {
      contact_department: ["sales", "support", "co...`

---

## AST POINTERS

Bu dosyada **fonksiyon tanımları bulunmamaktadır**.

### Dosya Yapısı Özeti: `database.types.ts`

- **Tur**: TypeScript tip/sabit tanımlama dosyası
- **Amaç**: Veritabanı şemasına karşılık gelen tipleri ve sabitleri tanımlar
- **İçerik**:
  - `Constants` — as_expression ile tanımlanmış sabit yapı (veritabanı enum değerleri, varsayılanlar vb. tutar)

---

### [N1_NASIL] AST Pointer: `database.types.ts::Constants` (Sabit Tanımı)

- **Tur**: `as_expression` (TypeScript tip/sabit dönüşümü)
- **Icerik**: Veritabanı tablo/alan sabitlerini temsil eden yapı
- **Fonksiyon gövdesi**: Yok — bu bir sabit tanımıdır, çalıştırılabilir kod içermez
- **Yan etkileri**: Yok — sadece derleme zamanı tip bilgisi sağlar

---

> **Not**: Bu dosya `src/types/` dizininde bulunduğu için, projedeki diğer modüllerin import edeceği **tip tanım merkezi** konumundadır. Çalışma zamanında herhangi bir kod çalıştırmaz; yalnızca TypeScript derleyicisi tarafından tip kontrolünde kullanılır.

---

## NODE ID STANDARD

  file: src\types\database.types.ts

---

## DISA AKTARILANLAR (EXPORTS)
  export: CompositeTypes
  export: Constants
  export: Database
  export: Enums
  export: Json
  export: Tables
  export: TablesInsert
  export: TablesUpdate