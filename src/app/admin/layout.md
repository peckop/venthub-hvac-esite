---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\app\admin\layout.tsx
skeleton_hash: 69edc232c5d80fa7
entity_hashes:
  func:Layout: 835aeffc7f64a977
  overview: e7251b7df76c3216
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-06-08T10:08:11Z
---

## Genel Bakış
Bu modül, yönetim paneli (admin) bölümleri için üst düzey düzen bileşenini tanımlar. Tüm admin sayfalarının ortak bir çerçeve ve arayüz yapısı içinde görüntülenmesini sağlayarak tutarlılık oluşturur.

## Fonksiyon Grupları
### Düzen Bileşeni
Yönetim paneli sayfalarını sarmalayan ana layout bileşenini içerir. Sayfalar arasında paylaşılan arayüz yapısını (sidebar, header vb.) tanımlayarak alt içeriklerin doğru konumda görüntülenmesini sağlar.
- Layout

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

[NOT: Bu modül bir React layout bileşeni olup, fonksiyon gövdesinde (sadece `return` ifadesi) herhangi bir mantıksal koşul veya varsayım içermemektedir. Bileşen, sadece `children` prop'unu alıp JSX yapısı içinde yerleştiren saf bir sunum bileşenidir. Dolayısıyla, fonksiyon gövdesinden türetilebilecek mimari varsayım bulunmamaktadır.]

---

## FONKSİYON DETAYLARI

### Layout

**Ne yapar**: Admin panelinin üst seviye layout bileşenidir. Tenant (kiracı) yapılandırmasını sunucu tarafında asenkron olarak yükler ve tüm admin sayfalarını bu yapılandırma ile sararak çocuk bileşenleri render eder.

**Nasıl yapar**: Fonksiyon asenkron çalışır ve önce `getTenantConfig()` çağrısı ile geçerli tenant yapılandırmasını sunucu tarafında alır. Ardından bu yapılandırma değerini `TenantProvider` bileşenine prop olarak geçer ve `LayoutComponent` içinde孩子.children bileşenlerini sarmalayarak render eder. Bu sayede tüm alt sayfalar tenant bilgisine erişebilir.

**Parametreler**:
- children: React.ReactNode — Admin panelinde render edilecek sayfa içeriği ve alt bileşenler. Bu parametre, layout içinde görüntülenecek tüm çocuk React elemanlarını temsil eder.

**Dönüş**: JSX.Element — TenantProvider ile sarılmış LayoutComponent içinde child'ları barındıran React bileşeni döndürür. Tenant yapılandırması tüm alt bileşenlere context aracılığıyla dağıtılır.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: `src/app/admin/layout.tsx`::Layout
- **params**:
  - `children` — React.ReactNode tipinde, layout bileşeninin içinde render edilecek alt bileşenler
- **ic_degiskenler**:
  - `tenantConfig` — `await getTenantConfig()` asenkron çağrısıyla elde edilen kiralayan (tenant) yapılandırma nesnesi; TenantProvider'a value olarak iletilir
- **Dönüş**: JSX (React element) — `TenantProvider` ile sarılmış, `LayoutComponent` içinde `children`'ı barındıran layout yapısı döner; ayrıca `TenantProvider` yan etkisiyle `tenantConfig` context'e enjekte edilir

---

## NODE ID STANDARD

  file: src\app\admin\layout.tsx
  function: src\app\admin\layout.tsx::Layout

---

## DISA AKTARILANLAR (EXPORTS)
  export: Layout

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