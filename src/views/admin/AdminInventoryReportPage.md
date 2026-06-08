---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\admin\AdminInventoryReportPage.tsx
skeleton_hash: 5bac2dbf0b3ead7f
entity_hashes:
  func:AdminInventoryReportPage: d037654ecb70b8e0
  overview: 2182ca4c78bfcab4
  style_tokens: 23d781c8192db1b8
generated_at: 2026-06-08T10:11:00Z
---

## Genel Bakış
Bu modül, VentHub HVAC yöneticileri için sistemdeki envanter verilerini görselleştiren ve raporlayan bir React sayfasıdır. Tek bir üst düzey bileşenden oluşur ve yönetici arayüzünde envanter raporu ekranının tüm yapısını ve iş akışını yönetir. Sayfa, yalnızca yetkili yönetici kullanıcılar tarafından erişilebilir bir şekilde tasarlanmıştır.

## Fonksiyon Grupları
### Ana Sayfa Bileşeni
Bu grup, yönetici rapor sayfasının tüm kullanıcı arayüzünü, veri yüklemesini ve sunum mantığını barındıran temel React bileşeninden oluşur.
- AdminInventoryReportPage

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

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

### [N1_NASIL] AST Pointer: `src/views/admin/AdminInventoryReportPage.tsx`::async_loadData
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `query` — Supabase sorgu nesnesi, `inventory_movements` tablosundan veri çeker; `id`, `delta`, `reason`, `created_at`, `product_id`, `products(name)` alanlarını seçer; `created_at` üzerine azalan sıralama uygular
  - `movements` — Supabase sorgusunun başarılı sonucu: stok hareketleri satır dizisi (`data` alanından)
  - `movementsError` — Supabase sorgusunun hata nesnesi (`error` alanından); hata varsa fırlatılır
- **Dönüş**: yok (yan etki: `setLoading`, `setMovementsData` çağırır)

### [N2_NASIL] AST Pointer: `src/views/admin/AdminInventoryReportPage.tsx`::useEffect_loadData_caller
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: yok (yan etki: `loadData()` asenkron çağrısını tetikler)

### [N3_NASIL] AST Pointer: `src/views/admin/AdminInventoryReportPage.tsx`::computeStats
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `tIn` — Toplam giriş miktarı, pozitif delta değerlerinin toplamı; başlangıçta 0
  - `tOut` — Toplam çıkış miktarı, negatif delta değerlerinin mutlak değerleri toplamı; başlangıçta 0
  - `reasonMap` — Sebep bazlı miktar sözlüğü; anahtarlar: `sale`, `return`, `restock`, `manual_in`, `manual_out`, `adjustment`; her biri başlangıçta 0
  - `productSales` — Ürün bazlı satış miktarı sözlüğü; her eleman `{ name: string, out: number }` formatında; ürün adına göre gruplanmış toplam çıkış miktarı
  - `trendMap` — Tarih bazlı giriş/çıkış trend sözlüğü; anahtar `yyyy-MM-dd` formatlı tarih stringi, değer `{ date: string, incoming: number, outgoing: number }`
  - `term` — `searchQuery`'nin küçük harfe çevrilmiş ve boşlukları trimmed hali; filtreleme için kullanılır
  - `filtered` — `searchQuery` boşsa `movementsData`'nın tamamı, doluysa ürün adı veya product_id eşleşenlerle filtrelenmiş stok hareketleri dizisi
  - `days` — `dateRange.from` ile `dateRange.to` arasındaki tüm günlerin dizisi (date-fns `eachDayOfInterval` ile)
  - `dateKey` — Her hareketin `created_at` alanının `yyyy-MM-dd` formatlı tarih stringi
  - `deltaAbs` — Her hareketin `delta` değerinin mutlak değeri; negatif delta çıkış olarak sayılır
  - `pname` — Hareketin ilişkili ürününün adı; `products.name` alanından alınır, yoksa `product_id` fallback kullanılır
  - `rData` — Pasta grafik için sebep bazlı veri dizisi; her eleman `{ name: string, value: number, color: string }` formatında; `value > 0` olanlar filtrelenmiş
  - `sortedProds` — En çok satılan ilk 8 ürünün sıralanmış dizisi; `productSales` sözlüğünden büyükten küçüğe sıralanmış, ilk 8'i alınmış; `name` 15 karakterden uzunsa kısaltılmış
- **Dönüş**: yok (yan etki: `setStats`, `setReasonData`, `setTopProducts`, `setTrendData` çağırır)

### [N4_NASIL] AST Pointer: `src/views/admin/AdminInventoryReportPage.tsx`::handleExport
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `header` — CSV dosyasının başlık satırı dizisi: `['ID', 'Tarih', 'Ürün', 'Miktar', 'Sebep', 'Ürün ID']`
  - `csvRows` — `movementsData` dizisi üzerinde `map` ile üretilen CSV satırları; her satır bir string dizisi olarak hazırlanıp virgülle birleştirilmiş; içindeki çift tırnak işaretleri escape edilmiş
  - `csvString` — BOM (`\ufeff`) karakteriyle başlayan tam CSV içeriği; başlık satırı ve veri satırları newline ile birleştirilmiş
  - `blob` — CSV string'inden oluşturulan `Blob` nesnesi; MIME type `text/csv;charset=utf-8;`
  - `url` — Blob'dan oluşturulan geçici URL (`URL.createObjectURL`)
  - `a` — Dinamik olarak oluşturulan `<a>` DOM elementi; indirme bağlantısı olarak kullanılır
- **Dönüş**: yok (yan etki: `stok-raporu-{tarih}.csv` dosyasını tarayıcıda indirir)

### [N5_NASIL] AST Pointer: `src/views/admin/AdminInventoryReportPage.tsx`::getFilteredData
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `term` — `searchQuery`'nin küçük harfe çevrilmiş ve boşlukları trimmed hali; filtreleme terimi
- **Dönüş**: `movementsData` dizisi — `term` boşsa tamamı; doluysa ürün adı (`products.name`) veya `product_id` alanlarında `term` içerenlerle filtrelenmiş stok hareketleri dizisi

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