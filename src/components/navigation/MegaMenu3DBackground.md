---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\navigation\MegaMenu3DBackground.tsx
skeleton_hash: f289eb27b38f4676
generated_at: 2026-05-23T22:15:00Z
---

## Genel Bakış
Bu modül, mega menü bileşeninin arka planında üç boyutlu bir görsel efekt sunan bir React bileşeni tanımlar. Bileşen, menünün hangi kategoriye ait olduğunu belirten `categorySlug` özelliğini alır ve ona göre arka planı renderlar.

## Fonksiyon Grupları
### Ana Bileşen
Mega menünün görsel arka planını oluşturan temel işlevi yerine getirir.
- MegaMenu3DBackground

---

## AXIOMS – Mimari Varsayımlar
Bu modül için aşağıdaki varsayımlar geçerlidir.

[Aksiyom 1]: Eğer `categorySlug` prop'u sağlanmazsa, component beklenen şekilde render edilemez veya çalışma zamanında hata fırlatabilir.  
[Aksiyom 2]: Eğer `categorySlug` değeri bir string değilse, tip güvenliği bozulur ve beklenmeyen davranış gözlemlenebilir.

---

## FONKSIYON DETAYLARI

### MegaMenu3DBackground
**Ne yapar**: MegaMenu açılır menüsü için 3D arka plan render eder; üst kısmında büyük bir 3D model gösterir, alt kısmında metnin okunabilirliğini artıran bir gradyan overlay ekler.  
**Nasıl yapar**: Bileşen, `categorySlug` özelliğini alarak hangi 3D modelin yükleneceğini belirler (model adı veya yolunu oluşturur). Daha sonra bir wrapper div içinde modeli ve üstüne geçişli siyah‑beyaz veya renkli gradyan bir divi yerleştirerek, modelin üst kısmını görünür tutarken alt kısımdaki metinlerin kontrastını sağlar.  
**Parametreler**:  
- categorySlug: string — Menü kategorisinin slug değeri; hangi 3D modelin gösterileceğini belirlemek için kullanılır.  
**Dönüş**: React.ReactNode — JSX elementi olarak render edilen 3D arka plan ve gradyan overlay içeren bileşen.

---

## INTERFACES

### MegaMenu3DBackgroundProps
- `categorySlug: string`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/navigation/MegaMenu3DBackground.tsx::MegaMenu3DBackground
- **params**: categorySlug
- **ic_degiskenler**: 
  - `categorySlug` — prop passed to component, used as the `categorySlug` prop for the `<Category3DIcon />` component
- **Dönüş**: JSX element (React.ReactNode)

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
- **Responsive:** (yok)
