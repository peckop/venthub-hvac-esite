---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\wt-supurme\src\views\admin\__tests__\AdminReturnsPage.integration.test.tsx
skeleton_hash: 2e730fc4b48d6bdf
entity_hashes:
  overview: bf4b8548f5871fe7
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-08-25T07:31:44Z
---

## Genel Bakış

Bu modül, admin panelindeki iade yönetim sayfasının (`AdminReturnsPage`) entegrasyon testlerini içerir. Vitest test altyapısı ve React Testing Library kullanılarak bileşenin render edilmesi, ekran üzerindeki elemanların sorgulanması ve erişilebilirlik kontrolleri (`testA11y`) gerçekleştirilir. Testler, `ConfirmProvider` ile sarmalanmış bir ortamda çalıştırılır ve `vi` modülü aracılığıyla sahte fonksiyonlar (mock) oluşturulabilir.

Dosya doğrudan fonksiyon tanımlamaz; modül seviyesinde test senaryoları (`describe`, `it`, `expect`) ve bunlara ait sabitler (`sb`) bulunur. Herhangi bir API veya veritabanı sorgusu içermez; yalnızca bileşenin görsel ve etkileşim davranışını doğrular.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Gerekçe:** Modülde fonksiyon gövdesi tanımlanmamıştır. Fonksiyon imzaları boş olarak verilmiştir. Modül sabitleri arasında yalnızca `sb` (çağrı) yer almaktadır; ancak bu sabitin kullanım detayı fonksiyon gövdesi olmadığı için değerlendirilememektedir. Aksiyom üretimi yalnızca fonksiyon gövdesinden yapılabildiğinden, bu modül için mimari varsayımlar belirlenememiştir.

---

## FONKSİYON DETAYLARI

---

## İTHALATLAR (IMPORTS)
- import: ../AdminReturnsPage::AdminReturnsPage
- import: @/components/admin/overlay/ConfirmProvider::ConfirmProvider
- import: @/utils/testA11y::testA11y
- import: @testing-library/react::render
- import: @testing-library/react::screen
- import: react::React
- import: vitest::describe
- import: vitest::expect
- import: vitest::it
- import: vitest::vi

---

## SABİTLER
- **sb** (call) — `vi.hoisted(() => {
  const returnsData = [
    {
      id: 'r1',
      or...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: `src/views/admin/__tests__/AdminReturnsPage.integration.test.tsx`::describe (ana blok)
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `returnsData` — iade kayıtlarını temsil eden dizi; her elemanda `id`, `order_id`, `user_id`, `reason`, `description`, `status`, `created_at`, `updated_at`, `order_number`, `customer_name`, `customer_email`, `total_amount` alanları taşır; mock veri olarak kullanılır
  - `Resolved` — `data` (returnsData tipinde), `error` (null), `count?` (opsiyonel number) alanlarından oluşan tip tanımı; Supabase sorgu çözümleme sonucunu temsil eder
  - `SelectChain` — `eq()`, `in()`, `or()`, `ilike()`, `order()`, `range()`, `limit()`, `then()` zincir metotlarını tanımlayan arayüz; Supabase sorgu zincirini taklit eder
- **Dönüş**: yok (side-effect: test bloklarını tanımlar)

### [N2_NASIL] AST Pointer: `src/views/admin/__tests__/AdminReturnsPage.integration.test.tsx`::sb.eq
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: `Promise<{ error: null }>`

### [N3_NASIL] AST Pointer: `src/views/admin/__tests__/AdminReturnsPage.integration.test.tsx`::sb.from
- **params**: `relation` — string; Supabase tablo/view adı
- **ic_degiskenler**:
  - `fromCalls` — dışarıdan erişilen dizi; her `from` çağrısında `relation` değerini kaydeder; test assertions'ında hangi tablonun sorgulandığını doğrulamak için kullanılır
  - `projection` — `select` alt fonksiyonunun parametresi; `'status'` olduğunda `returnsData` üzerinden sadece `status` alanını döner, aksi halde `selectChain` döner
  - `selectChain` — dışarıdan erişilen SelectChain tipinde zincir nesnesi; Supabase sorgu zincirini taklit eder
  - `updateChain` — dışarıdan erişilen zincir nesnesi; `update()` çağrısında döner
- **Dönüş**: `{ select(projection?: string), update() }` nesnesi

### [N4_NASIL] AST Pointer: `src/views/admin/__tests__/AdminReturnsPage.integration.test.tsx`::sb.from.select (iç fonksiyon)
- **params**: `projection` — opsiyonel string; sütun projeksiyonu
- **ic_degiskenler**:
  - `returnsData` — dışarıdan erişilen dizi; `projection === 'status'` olduğunda `.map(r => ({ status: r.status }))` ile sadece status alanlarını çıkarır
  - `r` — map callback parametresi; returnsData elemanını temsil eder
  - `selectChain` — dışarıdan erişilen SelectChain; projection 'status' değilse döner
- **Dönüş**: `Promise<{ data: ..., error: null }>` (status projeksiyonu) veya `SelectChain`

### [N5_NASIL] AST Pointer: `src/views/admin/__tests__/AdminReturnsPage.integration.test.tsx`::sb.from.update (iç fonksiyon)
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `updateChain` — dışarıdan erişilen zincir nesnesi; update işlemi için Supabase zincirini taklit eder
- **Dönüş**: `updateChain` (zincir nesnesi)

### [N6_NASIL] AST Pointer: `src/views/admin/__tests__/AdminReturnsPage.integration.test.tsx`::sb.invoke
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: `Promise<{ data: null, error: null }>`

### [N7_NASIL] AST Pointer: `src/views/admin/__tests__/AdminReturnsPage.integration.test.tsx`::sb.getSession
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: `Promise<{ data: { session: { user: { id: 'u1' } } } }>`

### [N8_NASIL] AST Pointer: `src/views/admin/__tests__/AdminReturnsPage.integration.test.tsx`::sb.getUser
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: `Promise<{ data: { user: { id: 'u1' } } }>`

### [N9_NASIL] AST Pointer: `src/views/admin/__tests__/AdminReturnsPage.integration.test.tsx`::mock useRole factory
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: `{ useRole: () => ({ canWrite: () => true, canAccess: () => true, isReadOnly: false, role: 'admin', loading: false, roleLoading: false }) }`

### [N10_NASIL] AST Pointer: `src/views/admin/__tests__/AdminReturnsPage.integration.test.tsx`::mock useI18n factory
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: `{ useI18n: () => ({ t: (k: string) => k, lang: 'tr' }) }`

### [N11_NASIL] AST Pointer: `src/views/admin/__tests__/AdminReturnsPage.integration.test.tsx`::mock useSearchParams/useRouter/usePathname factory
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: `{ useSearchParams: () => new URLSearchParams(), useRouter: () => ({ replace: vi.fn(), push: vi.fn() }), usePathname: () => '/admin/returns' }`

### [N12_NASIL] AST Pointer: `src/views/admin/__tests__/AdminReturnsPage.integration.test.tsx`::test "iade satırlarını render eder + sıralanabilir başlıkta aria-sort taşır"
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `headers` — `screen.getAllByRole('columnheader')` ile alınan tablo başlık hücreleri dizisi; aria-sort niteliklerini kontrol etmek için kullanılır
  - `h` — `headers.some()` callback parametresi; tek bir columnheader elementini temsil eder
- **Dönüş**: yok (side-effect: `render` ile `AdminReturnsPage` bileşenini `ConfirmProvider` içinde render eder; `screen.findByText` ile satırların görünürlüğünü bekler; `sb.fromCalls` içinde `'view_admin_returns'` varlığını assert eder; başlık hücrelerinde `aria-sort='descending'` ve `aria-sort='none'` varlığını doğrular)

### [N13_NASIL] AST Pointer: `src/views/admin/__tests__/AdminReturnsPage.integration.test.tsx`::test "a11y ihlali yok (axe 0)"
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `container` — `render` sonucundan destructure edilen DOM konteyneri; `testA11y` fonksiyonuna geçirilir
  - `results` — `testA11y(container)` sonucu; erişilebilirlik denetim sonuçlarını taşır
- **Dönüş**: yok (side-effect: `render` ile `AdminReturnsPage` bileşenini `ConfirmProvider` içinde render eder; `screen.findByText('Ayşe Yılmaz')` ile satırların yüklenmesini bekler; `testA11y` ile erişilebilirlik denetimi yapar ve `toHaveNoViolations()` ile ihlal olmadığını assert eder)

---

## NODE ID STANDARD

  file: AdminReturnsPage.integration.test.tsx

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