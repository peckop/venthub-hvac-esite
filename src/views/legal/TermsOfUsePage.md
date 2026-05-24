---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\legal\TermsOfUsePage.tsx
skeleton_hash: 4ce5312f302597e2
generated_at: 2026-05-23T22:41:17Z
---

## Genel Bakış
Bu modül, VentHub HVAC platformunun yasal içerikler bölümünde yer alan Kullanım Koşulları sayfasını oluşturan React bileşenidir. Platformu kullanan ziyaretçilere sunulacak yasal şart ve koşulları görüntüleyen arayüzü oluşturur, projenin istemci tarafı görünüm katmanında yer alır.

## Fonksiyon Grupları
### Ana Sayfa Bileşeni
Modülün tek ve ana sorumluluğunu üstlenen bu fonksiyon, Kullanım Koşulları sayfasının tüm yapısını render ederek kullanıcılara sunar.
- TermsOfUsePage

---

## AXIOMS – Mimari Varsayımlar
Bu React fonksiyonel bileşeni, VentHub HVAC uygulamasının yasal içerikler bölümündeki Kullanım Koşulları sayfasını kullanıcıya sunmak üzere tasarlanmıştır, çalışması için uygulamanın frontend React çalışma zamanı ve yönlendirme altyapısının erişilebilir olması zorunludur.

[Aksiyom 1]: Eğer projeye React 16.8 ve üzeri bir sürüm entegre edilmemişse, fonksiyonel bileşen olarak TermsOfUsePage çalışmaz ve sayfa hiç render edilemez.
[Aksiyom 2]: Eğer uygulamanın frontend yönlendirme (routing) mekanizması bu bileşeni ilgili /legal rotası altında kaydetmemişse, kullanıcılar Kullanım Koşulları sayfasına erişemez.
[Aksiyom 3]: Eğer TermsOfUsePage’in import ettiği uygulamanın ortak temel bileşenleri (Header, Footer, içerik sarmalayıcıları vb.) derleme sırasında çözülemezse, sayfa eksik içerikle veya hiç render edilemez.
[Aksiyom 4]: Eğer bu modül uygulamanın ana geliştirme veya üretim derleme (build) sürecine dahil edilmemişse, kullanıcı sayfaya erişmeye çalıştığında 404 hatası oluşur.

---

## FONKSIYON DETAYLARI

### TermsOfUsePage
**Ne yapar**: VentHub HVAC platformunun yasal içeriklerinden biri olan Kullanım Koşulları sayfasını oluşturan React sayfa bileşenidir. Projenin src/views/legal dizininde tanımlı bu bileşen, platformu kullanan tüm kullanıcılara platformun kullanım şartlarını, hak ve yükümlülükleri tek bir merkezi sayfa üzerinden sunma görevini üstlenir. Platformun diğer yasal sayfalarıyla aynı yapıda çalışarak kullanıcı deneyiminde tutarlılık sağlar.
**Nasıl yapar**: React ekosisteminin standart sayfa bileşeni standartlarına tam uyumlu olarak çalışır, herhangi bir karmaşık iş mantığı veya dış veri entegrasyonu barındırmadan kendi dosyası içerisindeki statik yasal metinleri kullanıcıya sunar. Platformun yönlendirme sistemi tarafından ilgili rotada çağrıldığında otomatik olarak içeriği ekrana yansıtır, ek geliştirme yapısına uygun olarak genişletilebilir şekilde tasarlanmıştır.
**Parametreler**:
- Bu fonksiyon herhangi bir giriş parametresi almamaktadır, tüm ihtiyaç duyduğu içeriği kendi tanımlandığı TermsOfUsePage.tsx dosyası içerisindeki statik kaynaklardan karşılar.
**Dönüş**: React.FC türünde bir değer döndürür, bu tür React uygulamalarında kullanılabilecek standart, uyumlu sayfa bileşenini ifade eder. Dönen bu bileşen, platformun tüm React tabanlı yapısıyla sorunsuz entegre olarak çalışır, yönlendirme sistemi tarafından çağrıldığında Kullanım Koşulları içeriğini eksiksiz olarak ekrana çizer.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\legal\TermsOfUsePage.tsx::TermsOfUsePage
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `legalConfig.websiteUrl` — Hukuki metinde gösterilen web sitesi adresi, taraflar ve kabul bölümünde kullanılır
  - `legalConfig.sellerTitle` — Satıcı firma unvanı, fikri mülkiyet ve sorumluluk reddi bölümlerinde kullanılır
  - `legalConfig.lastUpdated` — Kullanım koşullarının son güncelleme tarihi, değişiklikler bölümünde gösterilir
- **Dönüş**: React JSX elementi, Kullanım Koşulları sayfa arayüzünü döndüren React.FC bileşeni çıktısı

---

## NODE ID STANDARD

  file: src\views\legal\TermsOfUsePage.tsx
  function: src\views\legal\TermsOfUsePage.tsx::TermsOfUsePage

---

## DISA AKTARILANLAR (EXPORTS)
  export: TermsOfUsePage