---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\navigation\NavSecondaryRail.tsx
skeleton_hash: cc95f594826a9731
entity_hashes:
  func:getIconForId: 81e46f9f714fe65d
  overview: 6f5924a947fecbc3
  style_tokens: 9b60048869298a29
generated_at: 2026-06-19T20:47:10Z
---

## Genel Bakış
NavSecondaryRail.tsx, uygulamanın ikincil navigasyon çubuğunu gösteren bir React bileşenidir. Bileşen, navigasyon öğeleri için dinamik olarak simge seçimi yapar ve bu işlemi destekleyici bir yardımcıyı kullanır.

## Fonksiyon Grupları
### İkon Seçimi
Navigasyon öğelerinin kimliğine göre uygun simgelerin dinamik olarak belirlenmesi.
- getIconForId

---

## AXIOMS – Mimari Varsayımlar

Bu modül için, fonksiyon imzası ve modül bağlamından çıkarılabilecek mimari varsayımlar aşağıdadır.

---

## FONKSİYON DETAYLARI

### getIconForId
**Ne yapar**: Verilen bir ID değerine karşılık gelen icon bileşenini veya icon adını döndürmekle görevlidir. Navigation bileşeninde farklı menü öğeleri için doğru görsel simgenin belirlenmesini sağlar.

**Nasıl yapar**: Fonksiyon mantığı docstring'de belirtilmemiştir. Fonksiyon adı ve parametre yapısına dayanarak, bir eşleme (mapping) mantığıyla çalıştığı öngörülebilir.

**Parametreler**:
- id: string — İcon ile ilişkilendirilmek istenen öğenin tanımlayıcısı. Navigation menüsündeki her bir öğe için benzersiz bir kimlik değeri beklenir.

**Dönüş**: Fonksiyonun dönüş tipi dokümantasyonda belirtilmemiştir.

---

## İTHALATLAR (IMPORTS)
- import: next/link::Link
- import: react::React

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
- **params**: `(id: string)`
  - `id` — menü öğesinin tanımKimliği; hangi SVG ikonunun döndürüleceğini belirler ('brands', 'knowledgeHub', 'about', 'contact', 'account')
- **ic_degiskenler**: yok
- **Dönüş**: `JSX.Element | null` — switch/case yapısına göre ilgili SVG SVG ikon elemanını veya default durumunda `null` döner. Her case bloğu içinde doğrudan JSX svg döndürülür; değişken oluşturulmaz.

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
- **Renkler:** `hover:bg-white/10`, `hover:text-white`, `text-sm`, `text-white/80`, `text-white/90`
- **Layout:** `flex`, `gap-2`, `gap-6`, `items-center`, `justify-between`, `w-full`
- **Varyant/Responsive:** `group-hover:`, `hover:` önekleri
- **Yardımcı Sınıflar:** `duration-200`, `font-medium`, `group`, `group-hover:opacity-100`, `opacity-80`, `px-3`, `py-1.5`, `rounded-lg`, `tracking-wide`, `transition-colors`, `transition-opacity`