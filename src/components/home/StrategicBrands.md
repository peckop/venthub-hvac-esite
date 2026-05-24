---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\home\StrategicBrands.tsx
skeleton_hash: df747cf2de34c67b
generated_at: 2026-05-23T22:07:38Z
---

## Genel Bakış
StrategicBrands.tsx, ana sayfada stratejik markaları gösteren bir React bileşenini tanımlar. Bu bileşen, çeviri fonksiyonu üzerinden içerikleri yerelleştirerek dinamik bir şekilde marka kartlarını renderlar.

## Fonksiyon Grupları
### Ana Bileşen
Bu grup, modülün tek dışa açık işlevi olan StrategicBileşenini içer; bu fonksiyon, prop olarak alınan sözlük nesnesini kullanarak ekranın görüntüsünü oluşturur.
- StrategicBrands

---

## AXIOMS – Mimari Varsayımlar
Bu modül için aşağıdaki aksiyomlar geçerlidir.

[Aksiyom 1]: Eğer `dictionary` prop'u sağlanmazsa, component içindeki `t` fonksiyonu tanımsız olur ve `t(...)` çağrısı çalışma zamanında hata verir.  
[Aksiyom 2]: Eğer `dictionary` prop'u bir fonksiyon değilse (örneğin string veya nesne), `t(...)` çağrısı çalışma zamanında bir hata fırlatır.

---

## FONKSIYON DETAYLARI

### StrategicBrands
**Ne yapar**: StrategicBrands bileşeni, verilen çeviri sözlüğünü kullanarak “Strategik Markalar” bölümünü renderlar ve kullanıcıya ilgili marka bilgilerini sunar.  
**Nasıl yapar**: Bileşen, props olarak gelen `dictionary` nesnesinden gerekli çeviri dizelerini çeker, ardından içindeki verileri (örnek: marka logoları, açıklamalar) JSX ile eşleştirerek DOM’a yerleştirir. Bu sayede dil desteği sağlanır ve bileşen yeniden renderlandığında çeviriler güncel kalır.  
**Parametreler**:  
- dictionary: Record<string, string> — Anahtar‑değer çiftlerinden oluşan çeviri nesnesi; her anahtar bir UI metnini (örn. başlık, açıklama) temsil eder ve değeri ilgili dildeki çeviridir.  
**Dönüş**: React.FC<StrategicBrandsProps> — Bileşen, render edildiğinde JSX elementi döndürür; bu element “Strategik Markalar” bölümünün tamamlığını temsil eder ve React ağacına eklenebilir.

---

## INTERFACES

### StrategicBrandsProps
- `dictionary: {`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\home\StrategicBrands.tsx::StrategicBrands
- **params**: dictionary: t
- **ic_degiskenler**: yok
- **Dönüş**: JSX.Element

---

## NODE ID STANDARD

  file: src\components\home\StrategicBrands.tsx
  function: src\components\home\StrategicBrands.tsx::StrategicBrands

---

## DISA AKTARILANLAR (EXPORTS)
  export: StrategicBrands