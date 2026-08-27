---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-t088\src\components\admin\InventoryMovementHistory.tsx
skeleton_hash: 1a9219d4492c65d9
entity_hashes:
  func:InventoryMovementHistory: 4aa730c3557d304e
  overview: 260384a8d41194d3
  style_tokens: 58feab8a69484a8a
generated_at: 2026-08-27T13:09:16Z
---

## Genel Bakış
`InventoryMovementHistory` bileşeni, yönetim panelinde envanter hareketlerinin zaman çizelgesini gösteren bir görünümdür. Gelen `movements` verisini alır ve bu veriyi okunabilir bir formatta listeler, böylece kullanıcılar geçmiş envanter değişikliklerini inceleyebilir.

## Fonksiyon Grupları
### Ana Bileşen Grubu
Bu grup, modülün tek işlevini yerine getirir; envanter hareket geçmişini UI olarak render eder.
- InventoryMovementHistory

---

## Bağımlılıklar ve Mimari Notlar

**Dış Bağımlılıklar**: Modül, `movements` prop'una dayalı olarak çalışır; bu prop'un varlığı ve türü bileşenin doğru render edilmesi için kritiktir.

**Kritik Davranış Kuralları**:
- `movements` prop'u tanımlı değilse bileşen `.map` gibi bir yöntem çağırarak çalışma zamanı hatası fırlatabilir.
- `movements` prop'u bir dizi (iterable) değilse yineleme işlevi başarısız olur.
- `movements` dizisi boşsa bileşen hiçbir hareket öğesi render etmez ve boş bir görünüm gösterir.
- Dizideki öğeler beklenen veriyi (tarih, ürün, miktar vb.) içermiyorsa eksik veriler undefined veya boş olarak görünebilir.

---

## AXIOMS – Mimari Varsayımlar

Bu modül, `movements` prop'una bağlıdır; fonksiyon gövdesi verilmediğinden prop'un nasıl kullanıldığı bilinmiyor.

[Aksiyom 1]: Eğer `movements` prop'u sağlanmazsa, bileşen beklenen şekilde render edilemez.

---

## FONKSİYON DETAYLARI

### InventoryMovementHistory
**Ne yapar**: Envanter hareketlerini (stok değişimlerini) tablo formatında listeleyen bir React fonksiyon bileşenidir. Her bir hareket kaydının tarihini, sebebini ve stok değişim miktarını (delta) gösterir. Hareket listesi boş olduğunda hiçbir şey render etmez.

**Nasıl yapar**: Bileşen, `useI18n` hook'u aracılığıyla uluslararasılaştırma fonksiyonu `t` ve dil bilgisi `lang` değerlerini alır. Önce `movements` dizisinin uzunluğunu kontrol eder; dizi boşsa `null` döndürerek render işlemini sonlandırır. Dizi doluysa, yatay kaydırma desteği olan bir tablo oluşturur. Tablonun başlık satırında tarih, sebep ve delta sütunları yer alır; bu başlıklar `t` fonksiyonuyla çevrilir. Tablo gövdesinde `movements` dizisi `.map()` ile dönülerek her hareket bir satır olarak render edilir. Tarih sütununda `formatDateTime` yardımcı fonksiyonu kullanılarak `m.created_at` değeri ve `lang` parametresi ile biçimlendirilmiş tarih gösterilir. Sebep sütununda `m.reason` değeri, metin taşmasını önlemek için `truncate` ve `max-w-140px` sınıflarıyla kısaltılır; tam metin `title` özniteliğiyle araç ipucu olarak sunulur. Delta sütununda `m.delta` değeri sayıya dönüştürülerek kontrol edilir; pozitifse önüne "+" eklenerek `text-admin-success` (yeşil), negatifse `text-admin-danger` (kırmızı) CSS sınıfıyla renklendirilir. Her satır için `m.id` benzersiz anahtar olarak kullanılır ve satırlar üzerine gelindiğinde arka plan rengi değişir (`hover:bg-admin-surface-2`). Son satırın alt kenarlığı `group-last:border-0` ile kaldırılır.

**Parametreler**:
- movements: InventoryMovementHistoryProps — Envanter hareket kayıtlarını içeren dizi. Her elemanda `id`, `created_at`, `reason` ve `delta` alanları bulunur.

**Dönüş**: `movements` dizisi boşsa `null` döndürür; aksi takdirde bir JSX tablo yapısı döndürür. Kesin dönüş tipi kaynakta belirtilmemiştir.

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

### [N1_NASIL] AST Pointer: src/components/admin/InventoryMovementHistory.tsx::InventoryMovementHistory
- **params**: `movements` — InventoryMovementHistoryProps tipinde, stok hareketlerinin listesi
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan gelen çeviri fonksiyonu; tablo başlıklarını (`admin.inventory.table.date`, `admin.inventory.table.reason`, `admin.inventory.table.delta`) yerelleştirmek için kullanılır
  - `lang` — `useI18n()` hook'undan gelen mevcut dil kodu; `formatDateTime` fonksiyonuna ikinci argüman olarak geçilir
  - `m` — `movements.map(m => ...)` içindeki her bir hareket nesnesi; `m.id` (satır key'i), `m.created_at` (tarih, `formatDateTime` ile biçimlendirilir), `m.reason` (neden açıklaması, `title` attribute'unda ve hücre metninde kullanılır), `m.delta` (değişim miktarı, `Number(m.delta) > 0` kontrolüyle pozitifse `text-admin-success` sınıfı ve önüne `+` eklenir, aksi halde `text-admin-danger` sınıfı uygulanır)
- **Dönüş**: `movements.length === 0` ise `null`; aksi halde `overflow-x-auto` sarmalayıcı içinde `<table>` JSX yapısı (thead: tarih/neden/delta başlıkları, tbody: movements dizisi map edilerek satırlar)

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