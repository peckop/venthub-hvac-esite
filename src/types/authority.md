---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\types\authority.ts
skeleton_hash: ea0c6fd958f262af
generated_at: 2026-05-23T22:32:52Z
---

## Genel Bakış
VentHub HVAC projesinin `src/types` dizininde yer alan bu TypeScript modülü, projenin yetki (authority) yönetimi ile ilgili tip tanımlarını barındırmak üzere oluşturulmuştur. Henüz modül içinde herhangi bir kod unsuru (import, sabit, değişken, fonksiyon vb.) tanımlanmamıştır; gelecekte projenin yetki sistemine ait tüm tür tanımlamaları bu dosyaya eklenecektir.

---

## AXIOMS – Mimari Varsayımlar
Bu TypeScript modülünün, proje genelinde merkezi yetki (authority) tanımlamaları için tür bildirimleri içerdiği, yalnızca statik tip denetimi için kullanıldığı, çalıştırılabilir işlev barındırmadığı varsayılmıştır.

[Aksiyom 1]: Eğer proje TypeScript derleyicisi (tsc) ile statik tip denetimi gerçekleştirmiyorsa, bu modülde tanımlanan yetki türlerinin doğruluğu kontrol edilemez, proje boyunca yanlış formatta yetki nesneleri kullanımı nedeniyle çalışma zamanı hataları ortaya çıkar.
[Aksiyom 2]: Eğer bu modülde tanımlanan yetki türleri, proje içindeki tüm erişim denetimi katmanlarında zorunlu olarak referans alınmıyorsa, dağınık yetki tanımlamaları nedeniyle tutarsız erişim kontrolleri ve yetki yükseltme güvenlik açıkları oluşur.
[Aksiyom 3]: Eğer bu TypeScript modülü projenin derleme sürecine dahil edilmemişse, yetki türleriyle ilgili geliştirme aşamasındaki uyumsuzluklar derleme aşamasında yakalanamaz, üretim ortamında çalışma zamanı hataları meydana gelir.

---



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

Analiz edilen `C:\Users\alize\venthub-hvac\src\types\authority.ts` kaynak dosyasında AST pointer oluşturulabilecek herhangi bir fonksiyon, sınıf, değişken veya diğer kod öğesi tespit edilememiştir. Dosyada tanımlı hiç bir yürütülebilir kod parçası, sabit veya referanslanabilir nesne bulunmamaktadır.

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