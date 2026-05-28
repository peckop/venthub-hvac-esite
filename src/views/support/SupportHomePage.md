---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\support\SupportHomePage.tsx
skeleton_hash: a7680126eb44d722
entity_hashes:
  func:SupportHomePage: 3948e4e66c4520c4
  overview: 61ab53b5d314a5dd
  style_tokens: b5a45cdfc4067170
generated_at: 2026-05-28T22:40:35Z
---

## Genel Bakış
VentHub HVAC projesinin destek bölümünün ana giriş sayfasını oluşturan React tabanlı arayüz bileşenidir. Kullanıcıların destek kaynaklarına, yardım araçlarına ve iletişim kanallarına merkezi bir noktadan erişmesini sağlar. Bu bileşen, destek süreçlerinin ilk temas noktası olarak projenin genel destek deneyimini yönlendirir.

## Fonksiyon Grupları
### Destek Ana Sayfası Bileşeni
Destek bölümünün kullanıcıya sunulan birincil arayüzünü oluşturarak ilgili tüm destek içeriklerini, menüleri ve yönlendirmeleri entegre edip sunar.
- SupportHomePage

---

## AXIOMS – Mimari Varsayımlar
Bu parametresiz React bileşeninin doğru render edilmesi için temel React çalışma zamanı altyapısının mevcut olması gerekmektedir. Fonksiyon gövdesi verilmediği için bileşenin iç bağımlılıkları ve spesifik UI gereksinimleri hakkında kesin çıkarım yapılamamaktadır.

[Aksiyom 1]: Eğer React runtime ortamı (React kütüphanesi ve JSX dönüştürücüsü) yoksa, SupportHomePage bileşeni render edilemez ve uygulama hata verir.

[Aksiyom 2]: Eğer bileşenin import ettiği bağımlılıklar (state hook'ları, alt bileşenler, sayfalar vb.) bulunamazsa, modül çalışma zamanında derleme hatası ile karşılaşır.

[Aksiyom 3]: Eğer bileşen props alıyorsa (fonksiyon imzasında belirtilmemiştir), istenen tiplerde veri sağlanamazsa bileşen hatalı çalışır veya hata fırlatır.

---

## FONKSİYON DETAYLARI

### SupportHomePage
**Ne yapar**: SupportHomePage, HVAC destek sisteminin ana sayfasını gösteren üst düzey bir React fonksiyonel bileşenidir. Kullanıcının destek talepleri, SSY (Sıkça Sorulan Sorular) ve iletişim seçeneklerine erişebileceği ana sayfa arayüzünü render eder.

**Nasıl yapar**: Fonksiyonel bir React bileşeni olarak tanımlanmıştır. Herhangi bir prop almadan doğrudan JSX döndürür. Bileşen, destek sayfasının tüm alt bölümlerini ve navigasyonструктурını compose ederek kullanıcıya sunar.

**Parametreler**:
- Bu fonksiyon herhangi bir parametre almaz

**Dönüş**: `React.FC` — Support sayfasının tüm arayüzünü içeren JSX yapısını döndürür. Boş prop tipi ile tanımlanmış fonksiyonel bir React bileşenidir.

---

## NODE ID STANDARD

  file: src\views\support\SupportHomePage.tsx
  function: src\views\support\SupportHomePage.tsx::SupportHomePage

---

## DISA AKTARILANLAR (EXPORTS)
  export: SupportHomePage

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-primary-navy/10`, `bg-white`, `border-light-gray`, `group-hover:text-primary-navy`, `hover:border-primary-navy/40`, `hover:text-primary-navy`, `text-3xl`, `text-industrial-gray`, `text-lg`, `text-primary-navy`, `text-sm`, `text-steel-gray`, `text-xl`
- **Layout:** `block`, `flex`, `flex-1`, `flex-shrink-0`, `gap-4`, `gap-6`, `grid`, `grid-cols-1`, `hover:shadow-md`, `inline-flex`, `items-center`, `items-start`, `max-w-6xl`, `md:grid-cols-2`, `p-3`
- **Varyant/Responsive:** `group-hover:`, `hover:`, `lg:`, `md:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `border`, `font-bold`, `font-semibold`, `group`, `lg:px-8`, `mb-2`, `mb-4`, `mb-8`, `mr-1`, `mt-1`, `mt-8`, `mx-auto`, `px-4`, `py-10`, `rounded-lg`