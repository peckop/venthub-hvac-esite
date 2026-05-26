---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\navigation\NavSecondaryRail.tsx
skeleton_hash: 1252f03860b8ef82
generated_at: 2026-05-23T22:17:28Z
---

## Genel Bakış
NavSecondaryRail.tsx, uygulamanın ikincil navigasyon çubuğunu oluşturan bir React bileşenidir. Bu bileşen, menü öğelerine uygun simgeleri dinamik olarak belirlemek için bir yardımcı fonksiyona dayanır.

## Fonksiyon Grupları
### İkon Seçimi
Bileşen içindeki simge eşleştirme mantığını yönetir.
- getIconForId

---

## AXIOMS – Mimari Varsayımlar
Bu modülün doğru çalışması için `getIconForId` fonksiyonuna geçirilen `id` parametresinin string türünde ve fonksiyonun içindeki simge eşleme tablosunda geçerli bir anahtar olduğu varsayılır.

[Aksiyom 1]: Eğer `getIconForId`'ye geçirilen `id` değeri string değilse, fonksiyon beklenmeyen bir değer döndürebilir veya hata fırlatabilir.  
[Aksiyom 2]: Eğer `NavSecondaryRail` bileşeni `getIconForId`'i çağırırken geçerli bir string `id` sağlamazsa, ilgili simge gösterilemez veya varsayılan bir simge kullanılabilir.  
[Aksiyom 3]: Eğer `getIconForId` fonksiyonu dışarıdan sağlanan `id`'ye dayalı olarak bir simge eşlemesi yapıyorsa, `id`'nin bu eşleme tablosunda bulunması gerekir; aksi takdirde tanımsız veya boş bir simge döner.

---

## FONKSIYON DETAYLARI

### getIconForId
**Ne yapar**: Belirtilen kimliğe karşılık gelen simgeyi elde etmeyi amaçlar (fonksiyon adı üzerinden çıkarılabilir).  
**Nasıl yapar**: Fonksiyonun iç mantığı ve uygulama detayları belgelenmemiştir; yalnızca `id` parametresini alır.  
**Parametreler**:  
- id: string — simgeyi belirlemek için kullanılan kimlik değeri  
**Dönüş**: Dönüş tipi açıkça belirtilmemiştir; belirsiz (void veya başka bir tür) olabilir.

---

## INTERFACES

### ResolvedNavigationItem
- `id: string`
- `label: string`
- `href?: string`

### NavSecondaryRailProps
- `items: ResolvedNavigationItem[]`

---

## SABİTLER
- **NavSecondaryRail** (call) — `React.memo(({ items }) => {
    // Separate left-aligned corporate links fro...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/navigation/NavSecondaryRail.tsx::getIconForId
- **params**: (id: string)
- **ic_degiskenler**: yok
- **Dönüş**: JSX.Element | null

### [N2_NASIL] AST Pointer: src/components/navigation/NavSecondaryRail.tsx::NavSecondaryRail
- **params**: (items)
- **ic_degiskenler**: 
  - `leftItems` — items dizisinde 'account' olmayan elemanları filtreler
  - `rightItems` — items dizisinde sadece 'account' olan elemanları filtreler
- **Dönüş**: JSX.Element

### [N3_NASIL] AST Pointer: src/components/navigation/NavSecondaryRail.tsx::mapLeftItem
- **params**: (item)
- **ic_degiskenler**: yok
- **Dönüş**: JSX.Element

### [N4_NASIL] AST Pointer: src/components/navigation/NavSecondaryRail.tsx::mapRightItem
- **params**: (item)
- **ic_degiskenler**: yok
- **Dönüş**: JSX.Element

---

## NODE ID STANDARD

  file: src\components\navigation\NavSecondaryRail.tsx
  function: src\components\navigation\NavSecondaryRail.tsx::getIconForId

---

## DISA AKTARILANLAR (EXPORTS)
  export: getIconForId

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `text-sm`, `text-white/80`, `text-white/90`
- **Layout:** `flex`, `gap-2`, `gap-6`, `group-hover:opacity-100`, `items-center`, `justify-between`, `w-full`
- **Responsive:** (yok)
