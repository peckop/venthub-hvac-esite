---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\3d\factory\Assembler.tsx
skeleton_hash: c8cc58b4d1c21209
entity_hashes:
  func:Assembler: fce0437dc1401eb7
  overview: 1319e0e67eee55ba
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-05-28T22:36:50Z
---

## Genel Bakış
Assembler.tsx, 3D ürün modellerinin montajını ve görselleştirmesini sağlayan temel bir React bileşenidir. Bu bileşen, bir ürünün tüm parçalarını bir araya getirerek interaktif bir 3D sahne oluşturur ve kullanıcının bu parçalarla etkileşime girmesini (tıklama, patlama efekti) sağlar. Temel amacı, statik bir model sunmak yerine, parçaların relationships'ini ve durumunu (seçili, patlamış) dinamik bir şekilde yönetmektir.

## Fonksiyon Grupları
### Ana Render ve Etkileşim Yönetimi
Bileşen, gelen veriyi (blueprint) işleyerek sahneyi oluşturur, tüm 3D parça nesnelerini render eder ve kullanıcı etkileşimlerini (tıklama, seçme) yöneterek ilgili geri çağırma fonksiyonlarını tetikler.
- Assembler

---



---

## FONKSİYON DETAYLARI

### Assembler

**Ne yapar**: `Assembler`, HVAC ürünleri için 3D montaj (assembly) görüntüleyen bir React bileşenidir. Verilen bir mavi plan (blueprint) yapısına göre parçaları three-dimensional ortamda render eder ve kullanıcının parçalarla etkileşime girmesini sağlar.

**Nasıl yapar**: Bileşen, `blueprint` prop'u aracılığıyla ürünün parçalarını, bağlantılarını ve geometrik verilerini alır. `explode` parametresi ile parçalar arasındaki mesafeyi kontrollü şekilde artırarak "patlatılmış görünüm" (exploded view) oluşturur. Seçili parçayı belirlemek için `selectedPart` prop'unu kullanır ve bir parçaya tıklandığında `onPartClick` callback fonksiyonunu çağırarak üst bileşene bildirimde bulunur. Bu yapı, ürünlerin montaj sırasını ve parça ilişkilerini görsel olarak sunar.

**Parametreler**:
- `blueprint` — `BlueprintData` (veya benzeri yapı tipi) — 3D montajın temelini oluşturan veri yapısı; parçaların geometrileri, pozisyonları ve ilişkileri hakkında bilgi içerir. Bu, bileşenin görüntülemesini istediği tüm 3D model verilerinin ana kaynağıdır.
- `explode` — `number` (varsayılan: `0`) — Parçalar arasındaki patlama (exploded) mesafesini belirleyen çarpan değeridir. `0` değeri montaj durumunu (parçalar birleşik), pozitif değerler ise parçaların birbirinden uzaklaştığı exploded view durumunu temsil eder.
- `onPartClick` — `(partId: string) => void` — Bir parça üzerine tıklandığında tetiklenen geri çağırma fonksiyonudur. Tıklanan parçanın kimliğini (ID) üst bileşene iletir; böylece seçim, detay gösterimi gibi işlemler tetiklenebilir.
- `selectedPart` — `string | null` — Şu anda seçili olan parçanın kimliğini belirtir. `null` değerinde hiçbir parça seçili değildir. Seçili parça, görsel olarak vurgulanır (highlight) veya farklı renklendirilerek kullanıcıya geri bildirim sağlanır.

**Dönüş**: `React.FC<AssemblerProps>` — Montaj görüntülemesini içeren bir React fonksiyonel bileşeni döndürür. Bu bileşen, 3D sahneyi (scene), kamerayı, ışıklandırmayı ve parçaları içeren tam bir montaj görüntüleyiciyi render eder.

---

## INTERFACES

### PartConfig
- `name: string`
- `component: React.ElementType`
- `position?: [number, number, number]`
- `rotation?: [number, number, number]`
- `scale?: [number, number, number]`
- `props?: Record<string, unknown>`

### BluePrint
- `slug: string`
- `scale?: number`
- `parts: PartConfig[]`

### AssemblerProps
- `blueprint: BluePrint`
- `explode?: number`
- `onPartClick?: (partName: string) => void`
- `selectedPart?: string | null`
- `isolatedPart?: string | null`
- `hiddenParts?: string[]`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/products/3d/factory/Assembler.tsx::Assembler (ana arrow function)
- **params**: `blueprint` (React bileşeni için gerekli tüm parça ve yapılandırma verisini içeren nesne), `explode` (number, varsayılan 0 — parçaları merkezden uzaklaştırma oranı), `onPartClick` (function | undefined — parçaya tıklandığında çağrılacak callback), `selectedPart` (string | undefined — şu an seçili olan parçanın adı), `isolatedPart` (string | undefined — yalıtılmış parçanın adı, null ise hiçbir parça yalıtılmamıştır), `hiddenParts` (string[], varsayılan [] — gizli parçaların isim listesi)
- **ic_degiskenler**:
  - Yok — return içinde doğrudan JSX döndürür, ara değişken oluşturmaz
- **Dönüş**: `JSX.Element` — `<group>` elemanı içinde `blueprint.parts.map()` ile her parça için `<group>` ve `<Suspense>` ile sarılmış dinamik React bileşenleri döndürür. `blueprint.scale || 1` ile genel ölçeklendirme uygular.

---

### [N2_NASIL] AST Pointer: src/components/products/3d/factory/Assembler.tsx::map callback (part, index)
- **params**: `part` (blueprint.parts dizisindeki tek bir parçanın nesnesi — `component`, `name`, `position`, `rotation`, `scale`, `props` alanlarını içerir), `index` (number — dizi indeksi, key oluşturmak için kullanılır)
- **ic_degiskenler**:
  - `Component` — `part.component` değerinden alınan React bileşeni referansı; `React.createElement` ile dinamik olarak render edilmek üzere kullanılır
  - `explodeOffset: [number, number, number]` — Parçanın 3D koordinat vektörü; `part.position` koordinatları `explode` oranıyla çarpılarak merkezden uzaklaştırılmış pozisyon hesaplanır. Her eksen için `part.position?.[0]`, `part.position?.[1]`, `part.position?.[2]` subscript erişimleri ile x, y, z değerleri okunur ve `(1 + explode * 2)` çarpanıyla çarpılır; `position` tanımsızsa `0` varsayılır
- **Dönüş**: `JSX.Element` — Her parça için `<Suspense fallback={null}>` içine sarılmış, `React.createElement` ile dinamik olarak oluşturulmuş React bileşeni döndürür. Component'e şu prop'lar aktarılır: `part.props` spread edilir, `explode`, `isSelected` (`selectedPart === part.name` ile belirlenir), `isIsolated` (`isolatedPart === part.name || isolatedPart === null` ile belirlenir), `isHidden` (`hiddenParts.includes(part.name)` ile belirlenir), `onClick` (callback içinde `onPartClick?.(part.name)` çağrısı). Dış `{/* key: `${part.name}-${index}` */}` ile React key atanır.

---

## NODE ID STANDARD

  file: src\components\products\3d\factory\Assembler.tsx
  function: src\components\products\3d\factory\Assembler.tsx::Assembler

---

## DISA AKTARILANLAR (EXPORTS)
  export: Assembler

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