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

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
- **shadow:** (yok)
- **height:** `h-[600px]`, `lg:h-[700px]`
- **width:** (yok)
- **spacing:** (yok)
- **diğer:** (yok)

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-zinc-700`, `bg-zinc-800`, `bg-zinc-900`
- **Layout:** `absolute`, `flex`, `flex-col`, `gap-4`, `h-12`, `h-14`, `h-16`, `h-4`, `h-8`, `h-full`, `justify-center`, `max-w-2xl`, `max-w-7xl`, `overflow-hidden`, `relative`
- **Responsive:** `lg:`, `sm:` prefix kullanımları
