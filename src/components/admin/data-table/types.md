---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\admin\data-table\types.ts
skeleton_hash: d6719ae1220d4b24
entity_hashes:
  overview: ddbf04dea1d9de40
generated_at: 2026-06-19T20:47:00Z
---

## Genel Bakış
Bu modül, admin panelindeki veri tablosu bileşeninin (data-table) temel TypeScript tür tanımlarını ve arayüzlerini içerir. Bileşenin alabileceği prop'ları, gösterilecek veri yapılarını ve tablonun dinamik yapılandırmasına ilişkin tüm tip güvenliğini sağlar. Dosya, React'tan yalnızca `ReactNode` tipini import eder ve başka bir harici bağımlılık veya ortam değişkeni kullanmaz; saf bir tür bildirim dosyasıdır.

## Fonksiyon Grupları
Bu dosyada herhangi bir fonksiyon veya metot bulunmamaktadır. Dosya, modül seviyesinde yalnızca TypeScript tür tanımlamaları (interface, type, enum vb.) içerir. Bu tanımlar, veri tablosu bileşeninin iç yapısını ve dışarıya açıldığı API'yi belirler.

---

## AXIOMS – Mimari Varsayımlar
- Bu modül davranışsal mantık içermez (salt veri / konfigürasyon / tip tanımı).
- [Aksiyom 1]: Modülün dışa açtığı yapı (anahtar kümesi / şema) bir sözleşmedir; tüketiciler bu sabit yapıya bağlıdır — kırıcı değişiklik tüm tüketicileri etkiler.
- [Aksiyom 2]: Bir öğe ekleme/çıkarma yapısal-uyumlu olmalı; ilgili tipler ve seçiciler aynı commit'te güncel tutulmalıdır.

---

## FONKSİYON DETAYLARI

---

## İTHALATLAR (IMPORTS)
- import: react::type { ReactNode }

---

## INTERFACES

### AdminColumn
Kolonların TEK kaynağı (SSOT). `header` = i18n-ÇÖZÜLMÜŞ string — kit içinde `t()` YOK, çağıran taraf `t('...')` ile çözüp geçirir (fallback-pattern YASAK, standart §6.5).
- `key: string`
- `header: string`
- `sortable?: boolean`
- `align?: AdminAlign`
- `hideable?: boolean`
- `defaultHidden?: boolean`
- `cell: (row: T) => ReactNode`
- `headerClassName?: string`
- `cellClassName?: string`
- `facetAccessor?: (row: T) => string | null | undefined`

### DataTableFacet
Faceted filtre seçeneği — sayaçlı (Polaris §2.5).
- `key: string`
- `label: string`
- `options: { value: string; label: string; count: number }[]`

### EditableCell
Inline-edit sözleşmesi [ADV-1#2 / ADV-2#d-4]: - `parse` dönüşü ile `onSave` girdisi TİP-UYUMLU (her ikisi de `string | number`). - Optimistik UI: kit local satırı günceller; `onSave` reddederse kit geri alır (rollback) + hata toast'u. - Kit invariant'ı: aynı anda yalnız BİR açık editör.
- `columnKey: string`
- `parse?: (raw: string) => string | number`
- `onSave: (row: T, value: string | number) => Promise<void>`

---

## TYPE ALIASES

### AdminAlign
Hücre hizalama — sayısal kolonlar 'right' (Polaris §3).
```typescript
type AdminAlign = 'left' | 'right' | 'center'
```

---

## AST POINTERS

Bu dosya (`types.ts`) yalnızca TypeScript type/interface tanımları içerir; herhangi bir fonksiyon gövdesi, sabit veya class tanımı bulunmamaktadır. Dolayısıyla AST Pointer üretilecek bir fonksiyon mevcut değildir.

> **Not**: Dosya içeriği `import type { ReactNode } from 'react'` import'u ve muhtemelen interface/type alias tanımlarından ibarettir. Çalışma zamanında çalışan bir kod (fonksiyon, method, lambda) barındırmaz.

---

## NODE ID STANDARD

  file: src\components\admin\data-table\types.ts

---

## DISA AKTARILANLAR (EXPORTS)
  export: AdminAlign
  export: AdminColumn
  export: DataTableFacet
  export: EditableCell