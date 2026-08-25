---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\app\admin\pricing\policies\page.tsx
skeleton_hash: 413e7a9e2156b0bf
entity_hashes:
  func:Page: a9025d8698ba19f7
  overview: bfc35d44691025c3
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-08-25T08:43:05Z
---

## Genel Bakış
Bu modül, admin panelindeki fiyatlandırma bölümünün politikalar sayfasını temsil eden bir Next.js sayfa bileşenidir. Modül, yalnızca `Page` fonksiyonundan oluşur ve fiyatlandırma politikalarının yönetim arayüzünü sunar. Kaynakta içeriğe ilişkin ek bilgi (alt bileşenler, durum yönetimi, veri çekme) yer almamaktadır.

## Fonksiyon Grupları

### Sayfa Bileşeni
Modülün tek bileşeni olarak kullanıcıya fiyatlandırma politikaları yönetim ekranını render eder.
- Page

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Gerekçe:** Modüle ait fonksiyon gövdesi verilmemiştir. Yalnızca `Page()` fonksiyon imzası (parametresiz) ve `metadata` sabiti (object) mevcuttur. Aksiyomlar yalnızca fonksiyon gövdesinden üretilebildiğinden, gövde sağlanmadıkça mimari varsayımda bulunulamaz.

---

## FONKSİYON DETAYLARI

### Page
**Ne yapar**: Bu fonksiyon, fiyatlandırma politikaları sayfasının ana bileşenidir. Sayfa rotası tetiklendiğinde kullanıcıya gösterilecek içeriği belirler. Next.js'in dosya tabanlı yönlendirme sistemi kapsamında, `page.tsx` dosyasında tanımlanan varsayılan dışa aktarım (default export) olarak çalışır ve ilgili rotaya gidildiğinde otomatik olarak çağrılır.

**Nasıl yapar**: Fonksiyon herhangi bir iş mantığı, durum yönetimi veya veri işleme içermez. Gövdesinde yalnızca `PricingPoliciesTableBody` bileşenini çağırarak onu döndürür. Bu sayede sayfa, fiyatlandırma politikalarının listelendiği tablo bileşenini doğrudan render eder. Sayfanın tüm görünüm ve veri yükleme mantığı `PricingPoliciesTableBody` bileşenine devredilmiştir.

**Parametreler**:
- Bu fonksiyon herhangi bir parametre almaz.

**Dönüş**: `JSX.Element` — `PricingPoliciesTableBody` bileşeninin render çıktısını döndürür. Bu çıktı, fiyatlandırma politikalarını gösteren tablo yapısını içerir.

---

## İTHALATLAR (IMPORTS)
- import: ../../../../views/admin/PricingPoliciesTableBody::PricingPoliciesTableBody

---

## SABİTLER
- **metadata** (object) — `{
  title: 'Kur Kilitleri | VentHub HVAC',
  description: 'VentHub HVAC fiy...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/app/admin/pricing/policies/page.tsx::Page
- **params**: yok
- **ic_degiskenler**: yok — fonksiyon gövdesinde hiçbir değişken tanımlanmamış
- **Dönüş**: JSX element — `PricingPoliciesTableBody` bileşenini doğrudan render eder (import edilen `../../../../views/admin/PricingPoliciesTableBody` modülünden gelir)

---

## NODE ID STANDARD

  file: src\app\admin\pricing\policies\page.tsx
  function: src\app\admin\pricing\policies\page.tsx::Page

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