---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\admin\__tests__\AdminMovementsPage.integration.test.tsx
skeleton_hash: 1a059876cf40eee9
entity_hashes:
  overview: 2291cd4284600125
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-06-13T19:00:25Z
---

## Genel Bakış

Bu dosya, `AdminMovementsPage` bileşeninin entegrasyon testlerini barındıran bir Vitest test modülüdür. Testler, React Testing Library kullanılarak sayfanın doğru render edilip edilmediğini ve erişilebilirlik (a11y) standartlarına uygunluğunu doğrulamayı amaçlar. Sayfanın hareket kayıtlarını gösteren admin paneli arayüzünün bütüncül davranışını test eder.

## Fonksiyon Grupları

Bu dosyada tanımlanmış bir fonksiyon bulunmamaktadır. Dosya, Vitest `describe`/`it` blokları ve üst seviye statements (test senaryoları) içerir. Fonksiyon grupları üretilemez.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Açıklama:** Kaynak kodu doğrudan paylaşılmadığı için, modülün iç yapısı ve fonksiyon gövdesi incelenemediyordur. Sadece bir test dosyasının yolu belirtildiği ve bu test dosyasının kendisi (bir test senaryosu kümesi) olduğu için, bu modüle özgü mimari varsayımlar çıkarılamamıştır.

---

## FONKSİYON DETAYLARI

---

## SABİTLER
- **sb** (call) — `vi.hoisted(() => {
  // embedded inner-join satırları: products tek-nesne (to...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: `__tests__/AdminMovementsPage.integration.test.tsx`::(arrow_main_setup)
- **params**: () — parametre yok
- **ic_degiskenler**:
  - `movementsData` — Test için mock hareket verisi dizisi; her eleman inner-join düzleştirilmiş `products` alt nesnesi içerir (id, product_id, delta, reason, order_id, created_at, batch_id, products)
  - `categoriesData` — Test için mock kategori verisi dizisi; `{id, name}` formatında iki kategori (Fanlar, Kontrol)
  - `movementsChain` — Supabase query chain mock'u; `order/or/eq/in/gte/lte` metotları zincirleme çağrılabilir; `range()` ise Promise resolve ederek `{data, count, error}` döner
  - `categoriesChain` — Kategori sorgusu mock'u; `order()` çağrısı doğrudan Promise resolve ederek `{data, count, error}` döner
  - `client` — Supabase client mock nesnesi; `from(table)` tabloya göre select zinciri döner (`categories` → categoriesChain, diğer → movementsChain); `channel()` zincirleme `on/subscribe` mock'u döner; `removeChannel()` boş fonksiyon
- **Dönüş**: `{ movementsData, categoriesData, client }` — test verileri ve mock client referansı

---

### [N2_NASIL] AST Pointer: `__tests__/AdminMovementsPage.integration.test.tsx`::movementsChain.order
- **params**: () — parametre yok
- **ic_degiskenler**: (yok)
- **Dönüş**: `movementsChain` — zincirin kendisini döner (fluent API mock)

---

### [N3_NASIL] AST Pointer: `__tests__/AdminMovementsPage.integration.test.tsx`::movementsChain.or
- **params**: () — parametre yok
- **ic_degiskenler**: (yok)
- **Dönüş**: `movementsChain` — zincirin kendisini döner

---

### [N4_NASIL] AST Pointer: `__tests__/AdminMovementsPage.integration.test.tsx`::movementsChain.eq
- **params**: () — parametre yok
- **ic_degiskenler**: (yok)
- **Dönüş**: `movementsChain` — zincirin kendisini döner

---

### [N5_NASIL] AST Pointer: `__tests__/AdminMovementsPage.integration.test.tsx`::movementsChain.in
- **params**: () — parametre yok
- **ic_degiskenler**: (yok)
- **Dönüş**: `movementsChain` — zincirin kendisini döner

---

### [N6_NASIL] AST Pointer: `__tests__/AdminMovementsPage.integration.test.tsx`::movementsChain.gte
- **params**: () — parametre yok
- **ic_degiskenler**: (yok)
- **Dönüş**: `movementsChain` — zincirin kendisini döner

---

### [N7_NASIL] AST Pointer: `__tests__/AdminMovementsPage.integration.test.tsx`::movementsChain.lte
- **params**: () — parametre yok
- **ic_degiskenler**: (yok)
- **Dönüş**: `movementsChain` — zincirin kendisini döner

---

### [N8_NASIL] AST Pointer: `__tests__/AdminMovementsPage.integration.test.tsx`::movementsChain.range
- **params**: () — parametre yok
- **ic_degiskenler**: (yok)
- **Dönüş**: `Promise<{data: movementsData, count: movementsData.length, error: null}>` — Supabase range() simülasyonu; mock hareket satırlarını ve sayısını resolve eder

---

### [N9_NASIL] AST Pointer: `__tests__/AdminMovementsPage.integration.test.tsx`::categoriesChain.order
- **params**: () — parametre yok
- **ic_degiskenler**: (yok)
- **Dönüş**: `Promise<{data: categoriesData, count: categoriesData.length, error: null}>` — tek-seferlik kategori fetch simülasyonu

---

### [N10_NASIL] AST Pointer: `__tests__/AdminMovementsPage.integration.test.tsx`::client.from
- **params**: `(table: string)` — Supabase tablo adı ('categories' veya diğer)
- **ic_degiskenler**: (yok)
- **Dönüş**: `{ select() }` — tablo adına göre `categoriesChain` veya `movementsChain` dönen select nesnesi; `if (table === 'categories')` dal ayrımı yapar

---

### [N11_NASIL] AST Pointer: `__tests__/AdminMovementsPage.integration.test.tsx`::client.from.select (categories)
- **params**: () — parametre yok
- **ic_degiskenler**: (yok)
- **Dönüş**: `categoriesChain` — kategori zincirini döner

---

### [N12_NASIL] AST Pointer: `__tests__/AdminMovementsPage.integration.test.tsx`::client.from.select (movements)
- **params**: () — parametre yok
- **ic_degiskenler**: (yok)
- **Dönüş**: `movementsChain` — hareket zincirini döner

---

### [N13_NASIL] AST Pointer: `__tests__/AdminMovementsPage.integration.test.tsx`::client.channel
- **params**: () — parametre yok
- **ic_degiskenler**:
  - `channel` — Realtime channel mock nesnesi; `on()` ve `subscribe()` metotları zincirin kendisini döner; kendi referansını kapanır
- **Dönüş**: `channel` — on/subscribe zincirleme mock channel nesnesi

---

### [N14_NASIL] AST Pointer: `__tests__/AdminMovementsPage.integration.test.tsx`::client.channel.on
- **params**: () — parametre yok
- **ic_degiskenler**: (yok)
- **Dönüş**: `channel` — dış scope'taki channel nesnesini döner (fluent zincir)

---

### [N15_NASIL] AST Pointer: `__tests__/AdminMovementsPage.integration.test.tsx`::client.channel.subscribe
- **params**: () — parametre yok
- **ic_degiskenler**: (yok)
- **Dönüş**: `channel` — dış scope'taki channel nesnesini döner (fluent zincir)

---

### [N16_NASIL] AST Pointer: `__tests__/AdminMovementsPage.integration.test.tsx`::client.removeChannel
- **params**: () — parametre yok
- **ic_degiskenler**: (yok)
- **Dönüş**: yok — boş gövde, yan etki yok

---

### [N17_NASIL] AST Pointer: `__tests__/AdminMovementsPage.integration.test.tsx`::mock_useRole
- **params**: () — parametre yok
- **ic_degiskenler**: (yok)
- **Dönüş**: `{ canWrite: () => false, canAccess: () => true, isReadOnly: true, role: 'admin', loading: false, roleLoading: false }` — useRole hook mock'u; admin rolü, yazma izni yok, salt okunur mod

---

### [N18_NASIL] AST Pointer: `__tests__/AdminMovementsPage.integration.test.tsx`::mock_useI18n
- **params**: () — parametre yok
- **ic_degiskenler**: (yok)
- **Dönüş**: `{ t: (k: string) => k, lang: 'tr' }` — useI18n hook mock'u; çeviri fonksiyonu anahtarı birebir döner, dil Türkçe

---

### [N19_NASIL] AST Pointer: `__tests__/AdminMovementsPage.integration.test.tsx`::mock_useSearchParams
- **params**: () — parametre yok
- **ic_degiskenler**: (yok)
- **Dönüş**: `new URLSearchParams()` — boş URLSearchParams örneği

---

### [N20_NASIL] AST Pointer: `__tests__/AdminMovementsPage.integration.test.tsx`::mock_useRouter
- **params**: () — parametre yok
- **ic_degiskenler**: (yok)
- **Dönüş**: `{ replace: vi.fn(), push: vi.fn() }` — useRouter hook mock'u; replace ve push vi mock fonksiyonları

---

### [N21_NASIL] AST Pointer: `__tests__/AdminMovementsPage.integration.test.tsx`::mock_usePathname
- **params**: () — parametre yok
- **ic_degiskenler**: (yok)
- **Dönüş**: `'/admin/movements'` — usePathname hook mock'u; mevcut rota yolu

---

### [N22_NASIL] AST Pointer: `__tests__/AdminMovementsPage.integration.test.tsx`::it_hareketleri_render_eder
- **params**: () — parametre yok (async callback)
- **ic_degiskenler**:
  - `headers` — `screen.getAllByRole('columnheader')` ile elde edilen tüm tablo başlık elementleri dizisi; aria-sort attribute'u kontrol edilir
- **Dönüş**: yok — test assertion'ları çalıştırır; `render(<AdminMovementsPage />)` ile bileşeni mount eder, `findByText` ile asenkron veri yüklenmesini bekler, `headers.some(h => h.getAttribute('aria-sort') === 'descending')` ile aktif sıralama doğrulanır, `headers.some(h => h.getAttribute('aria-sort') === 'none')` ile sıralanmayan başlık doğrulanır

---

### [N23_NASIL] AST Pointer: `__tests__/AdminMovementsPage.integration.test.tsx`::it_a11y_ihlali_yok
- **params**: () — parametre yok (async callback)
- **ic_degiskenler**:
  - `container` — `render(<AdminMovementsPage />)` destructuring'inden elde edilen DOM kök düğümü; `testA11y(container)` parametresi olarak kullanılır
  - `results` — `testA11y(container)` Promise sonucu; WCAG erişilebilirlik ihlallerini içeren axe raporu nesnesi
- **Dönüş**: yok — `expect(results).toHaveNoViolations()` assertion'ı ile erişilebilirlik ihlali olmadığı doğrulanır

---

## NODE ID STANDARD

  file: src\views\admin\__tests__\AdminMovementsPage.integration.test.tsx

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