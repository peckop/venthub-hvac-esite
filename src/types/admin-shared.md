---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\types\admin-shared.ts
skeleton_hash: 6686f6184710e8c7
entity_hashes:
  overview: 050ebb9fda579a9b
generated_at: 2026-06-19T20:48:16Z
---

## Genel Bakış

`admin-shared.ts`, VentHub HVAC projesinin admin paneli genelinde kullanılan ortak TypeScript tip tanımlarını merkezi olarak barındıran bir paylaşım dosyasıdır. Dashboard ve tablo bileşenleri arasında tutarlılık sağlamak üzere standartlaştırılmış UI tipleri (örneğin satır yoğunluğu ve sıralama yönü gibi) bu dosyada tanımlanır. Modül yalnızca statik tip bildirimlerinden oluşur; herhangi birruntime mantığı, ortam değişkeni, harici API çağrısı veya veritabanı sorgusu içermez.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdesi, sabit veya çalıştırılabilir kod bulunmadığından, kod tabanlı mimari aksiyom türetilememiştir.

[Aksiyom 1]: Eğer bu dosyada runtime'da değerlendirilen herhangi bir değer (sabit, değişken, fonksiyon) tanımlanırsa, bu yalnızca TypeScript derleme zamanı tip kontrolüne etki eder; üretim (production) ortamında herhangi bir JavaScript çıktısı üretmez.

[Aksiyom 2]: Eğer bu dosya `import` veya `export` içermiyorsa, modül herhangi bir dış bağımlılık oluşturmadan boş bir modül olarak davranır ve başka modüller üzerinde yan etkisi yoktur.

---

## FONKSİYON DETAYLARI

---

## TYPE ALIASES

### Density
Table row density for dashboard views.
```typescript
type Density = 'comfortable' | 'compact'
```

### TableSortDir
Standard table sorting direction.
```typescript
type TableSortDir = 'asc' | 'desc'
```

---

## ENUMS

### LoadState
Common data loading states for views.
- `Idle`
- `Loading`
- `Error`

---

## AST POINTERS

Bu dosyada (`admin-shared.ts`) fonksiyon imzası veya fonksiyon gövdesi bulunmamaktadır. Dosya yalnızca TypeScript type ve interface tanımları içermektedir.

**Analiz sonucu**: Fonksiyon gövdesi içermediği için AST Pointer üretilemez.

---

## NODE ID STANDARD

  file: src\types\admin-shared.ts

---

## DISA AKTARILANLAR (EXPORTS)
  export: Density
  export: LoadState
  export: TableSortDir