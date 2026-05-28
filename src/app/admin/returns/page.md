---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\app\admin\returns\page.tsx
skeleton_hash: efb4e684e247b5a7
entity_hashes:
  func:Page: 8443af27af30d61d
  overview: 3abd4459140e249f
  style_tokens: f00e706f0d7166cc
generated_at: 2026-05-28T22:35:19Z
---

## Genel Bakış
Bu modül, yönetim panelindeki iade (returns) sayfasının temel rota bileşenini tanımlar. Sayfa, ana iş mantığını ve durum yönetimini içeren `AdminReturnsPage` adlı alt bileşeni dinamik olarak yükleyerek kullanıcıya sunar. Modülün kendisi son derece basit olup, yalnızca bileşen yükleme ve yönlendirme sorumluluğunu taşır.

## Fonksiyon Grupları
### Sayfa Bileşeni
Bu grup, iade sayfasının giriş noktası olarak işlev gören rota bileşenini içerir. Sayfanın yüklenmesi ve ilgili yönetim arayüzünün görüntülenmesi bu bileşen tarafından koordine edilir.
- Page

---



---

## FONKSİYON DETAYLARI

### Page

**Ne yapar**: Next.js App Router yapısında `/admin/returns` rotasını sunan sayfa bileşenidir. Bu fonksiyon, tarayıcıdan bu rotaya erişildiğinde render edilecek olanAdminReturnsPage bileşenini döndürerek yönetimsel iade işlemleri sayfasının görüntülenmesini sağlar.

**Nasıl yapar**: Fonksiyon doğrudan bir React functional component yapısındadır ve JSX içinde `AdminReturnsPage` bileşenini返回 eder. Herhangi bir state yönetimi, veri çekme veya koşsal mantık içermez; yalnızca ilgili alt bileşeni sayfaya monte eder. Bu yapı, Next.js'in `/app` tabanlı yönlendirme yapısında sayfa tanımlamak için kullanılan standart kalıp olan "thin wrapper" (ince sarmalayıcı) deseninin tipik bir örneğidir.

**Parametreler**:

Bu fonksiyon herhangi bir parametre almaz.

**Dönüş**:

- **Return type**: `JSX.Element` — `AdminReturnsPage` bileşeninin render edilmiş JSX çıktısını döndürür.

---

## SABİTLER
- **AdminReturnsPage** (call) — `dynamic(
  () => import('../../../views/admin/AdminReturnsPage'),
  { ssr: ...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src\app\admin\returns\page.tsx::Page
- **params**: (parametre yok)
- **ic_degiskenler**: (yok — fonksiyon gövdesinde değişken tanımlanmamış)
- **Dönüş**: `<AdminReturnsPage />` JSX elementi (React component)
- **Notlar**: Fonksiyon, `AdminReturnsPage` componentini render ederek yan etki olarak sayfa içeriğini oluşturur

---

## NODE ID STANDARD

  file: src\app\admin\returns\page.tsx
  function: src\app\admin\returns\page.tsx::Page

---

## DISA AKTARILANLAR (EXPORTS)
  export: Page

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `text-center`, `text-slate-400`
- **Layout:** `p-8`
- **Varyant/Responsive:** (yok)
- **Yardımcı Sınıflar:** `animate-pulse`