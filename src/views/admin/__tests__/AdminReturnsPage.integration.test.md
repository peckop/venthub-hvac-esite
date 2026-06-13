---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\admin\__tests__\AdminReturnsPage.integration.test.tsx
skeleton_hash: 982aa24053345287
entity_hashes:
  overview: dde320738cd8b6fd
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-06-13T19:01:19Z
---

## Genel Bakış
Bu dosya, AdminReturnsPage entegrasyon testlerini barındıran bir test modülüdür. Modül, ilgili React bileşeninin doğru render edilmesini ve erişilebilirlik (a11y) standartlarına uygunluğunu doğrulamayı amaçlar. Test dosyası herhangi bir ortam değişkeni kullanmaz veya doğrudan bir API sorgulamaz; yalnızca React Testing Library ve test yardımcılarını kullanarak bileşenin dış bağımlılıklarını izole edilmiş bir ortamda doğrular.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için açıkça tanımlanmış fonksiyon imzası bulunmamaktadır. Yalnızca `sb` adında bir çağrı nesnesi (call) referansı mevcuttur; bu nesne test ortamında bir mock/fixture olarak sağlanmalıdır. Dolayısıyla temel varsayımlar bu yapılandırma ve izolasyon gereksinimleri üzerinedir.

[Aksiyom 1]: Eğer `sb` (Supabase istemcisi) nesnesi test ortamında doğru bir şekilde mocklanmamışsa (örn: geçerli bir yapıya sahip sahte fonksiyonlar içermiyorsa), modül içindeki veritabanı işlemleri (örn: `from().select()`, `rpc()`) beklenmeyen `TypeError` veya `undefined` hataları ile karşılaşır.

[Aksiyom 2]: Eğer `sb` mock nesnesi, modülün gerçek kullanım senaryolarını (örn: `from('returns').select(...)`, `from('return_items').insert(...)`) kapsamıyorsa, testler kritik kod yollarını tetikleyemez ve yanlış pozitif sonuçlar üretir.

[Aksiyom 3]: Eğer test dosyası, ilgili veritabanı tablolarının (örn: `returns`, `return_items`, `products`, `profiles`) mock veri yapılarını içermiyorsa, modülün filtreleme, sayfalama veya hata işleme mantığı test edilemez.

[Aksiyom 4]: Eğer ortam değişkenleri (örn: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) test çalıştırma ortamında tanımlı değilse veya geçerli bir değer içermiyorsa, modülün başlangıç aşamasında hata oluşur ve testler bile çalışmadan başarısız olur.

---

## FONKSİYON DETAYLARI

---

## SABİTLER
- **sb** (call) — `vi.hoisted(() => {
  const returnsData = [
    {
      id: 'r1',
      order_...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/admin/__tests__/AdminReturnsPage.integration.test.tsx::setupMockDataAndClient
- **params**: (yok)
- **ic_degiskenler**:
  - `returnsData` — Test verisi olarak kullanılan iade kayıtları dizisi, her kayıt `id`, `order_id`, `reason`, `status`, `venthub_orders` gibi alanları içerir
  - `selectChain` — Supabase select sorgusu zincirini mock eden nesne, `order()` ve `limit()` metodlarını içerir, `limit()` çağrısı `returnsData`'yı Promise olarak döner
  - `updateChain` — Supabase update sorgusu zincirini mock eden nesne, `eq()` metodunu içerir, `eq()` çağrısı成功 durumunu Promise olarak döner
  - `client` — Mock Supabase client nesnesi, `from()`, `functions.invoke()`, `auth.getSession()`, `auth.getUser()` metodlarını içerir
- **Dönüş**: `{ returnsData, client }` nesnesi

### [N2_NASIL] AST Pointer: src/views/admin/__tests__/AdminReturnsPage.integration.test.tsx::orderMethod
- **params**: (yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: `selectChain` nesnesini zincirleme için döner

### [N3_NASIL] AST Pointer: src/views/admin/__tests__/AdminReturnsPage.integration.test.tsx::limitMethod
- **params**: (yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: `{ data: returnsData, error: null }` Promise'ı

### [N4_NASIL] AST Pointer: src/views/admin/__tests__/AdminReturnsPage.integration.test.tsx::eqMethod
- **params**: (yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: `{ error: null }` Promise'ı

### [N5_NASIL] AST Pointer: src/views/admin/__tests__/AdminReturnsPage.integration.test.tsx::fromMethod
- **params**: (yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: `{ select: [Function], update: [Function] }` nesnesi

### [N6_NASIL] AST Pointer: src/views/admin/__tests__/AdminReturnsPage.integration.test.tsx::selectMethod
- **params**: (yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: `selectChain` nesnesini döner

### [N7_NASIL] AST Pointer: src/views/admin/__tests__/AdminReturnsPage.integration.test.tsx::updateMethod
- **params**: (yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: `updateChain` nesnesini döner

### [N8_NASIL] AST Pointer: src/views/admin/__tests__/AdminReturnsPage.integration.test.tsx::invokeMethod
- **params**: (yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: `{ data: null, error: null }` Promise'ı

### [N9_NASIL] AST Pointer: src/views/admin/__tests__/AdminReturnsPage.integration.test.tsx::getSessionMethod
- **params**: (yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: `{ data: { session: { user: { id: 'u1' } } } }` Promise'ı

### [N10_NASIL] AST Pointer: src/views/admin/__tests__/AdminReturnsPage.integration.test.tsx::getUserMethod
- **params**: (yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: `{ data: { user: { id: 'u1' } } }` Promise'ı

### [N11_NASIL] AST Pointer: src/views/admin/__tests__/AdminReturnsPage.integration.test.tsx::useRoleMock
- **params**: (yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: `{ useRole: [Function] }` nesnesi, useRole fonksiyonu `{ canWrite: [Function], canAccess: [Function], isReadOnly: false, role: 'admin', loading: false, roleLoading: false }` nesnesini döner

### [N12_NASIL] AST Pointer: src/views/admin/__tests__/AdminReturnsPage.integration.test.tsx::useI18nMock
- **params**: (yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: `{ useI18n: [Function] }` nesnesi, useI18n fonksiyonu `{ t: [Function], lang: 'tr' }` nesnesini döner

### [N13_NASIL] AST Pointer: src/views/admin/__tests__/AdminReturnsPage.integration.test.tsx::useSearchParamsRouterPathnameMock
- **params**: (yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: `{ useSearchParams: [Function], useRouter: [Function], usePathname: [Function] }` nesnesi

### [N14_NASIL] AST Pointer: src/views/admin/__tests__/AdminReturnsPage.integration.test.tsx::testRendersReturnsWithSortableHeaders
- **params**: (yok)
- **ic_degiskenler**:
  - `headers` — `screen.getAllByRole('columnheader')` ile elde edilen tablo başlık elementlerinin dizisi
- **Dönüş**: (yok, test case void döner)

### [N15_NASIL] AST Pointer: src/views/admin/__tests__/AdminReturnsPage.integration.test.tsx::testA11yCompliance
- **params**: (yok)
- **ic_degiskenler**:
  - `container` — `render(<AdminReturnsPage />)` sonucu elde edilen DOM konteyneri
  - `results` — `testA11y(container)` çağrısı ile elde edilen erişilebilirlik test sonuçları
- **Dönüş**: (yok, test case void döner)

---

## NODE ID STANDARD

  file: src\views\admin\__tests__\AdminReturnsPage.integration.test.tsx

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