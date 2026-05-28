---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\navigation\MegaMenu3DBackground.tsx
skeleton_hash: f289eb27b38f4676
entity_hashes:
  func:MegaMenu3DBackground: bb72cddf66cbd5a0
  overview: ac53e718717e2ea0
  style_tokens: 487664132884f59c
generated_at: 2026-05-28T22:36:31Z
---

## Genel Bakış
MegaMenu3DBackground modülü, mega menü bileşeninin arka planında üç boyutlu bir görsel efekt sunan bir React bileşeni tanımlar. Bileşen, menünün hangi kategorisi olduğunu belirten bir slug parametresi alır ve ona göre 3D bir model ile metin okunabilirliğini artıran bir gradyan overlay oluşturarak menünün arka planını render eder.

## Fonksiyon Grupları
### Ana Bileşen
Mega menünün görsel arka planını oluşturan temel işlevi yerine getirir; 3D modeli ve okunabilirlik için gerekli gradyanı bir arada sunar.
- MegaMenu3DBackground

---

## AXIOMS – Mimari Varsayımlar

Bu modül için aşağıdaki varsayımlar geçerlidir.

[Aksiyom 1]: Eğer `categorySlug` prop'u sağlanmazsa, bileşen arka plan görselini doğru şekilde renderlayamaz veya çalışma zamanı hatası oluşur.

[Aksiyom 2]: Eğer `categorySlug` geçerli bir kategori slug'ı (örn: "klima", "ısıtma" gibi) değilse, bileşen uygun arka plan görselini bulamaz veya boş/hatalı bir arka plan gösterir.

[Aksiyom 3]: Eğer bileşen bir mega menü içinde kullanılmıyorsa, arka plan görselinin konumlandırması ve boyutu hatalı olur.

---

## FONKSİYON DETAYLARI

### MegaMenu3DBackground
**Ne yapar**: Bu fonksiyon, bir MegaMenü dropdown bileşeninin arka planını oluşturmak için kullanılan bir React functional bileşenidir. Temel amacı, menü içeriğinin arkasına etkileyici bir 3D görsel ve okunabilirlik sağlayan bir gradyan katmanı yerleştirmektir.

**Nasıl yapar**: Fonksiyon, verilen `categorySlug` prop'una göre dinamik olarak bir 3D model veya tema yükleyerek arka planı oluşturur. Bileşenin üst kısmına büyük bir 3D görsel yerleştirirken, alt kısımda koyu bir gradyan efekti uygular. Bu gradyan, üzerine yerleştirilen menü metinlerinin okunabilirliğini önemli ölçüde artırır.

**Parametreler**:
- `categorySlug`: string — Arka planın görsel temasını belirleyen kategori slug'ı. Bu parametre, 3D modelin veya arka planın içeriğini belirlemek için kullanılır.
- `MegaMenu3DBackgroundProps`: object — Bileşenin alabileceği diğer özellikleri tanımlayan props nesnesi.

**Dönüş**: `React.FC<MegaMenu3DBackgroundProps>` tipinde bir React functional bileşeni döndürür.

---

## INTERFACES

### MegaMenu3DBackgroundProps
- `categorySlug: string`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: `MegaMenu3DBackground.tsx`::MegaMenu3DBackground
- **params**: `{ categorySlug }` — Kategori slug'ı, 3D ikonun hangi kategoriyi göstereceğini belirler
- **ic_degiskenler**:
  *(fonksiyon gövdesinde herhangi bir `let`, `const`, `var` değişken tanımlaması yoktur — doğrudan JSX döner)*
- **Dönüş**: JSX Fragment (`<React.Fragment>`) — İki katmanlı JSX yapısı:
  1. Üst %75 alanı kaplayan `div` içinde `Canvas` (Three.js sahnesi): kamera ayarları, ışıklandırma (`ambientLight`, `directionalLight`), `Environment` preset, `Category3DIcon` bileşeni ve `OrbitControls` (sadece otomatik döndürme aktif)
  2. Tam ekranı kaplayan gradient overlay `div` (`bg-gradient-to-t from-white/60`)
- **Kullanılan prop'lar**:
  - `categorySlug` — `Category3DIcon` bileşenine `categorySlug={categorySlug}` olarak iletilir
- **Yan etkiler**: Yok (pure render fonksiyonu)

---

## NODE ID STANDARD

  file: src\components\navigation\MegaMenu3DBackground.tsx
  function: src\components\navigation\MegaMenu3DBackground.tsx::MegaMenu3DBackground

---

## DISA AKTARILANLAR (EXPORTS)
  export: MegaMenu3DBackground

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-gradient-to-t`, `from-white/60`, `to-transparent`, `via-transparent`
- **Layout:** `absolute`, `from-white/60`, `h-3/4`, `left-0`, `right-0`, `top-0`
- **Varyant/Responsive:** (yok)
- **Yardımcı Sınıflar:** `inset-0`, `pointer-events-none`