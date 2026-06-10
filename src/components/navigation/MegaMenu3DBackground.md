---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\navigation\MegaMenu3DBackground.tsx
skeleton_hash: 1a127717bea49813
entity_hashes:
  func:MegaMenu3DBackground: bb72cddf66cbd5a0
  overview: dd5cca8b8a57c612
  style_tokens: 487664132884f59c
generated_at: 2026-06-10T09:12:27Z
---

## Genel Bakış
MegaMenu3DBackground modülü, mega menü bileşeninin arka planında drei boyutlu bir görsel efekt sunan bir React bileşeni tanımlar. Bileşen, menünün hangi kategorisi olduğunu belirten bir slug parametresi alır ve ona göre 3D bir model ile metin okunabilirliğini artıran bir gradyan overlay oluşturarak menünün arka planını render eder.

## Fonksiyon Grupları
### Ana Bileşen
Mega menünün görsel arka planını oluşturan temel işlevi yerine getirir; 3D modeli ve okunabilirlik için gerekli gradyanı bir arada sunar.
- MegaMenu3DBackground

---

## AXIOMS – Mimari Varsayımlar

Bu modül, mega menü arka planı için 3D görsel efekt sağlayan bir React bileşenidir.

**[Aksiyom 1]**: Eğer `categorySlug` prop'u sağlanmazsa, bileşen hangi kategori için 3D arka plan oluşturacağını bilemez ve uygun görsel içeriği render edemez.

**[Aksiyom 2]**: Eğer `categorySlug` geçerli bir kategori slugsı değilse (örn: bilinmeyen veya desteklenmeyen bir değer), bileşen eşleşen 3D modeli bulamaz ve arka plan doğru oluşturulamaz.

**[Aksiyom 3]**: Eğer tarayıcı CSS transform veya gerekli 3D rendering özelliklerini desteklemiyorsa, bileşen 3D görsel efekti doğru şekilde gösteremez.

**[Aksiyom 4]**: Eğer bileşen mega menü yapısı dışında kullanılmak istenirse, arka planın ekranda konumlandırılması ve boyutlandırılması hedeflenen bağlama uygun olmayabilir.

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

### [N1_NASIL] AST Pointer: components/navigation/MegaMenu3DBackground.tsx::MegaMenu3DBackground
- **params**: `categorySlug` — Menüde seçili kategorinin slug değeri, 3D ikon bileşenine aktarılır
- **ic_degiskenler**: (yok — parametre dışında hiçbir değişken tanımlanmamıştır)
- **Dönüş**: JSX elementi (`<>...</>` Fragment) — 3D Canvas ve gradient overlay içeren bir React bileşeni döndürür

**Kullanım detayı:**
- `categorySlug` → `<Category3DIcon categorySlug={categorySlug} ...>` içinde kullanılır, ilgili kategorinin 3D modelinin yüklenmesini sağlar
- Fonksiyonda hiçbir iç değişken tanımlanmaz; tüm yapı JSX return ifadesi içinde doğrudan oluşturulur

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