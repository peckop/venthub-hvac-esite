---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\account\__tests__\OrderDetailPageTabs.test.tsx
skeleton_hash: 1a4659abce57dd8b
generated_at: 2026-05-23T22:35:30Z
---

## Genel Bakış
Bu dosya, VentHub HVAC projesinin kullanıcı hesapları görünümünde yer alan sipariş detay sayfası sekmelerinin işlevselliğini test etmek için oluşturulmuş bir Vitest test dosyasıdır. React Testing Library ve Vitest araçlarını kullanarak, ilgili OrderDetailPage bileşeninin test ortamında doğru şekilde render edilmesi, kullanıcı etkileşimlerine yanıt vermesi gibi temel davranışları doğrular. Modül içerisinde sadece yerel test senaryoları için tanımlanmış sahte veriler ve gezinme fonksiyonu kullanır, herhangi bir harici API sorgulaması veya ortam değişkeni kullanmadan tamamen izole test ortamında çalışır.

---

## AXIOMS – Mimari Varsayımlar
Bu modül, VentHub HVAC projesinin kullanıcı hesabı bölümündeki OrderDetailPageTabs sipariş detayları sekme bileşeninin unit testlerini çalıştırmak amacıyla oluşturulmuştur, çalışması için test ortamı ve tüm ilgili bağımlılıkların erişilebilir olması zorunludur.

[Aksiyom 1]: Eğer testlerde yönlendirme simülasyonu için kullanılan mockNavigate çağrısı test ortamında doğru şekilde oluşturulup ilgili bileşene inject edilmemişse, bileşenin yönlendirme işlemlerini test eden senaryoların tamamı başarısız olur.
[Aksiyom 2]: Eğer testlerde örnek sipariş verisi olarak kullanılan orderRow nesnesi, test edilen OrderDetailPageTabs bileşeninin beklediği tüm zorunlu alanlara sahip olacak şekilde tanımlanmamışsa, sipariş verisinin ekrana yüklenmesini doğrulayan test senaryoları hata alarak başarısız olur.
[Aksiyom 3]: Eğer test edilen asıl OrderDetailPageTabs bileşeni, bu test modülünün import edebileceği dosya yolunda mevcut değilse, tüm test senaryoları import hatası ile çalıştırılamadan sonlanır.
[Aksiyom 4]: Eğer test modülünün çalıştığı ortamda React bileşenlerini render etmeye ve test etmeye imkan veren test araçları kurulu ve erişilebilir değilse, OrderDetailPageTabs bileşeninin hiçbir test senaryosu çalıştırılamaz.

---



---

## SABİTLER
- **mockNavigate** (call) — `vi.fn()`
- **orderRow** (object) — `{
  id: 'ord1',
  total_amount: 250,
  status: 'shipped',
  created_at: n...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\__tests__\OrderDetailPageTabs.test.tsx::anonymous_mock_nextnavigation
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `actual` — stores the original imported `next/navigation` module retrieved via `vi.importActual`, used as base for the mocked module
  - `mockNavigate` — global mock function passed as the return value of the mocked `useRouter` hook
- **Dönüş**: object containing original next/navigation properties plus mocked useRouter method

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\__tests__\OrderDetailPageTabs.test.tsx::anonymous_mock_useauth
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `user.id` — hardcoded test user ID 'u1' returned in useAuth mock response
  - `user.email` — hardcoded test user email 'u@u.com' returned in useAuth mock response
  - `user.user_metadata` — empty metadata object for test user
  - `loading` — hardcoded false auth loading state for test
- **Dönüş**: object containing mocked useAuth hook returning test user data

### [N3_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\__tests__\OrderDetailPageTabs.test.tsx::anonymous_mock_usecart
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `addToCart` — Vitest mock function returned as part of useCart hook response
- **Dönüş**: object containing mocked useCart hook with addToCart mock

### [N4_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\__tests__\OrderDetailPageTabs.test.tsx::anonymous_mock_usei18n
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `t` — translation function returned by useI18n mock, takes translation key k and returns matching string or the input key
  - `k` — input parameter of the nested t function, translation key to look up
- **Dönüş**: object containing mocked useI18n hook with translation function

### [N5_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\__tests__\OrderDetailPageTabs.test.tsx::anonymous_mock_tfunction
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `t` — translation function returned by the mock, takes translation key k
  - `k` — input parameter of the nested t function, translation key to resolve
- **Dönüş**: object containing translation function t that returns localized strings

### [N6_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\__tests__\OrderDetailPageTabs.test.tsx::anonymous_standalone_tfunction
- **params**: [k]
- **ic_degiskenler**:
  - `k` — input translation key, used to look up matching localized string from predefined record
- **Dönüş**: localized string matching input key, or input key if no match exists

### [N7_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\__tests__\OrderDetailPageTabs.test.tsx::anonymous_mock_supabase
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `table` — input parameter of the nested from function, database table name to query
  - `orderRow` — global test order data object, returned as query result for venthub_orders table
- **Dönüş**: object containing mocked supabase client with chainable query methods

### [N8_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\__tests__\OrderDetailPageTabs.test.tsx::anonymous_standalone_supabase_from
- **params**: [table]
- **ic_degiskenler**:
  - `table` — input database table name, used to return matching mock query builder
  - `orderRow` — global test order data, returned as query result for venthub_orders queries
- **Dönüş**: chainable mock query builder object for the requested database table

### [N9_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\__tests__\OrderDetailPageTabs.test.tsx::anonymous_supabase_query_eq
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `orderRow` — global test order data, returned as successful query result
- **Dönüş**: chainable mock query object with limit method to continue query flow

### [N10_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\__tests__\OrderDetailPageTabs.test.tsx::anonymous_supabase_query_limit
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `orderRow` — global test order data, resolved as the final query result
- **Dönüş**: chainable mock query object with single method that resolves to test order data

### [N11_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\__tests__\OrderDetailPageTabs.test.tsx::anonymous_duplicate_mock_supabase
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `table` — input database table name for the nested from function
  - `orderRow` — global test order data, returned as venthub_orders query result
- **Dönüş**: object containing mocked supabase client with chainable query methods

### [N12_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\__tests__\OrderDetailPageTabs.test.tsx::anonymous_duplicate_standalone_supabase_from
- **params**: [table]
- **ic_degiskenler**:
  - `table` — input database table name to build mock query for
  - `orderRow` — global test order data, resolved for venthub_orders queries
- **Dönüş**: chainable mock query builder for the requested table

### [N13_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\__tests__\OrderDetailPageTabs.test.tsx::anonymous_duplicate_supabase_query_eq
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `orderRow` — global test order data, returned as final query result
- **Dönüş**: chainable mock query object with limit method

### [N14_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\__tests__\OrderDetailPageTabs.test.tsx::anonymous_duplicate_supabase_query_limit
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `orderRow` — global test order data, resolved as query result
- **Dönüş**: chainable mock query object with single method that resolves to test order data

### [N15_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\__tests__\OrderDetailPageTabs.test.tsx::anonymous_vitest_test_wrapper
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `it` — Vitest test definition function used to declare the tab switching test case
- **Dönüş**: yok (void, only declares a Vitest test case)

### [N16_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\__tests__\OrderDetailPageTabs.test.tsx::anonymous_async_test_callback
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `OrderDetailPage` — imported main component, rendered for testing
  - `render` — React Testing Library render method, used to mount the component under test
  - `screen` — React Testing Library screen object, used to query DOM elements
  - `fireEvent` — React Testing Library event utility, used to trigger click on tab button
  - `expect` — Vitest assertion function, used to validate the tracking link's href attribute
  - `shippingTab` — DOM button element for the Kargo Takibi tab, retrieved to trigger click
  - `link` — DOM link element for the tracking page, retrieved to assert its href property
- **Dönüş**: Promise<void>, async test function that resolves after all assertions pass

---

## NODE ID STANDARD

  file: src\views\account\__tests__\OrderDetailPageTabs.test.tsx