---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\types\database.types.ts
skeleton_hash: da2982eeacc188d4
entity_hashes:
  overview: ce3fb4ce44f2949f
generated_at: 2026-06-19T12:03:07Z
---

## Genel Bakış
Bu TypeScript dosyası, VentHub projesinin veritabanı şemasını ve tür yapılarını tanımlayan statik bir yapılandırma modülüdür. Modül, harici bir API veya işlevsunmaz; yerine, veritabanı tabloları, sütunları ve ilişkileri için tanımlı türleri (tipleri) ve olası sabit değerleri merkezi olarak depolar. Genellikle veri erişim katmanı (ör. Supabase istemcisi) ve iş mantığı tarafından içe aktarılarak, tip güvenliğini sağlamak ve veritabanı yapısının tek bir kaynaktan (SSOT) yönetilmesini sağlamak amacıyla kullanılır.

## Modülün Amacı ve Yapısı
Bu modül, fonksiyon veya metot içermeyen, yalnızca modül düzeyinde tanımlamalar (types/interfaces) ve sabitler içeren bir TypeScript tanım dosyasıdır. Temel rolü, proje genelinde veritabanı ile etkileşime girilecek her noktada kullanılacak olan **veri yapı şemasını** tanımlamaktır. Bu, veritabanı tablolarına karşılık gelen satır tiplerini, sütun isimlerini ve ilişkili veri türlerini kapsar.

## Bağımlılıklar ve Kullanım
- **Dış Bağımlılığı Yoktur:** Dosya, dışarıdan herhangi bir modülü import etmez; tamamen bağımsızdır.
- **İçe Aktaranlar (Bağımlıları):** Proje içindeki veritabanı istemcisi (servisleri), veri alanları (repo'lar) veya API rotaları tarafından import edilerek, query sonuçlarının veya parametrelerinin tip kontrolünde kullanılır.
- **Ortam Değişkeni veya API Kullanımı:** Doğrudan değildir. Ancak, burada tanımlanan tablo ve sütun isimleri, projedeki gerçek veritabanı yapılandırmasına ve API uçlarına (ör. `/rest/v1/...`) karşılık gelir.
- **Mimari Önemi:** Uygulama ile veritabanı arasındaki sözleşme katmanını oluşturur. Veritabanı şemasında yapılacak bir değişiklik (tablo ekleme, sütun değiştirme) bu dosyada güncellenerek tüm tip hatalarının编译 zamanında yakalanmasını sağlar, böylece runtime hatalarını önler.

---

## AXIOMS – Mimari Varsayımlar

Bu modül, veritabanı şeması için TypeScript tip tanımları içeren saf bir tip/sabit modülüdür.

[Aksiyom 1]: Eğer `as_expression` sabiti veritabanı şemasındaki bir ifadeyi temsil etmiyorsa, tip uyumsuzlukları oluşur.

[Aksiyom 2]: Eğer bu dosyadaki tip tanımları ile veritabanı şeması eş zamanlı güncellenmezse, veri erişim hataları meydana gelir.

[Aksiyom 3]: Eğer bu modül kaldırılırsa veya içeriği boşaltılırsa, onu import eden tüm modüllerde derleme hataları oluşur.

## AST POINTERS

(Dışa açılan çağrılabilir öğe yok — sabit tanımı; AST işaretçisi gerektiren fonksiyon/metot yok.)

## NODE ID STANDARD

file: C:\Users\alize\venthub-hvac\src\types\database.types.ts

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

Bu dosyada (`src/types/database.types.ts`) herhangi bir fonksiyon gövdesi, metot veya çalıştırılabilir blok bulunmamaktadır. Dosya yalnızca TypeScript tür tanımlamaları (type/interface) ve sabit bildirimlerinden oluşmaktadır.

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