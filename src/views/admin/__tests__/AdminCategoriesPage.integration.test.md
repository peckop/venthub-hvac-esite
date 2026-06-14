---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\admin\__tests__\AdminCategoriesPage.integration.test.tsx
skeleton_hash: 736eeef604ac45fa
entity_hashes:
  overview: 57920aebfa201d08
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-06-13T18:05:39Z
---

## Genel Bakış
Bu dosya, AdminCategoriesPage adlı React bileşeninin entegrasyon testlerini içeren bir Vitest test dosyasıdır. Temel olarak bileşenin doğru şekilde render edildiğini ve erişilebilirlik (a11y) standartlarına uygunluğunu doğrulamak için test senaryoları içerir. Testler, React Testing Library ve Vitest gibi test yardımcılarını kullanarak bileşenin dış bağımlılıklarla (örn. API çağrıları) olan etkileşimlerini doğrudan test etmez, ancak bileşenin genel yapısını ve temel davranışlarını kapsar.

## Fonksiyon Grupları
*(Bu dosyada tanımlı herhangi bir fonksiyon veya metod bulunmamaktadır.)*

---

## AXIOMS – Mimari Varsayımlar

Bu modül için **üretim (production) fonksiyon gövdesi verilmemiştir**. Sağlanan kaynak bir test dosyasıdır (`AdminCategoriesPage.integration.test.tsx`) ve yalnızca test amaçlı mock/spy çağrısı (`sb`) içermektedir.

Test dosyaları üretim mimarisi üzerinde bağımsız aksiyom barındırmaz; bu nedenle **mimari varsayım tanımlanamamıştır**.

---

### Not (Yorum)
- Kaynak yolu: `__tests__\AdminCategoriesPage.integration.test.tsx` → Bu bir **entegrasyon testi** dosyasıdır.
- `sb (call)`: Büyük ihtimalle bir mock/spy nesnesidir (örn. `sb` = service boundary veya similar), test amaçlı çağrı takibi yapar.
- Üretim modülünün (`AdminCategoriesPage.tsx`) fonksiyon imzaları ve gövdeleri paylaşıldığında gerçek mimari aksiyomlar üretilebilir.

---

## FONKSİYON DETAYLARI

---

## SABİTLER
- **sb** (call) — `vi.hoisted(() => {
  const categoriesData = [
    {
      id: 'cat-1',
      ...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: AdminCategoriesPage.integration.test.tsx::setupMockDataAndClient
- **params**: () (parametre yok)
- **ic_degiskenler**:
  - `categoriesData` — Test verisi olarak kullanılan iki kategorilik dizi, her biri id, name, parent_id, slug, is_active, sort_order, level, image_url, seo_title, seo_desc, created_at, updated_at, description, display_mode, is_featured, marketing_title, menu_label, metadata, translation_key, authority_content alanlarını içerir
  - `selectChain` — Supabase select sorgusunu taklit eden zincir nesnesi, order() ve then() metotlarını içerir
  - `updateChain` — Supabase update sorgusunu taklit eden zincir nesnesi, eq() metodunu içerir
  - `deleteChain` — Supabase delete sorgusunu taklit eden zincir nesnesi, eq() metodunu içerir
  - `client` — Supabase client'ını taklit eden nesne, from(), auth.getSession() ve auth.getUser() metotlarını içerir
- **Dönüş**: { categoriesData: Array<{id: string, name: string, ...}>, client: SupabaseMock } — Mock veriler ve Supabase client taklidi

### [N2_NASIL] AST Pointer: AdminCategoriesPage.integration.test.tsx::mockUseRole
- **params**: () (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: { useRole: () => ({ canWrite: () => boolean, canAccess: () => boolean, isReadOnly: boolean, role: string, loading: boolean, roleLoading: boolean }) } — useRole hook'unun mock'u, admin rolü için tüm izinleri true döner

### [N3_NASIL] AST Pointer: AdminCategoriesPage.integration.test.tsx::mockUseI18n
- **params**: () (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: { useI18n: () => ({ t: (k: string) => string, lang: string }) } — useI18n hook'unun mock'u, t fonksiyonu anahtar değerini olduğu gibi döner, lang 'tr' olarak ayarlı

### [N4_NASIL] AST Pointer: AdminCategoriesPage.integration.test.tsx::mockUseSearchParamsRouterPathname
- **params**: () (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: { useSearchParams: () => URLSearchParams, useRouter: () => ({ replace: Function, push: Function }), usePathname: () => string } — Next.js hook'larının mock'ları, useSearchParams boş parametreler döner, useRouter vi.fn() ile mocklanmış, usePathname '/admin/categories' döner

### [N5_NASIL] AST Pointer: AdminCategoriesPage.integration.test.tsx::testRenderAndSort
- **params**: () (parametre yok)
- **ic_degiskenler**:
  - `headers` — screen.getAllByRole('columnheader') ile alınan tüm tablo başlık elementleri dizisi
- **Dönüş**: void — İki assert ile: 1) aria-sort='ascending' olan başlık olup olmadığını kontrol eder, 2) aria-sort='none' olan başlık olup olmadığını kontrol eder

### [N6_NASIL] AST Pointer: AdminCategoriesPage.integration.test.tsx::testAccessibility
- **params**: () (parametre yok)
- **ic_degiskenler**:
  - `container` — render() metodundan dönen container, tüm sayfa içeriğini temsil eder
  - `results` — testA11y(container) çağrısının sonucu, accessibility ihlallerini içeren obje
- **Dönüş**: void — results objesinintoHaveNoViolations() ile accessibility ihlali içermediğini doğrular

---

## NODE ID STANDARD

  file: src\views\admin\__tests__\AdminCategoriesPage.integration.test.tsx

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