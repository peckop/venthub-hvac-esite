---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\admin\AdminInventoryReportPage.tsx
skeleton_hash: 2a852e29713397e1
entity_hashes:
  func:AdminInventoryReportPage: d037654ecb70b8e0
  overview: 88f23f146110f3c7
  style_tokens: 23d781c8192db1b8
generated_at: 2026-06-06T21:57:34Z
---

## Genel Bakış
Bu modül, VentHub HVAC sistem yöneticileri için tasarlanmış bir React sayfasıdır. Temel amacı, yöneticilerin sistemdeki envanter ve stok verilerini görüntüleyebileceği bir rapor arayüzü sunmaktır. Sayfa, yönetici panelinin bir parçası olarak işlev görür ve veri görselleştirme ve raporlama sorumluluğunu taşır.

## Fonksiyon Grupları
### Ana Sayfa Bileşeni
Bu modülün tek ve temel React bileşenidir. Yönetici arayüzündeki envanter raporu sayfasının tüm kullanıcı arayüzü yapısını, düzenini ve veri akışını oluşturup yönetir.
- AdminInventoryReportPage

---



---

## FONKSİYON DETAYLARI

### AdminInventoryReportPage
**Ne yapar**: VentHub HVAC projesinin admin arayüzünde yer alan envanter raporları sayfasını oluşturan ana bileşendir. Yalnızca admin yetkisine sahip kullanıcıların erişebildiği bu sayfa, projenin envanter verilerini raporlamak amacıyla geliştirilmiştir.
**Nasıl yapar**: Projenin `C:\Users\alize\venthub-hvac\src\views\admin\` dizininde konumlanan bir React sayfa bileşeni olarak çalışır, admin özel arayüz bileşenleri mimarisine entegre şekilde sistemde yer alır. Sadece yetkili admin kullanıcılarının erişim kontrollerini geçtikten sonra uygulamada yüklenen bir yapıdadır.
**Parametreler**:
- Bu fonksiyon herhangi bir giriş parametresi almamaktadır.
**Dönüş**: Tanımda belirtilmiş olduğu üzere dönüş tipi void veya bilinmiyordur, verilen kaynak bilgileri kapsamında kesin dönüş değeri ve tipi hakkında ek bilgi bulunmamaktadır.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: AdminInventoryReportPage.tsx::loadData
- **params**: (yok)
- **ic_degiskenler**:
  - `query` — Supabase sorgu nesnesi; `inventory_movements` tablosundan veri çekmek için oluşturulan zincirli sorgu. Başlangıçta `select` ve `order` ile başlatılır, ardından tarih aralığı filtresi (`gte`, `lte`) koşullu olarak eklenir.
  - `movements` — Supabase yanıtından dönen ham hareket verisi dizisi (`data` alanı). Sorgu sonucu başarıyla alındığında kullanılır, aksi halde `[]` atanır.
  - `movementsError` — Supabase sorgu sonucundaki hata nesnesi. Tanımsız değilse `throw` ile fırlatılır.
- **Dönüş**: yok (state'leri `setLoading`, `setMovementsData`, `setLoading` ile günceller; `movements` verisini `setMovementsData` ile kaydeder)

---

### [N2_NASIL] AST Pointer: AdminInventoryReportPage.tsx::useEffect tetikleyici
- **params**: (yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: yok (yan etki: `loadData()` asenkron olarak çağrılır)

---

### [N3_NASIL] AST Pointer: AdminInventoryReportPage.tsx::computeStats
- **params**: (yok)
- **ic_degiskenler**:
  - `tIn` — Toplam giriş (stok artış) miktarını tutar. Pozitif `delta` değerlerinin toplamı.
  - `tOut` — Toplam çıkış (stok azalış) miktarını tutar. Negatif `delta` değerlerinin mutlaklarının toplamı.
  - `reasonMap` — `Record<string, number>` tipinde sözlük; her hareket sebebine (`sale`, `return`, `restock`, `manual_in`, `manual_out`, `adjustment`) göre mutlak miktarların toplamını tutar.
  - `productSales` — `Record<string, { name: string, out: number }>` tipinde sözlük; ürün adına göre toplam çıkış miktarını tutar. En çok satan ürünlerin sıralaması için kullanılır.
  - `trendMap` — `Record<string, { date: string, incoming: number, outgoing: number }>` tipinde sözlük; tarih bazlı giriş/çıkış trend verisini tutar. Grafiğe dönüştürülmeden önce `Object.values()` ile diziye çevrilir.
  - `term` — `searchQuery` değerinin trim ve küçük harfe çevrilmiş hali; filtreleme terimi.
  - `filtered` — `movementsData` dizisinin `term` ile filtrelenmiş hali. Ürün adı veya `product_id` eşleşmesi kontrol edilir.
  - `dateKey` — `m.created_at` değerinin `'yyyy-MM-dd'` formatında formatlanmış hali; trend haritasında anahtar olarak kullanılır.
  - `deltaAbs` — `m.delta` değerinin mutlak değeri; çıkış hesaplamalarında kullanılır.
  - `pname` — Hareketin ait olduğu ürünün adı; `m.products.name` alanından alınır, tanımsızsa `m.product_id` kullanılır.
  - `rData` — Sebep bazlı grafiğe dönüştürülmüş dizi. `reasonMap` değerlerinden oluşturulur, `value > 0` olanlar filtrelenir.
  - `sortedProds` — `productSales` değerlerinin `out` alanına göre azalan sıralaması. İlk 8 ürün alınır ve isimleri 15 karakterden uzunsa kısaltılır.
- **Dönüş**: yok (yan etkiler: `setStats`, `setReasonData`, `setTopProducts`, `setTrendData` ile state'leri günceller)

---

### [N4_NASIL] AST Pointer: AdminInventoryReportPage.tsx::trendMap_init_callback
- **params**: `d` — `eachDayOfInterval` tarafından döndürülen tek bir `Date` nesnesi; tarih aralığındaki her günü temsil eder.
- **ic_degiskenler**:
  - `k` — `d` değerinin `'yyyy-MM-dd'` formatında formatlanmış hali; `trendMap` sözlüğünün anahtarı.
- **Dönüş**: yok (yan etki: `trendMap[k]` değerini `{ date, incoming: 0, outgoing: 0 }` ile başlatır)

---

### [N5_NASIL] AST Pointer: AdminInventoryReportPage.tsx::filteredForEach_callback
- **params**: `m` — Tek bir envanter hareketi nesnesi; `id`, `delta`, `reason`, `created_at`, `product_id`, `products` alanlarını içerir.
- **ic_degiskenler**:
  - `dateKey` — `m.created_at` değerinin `'yyyy-MM-dd'` formatında formatlanmış hali; `trendMap` içindeki ilgili tarih anahtarı.
  - `deltaAbs` — `m.delta` değerinin `Math.abs` ile hesaplanan mutlak değeri; çıkış miktarı olarak kullanılır.
  - `pname` — Hareketin ürün adı; `m.products.name` alanından (`Record<string, unknown>` cast ile) alınır, tanımsızsa `m.product_id` fallback olarak kullanılır.
- **Dönüş**: yok (yan etki: `tIn`, `tOut`, `trendMap[dateKey].incoming/outgoing`, `reasonMap[m.reason]`, `productSales[pname].out` değerlerini günceller)

---

### [N6_NASIL] AST Pointer: AdminInventoryReportPage.tsx::topProducts_map_callback
- **params**: `p` — `productSales` sözlüğündeki bir değer nesnesi; `{ name: string, out: number }` yapısındadır.
- **ic_degiskenler**: (yok)
- **Dönüş**: `{ name: string, amount: number }` — Grafik verisi için düzenlenmiş ürün nesnesi. `name` 15 karakterden uzunsa `substring(0, 15) + '...'` ile kısaltılır, `amount` ise `out` değeridir.

---

### [N7_NASIL] AST Pointer: AdminInventoryReportPage.tsx::exportCSV
- **params**: (yok)
- **ic_degiskenler**:
  - `header` — CSV dosyasının başlık satırı dizisi: `['ID', 'Tarih', 'Ürün', 'Miktar', 'Sebep', 'Ürün ID']`.
  - `csvRows` — Her hareket nesnesini CSV formatına dönüştürülmüş satırlar dizisi. Her eleman `m.id`, tarih (`'yyyy-MM-dd HH:mm'`), ürün adı veya `m.product_id`, `m.delta`, `m.reason`, `m.product_id` değerlerini içerir. Tüm değerler çift tırnak ile sarılır ve iç tırnaklar escape edilir.
  - `csvString` — BOM (`\ufeff`) ile başlayan, başlık ve veri satırlarının newline ile birleştirilmiş tam CSV metni.
  - `blob` — `csvString` içeriğinden oluşturulan `Blob` nesnesi; `text/csv;charset=utf-8;` MIME türü ile.
  - `url` — `blob` nesnesinden türetilen geçici URL; `URL.createObjectURL` ile oluşturulur.
  - `a` — DOM'da oluşturulan geçici `<a>` elementi; indirme bağlantısı olarak kullanılır.
- **Dönüş**: yok (yan etki: dosya indirme tetiklenir, geçici URL `revokeObjectURL` ile temizlenir)

---

### [N8_NASIL] AST Pointer: AdminInventoryReportPage.tsx::csvRow_map_callback
- **params**: `m` — Tek bir envanter hareketi nesnesi; `id`, `delta`, `reason`, `created_at`, `product_id`, `products` alanlarını içerir.
- **ic_degiskenler**: (yok)
- **Dönüş**: `string` — Tek bir CSV satırı. Değerler virgülle ayrılır, her değer çift tırnak içine alınır, iç tırnaklar (`"`) escape edilir (`""`).

---

### [N9_NASIL] AST Pointer: AdminInventoryReportPage.tsx::getFilteredMovements
- **params**: (yok)
- **ic_degiskenler**:
  - `term` — `searchQuery` değerinin trim ve küçük harfe çevrilmiş hali; filtreleme terimi.
- **Dönüş**: `movementsData` dizisinin filtrelenmiş hali. `term` boşsa tüm `movementsData` döner; doluysa ürün adı (`m.products.name`) veya `product_id` küçük harf karşılaştırması ile filtreleme yapılır.

---

### [N10_NASIL] AST Pointer: AdminInventoryReportPage.tsx::incomingRow_render_callback
- **params**: `m` — Tek bir envanter hareketi nesnesi (pozitif `delta` ile giriş hareketi); `id`, `delta`, `created_at`, `products` alanlarını içerir.
- **ic_degiskenler**: (yok)
- **Dönüş**: JSX `<tr>` elementi — Giriş hareketlerini gösteren tablo satırı. Hücreler: tarih (`'dd.MM HH:mm'` formatında), ürün adı (veya `product_id`), `+delta` değeri (yeşil renk ile).

---

### [N11_NASIL] AST Pointer: AdminInventoryReportPage.tsx::outgoingRow_render_callback
- **params**: `m` — Tek bir envanter hareketi nesnesi (negatif `delta` ile çıkış hareketi); `id`, `delta`, `created_at`, `products` alanlarını içerir.
- **ic_degiskenler**: (yok)
- **Dönüş**: JSX `<tr>` elementi — Çıkış hareketlerini gösteren tablo satırı. Hücreler: tarih (`'dd.MM HH:mm'` formatında), ürün adı (veya `product_id`), `delta` değeri (kırmızı renk ile).

---

## NODE ID STANDARD

  file: src\views\admin\AdminInventoryReportPage.tsx
  function: src\views\admin\AdminInventoryReportPage.tsx::AdminInventoryReportPage

---

## DISA AKTARILANLAR (EXPORTS)
  export: AdminInventoryReportPage

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- `tracking-hvac-normal`

### Tailwind Sınıf Özeti
- **Renkler:** `bg-emerald-400/10`, `bg-emerald-500/5`, `bg-rose-400/10`, `bg-rose-500/5`, `bg-slate-100`, `bg-slate-200`, `bg-slate-50`, `border-b`, `border-emerald-100/10`, `border-emerald-400/20`, `border-emerald-500/10`, `border-l-4`, `border-l-emerald-500`, `border-l-indigo-500`, `border-l-rose-500`
- **Layout:** `absolute`, `flex`, `flex-col`, `gap-2`, `gap-4`, `gap-6`, `grid`, `grid-cols-1`, `h-4`, `h-5`, `h-72`, `h-8`, `h-80`, `h-full`, `items-center`
- **Varyant/Responsive:** `:`, `hover:`, `lg:`, `md:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `!px-4`, `!py-2.5`, `!rounded-2xl`, `!rounded-3xl`, `!rounded-xl`, `${adminButtonSecondaryClass`, `${adminCardClass`, `${stats.net`, `0`, `:`, `<`, `>`, `animate-in`, `animate-pulse`, `border`