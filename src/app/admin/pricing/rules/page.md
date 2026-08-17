---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\app\admin\pricing\rules\page.tsx
skeleton_hash: 79aa3a61a6d4585a
entity_hashes:
  func:Page: cd9efdf41c64d125
  overview: 36e05498f361936e
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-08-14T09:12:20Z
---

## Genel Bakış

Bu modül, Next.js App Router yapısında yer alan bir admin sayfasıdır. `Page` bileşeni, yöneticilerin fiyatlandırma kurallarını görüntülemesini ve yönetmesini sağlayan arayüzü sunar. Tek bir sayfa bileşeninden oluşan basit bir yapıya sahiptir ve admin panelinin fiyatlandırma yönetim alanına karşılık gelir.

## Fonksiyon Grupları

### Sayfa Bileşeni
Tek bir React sayfa bileşeni içerir. Fiyatlandırma kurallarının listelenmesi, oluşturulması veya değiştirilmesi için gerekli arayüzü render eder.
- `Page` — Admin panelinin fiyatlandırma kuralları yönetim sayfasını oluşturan ana bileşendir

---

## AXIOMS – Mimari Varsayımlar

Bu modül, minimal yapıda bir Next.js sayfasıdır. Sadece `Page()` fonksiyonu ve `metadata` sabitinden oluşmaktadır.

[Aksiyom 1]: Eğer `metadata` nesnesi export edilmiyor/bozuksa, Next.js bu sayfa için varsayılan meta bilgileri kullanır (sayfa başlığı ve açıklaması tanımsız olur).

[Aksiyom 2]: Eğer `Page()` fonksiyonu geçerli bir JSX/TSX elemanı döndürmüyorsa, tarayıcıda render hatası oluşur.

[Aksiyom 3]: Eğer `metadata` nesnesi geçerli bir Next.js metadata objesi formatında değilse (ör. `title` alanı string değilse), Next.js build sırasında hata fırlatır.

[Aksiyom 4]: Bu sayfa `/admin/pricing/rules` rotasında erişilebilir olmalıdır; bu rotada erişilebilir değilse, kullanıcı ilgili sayfaya ulaşamaz.

---

## FONKSİYON DETAYLARI

### Page
**Ne yapar**: Admin pricing rules sayfasını render eder. Next.js App Router yapısında `/admin/pricing/rules` rotasına karşılık gelen sayfa bileşenidir.

**Nasıl yapar**: Basit bir sarmalayıcı (wrapper) fonksiyon olarak çalışır ve `AdminPricingRulesPage` bileşenini doğrudan render eder. Bu yapı, Next.js'in App Router formatında sayfa dosyaları için standart bir yaklaşımdır. Fonksiyon herhangi bir mantık içermeksizin alt bileşeni çağırarak sayfa yapısını oluşturur.

**Parametreler**: Bu fonksiyon herhangi bir parametre almaz.

**Dönüş**: JSX elementi döndürür. Return type olarak `<AdminPricingRulesPage />` bileşeni verilmiştir. Bu bileşen, pricing rules yönetim arayüzünü içeren ana sayfa yapısını temsil eder.

---

## İTHALATLAR (IMPORTS)
- import: ../../../../views/admin/AdminPricingRulesPage::AdminPricingRulesPage

---

## SABİTLER
- **metadata** (object) — `{
  title: 'Marj Kuralları | VentHub HVAC',
  description: 'VentHub HVAC fi...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/app/admin/pricing/rules/page.tsx::Page
- **params**: (parametre yok)
- **ic_degiskenler**: (yok — fonksiyon gövdesinde herhangi bir değişken tanımlanmıyor veya kullanılmıyor)
- **Dönüş**: `<AdminPricingRulesPage />` JSX elemanı döner — import edilen `AdminPricingRulesPage` bileşeninin instance'ını render eder; sayfa içeriğinin tamamı bu bileşene devredilir

---

## NODE ID STANDARD

  file: src\app\admin\pricing\rules\page.tsx
  function: src\app\admin\pricing\rules\page.tsx::Page

---

## DISA AKTARILANLAR (EXPORTS)
  export: Page
  export: metadata

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