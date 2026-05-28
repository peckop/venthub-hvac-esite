---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\types\media.types.ts
skeleton_hash: 123cc93a1fc43c33
entity_hashes:
  overview: c22dcf353dfe0240
generated_at: 2026-05-28T22:38:53Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesinde medya varlıklarıyla ilgili standart TypeScript tip ve arayüz tanımlarını içeren, yalnızca derleme zamanında tip güvenliği sağlamak için kullanılan bir tür modülüdür. Çalışma zamanında herhangi bir kod çalıştırmaz, dış bağımlılık içermez ve medya yönetimi ile ilgili tüm bileşenler tarafından referans alınarak veri bütünlüğü ile tür uyumsuzluklarını önler.

## Modülün Amacı ve Kullanım Ortamı
Modülün temel amacı, medya nesneleri (örneğin videolar) için merkezi ve tutarlı tip tanımları sunarak projedeki veri yapısını standartlaştırmaktır. Ortam değişkenleri, harici API çağrıları veya veritabanı sorguları içermez; tamamen yerel ve静sel tip tanımlarıyla çalışır. Tip tanımları, medya yükleme, depolama ve görüntüleme süreçlerinde kullanılacak arayüzleri ve yardımcı tipleri kapsar.

---

## AXIOMS – Mimari Varsayımlar

Bu modül yalnızca TypeScript tip tanımları (type/interface) içeren, çalıştırılabilir kod barındırmayan saf bir tür modülüdür. Fonksiyon gövdesi, modül sabiti veya varsayılan değerli imza bulunmadığından, fonksiyon tabanlı mimari varsayım üretilememektedir.

**Bu modül için aksiyom tanımlanamaz.**

---

**Gerekçe:** Mimari varsayımlar, yalnızca verilen fonksiyon imzaları ve modül sabitlerinden türetilebilir. Bu modül `media.types.ts` olup:

- ✗ Fonksiyon içermiyor
- ✗ Çalıştırılabilir kod içermiyor  
- ✗ Modül sabiti içermiyor
- ✗ Default değere sahip parametre içermiyor

**Not:** Tip tanımlama modülleri, derleme zamanında TypeScript derleyicisi tarafından zorunlu tutulan yapısal kurallar (type-checking) dışında mimicari varsayım gerektirmez. Bu modülün doğru kullanımı, projede reference eden bileşenlerin TypeScript derleyici ayarlarına (strict mode vb.) bağımlıdır.

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

Bu dosya (`media.types.ts`) tip tanımı dosyasıdır — **hiçbir fonksiyon gövdesi içermemektedir**. Dosya yalnızca TypeScript type/interface/enum tanımlarından ibarettir. Dolayısıyla AST Pointer üretilecek fonksiyon bulunmamaktadır.

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