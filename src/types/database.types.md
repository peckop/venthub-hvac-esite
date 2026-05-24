---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\types\database.types.ts
skeleton_hash: 233ffe2c64624783
generated_at: 2026-05-23T22:33:03Z
---

## Genel Bakış
Bu TypeScript modülü, VentHub HVAC projesinin veritabanı altyapısına ait tüm tür tanımlarını barındıran, proje genelinde tip güvenliği sağlayan bir tür tanım dosyasıdır. Herhangi bir çalıştırılabilir kod, harici bağımlılık veya fonksiyon içermeyen bu dosya, sadece TypeScript derleyicisi tarafından kullanılarak veritabanı etkileşimleri sırasında tür uyumsuzluğu hatalarının geliştirme aşamasında tespit edilmesini sağlar. Proje içindeki tüm veritabanı tablolarının, sütunlarının ve ilişkili veri yapılarının standartlaştırılmış tiplerini sunan bu modül, veritabanı ile tüm etkileşimlerde tutarlı veri yapısı kullanımını zorunlu kılar.

Bu modülde herhangi bir çalıştırılabilir fonksiyon bulunmadığından, fonksiyon grubu listesi oluşturulmamıştır.

---

## AXIOMS – Mimari Varsayımlar
Bu modül, VentHub HVAC projesinin veritabanı şema tiplerini tanımlayan sabit tip tanımlama modülüdür; projenin tip güvenliğiyle veritabanı etkileşimlerinin doğru çalışması için tüm proje modüllerinin bu tiplere uygun hareket etmesi zorunludur.

[Aksiyom 1]: Eğer bu modüle proje derleme (build) sürecinde erişilemiyorsa, proje içindeki tüm Typescript dosyaları veritabanı verilerinin tip doğrulamasını yapamaz, derleme zamanında yakalanması gereken tip uyumsuzlukları atlanır ve çalışma zamanı hataları oluşur.
[Aksiyom 2]: Eğer bu modüldeki tip tanımları, kullanılan canlı veritabanının güncel şemasıyla senkronize değilse, tüm veritabanı sorgulama, okuma ve yazma işlemlerinde şema uyuşmazlığı kaynaklı veri bozulmaları veya çalışma zamanı istisnaları meydana gelir.
[Aksiyom 3]: Eğer bu modülün içeriği üzerinde yetkisiz/yanlış değişiklik yapılırsa, proje genelinde tüm veritabanı etkileşimleri tutarsız hale gelir ve modülün sağladığı tip güvenliği tamamen devre dışı kalır.

---



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

Analiz edilen kaynak dosyası `C:\Users\alize\venthub-hvac\src\types\database.types.ts` içinde herhangi bir fonksiyon, sınıf metodu veya çalıştırılabilir kod bloğu tanımlanmamıştır. Dosyada sadece detayları, kullanım amacı ve erişim şekli fonksiyon gövdesi verilmediği için çıkarılamayan `Constants (as_expression)` adlı bir sabit bildirimi kaydedilmiştir. Listelenecek fonksiyona ait AST Pointer kaydı bulunmamaktadır.

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