---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\admin\AdminReturnsPage.tsx
skeleton_hash: e63890bd7a53e9a0
entity_hashes:
  func:AdminReturnsPage: cbbe5a033114e25a
  overview: 31f520fe97f78c88
  style_tokens: 5e9d7754f938f018
generated_at: 2026-06-13T18:56:06Z
---

## Genel Bakış
Bu modül, VentHub HVAC admin panelinde iade yönetimi için kullanılan tek bir React bileşeninden oluşur. Bileşen, kimlik doğrulama ve yetkilendirme kontrollerinin ardından iade kayıtlarını yönetir; filtreleme, sıralama ve durum güncelleme gibi işlemleri destekler. Supabase veritabanına bağımlı olup, denetim günlüğü oluşturma, e-posta bildirimi gönderme ve harici ödeme simülasyonları gibi dış servislerle etkileşime girer.

## Fonksiyon Grupları
### Admin İade Yönetimi Sayfası Bileşeni
Tek bileşen yapısında iade yönetimi ile ilgili tüm arayüz ve iş mantığını barındırır. Kullanıcı erişim kontrolü, iade verilerinin getirilmesi ve manipülasyonu ile arayüz durum yönetimi bu bileşen içinde koordine edilir.
- AdminReturnsPage

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdesi verilmediğinden, mimari varsayımlar çıkarılamamıştır. Aksiyom üretimi için AdminReturnsPage fonksiyonunun/g bileşeninin gövde koduna ihtiyaç vardır.

[Aksiyom 1]: Eğer fonksiyon gövdesi (bileşen implementasyonu) yoksa, mimari varsayımlar üretilemez.

[Aksiyom 2]: Eğer bileşen içinde API çağrıları (örn: iade listesi getirme) varsa ve API endpoint'i tanımlı değilse, veri getirme işlemleri başarısız olur.

[Aksiyom 3]: Eğer bileşen içinde kimlik doğrulama kontrolü (auth guard) varsa ve auth token mevcut değilse, kullanıcı iade yönetim sayfasına erişemez.

[Aksiyom 4]: Eğer bileşen içinde admin rol kontrolü varsa ve kullanıcı admin rolüne sahip değilse, sayfa erişimi engellenir.

> **Not:** Bu aksiyomlar, eski dokümandan (Genel Bakış bölümünden) çıkarılan genel nitelikli varsayımlardır. Kesin ve doğrulanmış mimari varsayımlar için **AdminReturnsPage fonksiyonunun/bileşeninin gövde kodunun** sağlanması gerekmektedir.

---

## FONKSİYON DETAYLARI

### AdminReturnsPage

**Ne yapar**: Admin panelinde iade yönetim sayfasını render eden üst düzey React bileşenidir. Sayfa yapısını oluşturarak başlık alanını ve Suspense ile sarılmış ana içerik bölgesini sunar, böylece iade işlemleri için CRUD (Oluştur, Oku, Güncelle, Sil) işlemlerinin yürütüldüğü bir arayüz sağlar.

**Nasıl yapar**: Fonksiyon, sayfa başlığını doğrudan render eder ve ana içeriği `React.Suspense` bileşeni ile sarmalar. Suspense sarımı, `useSearchParams` hook'unun useAdminTable tarafından tüketilmesi sırasında oluşabilecek asenkron yüklemeleri handle etmek için gereklidir (CLAUDE.md Kural 5 / K2). Veri yönetimi, URL senkronizasyonu ve filtreleme state'i gibi tüm mantıksal sorumluluklar `ReturnsTableBody` bileşenine (useAdminTable hook'u ile) devredilmiştir; bileşenin kendisi sadece yapısal iskeleti sunar. Bu ayrım, sayfa sorumluluğunu ve veri akışını net bir şekilde böler.

**Parametreler**:
Bu bileşen parametre almaz.

**Dönüş**: `React.FC` — Fonksiyonel React bileşeni döndürür; Suspense ile sarılmış bir sayfa yapısı (başlık + ReturnsTableBody) içerir.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/admin/AdminReturnsPage.tsx::AdminReturnsPage
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `t` — useI18n() hook'undan destructuring ile alınan çeviri fonksiyonu; admin başlıkları ve alt başlıkları için t('admin.titles.returns') ve t('admin.returns.subtitle') çağrılarında kullanılır
- **Dönüş**: JSX — admin iade sayfasının tamamını oluşturan React bileşeni; başlık, alt başlık ve Suspense ile sarılmış ReturnsTableBody bileşenini render eder

---

## NODE ID STANDARD

  file: src\views\admin\AdminReturnsPage.tsx
  function: src\views\admin\AdminReturnsPage.tsx::AdminReturnsPage

---

## DISA AKTARILANLAR (EXPORTS)
  export: AdminReturnsPage

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
- **Yardımcı Sınıflar:** `pb-20`, `space-y-6`