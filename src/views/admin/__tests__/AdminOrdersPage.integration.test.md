---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\admin\__tests__\AdminOrdersPage.integration.test.tsx
skeleton_hash: 31ae891a96f8a258
entity_hashes:
  overview: 6ee893a22d15221d
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-06-13T20:09:49Z
---

## Genel Bakış
Bu dosya, `AdminOrdersPage` React bileşeninin entegrasyon testlerini içeren bir Vitest test modülüdür. Modülün temel amacı, sipariş yönetimi sayfasının doğru render edildiğini, gerekli verileri başarıyla çektiğini ve erişilebilirlik (a11y) standartlarına uygun olduğunu doğrulamaktır.

## Test Modülünün Kapsamı
Bu test modülü, bir UI bileşeninin (AdminOrdersPage) dış bağımlılıklarla (API'ler, veri kaynakları) nasıl etkileşime girdiğini test eder. Modülde açıkça belirtilmiş ortam değişkeni bulunmamakla birlikte, testlerin çalışması için API çağrılarının mocklanması veya sahte sunucu kullanılması gerekmektedir.

- **Bileşen Entegrasyonu:** `AdminOrdersPage` bileşeninin, muhtemelen sipariş verilerini çekmek için kullanılan bir API'yi çağırıp verileri başarıyla işlediğini doğrular.
- **Erişilebilirlik Testi:** `testA11y` yardımcı fonksiyonu kullanılarak, sayfanın WCAG erişilebilirlik standartlarına uygunluğu otomatik olarak kontrol edilir.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Açıklama:** Modül, bir test dosyası (`AdminOrdersPage.integration.test.tsx`) olup, fonksiyon imzası veya modül sabiti bulunmamaktadır. `sb (call)` olarak belirtilen kayıt, test modülü olduğu için ve fonksiyon gövdesi verilmediği için, mimari bir varsayım üretilememektedir.

---

## FONKSİYON DETAYLARI

---

## SABİTLER
- **sb** (call) — `vi.hoisted(() => {
  const ordersData = [
    {
      id: 'o1aaaa11bbbb2222',...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: AdminOrdersPage.integration.test.tsx::anon_setup
- **params**: ()
- **ic_degiskenler**:
  - `ordersData` — Test amaçlı sipariş nesneleri dizisi; iki sahte sipariş (o1aaaa11, o2cccc33) içerir, her biri id, status, conversation_id, total_amount, created_at, order_number, customer_name, customer_email, customer_phone alanlarını barındırır
  - `ordersChain` — Supabase sorgu zinciri mock'u; order(), ilike(), eq(), in(), is(), gte(), lte() methods zinciri döndürür, range() Promise.resolve({data, count, error}) ile çözülür
  - `venthubChain` — venthub_orders tablosu için Supabase sorgu zinciri mock'u; eq() kendini döndürür, maybeSingle() Promise.resolve({data: {carrier: null, tracking_number: null}, error: null}) çözülür
  - `client` — Supabase client mock nesnesi; from(table) methodu tablo adına göre select() çağrısını ordersChain veya venthubChain'e yönlendirir; functions.invoke vi.fn() ile mocklanmış (resolve edilen değer {error: null})
  - `ordersData.length` — range() çağrısında count parametresi olarak kullanılan ordersData dizisinin uzunluğu
- **Dönüş**: `{ ordersData, client }` — test senaryolarında kullanılacak mock veriler ve client nesnesi

### [N2_NASIL] AST Pointer: AdminOrdersPage.integration.test.tsx::ordersChain_order
- **params**: ()
- **ic_degiskenler**: (yok)
- **Dönüş**: `ordersChain` — zincirin devamı için kendini döndürür (fluent API pattern)

### [N3_NASIL] AST Pointer: AdminOrdersPage.integration.test.tsx::ordersChain_ilike
- **params**: ()
- **ic_degiskenler**: (yok)
- **Dönüş**: `ordersChain` — zincirin devamı için kendini döndürür

### [N4_NASIL] AST Pointer: AdminOrdersPage.integration.test.tsx::ordersChain_eq
- **params**: ()
- **ic_degiskenler**: (yok)
- **Dönüş**: `ordersChain` — zincirin devamı için kendini döndürür

### [N5_NASIL] AST Pointer: AdminOrdersPage.integration.test.tsx::ordersChain_in
- **params**: ()
- **ic_degiskenler**: (yok)
- **Dönüş**: `ordersChain` — zincirin devamı için kendini döndürür

### [N6_NASIL] AST Pointer: AdminOrdersPage.integration.test.tsx::ordersChain_is
- **params**: ()
- **ic_degiskenler**: (yok)
- **Dönüş**: `ordersChain` — zincirin devamı için kendini döndürür

### [N7_NASIL] AST Pointer: AdminOrdersPage.integration.test.tsx::ordersChain_gte
- **params**: ()
- **ic_degiskenler**: (yok)
- **Dönüş**: `ordersChain` — zincirin devamı için kendini döndürür

### [N8_NASIL] AST Pointer: AdminOrdersPage.integration.test.tsx::ordersChain_lte
- **params**: ()
- **ic_degiskenler**: (yok)
- **Dönüş**: `ordersChain` — zincirin devamı için kendini döndürür

### [N9_NASIL] AST Pointer: AdminOrdersPage.integration.test.tsx::ordersChain_range
- **params**: ()
- **ic_degiskenler**:
  - `ordersData` — closure tarafından yakalanan test siparişleri dizisi
  - `ordersData.length` — count alanı için kullanılan dizi uzunluğu
- **Dönüş**: `Promise.resolve({ data: ordersData, count: ordersData.length, error: null })` — Supabase range() sonucunu simüle eder

### [N10_NASIL] AST Pointer: AdminOrdersPage.integration.test.tsx::venthubChain_eq
- **params**: ()
- **ic_degiskenler**: (yok)
- **Dönüş**: `venthubChain` — zincirin devamı için kendini döndürür

### [N11_NASIL] AST Pointer: AdminOrdersPage.integration.test.tsx::venthubChain_maybeSingle
- **params**: ()
- **ic_degiskenler**: (yok)
- **Dönüş**: `Promise.resolve({ data: { carrier: null, tracking_number: null }, error: null })` — venthub_orders tablosunda kargo bilgisi olmayan bir kaydı simüle eder

### [N12_NASIL] AST Pointer: AdminOrdersPage.integration.test.tsx::client_from
- **params**: `(table: string)` — sorgu yapılacak Supabase tablosunun adı
- **ic_degiskenler**: (yok)
- **Dönüş**: tablo adı `'venthub_orders'` ise `{ select: () => venthubChain }`, aksi halde `{ select: () => ordersChain }` — tabloya göre doğru sorgu zincirini seçen factory

### [N13_NASIL] AST Pointer: AdminOrdersPage.integration.test.tsx::client_from_select_venthub
- **params**: ()
- **ic_degiskenler**: (yok)
- **Dönüş**: `venthubChain` — venthub_orders tablosu için sorgu zinciri döndürür

### [N14_NASIL] AST Pointer: AdminOrdersPage.integration.test.tsx::client_from_select_default
- **params**: ()
- **ic_degiskenler**: (yok)
- **Dönüş**: `ordersChain` — varsayılan tablolar için sipariş sorgu zinciri döndürür

### [N15_NASIL] AST Pointer: AdminOrdersPage.integration.test.tsx::mock_useRole
- **params**: ()
- **ic_degiskenler**: (yok)
- **Dönüş**: `{ useRole: () => ({ canWrite: () => true, canAccess: () => true, isReadOnly: false, role: 'admin', loading: false, roleLoading: false }) }` — admin rolü mock'u; tüm izinler true, readonly false

### [N16_NASIL] AST Pointer: AdminOrdersPage.integration.test.tsx::mock_useI18n
- **params**: ()
- **ic_degiskenler**: (yok)
- **Dönüş**: `{ useI18n: () => ({ t: (k: string) => k, lang: 'tr' }) }` — i18n mock'u; t() fonksiyonu anahtarın kendisini döndürür, dil tr

### [N17_NASIL] AST Pointer: AdminOrdersPage.integration.test.tsx::mock_router
- **params**: ()
- **ic_degiskenler**:
  - `URLSearchParams` — boş search parametreleri oluşturur
  - `vi.fn()` — replace ve push metotları için spy/mock
- **Dönüş**: `{ useSearchParams: () => new URLSearchParams(), useRouter: () => ({ replace: vi.fn(), push: vi.fn() }), usePathname: () => '/admin/orders' }` — Next.js router mock'u; pathname /admin/orders olarak sabit

### [N18_NASIL] AST Pointer: AdminOrdersPage.integration.test.tsx::describe_callback
- **params**: ()
- **ic_degiskenler**: (yok — iki it() bloğunu barındırır)
- **Dönüş**: (yok — describe bloğu testleri tanımlar, dönüş değeri yoktur)

### [N19_NASIL] AST Pointer: AdminOrdersPage.integration.test.tsx::test_render_sort
- **params**: ()
- **ic_degiskenler**:
  - `headers` — `screen.getAllByRole('columnheader')` ile elde edilen tüm tablo başlık elementleri dizisi
  - `h` — Array.some callback'inde her bir columnheader elementini temsil eder
  - `h.getAttribute('aria-sort')` — her başlığın sıralama durumunu döndürür ('descending' veya 'none')
- **Dönüş**: (yok — async test fonksiyonu; expect assertion'larıyla sıralama ve render doğrulaması yapar)

### [N20_NASIL] AST Pointer: AdminOrdersPage.integration.test.tsx::test_a11y
- **params**: ()
- **ic_degiskenler**:
  - `container` — `render(<AdminOrdersPage />)` destructuring'inden elde edilen DOM kök düğümü
  - `results` — `testA11y(container)` çağrısından dönen axe erişilebilirlik sonuçları
- **Dönüş**: (yok — async test fonksiyonu; testA11y ile a11y ihlali olup olmadığını doğrular)

---

## NODE ID STANDARD

  file: src\views\admin\__tests__\AdminOrdersPage.integration.test.tsx

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