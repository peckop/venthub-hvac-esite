---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-altyapi-t165\src\components\admin\InventoryReservedTable.tsx
skeleton_hash: 38d2a2be2cc17cca
entity_hashes:
  func:InventoryReservedTable: eb9d55bb47faabb8
  overview: f94d5a8cd19fcfaf
  style_tokens: 7b254cdb88c7452c
generated_at: 2026-08-27T08:42:20Z
---

## Genel Bakış
`InventoryReservedTable` bileşeni, yönetim panelinde rezerve edilmiş siparişlerin listelendiği bir tabloyu render eder. Gelen `reservedOrders` propunu alır, tablo başlıklarını ve satırlarını oluşturur, ayrıca boş veri durumlarına karşı temel UI geri bildirimleri sağlar.

## Fonksiyon Grupları
### UI Render ve Layout
Bu grup, tablo yapısını, başlık satırını ve her bir rezerve sipariş satırını JSX içinde oluşturur.
- InventoryReservedTable

### Veri Hazırlama ve Durum Kontrolü
Bu grup, `reservedOrders` propunun varlığını ve boş olup olmadığını kontrol eder; kullanıcının hangi duruma göre hangi UI geri bildirimini göreceğine karar verir.
- InventoryReservedTable

## Bağımlılıklar ve Mimari Notlar
- Dış bağımlılık olarak `reservedOrders` prop'u beklenir; bu prop sağlanmazsa bileşen çalışırken hata üretir.
- Dahili olarak başka bir modüle çağrı yapılmaz; bileşen kendi içinde render ve durum kontrol mantığını barındırır.
- Yönetim paneli altındaki bir alt bileşendir; üst bileşen tarafından veri sağlanarak kullanılır.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdesi verilmediğinden, yalnızca fonksiyon imzasından ve dokümanda açıkça belirtilen davranışlardan aksiyom üretilebilir.

[Aksiyom 1]: Eğer `reservedOrders` propu sağlanmazsa, bileşen boş veri durumunu gösterir (dokümanda "boş veri durumları kontrol edilir" ifadesi mevcut).

[Aksiyom 2]: Eğer `reservedOrders` boş bir dizi ise, tablo satırı oluşturulmaz (dokümanda "tablo başlıklarını ve satırlarını oluşturur" ifadesi mevcut; satır oluşturmak için veri gerekir).

[Aksiyom 3]: Eğer yükleme veya hata durumu mevcutsa, bileşen temel UI geri bildirimi sağlar (dokümanda "yükleme/hataya karşı temel UI geri bildirimlerini sağlar" ifadesi mevcut).

**Not:** Fonksiyon gövdesi verilmediği için, `reservedOrders` içinde beklenen alan adları (ör. sipariş numarası, ürün adı, miktar, tarih vb.), eşik değerleri veya spesifik hata mesajları hakkında bilgi çıkarılamaz. Bu bilgiler ancak fonksiyon gövdesi incelenerek belirlenebilir.

---

## FONKSİYON DETAYLARI

### InventoryReservedTable

**Ne yapar**: Rezerve edilmiş siparişlerin listelendiği bir tablo bileşenidir. Gelen `reservedOrders` dizisi boşsa hiçbir şey render etmez; aksi halde sipariş numarası, tarih ve miktar bilgilerini gösteren bir tablo oluşturur.

**Nasıl yapar**: Bileşen önce `useI18n()` hook'u aracılığıyla uluslararasılaştırma fonksiyonu `t` ve geçerli dil bilgisi `lang` değerlerini alır. Ardından `reservedOrders` dizisinin uzunluğunu kontrol eder; dizi boşsa `null` döndürerek hiçbir DOM öğesi oluşturmaz. Dizi doluysa, yatay kaydırma desteği sağlayan bir kapsayıcı (`div`) içinde bir HTML tablosu render eder. Tablonun başlık satırında sipariş, tarih ve miktar sütunları yer alır; bu başlıklar `t` fonksiyonuyla çevrilir. Tablo gövdesinde `reservedOrders` dizisi `.map()` ile dönülerek her bir rezerve sipariş için bir satır oluşturulur. Her satırda sipariş numarasının son 8 karakteri (`ro.order_id.slice(-8)`), `formatDateTime` fonksiyonuyla `lang` parametresine göre biçimlendirilmiş tarih ve miktar değeri gösterilir. Satırlar arasında hover efekti ve geçiş animasyonları tanımlıdır; son satırın alt kenarlığı `group-last:border-0` sınıfıyla gizlenir.

**Parametreler**:
- `reservedOrders`: `InventoryReservedTableProps` — Bileşenin props nesnesinden destructure edilen rezerve siparişler dizisi. Dizinin her elemanı `order_id` (string), `created_at` (tarih/zaman değeri) ve `quantity` (sayı) alanlarına sahiptir.

**Dönüş**: Kaynakta dönüş tipi açıkça belirtilmemiştir. Fonksiyon, `reservedOrders` boş olduğunda `null`, aksi halde JSX yapısı döndürür.

---

## İTHALATLAR (IMPORTS)
- import: ../../i18n/I18nProvider::useI18n
- import: ../../i18n/datetime::formatDateTime
- import: react::React

---

## INTERFACES

### InventoryReservedTableProps
- `reservedOrders: ReservedRow[]`

---

## TYPE ALIASES

### ReservedRow
```typescript
type ReservedRow = {
    order_id: string;
    created_at: string;
    status: string;
    payment_status: string | null;
    quantity: number
}
```

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/admin/InventoryReservedTable.tsx::InventoryReservedTable
- **params**: `{ reservedOrders }` — InventoryReservedTableProps tipinde, rezerve edilmiş siparişlerin listesi
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan destructure edilen çeviri fonksiyonu; tablo başlıklarını çevirmek için kullanılır (`t('admin.inventory.order')`, `t('admin.inventory.table.date')`, `t('admin.inventory.quantity')`)
  - `lang` — `useI18n()` hook'undan destructure edilen dil bilgisi; `formatDateTime(ro.created_at, lang)` çağrısında tarih formatlamasının hangi dile göre yapılacağını belirtir
  - `ro` — `reservedOrders.map()` callback parametresi; listedeki her bir rezerve sipariş nesnesini temsil eder
  - `ro.order_id` — sipariş kimliği; tablo hücresinde `ro.order_id.slice(-8)` ile son 8 karakteri gösterilir, ayrıca `<tr key={...}>` olarak kullanılır
  - `ro.created_at` — siparişin oluşturulma tarihi; `formatDateTime(ro.created_at, lang)` ile formatlanarak tabloda gösterilir
  - `ro.quantity` — sipariş miktarı; tabloda sağa yaslı olarak gösterilir
- **Dönüş**: `reservedOrders.length === 0` ise `null`; aksi halde tablo yapısı içeren JSX elementi (`<div>` > `<table>` > `<thead>` + `<tbody>`)

---

## NODE ID STANDARD

  file: src\components\admin\InventoryReservedTable.tsx
  function: src\components\admin\InventoryReservedTable.tsx::InventoryReservedTable

---

## DISA AKTARILANLAR (EXPORTS)
  export: InventoryReservedTable
  export: ReservedRow

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-admin-surface-2`, `bg-transparent`, `border-admin-border`, `border-b`, `border-separate`, `border-spacing-0`, `group-last:border-0`, `hover:bg-admin-surface-2`, `text-admin-accent`, `text-admin-fg`, `text-admin-fg-muted`, `text-left`, `text-right`, `text-xs`
- **Layout:** `custom-scrollbar`, `overflow-x-auto`, `w-full`
- **Varyant/Responsive:** `group-last:`, `hover:` önekleri
- **Yardımcı Sınıflar:** `font-mono`, `font-semibold`, `group`, `px-4`, `py-2.5`, `tracking-tighter`, `transition-colors`