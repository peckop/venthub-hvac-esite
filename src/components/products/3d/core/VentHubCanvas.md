---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\3d\core\VentHubCanvas.tsx
skeleton_hash: 02455380f4066940
entity_hashes:
  func:VentHubCanvas: 4908f485b830ec98
  overview: 17c94d72d1b419fe
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-06-20T05:02:44Z
---

## Genel Bakış

VentHubCanvas, VentHub ürün kataloğu için 3D modelleme ve görselleştirme ortamını sağlayan temel bileşendir. Bu bileşen, HVAC ürünlerinin interaktif 3D önizlemelerini sunmak için gerekli canvas altyapısını oluşturur. Farklı kullanım senaryolarına göre önceden tanımlanmış ayarlar ve ortam yapılandırmaları ile esnek bir 3D rendering deneyimi sunar.

## Fonksiyon Grupları

### Bileşen Tanımı
Tek ana bileşen olarak, 3D canvas ortamını yapılandırarak child bileşenleri için render alanı oluşturur.

- **VentHubCanvas** — Çocuk bileşenleri sarmalayan, 3D sahne ve ortam ayarlarını yöneten ana canvas bileşeni

## Bağımlılıklar ve Mimari Notlar

Bu bileşen muhtemelen Three.js tabanlı bir kütüphane (React Three Fiber vb.) üzerine inşa edilmiş olup, şu dinamik bağımlılıklara sahip olabilir:

- **Ortam yapılandırıcıları** (environment prop'u ile)
- **Ürün ön ayarları** (preset prop'u ile — `product` varsayılan)
- **Kiracı bazlı konfigürasyonlar** (tenantId ile çoklu mağaza desteği)
- **Render döngüsü kontrolü** (frameloop ile performans optimizasyonu)

Bu modül, 3D ürün gösterimi için üst düzey bir konteyner görevi görerek, alt bileşenlere standart bir canvas ortamı sunar.

---

## AXIOMS – Mimari Varsayımlar
Bu modül, verilen fonksiyon imzası ve sabitlere dayanan temel mimari varsayımlara sahiptir.

[Aksiyom 1]: Eğer `PRESET_ENV` nesnesi, `preset` prop'u ile aynı isimde bir içermiyorsa, bileşen geçerli bir 3D ortam yapılandırması yükleyemez ve doğru çalışması için gerekli olan ortam verileri (`environment`) eksik kalır.
[Aksiyom 2]: Eğer `environment` prop'u verilmemişse ve bu değer `PRESET_ENV` nesnesinden otomatik olarak türetilemiyorsa, bileşen 3D sahneyi (sahne, ışıklandırma, kamera vb.) başlatmak için gerekli olan temel verilere sahip olmaz ve render süreci başarısız olur.
[Aksiyom 3]: Eğer `tenantId` prop'u verilmemişse, bileşen kiracıya özgü kaynakları (örn: özel modeller, metinler, fiyatlandırma) yükleyemez ve evrensel içeriği göstermek zorunda kalır veya veri eksikliği hatası verir.
[Aksiyom 4]: Eğer `frameloop` prop'u geçerli bir `"always"`, `"demand"` veya `"never"` değeri içermiyorsa, Three.js animasyon döngüsü beklenmedik şekilde çalışır ve bu performans sorunlarına veya tarayıcı kaynaklarının aşırı tüketimine yol açar.

---

## FONKSİYON DETAYLARI

### VentHubCanvas
**Ne yapar**: VentHubCanvas, uygulamanın 3D sahneleri için temel, dayanıklı ve standartlaştırılmış bir `<Canvas>` kabuğu sağlar. Tek ve merkezi nokta olarak,其他 yerde ham `<Canvas>` kullanımını yasaklayarak (INV-3D-2/4) tüm 3D içeriğin güvenilir bir şekilde sunulmasını ve kurtarılmasını garanti altına alır.

**Nasıl yapar**: Fonksiyon, gelen prop'ları kullanarak `ResilientCanvasBoundary` ile sarmalanmış, yapılandırılmış bir React Three Fiber `<Canvas>` bileşeni döndürür. `onCreated` callback'i içinde, WebGL bağlamı (renderer) için kritik renk uzayı (sRGB) ve ton haritalama (ACESFilmic) ayarlarını merkezi olarak yapar. İçeriği (`children`) `TenantSceneProvider` ile sararak kiracılara özgü sahne yapılandırılmasını ve `SceneLightingRig` ile ortam aydınlatmasını uygular. `ContextLossRecovery` bileşeni, GPU bağlamı kaybı senaryolarında otomatik kurtarma mekanizması sunar.

**Parametreler**:
- children: `React.ReactNode` — Canvas içinde render edilecek 3D sahne içeriği ve bileşenleri.
- preset: `'product' | 'viewer' | string` — Önceden tanımlı sahne/ortam yapılandırma şablonu adı. Varsayılanı `'product'`.
- environment: `string | null` — Ortam haritası anahtarı. Belirtilmezse `preset` değerine karşılık gelen `PRESET_ENV` sözlüğünden çözülür.
- tenantId: `string | null` — Kiracı (tenant) tanımlayıcısı. Belirtilmezse `DEFAULT_TENANT_ID` sabiti kullanılır.
- frameloop: `'demand' | 'always' | 'never'` — Render döngüsünün çalışma modu. Varsayılanı `'demand'` (ihtiyaç üzerine).
- camera: `Partial<CameraProps>` — Three.js kamera nesnesi için yapılandırma seçenekleri.
- dprCap: `number` — Cihaz piksel oranı (DPR) için uygulanacak üst limit.
- className: `string` — Canvas DOM elemanına eklenecek CSS sınıf adı.
- fallback: `React.ReactNode` — Canvas yüklenirken veya hata oluşunda gösterilecek yedek bileşen. Belirtilmezse `Static3DFallback` kullanılır.

**Dönüş**: `React.JSX.Element` — Yapılandırılmış ve dayanıklılık katmanlarıyla sarılmış bir Canvas bileşeni döndürür.

---

## İTHALATLAR (IMPORTS)
- import: ./ContextLossRecovery::ContextLossRecovery
- import: ./ResilientCanvasBoundary::ResilientCanvasBoundary
- import: ./ResilientCanvasBoundary::Static3DFallback
- import: ./SceneLightingRig::SceneLightingRig
- import: ./SceneLightingRig::type EnvPresetKey
- import: ./tenantScene::TenantSceneProvider
- import: ./useDeviceDpr::type DprCap
- import: ./useDeviceDpr::useDeviceDpr
- import: @/utils/tenantConstants::DEFAULT_TENANT_ID
- import: @react-three/fiber::Canvas
- import: react::React
- import: three::ACESFilmicToneMapping
- import: three::SRGBColorSpace

---

## INTERFACES

### VentHubCanvasProps
- `children: React.ReactNode`
- `preset?: 'product' | 'showcase' | 'nav' | 'authority'`
- `environment?: EnvPresetKey`
- `tenantId?: string`
- `frameloop?: CanvasProps['frameloop']`
- `camera?: CanvasProps['camera']`
- `dprCap?: Partial<DprCap>`
- `className?: string`
- `fallback?: React.ReactNode`

---

## TYPE ALIASES

### CanvasProps
```typescript
type CanvasProps = React.ComponentProps<typeof Canvas>
```

---

## SABİTLER
- **PRESET_ENV** (object) — `{
  product: 'product',
  showcase: 'showcase',
  nav: 'nav',
  authority...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: VentHubCanvas.tsx::VentHubCanvas
- **params**: (children, preset, environment, tenantId, frameloop, camera, dprCap, className, fallback)
- **ic_degiskenler**:
  - `dpr` — useDeviceDpr hook'undan elde edilen, cihazın maksimum pixel ratio değerini sınırlayan DPR cap'i.
  - `envKey` — Sahne ortam haritası (environment map) anahtarı; environment prop'u verilmemişse PRESET_ENV[preset] nesnesinden preset anahtarına göre çözümlenir.
  - `resolvedTenantId` — Kiracı (tenant) tanımlayıcısı; tenantId prop'u verilmemişse DEFAULT_TENANT_ID sabitini kullanır.
- **Dönüş**: JSX yapısı — ResilientCanvasBoundary ile sarılmış, gölgeler, ton haritalama ve ortam aydınlatması yapılandırılmış bir Canvas bileşeni. Canvas içinde ContextLossRecovery, SceneLightingRig ve TenantSceneProvider_children bileşenlerini döndürür.

---

## NODE ID STANDARD

  file: src\components\products\3d\core\VentHubCanvas.tsx
  function: src\components\products\3d\core\VentHubCanvas.tsx::VentHubCanvas

---

## DISA AKTARILANLAR (EXPORTS)
  export: VentHubCanvas
  export: VentHubCanvasProps

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** (yok)
- **Layout:** (yok)
- **Varyant/Responsive:** (yok)
- **Yardımcı Sınıflar:** (yok)