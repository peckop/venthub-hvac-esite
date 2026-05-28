---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\navigation\NavSecondaryRail.tsx
skeleton_hash: 1252f03860b8ef82
entity_hashes:
  func:getIconForId: 81e46f9f714fe65d
  overview: 6f5924a947fecbc3
  style_tokens: 9b60048869298a29
generated_at: 2026-05-28T22:36:36Z
---

## Genel Bakış
NavSecondaryRail.tsx, uygulamanın ikincil navigasyon çubuğunu gösteren bir React bileşenidir. Bileşen, navigasyon öğeleri için dinamik olarak simge seçimi yapar ve bu işlemi destekleyici bir yardımcıyı kullanır.

## Fonksiyon Grupları
### İkon Seçimi
Navigasyon öğelerinin kimliğine göre uygun simgelerin dinamik olarak belirlenmesi.
- getIconForId

---



---

## FONKSİYON DETAYLARI

### getIconForId
**Ne yapar**: Verilen bir ID değerine karşılık gelen icon bileşenini veya icon adını döndürmekle görevlidir. Navigation bileşeninde farklı menü öğeleri için doğru görsel simgenin belirlenmesini sağlar.

**Nasıl yapar**: Fonksiyon mantığı docstring'de belirtilmemiştir. Fonksiyon adı ve parametre yapısına dayanarak, bir eşleme (mapping) mantığıyla çalıştığı öngörülebilir.

**Parametreler**:
- id: string — İcon ile ilişkilendirilmek istenen öğenin tanımlayıcısı. Navigation menüsündeki her bir öğe için benzersiz bir kimlik değeri beklenir.

**Dönüş**: Fonksiyonun dönüş tipi dokümantasyonda belirtilmemiştir.

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

### [N2_NASIL] AST Pointer: src/components/navigation/NavSecondaryRail.tsx::NavSecondaryRail (anonim arrow function)
- **params**: `({ items })` — destructure edilmiş prop objesi
  - `items` — `{ id: string, label: string, href?: string }` tipli menü öğesi dizisi; sol ve sağ taraftaki navigasyon bağlantılarını içerir
- **ic_degiskenler**:
  - `leftItems` — `items.filter(item => item.id !== 'account')` ile elde edilen, şirket içi sayfa bağlantılarını içeren dizi (account olmayan tüm öğeler)
  - `rightItems` — `items.filter(item => item.id === 'account')` ile elde edilen, profil/hesap bağlantısını içeren dizi (sadece account öğesi)
- **Dönüş**: JSX — sol tarafta kurumsal linkleri (`leftItems`), sağ tarafta hesap linkini (`rightItems`) gösteren bir `div` yapısı döner. Her iki taraf da `Link` elemanları ile `getIconForId` ve `item.label` kullanılarak oluşturulur.

---

### [N3_NASIL] AST Pointer: src/components/navigation/NavSecondaryRail.tsx::leftItems.map renderer (anonim arrow function)
- **params**: `item` — `{ id: string, label: string, href?: string }` tipinde tek bir menü öğesi
- **ic_degiskenler**: yok
- **Dönüş**: JSX — `Link` elemanı döner; `getIconForId(item.id)` ile ikon ve `<span>{item.label}</span>` ile etiket oluşturulur. Sınıf: `text-white/80` (hafif saydam beyaz), hover'da `text-white` olur.

---

### [N4_NASIL] AST Pointer: src/components/navigation/NavSecondaryRail.tsx::rightItems.map renderer (anonim arrow function)
- **params**: `item` — `{ id: string, label: string, href?: string }` tipinde tek bir menü öğesi
- **ic_degiskenler**: yok
- **Dönüş**: JSX — `Link` elemanı döner; `getIconForId(item.id)` ile ikon ve `<span>{item.label}</span>` ile etiket oluşturulur. Sınıf: `text-white/90` (hafif daha opak beyaz), hover'da arka plan `bg-white/10` ve yuvarlak köşeli (`rounded-lg`) stil eklenir.

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