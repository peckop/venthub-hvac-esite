---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\WhatsAppFloat.tsx
skeleton_hash: 4ae1d616306c21ed
entity_hashes:
  func:WhatsAppFloat: 594fe2409e378878
  overview: 27f525e3029fcecb
  style_tokens: fb346cbde40036cb
generated_at: 2026-06-19T20:47:48Z
---

## Genel Bakış
Bu modül, VentHub HVAC platformunda kullanılan, sayfa içerisinde gezinirken sabit konumda kalan yüzen WhatsApp iletişim butonunu oluşturan React UI bileşenidir. Kullanıcıların platformda gezinirken tek tıkla WhatsApp üzerinden yetkili ekiplerle iletişime geçmesini sağlamak amacıyla geliştirilmiştir, tek bir ana bileşenden oluşur.

## Fonksiyon Grupları
### Ana UI Bileşeni
Tüm yüzen WhatsApp butonunun görsel konumlandırılması, tıklama aksiyonları ve platform genelindeki davranışlarını yöneten tek ana React bileşenidir.
- WhatsAppFloat

---

## AXIOMS – Mimari Varsayımlar
Bu React TypeScript ile geliştirilmiş WhatsApp iletişim float butonu bileşeninin doğru çalışması için çalışma zamanı ortamı, tarayıcı uyumluluğu ve UI kaynaklarının eksiksiz sunulması zorunludur.

[Aksiyom 1]: Eğer proje içinde React ve TypeScript çalışma zamanı ortamı sağlanmamışsa, bu bileşen hiçbir şekilde mount edilemez ve kullanıcı arayüzünde görüntülenemez.
[Aksiyom 2]: Eğer bu bileşen üst React ağacında herhangi bir parent bileşen tarafından çağrılmamışsa, proje arayüzünde hiçbir yerde görünmez, iletişim işlevi kullanılamaz.
[Aksiyom 3]: Eğer bileşene ait konumlandırma ve görsel stiller projeye dahil edilmemişse, WhatsApp butonu ekranın sabit köşesinde doğru şekilde görüntülenmez, kullanıcı tarafından erişilemez hale gelir.
[Aksiyom 4]: Eğer son kullanıcının tarayıcısı WhatsApp iletişim linklerini (whatsapp:// veya web.whatsapp.com) desteklemiyorsa ya da erişimini kısıtlıyorsa, butona tıklandığında iletişim akışı başlatılamaz.
[Aksiyom 5]: Eğer son kullanıcının cihazında aktif internet bağlantısı yoksa, WhatsApp web servisine erişilemez, iletişim başlatılamaz.

---

## FONKSİYON DETAYLARI

### WhatsAppFloat
**Ne yapar**: VentHub HVAC projesinde kullanıcıların tek tıkla WhatsApp üzerinden iletişim kurmasını sağlayan bağımsız React bileşenidir. Tüm proje sayfalarında sabit konumda duran yüzen (float) bir buton olarak sunulur, kullanıcıların sitede gezinirken her an erişebileceği kesintisiz bir iletişim kanalı sunar. Sitenin mobil ve masaüstü görünümlerinde uyumlu şekilde çalışarak tüm kullanıcılar için eşit erişilebilirlik sağlar.
**Nasıl yapar**: React fonksiyonel bileşeni olarak tanımlanır, CSS stilleri ile ekranın sabit (fixed) bir konumuna (genellikle sağ alt köşe) yerleştirilir. Tıklama olayı tetiklendiğinde kullanıcının cihazındaki WhatsApp mobil uygulaması ya da masaüstü/web WhatsApp sürümünü açarak, proje için tanımlanmış önceden belirlenmiş resmi iletişim numarasına otomatik yönlendirme yapar. Proje içindeki herhangi bir ana sayfa ya da alt sayfa bileşenine tek import ile kolayca dahil edilerek tüm platformda tutarlı iletişim erişilebilirliği sağlar.
**Parametreler**:
- Bu fonksiyon herhangi bir giriş parametresi almaz, bağımsız olarak çalışmak üzere tasarlanmıştır, tüm yapılandırma, stil ve işlevselliğini kendi bünyesinde barındırır.
**Dönüş**: React.FC tipinde bir React fonksiyonel bileşeni döndürür. Bu döndürülen bileşen, tüm içerik, stil ve tıklama olay yönetimleri tanımlı WhatsApp butonunu ekrana render etmeye olanak tanır, React'in bileşen çalışma mantığıyla tam uyumlu olarak proje içinde kullanılabilir.

---

## İTHALATLAR (IMPORTS)
- import: ../i18n/I18nProvider::useI18n
- import: ../utils/whatsapp::getSupportLink
- import: ../utils/whatsapp::isWhatsAppAvailable
- import: ./HVACIcons::WhatsAppIcon
- import: react::React

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\WhatsAppFloat.tsx::WhatsAppFloat
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `t` — useI18n hook'undan alınan çeviri fonksiyonu; WhatsApp bileşeninin tüm metinlerini (destek mesajı, erişilebilirlik etiketleri, başlık, tooltip) ilgili dilde çekmek için kullanılır
  - `useI18n` — import edilen I18n sağlayıcı hook'u; uygulama çeviri sistemine erişim sağlar
  - `isWhatsAppAvailable` — import edilen utility fonksiyonu; WhatsApp desteğinin aktif olup olmadığını kontrol etmek için çağrılır
  - `getSupportLink` — import edilen utility fonksiyonu; iletilen destek mesajı ile birlikte kullanıcıya yönlendirilecek geçerli WhatsApp sohbet bağlantısını oluşturur
  - `link` — getSupportLink fonksiyonundan dönen WhatsApp sohbet bağlantısı; bileşenin a etiketinin href özniteliğinde kullanılır
  - `WhatsAppIcon` — import edilen ikon bileşeni; WhatsApp logosunu göstermek için JSX içinde kullanılır, size ve className prop'ları iletilir
- **Dönüş**: Koşullara göre null veya ana kapsayıcı a etiketini içeren React JSX elementi

---

## NODE ID STANDARD

  file: src\components\WhatsAppFloat.tsx
  function: src\components\WhatsAppFloat.tsx::WhatsAppFloat

---

## DISA AKTARILANLAR (EXPORTS)
  export: WhatsAppFloat

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `text-sm`
- **Layout:** `absolute`, `hidden`, `left-14`, `lg:block`, `relative`, `whatsapp-float`
- **Varyant/Responsive:** `group-hover:`, `lg:` önekleri
- **Yardımcı Sınıflar:** `duration-300`, `font-bold`, `group`, `group-hover:opacity-100`, `opacity-0`, `pointer-events-none`, `shrink-0`, `transition-opacity`, `whitespace-nowrap`