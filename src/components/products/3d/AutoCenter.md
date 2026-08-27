---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-urun-comp\src\components\products\3d\AutoCenter.tsx
skeleton_hash: e29f84f9e12345d1
entity_hashes:
  func:AutoCenter: 5839fe397b2c2b36
  overview: ddbb8cf0a3e64fc1
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-08-27T07:00:29Z
---

## Genel Bakış
AutoCenter modülü, 3D sahnelerdeki çocuk bileşenlerin otomatik olarak merkeze hizalanmasını sağlayan bir React sarmalayıcı bileşendir. Bileşen, içeriğin sınırlayıcı kutusunu hesaplayarak modelin sahnede dengeli bir şekilde konumlandırılmasını sağlar. Opsiyonel kaydırma parametresi ile bu konumlandırma ince ayara olanak tanır.

## Fonksiyon Grupları
### Merkezleme Bileşeni
Modülün tek ve temel bileşenini oluşturur. Çocuk düğümleri alır, merkezleme mantığını uygular ve gerekli konumlandırma dönüşümlerini hesaplar.
- AutoCenter

---

## AXIOMS – Mimari Varsayımlar

[Aksiyom 1]: Eğer `children` parametresi yoksa, bileşen render edilemez çünkü zorunlu çocuk içeriği tanımlanmamış olur.

[Aksiyom 2]: Eğer `enabled` parametresi `false` olarak verilirse, merkezleme işlemi devre dışı kalır; çocuklar orijinal konumlarıyla render edilir. Varsayılan değer `true` olduğundan, parametre belirtilmediğinde merkezleme aktif olur.

[Aksiyom 3]: Eğer `shift` parametresi verilmezse, varsayılan değer `[0, 0, 0]` kullanılır ve merkezleme noktasına ek bir kaydırma uygulanmaz. Üç elemanlı bir sayı dizisi olmalıdır.

---

## FONKSİYON DETAYLARI

### AutoCenter
**Ne yapar**: Üç boyutlu sahnelerde otomatik merkezleme işlevi sağlayan bir React fonksiyonel bileşenidir. Bileşen, çocuk elemanlarını (`children`) sararak merkezleme davranışı kazandırır. `enabled` parametresiyle bu davranış etkinleştirilip devre dışı bırakılabilir; `shift` parametresiyle ise merkez noktasına ofset uygulanabilir.

**Nasıl yapar**: Kaynak kodda implementasyon detayı (docstring veya fonksiyon gövdesi) verilmemiştir. Yalnızca fonksiyon imzası mevcuttur. Bileşen, aldığı `children` elemanlarını bir kapsayıcı içinde render eder; `enabled` durumuna göre merkezleme mantığını uygular veya atlar; `shift` dizisi ise x, y, z eksenlerinde piksel veya birim bazında kaydırma değeri sağlar.

**Parametreler**:
- `children`: `React.ReactNode` — Bileşenin içine yerleştirilecek alt elemanlar (3D sahne nesneleri, mesh'ler vb.). Zorunlu parametredir.
- `enabled`: `boolean` — Merkezleme davranışının etkin olup olmadığını belirler. Varsayılan değeri `true`'dur. Opsiyonel parametredir.
- `shift`: `[number, number, number]` — Merkez noktasına uygulanacak x, y, z eksenlerindeki kaydırma (ofset) değerlerini tutan üç elemanlı sayı dizisi. Varsayılan değeri `[0, 0, 0]`'dır. Opsiyonel parametredir.

**Dönüş**: `React.FC<{ children: React.ReactNode; enabled?: boolean; shift?: [number, number, number] }>` — Belirtilen prop tiplerini kabul eden bir React fonksiyonel bileşeni döndürür. `children` zorunlu, `enabled` ve `shift` opsiyonel proplardır.

---

## İTHALATLAR (IMPORTS)
- import: @react-three/fiber::useFrame
- import: react::React
- import: react::useRef
- import: three::Box3
- import: three::Vector3
- import: three::type { Group }

---

## SABİTLER
- **tempBox** (new_expression) — `new Box3()`
- **tempCenter** (new_expression) — `new Vector3()`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/products/3d/AutoCenter.tsx::AutoCenter
- **params**:
  - `children` — React.ReactNode tipinde, group içine yerleştirilecek alt bileşenler
  - `enabled` — boolean, varsayılan `true`; otomatik merkezleme işleminin etkin olup olmadığını belirler
  - `shift` — `[number, number, number]` tipinde, varsayılan `[0, 0, 0]`; hesaplanan merkeze uygulanacak ofset değerleri
- **ic_degiskenler**:
  - `groupRef` — `useRef<Group>(null)` ile oluşturulmuş ref; `<group>` DOM elementine referans tutar, pozisyon ayarlamaları ve bounding box hesaplamaları için kullanılır
  - `isLocked` — `useRef(false)` ile oluşturulmuş ref; merkezleme işlemi tamamlandıktan sonra `true` yapılır, sonraki frame'lerde tekrar hesaplanmasını engeller
  - `frameCount` — `useRef(0)` ile oluşturulmuş ref; her frame'de artırılır, ilk 3 frame boyunca geometrilerin yüklenmesini beklemek için kullanılır
- **Dönüş**: JSX — `<group ref={groupRef}>{children}</group>` elementi döner

---

## NODE ID STANDARD

  file: src\components\products\3d\AutoCenter.tsx
  function: src\components\products\3d\AutoCenter.tsx::AutoCenter

---

## DISA AKTARILANLAR (EXPORTS)
  export: AutoCenter

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