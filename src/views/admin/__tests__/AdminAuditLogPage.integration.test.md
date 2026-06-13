---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\admin\__tests__\AdminAuditLogPage.integration.test.tsx
skeleton_hash: 8742d7c25c3ada81
entity_hashes:
  overview: d51c37c3501b18d2
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-06-13T18:04:56Z
---

## Genel Bakış
Bu dosya, `AdminAuditLogPage` bileşeninin entegrasyon testlerini içeren bir Vitest test süitidir. Testler, sayfanın doğru bir şekilde render edilmesini, erişilebilirlik standartlarına uygunluğunu ve temel işlevselliklerini doğrulamak amacıyla testing-library kullanılarak yazılmıştır.

## Fonksiyon Grupları
*(Bu dosyada test haricinde tanımlı bir fonksiyon bulunmamaktadır.)*

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Açıklama:** Verilen modül (`AdminAuditLogPage.integration.test.tsx`) bir test modülüdür ve fonksiyon imzası bilgisi sunulmamıştır. Mevcut bilgilerden (`sb (call)` – Supabase mock çağrısı) yalnızca test ortamında Supabase istemcisinin taklit edildiği anlaşılmaktadır. Mimari varsayım üretmek için test gövdesi kodu (test case'ler, arrangement/act/assert bölümleri) gerekli olup sağlanmamıştır.

---

## FONKSİYON DETAYLARI

---

## SABİTLER
- **sb** (call) — `vi.hoisted(() => {
  const auditData = [
    {
      id: 'a1',
      at: '202...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: `AdminAuditLogPage.integration.test.tsx`::匿名函数_创建模拟数据
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `auditData` — Test edilecek denetim logu verisini temsil eden, iki nesne içeren dizi. Her bir nesne bir denetim kaydının (`id`, `at`, `actor`, `table_name`, `row_pk`, `action`, `comment`, `before`, `after`) alanlarını tanımlar.
  - `queryChain` — Supabase sorgu zincirinin (`select()...order()...gte()...lte()...eq()...or()...range()`) zincirleme (chainable) yöntemlerini taklit eden nesne. Her metod (`order`, `gte`, `lte`, `eq`, `or`) kendi referansını (`queryChain`) döndürerek zinciri devam ettirir, son metod olan `range()` ise `auditData` ile `Promise.resolve(...)` döner.
  - `client` — Supabase istemcisini taklit eden nesne. `from()` metodu, `select()` metodunu barındıran bir nesne döndürür; bu metot ise `queryChain`'i döndürerek sorgu zincirinin başlangıcını simüle eder.
- **Dönüş**: `{ auditData, client }` — Oluşturulan test verisi ve mock istemci nesnesini içeren nesne.

### [N2_NASIL] AST Pointer: `AdminAuditLogPage.integration.test.tsx`::匿名函数_NextJsHookMock
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `vi.fn()` — Vitest kütüphanesinden alınan, boş (boş implementasyon) fonksiyon stub'ı. `useRouter`'ın `replace` ve `push` metodlarının çağrılarını taklit etmek ve çağrılabilirliğini test etmek için kullanılır.
- **Dönüş**: Nesne; `useSearchParams`, `useRouter`, `usePathname` hook'larını mocklayan fonksiyonları içerir.

### [N3_NASIL] AST Pointer: `AdminAuditLogPage.integration.test.tsx`::匿名函数_I18nMock
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: Nesne; `useI18n` hook'unu mocklayan fonksiyonu içerir. Bu fonksiyon, `t` (çeviri) ve `lang` (dil kodu) alanlarını döndürür.

### [N4_NASIL] AST Pointer: `AdminAuditLogPage.integration.test.tsx`::匿名函数_Test1_SıralamaVeRender
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `headers` — `screen.getAllByRole('columnheader')` çağrısıyla elde edilen, tablonun tüm sütun başlıkları (`<th>`) Elementlerinden oluşan dizi.
- **Dönüş**: `Promise<void>`; `async` bir test fonksiyonudur, doğrudan bir değer dönmez, ancak asenkron test assertions'ları çalıştırır.

### [N5_NASIL] AST Pointer: `AdminAuditLogPage.integration.test.tsx`::匿名函数_Test2_A11y
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `container` — `render(<AdminAuditLogPage />)` çağrısının döndürdüğü nesnenin `container` özelliği. Test edilen React bileşeninin DOM ağacının kök düğümünü (root DOM node) temsil eder.
  - `results` — `testA11y(container)` asenkron fonksiyonunun sonucu. axe-core kütüphanesi tarafından üretilen, erişilebilirlik (a11y) ihlallerini ve sonuçlarını içeren bir nesnedir.
- **Dönüş**: `Promise<void>`; `async` bir test fonksiyonudur, doğrudan bir değer dönmez, ancak asenkron test assertions'ları çalıştırır.

---

## NODE ID STANDARD

  file: src\views\admin\__tests__\AdminAuditLogPage.integration.test.tsx

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