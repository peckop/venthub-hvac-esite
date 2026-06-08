---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\account\__tests__\ReturnsModalClose.test.tsx
skeleton_hash: 70662fd2c48dfc86
entity_hashes:
  overview: 2f4e1aa515db008a
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-06-08T10:11:00Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesinin kullanıcı hesapları bölümündeki iade işlemleri sayfasında yer alan iade modalının kapanma davranışını test eden birim test dosyasıdır. Vitest test çatısı ve React Testing Library araçlarını kullanarak `AccountReturnsPage` bileşeninin ilgili senaryolarını doğrular. Modülde kullanıcı tanımlı fonksiyon bulunmaz; testler için gerekli üst seviye kod, dış kütüphane importları ve sahte (mock) değişkenler mevcuttur.

## Test Yapısı
Dosya, React Router'ın `useNavigate` ve `useLocation` hook'larını test ortamında mocklayarak (`mockNavigate`, `mockReplace`) iade modalının kapanma sürecinde tetiklenen navigasyon ve location state güncelleme işlemlerinin doğru çalıştığını doğrulama amacını taşır. Test senaryoları, fireEvent ve waitFor gibi React Testing Library araçlarıyla asenkron UI etkileşimlerini simüle eder.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSİYON DETAYLARI

---

## SABİTLER
- **mockNavigate** (call) — `vi.fn()`
- **mockReplace** (call) — `vi.fn()`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: __tests__/ReturnsModalClose.test.tsx::mock_router_factory
- **params**: () (parametre yok)
- **ic_degiskenler**:
  - `push: mockNavigate` — useRouter.push olarak mock Navigate fonksiyonu
  - `replace: mockReplace` — useRouter.replace olarak mock Replace fonksiyonu
  - `prefetch: vi.fn()` — useRouter.prefetch için boş mock fonksiyon
- **Dönüş**: `{ useRouter, usePathname, useSearchParams }` — Next.js router hook'larının mock nesnesi

### [N2_NASIL] AST Pointer: __tests__/ReturnsModalClose.test.tsx::mock_router_push_replace
- **params**: () (parametre yok)
- **ic_degiskenler**:
  - `push: mockNavigate` — push fonksiyonu olarak mockNavigate referansı
  - `replace: mockReplace` — replace fonksiyonu olarak mockReplace referansı
  - `prefetch: vi.fn()` — prefetch için boş mock fonksiyon
- **Dönüş**: `{ push, replace, prefetch }` — router push/replace/prefetch nesnesi

### [N3_NASIL] AST Pointer: __tests__/ReturnsModalClose.test.tsx::mock_auth_factory
- **params**: () (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: `{ useAuth: () => mockAuth }` — useAuth hook'unun mock'u

### [N4_NASIL] AST Pointer: __tests__/ReturnsModalClose.test.tsx::mock_i18n_factory
- **params**: () (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: `{ useI18n: () => mockI18n }` — useI18n hook'unun mock'u

### [N5_NASIL] AST Pointer: __tests__/ReturnsModalClose.test.tsx::mock_supabase_factory
- **params**: () (parametre yok)
- **ic_degiskenler**:
  - `supabase` — mock Supabase client nesnesi, `from` fonksiyonu ile zincirleme sorgu oluşturma sağlar
- **Dönüş**: `{ supabase }` — Supabase client mock nesnesi

### [N6_NASIL] AST Pointer: __tests__/ReturnsModalClose.test.tsx::supabase_from_chain
- **params**: `(table: string)` — sorgulanacak tablo adı
- **ic_degiskenler**:
  - `chain` — select/insert/order/eq/then metodlarını barındıran zincir nesnesi
  - `chain.select` — `mockReturnThis()` ile zinciri devam ettirir
  - `chain.insert` — `{ data: null, error: null }` Promise'i döndürür
  - `chain.order` — `mockReturnThis()` ile zinciri devam ettirir
  - `chain.eq` — `mockReturnThis()` ile zinciri devam ettirir
  - `chain.then` — tabloya göre mock veri döndüren callback fonksiyonu
- **Dönüş**: `chain` — Supabase sorgu zincir nesnesi

### [N7_NASIL] AST Pointer: __tests__/ReturnsModalClose.test.tsx::supabase_then_callback
- **params**: `(callback: (args: { data: Record<string, unknown>[], error: unknown }) => unknown)` — Supabase sorgu sonucunu işleyecek callback
- **ic_degiskenler**:
  - `table` — üst kapsamdan gelen tablo adı, hangi tablonun mock veri döndüreceğini belirler
- **Dönüş**: `callback({ data, error })` — tablo adına göre mock veri ile callback çağrısı

### [N8_NASIL] AST Pointer: __tests__/ReturnsModalClose.test.tsx::after_each_cleanup
- **params**: () (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: yok — `vi.restoreAllMocks()` ile tüm mock'ları temizler (yan etki)

### [N9_NASIL] AST Pointer: __tests__/ReturnsModalClose.test.tsx::test_modal_overlay_click
- **params**: () (parametre yok)
- **ic_degiskenler**:
  - `container` — `render(<AccountReturnsPage />)` sonucu dönen DOM container'ı
  - `modalHeading` — `screen.findByText(/returns\.new/i, { selector: 'h3' })` ile bulunan modal başlık elemanı
  - `overlay` — `container.querySelector('.backdrop-blur-sm')` ile bulunan modal arka plan overlay elemanı
- **Dönüş**: yok — test assertion'larını çalıştırır (yan etki)

### [N10_NASIL] AST Pointer: __tests__/ReturnsModalClose.test.tsx::test_modal_render_and_close
- **params**: () (async, parametre yok)
- **ic_degiskenler**:
  - `container` — `render(<AccountReturnsPage />)` sonucu dönen DOM container'ı
  - `modalHeading` — `screen.findByText(/returns\.new/i, { selector: 'h3' })` ile bulunan modal başlık elemanı, `toBeInTheDocument()` ile doğrulanır
  - `overlay` — `container.querySelector('.backdrop-blur-sm')` ile bulunan modal overlay elemanı, `toBeTruthy()` ile doğrulanır
- **Dönüş**: yok — `fireEvent.click(overlay)` ve `waitFor` ile modal kapanma testini çalıştırır

### [N11_NASIL] AST Pointer: __tests__/ReturnsModalClose.test.tsx::assertion_modal_closed
- **params**: () (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: yok — `screen.queryByText` ile modal başlığının DOM'dan kaldırıldığını doğrular

---

## NODE ID STANDARD

  file: src\views\account\__tests__\ReturnsModalClose.test.tsx

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