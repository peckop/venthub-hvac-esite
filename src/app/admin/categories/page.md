---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\app\admin\categories\page.tsx
skeleton_hash: a52e9b8539fa4dbd
entity_hashes:
  func:Page: 3494fba1713b6485
  overview: 3abd4459140e249f
  style_tokens: f00e706f0d7166cc
generated_at: 2026-05-28T22:34:54Z
---

## Genel Bakış
Bu modül, admin panelindeki kategoriler sayfasının giriş noktasını tanımlayan tek bir React bileşenini içerir. Page fonksiyonu, AdminCategoriesPage bileşenini dinamik olarak yükleyerek sayfanın görüntülenmesini sağlar.

## Fonksiyon Grupları
### Sayfa Bileşeni
Modülün tek sorumluluğu, admin kategorileri sayfasını render eden üst düzey bileşeni döndürmektir.
- Page

---

## AXIOMS – Mimari Varsayımlar
Bu modül Next.js App Router mimarisinde çalışan yönetim paneli kategori yönetim sayfasının ana bileşenidir, çalışması için Next.js rota kurallarının, çağrılan alt bileşenin erişilebilirliğinin ve modern React çalışma zamanının varlığı zorunludur.

[Aksiyom 1]: Eğer Next.js App Router'ın "app dizini altındaki page.tsx dosyalarını tanımlı rotalara eşleme" kuralı yoksa, bu modül /admin/categories adresinde kullanıcılara sunulamaz, istekte 404 bulunamadı hatası alınır.
[Aksiyom 2]: Eğer bu modül tarafından çağrılan AdminCategoriesPage alt bileşeni proje içinde erişilebilir konumda mevcut değilse, sayfa yüklenemez hatası oluşur, kategori yönetim arayüzü hiç görüntülenemez.
[Aksiyom 3]: Eğer modern fonksiyonel React bileşen sözdizimini destekleyen bir çalışma zamanı ortamı yoksa, bu modül hiç render edilemez, sayfa kullanıcılara sunulamaz.
[Aksiyom 4]: Eğer bu modüle erişimden önce yönetici yetkisi kontrolü yapan bir ara katman (middleware, route guard vb.) devreye alınmamışsa, yetkisi olmayan kullanıcılar kategori yönetim arayüzüne erişebilir, güvenlik ihlali oluşur.

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
- **AdminCategoriesPage** (call) — `dynamic(
  () => import('../../../views/admin/AdminCategoriesPage'),
  { ss...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src\app\admin\categories\page.tsx::Page
- **params**: (parametre yok)
- **ic_degiskenler**:
- **Dönüş**: AdminCategoriesPage bileşenini döndürür

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