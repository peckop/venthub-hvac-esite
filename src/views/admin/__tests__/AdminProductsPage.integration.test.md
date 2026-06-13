---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\admin\__tests__\AdminProductsPage.integration.test.tsx
skeleton_hash: ebea8b1373ddd416
entity_hashes:
  overview: 0a3085e879145536
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-06-13T21:07:46Z
---

## Genel Bakış

Bu dosya, AdminProductsPage bileşeninin entegrasyon testlerini içerir. Bileşenin erişilebilirlik (a11y) standartlarına uygunluğunu ve temel işlevselliklerini doğrulamak için vitest ve testing-library kullanılarak yazılmıştır.

## Fonksiyon Grupları

Bu dosyada tanımlı fonksiyon bulunmamaktadır. Dosya yalnızca modül seviyesinde çalışan test betiklerinden oluşmaktadır.

---

## AXIOMS – Mimari Varsayımlar
- Bu modül davranışsal mantık içermez (salt veri / konfigürasyon / tip tanımı).
- [Aksiyom 1]: Modülün dışa açtığı yapı (anahtar kümesi / şema) bir sözleşmedir; tüketiciler bu sabit yapıya bağlıdır — kırıcı değişiklik tüm tüketicileri etkiler.
- [Aksiyom 2]: Bir öğe ekleme/çıkarma yapısal-uyumlu olmalı; ilgili tipler ve seçiciler aynı commit'te güncel tutulmalıdır.

---

## FONKSİYON DETAYLARI

---

## SABİTLER
- **sb** (call) — `vi.hoisted(() => {
  // terim-yok yolu (varsayılan): products select→order→ra...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/admin/__tests__/AdminProductsPage.integration.test.tsx::mockClientSetup
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `productsData` — Mock ürün listesi, iki örnek ürün nesnesi içerir (id, name, sku, model_code, brand, status, category_id, price, purchase_price, stock_qty, low_stock_threshold, is_featured, slug alanlarıyla)
  - `categoriesData` — Mock kategori listesi, iki örnek kategori nesnesi içerir (id ve name alanlarıyla)
  - `productsChain` — Supabase ürün sorgu zincirini simüle eden mock nesne; eq, in, order metodları zinciri devam ettirir, range metodu promise döndürür
  - `categoriesChain` — Supabase kategori sorgu zincirini simüle eden mock nesne; order metodu promise döndürür
  - `productImagesChain` — Supabase ürün görselleri sorgu zincirini simüle eden mock nesne; in zinciri devam ettirir, order promise döndürür
  - `techSpecsChain` — Supabase teknik özellikler sorgu zincirini simüle eden mock nesne; eq zinciri devam ettirir, maybeSingle promise döndürür
  - `client` — Ana mock Supabase istemci nesnesi; from() metodu tabloya göre uygun sorgu zincirini döndürür (categories, product_images, products)
- **Dönüş**: `{ productsData, categoriesData, client }` objesi

### [N2_NASIL] AST Pointer: src/views/admin/__tests__/AdminProductsPage.integration.test.tsx::productsChain.eq
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: `productsChain` (zincirin kendisini döndürür)

### [N3_NASIL] AST Pointer: src/views/admin/__tests__/AdminProductsPage.integration.test.tsx::productsChain.in
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: `productsChain` (zincirin kendisini döndürür)

### [N4_NASIL] AST Pointer: src/views/admin/__tests__/AdminProductsPage.integration.test.tsx::productsChain.order
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: `productsChain` (zincirin kendisini döndürür)

### [N5_NASIL] AST Pointer: src/views/admin/__tests__/AdminProductsPage.integration.test.tsx::productsChain.range
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: `Promise<{ data: productsData, count: productsData.length, error: null }>`

### [N6_NASIL] AST Pointer: src/views/admin/__tests__/AdminProductsPage.integration.test.tsx::categoriesChain.order
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: `Promise<{ data: categoriesData, count: categoriesData.length, error: null }>`

### [N7_NASIL] AST Pointer: src/views/admin/__tests__/AdminProductsPage.integration.test.tsx::productImagesChain.in
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: `productImagesChain` (zincirin kendisini döndürür)

### [N8_NASIL] AST Pointer: src/views/admin/__tests__/AdminProductsPage.integration.test.tsx::productImagesChain.order
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: `Promise<{ data: [], error: null }>`

### [N9_NASIL] AST Pointer: src/views/admin/__tests__/AdminProductsPage.integration.test.tsx::techSpecsChain.eq
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: `techSpecsChain` (zincirin kendisini döndürür)

### [N10_NASIL] AST Pointer: src/views/admin/__tests__/AdminProductsPage.integration.test.tsx::techSpecsChain.maybeSingle
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: `Promise<{ data: { technical_specs: {} }, error: null }>`

### [N11_NASIL] AST Pointer: src/views/admin/__tests__/AdminProductsPage.integration.test.tsx::client.from
- **params**: `(table: string)`
- **ic_degiskenler**:
  - `table` — Sorgu yapılacak tablo adını belirten string parametre ('categories', 'product_images' veya 'products')
- **Dönüş**: Tabloya göre select() veya select(), update(), delete() metodları içeren nesne

### [N12_NASIL] AST Pointer: src/views/admin/__tests__/AdminProductsPage.integration.test.tsx::client.from.select_categories
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: `categoriesChain`

### [N13_NASIL] AST Pointer: src/views/admin/__tests__/AdminProductsPage.integration.test.tsx::client.from.select_product_images
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: `productImagesChain`

### [N14_NASIL] AST Pointer: src/views/admin/__tests__/AdminProductsPage.integration.test.tsx::client.from.select_products
- **params**: `(cols: string)`
- **ic_degiskenler**:
  - `cols` — Seçilecek sütunları belirten string parametre ('technical_specs' veya diğer sütunlar)
- **Dönüş**: `techSpecsChain` veya `productsChain`

### [N15_NASIL] AST Pointer: src/views/admin/__tests__/AdminProductsPage.integration.test.tsx::client.from.update
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: `{ in: () => Promise.resolve({ error: null }), eq: () => Promise.resolve({ error: null }) }`

### [N16_NASIL] AST Pointer: src/views/admin/__tests__/AdminProductsPage.integration.test.tsx::client.from.delete
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: `{ in: () => Promise.resolve({ error: null }), eq: () => Promise.resolve({ error: null }) }`

### [N17_NASIL] AST Pointer: src/views/admin/__tests__/AdminProductsPage.integration.test.tsx::mockAdminSearchProducts
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: `{ adminSearchProducts: () => Promise.resolve([]) }` objesi

### [N18_NASIL] AST Pointer: src/views/admin/__tests__/AdminProductsPage.integration.test.tsx::mockUseRole
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: `{ useRole: () => ({ canWrite: () => true, canAccess: () => true, isReadOnly: false, role: 'admin', loading: false, roleLoading: false }) }` objesi

### [N19_NASIL] AST Pointer: src/views/admin/__tests__/AdminProductsPage.integration.test.tsx::mockUseI18n
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: `{ useI18n: () => ({ t: (k: string) => k, lang: 'tr' }) }` objesi

### [N20_NASIL] AST Pointer: src/views/admin/__tests__/AdminProductsPage.integration.test.tsx::mockUseSearchParamsAndRouter
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: `{ useSearchParams: () => new URLSearchParams(), useRouter: () => ({ replace: vi.fn(), push: vi.fn() }), usePathname: () => '/admin/products' }` objesi

### [N21_NASIL] AST Pointer: src/views/admin/__tests__/AdminProductsPage.integration.test.tsx::it_urunleri_render_eder
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `headers` — `screen.getAllByRole('columnheader')` çağrısı ile elde edilen tüm sütun başlığı elementlerinin listesi
- **Dönüş**: Yok (test case, assert kontrolü yapar)

### [N22_NASIL] AST Pointer: src/views/admin/__tests__/AdminProductsPage.integration.test.tsx::it_urunleri_render_eder_anonymous
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `headers` — `screen.getAllByRole('columnheader')` çağrısı ile elde edilen tüm sütun başlığı elementlerinin listesi
- **Dönüş**: Yok (test case, assert kontrolü yapar)

### [N23_NASIL] AST Pointer: src/views/admin/__tests__/AdminProductsPage.integration.test.tsx::it_a11y_ihlali_yok
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `container` — `render(<AdminProductsPage />)` çağrısının döndürdüğü nesneden çıkarılan container referansı
  - `results` — `testA11y(container)` async çağrısının döndürdüğü test sonuçları
- **Dönüş**: Yok (test case, assert kontrolü yapar)

### [N24_NASIL] AST Pointer: src/views/admin/__tests__/AdminProductsPage.integration.test.tsx::it_a11y_ihlali_yok_anonymous
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `container` — `render(<AdminProductsPage />)` çağrısının döndürdüğü nesneden çıkarılan container referansı
  - `results` — `testA11y(container)` async çağrısının döndürdüğü test sonuçları
- **Dönüş**: Yok (test case, assert kontrolü yapar)

---

## NODE ID STANDARD

  file: src\views\admin\__tests__\AdminProductsPage.integration.test.tsx

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** (yok)
- **Layout:** (yok)
- **Varyant/Responsive:** (yok)
- **Yardımcı Sınıflar:** (yok)