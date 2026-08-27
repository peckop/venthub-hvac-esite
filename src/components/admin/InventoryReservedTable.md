---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-t088\src\components\admin\InventoryReservedTable.tsx
skeleton_hash: 102d99c16d5a79da
entity_hashes:
  func:InventoryReservedTable: eb9d55bb47faabb8
  overview: f94d5a8cd19fcfaf
  style_tokens: 7b254cdb88c7452c
generated_at: 2026-08-27T13:10:35Z
---

## Genel Bakış
`InventoryReservedTable` bileşeni, yönetim panelinde rezerve edilmiş siparişlerin listelendiği bir tabloyu render eder. Gelen `reservedOrders` propunu alır, tablo başlıklarını ve satırlarını oluşturur, ayrıca boş veri durumlarına karşı temel UI geri bildirimleri sağlar.

## Fonksiyon Grupları
### UI Render ve Durum Yönetimi
Bu bileşen, `reservedOrders` propundan gelen veriyi kontrol eder ve buna göre tablo yapısını ya da boş durum mesajını render eder. Tek bileşen olarak hem veri doğrulama hem de görsel çıktı üretiminden sorumludur.
- InventoryReservedTable

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdesi sağlanmadığından, yalnızca fonksiyon imzasından çıkarım yapılabilmektedir.

[Aksiyom 1]: Eğer `reservedOrders` prop'u sağlanmazsa, bileşen beklenen veriyi render edemez.

[Aksiyom 2]: Eğer `InventoryReservedTableProps` tipi tanımlı değilse, bileşen derleme hatası verir.

---

## FONKSİYON DETAYLARI

### InventoryReservedTable

**Ne yapar**: Stokta ayrılmış siparişleri listeleyen bir React bileşenidir. Verilen sipariş listesini tablo formatında görüntüler; liste boş olduğunda hiçbir şey render etmez.

**Nasıl yapar**: Bileşen, `useI18n()` hook'u aracılığıyla uluslararasılaştırma fonksiyonu `t` ve dil bilgisi `lang` değerlerini alır. İlk olarak `reservedOrders` dizisinin uzunluğunu kontrol eder; eğer dizi boşsa `null` döndürerek render işlemini sonlandırır. Dizi dolu olduğunda, yatay kaydırma desteği sağlayan bir kapsayıcı içinde bir HTML tablosu oluşturur. Tablo başlık satırında sipariş numarası, tarih ve miktar sütunları yer alır. Gövde kısmında `reservedOrders` dizisi `map` ile dönülerek her sipariş için bir satır oluşturulur. Sipariş kimliğinin yalnızca son 8 karakteri gösterilir. Tarih bilgisi `formatDateTime` yardımcı fonksiyonu ile `lang` parametresine göre biçimlendirilir. Her satır için `ro.order_id` benzersiz anahtar olarak kullanılır. Son satır hariç tüm satırların alt kenarlığı (`border-b`) bulunur; bu `group-last:border-0` sınıfıyla sağlanır.

**Parametreler**:
- `reservedOrders`: `InventoryReservedTableProps` — Ayrılmış stok siparişlerini içeren bileşen props'u. Dizi yapısında olup her elemanda `order_id` (sipariş kimliği), `created_at` (oluşturulma tarihi) ve `quantity` (miktar) alanlarını içerir.

**Dönüş**: Return tipi kaynak kodda açıkça belirtilmemiştir. Boş dizi durumunda `null`, dolu dizi durumunda JSX elementi döndürür.

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
- **params**:
  - `reservedOrders` — InventoryReservedTableProps tipinde, rezerve edilmiş siparişlerin listesi
- **ic_degiskenler**:
  - `t` — useI18n() hook'undan gelen çeviri fonksiyonu, tablo başlıklarını çevirmek için kullanılır
  - `lang` — useI18n() hook'undan gelen dil kodu, formatDateTime fonksiyonuna tarih formatlaması için iletilir
  - `ro` — reservedOrders.map() iterasyonunda her bir rezerve sipariş nesnesi; `ro.order_id`, `ro.created_at`, `ro.quantity` özelliklerine erişilir
  - `ro.order_id` — sipariş kimliği, `.slice(-8)` ile son 8 karakteri alınarak tabloda gösterilir
  - `ro.created_at` — sipariş oluşturulma tarihi, formatDateTime ile lang parametresine göre formatlanır
  - `ro.quantity` — rezerve edilen miktar, tabloda sağa hizalı gösterilir
- **Dönüş**: reservedOrders boşsa `null`, doluysa JSX (React.ReactNode) — overflow-x-auto div içinde tablo yapısı döner

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