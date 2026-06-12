---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\app\admin\categories\page.tsx
skeleton_hash: b2c033b3f572f6dd
entity_hashes:
  func:Page: 3494fba1713b6485
  overview: c697ddf7c92cfa4f
  style_tokens: f00e706f0d7166cc
generated_at: 2026-06-06T21:53:58Z
---

## Genel Bakış
Bu modül, venthub-hvac projesinin admin panelindeki kategori yönetim sayfasının giriş noktasını tanımlayan tek bir React bileşenini içerir. Modülün temel amacı, sayfanın render edilmesi için gerekli üst düzey bileşeni döndürerek Next.js App Router yapısına entegre olmaktır.

## Fonksiyon Grupları
### Sayfa Bileşeni
Bu grup, modülün tek ve ana sorumluluğunu yerine getiren üst düzey bileşeni temsil eder. Sayfa, sadece ilgili alt bileşeni döndürerek sayfanın görüntülenmesini sağlar.
- Page

---

## AXIOMS – Mimari Varsayımlar
Bu modül, Next.js App Router yapısında çalışan bir admin sayfası giriş bileşenidir.

[Aksiyom 1]: Eğer `AdminCategoriesPage` modülü veya bileşeni yoksa, sayfa boş render edilir veya hata oluşur.
[Aksiyom 2]: Eğer Next.js rota sistemi çalışmıyorsa (örn: serverless ortamda), bu modül hiç çağrılmaz.
[Aksiyom 3]: Eğer React çalışma zamanı (`react-dom`) yüklenmemişse, bileşen hiyerarşisi oluşturulamaz.
[Aksiyom 4]: Eğer `next/dynamic` kullanılarak dinamik yükleme yapılmışsa ve network bağlantısı kopuksa, `AdminCategoriesPage` bileşeni yüklenemez ve fallback gösterilir (eğer tanımlıysa) veya hata oluşur.

---

## FONKSİYON DETAYLARI

### Page
**Ne yapar**: Bu basit React fonksiyonu, venthub-hvac projesinin admin kategoriler yönetim sayfasının ana giriş bileşenidir. Sadece önceden tanımlanmış AdminCategoriesPage bileşenini döndürerek sayfanın içeriklerini sunar.
**Nasıl yapar**: Herhangi bir ek işlem, veri çekme veya dönüşüm adımı içermez. Sadece tanımlı AdminCategoriesPage bileşenini doğrudan return ifadesi ile döndürür, bu sayede uygulama bu fonksiyonu sayfa bileşeni olarak yükler.
**Parametreler**:
- Yok: Bu fonksiyon herhangi bir dış parametre almaz
**Dönüş**: <AdminCategoriesPage /> — AdminCategoriesPage bileşenini döndürür, bu bileşen admin panelindeki HVAC kategorilerini yönetmek için gerekli kullanıcı arayüzünü içerir.

---

## SABİTLER
- **AdminCategoriesPage** (call) — `nextDynamic(
  () => import('../../../views/admin/AdminCategoriesPage'),
  ...`

---

## NODE ID STANDARD

  file: src\app\admin\categories\page.tsx
  function: src\app\admin\categories\page.tsx::Page

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