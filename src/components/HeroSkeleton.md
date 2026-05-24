---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\HeroSkeleton.tsx
skeleton_hash: c30a06b383dd308c
generated_at: 2026-05-23T22:03:31Z
---

## Genel Bakış
HeroSkeleton.tsx, sayfanın başlık bölümünde (hero bölümü) içerik yüklenirken gösterilecek geçici bir taslak (skeleton) bileşenini tanımlar. Bu bileşen, gerçek içerik hazırlanana kadar kullanıcıya görsel bir yapı sunarak sayfanın boş görünmesini önler ve yükleme deneyimini iyileştirir.

## Fonksiyon Grupları
### Hero Skeleton Bileşeni
Bu tek fonksiyon, hero bölümünün yer tutucu görünümünü oluşturan React bileşenini döndürür.
- HeroSkeleton

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSIYON DETAYLARI

### HeroSkeleton
**Ne yapar**: HeroSkeleton fonksiyonu, sayfanın hero bölümü için bir yükleme eskeleti (skeleton) görüntüsü oluşturur. Bu eskelet, gerçek içerik yüklenirken kullanıcıya sayfanın yapısını göstererek perceived performance'i artırır.

**Nasıl yapar**: Fonksiyon, React.FC türünde bir bileşen döndürür ve içeriğinde genellikle düz dikdörtgen şekiller veya gradyan efektler kullanılarak hero bölümünün başlık, açıklama ve görsel alanlarının yer tutucularını temsil eden JSX döndürür. Dışarıdan prop almadığı için sadece statik bir eskelet çizer.

**Parametreler**:  
- Yok (fonksiyon hiçbir parametre almaz)

**Dönüş**:  
- React.FC türünde bir bileşen; bu bileşen render edildiğinde hero bölümünün yükleme eskeleti JSX döndürür.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/HeroSkeleton.tsx::HeroSkeleton
- **params**: (parametre yok)
- **ic_degiskenler**: yok
- **Dönüş**: React.FC

---

## NODE ID STANDARD

  file: src\components\HeroSkeleton.tsx
  function: src\components\HeroSkeleton.tsx::HeroSkeleton

---

## DISA AKTARILANLAR (EXPORTS)
  export: HeroSkeleton