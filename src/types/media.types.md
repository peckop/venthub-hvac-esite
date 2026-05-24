---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\types\media.types.ts
skeleton_hash: 123cc93a1fc43c33
generated_at: 2026-05-23T22:33:10Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesinin TypeScript kod yapısında medya varlıklarıyla ilgili tip tanımlarını barındıran, yalnızca tip güvenliği sağlamak amacıyla oluşturulmuş bir tür modülüdür. İçerisinde hiç çalıştırılabilir kod, fonksiyon, dış bağımlılık veya çalışma zamanında kullanılan değişken/sabit bulunmaz, tamamen derleme zamanında tip kontrolü için hizmet verir. Projede medya yükleme, görüntüleme veya medya yönetimi gibi işlevleri gerçekleştiren tüm bileşenler tarafından referans gösterilerek, medya objeleriyle ilgili tip uyumsuzluklarının önüne geçer.

---

## AXIOMS – Mimari Varsayımlar
Bu TypeScript tür modülü, VentHub HVAC projesindeki tüm medya varlıklarının standartlaştırılmış, merkezi tür tanımlarını barındırır, sadece proje içindeki TypeScript tabanlı kodlar tarafından kullanılması üzere tasarlanmıştır.

[Aksiyom 1]: Eğer projenin tsconfig.json yapılandırmasında bu modülün dosya yolunun TypeScript derleyicisi tarafından çözülebilir olması sağlanmamışsa, bu modülü import etmeye çalışan tüm kodlarda derleme zamanı hatası oluşur, medya varlıkları için tür kontrolü işlemi hiçbir şekilde gerçekleştirilemez.
[Aksiyom 2]: Eğer proje içindeki medya ile ilgili iş mantığı geliştiricileri bu modüldeki standart tür tanımlarını kullanmak yerine kendi özel tür tanımlarını oluşturursa, servisler arası medya verisi alışverişi yapılan tüm noktalarda tür uyumsuzlukları ortaya çıkar, çalışma zamanı veri bütünlüğü hataları oluşur.
[Aksiyom 3]: Eğer TypeScript projesinde sıkı tür kontrolü (strict mode) etkinleştirilmemişse, bu modül ile sağlanan tür güvenliği avantajı tamamen kaybolur, tanımlanan türlere uymayan geçersiz veri atamaları derleyici tarafından yakalanamaz.

---



---

## INTERFACES

### VideoMetadata
- `id: string`
- `provider: MediaProvider`
- `title?: string`
- `thumbnailUrl?: string`
- `aspectRatio?: '16:9' | '4:3' | '1:1' | 'vertical'`
- `options?: {`

### ThreeDMetadata
- `modelId: string`
- `format: 'glb' | 'gltf' | 'obj'`
- `modelUrl: string`
- `config?: {`
- `hotspots?: Array<{`

### TechnicalDrawingMetadata
- `id: string`
- `title: string`
- `format: 'pdf' | 'dwg' | 'svg' | 'png'`
- `url: string`
- `category: 'dimensions' | 'wiring' | 'mounting' | 'airflow'`
- `version?: string`
- `lastUpdated?: string`

### MediaObject
- `id: string`
- `type: 'image' | 'video' | '3d' | 'drawing'`
- `metadata: MediaMetadata`
- `sortOrder?: number`
- `isActive: boolean`

---

## TYPE ALIASES

### MediaProvider
P01-012: Medya Otoritesi (Media Authority) VentHub projesi genelindeki tüm zengin medya varlıklarının (Video, 3D, Çizim) merkezi tipleme tanımları.
```typescript
type MediaProvider = 'cloudflare' | 'youtube' | 'vimeo' | 's3' | 'local'
```

### ThreeDEnvironment
```typescript
type ThreeDEnvironment = 'studio' | 'apartment' | 'city' | 'dawn' | 'forest' | 'lobby' | 'night' | 'park' | 'sunset' | 'warehouse'
```

### MediaMetadata
```typescript
type MediaMetadata = VideoMetadata | ThreeDMetadata | TechnicalDrawingMetadata
```

---

## AST POINTERS

Sağlanan kaynak dosya içeriğinde tanımlı herhangi bir fonksiyon, sınıf veya analiz edilecek kod bloğu bulunmadığından AST pointer üretilecek geçerli öğe mevcut değildir.

---

## NODE ID STANDARD

  file: src\types\media.types.ts

---

## DISA AKTARILANLAR (EXPORTS)
  export: MediaMetadata
  export: MediaObject
  export: MediaProvider
  export: TechnicalDrawingMetadata
  export: ThreeDEnvironment
  export: ThreeDMetadata
  export: VideoMetadata