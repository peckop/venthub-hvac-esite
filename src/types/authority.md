---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\types\authority.ts
skeleton_hash: ea0c6fd958f262af
entity_hashes:
  overview: 08381c41a177b637
generated_at: 2026-05-28T22:38:32Z
---

## Genel Bakış

Bu TypeScript modülü, VentHub HVAC projesinde kullanılan otorite sayfası (authority page) içerik bloklarının tip tanımlamalarını içerir. Modül, her biri `BaseAuthorityBlock` arayüzünü genişleten farklı içerik bloğu türleri (hero, specs, media, performance vb.) için arayüzler tanımlayarak, sayfa oluşturma sürecinde tutarlı veri yapılarının kullanılmasını sağlar.

## Fonksiyon Grupları

Bu dosyada herhangi bir fonksiyon bulunmamaktadır. Modül yalnızca statik tip tanımlamaları (arayüzler) içerir ve çalışma zamanı işlevi barındırmaz.

---

## AXIOMS – Mimari Varsayımlar
Bu modül, VentHub HVAC projesinde yetki (authority) sistemiyle ilgili TypeScript tip tanımlamalarını barındırmak üzere tasarlanmış, yalnızca bildirim (declaration) içeren kaynak bir dosyadır.

**[Aksiyom 1]:** Eğer bu modülde herhangi bir `export` bildirimi (type, interface, enum vb.) bulunmazsa, modül dışarı hiçbir tip ihraç etmez ve projenin diğer bölümleri bu modüldeki türleri referans alamaz.

**[Aksiyom 2]:** Eğer bu modülde çalıştırılabilir kod (fonksiyon gövdesi, class instance, değişken ataması) tanımlanırsa, modülün "statik tip bildirimi" rolü ihlal edilmiş olur.

**[Aksiyom 3]:** Eğer TypeScript derleyicisi (`tsc`) bu modülü derleme sürecine dahil etmezse, modüldeki tip tanımlamaları proje genelinde geçerli olmaz ve tür hataları yakalanamaz.

**[Aksiyom 4]:** Eğer modül, projenin `src/types` dizin yapısı dışında farklı bir konuma taşınırsa, projedeki import yolları kırılabilir (modülün konumu sabittir: `src/types/authority.ts`).

---

## FONKSİYON DETAYLARI

---

## INTERFACES

### BaseAuthorityBlock
- `id: string`
- `type: AuthorityBlockType`
- `order: number`
- `config?: {`

### HeroBlock extends BaseAuthorityBlock
- `type: 'hero'`
- `content: {`

### SpecsBlock extends BaseAuthorityBlock
- `type: 'specs'`
- `content: {`

### MediaBlock extends BaseAuthorityBlock
- `type: 'media'`
- `content: {`

### PerformanceBlock extends BaseAuthorityBlock
- `type: 'performance'`
- `content: {`

### RichTextBlock extends BaseAuthorityBlock
- `type: 'rich-text'`
- `content: {`

### FeaturesGridBlock extends BaseAuthorityBlock
- `type: 'features-grid'`
- `content: {`

### ComparisonBlock extends BaseAuthorityBlock
- `type: 'comparison'`
- `content: {`

### CtaBannerBlock extends BaseAuthorityBlock
- `type: 'cta-banner'`
- `content: {`

---

## TYPE ALIASES

### AuthorityBlockType
@file src/types/authority.ts @description Visual Page Builder (Otorite İçeriği) için dinamik blok tabanlı tip tanımları. Bu şema categories.authority_content JSONB alanı ile %100 uyumludur.
```typescript
type AuthorityBlockType = | 'hero' 
  | 'specs' 
  | 'performance' 
  | 'media' 
  | 'rich-text'
  | 'features-grid'
  | 'comparison'
  | 'cta-banner'
```

### AuthorityBlock
```typescript
type AuthorityBlock = | HeroBlock 
  | SpecsBlock 
  | MediaBlock 
  | PerformanceBlock
  | RichTextBlock
  | FeaturesGridBlock
  | ComparisonBlock
  | CtaBannerBlock
```

### AuthorityContent
```typescript
type AuthorityContent = AuthorityBlock[]
```

---

## AST POINTERS

Bu dosyada fonksiyon bulunmamaktadır.

**Kaynak:** `C:\Users\alize\venthub-hauc\src\types\authority.ts`

**Açıklama:** Dosya yapısı incelendiğinde, `.ts` uzantılı bir **type/interface tanımlama dosyası** olduğu görülmektedir. Bu tür dosyalarda fonksiyon gövdeleri yer almaz; yalnızca TypeScript type veya interface tanımları bulunur. Dolayısıyla AST Pointer üretilebilecek herhangi bir fonksiyon imzası veya gövedesi mevcut değildir.

---

## NODE ID STANDARD

  file: src\types\authority.ts

---

## DISA AKTARILANLAR (EXPORTS)
  export: AuthorityBlock
  export: AuthorityBlockType
  export: AuthorityContent
  export: BaseAuthorityBlock
  export: ComparisonBlock
  export: CtaBannerBlock
  export: FeaturesGridBlock
  export: HeroBlock
  export: MediaBlock
  export: PerformanceBlock
  export: RichTextBlock
  export: SpecsBlock

---

## BILEŞIM (CONTAINS)
  contains: BaseAuthorityBlock