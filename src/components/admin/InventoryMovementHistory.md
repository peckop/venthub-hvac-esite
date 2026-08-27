---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-altyapi-t165\src\components\admin\InventoryMovementHistory.tsx
skeleton_hash: 59cf82b74f629248
entity_hashes:
  func:InventoryMovementHistory: 4aa730c3557d304e
  overview: 260384a8d41194d3
  style_tokens: 58feab8a69484a8a
generated_at: 2026-08-27T08:03:07Z
---

## Genel Bakış
`InventoryMovementHistory` bileşeni, yönetim panelinde envanter hareketlerinin zaman çizelgesini gösteren bir görünümdür. Gelen `movements` verisini alır ve bu veriyi okunabilir bir formatta listeler, böylece kullanıcılar geçmiş envanter değişikliklerini inceleyebilir.

## Fonksiyon Grupları
### Ana Bileşen Grubu
Bu grup, modülün tek işlevini yerine getirir; envanter hareket geçmişini UI olarak render eder.
- InventoryMovementHistory

---

## AXIOMS – Mimari Varsayımlar
Bu modül, `movements` prop'una dayalı olarak çalışır; bu prop'un varlığı ve türü bileşenin doğru render edilmesi için kritiktir.

[Aksiyom 1]: Eğer `movements` prop'u tanımlı değilse (undefined), bileşen render sırasında `movements.map` gibi bir yöntem çağırarak çalışma zamanı hatası fırlatabilir.
[Aksiyom 2]: Eğer `movements` prop'u bir dizi (iterable) değilse, `.map` veya benzeri yineleme işlevi başarısız olur ve bileşen hata verir.
[Aksiyom 3]: Eğer `movements` dizisi boşsa, bileşen hiçbir hareket öğesi render etmez ve boş bir görünüm gösterir.
[Aksiyom 4]: Eğer `movements` dizisindeki öğeler bileşenin görüntülemesi gereken veriyi (tarih, ürün, miktar vb.) içermiyorsa, bu eksik veriler undefined veya boş olarak görünebilir ve kullanıcıya eksik bilgi sunulur.

---

## AXIOMS – Mimari Varsayımlar
- Bu modül davranışsal mantık içermez (salt veri / konfigürasyon / tip tanımı).
- [Aksiyom 1]: Modülün dışa açtığı yapı (anahtar kümesi / şema) bir sözleşmedir; tüketiciler bu sabit yapıya bağlıdır — kırıcı değişiklik tüm tüketicileri etkiler.
- [Aksiyom 2]: Bir öğe ekleme/çıkarma yapısal-uyumlu olmalı; ilgili tipler ve seçiciler aynı commit'te güncel tutulmalıdır.

---

## FONKSİYON DETAYLARI

### InventoryMovementHistory
**Ne yapar**: Envanter hareket geçmişini tablo formatında görüntüler. Her bir hareket kaydı için tarih, sebep ve stok değişim miktarını (delta) gösteren üç sütunlu bir tablo oluşturur. Hareket listesi boş olduğunda hiçbir şey render etmez.

**Nasıl yapar**: `useI18n()` hook'u ile uluslararasılaştırma fonksiyonu (`t`) ve aktif dil bilgisini (`lang`) alır. `movements` dizisinin uzunluğu 0 ise `null` döndürerek bileşeni gizler. Aksi halde, yatay kaydırma desteği olan bir kapsayıcı içinde `<table>` elementi render eder. Tablo başlıkları `t()` fonksiyonu ile çevrilir. Her hareket kaydı `movements.map()` ile satıra dönüştürülür; satırlar `m.id` ile benzersiz şekilde anahtarlanır. Tarih sütununda `formatDateTime` yardımcı fonksiyonu kullanılarak `m.created_at` değeri dile uygun biçimde formatlanır. Delta sütununda `Number(m.delta)` değeri sıfırdan büyükse `text-admin-success` (yeşil) CSS sınıfı ve önüne `+` işareti eklenir; aksi halde `text-admin-danger` (kırmızı) CSS sınıfı uygulanır. Sebep sütunu `truncate` ve `max-w-140px` sınıflarıyla metin taşması durumunda kısaltılır; tam metin `title` özelliğiyle araç ipucu olarak sunulur. Son satır hariç tüm satırlarda alt kenarlık (`border-b`) gösterilir; `group-last:border-0` ile son satırın kenarlığı kaldırılır.

**Parametreler**:
- movements: InventoryMovementHistoryProps — Envanter hareket kayıtlarını içeren dizi. Her eleman `id`, `created_at`, `reason` ve `delta` alanlarına sahiptir.

**Dönüş**: Bilinmiyor (return tipi belirtilmemiş; `movements` boşsa `null`, aksi halde JSX tablo elementi döndürdüğü gözlemlenmektedir).

---

## İTHALATLAR (IMPORTS)
- import: ../../i18n/I18nProvider::useI18n
- import: ../../i18n/datetime::formatDateTime
- import: react::React

---

## INTERFACES

### Movement
- `id: string`
- `delta: number`
- `reason: string`
- `created_at: string`

### InventoryMovementHistoryProps
- `movements: Movement[]`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: InventoryMovementHistory.tsx::InventoryMovementHistory
- **params**: `movements` — InventoryMovementHistoryProps tipinde, stok hareketlerini içeren dizi
- **ic_degiskenler**:
  - `t` — useI18n hook'undan dönen çeviri fonksiyonu; tablo başlıklarının metinlerini (`admin.inventory.table.date`, `admin.inventory.table.reason`, `admin.inventory.table.delta`) çevirmek için kullanılır
  - `lang` — useI18n hook'undan dönen dil kodu; `formatDateTime` fonksiyonuna tarih biçimlendirmesi için iletilir
  - `m` — `movements.map` callback parametresi; dizideki her hareket nesnesini temsil eder
  - `m.id` — hareketin benzersiz kimliği; `<tr>` elementinin React `key` prop'u olarak kullanılır
  - `m.created_at` — hareketin oluşturulma tarihi/zamanı; `formatDateTime(m.created_at, lang)` çağrılarak biçimlendirilmiş olarak ilk sütunda gösterilir
  - `m.reason` — hareketin nedeni/açıklaması; ikinci sütunda metin içeriği ve `title` attribute'u olarak kullanılır
  - `m.delta` — stok değişim miktarı; `Number(m.delta) > 0` kontrolüyle pozitifse `text-admin-success` (öneki `+` ile), negatifse `text-admin-danger` CSS sınıfı uygulanır
- **Dönüş**: `movements.length === 0` ise `null`; aksi halde `overflow-x-auto` sarmalayıcısı içinde `<table>` JSX elementi

---

## NODE ID STANDARD

  file: src\components\admin\InventoryMovementHistory.tsx
  function: src\components\admin\InventoryMovementHistory.tsx::InventoryMovementHistory

---

## DISA AKTARILANLAR (EXPORTS)
  export: InventoryMovementHistory
  export: Movement

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-admin-surface-2`, `bg-transparent`, `border-admin-border`, `border-b`, `border-separate`, `border-spacing-0`, `group-last:border-0`, `hover:bg-admin-surface-2`, `text-admin-danger`, `text-admin-fg`, `text-admin-fg-muted`, `text-admin-success`, `text-left`, `text-right`, `text-xs`
- **Layout:** `custom-scrollbar`, `max-w-140px`, `overflow-x-auto`, `w-full`
- **Varyant/Responsive:** `:`, `group-last:`, `hover:` önekleri
- **Yardımcı Sınıflar:** `${Number(m.delta`, `0`, `:`, `>`, `font-semibold`, `group`, `px-4`, `py-2.5`, `py-3`, `transition-colors`, `truncate`