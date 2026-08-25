---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\wt-supurme\src\types\database.types.ts
skeleton_hash: c2471dd70110decd
entity_hashes:
  overview: ce3fb4ce44f2949f
generated_at: 2026-08-25T07:30:14Z
---

## Genel Bakış
Bu modül, veritabanı ile ilgili tip tanımlamalarını ve sabitleri içerir. Dosyada fonksiyon bulunmaz; sadece modül seviyesinde kod (script/top-level statements) yer alır. İçerisinde `Constants` adında sabitler/değişkenler tanımlıdır. Modülün hangi ortam değişkenlerini kullandığı veya hangi API'leri/tabloları sorguladığı bilinmiyor.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Gerekçe:** Modül yalnızca tip tanımları ve `as_expression` sabitleri içermektedir; fonksiyon gövdesi bulunmadığından aksiyom üretilememiştir.

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
    PostgrestVersion
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
  TableName extends DefaultSchemaTableN
```

### TablesInsert
```typescript
type TablesInsert = <
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
   
```

### TablesUpdate
```typescript
type TablesUpdate = <
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
   
```

### Enums
```typescript
type Enums = <
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    sch
```

### CompositeTypes
```typescript
type CompositeTypes = <
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOpti
```

---

## SABİTLER
- **Constants** (as_expression) — `{
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
    ...`

---

## NODE ID STANDARD

  file: database.types.ts

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