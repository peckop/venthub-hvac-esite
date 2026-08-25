---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\wt-supurme\src\types\media.types.ts
skeleton_hash: 8d40d07321f51666
entity_hashes:
  overview: c22dcf353dfe0240
generated_at: 2026-08-25T07:28:31Z
---

## Genel Bakış

Bu modül, `src\types` klasöründe yer alan bir TypeScript tip tanımlama dosyasıdır. Dosyada fonksiyon, dışa aktarılan sabit veya değişken bulunmamaktadır. Modül, medya ile ilgili TypeScript arayüzlerini, tip tanımlarını veya tip birleşimlerini barındırmak amacıyla oluşturulmuştur.

Dosya adından anlaşıldığı üzere, `media.types.ts` medya varlıklarına (görsel, video, ses vb.) ilişkin veri yapılarını tanımlayan tip bildirimleri içerir. Bu tipler, projenin diğer bölümlerinde medya verilerinin tip güvenli bir şekilde kullanılmasını sağlar.

## Fonksiyon Grupları

Bu dosyada fonksiyon bulunmadığından fonksiyon gruplandırması yapılmamıştır. Modül yalnızca tip tanımları içerir; dolayısıyla çalıştırılabilir bir mantık barındırmaz.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Gerekçe:** `media.types.ts` dosyası yalnızca tip tanımları (type, interface, enum) içeren bir TypeScript modülüdür. Fonksiyon gövdesi, modül sabitleri veya çalıştırılabilir kod bulunmadığından, fonksiyon gövdesinden türetilecek mimari varsayım üretilememektedir.

---

## FONKSİYON DETAYLARI

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

Bu dosya (`src\types\media.types.ts`) bir TypeScript tip tanımlama dosyasıdır. Dosyada fonksiyon gövdesi bulunmadığından AST Pointer oluşturulacak fonksiyon yoktur.

---

## NODE ID STANDARD

  file: media.types.ts

---

## DISA AKTARILANLAR (EXPORTS)
  export: MediaMetadata
  export: MediaObject
  export: MediaProvider
  export: TechnicalDrawingMetadata
  export: ThreeDEnvironment
  export: ThreeDMetadata
  export: VideoMetadata