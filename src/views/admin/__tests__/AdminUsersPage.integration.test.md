---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\admin\__tests__\AdminUsersPage.integration.test.tsx
skeleton_hash: 54dc0c592cfcf493
entity_hashes:
  overview: 4ffc2416c85285f1
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-06-13T19:02:02Z
---

## Genel Bakış

Bu dosya, `AdminUsersPage` yönetim bileşeninin entegrasyon testlerini içeren bir Vitest test dosyasıdır. Bileşenin doğru render edilmesini, erişilebilirlik (a11y) standartlarına uygunluğunu ve kullanıcı etkileşimlerine (ör. form gönderimi, filtreleme) beklenen yanıtları doğrulamayı hedefler. Testler, React Testing Library ve özel bir `testA11y` yardımcı fonksiyonuyla yazılmıştır.

## Fonksiyon Grupları

Bu dosyada tanımlanmış fonksiyon bulunmamaktadır. Kod, modül seviyesinde `describe` blokları içinde `it`/`test` tanımlamalarından oluşan standart bir test yapısındadır.

---

## AXIOMS – Mimari Varsayımlar

Bu modül bir **entegrasyon test dosyası** olduğu için, Production mimari varsayımlarından ziyade test altyapısına yönelik varsayımlar geçerlidir.

[Aksiyom 1]: Eğer `sb (call)` (Supabase istemcisi/mock) yoksa, testlerdeki veritabanı simülasyonları çalışamaz ve tüm veri erişimi testleri başarısız olur.

[Aksiyom 2]: Eğer `AdminUsersPage` bileşeni render edilemiyorsa (örn: bağımlılıkları sağlanamadığında), tüm entegrasyon testleri başarısız olur.

[Aksiyom 3]: Eğer test ortamı (jsdom, React Testing Library vb.) doğru yapılandırılmamışsa, DOM manipülasyonları içeren test senaryoları çalışamaz.

[Aksiyom 4]: Eğer `sb` (Supabase) mock'u gerçek Supabase API çağrılarını doğru simüle etmiyorsa, entegrasyon testleri production davranışıyla uyumsuz sonuçlar üretebilir.

> **Not:** Bu dosya bir test modülü olduğundan, production'a yönelik domain-specific kurallar (eşik değerleri, kabul kriterleri vb.) burada değil, test edilen `AdminUsersPage` bileşeninin kendisinde tanımlıdır.

---

## FONKSİYON DETAYLARI

---

## SABİTLER
- **sb** (call) — `vi.hoisted(() => {
  const adminUsers = [
    {
      id: 'u1',
      email: ...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: __tests__/AdminUsersPage.integration.test.tsx::sbSetup
- **params**: ()
- **ic_degiskenler**:
  - `adminUsers` — Mock admin kullanıcı dizisi; `id`, `email`, `full_name`, `phone`, `role`, `created_at`, `updated_at` alanlarını içerir; iki sahte admin kullanıcısı (u1 ve u2) tanımlar
  - `allProfiles` — "Tümü" sekmesinin kaynak olarak kullanacağı mock `user_profiles` verisi; `id`, `role`, `created_at`, `full_name` alanlarını içerir; bir admin (u1) ve bir normal kullanıcı (u3) barındırır
  - `selectChain` — Supabase zincirleme sorgu yapısını taklit eden mock nesne; `in()` ve `then()` metodlarını barındırarak `admins` ve `all` sekmelerinin farklı sorgu yollarını simüle eder
  - `client` — Supabase client mock nesnesi; `from()` ve `auth` (içinde `getSession`, `getUser`) metodlarını barındırır; `from().select()` çağrısı `selectChain`'i döner
- **Dönüş**: `{ adminUsers, allProfiles, client }` — tüm mock verileri ve client'ı paket olarak döner

---

### [N2_NASIL] AST Pointer: __tests__/AdminUsersPage.integration.test.tsx::selectChain.in
- **params**: ()
- **ic_degiskenler**: (yok)
- **Dönüş**: `Promise<{ data: Array<{id, full_name}>, error: null }>` — `adminUsers` dizisini `map` ile dönerek sadece `id` ve `full_name` alanlarını içeren çözüm nesnesini döner; admins-tab `.in('id', ids)` sorgusunu simüle eder

---

### [N3_NASIL] AST Pointer: __tests__/AdminUsersPage.integration.test.tsx::selectChain.then
- **params**: `resolve`, `reject?`
- **ic_degiskenler**: (yok)
- **Dönüş**: `Promise.then(resolve, reject)` — `allProfiles` verisini `{ data: allProfiles, error: null }` olarak sarıp `resolve` callback'ine bağlar; thenable select yapısıyla all-tab kaynak yüklemesini simüle eder

---

### [N4_NASIL] AST Pointer: __tests__/AdminUsersPage.integration.test.tsx::client.from
- **params**: ()
- **ic_degiskenler**: (yok)
- **Dönüş**: `{ select() }` nesnesi — iç içe zincirleme yapıda `select()` metodunu barındıran nesneyi döner; Supabase `client.from('tablo')` çağrısını simüle eder

---

### [N5_NASIL] AST Pointer: __tests__/AdminUsersPage.integration.test.tsx::client.from.select
- **params**: ()
- **ic_degiskenler**: (yok)
- **Dönüş**: `selectChain` — önceden tanımlanmış mock sorgu nesnesini döner; `.select('id, ...')` çağrısının ardından zincirleme `.in()` veya `await` ile çözülebilen thenable nesneyi sağlar

---

### [N6_NASIL] AST Pointer: __tests__/AdminUsersPage.integration.test.tsx::client.auth.getSession
- **params**: ()
- **ic_degiskenler**: (yok)
- **Dönüş**: `Promise<{ data: { session: { user: { id: 'u1' } } } }>` — oturum bilgisini mock olarak döner; test içindeki kullanıcının `u1` olarak oturum açtığını simüle eder

---

### [N7_NASIL] AST Pointer: __tests__/AdminUsersPage.integration.test.tsx::client.auth.getUser
- **params**: ()
- **ic_degiskenler**: (yok)
- **Dönüş**: `Promise<{ data: { user: { id: 'u1' } } }>` — kimlik bilgisini mock olarak döner; Supabase `auth.getUser()` çağrısını simüle eder

---

### [N8_NASIL] AST Pointer: __tests__/AdminUsersPage.integration.test.tsx::mockAdminService
- **params**: ()
- **ic_degiskenler**: (yok)
- **Dönüş**: `{ listAdminUsers, setUserAdminRole }` — admin kullanıcı servisi mock'u; `listAdminUsers` `sb.adminUsers` dizisini promise ile döner, `setUserAdminRole` her zaman `true` çözülür

---

### [N9_NASIL] AST Pointer: __tests__/AdminUsersPage.integration.test.tsx::mockUseAuth
- **params**: ()
- **ic_degiskenler**: (yok)
- **Dönüş**: `{ useAuth }` — useAuth hook mock'u; `user: { id: 'u1' }`, `loading: false`, `role: 'admin'`, `roleLoading: false` değerlerini döner

---

### [N10_NASIL] AST Pointer: __tests__/AdminUsersPage.integration.test.tsx::mockUseRole
- **params**: ()
- **ic_degiskenler**: (yok)
- **Dönüş**: `{ useRole }` — useRole hook mock'u; `canWrite: () => true`, `canAccess: () => true`, `isReadOnly: false`, `role: 'admin'`, `loading: false`, `roleLoading: false` değerlerini döner

---

### [N11_NASIL] AST Pointer: __tests__/AdminUsersPage.integration.test.tsx::mockUseI18n
- **params**: ()
- **ic_degiskenler**: (yok)
- **Dönüş**: `{ useI18n }` — useI18n hook mock'u; `t` fonksiyonu girdiği key'i birebir döner (`(k: string) => k`), `lang: 'tr'` olarak ayarlanmıştır

---

### [N12_NASIL] AST Pointer: __tests__/AdminUsersPage.integration.test.tsx::mockNavigationHooks
- **params**: ()
- **ic_degiskenler**: (yok)
- **Dönüş**: `{ useSearchParams, useRouter, usePathname }` — navigasyon hook'larının mock'ları; `useSearchParams` boş `URLSearchParams`, `useRouter` `vi.fn()` ile mocklanmış `replace`/`push` metodları, `usePathname` sabit `/admin/users` döner

---

### [N13_NASIL] AST Pointer: __tests__/AdminUsersPage.integration.test.tsx::describeBody
- **params**: ()
- **ic_degiskenler**: (yok)
- **Dönüş**: yok — `it()` bloklarını sırasıyla çalıştırarak test senaryolarını tanımlayan describe gövdesi; yan etki olarak üç test case'i register eder

---

### [N14_NASIL] AST Pointer: __tests__/AdminUsersPage.integration.test.tsx::testAdminUsersRender
- **params**: ()
- **ic_degiskenler**:
  - `headers` — `screen.getAllByRole('columnheader')` çağrısıyla elde edilen tüm sütun başlığı DOM elementlerinin dizisi; aria-sort kontrolü için kullanılır
- **Dönüş**: yok — yan etki olarak `AdminUsersPage` bileşenini render eder, `admin@venthub.com` ve `super@venthub.com` e-postalarının görünür olduğunu doğrular, `aria-sort` atribütünün `descending` değerine sahip olduğunu assert eder

---

### [N15_NASIL] AST Pointer: __tests__/AdminUsersPage.integration.test.tsx::testAllTabLoad
- **params**: ()
- **ic_degiskenler**: (yok)
- **Dönüş**: yok — yan etki olarak `AdminUsersPage` bileşenini render eder, "Tümü" sekmesine tıklar (`fireEvent.click` ile `admin.users.tabs.all` metnine sahip element), `Normal Kullanici` metninin appear olmasını bekleyerek all-tab kaynağının yüklendiğini doğrular

---

### [N16_NASIL] AST Pointer: __tests__/AdminUsersPage.integration.test.tsx::testA11yAccessibility
- **params**: ()
- **ic_degiskenler**:
  - `container` — `render(<AdminUsersPage />)` çağrısının döndürdüğü `{ container }` destructuring ile elde edilen kök DOM düğümü; axe erişilebilirlik tarayıcısına beslenir
  - `results` — `testA11y(container)` asenkron çağrısının dönüş değeri; axe tarama sonuçlarını içerir, `toHaveNoViolations()` assertion'ı ile sıfır ihlal doğrulanır
- **Dönüş**: yok — yan etki olarak erişilebilirlik taraması çalıştırır ve axe kütüphanesiyle sıfır ihlal olduğunu doğrular

---

## NODE ID STANDARD

  file: src\views\admin\__tests__\AdminUsersPage.integration.test.tsx

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