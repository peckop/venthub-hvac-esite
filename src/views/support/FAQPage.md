---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\support\FAQPage.tsx
skeleton_hash: a3fb8bdca859c605
entity_hashes:
  func:FAQPage: 912e82de3e4ccdbe
  overview: 2138e252fedb352a
  style_tokens: 8147bd10a70e8b20
generated_at: 2026-06-08T10:11:02Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesinin destek bölümünde yer alan Sıkça Sorulan Sorular (FAQ) sayfasını oluşturan temel React bileşenidir. Platform kullanıcılarının karşılaşabileceği yaygın sorulara tek bir noktadan erişmesini sağlamak üzere tasarlanmış, kullanıcı deneyimini destekleyen bir arayüz bileşenidir.

## Fonksiyon Grupları
### Ana Sayfa Bileşeni
Destek rotası altında çağrılarak FAQ sayfasının tüm kullanıcı arayüzü yapısını ve içerik sunumunu üstlenen tek ana bileşendir, sayfanın proje içinde çalışmasını sağlar.
- FAQPage

---

## AXIOMS – Mimari Varsayımlar
Bu projenin frontend mimarisinde yer alan FAQ sayfası görünüm bileşeninin sorunsuz çalışması, React tabanlı çalışma ortamı, rota yönetimi altyapısı, tüm bağımlı bileşenler ve içerik kaynağının erişilebilir olmasına bağlıdır.

[Aksiyom 1]: Eğer FAQPage bileşeninin çalıştığı ortamda TSX/JSX sözdizimini destekleyen React kütüphanesi yoksa, bileşen hiçbir şekilde derlenemez, render edilemez ve uygulama çalışma zamanı hatası alır.
[Aksiyom 2]: Eğer uygulamanın istemci tarafı rota yönetim sistemi tarafından FAQPage için tanımlı rota üzerinden yönlendirme yapılamazsa, son kullanıcılar bu FAQ sayfasına hiçbir şekilde erişemez.
[Aksiyom 3]: Eğer FAQPage bileşeninin içe aktardığı tüm bağımlı alt bileşenler (temel sayfa şablonu, arayüz elemanları vb.) proje yapısında erişilebilir durumda değilse, bileşen derleme zamanında başarısız olur.
[Aksiyom 4]: Eğer FAQPage'de gösterilecek sıkça sorulan sorular içeriği, kullanılacak veri kaynağından (statik dosya veya API) getirilemez veya geçerli formatta iletilemezse, sayfada hiçbir içerik görüntülenmez ve kullanıcıya boş arayüz sunulur.
[Aksiyom 5]: Eğer FAQPage için gerekli stil dosyaları projeye dahil edilmemiş ve erişilebilir değilse, sayfa düzensiz, kullanılamaz bir görünüme sahip olur.

---

## FONKSİYON DETAYLARI

### FAQPage
**Ne yapar**: VentHub HVAC projesinin destek kategorisi altındaki Sıkça Sorulan Sorular (FAQ) sayfasını oluşturan React işlevsel bileşenidir. Kullanıcıların platformla ilgili en yaygın karşılaştıkları soruların cevaplarına tek bir merkezden erişmesini, destek ekibine başvurmadan önce kendi sorunlarını çözmelerini kolaylaştırır.
**Nasıl yapar**: Projenin src/views/support dizininde tanımlanan bir sayfa bileşeni olarak, React'in standart işlevsel bileşen mimarisine uygun şekilde çalışır. Uygulamanın yönlendirme sistemi tarafından ilgili rota tetiklendiğinde FAQ içeriklerini barındıran arayüzü ekrana render eder, projenin diğer sayfa bileşenleriyle aynı geliştirme standartlarını paylaşır.
**Parametreler**:
Bu fonksiyon herhangi bir giriş parametresi almamaktadır, tanımında dış girdi olarak kullanılabilecek herhangi bir parametre tanımı bulunmaz.
**Dönüş**: React.FC türünde bir React işlevsel bileşeni döndürür. Bu dönüş değeri, uygulamanın yönlendirme akışında FAQ sayfasının ilgili adres altında kullanıcıya sunulmasını sağlar.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: FAQPage.tsx::FAQPage
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `t` — useI18n hook'undan gelen çeviri fonksiyonu, metin yerelleştirme için kullanılır
  - `faqs` — SSS soru ve cevaplarını içeren dizi, destek sayfasındaki ana bilgi kaynağıdır
  - `router` — useRouter hook'undan gelen yönlendirme nesnesi, sayfa navigasyonu için kullanılır
- **Dönüş**: React JSX bileşeni, SSS sayfasının tüm içeriğini render eder

### [N2_NASIL] AST Pointer: FAQPage.tsx::mapCallback
- **params**: `item` — SSS dizisindeki tek bir soru-cevap nesnesi, `q` ve `a` özellikleri içerir
- **ic_degiskenler**: (yok)
- **Dönüş**: React JSX bileşeni, tek bir SSS kalemini `<details>` elementi olarak render eder

### [N3_NASIL] AST Pointer: FAQPage.tsx::whatsappSupportIIFE
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `whatsappLink` — getSupportLink() fonksiyonu ile oluşturulan WhatsApp iletişim linki, destek mesajı ile birlikte gelir
- **Dönüş**: React JSX bileşeni, WhatsApp iletişim bölümünü render eder veya null döner

---

## NODE ID STANDARD

  file: src\views\support\FAQPage.tsx
  function: src\views\support\FAQPage.tsx::FAQPage

---

## DISA AKTARILANLAR (EXPORTS)
  export: FAQPage

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-white`, `border-light-gray`, `hover:text-primary-navy`, `text-3xl`, `text-center`, `text-industrial-gray`, `text-sm`, `text-steel-gray`, `text-xl`
- **Layout:** `flex`, `inline-flex`, `items-center`, `justify-center`, `max-w-4xl`, `p-4`, `whatsapp-btn`, `whatsapp-container`, `whatsapp-subtext`, `whatsapp-text`
- **Varyant/Responsive:** `hover:`, `lg:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `border`, `cursor-pointer`, `font-bold`, `font-medium`, `font-semibold`, `lg:px-8`, `mb-2`, `mb-4`, `mb-6`, `mr-1`, `mt-10`, `mt-2`, `mx-auto`, `px-4`, `py-10`