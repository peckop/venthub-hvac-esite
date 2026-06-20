---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\3d\factory\Assembler.tsx
skeleton_hash: 20d5e4edc9857de5
entity_hashes:
  func:Assembler: fce0437dc1401eb7
  overview: 1319e0e67eee55ba
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-06-19T20:47:11Z
---

## Genel Bakış
Assembler.tsx, 3D ürün modellerinin montajını ve görselleştirmesini sağlayan temel bir React bileşenidir. Bu bileşen, bir ürünün tüm parçalarını bir araya getirerek interaktif bir 3D sahne oluşturur ve kullanıcının bu parçalarla etkileşime girmesini (tıklama, patlama efekti) sağlar. Temel amacı, statik bir model sunmak yerine, parçaların relationships'ini ve durumunu (seçili, patlamış) dinamik bir şekilde yönetmektir.

## Fonksiyon Grupları
### Ana Render ve Etkileşim Yönetimi
Bileşen, gelen veriyi (blueprint) işleyerek sahneyi oluşturur, tüm 3D parça nesnelerini render eder ve kullanıcı etkileşimlerini (tıklama, seçme) yöneterek ilgili geri çağırma fonksiyonlarını tetikler.
- Assembler

---

## AXIOMS – Mimari Varsayımlar

Bu modül, bir React bileşeni olup 3D ürün montajını render eder. Aşağıdaki varsayımlar fonksiyon imzası ve modül tanımına dayanmaktadır.

[Aksiyom 1]: Eğer `blueprint` parametresi `null` veya `undefined` ise, bileşen 3D sahneyi doğru bir şekilde render edemez ve montaj başarısız olur.

[Aksiyom 2]: Eğer `explode` parametresi `0`'dan farklı bir değer alırsa, parçalar arasındaki mesafe bu değere göre orantılı olarak artar (patlama efekti aktifleşir).

[Aksiyom 3]: Eğer `onPartClick` callback'i sağlanmamışsa (`undefined`), kullanıcının parçalara tıklama etkileşimi çalışmaz veya sessizce yoksayılır.

[Aksiyom 4]: Eğer `selectedPart` parametresi `undefined` ise, hiçbir parça seçili durumda değildir (varsayılan durum).

[Aksiyom 5]: Eğer `blueprint` yapısı içinde tanımlı parça verileri (geometry, position, relationship) yoksa, ilgili parçalar sahneye yerleştirilemez ve eksik render oluşur.

[Aksiyom 6]: `blueprint` yapısının, parçalar arası montaj ilişkilerini ve hiyerarşisini tanımlayan geçerli bir veri yapısına sahip olması gerekir; aksi takdirde parçaların pozisyonları ve bağlantıları bilinmez.

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

## İTHALATLAR (IMPORTS)
- import: react::React
- import: react::Suspense

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